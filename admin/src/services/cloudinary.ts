/**
 * Cloudinary Unsigned Upload Service
 * 
 * This service handles direct uploads from the admin panel to Cloudinary
 * using unsigned uploads with an upload preset.
 * 
 * Security: No API keys or secrets are exposed to the frontend.
 * The upload preset is configured in Cloudinary dashboard with security settings.
 */

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

/**
 * Get Cloudinary configuration from environment variables
 */
function getCloudinaryConfig(): { cloudName: string; uploadPreset: string } {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'hamere-trufat-unsigned';

  if (!cloudName) {
    throw new Error(
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured. ' +
      'Please set it in your .env file.'
    );
  }

  return { cloudName, uploadPreset };
}

/**
 * Upload file directly to Cloudinary using unsigned upload preset
 */
async function uploadToCloudinary(
  file: File,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const formData = new FormData();

    // Add file
    formData.append('file', file);

    // Add upload preset (required for unsigned uploads)
    formData.append('upload_preset', uploadPreset);

    // Add folder if specified
    if (folder) {
      formData.append('folder', folder);
    }

    // Set resource type to auto (Cloudinary will detect)
    formData.append('resource_type', 'auto');

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
 * Main upload function - handles the complete flow
 */
export async function uploadImageToCloudinary(
  options: UploadOptions
): Promise<UploadResult> {
  const { file, folder = 'hamere-trufat', publicId, onProgress } = options;

  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type (images only for now)
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are supported');
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }

  try {
    // Upload directly to Cloudinary using unsigned upload preset
    const result = await uploadToCloudinary(file, folder, onProgress);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
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
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 50MB limit');
  }

  try {
    const result = await uploadToCloudinary(file, folder, onProgress);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error during upload');
  }
}
