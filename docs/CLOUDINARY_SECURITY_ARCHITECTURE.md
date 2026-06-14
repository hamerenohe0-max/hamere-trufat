# Cloudinary Security & Architecture Explanation

## Security Model

### Why This Architecture is Secure

#### 1. **API Secret Never Exposed**
- **Backend Only**: `CLOUDINARY_API_SECRET` exists only in `backend/.env`
- **Never Sent to Frontend**: The secret never leaves the backend server
- **Signature-Based**: Frontend only receives cryptographically signed signatures, not the secret itself

#### 2. **Cryptographic Signatures**
- **Time-Limited**: Each signature includes a timestamp, making it expire after a period
- **Cannot be Forged**: Signatures are generated using SHA-1 hashing with the API secret
- **Single-Use**: Each upload requires a fresh signature from the backend

#### 3. **Direct Upload Benefits**
- **No Backend Bandwidth**: Files go directly from browser to Cloudinary CDN
- **Faster Uploads**: No intermediate server bottleneck
- **Scalable**: Backend only handles lightweight signature generation

#### 4. **Authentication & Authorization**
- **JWT Required**: Signature endpoint requires valid authentication token
- **Role-Based**: Only admin/publisher roles can generate signatures
- **Audit Trail**: All signature requests are logged on the backend

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Admin Panel                              │
│                    (React / Browser)                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 1. User selects image file
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    POST /api/v1/media/upload-signature           │
│                    Authorization: Bearer <JWT>                  │
│                    Query: ?folder=hamere-trufat/news            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend Server                           │
│                        (NestJS)                                  │
│                                                                  │
│  1. Validate JWT token                                           │
│  2. Check user role (admin/publisher)                            │
│  3. Get Cloudinary config from .env                              │
│  4. Generate signature using:                                    │
│     cloudinary.utils.api_sign_request(params, API_SECRET)        │
│  5. Return: {signature, timestamp, cloudName, apiKey}            │
│                                                                  │
│  ⚠️ API_SECRET never included in response                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 2. Response (no secrets)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Admin Panel                              │
│                    (React / Browser)                             │
│                                                                  │
│  Receives: {signature, timestamp, cloudName: "dwngllfd4", apiKey}│
│  ⚠️ No API_SECRET received                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 3. Direct upload to Cloudinary
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Cloudinary CDN                              │
│              https://api.cloudinary.com/v1_1/dwngllfd4/upload   │
│                                                                  │
│  Receives:                                                       │
│  - file (FormData)                                              │
│  - api_key                                                       │
│  - timestamp                                                     │
│  - signature (validated against API_SECRET)                     │
│  - folder                                                        │
│                                                                  │
│  Validates signature using API_SECRET (server-side)              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 4. Response with secure_url
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Admin Panel                              │
│                    (React / Browser)                             │
│                                                                  │
│  Receives: {secure_url, public_id, ...}                         │
│  Sends secure_url to backend when saving content                │
└─────────────────────────────────────────────────────────────────┘
```

## Security Guarantees

### ✅ What Frontend CANNOT Do

1. **Cannot Generate Signatures**: Only backend has API_SECRET
2. **Cannot Upload Without Signature**: Cloudinary validates signatures server-side
3. **Cannot Access Other Folders**: Backend controls folder parameter
4. **Cannot Reuse Signatures**: Timestamps prevent replay attacks

### ✅ What Backend Controls

1. **Folder Restrictions**: Backend can enforce which folders are allowed
2. **User Authentication**: Only authenticated admin/publisher users
3. **Rate Limiting**: Can be added to prevent abuse
4. **Audit Logging**: All signature requests are logged

### ✅ What Cloudinary Validates

1. **Signature Authenticity**: Validates signature matches API_SECRET
2. **Timestamp Validity**: Ensures signature is recent
3. **Parameter Integrity**: Validates all parameters match signature

## Implementation Details

### Backend Configuration

**File**: `backend/src/config/cloudinary.config.ts`

Supports both configuration methods:

**Method 1: Individual Variables** (Recommended)
```env
CLOUDINARY_CLOUD_NAME=dwngllfd4
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Method 2: CLOUDINARY_URL Format**
```env
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@dwngllfd4
```

### Signature Generation

**Uses Cloudinary's Official Utility**:
```typescript
const signature = cloudinary.utils.api_sign_request(signatureParams, apiSecret);
```

**Parameters Included in Signature**:
- `timestamp`: Current Unix timestamp
- `folder`: Cloudinary folder path (e.g., "hamere-trufat/news")
- `resource_type`: "image", "video", "raw", or "auto"
- `public_id`: (optional) Custom public ID

**Signature Process**:
1. Sort parameters alphabetically
2. Create string: `folder=hamere-trufat/news&resource_type=image&timestamp=1234567890`
3. Append API_SECRET: `...&timestamp=1234567890YOUR_API_SECRET`
4. SHA-1 hash the result
5. Return hex digest as signature

### Frontend Upload Process

1. **Request Signature**: POST to `/api/v1/media/upload-signature`
2. **Receive Credentials**: Get `{signature, timestamp, cloudName, apiKey}` (NO SECRET)
3. **Build FormData**: Include file + signature parameters
4. **Upload to Cloudinary**: POST directly to `https://api.cloudinary.com/v1_1/dwngllfd4/upload`
5. **Receive secure_url**: Use this URL when saving content

## Best Practices Followed

✅ **Separation of Concerns**: Backend handles secrets, frontend handles uploads  
✅ **Minimal Trust**: Frontend only receives what it needs (signature, not secret)  
✅ **Time-Limited Tokens**: Signatures expire, preventing reuse  
✅ **Direct Upload**: No backend bandwidth usage  
✅ **Error Handling**: Graceful error handling at all levels  
✅ **Type Safety**: TypeScript interfaces ensure type safety  
✅ **Logging**: Backend logs all signature requests for audit  

## Threat Mitigation

### Threat: API Secret Exposure
- **Mitigation**: Secret never sent to frontend, only used server-side

### Threat: Unauthorized Uploads
- **Mitigation**: JWT authentication + role-based access control

### Threat: Signature Replay
- **Mitigation**: Timestamps in signatures, Cloudinary validates freshness

### Threat: Folder Access Control
- **Mitigation**: Backend controls folder parameter, can enforce restrictions

### Threat: Large File Uploads
- **Mitigation**: Client-side validation (10MB limit), can add server-side validation

## Summary

This architecture provides **defense in depth**:

1. **Authentication Layer**: JWT + role-based access
2. **Authorization Layer**: Only admin/publisher can generate signatures
3. **Cryptographic Layer**: Signatures cannot be forged without API_SECRET
4. **Validation Layer**: Cloudinary validates signatures server-side
5. **Audit Layer**: All requests logged for security monitoring

The implementation follows Cloudinary's best practices and ensures API secrets remain secure while providing a seamless upload experience.

