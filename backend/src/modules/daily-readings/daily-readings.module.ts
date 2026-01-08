import { Module } from '@nestjs/common';
import { DailyReadingsController } from './daily-readings.controller';
import { DailyReadingsService } from './daily-readings.service';
import { SupabaseModule } from '../../common/supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [DailyReadingsController],
    providers: [DailyReadingsService],
    exports: [DailyReadingsService],
})
export class DailyReadingsModule { }
