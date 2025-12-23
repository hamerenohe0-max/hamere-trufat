import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly supabase: SupabaseService,
    private usersService: UsersService,
  ) {}

  async create(createNotificationDto: {
    type: 'assignment' | 'submission' | 'news' | 'system';
    title: string;
    body: string;
    targetUserIds?: string[];
    targetRole?: 'all' | 'user' | 'publisher' | 'admin';
    metadata?: Record<string, unknown>;
  }): Promise<any> {
    let targetUserIds: string[] = [];

    if (createNotificationDto.targetUserIds) {
      targetUserIds = createNotificationDto.targetUserIds;
    } else if (createNotificationDto.targetRole) {
      // Get user IDs by role
      const users = await this.usersService.findByRole(createNotificationDto.targetRole === 'all' ? undefined : createNotificationDto.targetRole);
      targetUserIds = users.map((u: any) => u.id);
    }

    const { data, error } = await this.supabase.client
      .from('notifications' as any)
      .insert({
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        body: createNotificationDto.body,
        target_user_ids: targetUserIds,
        target_role: createNotificationDto.targetRole,
        metadata: createNotificationDto.metadata || {},
        sent_at: new Date().toISOString(),
        sent_count: targetUserIds.length,
        read_count: 0,
        read_by_user_ids: [],
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findAll(filters?: { userId?: string; limit?: number; offset?: number }) {
    let query = this.supabase.client
      .from('notifications' as any)
      .select('*', { count: 'exact' });

    if (filters?.userId) {
      query = query.contains('target_user_ids', [filters.userId]);
    }

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count } = await query;

    return { items: data || [], total: count || 0, limit, offset };
  }

  async findOne(id: string): Promise<any> {
    const { data: notification, error } = await this.supabase.client
      .from('notifications' as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<any> {
    const notification = await this.findOne(id);
    
    const readByUserIds = notification.read_by_user_ids || [];
    if (!readByUserIds.includes(userId)) {
      readByUserIds.push(userId);
      
      const { data } = await this.supabase.client
        .from('notifications' as any)
        .update({
          read_by_user_ids: readByUserIds,
          read_count: notification.read_count + 1,
        })
        .eq('id', id)
        .select()
        .single();
        
      return data;
    }
    return notification;
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.supabase.client.from('notifications' as any).delete().eq('id', id);
  }
}

