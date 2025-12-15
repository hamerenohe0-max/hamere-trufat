import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameScore, GameScoreDocument } from '../schemas/game-score.schema';

@Injectable()
export class GamesService {
  constructor(@InjectModel(GameScore.name) private gameScoreModel: Model<GameScoreDocument>) {}

  async saveScore(userId: string, game: string, score: number, metadata?: Record<string, unknown>): Promise<GameScoreDocument> {
    const gameScore = new this.gameScoreModel({
      userId,
      game,
      score,
      metadata: metadata || {},
    });
    return gameScore.save();
  }

  async getUserScores(userId: string, game?: string, limit = 20) {
    const query: any = { userId };
    if (game) query.game = game;

    return this.gameScoreModel
      .find(query)
      .sort({ score: -1, createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getLeaderboard(game: string, limit = 10) {
    return this.gameScoreModel
      .find({ game })
      .sort({ score: -1 })
      .limit(limit)
      .populate('userId', 'name email')
      .exec();
  }

  async getUserHighScore(userId: string, game: string): Promise<GameScoreDocument | null> {
    return this.gameScoreModel
      .findOne({ userId, game })
      .sort({ score: -1 })
      .exec();
  }
}

