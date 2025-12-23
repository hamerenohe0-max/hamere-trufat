import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';

@Injectable()
export class ReadingsService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createReadingDto: any): Promise<any> {
    const { data, error } = await this.supabase.client
      .from('daily_readings')
      .insert({
        date: createReadingDto.date,
        gospel: createReadingDto.gospel,
        epistle: createReadingDto.epistle,
        psalms: createReadingDto.psalms || [],
        reflections: createReadingDto.reflections || [],
        language: createReadingDto.language || 'amharic',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findAll(filters?: { language?: string; limit?: number; offset?: number }) {
    let query = this.supabase.client
      .from('daily_readings')
      .select('*', { count: 'exact' });

    if (filters?.language) query = query.eq('language', filters.language);

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    query = query.order('date', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count } = await query;

    return { items: data || [], total: count || 0, limit, offset };
  }

  async findByDate(date: Date): Promise<any | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data } = await this.supabase.client
      .from('daily_readings')
      .select('*')
      .gte('date', startOfDay.toISOString())
      .lte('date', endOfDay.toISOString())
      .single();

    return data;
  }

  async findClosest(date: Date): Promise<any | null> {
    // Find the closest reading to the given date (past or present)
    const { data: pastReadings } = await this.supabase.client
      .from('daily_readings')
      .select('*')
      .lte('date', date.toISOString())
      .order('date', { ascending: false })
      .limit(1);

    if (pastReadings && pastReadings.length > 0) {
      return pastReadings[0];
    }

    // If no past reading, get the next one
    const { data: futureReadings } = await this.supabase.client
      .from('daily_readings')
      .select('*')
      .gte('date', date.toISOString())
      .order('date', { ascending: true })
      .limit(1);

    return futureReadings && futureReadings.length > 0 ? futureReadings[0] : null;
  }

  async findOne(id: string): Promise<any> {
    const { data: reading, error } = await this.supabase.client
      .from('daily_readings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !reading) {
      throw new NotFoundException(`Daily reading with ID ${id} not found`);
    }
    return reading;
  }

  async update(id: string, updateDto: any): Promise<any> {
    await this.findOne(id);
    
    const { data, error } = await this.supabase.client
      .from('daily_readings')
      .update(updateDto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.supabase.client.from('daily_readings').delete().eq('id', id);
  }
}

