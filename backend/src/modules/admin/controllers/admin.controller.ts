import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { NewsService } from '../../news/services/news.service';
import { MediaService } from '../../media/services/media.service';
import { ArticlesService } from '../../articles/services/articles.service';
import { EventsService } from '../../events/services/events.service';
import { FeastsService } from '../../feasts/services/feasts.service';
import { ProgressService } from '../../progress/services/progress.service';
import { UsersService } from '../../users/services/users.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { RolesService } from '../../roles/services/roles.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'publisher')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private newsService: NewsService,
    private articlesService: ArticlesService,
    private eventsService: EventsService,
    private feastsService: FeastsService,
    private progressService: ProgressService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private mediaService: MediaService,
    private rolesService: RolesService,
  ) {}

  @Get('dashboard/stats')
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/charts')
  getCharts(@Query('days') days?: string) {
    return this.adminService.getChartData(days ? parseInt(days) : 30);
  }

  @Get('dashboard/content')
  getContentStats() {
    return this.adminService.getContentStats();
  }

  // News admin endpoints
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
    // Parse tags if it's a JSON string
    let tags = createNewsDto.tags;
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch {
        // If not JSON, treat as comma-separated string
        tags = tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    }

    let imageUrls: string[] = [];
    
    // Check if images are provided as URLs (from admin panel) or files
    if (createNewsDto.images && Array.isArray(createNewsDto.images)) {
      // Images provided as URLs directly (simpler flow)
      imageUrls = createNewsDto.images.filter((url: any) => url && typeof url === 'string' && url.trim().length > 0);
      console.log('Admin: Received image URLs directly:', imageUrls);
    } else if (files && files.length > 0) {
      // Files uploaded - upload to Cloudinary and get URLs
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

    // Convert Google Drive links to direct image URLs
    const convertGoogleDriveLink = (url: string): string => {
      if (!url || typeof url !== 'string') return url;
      
      // Match Google Drive sharing link format: https://drive.google.com/file/d/FILE_ID/view
      // Also handles: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
      const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (driveMatch) {
        const fileId = driveMatch[1];
        // Use multiple fallback methods for better compatibility
        // Method 1: uc?export=view (most common, works for public files)
        const convertedUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        console.log(`Converting Google Drive link: ${url} -> ${convertedUrl}`);
        return convertedUrl;
      }
      
      // Also handle shortened Google Drive links
      const shortMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
      if (shortMatch) {
        const fileId = shortMatch[1];
        const convertedUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        console.log(`Converting Google Drive link: ${url} -> ${convertedUrl}`);
        return convertedUrl;
      }
      
      // Handle direct file ID in URL
      const directIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (directIdMatch && url.includes('drive.google.com')) {
        const fileId = directIdMatch[1];
        const convertedUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        console.log(`Converting Google Drive link: ${url} -> ${convertedUrl}`);
        return convertedUrl;
      }
      
      return url; // Return as-is if not a Google Drive link
    };
    
    // Filter out any empty or invalid URLs, converting Google Drive links
    const cleanImageUrls = imageUrls
      .map((url) => convertGoogleDriveLink(url))
      .filter((url) => {
        if (!url || typeof url !== 'string' || url.trim().length === 0) return false;
        // Validate URL format
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });
    
    console.log('Admin: Final image URLs to save:', cleanImageUrls);

    // Pass the image URLs (links) to the service - these will be stored in the database
    const newsData = {
      title: createNewsDto.title,
      summary: createNewsDto.summary,
      body: createNewsDto.body,
      tags: tags || [],
      images: cleanImageUrls, // Array of image URLs (links)
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
    // Parse tags if it's a JSON string
    let tags = updateNewsDto.tags;
    if (tags && typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch {
        tags = tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    }

    let imageUrls: string[] = [];
    
    // Check if images are provided as URLs (from admin panel) or files
    if (updateNewsDto.images && Array.isArray(updateNewsDto.images)) {
      // Images provided as URLs directly (simpler flow)
      imageUrls = updateNewsDto.images.filter((url: any) => url && typeof url === 'string' && url.trim().length > 0);
      console.log('Admin: Received image URLs directly for update:', imageUrls);
    } else if (files && files.length > 0) {
      // Files uploaded - upload to Cloudinary and get URLs
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
      
      // Parse existing images if provided (as JSON string from FormData)
      let existingImages: string[] = [];
      if (updateNewsDto.existingImages) {
        try {
          const parsed = typeof updateNewsDto.existingImages === 'string' 
            ? JSON.parse(updateNewsDto.existingImages)
            : Array.isArray(updateNewsDto.existingImages)
            ? updateNewsDto.existingImages
            : [];
          existingImages = parsed.filter((url: any) => url && typeof url === 'string' && url.trim().length > 0);
        } catch {
          existingImages = [];
        }
      }
      
      // Combine existing images with newly uploaded ones
      imageUrls = [...existingImages, ...imageUrls];
    }

    // Convert Google Drive links to direct image URLs and validate
    const convertGoogleDriveLink = (url: string): string => {
      if (!url || typeof url !== 'string') return url;
      
      // Match Google Drive sharing link format: https://drive.google.com/file/d/FILE_ID/view
      // Also handles: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
      const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (driveMatch) {
        const fileId = driveMatch[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
      
      // Also handle shortened Google Drive links
      const shortMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
      if (shortMatch) {
        const fileId = shortMatch[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
      
      // Handle direct file ID in URL
      const directIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (directIdMatch && url.includes('drive.google.com')) {
        const fileId = directIdMatch[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
      
      return url; // Return as-is if not a Google Drive link
    };
    
    // Filter and validate URLs, converting Google Drive links
    const allImages = imageUrls
      .map((url) => convertGoogleDriveLink(url))
      .filter((url) => {
        if (!url || typeof url !== 'string' || url.trim().length === 0) return false;
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });
    
    console.log('Admin: Updating news with images:', allImages);

    // Build update object
    const updateData: any = {};
    if (updateNewsDto.title !== undefined) updateData.title = updateNewsDto.title;
    if (updateNewsDto.summary !== undefined) updateData.summary = updateNewsDto.summary;
    if (updateNewsDto.body !== undefined) updateData.body = updateNewsDto.body;
    if (tags !== undefined) updateData.tags = tags;
    if (updateNewsDto.status !== undefined) updateData.status = updateNewsDto.status;
    
    // If new images were uploaded or existing images provided, use combined list
    // Otherwise use DTO images or keep existing
    if (allImages.length > 0) {
      updateData.images = allImages;
    } else if (updateNewsDto.images !== undefined) {
      updateData.images = updateNewsDto.images;
    }

    return this.newsService.update(id, updateData, user.id);
  }

  @Delete('news/:id')
  deleteNews(@Param('id') id: string, @CurrentUser() user: any) {
    return this.newsService.delete(id, user.id, user.role);
  }

  @Post('news/:id/publish')
  publishNews(@Param('id') id: string, @CurrentUser() user: any) {
    return this.newsService.publish(id, user.id);
  }

  // Articles admin endpoints
  @Get('articles')
  getArticles(@Query() query: any) {
    return this.articlesService.findAll({
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Get('articles/:id')
  getArticleById(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Post('articles')
  @UseInterceptors(FilesInterceptor('images', 4))
  async createArticle(
    @Body() createArticleDto: any,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    // Parse keywords if it's a JSON string
    let keywords = createArticleDto.keywords;
    if (typeof keywords === 'string') {
      try {
        keywords = JSON.parse(keywords);
      } catch {
        keywords = keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
      }
    }

    // Upload images if provided
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploaded = await this.mediaService.uploadFile(file, user.id);
          imageUrls.push(uploaded.url);
        } catch (error) {
          console.error('Failed to upload image:', error);
        }
      }
    }

    return this.articlesService.create(
      {
        title: createArticleDto.title,
        content: createArticleDto.content,
        excerpt: createArticleDto.excerpt,
        images: imageUrls,
        keywords: keywords || [],
        relatedEventIds: createArticleDto.relatedEventIds || [],
        relatedFeastIds: createArticleDto.relatedFeastIds || [],
        audioUrl: createArticleDto.audioUrl,
        readingTime: createArticleDto.readingTime,
      },
      user.id,
    );
  }

  @Patch('articles/:id')
  @UseInterceptors(FilesInterceptor('images', 4))
  async updateArticle(
    @Param('id') id: string,
    @Body() updateArticleDto: any,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    // Parse keywords if it's a JSON string
    let keywords = updateArticleDto.keywords;
    if (keywords && typeof keywords === 'string') {
      try {
        keywords = JSON.parse(keywords);
      } catch {
        keywords = keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
      }
    }

    // Upload new images if provided
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploaded = await this.mediaService.uploadFile(file, user.id);
          imageUrls.push(uploaded.url);
        } catch (error) {
          console.error('Failed to upload image:', error);
        }
      }
    }

    // Parse existing images if provided (as JSON string from FormData)
    let existingImages: string[] = [];
    if (updateArticleDto.existingImages) {
      try {
        existingImages = typeof updateArticleDto.existingImages === 'string' 
          ? JSON.parse(updateArticleDto.existingImages)
          : Array.isArray(updateArticleDto.existingImages)
          ? updateArticleDto.existingImages
          : [];
      } catch {
        existingImages = [];
      }
    }

    // Combine existing images with newly uploaded ones
    const allImages = [...existingImages, ...imageUrls];

    // Build update object
    const updateData: any = {};
    if (updateArticleDto.title !== undefined) updateData.title = updateArticleDto.title;
    if (updateArticleDto.content !== undefined) updateData.content = updateArticleDto.content;
    if (updateArticleDto.excerpt !== undefined) updateData.excerpt = updateArticleDto.excerpt;
    if (keywords !== undefined) updateData.keywords = keywords;
    if (updateArticleDto.relatedEventIds !== undefined) updateData.relatedEventIds = updateArticleDto.relatedEventIds;
    if (updateArticleDto.relatedFeastIds !== undefined) updateData.relatedFeastIds = updateArticleDto.relatedFeastIds;
    if (updateArticleDto.audioUrl !== undefined) updateData.audioUrl = updateArticleDto.audioUrl;
    if (updateArticleDto.readingTime !== undefined) updateData.readingTime = updateArticleDto.readingTime;
    
    // If new images were uploaded or existing images provided, use combined list
    if (allImages.length > 0) {
      updateData.images = allImages;
    } else if (updateArticleDto.images !== undefined) {
      updateData.images = updateArticleDto.images;
    } else if (updateArticleDto.coverImage !== undefined) {
      updateData.coverImage = updateArticleDto.coverImage;
    }

    return this.articlesService.update(id, updateData, user.id);
  }

  @Delete('articles/:id')
  deleteArticle(@Param('id') id: string, @CurrentUser() user: any) {
    return this.articlesService.delete(id, user.id, user.role);
  }

  // Events admin endpoints
  @Get('events')
  getEvents(@Query() query: any) {
    return this.eventsService.findAll({
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Post('events')
  createEvent(@Body() createEventDto: any, @CurrentUser() user: any) {
    return this.eventsService.create(createEventDto, user.id);
  }

  @Patch('events/:id')
  updateEvent(@Param('id') id: string, @Body() updateEventDto: any, @CurrentUser() user: any) {
    return this.eventsService.update(id, updateEventDto, user.id, user.role);
  }

  @Delete('events/:id')
  deleteEvent(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.delete(id, user.id, user.role);
  }

  // Feasts admin endpoints
  @Get('feasts')
  getFeasts(@Query() query: any) {
    return this.feastsService.findAll({
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Post('feasts')
  createFeast(@Body() createFeastDto: any, @CurrentUser() user: any) {
    return this.feastsService.create(createFeastDto, user.id);
  }

  @Patch('feasts/:id')
  updateFeast(@Param('id') id: string, @Body() updateFeastDto: any, @CurrentUser() user: any) {
    return this.feastsService.update(id, updateFeastDto, user.id, user.role);
  }

  @Delete('feasts/:id')
  deleteFeast(@Param('id') id: string, @CurrentUser() user: any) {
    return this.feastsService.delete(id, user.id, user.role);
  }

  // Progress admin endpoints
  @Get('progress')
  getProgress(@Query() query: any) {
    return this.progressService.findAll({
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Post('progress')
  createProgress(@Body() createProgressDto: any, @CurrentUser() user: any) {
    return this.progressService.create(createProgressDto, user.id);
  }

  @Patch('progress/:id')
  updateProgress(@Param('id') id: string, @Body() updateProgressDto: any, @CurrentUser() user: any) {
    return this.progressService.update(id, updateProgressDto, user.id, user.role);
  }

  @Delete('progress/:id')
  deleteProgress(@Param('id') id: string, @CurrentUser() user: any) {
    return this.progressService.delete(id, user.id, user.role);
  }

  // Users admin endpoints
  @Get('users')
  @Roles('admin')
  getUsers(@Query() query: any) {
    return this.usersService.findAll({
      role: query.role,
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Patch('users/:id')
  @Roles('admin')
  updateUser(@Param('id') id: string, @Body() updateUserDto: any) {
    if (updateUserDto.status) {
      return this.usersService.updateStatus(id, updateUserDto.status);
    }
    return this.usersService.updateProfile(id, updateUserDto);
  }

  @Post('users/:id/suspend')
  @Roles('admin')
  suspendUser(@Param('id') id: string) {
    return this.usersService.updateStatus(id, 'suspended');
  }

  @Post('users/:id/activate')
  @Roles('admin')
  activateUser(@Param('id') id: string) {
    return this.usersService.updateStatus(id, 'active');
  }

  // Notifications admin endpoints
  @Get('notifications')
  getNotifications(@Query() query: any) {
    return this.notificationsService.findAll({
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Post('notifications')
  createNotification(@Body() createNotificationDto: any) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Delete('notifications/:id')
  deleteNotification(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }

  // Media admin endpoints
  @Get('media')
  getMedia(@Query() query: any) {
    return this.mediaService.findAll(
      query.userId,
      query.limit ? parseInt(query.limit) : 50,
      query.offset ? parseInt(query.offset) : 0,
    );
  }

  // Publishers admin endpoints
  @Get('publishers/requests')
  @Roles('admin')
  getPublisherRequests(@Query() query: any) {
    return this.rolesService.findAll({
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Post('publishers/:id/approve')
  @Roles('admin')
  approvePublisher(@Param('id') id: string, @CurrentUser() user: any) {
    return this.rolesService.approve(id, user.id);
  }

  @Post('publishers/:id/reject')
  @Roles('admin')
  rejectPublisher(@Param('id') id: string, @Body() body: { reason?: string }, @CurrentUser() user: any) {
    return this.rolesService.reject(id, user.id, body.reason);
  }
}

