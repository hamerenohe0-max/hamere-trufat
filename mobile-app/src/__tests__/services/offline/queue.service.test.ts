import { QueueService } from '../../../services/offline/queue.service';
import { getDatabase } from '../../../services/offline/database';

jest.mock('../../../services/offline/database', () => ({
  getDatabase: jest.fn(),
}));

describe('QueueService', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      runAsync: jest.fn().mockResolvedValue(undefined),
      getAllAsync: jest.fn().mockResolvedValue([]),
      getFirstAsync: jest.fn().mockResolvedValue({ count: 0 }),
    };
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('enqueue', () => {
    it('should add action to queue', async () => {
      const id = await QueueService.enqueue('comment', 'news', '1', { body: 'Test' });

      expect(id).toBeDefined();
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO offline_queue'),
        expect.arrayContaining([
          expect.any(String),
          'comment',
          'news',
          '1',
          expect.any(String),
          expect.any(Number),
          0,
          'pending',
        ]),
      );
    });
  });

  describe('getPendingActions', () => {
    it('should return pending actions', async () => {
      const mockActions = [
        {
          id: '1',
          action_type: 'comment',
          entity_type: 'news',
          entity_id: '1',
          payload: JSON.stringify({ body: 'Test' }),
          created_at: Date.now(),
          retry_count: 0,
          status: 'pending',
        },
      ];
      mockDb.getAllAsync.mockResolvedValue(mockActions);

      const result = await QueueService.getPendingActions();

      expect(result).toHaveLength(1);
      expect(result[0].actionType).toBe('comment');
      expect(result[0].payload).toEqual({ body: 'Test' });
    });
  });

  describe('markCompleted', () => {
    it('should delete completed action', async () => {
      await QueueService.markCompleted('action-id');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM offline_queue'),
        ['action-id'],
      );
    });
  });

  describe('getQueueSize', () => {
    it('should return queue size', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 5 });

      const size = await QueueService.getQueueSize();

      expect(size).toBe(5);
    });
  });
});

