import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MediaDocument = HydratedDocument<Media>;

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true })
  filename!: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  cloudinaryId!: string;

  @Prop({ type: String, enum: ['image', 'video', 'document', 'audio'], required: true })
  type!: 'image' | 'video' | 'document' | 'audio';

  @Prop({ required: true })
  size!: number;

  @Prop({ required: true })
  mimeType!: string;

  @Prop({ required: true, index: true })
  uploadedBy!: string;

  @Prop({ default: 0 })
  usageCount!: number;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
MediaSchema.index({ uploadedBy: 1, createdAt: -1 });
MediaSchema.index({ type: 1 });

