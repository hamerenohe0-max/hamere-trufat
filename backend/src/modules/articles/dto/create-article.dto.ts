import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayMaxSize } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  coverImage?: string; // Keep for backward compatibility

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(4, { message: 'Maximum 4 images allowed' })
  @IsOptional()
  images?: string[]; // Up to 4 images

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  relatedEventIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  relatedFeastIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @IsString()
  @IsOptional()
  audioUrl?: string;

  @IsString()
  @IsOptional()
  readingTime?: string;

  @IsString()
  @IsOptional()
  status?: 'draft' | 'published';
}

