import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ArticleBookmarkDocument = HydratedDocument<ArticleBookmark>;

@Schema({ timestamps: true })
export class ArticleBookmark {
  @Prop({ required: true, index: true })
  articleId!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const ArticleBookmarkSchema = SchemaFactory.createForClass(ArticleBookmark);
ArticleBookmarkSchema.index({ articleId: 1, userId: 1 }, { unique: true });

