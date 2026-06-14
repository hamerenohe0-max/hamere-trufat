# Quick Start: Fix Cloudinary Configuration Error

## Current Error
```
CLOUDINARY_API_SECRET is not configured
```

## Quick Fix (3 Steps)

### Step 1: Get Your Credentials

Go to https://console.cloudinary.com/ and copy:
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz1234567890`)

### Step 2: Update backend/.env

Open `backend/.env` and replace these lines:

**Find:**
```env
CLOUDINARY_CLOUD_NAME=dwngllfd4
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**Replace with your actual values:**
```env
CLOUDINARY_CLOUD_NAME=dwngllfd4
CLOUDINARY_API_KEY=YOUR_ACTUAL_API_KEY
CLOUDINARY_API_SECRET=YOUR_ACTUAL_API_SECRET
```

### Step 3: Restart Backend

1. **Stop backend** (Ctrl+C)
2. **Restart**: `cd backend && npm run start:dev`

✅ Done! Try uploading an image again.

## Important Notes

- ⚠️ **Replace the placeholder values** - Don't leave `your-api-key-here`
- ⚠️ **Restart the server** - Environment variables load on startup
- ✅ **Cloud name is already set** to `dwngllfd4`

## Still Having Issues?

Check that:
- ✅ Variable names are exact: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- ✅ No extra spaces around `=`
- ✅ No quotes around values
- ✅ Backend server was restarted after changes

