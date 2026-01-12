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
import { NewsService } from '../services/news.service';
import { CreateNewsDto } from '../dto/create-news.dto';
import { UpdateNewsDto } from '../dto/update-news.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  create(@Body() createNewsDto: CreateNewsDto, @CurrentUser() user: any) {
    return this.newsService.create(createNewsDto, user.id);
  }

  @Get()
  findAll(@Query() query: any) {
    // For public endpoints, default to published status if not specified
    const status = query.status || 'published';
    return this.newsService.findAll({
      status: status,
      authorId: query.authorId,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.newsService.findOne(id, user?.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto, @CurrentUser() user: any) {
    return this.newsService.update(id, updateNewsDto, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.newsService.delete(id, user.id, user.role);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  publish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.newsService.publish(id, user.id);
  }


  @Post(':id/reactions')
  @UseGuards(JwtAuthGuard)
  toggleReaction(@Param('id') id: string, @Body() body: { reaction: 'like' | 'dislike' }, @CurrentUser() user: any) {
    return this.newsService.toggleReaction(id, user.id, body.reaction);
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  toggleBookmark(@Param('id') id: string, @CurrentUser() user: any) {
    return this.newsService.toggleBookmark(id, user.id);
  }

  @Get('bookmarks/my')
  @UseGuards(JwtAuthGuard)
  getBookmarks(@CurrentUser() user: any, @Query() query: any) {
    return this.newsService.getBookmarks(
      user.id,
      query.limit ? parseInt(query.limit) : 20,
      query.offset ? parseInt(query.offset) : 0,
    );
  }
}

