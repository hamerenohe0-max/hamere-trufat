import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NewsBookmarkDocument = HydratedDocument<NewsBookmark>;

@Schema({ timestamps: true })
export class NewsBookmark {
  @Prop({ required: true, index: true })
  newsId!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const NewsBookmarkSchema = SchemaFactory.createForClass(NewsBookmark);
NewsBookmarkSchema.index({ newsId: 1, userId: 1 }, { unique: true });

