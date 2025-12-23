import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import { Database } from '../../../common/supabase/types';

type EventInsert = Database['public']['Tables']['events']['Insert'];

@Injectable()
export class EventsService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createEventDto: any, userId: string): Promise<any> {
    const { data, error } = await this.supabase.client
      .from('events')
      .insert({
        name: createEventDto.name,
        start_date: createEventDto.startDate,
        end_date: createEventDto.endDate,
        location: createEventDto.location,
        coordinates: createEventDto.coordinates,
        description: createEventDto.description,
        feast_id: createEventDto.feastId,
        featured: createEventDto.featured || false,
        flyer_images: createEventDto.flyerImages || [],
        reminder_enabled: createEventDto.reminderEnabled || false,
      } as any)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findAll(filters?: { featured?: boolean; startDate?: Date; limit?: number; offset?: number }) {
    let query = this.supabase.client
      .from('events')
      .select('*', { count: 'exact' });

    if (filters?.featured !== undefined) query = query.eq('featured', filters.featured);
    if (filters?.startDate) query = query.gte('start_date', filters.startDate.toISOString());

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    query = query.order('start_date', { ascending: true }).range(offset, offset + limit - 1);

    const { data, count } = await query;

    return { items: data || [], total: count || 0, limit, offset };
  }

  async findOne(id: string): Promise<any> {
    const { data: event, error } = await this.supabase.client
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Increment views
    this.supabase.client
      .from('events')
      .update({ views: ((event as any).views || 0) + 1 } as any)
      .eq('id', id);

    return event;
  }

  async update(id: string, updateDto: any, userId: string, userRole: string): Promise<any> {
    await this.findOne(id);
    
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can update events');
    }

    const updates: any = { ...updateDto };
    // Map camelCase to snake_case
    if (updateDto.startDate) updates.start_date = updateDto.startDate;
    if (updateDto.endDate) updates.end_date = updateDto.endDate;
    if (updateDto.feastId) updates.feast_id = updateDto.feastId;
    if (updateDto.flyerImages) updates.flyer_images = updateDto.flyerImages;
    if (updateDto.reminderEnabled) updates.reminder_enabled = updateDto.reminderEnabled;

    delete updates.startDate;
    delete updates.endDate;
    delete updates.feastId;
    delete updates.flyerImages;
    delete updates.reminderEnabled;

    const { data, error } = await this.supabase.client
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    await this.findOne(id);
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can delete events');
    }
    await this.supabase.client.from('events').delete().eq('id', id);
  }

  async toggleReminder(id: string, userId: string): Promise<any> {
    const event = await this.findOne(id);
    
    const { data } = await this.supabase.client
      .from('events')
      .update({ reminder_enabled: !event.reminder_enabled })
      .eq('id', id)
      .select()
      .single();
      
    return data;
  }
}

