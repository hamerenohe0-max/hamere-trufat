# Fix: Invalid api_key Error

## Current Error
```
Invalid api_key your-api-key-here
```

This means the placeholder values in `backend/.env` haven't been replaced with your actual Cloudinary credentials.

## Solution

### Step 1: Get Your Real Cloudinary Credentials

1. **Go to**: https://console.cloudinary.com/
2. **Login** to your account
3. **Navigate to**: Settings → Account Details (or click your account name)
4. **Copy these values**:
   - **API Key**: A long number (e.g., `987654321098765`)
   - **API Secret**: A long string (e.g., `xyz123abc456def789ghi012jkl345mno678pqr`)

### Step 2: Update backend/.env

**Open** `backend/.env` in a text editor.

**Find these lines:**
```env
CLOUDINARY_CLOUD_NAME=dwngllfd4
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**Replace with your ACTUAL values:**
```env
CLOUDINARY_CLOUD_NAME=dwngllfd4
CLOUDINARY_API_KEY=987654321098765
CLOUDINARY_API_SECRET=xyz123abc456def789ghi012jkl345mno678pqr
```

**Important:**
- ❌ Don't keep `your-api-key-here` or `your-api-secret-here`
- ✅ Use your actual values from Cloudinary dashboard
- ✅ No quotes around the values
- ✅ No spaces around the `=` sign

### Step 3: Restart Backend Server

**After saving the file:**

1. **Stop the backend server** (if running):
   - Find the terminal where backend is running
   - Press `Ctrl+C`

2. **Restart the backend**:
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Verify it started**:
   - Look for: `Application is running on: http://0.0.0.0:4000/api/v1`
   - Check for any Cloudinary configuration errors

### Step 4: Test Upload

Try uploading an image from the admin panel again. The error should be resolved.

## Example of Correct Configuration

Your `backend/.env` should look like this (with YOUR actual values):

```env
# Other variables...
PORT=4000
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
SUPABASE_URL=https://obcvkqtgdhohkrjdhdmk.supabase.co
# ... other variables ...

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dwngllfd4
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz1234567890
```

## Common Mistakes

❌ **Wrong:**
```env
CLOUDINARY_API_KEY="your-api-key-here"  # Has quotes
CLOUDINARY_API_KEY = your-api-key-here  # Has spaces
CLOUDINARY_API_KEY=your-api-key-here    # Still placeholder
```

✅ **Correct:**
```env
CLOUDINARY_API_KEY=123456789012345  # Actual value, no quotes, no spaces
```

## Still Getting Errors?

1. **Double-check** you copied the correct values from Cloudinary dashboard
2. **Verify** there are no extra spaces or quotes
3. **Make sure** you restarted the backend server after changes
4. **Check** backend logs for any configuration errors

## Security Reminder

⚠️ **Never commit `.env` files to git!**  
⚠️ **Never share your API Secret publicly!**  
⚠️ **The API Secret should only exist in `backend/.env`!**

