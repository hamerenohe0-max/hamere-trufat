import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MediaService {
  constructor(
    private readonly supabase: SupabaseService,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: any, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'hamere-trufat',
        },
        async (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error('Upload failed: No result returned from Cloudinary'));
            return;
          }

          const { data, error: dbError } = await this.supabase.client
            .from('media')
            .insert({
              filename: file.originalname,
              url: result.secure_url,
              cloudinary_id: result.public_id,
              type: this.getFileType(result.resource_type),
              size: result.bytes,
              mime_type: file.mimetype,
              uploaded_by: userId,
              usage_count: 0,
            })
            .select()
            .single();

          if (dbError) {
            reject(new Error(dbError.message));
            return;
          }

          resolve(data);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(id: string, userId: string): Promise<void> {
    const { data: media, error } = await this.supabase.client
      .from('media')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !media) {
      throw new Error('Media not found');
    }

    if (media.uploaded_by !== userId) {
      throw new Error('You can only delete your own media');
    }

    await cloudinary.uploader.destroy(media.cloudinary_id);
    await this.supabase.client.from('media').delete().eq('id', id);
  }

  async findAll(userId?: string, limit = 50, offset = 0) {
    let query = this.supabase.client
      .from('media')
      .select('*', { count: 'exact' });

    if (userId) query = query.eq('uploaded_by', userId);

    const { data, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return { items: data || [], total: count || 0, limit, offset };
  }

  private getFileType(resourceType: string): 'image' | 'video' | 'document' | 'audio' {
    switch (resourceType) {
      case 'image':
        return 'image';
      case 'video':
        return 'video';
      case 'raw':
        return 'document';
      default:
        return 'document';
    }
  }
}

