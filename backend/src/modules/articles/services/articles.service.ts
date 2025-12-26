import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import { CreateArticleDto } from '../dto/create-article.dto';
import slugify from 'slugify';

@Injectable()
export class ArticlesService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createArticleDto: CreateArticleDto, authorId: string): Promise<any> {
    const slug = slugify(createArticleDto.title, { lower: true, strict: true });
    
    // Use images array if provided, otherwise fall back to coverImage for backward compatibility
    const images = createArticleDto.images || (createArticleDto.coverImage ? [createArticleDto.coverImage] : []);
    
    const { data, error } = await this.supabase.client
      .from('articles')
      .insert({
        title: createArticleDto.title,
        slug,
        content: createArticleDto.content,
        excerpt: createArticleDto.excerpt,
        images: images,
        cover_image: createArticleDto.coverImage || (images.length > 0 ? images[0] : null), // Keep for backward compatibility
        author_id: authorId,
        published_at: new Date().toISOString(),
        related_event_ids: createArticleDto.relatedEventIds || [],
        related_feast_ids: createArticleDto.relatedFeastIds || [],
        keywords: createArticleDto.keywords || [],
        audio_url: createArticleDto.audioUrl,
        reading_time: createArticleDto.readingTime,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating article:', error);
      throw new InternalServerErrorException(`Failed to create article: ${error.message}`);
    }
    return data;
  }

  async findAll(filters?: { authorId?: string; limit?: number; offset?: number }) {
    let query = this.supabase.client
      .from('articles')
      .select('*, author:users(id, name, profile, role)', { count: 'exact' });

    if (filters?.authorId) query = query.eq('author_id', filters.authorId);

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    query = query.order('published_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count } = await query;

    return { items: (data || []) as any[], total: count || 0, limit, offset };
  }

  async findOne(id: string, userId?: string): Promise<any> {
    const { data: article, error } = await this.supabase.client
      .from('articles')
      .select('*, author:users(id, name, profile, role)')
      .eq('id', id)
      .single();

    if (error || !article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    // Get user reaction if userId provided
    let userReaction: 'like' | 'dislike' | null = null;
    if (userId) {
      const { data: reaction } = await (this.supabase.client
        .from('article_reactions' as any)
        .select('reaction')
        .eq('article_id', id)
        .eq('user_id', userId)
        .single() as any);
      if (reaction) userReaction = reaction.reaction;
    }

    // Get bookmark status if userId provided
    let bookmarked = false;
    if (userId) {
      const { data: bookmark } = await this.supabase.client
        .from('article_bookmarks')
        .select('id')
        .eq('article_id', id)
        .eq('user_id', userId)
        .single() as any;
      bookmarked = !!bookmark;
    }

    // Increment views
    this.supabase.client
      .from('articles')
      .update({ views: ((article as any).views || 0) + 1 } as any)
      .eq('id', id);

    return {
      ...article,
      reactions: {
        likes: (article as any).likes || 0,
        dislikes: (article as any).dislikes || 0,
        userReaction,
      },
      bookmarked,
    };
  }

  async findBySlug(slug: string): Promise<any> {
    const { data: article, error } = await this.supabase.client
      .from('articles')
      .select('*, author:users(id, name, profile, role)')
      .eq('slug', slug)
      .single();

    if (error || !article) {
      throw new NotFoundException(`Article with slug ${slug} not found`);
    }

    // Increment views
    this.supabase.client
      .from('articles')
      .update({ views: ((article as any).views || 0) + 1 } as any)
      .eq('id', (article as any).id);

    return article;
  }

  async update(id: string, updateDto: Partial<CreateArticleDto>, userId: string, userRole?: string): Promise<any> {
    const article = await this.findOne(id);
    // Admins can update any article, publishers can only update their own
    // If userRole is undefined, default to publisher behavior for safety
    if (userRole !== 'admin' && article.author_id !== userId) {
      throw new ForbiddenException('You can only update your own articles');
    }

    const updates: any = { ...updateDto };
    
    if (updateDto.title && updateDto.title !== article.title) {
      updates.slug = slugify(updateDto.title, { lower: true, strict: true });
    }

    // Handle images array
    // NOTE: If you get "Could not find the 'images' column" error,
    // run the migration: backend/apply-migrations.sql in Supabase SQL Editor
    if (updateDto.images !== undefined) {
      // Only update images if the column exists (migration has been run)
      // If migration hasn't been run, this will fail - see APPLY_ARTICLES_IMAGES_MIGRATION.md
      updates.images = updateDto.images;
      // Also update cover_image to first image for backward compatibility
      updates.cover_image = updateDto.images.length > 0 ? updateDto.images[0] : null;
    } else if (updateDto.coverImage !== undefined) {
      // If only coverImage is provided, update cover_image
      // Don't set images array here to avoid migration requirement
      updates.cover_image = updateDto.coverImage;
    }
    
    // Map camelCase to snake_case
    if (updateDto.relatedEventIds) updates.related_event_ids = updateDto.relatedEventIds;
    if (updateDto.relatedFeastIds) updates.related_feast_ids = updateDto.relatedFeastIds;
    if (updateDto.audioUrl) updates.audio_url = updateDto.audioUrl;
    if (updateDto.readingTime) updates.reading_time = updateDto.readingTime;
    
    delete updates.coverImage;
    delete updates.relatedEventIds;
    delete updates.relatedFeastIds;
    delete updates.audioUrl;
    delete updates.readingTime;

    const { data, error } = await this.supabase.client
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating article:', error);
      throw new InternalServerErrorException(`Failed to update article: ${error.message}`);
    }
    return data;
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    const article = await this.findOne(id);
    if (article.author_id !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own articles');
    }
    await this.supabase.client.from('articles').delete().eq('id', id);
  }

  async toggleReaction(articleId: string, userId: string, reaction: 'like' | 'dislike'): Promise<any> {
    const article = await this.findOne(articleId);
    
    const { data: existing } = await (this.supabase.client
      .from('article_reactions' as any)
      .select('*')
      .eq('article_id', articleId)
      .eq('user_id', userId)
      .single() as any);

    let likes = (article as any).likes || 0;
    let dislikes = (article as any).dislikes || 0;

    if (existing) {
      if (existing.reaction === reaction) {
        // Remove reaction
        await (this.supabase.client.from('article_reactions' as any).delete().eq('id', existing.id) as any);
        if (reaction === 'like') likes = Math.max(0, likes - 1);
        else dislikes = Math.max(0, dislikes - 1);
      } else {
        // Change reaction
        await (this.supabase.client.from('article_reactions' as any).update({ reaction } as any).eq('id', existing.id) as any);
        if (reaction === 'like') {
          likes += 1;
          dislikes = Math.max(0, dislikes - 1);
        } else {
          dislikes += 1;
          likes = Math.max(0, likes - 1);
        }
      }
    } else {
      // Add new reaction
      await (this.supabase.client.from('article_reactions' as any).insert({
        article_id: articleId,
        user_id: userId,
        reaction,
      } as any) as any);
      if (reaction === 'like') likes += 1;
      else dislikes += 1;
    }

    const { data: updated } = await this.supabase.client
      .from('articles')
      .update({ likes, dislikes } as any)
      .eq('id', articleId)
      .select()
      .single();

    return { ...updated, likes, dislikes, userReaction: reaction };
  }

  async toggleBookmark(articleId: string, userId: string): Promise<{ bookmarked: boolean }> {
    await this.findOne(articleId);
    
    const { data: existing } = await this.supabase.client
      .from('article_bookmarks')
      .select('*')
      .eq('article_id', articleId)
      .eq('user_id', userId)
      .single() as any;

    if (existing) {
      await this.supabase.client.from('article_bookmarks').delete().eq('id', existing.id);
      return { bookmarked: false };
    } else {
      await this.supabase.client.from('article_bookmarks').insert({ article_id: articleId, user_id: userId } as any);
      return { bookmarked: true };
    }
  }

  async getBookmarks(userId: string, limit = 20, offset = 0) {
    const { data: bookmarks, count } = await this.supabase.client
      .from('article_bookmarks')
      .select('article_id', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1) as any;

    if (!bookmarks || bookmarks.length === 0) {
      return { items: [], total: 0, limit, offset };
    }

    const articleIds = bookmarks.map((b: any) => b.article_id);
    const { data: articles } = await this.supabase.client
      .from('articles')
      .select('*')
      .in('id', articleIds);

    return { items: (articles || []) as any[], total: count || 0, limit, offset };
  }

  async findByAuthor(authorId: string, limit = 20, offset = 0) {
    const { data, count } = await this.supabase.client
      .from('articles')
      .select('*, author:users!articles_author_id_fkey(id, name, profile, role)', { count: 'exact' })
      .eq('author_id', authorId)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    return { items: (data || []) as any[], total: count || 0, limit, offset };
  }
}
