import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News, NewsDocument } from '../schemas/news.schema';
import { NewsComment, NewsCommentDocument } from '../schemas/news-comment.schema';
import { NewsReaction, NewsReactionDocument } from '../schemas/news-reaction.schema';
import { NewsBookmark, NewsBookmarkDocument } from '../schemas/news-bookmark.schema';
import { CreateNewsDto } from '../dto/create-news.dto';
import { UpdateNewsDto } from '../dto/update-news.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name) private newsModel: Model<NewsDocument>,
    @InjectModel(NewsComment.name) private commentModel: Model<NewsCommentDocument>,
    @InjectModel(NewsReaction.name) private reactionModel: Model<NewsReactionDocument>,
    @InjectModel(NewsBookmark.name) private bookmarkModel: Model<NewsBookmarkDocument>,
  ) {}

  async create(createNewsDto: CreateNewsDto, authorId: string): Promise<NewsDocument> {
    const news = new this.newsModel({
      ...createNewsDto,
      authorId,
      publishedAt: createNewsDto.status === 'published' ? new Date() : undefined,
    });
    return news.save();
  }

  async findAll(filters?: { status?: string; authorId?: string; limit?: number; offset?: number }) {
    const query: any = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.authorId) query.authorId = filters.authorId;

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    const [items, total] = await Promise.all([
      this.newsModel.find(query).sort({ createdAt: -1 }).limit(limit).skip(offset).exec(),
      this.newsModel.countDocuments(query).exec(),
    ]);

    return { items, total, limit, offset };
  }

  async findOne(id: string): Promise<NewsDocument> {
    const news = await this.newsModel.findById(id).exec();
    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    news.views += 1;
    await news.save();
    return news;
  }

  async update(id: string, updateNewsDto: UpdateNewsDto, userId: string): Promise<NewsDocument> {
    const news = await this.findOne(id);
    if (news.authorId !== userId) {
      throw new ForbiddenException('You can only update your own news');
    }

    if (updateNewsDto.status === 'published' && news.status !== 'published') {
      updateNewsDto.publishedAt = new Date().toISOString();
    }

    Object.assign(news, updateNewsDto);
    return news.save();
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    const news = await this.findOne(id);
    if (news.authorId !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own news');
    }
    await this.newsModel.findByIdAndDelete(id).exec();
  }

  async publish(id: string, userId: string): Promise<NewsDocument> {
    const news = await this.findOne(id);
    if (news.authorId !== userId) {
      throw new ForbiddenException('You can only publish your own news');
    }
    news.status = 'published';
    news.publishedAt = new Date();
    return news.save();
  }

  async addComment(newsId: string, userId: string, createCommentDto: CreateCommentDto): Promise<NewsCommentDocument> {
    const news = await this.findOne(newsId);
    const comment = new this.commentModel({
      newsId,
      userId,
      ...createCommentDto,
    });
    await comment.save();
    news.commentsCount += 1;
    await news.save();
    return comment;
  }

  async getComments(newsId: string, limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      this.commentModel.find({ newsId }).sort({ createdAt: -1 }).limit(limit).skip(offset).exec(),
      this.commentModel.countDocuments({ newsId }).exec(),
    ]);
    return { items, total, limit, offset };
  }

  async toggleReaction(newsId: string, userId: string, reaction: 'like' | 'dislike'): Promise<NewsDocument> {
    const news = await this.findOne(newsId);
    const existing = await this.reactionModel.findOne({ newsId, userId }).exec();

    if (existing) {
      if (existing.reaction === reaction) {
        // Remove reaction
        await this.reactionModel.findByIdAndDelete(existing._id).exec();
        if (reaction === 'like') news.likes = Math.max(0, news.likes - 1);
        else news.dislikes = Math.max(0, news.dislikes - 1);
      } else {
        // Change reaction
        existing.reaction = reaction;
        await existing.save();
        if (reaction === 'like') {
          news.likes += 1;
          news.dislikes = Math.max(0, news.dislikes - 1);
        } else {
          news.dislikes += 1;
          news.likes = Math.max(0, news.likes - 1);
        }
      }
    } else {
      // Add new reaction
      await new this.reactionModel({ newsId, userId, reaction }).save();
      if (reaction === 'like') news.likes += 1;
      else news.dislikes += 1;
    }

    return news.save();
  }

  async toggleBookmark(newsId: string, userId: string): Promise<{ bookmarked: boolean }> {
    await this.findOne(newsId); // Verify news exists
    const existing = await this.bookmarkModel.findOne({ newsId, userId }).exec();

    if (existing) {
      await this.bookmarkModel.findByIdAndDelete(existing._id).exec();
      return { bookmarked: false };
    } else {
      await new this.bookmarkModel({ newsId, userId }).save();
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

    const newsIds = bookmarks.map((b) => b.newsId);
    const newsItems = await this.newsModel.find({ _id: { $in: newsIds } }).exec();

    return { items: newsItems, total: bookmarks.length, limit, offset };
  }
}

