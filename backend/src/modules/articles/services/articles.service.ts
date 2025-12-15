import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from '../schemas/article.schema';
import { ArticleBookmark, ArticleBookmarkDocument } from '../schemas/article-bookmark.schema';
import { CreateArticleDto } from '../dto/create-article.dto';
import slugify from 'slugify';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(ArticleBookmark.name) private bookmarkModel: Model<ArticleBookmarkDocument>,
  ) {}

  async create(createArticleDto: CreateArticleDto, authorId: string): Promise<ArticleDocument> {
    const slug = slugify(createArticleDto.title, { lower: true, strict: true });
    const article = new this.articleModel({
      ...createArticleDto,
      slug,
      authorId,
      publishedAt: new Date(),
    });
    return article.save();
  }

  async findAll(filters?: { authorId?: string; limit?: number; offset?: number }) {
    const query: any = {};
    if (filters?.authorId) query.authorId = filters.authorId;

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    const [items, total] = await Promise.all([
      this.articleModel.find(query).sort({ publishedAt: -1 }).limit(limit).skip(offset).exec(),
      this.articleModel.countDocuments(query).exec(),
    ]);

    return { items, total, limit, offset };
  }

  async findOne(id: string): Promise<ArticleDocument> {
    const article = await this.articleModel.findById(id).exec();
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    article.views += 1;
    await article.save();
    return article;
  }

  async findBySlug(slug: string): Promise<ArticleDocument> {
    const article = await this.articleModel.findOne({ slug }).exec();
    if (!article) {
      throw new NotFoundException(`Article with slug ${slug} not found`);
    }
    article.views += 1;
    await article.save();
    return article;
  }

  async update(id: string, updateDto: Partial<CreateArticleDto>, userId: string): Promise<ArticleDocument> {
    const article = await this.findOne(id);
    if (article.authorId !== userId) {
      throw new ForbiddenException('You can only update your own articles');
    }

    if (updateDto.title && updateDto.title !== article.title) {
      (updateDto as any).slug = slugify(updateDto.title, { lower: true, strict: true });
    }

    Object.assign(article, updateDto);
    return article.save();
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    const article = await this.findOne(id);
    if (article.authorId !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own articles');
    }
    await this.articleModel.findByIdAndDelete(id).exec();
  }

  async toggleBookmark(articleId: string, userId: string): Promise<{ bookmarked: boolean }> {
    await this.findOne(articleId);
    const existing = await this.bookmarkModel.findOne({ articleId, userId }).exec();

    if (existing) {
      await this.bookmarkModel.findByIdAndDelete(existing._id).exec();
      return { bookmarked: false };
    } else {
      await new this.bookmarkModel({ articleId, userId }).save();
      return { bookmarked: true };
    }
  }

  async getBookmarks(userId: string, limit = 20, offset = 0) {
    const bookmarks = await this.bookmarkModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    const articleIds = bookmarks.map((b) => b.articleId);
    const articles = await this.articleModel.find({ _id: { $in: articleIds } }).exec();

    return { items: articles, total: bookmarks.length, limit, offset };
  }

  async findByAuthor(authorId: string, limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      this.articleModel.find({ authorId }).sort({ publishedAt: -1 }).limit(limit).skip(offset).exec(),
      this.articleModel.countDocuments({ authorId }).exec(),
    ]);
    return { items, total, limit, offset };
  }
}

