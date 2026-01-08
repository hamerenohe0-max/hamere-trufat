import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { getCloudinaryConfig, initializeCloudinary } from '../../../config/cloudinary.config';

@Injectable()
export class MediaService {
  private cloudinaryConfig: { cloudName: string; apiKey: string; apiSecret: string };

  constructor(
    private readonly supabase: SupabaseService,
    private configService: ConfigService,
  ) {
    // Initialize Cloudinary configuration (supports both CLOUDINARY_URL and individual vars)
    this.cloudinaryConfig = getCloudinaryConfig(this.configService);
    initializeCloudinary(this.cloudinaryConfig);
  }

  async uploadFile(file: any, userId: string): Promise<any> {
    console.log('MediaService: Starting upload to Cloudinary', {
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    });

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'hamere-trufat',
        },
        async (error, result) => {
          if (error) {
            console.error('MediaService: Cloudinary upload error:', error);
            reject(error);
            return;
          }

          if (!result) {
            console.error('MediaService: No result from Cloudinary');
            reject(new Error('Upload failed: No result returned from Cloudinary'));
            return;
          }

          console.log('MediaService: Cloudinary upload successful', {
            secure_url: result.secure_url,
            public_id: result.public_id,
          });

          const { data, error: dbError } = await this.supabase.client
            .from('media')
            .insert({
              filename: file.originalname,
              url: result.secure_url, // This is the image link/URL
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
            console.error('MediaService: Database error:', dbError);
            reject(new Error(dbError.message));
            return;
          }

          console.log('MediaService: Image URL saved to database:', data.url);
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

  /**
   * Generate Cloudinary upload signature for direct client-side uploads
   * This allows the frontend to upload directly to Cloudinary without exposing API secrets
   * Uses Cloudinary's official api_sign_request utility for signature generation
   */
  async generateUploadSignature(params: {
    folder?: string;
    publicId?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto' | 'audio';
    timestamp?: number;
  }): Promise<{
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
  }> {
    const timestamp = params.timestamp || Math.round(new Date().getTime() / 1000);
    const folder = params.folder || 'hamere-trufat';
    const resourceType = params.resourceType || 'image';

    // Build parameters for signature (must match what will be sent in FormData)
    const signatureParams: Record<string, any> = {
      timestamp,
    };

    // Add folder if provided
    if (folder) {
      signatureParams.folder = folder;
    }

    // Add resource_type
    if (resourceType && resourceType !== 'auto') {
      // Cloudinary treats audio as 'video' resource type usually, but we accept 'audio' in param and map it if needed
      // or just pass it through if Cloudinary supports it directly in newer APIs.
      // For safely, if type is 'audio', we might want to use 'video' for Cloudinary signing if that's what it expects.
      // But 'auto' is safest. 
      // If the user passes 'audio', we'll treat it as 'video' for the signature if strict,
      // but let's just pass it for now or change the interface to be clearer.
      signatureParams.resource_type = resourceType === 'audio' ? 'video' : resourceType;
    }

    // Add public_id if provided
    if (params.publicId) {
      signatureParams.public_id = params.publicId;
    }

    // Use the validated configuration from constructor
    const { cloudName, apiKey, apiSecret } = this.cloudinaryConfig;

    // Use Cloudinary's official api_sign_request utility
    let signature: string;
    try {
      // Check if the utility exists
      if (typeof cloudinary.utils?.api_sign_request === 'function') {
        signature = cloudinary.utils.api_sign_request(signatureParams, apiSecret);
      } else {
        // Fallback to manual signature generation
        console.warn('cloudinary.utils.api_sign_request not available, using manual signature generation');
        const signatureString = Object.keys(signatureParams)
          .sort()
          .map((key) => `${key}=${signatureParams[key]}`)
          .join('&');
        signature = crypto
          .createHash('sha1')
          .update(signatureString + apiSecret)
          .digest('hex');
      }
    } catch (error) {
      console.error('Error generating signature:', error);
      // Fallback to manual signature generation if Cloudinary utility fails
      const signatureString = Object.keys(signatureParams)
        .sort()
        .map((key) => `${key}=${signatureParams[key]}`)
        .join('&');
      signature = crypto
        .createHash('sha1')
        .update(signatureString + apiSecret)
        .digest('hex');
    }

    return {
      signature,
      timestamp,
      cloudName: cloudName, // Use the validated cloudName from configuration
      apiKey,
    };
  }

  private getFileType(resourceType: string): 'image' | 'video' | 'document' | 'audio' {
    switch (resourceType) {
      case 'image':
        return 'image';
      case 'video':
        // Cloudinary often treats audio as "video" resource type
        return 'video'; // Or 'audio' if we can distinguish, but for now generic.
      case 'raw':
        return 'document';
      default:
        return 'document';
    }
  }
}

