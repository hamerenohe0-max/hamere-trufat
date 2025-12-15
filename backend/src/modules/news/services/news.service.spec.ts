import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NewsService } from './news.service';
import { News, NewsDocument } from '../schemas/news.schema';
import { NewsComment, NewsCommentDocument } from '../schemas/news-comment.schema';
import { NewsReaction, NewsReactionDocument } from '../schemas/news-reaction.schema';
import { NewsBookmark, NewsBookmarkDocument } from '../schemas/news-bookmark.schema';
import { CreateNewsDto } from '../dto/create-news.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('NewsService', () => {
  let service: NewsService;
  let newsModel: Model<NewsDocument>;
  let commentModel: Model<NewsCommentDocument>;
  let reactionModel: Model<NewsReactionDocument>;
  let bookmarkModel: Model<NewsBookmarkDocument>;

  const mockNewsModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    exec: jest.fn(),
  };

  const mockCommentModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    exec: jest.fn(),
  };

  const mockReactionModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  const mockBookmarkModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: getModelToken(News.name),
          useValue: mockNewsModel,
        },
        {
          provide: getModelToken(NewsComment.name),
          useValue: mockCommentModel,
        },
        {
          provide: getModelToken(NewsReaction.name),
          useValue: mockReactionModel,
        },
        {
          provide: getModelToken(NewsBookmark.name),
          useValue: mockBookmarkModel,
        },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
    newsModel = module.get<Model<NewsDocument>>(getModelToken(News.name));
    commentModel = module.get<Model<NewsCommentDocument>>(getModelToken(NewsComment.name));
    reactionModel = module.get<Model<NewsReactionDocument>>(getModelToken(NewsReaction.name));
    bookmarkModel = module.get<Model<NewsBookmarkDocument>>(getModelToken(NewsBookmark.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create news article', async () => {
      const createNewsDto: CreateNewsDto = {
        title: 'Test News',
        summary: 'Test Summary',
        body: 'Test Body',
        tags: ['test'],
        status: 'draft',
      };

      const mockNews = {
        ...createNewsDto,
        authorId: 'user-1',
        _id: 'news-1',
        save: jest.fn().mockResolvedValue(true),
      };

      (mockNewsModel.create as jest.Mock).mockReturnValue(mockNews);

      const result = await service.create(createNewsDto, 'user-1');

      expect(mockNewsModel.create).toHaveBeenCalledWith({
        ...createNewsDto,
        authorId: 'user-1',
        publishedAt: undefined,
      });
      expect(mockNews.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return news article', async () => {
      const mockNews = {
        _id: 'news-1',
        title: 'Test News',
        views: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      (mockNewsModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNews),
      });

      const result = await service.findOne('news-1');

      expect(result).toEqual(mockNews);
      expect(mockNews.views).toBe(1);
      expect(mockNews.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if news not found', async () => {
      (mockNewsModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleReaction', () => {
    it('should add new like reaction', async () => {
      const mockNews = {
        _id: 'news-1',
        likes: 0,
        dislikes: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      (mockNewsModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNews),
      });

      (mockReactionModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      (mockReactionModel.create as jest.Mock).mockResolvedValue({});

      const result = await service.toggleReaction('news-1', 'user-1', 'like');

      expect(mockNews.likes).toBe(1);
      expect(mockNews.dislikes).toBe(0);
      expect(mockNews.save).toHaveBeenCalled();
    });
  });

  describe('toggleBookmark', () => {
    it('should add bookmark if not exists', async () => {
      const mockNews = { _id: 'news-1' };

      (mockNewsModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNews),
      });

      (mockBookmarkModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      (mockBookmarkModel.create as jest.Mock).mockResolvedValue({});

      const result = await service.toggleBookmark('news-1', 'user-1');

      expect(result.bookmarked).toBe(true);
    });

    it('should remove bookmark if exists', async () => {
      const mockNews = { _id: 'news-1' };
      const mockBookmark = { _id: 'bookmark-1' };

      (mockNewsModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNews),
      });

      (mockBookmarkModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBookmark),
      });

      (mockBookmarkModel.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      });

      const result = await service.toggleBookmark('news-1', 'user-1');

      expect(result.bookmarked).toBe(false);
    });
  });
});

