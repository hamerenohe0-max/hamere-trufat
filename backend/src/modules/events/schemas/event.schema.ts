import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema({ _id: false })
export class Coordinates {
  @Prop({ required: true })
  lat!: number;

  @Prop({ required: true })
  lng!: number;
}

const CoordinatesSchema = SchemaFactory.createForClass(Coordinates);

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, index: true })
  startDate!: Date;

  @Prop()
  endDate?: Date;

  @Prop({ required: true })
  location!: string;

  @Prop({ type: CoordinatesSchema })
  coordinates?: Coordinates;

  @Prop()
  description?: string;

  @Prop()
  feastId?: string;

  @Prop({ default: false })
  featured!: boolean;

  @Prop({ type: [String], default: [] })
  flyerImages!: string[];

  @Prop({ default: false })
  reminderEnabled!: boolean;

  @Prop({ default: 0 })
  views!: number;
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.index({ startDate: 1 });
EventSchema.index({ featured: 1, startDate: 1 });

