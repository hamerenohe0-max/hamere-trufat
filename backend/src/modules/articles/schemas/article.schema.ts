import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ArticleDocument = HydratedDocument<Article>;

@Schema({ timestamps: true })
export class Article {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ required: true })
  content!: string;

  @Prop()
  excerpt?: string;

  @Prop()
  coverImage?: string;

  @Prop({ required: true, index: true })
  authorId!: string;

  @Prop()
  publishedAt?: Date;

  @Prop({ type: [String], default: [] })
  relatedEventIds!: string[];

  @Prop({ type: [String], default: [] })
  relatedFeastIds!: string[];

  @Prop({ type: [String], default: [] })
  keywords!: string[];

  @Prop({ default: 0 })
  views!: number;

  @Prop()
  audioUrl?: string;

  @Prop()
  readingTime?: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
ArticleSchema.index({ authorId: 1 });
ArticleSchema.index({ slug: 1 }, { unique: true });
ArticleSchema.index({ publishedAt: -1 });

