/**
 * API Configuration
 * 
 * Controls whether to use mock data or real API endpoints
 * Set USE_MOCK_DATA=false in environment variables to use real APIs
 */

export const API_CONFIG = {
  // Use mock data by default for development
  // Set EXPO_PUBLIC_USE_MOCK_DATA=false to use real APIs
  useMockData: process.env.EXPO_PUBLIC_USE_MOCK_DATA !== 'false',
  
  // API base URL
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  
  // Cache settings
  cacheEnabled: true,
  cacheDuration: 1000 * 60 * 60 * 24, // 24 hours
  
  // Retry settings
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

/**
 * Helper to check if we should use mock data
 */
export function shouldUseMockData(): boolean {
  return API_CONFIG.useMockData;
}

/**
 * Helper to get API base URL
 */
export function getApiBaseUrl(): string {
  return API_CONFIG.baseUrl;
}

