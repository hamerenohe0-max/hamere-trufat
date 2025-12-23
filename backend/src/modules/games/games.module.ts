import { Module } from '@nestjs/common';
import { GamesService } from './services/games.service';
import { GamesController } from './controllers/games.controller';

@Module({
  imports: [],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
