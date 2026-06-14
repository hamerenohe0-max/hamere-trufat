# How to Add Your Cloudinary Credentials

## Current Issue
The `backend/.env` file has placeholder values that need to be replaced with your actual Cloudinary credentials.

## Step-by-Step Instructions

### Step 1: Get Your Cloudinary Credentials

1. **Go to Cloudinary Dashboard**: https://console.cloudinary.com/
2. **Login** to your account
3. **Find your credentials**:
   - **Cloud Name**: `dwngllfd4` (you already have this)
   - **API Key**: Found in "Account Details" or "Settings" section
   - **API Secret**: Found in "Account Details" or "Settings" section (click "Reveal" to show it)

### Step 2: Update backend/.env

Open `backend/.env` and find these lines:

```env
CLOUDINARY_CLOUD_NAME=dwngllfd4
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**Replace** `your-api-key-here` and `your-api-secret-here` with your actual values:

```env
CLOUDINARY_CLOUD_NAME=dwngllfd4
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz1234567890
```

### Step 3: Remove Duplicate Entries

If you see duplicate `CLOUDINARY_*` entries in your `.env` file, **remove the old ones** and keep only one set with the correct values.

### Step 4: Restart Backend Server

**IMPORTANT**: After updating `.env`, you MUST restart the backend server:

1. **Stop the backend server** (press `Ctrl+C` in the terminal where it's running)
2. **Restart it**:
   ```bash
   cd backend
   npm run start:dev
   ```

### Step 5: Verify

After restarting, try uploading an image from the admin panel. The error should be resolved.

## Example .env Configuration

Your `backend/.env` should look like this (with YOUR actual values):

```env
# ... other variables ...

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dwngllfd4
CLOUDINARY_API_KEY=987654321098765
CLOUDINARY_API_SECRET=xyz123abc456def789ghi012jkl345mno678pqr

# ... other variables ...
```

## Troubleshooting

### Still getting "not configured" error?

1. **Check variable names**: Must be exactly:
   - `CLOUDINARY_CLOUD_NAME` (not `CLOUDINARY_CLOUDNAME`)
   - `CLOUDINARY_API_KEY` (not `CLOUDINARY_APIKEY`)
   - `CLOUDINARY_API_SECRET` (not `CLOUDINARY_APISECRET`)

2. **Check for typos**: No extra spaces, correct spelling

3. **Check for quotes**: Don't wrap values in quotes unless necessary
   - ✅ Correct: `CLOUDINARY_CLOUD_NAME=dwngllfd4`
   - ❌ Wrong: `CLOUDINARY_CLOUD_NAME="dwngllfd4"`

4. **Restart the server**: Environment variables are only loaded on startup

5. **Check backend logs**: Look for any configuration errors when the server starts

### Can't find your API credentials?

1. Go to https://console.cloudinary.com/
2. Click on your account name (top right)
3. Select "Settings" or "Account Details"
4. Look for "API Key" and "API Secret" sections
5. Click "Reveal" next to API Secret to show it

## Security Reminder

⚠️ **Never commit `.env` files to git!**  
⚠️ **Never share your API Secret publicly!**  
⚠️ **The API Secret should only exist in `backend/.env` on your server!**

