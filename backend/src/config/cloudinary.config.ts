/**
 * Cloudinary Configuration
 * 
 * This file centralizes Cloudinary configuration using environment variables.
 * The configuration supports both individual variables and CLOUDINARY_URL format.
 */

import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Get Cloudinary configuration from environment variables
 * Supports both CLOUDINARY_URL and individual variables
 */
export function getCloudinaryConfig(configService: ConfigService): CloudinaryConfig {
  // Try CLOUDINARY_URL first (format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
  const cloudinaryUrl = configService.get<string>('CLOUDINARY_URL');
  
  if (cloudinaryUrl) {
    try {
      const url = new URL(cloudinaryUrl.replace('cloudinary://', 'https://'));
      const apiKey = url.username;
      const apiSecret = url.password;
      const cloudName = url.hostname;
      
      if (apiKey && apiSecret && cloudName) {
        return {
          cloudName,
          apiKey,
          apiSecret,
        };
      }
    } catch (error) {
      console.warn('Failed to parse CLOUDINARY_URL, falling back to individual variables');
    }
  }
  
  // Fallback to individual environment variables
  const cloudName = configService.get<string>('CLOUDINARY_CLOUD_NAME');
  const apiKey = configService.get<string>('CLOUDINARY_API_KEY');
  const apiSecret = configService.get<string>('CLOUDINARY_API_SECRET');
  
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary configuration missing. ' +
      'Please set either CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET'
    );
  }
  
  return {
    cloudName,
    apiKey,
    apiSecret,
  };
}

/**
 * Initialize Cloudinary with configuration
 */
export function initializeCloudinary(config: CloudinaryConfig): void {
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
  });
}

