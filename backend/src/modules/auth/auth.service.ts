import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService, SafeUser } from '../users/services/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/forgot-password.dto';
import { DeviceContextDto } from './dto/device-context.dto';
import { AuthResponse, TokenBundle } from './types/auth-response.type';
import { JwtPayload } from './types/jwt-payload.interface';
import { RecordDeviceDto } from '../users/dto/record-device.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password,
      phone: registerDto.phone,
      role: registerDto.role,
    });

    const otpRequired =
      registerDto.requireOtp ??
      this.config.get<boolean>('AUTH_REQUIRE_OTP') ??
      false;

    if (otpRequired) {
      const code = this.generateOtp();
      user.otpCode = code;
      user.otpExpiresAt = this.futureDateMinutes(10);
      user.status = 'pending';
      await user.save();

      return {
        user: this.usersService.toSafeUser(user),
        tokens: this.emptyTokenBundle(),
        otpRequired: true,
      };
    }

    user.status = 'active';
    await user.save();

    if (registerDto.device) {
      await this.recordDevice(user.id, registerDto.device);
    }

    const tokens = await this.issueTokens(user.id, user.role, user.email);
    await this.persistRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.usersService.toSafeUser(user),
      tokens,
      otpRequired: false,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('No OTP pending verification');
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP expired');
    }

    if (user.otpCode !== dto.code) {
      throw new BadRequestException('Invalid OTP');
    }

    user.otpCode = null;
    user.otpExpiresAt = null;
    user.otpVerifiedAt = new Date();
    user.status = 'active';
    await user.save();

    return { success: true };
  }

  async login(
    loginDto: LoginDto,
    ip?: string,
  ): Promise<{ user: SafeUser; tokens: TokenBundle }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.otpCode) {
      throw new BadRequestException('OTP verification pending');
    }

    if (user.status === 'suspended') {
      throw new UnauthorizedException('Account suspended');
    }

    const tokens = await this.issueTokens(user.id, user.role, user.email);
    await this.persistRefreshToken(user.id, tokens.refreshToken);

    if (loginDto.device) {
      await this.recordDevice(user.id, {
        ...loginDto.device,
        lastIp: ip,
      });
    }

    return {
      user: this.usersService.toSafeUser(user),
      tokens,
    };
  }

  async refreshUsingToken(refreshToken: string): Promise<AuthResponse> {
    const payload = await this.jwtService
      .verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_SECRET') ?? 'dev-secret',
      })
      .catch(() => {
        throw new UnauthorizedException('Invalid refresh token');
      });

    if (payload.guest) {
      const tokens = await this.issueTokens(
        payload.sub,
        'guest',
        payload.email,
        true,
      );
      return { user: null, tokens };
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh not allowed');
    }

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(user.id, user.role, user.email);
    await this.persistRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.usersService.toSafeUser(user),
      tokens,
    };
  }

  async logout(userId: string) {
    await this.usersService.setRefreshToken(userId, null);
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      // Do not leak existence; still return success
      return { success: true };
    }

    const code = this.generateOtp();
    user.otpCode = code;
    user.otpExpiresAt = this.futureDateMinutes(10);
    await user.save();

    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.otpCode) {
      throw new BadRequestException('Reset not requested');
    }

    if (user.otpCode !== dto.code) {
      throw new BadRequestException('Invalid code');
    }

    if (user.otpExpiresAt && user.otpExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Code expired');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    return { success: true };
  }

  async guestSession(): Promise<AuthResponse> {
    const guestId = `guest_${Date.now()}`;
    const tokens = await this.issueTokens(guestId, 'guest', undefined, true);
    return {
      user: null,
      tokens,
    };
  }

  private async issueTokens(
    subject: string,
    role: string,
    email?: string,
    guest = false,
  ): Promise<TokenBundle> {
    const accessExpiresIn =
      this.config.get<string>('JWT_EXPIRES_IN') ?? '15m';
    const refreshExpiresIn =
      this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    const payload: JwtPayload = {
      sub: subject,
      role: guest ? 'guest' : (role as JwtPayload['role']),
      email,
      guest,
    };

    const accessToken = await (this.jwtService as any).signAsync(payload, {
      expiresIn: accessExpiresIn,
    });
    const refreshToken = await (this.jwtService as any).signAsync(payload, {
      expiresIn: refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseDurationToSeconds(accessExpiresIn),
      refreshExpiresIn: this.parseDurationToSeconds(refreshExpiresIn),
      guest,
    };
  }

  private async persistRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 12);
    await this.usersService.setRefreshToken(userId, hash);
  }

  private generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private futureDateMinutes(minutes: number) {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + minutes);
    return expires;
  }

  private parseDurationToSeconds(duration: string): number {
    if (duration.endsWith('m')) {
      return parseInt(duration, 10) * 60;
    }
    if (duration.endsWith('h')) {
      return parseInt(duration, 10) * 3600;
    }
    if (duration.endsWith('d')) {
      return parseInt(duration, 10) * 86400;
    }
    return parseInt(duration, 10);
  }

  private async recordDevice(
    userId: string,
    device: DeviceContextDto & { lastIp?: string },
  ) {
    const payload: RecordDeviceDto = {
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      devicePlatform: device.devicePlatform,
      appVersion: device.appVersion,
      lastIp: device.lastIp,
    };
    await this.usersService.recordDeviceSession(userId, payload);
  }

  private emptyTokenBundle(): TokenBundle {
    return {
      accessToken: '',
      refreshToken: '',
      expiresIn: 0,
      refreshExpiresIn: 0,
    };
  }
}
