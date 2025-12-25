import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsDateString } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  summary!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  coverImage?: string; // Keep for backward compatibility

  @IsEnum(['draft', 'scheduled', 'published'])
  @IsOptional()
  status?: 'draft' | 'scheduled' | 'published';

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}

