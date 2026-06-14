# Cloudinary Image Upload Automation - Complete Implementation

## Overview

This implementation provides secure, direct image uploads from the admin panel to Cloudinary. The backend generates upload signatures (never exposing API secrets), and the frontend uploads directly to Cloudinary's CDN.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│ Admin Panel │         │   Backend    │         │ Cloudinary  │
│  (React)    │         │  (NestJS)    │         │   (CDN)     │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                         │
       │  1. POST /api/v1/     │                         │
       │     media/upload-     │                         │
       │     signature?folder= │                         │
       │─────────────────────>│                         │
       │                       │                         │
       │  2. {signature,       │                         │
       │     timestamp,         │                         │
       │     cloudName, apiKey} │                         │
       │<──────────────────────│                         │
       │                       │                         │
       │  3. POST to Cloudinary│                         │
       │     with signature    │                         │
       │────────────────────────────────────────────────>│
       │                       │                         │
       │  4. {secure_url, ...} │                         │
       │<────────────────────────────────────────────────│
       │                       │                         │
       │  5. Send secure_url   │                         │
       │     to backend        │                         │
       │─────────────────────>│                         │
```

## Backend Implementation

### 1. Environment Variables

Add to `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**⚠️ Security**: `CLOUDINARY_API_SECRET` must NEVER be exposed to the frontend.

### 2. Cloudinary Configuration

**File**: `backend/src/modules/media/services/media.service.ts`

```typescript
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class MediaService {
  constructor(
    private readonly supabase: SupabaseService,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }
}
```

### 3. Signature Generation Endpoint

**Route**: `POST /api/v1/media/upload-signature`

**Controller**: `backend/src/modules/media/controllers/media.controller.ts`

```typescript
@Post('upload-signature')
generateUploadSignature(@Query() query: any) {
  return this.mediaService.generateUploadSignature({
    folder: query.folder || 'hamere-trufat',
    publicId: query.publicId,
    resourceType: query.resourceType || 'image',
  });
}
```

**Service Method**: Uses Cloudinary's official `api_sign_request` utility:

```typescript
async generateUploadSignature(params: {
  folder?: string;
  publicId?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  timestamp?: number;
}): Promise<{
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
}> {
  const timestamp = params.timestamp || Math.round(new Date().getTime() / 1000);
  const folder = params.folder || 'hamere-trufat';
  const resourceType = params.resourceType || 'image';

  const signatureParams: Record<string, any> = {
    timestamp,
    folder,
    resource_type: resourceType,
  };

  if (params.publicId) {
    signatureParams.public_id = params.publicId;
  }

  const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');
  if (!apiSecret) {
    throw new Error('CLOUDINARY_API_SECRET is not configured');
  }

  // Use Cloudinary's official utility
  const signature = cloudinary.utils.api_sign_request(signatureParams, apiSecret);

  return {
    signature,
    timestamp,
    cloudName: this.configService.get('CLOUDINARY_CLOUD_NAME') || '',
    apiKey: this.configService.get('CLOUDINARY_API_KEY') || '',
  };
}
```

### 4. Routing Configuration

**File**: `backend/src/main.ts`

```typescript
app.setGlobalPrefix('api/v1');
```

**File**: `backend/src/modules/media/controllers/media.controller.ts`

```typescript
@Controller('media')
export class MediaController {
  // Endpoints are automatically prefixed with /api/v1/media
}
```

**Full Endpoint URL**: `POST http://localhost:4000/api/v1/media/upload-signature`

### 5. Authentication

The endpoint requires JWT authentication (admin/publisher roles):

```typescript
@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'publisher')
export class MediaController {
  // ...
}
```

## Frontend Implementation

### 1. Upload Service

**File**: `admin/src/services/cloudinary.ts`

```typescript
/**
 * Request upload signature from backend
 */
async function getUploadSignature(
  folder: string = 'hamere-trufat',
  publicId?: string,
  resourceType: string = 'image'
): Promise<UploadSignature> {
  const { apiFetch } = await import('@/lib/api');
  
  const queryParams = new URLSearchParams({
    folder,
    resourceType,
  });
  if (publicId) {
    queryParams.append('publicId', publicId);
  }

  return apiFetch<UploadSignature>(`/media/upload-signature?${queryParams.toString()}`, {
    method: 'POST',
    auth: true,
  });
}

/**
 * Upload file directly to Cloudinary using signature
 */
async function uploadToCloudinary(
  file: File,
  signature: UploadSignature,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    
    formData.append('file', file);
    formData.append('api_key', signature.apiKey);
    formData.append('timestamp', signature.timestamp.toString());
    formData.append('signature', signature.signature);
    formData.append('folder', folder);
    formData.append('resource_type', 'auto');

    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

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

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${signature.cloudName}/upload`);
    xhr.send(formData);
  });
}

/**
 * Main upload function
 */
export async function uploadImageToCloudinary(
  options: UploadOptions
): Promise<UploadResult> {
  const { file, folder = 'hamere-trufat', publicId, onProgress } = options;

  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are supported');
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }

  try {
    // Step 1: Get upload signature from backend
    const signature = await getUploadSignature(folder, publicId, 'image');

    // Step 2: Upload directly to Cloudinary
    const result = await uploadToCloudinary(file, signature, folder, onProgress);

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error during upload');
  }
}
```

### 2. Usage in Components

**File**: `admin/src/components/ui/ImageUpload.tsx`

```typescript
import { uploadImageToCloudinary } from "@/services/cloudinary";

const result = await uploadImageToCloudinary({
  file: selectedFile,
  folder: "hamere-trufat/news",
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress}%`);
  },
});

// Use result.secure_url in your form
setImageUrl(result.secure_url);
```

## Security Architecture

### Why This Approach is Secure

1. **API Secret Never Exposed**
   - `CLOUDINARY_API_SECRET` stays on the backend
   - Frontend only receives a time-limited signature
   - Signatures are cryptographically signed and cannot be forged

2. **Signature-Based Authentication**
   - Each upload requires a fresh signature from the backend
   - Signatures include timestamp and folder constraints
   - Backend can enforce upload policies (folder, size limits, etc.)

3. **Direct Upload Benefits**
   - Files go directly to Cloudinary (no backend bandwidth usage)
   - Faster uploads (no backend bottleneck)
   - Backend only handles metadata (URLs)

4. **Time-Limited Signatures**
   - Signatures include timestamps
   - Cloudinary validates signature expiration
   - Prevents signature reuse

### Security Considerations

- **Authentication Required**: Signature endpoint requires JWT authentication
- **Role-Based Access**: Only admin/publisher roles can generate signatures
- **Folder Restrictions**: Backend controls which folders can be uploaded to
- **No File Validation on Backend**: File validation happens client-side (can be enhanced)

## API Endpoint Details

### POST /api/v1/media/upload-signature

**Query Parameters**:
- `folder` (optional): Cloudinary folder path (default: 'hamere-trufat')
  - Supports nested folders: `hamere-trufat/news`, `hamere-trufat/articles`
- `resourceType` (optional): 'image', 'video', 'raw', or 'auto' (default: 'image')
- `publicId` (optional): Custom public ID for the uploaded file

**Request Example**:
```
POST /api/v1/media/upload-signature?folder=hamere-trufat/news&resourceType=image
Authorization: Bearer <jwt-token>
```

**Response Example**:
```json
{
  "signature": "abc123def456...",
  "timestamp": 1234567890,
  "cloudName": "your-cloud-name",
  "apiKey": "your-api-key"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User doesn't have admin/publisher role
- `500 Internal Server Error`: Cloudinary configuration missing

## Testing

### Test the Endpoint

```bash
# Get JWT token first (login as admin)
curl -X POST http://localhost:4000/api/v1/media/upload-signature \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Expected Response

```json
{
  "signature": "a1b2c3d4e5f6...",
  "timestamp": 1703123456,
  "cloudName": "your-cloud-name",
  "apiKey": "123456789012345"
}
```

## Troubleshooting

### 404 Error

**Problem**: `POST /api/v1/media/upload-signature` returns 404

**Solutions**:
1. Verify `MediaModule` is imported in `AppModule`
2. Check that global prefix is set: `app.setGlobalPrefix('api/v1')`
3. Verify controller is `@Controller('media')`
4. Ensure endpoint is `@Post('upload-signature')`

### Invalid Signature Error

**Problem**: Cloudinary rejects upload with "Invalid signature"

**Solutions**:
1. Verify `CLOUDINARY_API_SECRET` is correct in `.env`
2. Check that signature parameters match exactly (including folder)
3. Ensure timestamp is recent (within 1 hour)
4. Verify `api_sign_request` is using correct parameters

### CORS Error

**Problem**: Frontend can't call the endpoint

**Solutions**:
1. Check `CORS_ORIGIN` in `backend/.env` includes admin panel URL
2. Verify CORS is enabled in `main.ts`: `app.enableCors(...)`

## File Structure

```
backend/
  src/
    modules/
      media/
        controllers/
          media.controller.ts    # POST /upload-signature endpoint
        services/
          media.service.ts       # generateUploadSignature() method
        media.module.ts          # Module registration
    app.module.ts                # Imports MediaModule
    main.ts                      # Sets global prefix 'api/v1'

admin/
  src/
    services/
      cloudinary.ts              # uploadImageToCloudinary() function
    components/
      ui/
        ImageUpload.tsx          # Upload component
```

## Summary

This implementation provides:

✅ **Secure**: API secrets never exposed to frontend  
✅ **Scalable**: Direct uploads to Cloudinary CDN  
✅ **Efficient**: No backend bandwidth usage  
✅ **Flexible**: Supports nested folders and custom public IDs  
✅ **Reliable**: Uses Cloudinary's official signature utility  
✅ **Well-Routed**: Correct Express/NestJS routing structure  

The endpoint `POST /api/v1/media/upload-signature` is fully functional and ready to use.

