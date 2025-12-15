import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export type UserRole = 'user' | 'publisher' | 'admin';
export type UserStatus = 'pending' | 'active' | 'suspended';

@Schema({ _id: false })
export class Profile {
  @Prop()
  bio?: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  language?: string;

  @Prop()
  region?: string;

  @Prop()
  phone?: string;
}

@Schema({ _id: false })
export class DeviceSession {
  @Prop({ required: true })
  deviceId!: string;

  @Prop()
  deviceName?: string;

  @Prop()
  devicePlatform?: string;

  @Prop()
  appVersion?: string;

  @Prop()
  lastIp?: string;

  @Prop({ default: Date.now })
  lastActiveAt?: Date;
}

const ProfileSchema = SchemaFactory.createForClass(Profile);
const DeviceSessionSchema = SchemaFactory.createForClass(DeviceSession);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ type: String, enum: ['user', 'publisher', 'admin'], default: 'user' })
  role!: UserRole;

  @Prop({ type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' })
  status!: UserStatus;

  @Prop({ type: ProfileSchema, default: {} })
  profile?: Profile;

  @Prop({ type: String, required: false })
  otpCode?: string | null;

  @Prop({ type: Date, required: false })
  otpExpiresAt?: Date | null;

  @Prop({ type: Date, required: false })
  otpVerifiedAt?: Date | null;

  @Prop({ type: String, required: false })
  refreshTokenHash?: string | null;

  @Prop({ type: [DeviceSessionSchema], default: [] })
  deviceSessions!: DeviceSession[];

  @Prop()
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });


