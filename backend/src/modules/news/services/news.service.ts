import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../../database/supabase.service';
import { Database } from '../../../database/types';
import { CreateNewsDto } from '../dto/create-news.dto';
import { UpdateNewsDto } from '../dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(private readonly supabase: SupabaseService) { }

  async create(createNewsDto: CreateNewsDto, authorId: string): Promise<any> {
    // Use images array if provided, otherwise fall back to coverImage for backward compatibility
    const images = createNewsDto.images || (createNewsDto.coverImage ? [createNewsDto.coverImage] : []);

    const { data, error } = await this.supabase.client
      .from('news')
      .insert({
        title: createNewsDto.title,
        summary: createNewsDto.summary,
        body: createNewsDto.body,
        tags: createNewsDto.tags,
        images: images,
        cover_image: createNewsDto.coverImage || (images.length > 0 ? images[0] : null),
        status: createNewsDto.status,
        scheduled_at: createNewsDto.scheduledAt,
        author_id: authorId,
        published_at: createNewsDto.status === 'published' ? new Date().toISOString() : null,
      } as any)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findAll(filters?: { status?: string; authorId?: string; limit?: number; offset?: number }) {
    let query = this.supabase.client
      .from('news')
      .select('*', { count: 'exact' });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.authorId) query = query.eq('author_id', filters.authorId);

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count } = await query;

    return { items: (data || []) as Database['public']['Tables']['news']['Row'][], total: count || 0, limit, offset };
  }

  async findOne(id: string, userId?: string): Promise<any> {
    const { data: news, error } = await this.supabase.client
      .from('news')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    // Get user's reaction if userId is provided
    let userReaction: string | null = null;
    if (userId) {
      const { data: reaction } = await this.supabase.client
        .from('news_reactions')
        .select('reaction')
        .eq('news_id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (reaction) {
        userReaction = reaction.reaction;
      }
    }

    // Increment views directly (fire and forget)
    this.supabase.client
      .from('news')
      .update({ views: (news.views || 0) + 1 })
      .eq('id', id);

    return {
      ...news,
      userReaction,
    };
  }

  async update(id: string, updateNewsDto: UpdateNewsDto, userId: string, userRole?: string): Promise<any> {
    const news = await this.findOne(id);
    // Admins can update any news, publishers can only update their own
    if (userRole !== 'admin' && news.author_id !== userId) {
      throw new ForbiddenException('You can only update your own news');
    }

    const updates: any = {};

    // Copy all fields except special ones
    if (updateNewsDto.title !== undefined) updates.title = updateNewsDto.title;
    if (updateNewsDto.summary !== undefined) updates.summary = updateNewsDto.summary;
    if (updateNewsDto.body !== undefined) updates.body = updateNewsDto.body;
    if (updateNewsDto.tags !== undefined) updates.tags = updateNewsDto.tags;
    if (updateNewsDto.status !== undefined) updates.status = updateNewsDto.status;
    if (updateNewsDto.scheduledAt !== undefined) updates.scheduled_at = updateNewsDto.scheduledAt;

    if (updateNewsDto.status === 'published' && news.status !== 'published') {
      updates.published_at = new Date().toISOString();
    }

    // Handle images array - use images if provided, otherwise fall back to coverImage
    if (updateNewsDto.images !== undefined) {
      updates.images = updateNewsDto.images;
      // Also update cover_image to first image for backward compatibility
      updates.cover_image = updateNewsDto.images.length > 0 ? updateNewsDto.images[0] : null;
    } else if (updateNewsDto.coverImage !== undefined) {
      // If only coverImage is provided, convert to images array
      updates.images = updateNewsDto.coverImage ? [updateNewsDto.coverImage] : [];
      updates.cover_image = updateNewsDto.coverImage;
    }

    const { data, error } = await this.supabase.client
      .from('news')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    const news = await this.findOne(id);
    if (news.author_id !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own news');
    }

    await this.supabase.client.from('news').delete().eq('id', id);
  }

  async publish(id: string, userId: string): Promise<any> {
    const news = await this.findOne(id);
    if (news.author_id !== userId) {
      throw new ForbiddenException('You can only publish your own news');
    }

    const { data } = await this.supabase.client
      .from('news')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    return data;
  }


  async toggleReaction(newsId: string, userId: string, reaction: 'like' | 'dislike'): Promise<{ likes: number; dislikes: number; userReaction: 'like' | 'dislike' | null }> {
    await this.findOne(newsId);

    // 1. Get existing reaction
    const { data: existing } = await this.supabase.client
      .from('news_reactions')
      .select('*')
      .eq('news_id', newsId)
      .eq('user_id', userId)
      .maybeSingle();

    let userReaction: 'like' | 'dislike' | null = null;

    // 2. Insert, Update or Delete reaction
    if (existing) {
      if (existing.reaction === reaction) {
        // Remove reaction if same
        await this.supabase.client.from('news_reactions').delete().eq('id', existing.id);
        userReaction = null;
      } else {
        // Switch reaction if different
        await this.supabase.client.from('news_reactions').update({ reaction }).eq('id', existing.id);
        userReaction = reaction;
      }
    } else {
      // Add new reaction
      await this.supabase.client.from('news_reactions').insert({
        news_id: newsId,
        user_id: userId,
        reaction,
      });
      userReaction = reaction;
    }

    // 3. Get accurate counts from the reactions table using filtered select
    const { data: reactionCounts, error: countError } = await this.supabase.client
      .from('news_reactions')
      .select('reaction')
      .eq('news_id', newsId);

    if (countError) {
      console.error('Error fetching reaction counts:', countError);
    }

    const likes = reactionCounts?.filter(r => r.reaction === 'like').length || 0;
    const dislikes = reactionCounts?.filter(r => r.reaction === 'dislike').length || 0;

    // 4. Sync the counts back to the news table for denormalized access
    await this.supabase.client
      .from('news')
      .update({ likes, dislikes })
      .eq('id', newsId);

    // 5. Return structured result for optimistic UI updates
    return {
      likes,
      dislikes,
      userReaction
    };
  }


  async toggleBookmark(newsId: string, userId: string): Promise<{ bookmarked: boolean }> {
    await this.findOne(newsId);

    const { data: existing } = await this.supabase.client
      .from('news_bookmarks')
      .select('*')
      .eq('news_id', newsId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await this.supabase.client.from('news_bookmarks').delete().eq('id', existing.id);
      return { bookmarked: false };
    } else {
      await this.supabase.client.from('news_bookmarks').insert({ news_id: newsId, user_id: userId });
      return { bookmarked: true };
    }
  }

  async getBookmarks(userId: string, limit = 20, offset = 0) {
    // Join bookmarks with news
    const { data: bookmarks, count } = await this.supabase.client
      .from('news_bookmarks')
      .select('news_id', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!bookmarks || bookmarks.length === 0) {
      return { items: [], total: 0, limit, offset };
    }

    const newsIds = bookmarks.map((b: { news_id: string }) => b.news_id);
    const { data: newsItems } = await this.supabase.client
      .from('news')
      .select('*')
      .in('id', newsIds);

    return { items: (newsItems || []) as Database['public']['Tables']['news']['Row'][], total: count || 0, limit, offset };
  }
}
