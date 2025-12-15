import { CacheService } from '../../services/offline/cache.service';
import { QueueService } from '../../services/offline/queue.service';
import { AudioService } from '../../services/offline/audio.service';
import { getDatabase } from '../../services/offline/database';

jest.mock('../../services/offline/database');
jest.mock('expo-file-system', () => ({
  cacheDirectory: '/cache/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  downloadAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

describe('Offline Mode Tests', () => {
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

  describe('Cache Persistence', () => {
    it('should persist news cache', async () => {
      const news = [{ id: '1', title: 'Test' }];
      await CacheService.cacheNews(news);

      const cached = await CacheService.getCachedNews();
      expect(cached.length).toBeGreaterThan(0);
    });

    it('should persist articles cache', async () => {
      const articles = [{ id: '1', title: 'Test Article' }];
      await CacheService.cacheArticles(articles);

      const cached = await CacheService.getCachedArticles();
      expect(cached.length).toBeGreaterThan(0);
    });

    it('should persist readings cache', async () => {
      const reading = { date: '2025-01-01', gospel: { title: 'Test' } };
      await CacheService.cacheReading('2025-01-01', reading);

      const cached = await CacheService.getCachedReading('2025-01-01');
      expect(cached).toBeDefined();
    });
  });

  describe('Bookmark Persistence', () => {
    it('should save and retrieve bookmarks', async () => {
      const data = { id: '1', title: 'Test' };
      await CacheService.saveBookmark('news', '1', data);

      const isBookmarked = await CacheService.isBookmarked('news', '1');
      expect(isBookmarked).toBe(true);

      const bookmarks = await CacheService.getBookmarks('news');
      expect(bookmarks.length).toBeGreaterThan(0);
    });

    it('should remove bookmarks', async () => {
      await CacheService.saveBookmark('news', '1', { id: '1' });
      await CacheService.removeBookmark('news', '1');

      const isBookmarked = await CacheService.isBookmarked('news', '1');
      expect(isBookmarked).toBe(false);
    });
  });

  describe('Offline Queue', () => {
    it('should queue actions when offline', async () => {
      const id = await QueueService.enqueue('comment', 'news', '1', { body: 'Test' });
      expect(id).toBeDefined();

      const pending = await QueueService.getPendingActions();
      expect(pending.length).toBeGreaterThan(0);
    });

    it('should track queue size', async () => {
      await QueueService.enqueue('like', 'news', '1', {});
      await QueueService.enqueue('comment', 'news', '2', { body: 'Test' });

      const size = await QueueService.getQueueSize();
      expect(size).toBeGreaterThanOrEqual(2);
    });

    it('should mark actions as completed', async () => {
      const id = await QueueService.enqueue('like', 'news', '1', {});
      await QueueService.markCompleted(id);

      const pending = await QueueService.getPendingActions();
      expect(pending.find((a) => a.id === id)).toBeUndefined();
    });
  });

  describe('Audio Caching', () => {
    it('should cache audio files', async () => {
      const mockFileSystem = require('expo-file-system');
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false });
      mockFileSystem.downloadAsync.mockResolvedValue({ status: 200 });

      const cachedPath = await AudioService.cacheAudio('audio-1', 'https://example.com/audio.mp3');
      expect(cachedPath).toBeDefined();
    });

    it('should return cached audio if exists', async () => {
      const mockFileSystem = require('expo-file-system');
      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true });

      mockDb.getFirstAsync.mockResolvedValue({
        local_path: '/cache/audio/audio-1.mp3',
      });

      const cached = await AudioService.getCachedAudio('audio-1');
      expect(cached).toBeDefined();
    });
  });
});

