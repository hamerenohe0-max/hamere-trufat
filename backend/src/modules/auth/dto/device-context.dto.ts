import { IsOptional, IsString } from 'class-validator';

export class DeviceContextDto {
  @IsString()
  deviceId!: string;

  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsString()
  devicePlatform?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;
}


