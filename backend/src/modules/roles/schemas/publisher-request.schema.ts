import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PublisherRequestDocument = HydratedDocument<PublisherRequest>;

@Schema({ timestamps: true })
export class PublisherRequest {
  @Prop({ required: true, unique: true, index: true })
  userId!: string;

  @Prop({ type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true })
  status!: 'pending' | 'approved' | 'rejected';

  @Prop()
  requestedAt!: Date;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  reviewedBy?: string;

  @Prop()
  rejectionReason?: string;
}

export const PublisherRequestSchema = SchemaFactory.createForClass(PublisherRequest);
PublisherRequestSchema.index({ status: 1, requestedAt: -1 });

