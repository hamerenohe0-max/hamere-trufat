import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from '../services/media.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'publisher')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Generate Cloudinary upload signature for direct client-side uploads
   * Route: POST /api/v1/media/upload-signature
   * This endpoint is secure - it only generates a signature, never exposes API secrets
   * 
   * Query parameters:
   * - folder: Cloudinary folder path (e.g., 'hamere-trufat/news')
   * - resourceType: 'image', 'video', 'raw', or 'auto' (default: 'image')
   * - publicId: Optional custom public ID for the uploaded file
   * 
   * Returns:
   * {
   *   "timestamp": number,
   *   "signature": string,
   *   "cloudName": string,
   *   "apiKey": string
   * }
   */
  @Post('upload-signature')
  async generateUploadSignature(@Query() query: any) {
    console.log('Upload signature request received:', { query });
    try {
      const result = await this.mediaService.generateUploadSignature({
        folder: query.folder || 'hamere-trufat',
        publicId: query.publicId,
        resourceType: query.resourceType || 'image',
      });
      console.log('Upload signature generated successfully');
      return result;
    } catch (error) {
      console.error('Error generating upload signature:', error);
      throw error;
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: any, @CurrentUser() user: any) {
    return this.mediaService.uploadFile(file, user.id);
  }

  @Get()
  findAll(@Query() query: any, @CurrentUser() user: any) {
    return this.mediaService.findAll(
      query.userId || user.id,
      query.limit ? parseInt(query.limit) : 50,
      query.offset ? parseInt(query.offset) : 0,
    );
  }

  @Delete(':id')
  deleteFile(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mediaService.deleteFile(id, user.id);
  }
}

