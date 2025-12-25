import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import { Database } from '../../../common/supabase/types';
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
  constructor(private readonly supabase: SupabaseService) {}

  async create(createDto: CreateUserDto): Promise<any> {
    const passwordHash = await bcrypt.hash(createDto.password, 12);
    
    const { data, error } = await this.supabase.client
      .from('users')
      .insert({
        name: createDto.name,
        email: createDto.email,
        password_hash: passwordHash,
        role: (createDto.role as any) ?? 'user',
        profile: {
          phone: createDto.phone,
        },
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findByEmail(email: string): Promise<any | null> {
    const { data } = await this.supabase.client
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    // Map snake_case to camelCase for compatibility if needed, 
    // but for now returning the raw row. The AuthStrategy might need adjustment.
    // Actually, let's map it to match the expected UserDocument structure roughly
    // or update the AuthStrategy. For now, I'll return the raw row and we might need to fix types elsewhere.
    return data;
  }

  async findById(id: string): Promise<any | null> {
    const { data } = await this.supabase.client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  }

  async updateProfile(userId: string, profileDto: UpdateProfileDto) {
    // First fetch current profile to merge
    const { data: user } = await this.supabase.client
      .from('users')
      .select('profile')
      .eq('id', userId)
      .single();

    if (!user) throw new NotFoundException('User not found');

    const currentProfile = (user.profile as any) || {};
    
    const newProfile = {
      ...currentProfile,
      ...(profileDto.bio !== undefined && { bio: profileDto.bio }),
      ...(profileDto.avatarUrl !== undefined && { avatarUrl: profileDto.avatarUrl }),
      ...(profileDto.language !== undefined && { language: profileDto.language }),
      ...(profileDto.region !== undefined && { region: profileDto.region }),
      ...(profileDto.phone !== undefined && { phone: profileDto.phone }),
    };

    const updates: any = {
      profile: newProfile,
    };

    if (profileDto.name !== undefined) updates.name = profileDto.name;

    const { data: updatedUser, error } = await this.supabase.client
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error || !updatedUser) throw new NotFoundException('User not found');

    return this.toSafeUser(updatedUser);
  }

  async setRefreshToken(userId: string, refreshTokenHash: string | null) {
    await this.supabase.client
      .from('users')
      .update({ refresh_token_hash: refreshTokenHash })
      .eq('id', userId);
  }

  async recordDeviceSession(userId: string, session: RecordDeviceDto) {
    // Upsert device session
    const { error } = await this.supabase.client
      .from('device_sessions')
      .upsert({
        user_id: userId,
        device_id: session.deviceId,
        device_name: session.deviceName,
        device_platform: session.devicePlatform,
        app_version: session.appVersion,
        last_ip: session.lastIp,
        last_active_at: new Date().toISOString(),
      }, { onConflict: 'user_id,device_id' });

    if (error) throw new Error(error.message);

    // Update last login
    const { data: user } = await this.supabase.client
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (!user) throw new NotFoundException('User not found');

    return this.toSafeUser(user);
  }

  async findByRole(role?: string): Promise<any[]> {
    let query = this.supabase.client
      .from('users')
      .select('*')
      .eq('status', 'active');
      
    if (role) {
      query = query.eq('role', role);
    }
    
    const { data } = await query;
    return data || [];
  }

  async findAll(filters?: { role?: string; status?: string; limit?: number; offset?: number }) {
    let query = this.supabase.client
      .from('users')
      .select('*', { count: 'exact' });

    if (filters?.role) query = query.eq('role', filters.role);
    if (filters?.status) query = query.eq('status', filters.status);

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count } = await query;

    return { 
      items: data || [], 
      total: count || 0, 
      limit, 
      offset 
    };
  }

  async updateStatus(userId: string, status: 'active' | 'suspended'): Promise<any> {
    const { data, error } = await this.supabase.client
      .from('users')
      .update({ status })
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) throw new NotFoundException('User not found');
    return data;
  }

  async update(userId: string, updates: Database['public']['Tables']['users']['Update']): Promise<any> {
    const { data, error } = await this.supabase.client
      .from('users' as any)
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) throw new NotFoundException('User not found');
    return data;
  }

  async getPublicProfile(userId: string): Promise<any> {
    const { data: user, error } = await this.supabase.client
      .from('users')
      .select('id, name, profile, role, created_at, updated_at')
      .eq('id', userId)
      .eq('status', 'active')
      .single();

    if (error || !user) {
      throw new NotFoundException('User profile not found');
    }

    const profile = (user.profile as any) || {};
    
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      language: profile.language,
      region: profile.region,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  toSafeUser(user: any): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      profile: user.profile,
      lastLoginAt: user.last_login_at ? new Date(user.last_login_at) : undefined,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    };
  }
}



