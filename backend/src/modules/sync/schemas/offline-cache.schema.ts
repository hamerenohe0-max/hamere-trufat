import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OfflineCacheDocument = HydratedDocument<OfflineCache>;

@Schema({ timestamps: true })
export class OfflineCache {
  @Prop({ required: true, index: true })
  key!: string;

  @Prop({ required: true, index: true })
  entity!: string;

  @Prop({ type: Object, required: true })
  payload!: Record<string, unknown>;

  @Prop()
  expiresAt?: Date;

  @Prop({ required: true })
  version!: number;

  @Prop({ required: true })
  checksum!: string;

  @Prop({ required: true, index: true })
  deviceId!: string;

  @Prop({ required: true, index: true })
  userId!: string;
}

export const OfflineCacheSchema = SchemaFactory.createForClass(OfflineCache);
OfflineCacheSchema.index({ userId: 1, deviceId: 1, entity: 1 });
OfflineCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

