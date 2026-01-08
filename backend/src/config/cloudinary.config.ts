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
 * Returns null if configuration is missing (Cloudinary is optional)
 */
export function getCloudinaryConfig(configService: ConfigService): CloudinaryConfig | null {
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
  
  // Check if any are placeholder values
  const hasPlaceholders = 
    apiKey === 'your-api-key' || 
    apiSecret === 'your-api-secret' || 
    cloudName === 'your-cloud-name';
  
  if (!cloudName || !apiKey || !apiSecret || hasPlaceholders) {
    console.warn(
      'Cloudinary configuration missing or incomplete. ' +
      'Media uploads will be disabled. ' +
      'To enable, set either CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET'
    );
    return null;
  }
  
  return {
    cloudName,
    apiKey,
    apiSecret,
  };
}

/**
 * Initialize Cloudinary with configuration
 * Only initializes if config is provided
 */
export function initializeCloudinary(config: CloudinaryConfig | null): void {
  if (!config) {
    return; // Cloudinary is optional, skip initialization
  }
  
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
  });
}

