import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamesService } from './services/games.service';
import { GamesController } from './controllers/games.controller';
import { GameScore, GameScoreSchema } from './schemas/game-score.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: GameScore.name, schema: GameScoreSchema }])],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
