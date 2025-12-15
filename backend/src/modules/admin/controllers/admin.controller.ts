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
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { NewsService } from '../../news/services/news.service';
import { ArticlesService } from '../../articles/services/articles.service';
import { EventsService } from '../../events/services/events.service';
import { FeastsService } from '../../feasts/services/feasts.service';
import { ProgressService } from '../../progress/services/progress.service';
import { UsersService } from '../../users/services/users.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { MediaService } from '../../media/services/media.service';
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

  @Post('news')
  createNews(@Body() createNewsDto: any, @CurrentUser() user: any) {
    return this.newsService.create(createNewsDto, user.id);
  }

  @Patch('news/:id')
  updateNews(@Param('id') id: string, @Body() updateNewsDto: any, @CurrentUser() user: any) {
    return this.newsService.update(id, updateNewsDto, user.id);
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

  @Post('articles')
  createArticle(@Body() createArticleDto: any, @CurrentUser() user: any) {
    return this.articlesService.create(createArticleDto, user.id);
  }

  @Patch('articles/:id')
  updateArticle(@Param('id') id: string, @Body() updateArticleDto: any, @CurrentUser() user: any) {
    return this.articlesService.update(id, updateArticleDto, user.id);
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

