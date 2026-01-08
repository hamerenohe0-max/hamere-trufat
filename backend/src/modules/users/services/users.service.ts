import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import { Database } from '../../../common/supabase/types';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
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
  constructor(private readonly supabase: SupabaseService) { }

  async create(createDto: CreateUserDto): Promise<any> {
    const passwordHash = await bcrypt.hash(createDto.password, 12);

    // Start a transaction-like approach (though Supabase/PostgREST doesn't support traditional transactions over API easily without RPC)
    // We will create user first, then publisher profile if needed

    const { data: user, error } = await this.supabase.client
      .from('users')
      .insert({
        name: createDto.name,
        email: createDto.email,
        password_hash: passwordHash,
        role: (createDto.role as any) ?? 'user',
        // We still keep basic profile in JSON for backward compatibility if needed, 
        // or just rely on the join. For now, let's keep it minimal or empty.
        profile: {},
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // If role is publisher, create entry in publishers table
    if ((user as any).role === 'publisher') {
      await this.supabase.client
        .from('publishers' as any)
        .insert({
          id: (user as any).id,
          phone: createDto.phone,
        });
    }

    return user;
  }

  async findByEmail(email: string): Promise<any | null> {
    const { data } = await this.supabase.client
      .from('users' as any)
      .select('*, publishers(*)')
      .eq('email', email.toLowerCase())
      .single();

    if (!data) return null;
    return this.mapUserWithPublisher(data as any);
  }

  async findById(id: string): Promise<any | null> {
    const { data } = await this.supabase.client
      .from('users' as any)
      .select('*, publishers(*)')
      .eq('id', id)
      .single();

    if (!data) return null;
    return this.mapUserWithPublisher(data as any);
  }

  async updateProfile(userId: string, profileDto: UpdateProfileDto) {
    // 1. Update basic user info (name)
    if (profileDto.name) {
      const { error } = await this.supabase.client
        .from('users')
        .update({ name: profileDto.name })
        .eq('id', userId);
      if (error) throw new Error(error.message);
    }

    // 2. Check if user is publisher to update publishers table
    const { data: user } = await this.supabase.client
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user) throw new NotFoundException('User not found');

    if (user.role === 'publisher') {
      // Upsert into publishers table
      const publisherUpdates: any = {};
      if (profileDto.bio !== undefined) publisherUpdates.bio = profileDto.bio;
      if (profileDto.phone !== undefined) publisherUpdates.phone = profileDto.phone;
      if (profileDto.region !== undefined) publisherUpdates.region = profileDto.region;
      if (profileDto.language !== undefined) publisherUpdates.language = profileDto.language;
      if (profileDto.avatarUrl !== undefined) {
        console.log(`[UsersService] Adding avatarUrl to updates: ${profileDto.avatarUrl}`);
        publisherUpdates.avatar_url = profileDto.avatarUrl;
      }

      console.log('[UsersService] Publisher updates object:', publisherUpdates);

      if (Object.keys(publisherUpdates).length > 0) {
        const { error } = await this.supabase.client
          .from('publishers' as any)
          .upsert({ id: userId, ...publisherUpdates }); // Removed .eq() which might cause issues with upsert

        if (error) {
          console.error('[UsersService] Upsert error:', error);
          throw new Error(error.message);
        }
      }
    } else {
      // For regular users, we might still use the JSON profile or ignore
      // For now, let's update the JSON profile for non-publishers to maintain existing behavior
      const { data: currentUser } = await this.supabase.client
        .from('users')
        .select('profile')
        .eq('id', userId)
        .single();

      const currentProfile = ((currentUser as any)?.profile as any) || {};
      const newProfile = {
        ...currentProfile,
        ...(profileDto.bio !== undefined && { bio: profileDto.bio }),
        ...(profileDto.avatarUrl !== undefined && { avatarUrl: profileDto.avatarUrl }), // Keep camelCase for JSON
        ...(profileDto.language !== undefined && { language: profileDto.language }),
        ...(profileDto.region !== undefined && { region: profileDto.region }),
        ...(profileDto.phone !== undefined && { phone: profileDto.phone }),
      };

      await this.supabase.client
        .from('users')
        .update({ profile: newProfile })
        .eq('id', userId);
    }

    return this.getFullProfile(userId);
  }

  async getFullProfile(userId: string): Promise<any> {
    // Join with publishers table
    const { data: user, error } = await this.supabase.client
      .from('users' as any)
      .select('*, publishers(*)')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new NotFoundException('User not found');
    }

    const userData = user as any;

    let profile: any = {};
    if (userData.role === 'publisher' && userData.publishers) {
      // Map publishers table columns to profile object structure
      // user.publishers might be an object or array depending on relationship, usually object for 1:1
      const pubData = Array.isArray(userData.publishers) ? userData.publishers[0] : userData.publishers;
      if (pubData) {
        profile = {
          bio: pubData.bio,
          phone: pubData.phone,
          region: pubData.region,
          language: pubData.language,
          avatarUrl: pubData.avatar_url, // map snake_case to camelCase
          websiteUrl: pubData.website_url,
          socialLinks: pubData.social_links
        };
      }
    } else {
      // Fallback to JSON profile for backward compatibility or non-publishers
      profile = (userData.profile as any) || {};
    }

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: userData.status,
      profile: profile,
      lastLoginAt: userData.last_login_at,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
    };
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
      .from('users' as any)
      .select('*, publishers(*)')
      .eq('status', 'active');

    if (role) {
      query = query.eq('role', role);
    }

    const { data } = await query;
    return (data || []).map(u => this.mapUserWithPublisher(u as any));
  }

  async findAll(filters?: { role?: string; status?: string; limit?: number; offset?: number }) {
    // Select with join
    let query = this.supabase.client
      .from('users' as any)
      .select('*, publishers(*)', { count: 'exact' });

    if (filters?.role) query = query.eq('role', filters.role);
    if (filters?.status) query = query.eq('status', filters.status);

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count } = await query;
    const items = (data || []).map(u => this.mapUserWithPublisher(u as any));

    return {
      items,
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
      .from('users' as any)
      .select('id, name, profile, role, created_at, updated_at, publishers(*)')
      .eq('id', userId)
      .eq('status', 'active')
      .single();

    if (error || !user) {
      throw new NotFoundException('User profile not found');
    }

    return this.mapUserWithPublisher(user as any);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    // Get user with password hash
    const { data: user, error } = await this.supabase.client
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    if (!user.password_hash) {
      throw new BadRequestException('Password not set for this account');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password_hash
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 12);

    // Update password
    const { error: updateError } = await this.supabase.client
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);

    if (updateError) {
      throw new BadRequestException('Failed to update password');
    }

    return { success: true, message: 'Password changed successfully' };
  }

  private mapUserWithPublisher(user: any): SafeUser {
    let profile: any = {};

    if (user.role === 'publisher' && user.publishers) {
      const pubData = Array.isArray(user.publishers) ? user.publishers[0] : user.publishers;
      if (pubData) {
        profile = {
          bio: pubData.bio,
          phone: pubData.phone,
          region: pubData.region,
          language: pubData.language,
          avatarUrl: pubData.avatar_url,
          websiteUrl: pubData.website_url,
          socialLinks: pubData.social_links
        };
      }
    } else {
      profile = user.profile || {};
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      profile: profile,
      lastLoginAt: user.last_login_at ? new Date(user.last_login_at) : undefined,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
      // Include auth fields for internal use (AuthService needs them)
      password_hash: user.password_hash,
      refresh_token_hash: user.refresh_token_hash,
    } as any;
  }

  toSafeUser(user: any): SafeUser {
    // Keep this for backward compatibility or direct mapping if no join
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



