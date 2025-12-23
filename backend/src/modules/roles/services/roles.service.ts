import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class RolesService {
  constructor(
    private readonly supabase: SupabaseService,
    private usersService: UsersService,
  ) {}

  async createRequest(userId: string): Promise<any> {
    const { data: existing } = await this.supabase.client
      .from('publisher_requests')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      if (existing.status === 'pending') {
        throw new ForbiddenException('You already have a pending publisher request');
      }
      // If rejected, allow new request
      if (existing.status === 'rejected') {
        const { data } = await this.supabase.client
          .from('publisher_requests')
          .update({
            status: 'pending',
            requested_at: new Date().toISOString(),
            reviewed_at: null,
            reviewed_by: null,
            rejection_reason: null,
          })
          .eq('id', existing.id)
          .select()
          .single();
        return data;
      }
    }

    const { data } = await this.supabase.client
      .from('publisher_requests')
      .insert({
        user_id: userId,
        status: 'pending',
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    return data;
  }

  async findAll(filters?: { status?: string; limit?: number; offset?: number }) {
    let query = this.supabase.client
      .from('publisher_requests')
      .select('*, users(name, email)', { count: 'exact' });

    if (filters?.status) query = query.eq('status', filters.status);

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    query = query.order('requested_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count } = await query;

    return { items: data || [], total: count || 0, limit, offset };
  }

  async findOne(id: string): Promise<any> {
    const { data: request, error } = await this.supabase.client
      .from('publisher_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !request) {
      throw new NotFoundException(`Publisher request with ID ${id} not found`);
    }
    return request;
  }

  async approve(id: string, reviewerId: string): Promise<any> {
    const request = await this.findOne(id);
    if (request.status !== 'pending') {
      throw new ForbiddenException('Only pending requests can be approved');
    }

    const { data } = await this.supabase.client
      .from('publisher_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
      })
      .eq('id', id)
      .select()
      .single();

    // Update user role
    await this.usersService.update(request.user_id, { role: 'publisher' });

    return data;
  }

  async reject(id: string, reviewerId: string, reason?: string): Promise<any> {
    const request = await this.findOne(id);
    if (request.status !== 'pending') {
      throw new ForbiddenException('Only pending requests can be rejected');
    }

    const { data } = await this.supabase.client
      .from('publisher_requests')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
        rejection_reason: reason,
      })
      .eq('id', id)
      .select()
      .single();

    return data;
  }
}

