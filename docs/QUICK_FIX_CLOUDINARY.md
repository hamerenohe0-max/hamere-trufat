# Quick Fix: Cloudinary Configuration Error

## Current Error
```
CLOUDINARY_API_SECRET is not configured
```

## Solution

### Step 1: Get Your Cloudinary Credentials

1. Go to https://console.cloudinary.com/
2. Login to your account
3. Copy these three values from your dashboard:
   - **Cloud Name** (e.g., `my-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz1234567890`)

### Step 2: Add to backend/.env

Open `backend/.env` and add these lines (replace with your actual values):

```env
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name-here
CLOUDINARY_API_KEY=your-actual-api-key-here
CLOUDINARY_API_SECRET=your-actual-api-secret-here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=my-awesome-cloud
CLOUDINARY_API_KEY=987654321098765
CLOUDINARY_API_SECRET=xyz123abc456def789ghi012jkl345mno678pqr
```

### Step 3: Restart Backend Server

After adding the variables:

1. **Stop the backend server** (press `Ctrl+C` in the terminal)
2. **Restart it**:
   ```bash
   cd backend
   npm run start:dev
   ```

### Step 4: Test

Try uploading an image from the admin panel again. The error should be resolved.

## Important Notes

- ✅ The `.env` file is already created
- ✅ Placeholder values have been added
- ⚠️ **You must replace the placeholder values with your actual Cloudinary credentials**
- ⚠️ **Restart the backend server after making changes**

## Still Having Issues?

1. **Check variable names**: Must be exactly `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
2. **Check for typos**: No extra spaces, correct spelling
3. **Verify credentials**: Make sure you copied the correct values from Cloudinary dashboard
4. **Check backend logs**: Look for any error messages when the server starts

