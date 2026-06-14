# Create Cloudinary Upload Preset - Step by Step

## Error: "Upload preset not found"

This error means the upload preset `hamere-trufat-unsigned` doesn't exist in your Cloudinary account yet.

## Solution: Create the Upload Preset

### Step 1: Go to Cloudinary Dashboard

1. **Open**: https://console.cloudinary.com/
2. **Login** with your Cloudinary account
3. **Select** your cloud: `dwngllfd4`

### Step 2: Navigate to Upload Settings

1. Click **Settings** (gear icon) in the top menu
2. Click **Upload** in the left sidebar
3. Scroll down to **"Upload presets"** section

### Step 3: Create New Upload Preset

1. Click **"Add upload preset"** button
2. Fill in the following:

   **Preset name**: `hamere-trufat-unsigned`
   - ⚠️ **Must match exactly** what's in your `.env` file
   - ⚠️ **Case-sensitive** - use lowercase with hyphens

   **Signing mode**: Select **"Unsigned"**
   - ⚠️ **This is critical!** Must be "Unsigned" for frontend uploads

### Step 4: Configure Preset Settings

**General Settings**:
- **Folder**: `hamere-trufat` (optional, can be overridden)
- **Resource type**: `Auto` or `Image`
- **Use filename**: `Yes` (optional)

**Upload Manipulations** (optional):
- **Format**: Leave as `Auto` or specify `jpg, png, gif, webp`
- **Quality**: `Auto` (recommended)

**Access Control**:
- **Access mode**: `Public` (for public images)
- **Moderation**: `None` (unless you want content moderation)

**Upload Restrictions**:
- **Max file size**: `10MB` (or your preference)
- **Allowed formats**: `jpg, png, gif, webp` (or leave empty for all)

### Step 5: Save the Preset

1. Click **"Save"** button at the bottom
2. Wait for confirmation that the preset was created

### Step 6: Verify Preset Exists

1. In the **Upload presets** list, you should see `hamere-trufat-unsigned`
2. Verify it shows **"Unsigned"** in the signing mode column

### Step 7: Test Upload

1. Go back to your admin panel
2. Try uploading an image again
3. The error should be gone

## Alternative: Use a Different Preset Name

If you want to use a different preset name:

1. **Create the preset** in Cloudinary with your preferred name
2. **Update** `admin/.env`:
   ```env
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset-name
   ```
3. **Restart** the admin panel

## Troubleshooting

### Error: "Upload preset not found" (still)
- ✅ Verify preset name matches exactly (case-sensitive)
- ✅ Check preset is set to "Unsigned" mode
- ✅ Ensure preset is saved and active
- ✅ Restart admin panel after creating preset

### Error: "Invalid upload preset"
- ✅ Check preset signing mode is "Unsigned" (not "Signed")
- ✅ Verify you're using the correct cloud account

### Upload works but files go to wrong location
- ✅ Check preset's default folder setting
- ✅ Verify folder parameter in upload call

## Quick Checklist

- [ ] Logged into Cloudinary dashboard
- [ ] Selected cloud: `dwngllfd4`
- [ ] Created preset: `hamere-trufat-unsigned`
- [ ] Set signing mode: **Unsigned**
- [ ] Saved the preset
- [ ] Verified preset appears in list
- [ ] Restarted admin panel (if needed)
- [ ] Tested upload

## Need Help?

If you're still having issues:
1. Check Cloudinary dashboard → Settings → Upload → Upload presets
2. Verify the preset name matches your `.env` file exactly
3. Make sure the preset is set to "Unsigned" mode
4. Try creating a new preset with a different name and update `.env`

