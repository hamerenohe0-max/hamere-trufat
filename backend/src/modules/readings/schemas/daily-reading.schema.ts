import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DailyReadingDocument = HydratedDocument<DailyReading>;

@Schema({ _id: false })
export class GospelReading {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  reference!: string;

  @Prop({ required: true })
  body!: string;

  @Prop()
  audioUrl?: string;
}

@Schema({ _id: false })
export class EpistleReading {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  reference!: string;

  @Prop({ required: true })
  body!: string;
}

const GospelReadingSchema = SchemaFactory.createForClass(GospelReading);
const EpistleReadingSchema = SchemaFactory.createForClass(EpistleReading);

@Schema({ timestamps: true })
export class DailyReading {
  @Prop({ required: true, unique: true, index: true })
  date!: Date;

  @Prop({ type: GospelReadingSchema, required: true })
  gospel!: GospelReading;

  @Prop({ type: EpistleReadingSchema })
  epistle?: EpistleReading;

  @Prop({ type: [String], default: [] })
  psalms!: string[];

  @Prop({ type: [String], default: [] })
  reflections!: string[];

  @Prop({ type: String, enum: ['amharic', 'english', 'geez'], default: 'amharic' })
  language!: 'amharic' | 'english' | 'geez';
}

export const DailyReadingSchema = SchemaFactory.createForClass(DailyReading);
DailyReadingSchema.index({ date: 1 }, { unique: true });

