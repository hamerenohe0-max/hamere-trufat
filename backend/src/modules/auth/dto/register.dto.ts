import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DeviceContextDto } from './device-context.dto';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  role?: 'user' | 'publisher' | 'admin';

  @IsOptional()
  @IsBoolean()
  requireOtp?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceContextDto)
  device?: DeviceContextDto;
}


