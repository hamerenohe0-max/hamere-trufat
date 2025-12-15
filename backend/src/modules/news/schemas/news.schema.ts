import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NewsDocument = HydratedDocument<News>;

@Schema({ timestamps: true })
export class News {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  summary!: string;

  @Prop({ required: true })
  body!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ required: true, index: true })
  authorId!: string;

  @Prop()
  coverImage?: string;

  @Prop({ type: String, enum: ['draft', 'scheduled', 'published'], default: 'draft' })
  status!: 'draft' | 'scheduled' | 'published';

  @Prop()
  publishedAt?: Date;

  @Prop()
  scheduledAt?: Date;

  @Prop({ default: 0 })
  views!: number;

  @Prop({ default: 0 })
  likes!: number;

  @Prop({ default: 0 })
  dislikes!: number;

  @Prop({ default: 0 })
  commentsCount!: number;
}

export const NewsSchema = SchemaFactory.createForClass(News);
NewsSchema.index({ authorId: 1 });
NewsSchema.index({ status: 1, publishedAt: -1 });
NewsSchema.index({ tags: 1 });

