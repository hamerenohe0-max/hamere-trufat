import { IsOptional, IsString } from 'class-validator';

export class RecordDeviceDto {
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

  @IsOptional()
  @IsString()
  lastIp?: string;
}


