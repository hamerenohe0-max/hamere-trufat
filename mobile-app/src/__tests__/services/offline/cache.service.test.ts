import { CacheService } from '../../../services/offline/cache.service';
import { getDatabase } from '../../../services/offline/database';

// Mock the database
jest.mock('../../../services/offline/database', () => ({
  getDatabase: jest.fn(),
}));

describe('CacheService', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      runAsync: jest.fn().mockResolvedValue(undefined),
      getAllAsync: jest.fn().mockResolvedValue([]),
      getFirstAsync: jest.fn().mockResolvedValue(null),
      execAsync: jest.fn().mockResolvedValue(undefined),
    };
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cacheNews', () => {
    it('should cache news items', async () => {
      const news = [
        { id: '1', title: 'Test News', body: 'Content' },
        { id: '2', title: 'Test News 2', body: 'Content 2' },
      ];

      await CacheService.cacheNews(news);

      expect(mockDb.runAsync).toHaveBeenCalledTimes(3); // 2 news items + 1 cleanup
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO news_cache'),
        expect.any(Array),
      );
    });
  });

  describe('getCachedNews', () => {
    it('should return cached news items', async () => {
      const mockData = [
        { data: JSON.stringify({ id: '1', title: 'Test' }) },
        { data: JSON.stringify({ id: '2', title: 'Test 2' }) },
      ];
      mockDb.getAllAsync.mockResolvedValue(mockData);

      const result = await CacheService.getCachedNews();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: '1', title: 'Test' });
    });

    it('should return empty array when no cache exists', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await CacheService.getCachedNews();

      expect(result).toEqual([]);
    });
  });

  describe('saveBookmark', () => {
    it('should save a bookmark', async () => {
      const data = { id: '1', title: 'Test' };

      await CacheService.saveBookmark('news', '1', data);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO bookmarks'),
        expect.arrayContaining(['news_1', 'news', '1', expect.any(String)]),
      );
    });
  });

  describe('isBookmarked', () => {
    it('should return true if bookmarked', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 1 });

      const result = await CacheService.isBookmarked('news', '1');

      expect(result).toBe(true);
    });

    it('should return false if not bookmarked', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 0 });

      const result = await CacheService.isBookmarked('news', '1');

      expect(result).toBe(false);
    });
  });
});

