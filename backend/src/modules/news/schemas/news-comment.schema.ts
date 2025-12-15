import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NewsCommentDocument = HydratedDocument<NewsComment>;

@Schema({ timestamps: true })
export class NewsComment {
  @Prop({ required: true, index: true })
  newsId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  body!: string;

  @Prop()
  translatedBody?: string;

  @Prop({ default: 0 })
  likes!: number;

  @Prop({ type: [String], default: [] })
  likedBy!: string[];
}

export const NewsCommentSchema = SchemaFactory.createForClass(NewsComment);
NewsCommentSchema.index({ newsId: 1, createdAt: -1 });

