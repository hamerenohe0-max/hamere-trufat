# Cloudinary Setup Guide

## Error: CLOUDINARY_API_SECRET is not configured

This error means the Cloudinary environment variables are missing or not set in `backend/.env`.

## Quick Fix

Add these three lines to your `backend/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
```

## How to Get Cloudinary Credentials

1. **Sign up/Login to Cloudinary**: https://cloudinary.com/
2. **Go to Dashboard**: https://console.cloudinary.com/
3. **Copy your credentials** from the dashboard:
   - **Cloud Name**: Found at the top of the dashboard
   - **API Key**: Found in "Account Details" or "Settings"
   - **API Secret**: Found in "Account Details" or "Settings" (click "Reveal" to show it)

## Example .env Configuration

```env
# ... other variables ...

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=my-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz1234567890
```

## After Adding Variables

1. **Restart the backend server**:
   ```bash
   cd backend
   # Stop current server (Ctrl+C)
   npm run start:dev
   ```

2. **Verify the endpoint works**:
   - Try uploading an image from the admin panel
   - Check backend logs for any errors

## Security Note

⚠️ **Never commit `.env` files to git!** The `.env` file should be in `.gitignore`.

## Troubleshooting

### Still getting "not configured" error?
- Make sure the variable names are **exactly** as shown (case-sensitive)
- Make sure there are **no spaces** around the `=` sign
- Make sure there are **no quotes** around the values (unless the value itself contains spaces)
- **Restart the backend server** after making changes

### Getting "Invalid signature" from Cloudinary?
- Double-check your API Secret is correct
- Make sure you copied the full secret (they're usually long strings)
- Verify the Cloud Name matches your dashboard
