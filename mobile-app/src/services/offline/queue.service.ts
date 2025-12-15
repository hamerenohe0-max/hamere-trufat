import { getDatabase } from './database';
import { v4 as uuidv4 } from 'uuid';

export type ActionType = 'comment' | 'like' | 'dislike' | 'bookmark' | 'reaction';
export type EntityType = 'news' | 'article' | 'progress';

interface QueuedAction {
  id: string;
  actionType: ActionType;
  entityType: EntityType;
  entityId: string;
  payload: any;
  createdAt: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export class QueueService {
  static async enqueue(
    actionType: ActionType,
    entityType: EntityType,
    entityId: string,
    payload: any,
  ): Promise<string> {
    const db = await getDatabase();
    const id = uuidv4();
    
    await db.runAsync(
      `INSERT INTO offline_queue (id, action_type, entity_type, entity_id, payload, created_at, retry_count, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, actionType, entityType, entityId, JSON.stringify(payload), Date.now(), 0, 'pending']
    );
    
    return id;
  }

  static async getPendingActions(): Promise<QueuedAction[]> {
    const db = await getDatabase();
    const result = await db.getAllAsync<{
      id: string;
      action_type: string;
      entity_type: string;
      entity_id: string;
      payload: string;
      created_at: number;
      retry_count: number;
      status: string;
    }>(
      `SELECT * FROM offline_queue WHERE status = 'pending' ORDER BY created_at ASC LIMIT 50`
    );
    
    return result.map((row) => ({
      id: row.id,
      actionType: row.action_type as ActionType,
      entityType: row.entity_type as EntityType,
      entityId: row.entity_id,
      payload: JSON.parse(row.payload),
      createdAt: row.created_at,
      retryCount: row.retry_count,
      status: row.status as QueuedAction['status'],
    }));
  }

  static async markProcessing(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE offline_queue SET status = 'processing' WHERE id = ?`,
      [id]
    );
  }

  static async markCompleted(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `DELETE FROM offline_queue WHERE id = ?`,
      [id]
    );
  }

  static async markFailed(id: string, incrementRetry: boolean = true): Promise<void> {
    const db = await getDatabase();
    if (incrementRetry) {
      await db.runAsync(
        `UPDATE offline_queue SET status = 'pending', retry_count = retry_count + 1 WHERE id = ?`,
        [id]
      );
    } else {
      await db.runAsync(
        `UPDATE offline_queue SET status = 'failed' WHERE id = ?`,
        [id]
      );
    }
  }

  static async getQueueSize(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM offline_queue WHERE status = 'pending'`
    );
    
    return result?.count ?? 0;
  }

  static async clearCompleted(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `DELETE FROM offline_queue WHERE status IN ('completed', 'failed') AND created_at < ?`,
      [Date.now() - 1000 * 60 * 60 * 24 * 7] // 7 days ago
    );
  }
}

