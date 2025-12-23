import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';

@Injectable()
export class FeastsService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createFeastDto: any, userId: string): Promise<any> {
    const { data, error } = await this.supabase.client
      .from('feasts')
      .insert({
        name: createFeastDto.name,
        date: createFeastDto.date,
        region: createFeastDto.region,
        description: createFeastDto.description,
        icon: createFeastDto.icon,
        article_ids: createFeastDto.articleIds || [],
        biography: createFeastDto.biography,
        traditions: createFeastDto.traditions || [],
        readings: createFeastDto.readings || [],
        prayers: createFeastDto.prayers || [],
        reminder_enabled: createFeastDto.reminderEnabled || false,
      } as any)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findAll(filters?: { region?: string; date?: Date; limit?: number; offset?: number }) {
    let query = this.supabase.client
      .from('feasts')
      .select('*', { count: 'exact' });

    if (filters?.region) query = query.eq('region', filters.region);
    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.gte('date', startOfDay.toISOString()).lte('date', endOfDay.toISOString());
    }

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    query = query.order('date', { ascending: true }).range(offset, offset + limit - 1);

    const { data, count } = await query;

    return { items: data || [], total: count || 0, limit, offset };
  }

  async findOne(id: string): Promise<any> {
    const { data: feast, error } = await this.supabase.client
      .from('feasts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !feast) {
      throw new NotFoundException(`Feast with ID ${id} not found`);
    }

    // Increment views
    this.supabase.client
      .from('feasts')
      .update({ views: ((feast as any).views || 0) + 1 } as any)
      .eq('id', id);

    return feast;
  }

  async findByDate(date: Date): Promise<any | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data } = await this.supabase.client
      .from('feasts')
      .select('*')
      .gte('date', startOfDay.toISOString())
      .lte('date', endOfDay.toISOString())
      .single();

    return data;
  }

  async update(id: string, updateDto: any, userId: string, userRole: string): Promise<any> {
    await this.findOne(id);
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can update feasts');
    }

    const updates: any = { ...updateDto };
    // Map camelCase to snake_case
    if (updateDto.articleIds) updates.article_ids = updateDto.articleIds;
    if (updateDto.reminderEnabled) updates.reminder_enabled = updateDto.reminderEnabled;
    
    delete updates.articleIds;
    delete updates.reminderEnabled;

    const { data, error } = await this.supabase.client
      .from('feasts')
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
      throw new ForbiddenException('Only admins can delete feasts');
    }
    await this.supabase.client.from('feasts').delete().eq('id', id);
  }

  async toggleReminder(id: string, userId: string): Promise<any> {
    const feast = await this.findOne(id);
    
    const { data } = await this.supabase.client
      .from('feasts')
      .update({ reminder_enabled: !(feast as any).reminder_enabled } as any)
      .eq('id', id)
      .select()
      .single();
      
    return data;
  }
}

