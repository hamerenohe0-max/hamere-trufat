import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { CreateDailyReadingDto } from './dto/create-daily-reading.dto';

@Injectable()
export class DailyReadingsService {
    constructor(private readonly supabase: SupabaseService) { }

    async create(createDto: CreateDailyReadingDto) {
        // Check if reading for date AND time exists
        const existing = await this.findByDateAndTime(createDto.date, createDto.timeOfDay);

        // Map camelCase DTO to snake_case DB columns
        const dbPayload = {
            date: createDto.date,
            time_of_day: createDto.timeOfDay,

            gospel_geez: createDto.gospelGeez,
            gospel_amharic: createDto.gospelAmharic,
            gospel_audio_url: createDto.gospelAudioUrl,
            gospel_ref: createDto.gospelRef,

            epistle_geez: createDto.epistleGeez,
            epistle_amharic: createDto.epistleAmharic,
            epistle_ref: createDto.epistleRef,
            // No epistle_audio_url

            psalm_geez: createDto.psalmGeez,
            psalm_amharic: createDto.psalmAmharic,
            psalm_audio_url: createDto.psalmAudioUrl,
            psalm_ref: createDto.psalmRef,

            acts_geez: createDto.actsGeez,
            acts_amharic: createDto.actsAmharic,
            acts_ref: createDto.actsRef,
        };

        let result;
        if (existing) {
            // Update
            const { data, error } = await this.supabase.client
                .from('daily_readings')
                .update(dbPayload as any)
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw new InternalServerErrorException(error.message);
            result = data;
        } else {
            // Insert
            const { data, error } = await this.supabase.client
                .from('daily_readings')
                .insert(dbPayload as any)
                .select()
                .single();

            if (error) throw new InternalServerErrorException(error.message);
            result = data;
        }

        return this.mapToDto(result);
    }

    // Helper to find specific slot
    async findByDateAndTime(date: string, timeOfDay: string) {
        const { data } = await this.supabase.client
            .from('daily_readings')
            .select('*')
            .eq('date', date)
            .eq('time_of_day', timeOfDay)
            .single();
        return data ? this.mapToDto(data) : null;
    }

    // Returns all readings for a date (Morning and Evening)
    async findByDate(date: string) {
        const { data, error } = await this.supabase.client
            .from('daily_readings')
            .select('*')
            .eq('date', date);

        if (error) {
            console.error('Error finding daily reading:', error);
            return [];
        }

        return data ? data.map(val => this.mapToDto(val)) : [];
    }

    async getToday() {
        const today = new Date().toISOString().split('T')[0];
        return this.findByDate(today);
    }

    private mapToDto(data: any) {
        return {
            id: data.id,
            date: data.date,
            timeOfDay: data.time_of_day,

            gospelGeez: data.gospel_geez,
            gospelAmharic: data.gospel_amharic,
            gospelAudioUrl: data.gospel_audio_url,
            gospelRef: data.gospel_ref,

            epistleGeez: data.epistle_geez,
            epistleAmharic: data.epistle_amharic,
            epistleRef: data.epistle_ref,
            // No epistle audio

            psalmGeez: data.psalm_geez,
            psalmAmharic: data.psalm_amharic,
            psalmAudioUrl: data.psalm_audio_url,
            psalmRef: data.psalm_ref,

            actsGeez: data.acts_geez,
            actsAmharic: data.acts_amharic,
            actsRef: data.acts_ref,

            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }
}
