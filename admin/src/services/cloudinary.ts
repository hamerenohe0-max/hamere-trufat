/**
 * Cloudinary Signed Upload Service
 * 
 * This service handles direct uploads from the admin panel to Cloudinary
 * using signed uploads. The signature is obtained from the backend API,
 * so no API secrets are exposed to the frontend.
 */

import { apiFetch } from "@/lib/api";

interface UploadOptions {
  file: File;
  folder?: string;
  publicId?: string;
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
}

interface SignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
}

/**
 * Get upload signature from backend
 */
async function getUploadSignature(folder: string, resourceType?: string): Promise<SignatureResponse> {
  let params = `folder=${encodeURIComponent(folder)}`;
  if (resourceType) {
    params += `&resourceType=${resourceType}`;
  }
  return apiFetch<SignatureResponse>(`/media/upload-signature?${params}`, {
    method: "POST",
  });
}

/**
 * Upload file directly to Cloudinary using signed upload
 */
async function uploadToCloudinary(
  file: File,
  folder: string,
  onProgress?: (progress: number) => void,
  resourceType?: string
): Promise<UploadResult> {
  const { signature, timestamp, cloudName, apiKey } = await getUploadSignature(folder, resourceType);

  return new Promise((resolve, reject) => {
    const formData = new FormData();

    // Add file
    formData.append('file', file);

    // Add signed upload parameters
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
    formData.append('api_key', apiKey);

    // Add folder
    formData.append('folder', folder);

    // Include resource type if specified (e.g., 'raw' for PDFs)
    if (resourceType) {
      formData.append('resource_type', resourceType);
    }

    // Create XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            format: result.format,
          });
        } catch (error) {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error?.message || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was aborted'));
    });

    // Start upload to Cloudinary API
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File, maxSizeMB = 10): void {
  if (!file) {
    throw new Error('No file provided');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are supported');
  }
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
  }
}

/**
 * Upload image to Cloudinary
 */
export async function uploadImageToCloudinary(
  options: UploadOptions
): Promise<UploadResult> {
  const { file, folder = 'hamere-trufat', onProgress } = options;

  validateImageFile(file);

  try {
    return await uploadToCloudinary(file, folder, onProgress);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Unknown error during upload');
  }
}

/**
 * Upload any file (PDF, document, etc.) to Cloudinary
 */
export async function uploadFileToCloudinary(
  options: UploadOptions & { resourceType?: string }
): Promise<UploadResult> {
  const { file, folder = 'hamere-trufat', onProgress, resourceType = 'raw' } = options;

  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file size (50MB limit for documents)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size exceeds 50MB limit');
  }

  try {
    return await uploadToCloudinary(file, folder, onProgress, resourceType);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Unknown error during upload');
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string = 'hamere-trufat',
  onProgress?: (index: number, progress: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const result = await uploadImageToCloudinary({
        file,
        folder,
        onProgress: onProgress ? (progress) => onProgress(i, progress) : undefined,
      });
      results.push(result);
    } catch (error) {
      // Continue with other files even if one fails
      console.error(`Failed to upload file ${i + 1}:`, error);
      throw error; // Or handle differently based on requirements
    }
  }

  return results;
}


/**
 * Upload audio file to Cloudinary
 */
export async function uploadAudioToCloudinary(
  options: UploadOptions
): Promise<UploadResult> {
  const { file, folder = 'hamere-trufat/audio', onProgress } = options;

  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type (audio only)
  if (!file.type.startsWith('audio/') && !file.type.includes('mpeg') && !file.type.includes('wav')) {
    throw new Error('Only audio files are supported');
  }

  // Validate file size (50MB limit for audio)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size exceeds 50MB limit');
  }

  try {
    return await uploadToCloudinary(file, folder, onProgress, 'video');
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Unknown error during upload');
  }
}
