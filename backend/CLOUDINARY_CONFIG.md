# Cloudinary Configuration

## Account Information
- **Cloud Name**: `dwngllfd4`
- **Folder Mode**: Dynamic folders

## Environment Variables

Add these to `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=dwngllfd4
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

## Alternative: CLOUDINARY_URL Format

You can also use the single URL format:

```env
CLOUDINARY_URL=cloudinary://<API_KEY>:<API_SECRET>@dwngllfd4
```

However, the current implementation uses individual variables for better security and flexibility.

## Getting Your Credentials

1. Go to https://console.cloudinary.com/
2. Login to your account
3. Navigate to Dashboard
4. Copy:
   - **Cloud Name**: `dwngllfd4` (already provided)
   - **API Key**: Found in Account Details
   - **API Secret**: Found in Account Details (click "Reveal")

## After Configuration

1. **Restart the backend server**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Test the endpoint**:
   ```bash
   POST http://localhost:4000/api/v1/media/upload-signature?folder=hamere-trufat/news&resourceType=image
   ```

