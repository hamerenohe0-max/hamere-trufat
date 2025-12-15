import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Media, MediaDocument } from '../schemas/media.schema';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: any, userId: string): Promise<MediaDocument> {
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

          const media = new this.mediaModel({
            filename: file.originalname,
            url: result.secure_url,
            cloudinaryId: result.public_id,
            type: this.getFileType(result.resource_type),
            size: result.bytes,
            mimeType: file.mimetype,
            uploadedBy: userId,
          });

          resolve(await media.save());
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(id: string, userId: string): Promise<void> {
    const media = await this.mediaModel.findById(id).exec();
    if (!media) {
      throw new Error('Media not found');
    }

    if (media.uploadedBy !== userId) {
      throw new Error('You can only delete your own media');
    }

    await cloudinary.uploader.destroy(media.cloudinaryId);
    await this.mediaModel.findByIdAndDelete(id).exec();
  }

  async findAll(userId?: string, limit = 50, offset = 0) {
    const query: any = {};
    if (userId) query.uploadedBy = userId;

    const [items, total] = await Promise.all([
      this.mediaModel.find(query).sort({ createdAt: -1 }).limit(limit).skip(offset).exec(),
      this.mediaModel.countDocuments(query).exec(),
    ]);

    return { items, total, limit, offset };
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

