import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from '../services/games.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post('scores')
  @UseGuards(JwtAuthGuard)
  saveScore(@Body() body: { game: string; score: number; metadata?: Record<string, unknown> }, @CurrentUser() user: any) {
    return this.gamesService.saveScore(user.id, body.game, body.score, body.metadata);
  }

  @Get('scores/my')
  @UseGuards(JwtAuthGuard)
  getMyScores(@CurrentUser() user: any, @Query('game') game?: string) {
    return this.gamesService.getUserScores(user.id, game);
  }

  @Get('scores/leaderboard/:game')
  getLeaderboard(@Param('game') game: string, @Query('limit') limit?: string) {
    return this.gamesService.getLeaderboard(game, limit ? parseInt(limit) : 10);
  }

  @Get('scores/high/:game')
  @UseGuards(JwtAuthGuard)
  getHighScore(@Param('game') game: string, @CurrentUser() user: any) {
    return this.gamesService.getUserHighScore(user.id, game);
  }
}

