# 🚀 Deployment Guide

Complete guide to deploy Hamere Trufat to production using free hosting.

## ✅ What's Already Prepared

- ✅ JWT secrets generated (in `DEPLOYMENT-SECRETS.txt`)
- ✅ Deployment configurations created
- ✅ Git repository initialized
- ✅ All code ready

## 📋 Prerequisites

You need accounts for:
- **MongoDB Atlas** (database) - FREE
- **Railway** (backend hosting) - FREE
- **Vercel** (admin panel) - FREE
- **GitHub** (code repository) - FREE

---

## Step 1: Set Up Accounts (10 minutes)

### MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Create cluster → Choose **FREE** (M0) tier
4. Wait 3-5 minutes for cluster to be ready
5. Click **"Connect"** → **"Connect your application"**
6. Copy connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/...`)
7. Replace `<password>` with your database password
8. **Save this connection string!**

### Railway

1. Go to https://railway.app
2. Sign up with GitHub (one click)
3. Authorize Railway to access your GitHub
4. Done!

### Vercel

1. Go to https://vercel.com
2. Sign up with GitHub (one click)
3. Authorize Vercel
4. Done!

### GitHub

1. Go to https://github.com
2. Create new repository: `hamere-trufat`
3. **DO NOT** initialize with README
4. Copy the repository URL

---

## Step 2: Push Code to GitHub (2 minutes)

```bash
# Commit your files (already staged)
git commit -m "Initial commit - Hamere Trufat platform"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/hamere-trufat.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Verify: Go to your GitHub repository - you should see all your files.

---

## Step 3: Deploy Backend to Railway (5 minutes)

1. Go to https://railway.app
2. Click **"New Project"**
3. Click **"Deploy from GitHub repo"**
4. Select your `hamere-trufat` repository
5. Click **"Add Service"** → **"GitHub Repo"**
6. Select your repo again
7. In the service, click **"Settings"**
8. Set **Root Directory**: `backend`
9. Click **"Variables"** tab
10. Add these environment variables (one by one):

```
NODE_ENV = production
PORT = 4000
MONGODB_URI = your_mongodb_connection_string_from_step_1
JWT_SECRET = 4824a9f889be1bd39e3b4fdb4d7b65db77fd457e990d743002643476c9d7efe0
JWT_REFRESH_SECRET = 0c78fdd0a5e32eb4da08144d6c9f86bfd7a5248f77ff68f66e711a3fdae83128
CORS_ORIGIN = https://your-admin.vercel.app
```

> **Note**: Replace `your_mongodb_connection_string_from_step_1` with your actual MongoDB URI.  
> For `CORS_ORIGIN`, use a placeholder for now - you'll update it after deploying the admin panel.

11. Railway will **automatically deploy**!
12. Wait 2-3 minutes for deployment
13. Click **"Settings"** → **"Generate Domain"**
14. Copy your Railway URL (e.g., `https://hamere-trufat-backend.railway.app`)

---

## Step 4: Deploy Admin Panel to Vercel (5 minutes)

1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your `hamere-trufat` repository
5. Click **"Import"**
6. In **"Configure Project"**:
   - **Root Directory**: Click "Edit" → Type `admin`
   - **Framework Preset**: Next.js (auto-detected)
7. Click **"Environment Variables"**
8. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-railway-url.railway.app/api/v1` (use your Railway URL from Step 3)
9. Click **"Deploy"**
10. Wait 2-3 minutes
11. Copy your Vercel URL (e.g., `https://hamere-trufat-admin.vercel.app`)

---

## Step 5: Update Backend CORS (1 minute)

1. Go back to Railway
2. Click your backend service
3. Click **"Variables"**
4. Find `CORS_ORIGIN`
5. Update value to your Vercel URL (from Step 4)
6. Railway will auto-redeploy

---

## ✅ Deployment Complete!

Your app is now live:
- **Backend API**: `https://your-backend.railway.app`
- **Admin Panel**: `https://your-admin.vercel.app`

### Test Your Deployment

1. **Backend**: Visit `https://your-backend.railway.app/api/v1/health` (should return status)
2. **Admin**: Visit your Vercel URL and try logging in

---

## 📱 Mobile App Configuration

### Update API URL

Edit `mobile-app/app.config.js`:

```javascript
extra: {
  apiUrl: "https://your-railway-url.railway.app/api/v1",
  useMockData: false
}
```

### Build for Production

```bash
cd mobile-app
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

### Submit to Stores

- **Google Play**: Upload AAB file from EAS build
- **Apple App Store**: Use EAS build or Xcode

---

## 🔐 Environment Variables Reference

### Backend (Railway)

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment |
| `PORT` | `4000` | Server port |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB connection string |
| `JWT_SECRET` | `4824a9f...` | JWT signing secret (from `DEPLOYMENT-SECRETS.txt`) |
| `JWT_REFRESH_SECRET` | `0c78fdd...` | JWT refresh secret (from `DEPLOYMENT-SECRETS.txt`) |
| `CORS_ORIGIN` | `https://your-admin.vercel.app` | Admin panel URL |

### Admin Panel (Vercel)

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app/api/v1` | Backend API URL |

### Optional: Cloudinary (for media uploads)

If you want to enable media uploads:

1. Sign up at https://cloudinary.com (free tier)
2. Get your credentials
3. Add to Railway:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

---

## 🆘 Troubleshooting

### Backend won't start

- Check Railway logs for errors
- Verify all environment variables are set
- Ensure MongoDB connection string is correct
- Check that `PORT` is set to `4000`

### Admin panel can't connect to backend

- Verify `NEXT_PUBLIC_API_URL` is correct in Vercel
- Check that backend is running (visit Railway URL)
- Ensure CORS is configured correctly
- Check browser console for errors

### MongoDB connection fails

- Verify connection string format
- Check that IP whitelist allows all IPs (0.0.0.0/0) in MongoDB Atlas
- Ensure password doesn't have special characters (or URL-encode them)

### Railway deployment fails

- Check build logs in Railway dashboard
- Ensure `backend/package.json` has correct scripts
- Verify Node.js version compatibility

### Vercel deployment fails

- Check build logs in Vercel dashboard
- Ensure `admin/package.json` has correct scripts
- Verify Next.js version compatibility

---

## 📝 Quick Reference

### Your Secrets

Located in `DEPLOYMENT-SECRETS.txt`:
- JWT_SECRET: `4824a9f889be1bd39e3b4fdb4d7b65db77fd457e990d743002643476c9d7efe0`
- JWT_REFRESH_SECRET: `0c78fdd0a5e32eb4da08144d6c9f86bfd7a5248f77ff68f66e711a3fdae83128`

**⚠️ DO NOT commit `DEPLOYMENT-SECRETS.txt` to Git!**

### Important URLs

After deployment, save these:
- MongoDB Atlas Dashboard: https://cloud.mongodb.com
- Railway Dashboard: https://railway.app
- Vercel Dashboard: https://vercel.com
- Your Backend URL: `https://your-backend.railway.app`
- Your Admin URL: `https://your-admin.vercel.app`

---

## 🎉 Next Steps

1. **Test your deployment** - Try logging into admin panel
2. **Configure custom domains** (optional) - Add your own domain in Railway/Vercel
3. **Set up monitoring** - Use Railway/Vercel analytics
4. **Build mobile app** - Follow mobile app section above
5. **Submit to app stores** - When mobile app is ready

---

## 📚 Additional Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Expo EAS Docs**: https://docs.expo.dev/build/introduction/

---

**Total deployment time: ~22 minutes** 🚀

