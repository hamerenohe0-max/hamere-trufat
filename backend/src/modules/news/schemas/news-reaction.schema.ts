import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NewsReactionDocument = HydratedDocument<NewsReaction>;

@Schema({ timestamps: true })
export class NewsReaction {
  @Prop({ required: true, index: true })
  newsId!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ type: String, enum: ['like', 'dislike'], required: true })
  reaction!: 'like' | 'dislike';

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const NewsReactionSchema = SchemaFactory.createForClass(NewsReaction);
NewsReactionSchema.index({ newsId: 1, userId: 1 }, { unique: true });

