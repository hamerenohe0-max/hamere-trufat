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
  findAll(@Query() query: any, @CurrentUser() user?: any) {
    // For authenticated admin/publisher, show all articles (including drafts)
    // For public/unauthenticated, only show published articles
    const isAuthenticatedAdminOrPublisher = user && (user.role === 'admin' || user.role === 'publisher');
    
    return this.articlesService.findAll({
      authorId: query.authorId,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
      publishedOnly: !isAuthenticatedAdminOrPublisher, // Only show published to public
      userId: user?.id, // For filtering publisher's own articles
      userRole: user?.role, // For role-based filtering
    });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('publisher', 'admin')
  findMyArticles(@CurrentUser() user: any, @Query() query: any) {
    // Publishers get only their own articles (including drafts)
    // Admins get all articles
    return this.articlesService.findAll({
      authorId: user.role === 'publisher' ? user.id : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
      publishedOnly: false, // Include drafts for authenticated users
      userId: user.id,
      userRole: user.role,
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
  findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.articlesService.findOne(id, user?.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  update(@Param('id') id: string, @Body() updateDto: CreateArticleDto, @CurrentUser() user: any) {
    try {
      return this.articlesService.update(id, updateDto, user.id, user?.role);
    } catch (error) {
      console.error('Error in update controller:', error);
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.articlesService.delete(id, user.id, user.role);
  }

  @Post(':id/reactions')
  @UseGuards(JwtAuthGuard)
  toggleReaction(@Param('id') id: string, @Body() body: { reaction: 'like' | 'dislike' }, @CurrentUser() user: any) {
    return this.articlesService.toggleReaction(id, user.id, body.reaction);
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

