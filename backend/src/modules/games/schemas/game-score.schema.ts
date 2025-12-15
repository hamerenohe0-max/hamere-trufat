import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GameScoreDocument = HydratedDocument<GameScore>;

@Schema({ timestamps: true })
export class GameScore {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ type: String, enum: ['trivia', 'puzzle', 'saint', 'memory'], required: true, index: true })
  game!: 'trivia' | 'puzzle' | 'saint' | 'memory';

  @Prop({ required: true })
  score!: number;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const GameScoreSchema = SchemaFactory.createForClass(GameScore);
GameScoreSchema.index({ userId: 1, game: 1, score: -1 });
GameScoreSchema.index({ game: 1, score: -1 });

