import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { CreateNewsDto } from './create-news.dto';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {
  @IsOptional()
  @IsEnum(['draft', 'scheduled', 'published'])
  status?: 'draft' | 'scheduled' | 'published';

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

