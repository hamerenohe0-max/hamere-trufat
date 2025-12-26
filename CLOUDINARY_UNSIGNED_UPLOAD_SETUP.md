# Cloudinary Unsigned Upload Setup

## What Changed

The Cloudinary upload service has been converted from **signed uploads** (which exposed API keys) to **unsigned uploads** using an upload preset. This is more secure because:

✅ **No API keys in frontend code** - API keys are never exposed to the browser  
✅ **Upload preset security** - Security is configured in Cloudinary dashboard  
✅ **Simpler implementation** - No backend signature generation needed  
✅ **Frontend-safe** - All credentials stay server-side

## Setup Instructions

### Step 1: Create Upload Preset in Cloudinary

1. **Go to**: https://console.cloudinary.com/
2. **Navigate to**: Settings → Upload
3. **Scroll to**: "Upload presets"
4. **Click**: "Add upload preset"
5. **Configure**:
   - **Preset name**: `hamere-trufat-unsigned` (or your preferred name)
   - **Signing mode**: `Unsigned` (this is critical!)
   - **Folder**: `hamere-trufat` (optional, can be overridden)
   - **Resource type**: `Auto` or `Image`
   - **Allowed formats**: `jpg, png, gif, webp` (or as needed)
   - **Max file size**: `10MB` (or your preference)
   - **Moderation**: Optional (for content moderation)
   - **Transformation**: Optional (for automatic image optimization)

6. **Save** the preset

### Step 2: Configure Environment Variables

Add these to your `admin/.env` file:

```env
# Cloudinary Configuration (Frontend-safe)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dwngllfd4
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=hamere-trufat-unsigned
```

**Note**: 
- `NEXT_PUBLIC_` prefix makes these available to the browser (this is safe for cloud name and preset name)
- The upload preset name must match what you created in Cloudinary dashboard
- If `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` is not set, it defaults to `hamere-trufat-unsigned`

### Step 3: Restart Admin Panel

After updating `.env`, restart your Next.js dev server:

```bash
cd admin
npm run dev
```

## How It Works

### Before (Signed Uploads - ❌ Insecure)
```
Frontend → Backend (get signature with API key) → Frontend (uses API key) → Cloudinary
```
**Problem**: API key was exposed to the browser

### After (Unsigned Uploads - ✅ Secure)
```
Frontend → Cloudinary (using upload preset)
```
**Solution**: No API keys needed, preset handles security

## Security Benefits

1. **No API Key Exposure**: API keys never leave the backend
2. **Preset-Based Security**: Upload restrictions configured in Cloudinary dashboard
3. **No Backend Dependency**: Uploads happen directly from frontend (faster)
4. **Configurable Limits**: File size, format, and folder restrictions in preset

## Troubleshooting

### Error: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured"
- **Fix**: Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dwngllfd4` to `admin/.env`

### Error: "Invalid upload preset"
- **Fix**: 
  1. Verify preset name in Cloudinary dashboard
  2. Ensure preset is set to "Unsigned" mode
  3. Check `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` in `.env` matches preset name

### Error: "Upload failed with status 401"
- **Fix**: 
  1. Check preset is set to "Unsigned" (not "Signed")
  2. Verify cloud name is correct
  3. Ensure preset is active in Cloudinary dashboard

### Uploads work but files go to wrong folder
- **Fix**: 
  1. Check folder parameter in upload call
  2. Verify preset's default folder setting
  3. Folder can be overridden per-upload

## Migration Notes

- ✅ **No breaking changes** - Function interface remains the same
- ✅ **Backend signature endpoint** - Can be removed (no longer needed)
- ✅ **Existing code** - Works without changes
- ⚠️ **Environment variables** - Must be added to `admin/.env`

## Testing

After setup, test the upload:

1. Open admin panel
2. Navigate to News/Articles creation
3. Click "Upload" in image section
4. Select an image file
5. Upload should work without errors

The upload will go directly to Cloudinary using the unsigned preset.

