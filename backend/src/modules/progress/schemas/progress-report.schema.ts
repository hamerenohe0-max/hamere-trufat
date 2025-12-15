import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProgressReportDocument = HydratedDocument<ProgressReport>;

@Schema({ _id: false })
export class TimelineEvent {
  @Prop({ required: true })
  label!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  date!: Date;
}

const TimelineEventSchema = SchemaFactory.createForClass(TimelineEvent);

@Schema({ timestamps: true })
export class ProgressReport {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  summary!: string;

  @Prop()
  pdfUrl?: string;

  @Prop()
  beforeImage?: string;

  @Prop()
  afterImage?: string;

  @Prop({ type: [String], default: [] })
  mediaGallery!: string[];

  @Prop({ type: [TimelineEventSchema], default: [] })
  timeline!: TimelineEvent[];

  @Prop({ default: 0 })
  likes!: number;

  @Prop({ default: 0 })
  commentsCount!: number;

  @Prop({ type: [String], default: [] })
  likedBy!: string[];
}

export const ProgressReportSchema = SchemaFactory.createForClass(ProgressReport);
ProgressReportSchema.index({ createdAt: -1 });

