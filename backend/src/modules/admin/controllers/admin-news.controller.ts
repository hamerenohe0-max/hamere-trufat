import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { NewsService } from '../../news/services/news.service';
import { MediaService } from '../../media/services/media.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'publisher')
export class AdminNewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly mediaService: MediaService,
  ) {}

  @Get('news')
  getNews(@Query() query: any) {
    return this.newsService.findAll({
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Get('news/:id')
  getNewsById(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Post('news')
  @UseInterceptors(FilesInterceptor('images', 4))
  async createNews(
    @Body() createNewsDto: any,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    let tags = createNewsDto.tags;
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch {
        tags = tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
      }
    }

    let imageUrls: string[] = [];

    if (createNewsDto.images && Array.isArray(createNewsDto.images)) {
      imageUrls = createNewsDto.images.filter(
        (url: any) => url && typeof url === 'string' && url.trim().length > 0,
      );
      console.log('Admin: Received image URLs directly:', imageUrls);
    } else if (files && files.length > 0) {
      console.log(`Admin: Uploading ${files.length} image(s) to Cloudinary...`);
      for (const file of files) {
        try {
          const uploaded = await this.mediaService.uploadFile(file, user.id);
          if (uploaded?.url && typeof uploaded.url === 'string' && uploaded.url.trim().length > 0) {
            imageUrls.push(uploaded.url);
            console.log('Admin: Image uploaded successfully, URL:', uploaded.url);
          }
        } catch (error) {
          console.error('Admin: Failed to upload image:', error);
        }
      }
    }

    const cleanImageUrls = imageUrls
      .map((url) => this.convertGoogleDriveLink(url, true))
      .filter((url) => this.isValidUrl(url));

    console.log('Admin: Final image URLs to save:', cleanImageUrls);

    const newsData = {
      title: createNewsDto.title,
      summary: createNewsDto.summary,
      body: createNewsDto.body,
      tags: tags || [],
      images: cleanImageUrls,
      status: createNewsDto.status || 'draft',
    };

    console.log('Admin: Creating news with image URLs:', newsData.images);
    const result = await this.newsService.create(newsData, user.id);
    console.log('Admin: News created, returned images:', result?.images);

    return result;
  }

  @Patch('news/:id')
  @UseInterceptors(FilesInterceptor('images', 4))
  async updateNews(
    @Param('id') id: string,
    @Body() updateNewsDto: any,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    let tags = updateNewsDto.tags;
    if (tags && typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch {
        tags = tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
      }
    }

    let imageUrls: string[] = [];

    if (updateNewsDto.images && Array.isArray(updateNewsDto.images)) {
      imageUrls = updateNewsDto.images.filter(
        (url: any) => url && typeof url === 'string' && url.trim().length > 0,
      );
      console.log('Admin: Received image URLs directly for update:', imageUrls);
    } else if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploaded = await this.mediaService.uploadFile(file, user.id);
          if (uploaded?.url && typeof uploaded.url === 'string' && uploaded.url.trim().length > 0) {
            imageUrls.push(uploaded.url);
          }
        } catch (error) {
          console.error('Failed to upload image:', error);
        }
      }

      let existingImages: string[] = [];
      if (updateNewsDto.existingImages) {
        try {
          const parsed = typeof updateNewsDto.existingImages === 'string'
            ? JSON.parse(updateNewsDto.existingImages)
            : Array.isArray(updateNewsDto.existingImages)
              ? updateNewsDto.existingImages
              : [];
          existingImages = parsed.filter(
            (url: any) => url && typeof url === 'string' && url.trim().length > 0,
          );
        } catch {
          existingImages = [];
        }
      }

      imageUrls = [...existingImages, ...imageUrls];
    }

    const allImages = imageUrls
      .map((url) => this.convertGoogleDriveLink(url))
      .filter((url) => this.isValidUrl(url));

    console.log('Admin: Updating news with images:', allImages);

    const updateData: any = {};
    if (updateNewsDto.title !== undefined) updateData.title = updateNewsDto.title;
    if (updateNewsDto.summary !== undefined) updateData.summary = updateNewsDto.summary;
    if (updateNewsDto.body !== undefined) updateData.body = updateNewsDto.body;
    if (tags !== undefined) updateData.tags = tags;
    if (updateNewsDto.status !== undefined) updateData.status = updateNewsDto.status;

    if (allImages.length > 0) {
      updateData.images = allImages;
    } else if (updateNewsDto.images !== undefined) {
      updateData.images = updateNewsDto.images;
    }

    return this.newsService.update(id, updateData, user.id, user.role);
  }

  @Delete('news/:id')
  deleteNews(@Param('id') id: string, @CurrentUser() user: any) {
    return this.newsService.delete(id, user.id, user.role);
  }

  @Post('news/:id/publish')
  publishNews(@Param('id') id: string, @CurrentUser() user: any) {
    return this.newsService.update(id, { status: 'published' }, user.id, user.role);
  }

  @Post('news/:id/schedule')
  scheduleNews(
    @Param('id') id: string,
    @Body() body: { publishAt?: string; scheduledAt?: string },
    @CurrentUser() user: any,
  ) {
    return this.newsService.update(
      id,
      {
        status: 'scheduled',
        scheduledAt: body.scheduledAt || body.publishAt,
      },
      user.id,
      user.role,
    );
  }

  private convertGoogleDriveLink(url: string, logConversion = false): string {
    if (!url || typeof url !== 'string') return url;

    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      const convertedUrl = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
      if (logConversion) console.log(`Converting Google Drive link: ${url} -> ${convertedUrl}`);
      return convertedUrl;
    }

    const shortMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (shortMatch) {
      const convertedUrl = `https://drive.google.com/uc?export=view&id=${shortMatch[1]}`;
      if (logConversion) console.log(`Converting Google Drive link: ${url} -> ${convertedUrl}`);
      return convertedUrl;
    }

    const directIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (directIdMatch && url.includes('drive.google.com')) {
      const convertedUrl = `https://drive.google.com/uc?export=view&id=${directIdMatch[1]}`;
      if (logConversion) console.log(`Converting Google Drive link: ${url} -> ${convertedUrl}`);
      return convertedUrl;
    }

    return url;
  }

  private isValidUrl(url: string) {
    if (!url || typeof url !== 'string' || url.trim().length === 0) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
