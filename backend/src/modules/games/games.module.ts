import { Module } from '@nestjs/common';
import { GamesService } from './services/games.service';
import { GamesController } from './controllers/games.controller';
import { SupabaseModule } from '../../database/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
