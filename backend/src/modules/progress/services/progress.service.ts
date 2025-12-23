import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';

@Injectable()
export class ProgressService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createProgressDto: any, userId: string): Promise<any> {
    const { data, error } = await this.supabase.client
      .from('progress_reports')
      .insert({
        title: createProgressDto.title,
        summary: createProgressDto.summary,
        pdf_url: createProgressDto.pdfUrl,
        before_image: createProgressDto.beforeImage,
        after_image: createProgressDto.afterImage,
        media_gallery: createProgressDto.mediaGallery || [],
        timeline: createProgressDto.timeline || [],
        likes: 0,
        comments_count: 0,
        liked_by: [],
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findAll(filters?: { limit?: number; offset?: number }) {
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    const { data, count } = await this.supabase.client
      .from('progress_reports')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return { items: data || [], total: count || 0, limit, offset };
  }

  async findOne(id: string): Promise<any> {
    const { data: progress, error } = await this.supabase.client
      .from('progress_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !progress) {
      throw new NotFoundException(`Progress report with ID ${id} not found`);
    }
    return progress;
  }

  async update(id: string, updateDto: any, userId: string, userRole: string): Promise<any> {
    await this.findOne(id);
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can update progress reports');
    }

    const updates: any = { ...updateDto };
    // Map camelCase to snake_case
    if (updateDto.pdfUrl) updates.pdf_url = updateDto.pdfUrl;
    if (updateDto.beforeImage) updates.before_image = updateDto.beforeImage;
    if (updateDto.afterImage) updates.after_image = updateDto.afterImage;
    if (updateDto.mediaGallery) updates.media_gallery = updateDto.mediaGallery;
    
    delete updates.pdfUrl;
    delete updates.beforeImage;
    delete updates.afterImage;
    delete updates.mediaGallery;

    const { data, error } = await this.supabase.client
      .from('progress_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    await this.findOne(id);
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can delete progress reports');
    }
    await this.supabase.client.from('progress_reports').delete().eq('id', id);
  }

  async toggleLike(id: string, userId: string): Promise<any> {
    const progress = await this.findOne(id);
    const likedBy = progress.liked_by || [];
    const index = likedBy.indexOf(userId);
    
    let likes = progress.likes;

    if (index > -1) {
      likedBy.splice(index, 1);
      likes = Math.max(0, likes - 1);
    } else {
      likedBy.push(userId);
      likes += 1;
    }

    const { data } = await this.supabase.client
      .from('progress_reports')
      .update({ liked_by: likedBy, likes })
      .eq('id', id)
      .select()
      .single();
      
    return data;
  }
}

