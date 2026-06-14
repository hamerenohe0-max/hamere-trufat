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
import { ArticlesService } from '../../articles/services/articles.service';
import { EventsService } from '../../events/services/events.service';
import { FeastsService } from '../../feasts/services/feasts.service';
import { ProgressService } from '../../progress/services/progress.service';
import { MediaService } from '../../media/services/media.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'publisher')
export class AdminContentController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly eventsService: EventsService,
    private readonly feastsService: FeastsService,
    private readonly progressService: ProgressService,
    private readonly mediaService: MediaService,
  ) {}

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
    let keywords = createArticleDto.keywords;
    if (typeof keywords === 'string') {
      try {
        keywords = JSON.parse(keywords);
      } catch {
        keywords = keywords.split(',').map((keyword: string) => keyword.trim()).filter(Boolean);
      }
    }

    const imageUrls = await this.uploadImages(files, user.id);

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
    let keywords = updateArticleDto.keywords;
    if (keywords && typeof keywords === 'string') {
      try {
        keywords = JSON.parse(keywords);
      } catch {
        keywords = keywords.split(',').map((keyword: string) => keyword.trim()).filter(Boolean);
      }
    }

    const imageUrls = await this.uploadImages(files, user.id);
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

    const allImages = [...existingImages, ...imageUrls];
    const updateData: any = {};
    if (updateArticleDto.title !== undefined) updateData.title = updateArticleDto.title;
    if (updateArticleDto.content !== undefined) updateData.content = updateArticleDto.content;
    if (updateArticleDto.excerpt !== undefined) updateData.excerpt = updateArticleDto.excerpt;
    if (keywords !== undefined) updateData.keywords = keywords;
    if (updateArticleDto.relatedEventIds !== undefined) updateData.relatedEventIds = updateArticleDto.relatedEventIds;
    if (updateArticleDto.relatedFeastIds !== undefined) updateData.relatedFeastIds = updateArticleDto.relatedFeastIds;
    if (updateArticleDto.audioUrl !== undefined) updateData.audioUrl = updateArticleDto.audioUrl;
    if (updateArticleDto.readingTime !== undefined) updateData.readingTime = updateArticleDto.readingTime;

    if (allImages.length > 0) {
      updateData.images = allImages;
    } else if (updateArticleDto.images !== undefined) {
      updateData.images = updateArticleDto.images;
    } else if (updateArticleDto.coverImage !== undefined) {
      updateData.coverImage = updateArticleDto.coverImage;
    }

    return this.articlesService.update(id, updateData, user.id, user.role);
  }

  @Delete('articles/:id')
  deleteArticle(@Param('id') id: string, @CurrentUser() user: any) {
    return this.articlesService.delete(id, user.id, user.role);
  }

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

  @Get('feasts')
  getFeasts(@Query() query: any) {
    return this.feastsService.findAll({
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Get('feasts/:id')
  getFeastById(@Param('id') id: string) {
    return this.feastsService.findOne(id);
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

  private async uploadImages(files: Express.Multer.File[] | undefined, userId: string) {
    const imageUrls: string[] = [];
    if (!files || files.length === 0) return imageUrls;

    for (const file of files) {
      try {
        const uploaded = await this.mediaService.uploadFile(file, userId);
        imageUrls.push(uploaded.url);
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }

    return imageUrls;
  }
}
