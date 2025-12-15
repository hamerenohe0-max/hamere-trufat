import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: String, enum: ['assignment', 'submission', 'news', 'system'], required: true })
  type!: 'assignment' | 'submission' | 'news' | 'system';

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  body!: string;

  @Prop({ type: [String], default: [] })
  targetUserIds!: string[];

  @Prop({ type: String, enum: ['all', 'user', 'publisher', 'admin'] })
  targetRole?: 'all' | 'user' | 'publisher' | 'admin';

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;

  @Prop({ type: [String], default: [] })
  readByUserIds!: string[];

  @Prop()
  sentAt?: Date;

  @Prop({ default: 0 })
  sentCount!: number;

  @Prop({ default: 0 })
  readCount!: number;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ targetUserIds: 1, createdAt: -1 });
NotificationSchema.index({ sentAt: -1 });

