import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import { CreateArticleDto } from '../dto/create-article.dto';
import slugify from 'slugify';

@Injectable()
export class ArticlesService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createArticleDto: CreateArticleDto, authorId: string): Promise<any> {
    const slug = slugify(createArticleDto.title, { lower: true, strict: true });
    
    const { data, error } = await this.supabase.client
      .from('articles')
      .insert({
        title: createArticleDto.title,
        slug,
        content: createArticleDto.content,
        excerpt: createArticleDto.excerpt,
        cover_image: createArticleDto.coverImage,
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

    if (error) throw new Error(error.message);
    return data;
  }

  async findAll(filters?: { authorId?: string; limit?: number; offset?: number }) {
    let query = this.supabase.client
      .from('articles')
      .select('*', { count: 'exact' });

    if (filters?.authorId) query = query.eq('author_id', filters.authorId);

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    query = query.order('published_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count } = await query;

    return { items: (data || []) as any[], total: count || 0, limit, offset };
  }

  async findOne(id: string): Promise<any> {
    const { data: article, error } = await this.supabase.client
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    // Increment views
    this.supabase.client
      .from('articles')
      .update({ views: ((article as any).views || 0) + 1 } as any)
      .eq('id', id);

    return article;
  }

  async findBySlug(slug: string): Promise<any> {
    const { data: article, error } = await this.supabase.client
      .from('articles')
      .select('*')
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

  async update(id: string, updateDto: Partial<CreateArticleDto>, userId: string): Promise<any> {
    const article = await this.findOne(id);
    if (article.author_id !== userId) {
      throw new ForbiddenException('You can only update your own articles');
    }

    const updates: any = { ...updateDto };
    
    if (updateDto.title && updateDto.title !== article.title) {
      updates.slug = slugify(updateDto.title, { lower: true, strict: true });
    }

    // Map camelCase to snake_case
    if (updateDto.coverImage) updates.cover_image = updateDto.coverImage;
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

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    const article = await this.findOne(id);
    if (article.author_id !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own articles');
    }
    await this.supabase.client.from('articles').delete().eq('id', id);
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
      .select('*', { count: 'exact' })
      .eq('author_id', authorId)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    return { items: (data || []) as any[], total: count || 0, limit, offset };
  }
}
