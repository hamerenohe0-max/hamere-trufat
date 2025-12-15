import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { RecordDeviceDto } from '../dto/record-device.dto';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  profile?: {
    bio?: string;
    avatarUrl?: string;
    language?: string;
    region?: string;
    phone?: string;
  };
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createDto: CreateUserDto): Promise<UserDocument> {
    const passwordHash = await bcrypt.hash(createDto.password, 12);
    const user = new this.userModel({
      name: createDto.name,
      email: createDto.email,
      passwordHash,
      role: createDto.role ?? 'user',
      profile: {
        phone: createDto.phone,
      },
    });

    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateProfile(userId: string, profileDto: UpdateProfileDto) {
    const setPayload: Record<string, unknown> = {};
    if (profileDto.name !== undefined) setPayload['name'] = profileDto.name;
    if (profileDto.bio !== undefined) setPayload['profile.bio'] = profileDto.bio;
    if (profileDto.avatarUrl !== undefined)
      setPayload['profile.avatarUrl'] = profileDto.avatarUrl;
    if (profileDto.language !== undefined)
      setPayload['profile.language'] = profileDto.language;
    if (profileDto.region !== undefined)
      setPayload['profile.region'] = profileDto.region;
    if (profileDto.phone !== undefined)
      setPayload['profile.phone'] = profileDto.phone;

    if (Object.keys(setPayload).length === 0) {
      const current = await this.userModel.findById(userId).exec();
      if (!current) {
        throw new NotFoundException('User not found');
      }
      return this.toSafeUser(current);
    }

    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: setPayload }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toSafeUser(user);
  }

  async setRefreshToken(userId: string, refreshTokenHash: string | null) {
    await this.userModel
      .findByIdAndUpdate(userId, { $set: { refreshTokenHash } })
      .exec();
  }

  async recordDeviceSession(userId: string, session: RecordDeviceDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = user.deviceSessions.find(
      (device) => device.deviceId === session.deviceId,
    );

    if (existing) {
      existing.deviceName = session.deviceName;
      existing.devicePlatform = session.devicePlatform;
      existing.appVersion = session.appVersion;
      existing.lastIp = session.lastIp;
      existing.lastActiveAt = new Date();
    } else {
      user.deviceSessions.push({
        ...session,
        lastActiveAt: new Date(),
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    return this.toSafeUser(user);
  }

  async findByRole(role?: string): Promise<UserDocument[]> {
    const query: any = { status: 'active' };
    if (role) query.role = role;
    return this.userModel.find(query).exec();
  }

  async findAll(filters?: { role?: string; status?: string; limit?: number; offset?: number }) {
    const query: any = {};
    if (filters?.role) query.role = filters.role;
    if (filters?.status) query.status = filters.status;

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    const [items, total] = await Promise.all([
      this.userModel.find(query).sort({ createdAt: -1 }).limit(limit).skip(offset).exec(),
      this.userModel.countDocuments(query).exec(),
    ]);

    return { items, total, limit, offset };
  }

  async updateStatus(userId: string, status: 'active' | 'suspended'): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(userId, { status }, { new: true }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  toSafeUser(user: UserDocument): SafeUser {
    const doc = user as any;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      profile: user.profile,
      lastLoginAt: user.lastLoginAt,
      createdAt: doc.createdAt as Date,
      updatedAt: doc.updatedAt as Date,
    };
  }
}


