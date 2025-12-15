import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ArticlesService } from '../services/articles.service';
import { CreateArticleDto } from '../dto/create-article.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  create(@Body() createArticleDto: CreateArticleDto, @CurrentUser() user: any) {
    return this.articlesService.create(createArticleDto, user.id);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.articlesService.findAll({
      authorId: query.authorId,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Get('author/:authorId')
  findByAuthor(@Param('authorId') authorId: string, @Query() query: any) {
    return this.articlesService.findByAuthor(
      authorId,
      query.limit ? parseInt(query.limit) : 20,
      query.offset ? parseInt(query.offset) : 0,
    );
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  update(@Param('id') id: string, @Body() updateDto: CreateArticleDto, @CurrentUser() user: any) {
    return this.articlesService.update(id, updateDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.articlesService.delete(id, user.id, user.role);
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  toggleBookmark(@Param('id') id: string, @CurrentUser() user: any) {
    return this.articlesService.toggleBookmark(id, user.id);
  }

  @Get('bookmarks/my')
  @UseGuards(JwtAuthGuard)
  getBookmarks(@CurrentUser() user: any, @Query() query: any) {
    return this.articlesService.getBookmarks(
      user.id,
      query.limit ? parseInt(query.limit) : 20,
      query.offset ? parseInt(query.offset) : 0,
    );
  }
}

