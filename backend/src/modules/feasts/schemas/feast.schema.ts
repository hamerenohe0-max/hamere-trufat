import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FeastDocument = HydratedDocument<Feast>;

@Schema({ timestamps: true })
export class Feast {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, index: true })
  date!: Date;

  @Prop({ required: true })
  region!: string;

  @Prop()
  description?: string;

  @Prop()
  icon?: string;

  @Prop({ type: [String], default: [] })
  articleIds!: string[];

  @Prop()
  biography?: string;

  @Prop({ type: [String], default: [] })
  traditions!: string[];

  @Prop({ type: [String], default: [] })
  readings!: string[];

  @Prop({ type: [String], default: [] })
  prayers!: string[];

  @Prop({ default: false })
  reminderEnabled!: boolean;

  @Prop({ default: 0 })
  views!: number;
}

export const FeastSchema = SchemaFactory.createForClass(Feast);
FeastSchema.index({ date: 1 });
FeastSchema.index({ region: 1, date: 1 });

