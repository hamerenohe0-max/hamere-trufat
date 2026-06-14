# 🚀 Hamere Trufat - Complete Installation Guide

Complete step-by-step guide to install and set up the Hamere Trufat platform on your local machine.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Backend Setup](#backend-setup)
4. [Admin Panel Setup](#admin-panel-setup)
5. [Mobile App Setup](#mobile-app-setup)
6. [Environment Configuration](#environment-configuration)
7. [Starting the Services](#starting-the-services)
8. [Verification](#verification)
9. [Troubleshooting](#troubleshooting)
10. [Next Steps](#next-steps)

---

## 📦 Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version` (should show v18+)
   - Includes npm automatically

2. **Git** (for version control)
   - Download: https://git-scm.com/
   - Verify: `git --version`

3. **MongoDB** (choose one):
   - **Option A: MongoDB Atlas (Cloud - Recommended)**
     - Sign up: https://www.mongodb.com/cloud/atlas
     - Free tier available
     - No local installation needed
   - **Option B: Local MongoDB**
     - Download: https://www.mongodb.com/try/download/community
     - Install and start MongoDB service

### Optional (for full features)

- **Cloudinary Account** (for media uploads)
  - Sign up: https://cloudinary.com/
  - Free tier: 25GB storage, 25GB bandwidth
- **Expo Account** (for mobile app)
  - Sign up: https://expo.dev
  - Free, not required for local development

---

## 🔧 Initial Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/hamerenohe0-max/hamere-trufat.git
cd hamere-trufat
```

### Step 2: Install Dependencies

Install dependencies for all three services:

```bash
# Backend
cd backend
npm install
cd ..

# Admin Panel
cd admin
npm install
cd ..

# Mobile App
cd mobile-app
npm install --legacy-peer-deps
cd ..
```

**Note:** Mobile app uses `--legacy-peer-deps` to resolve React version conflicts.

---

## 🔐 Environment Configuration

### Step 1: Backend Environment Variables

Create `backend/.env` file:

```env
# JWT Configuration
JWT_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=4000
CORS_ORIGIN=http://localhost:3000,http://localhost:19006,http://YOUR_IP_ADDRESS:4000,exp://YOUR_IP_ADDRESS:19000,exp://YOUR_IP_ADDRESS:8081

# Supabase Configuration
SUPABASE_URL=https://obcvkqtgdhohkrjdhdmk.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# MongoDB Configuration (if using MongoDB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hamere-trufat?retryWrites=true&w=majority

# Cloudinary Configuration (Optional - for media uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
# OR use single URL format:
# CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

**Important:** Replace `YOUR_IP_ADDRESS` with your local machine's IP address (see [Finding Your IP Address](#finding-your-ip-address)).

**Note:** Cloudinary is optional. Backend will start without it, but media uploads will be disabled.

### Step 2: Admin Panel Environment Variables

Create `admin/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### Step 3: Mobile App Environment Variables

Create `mobile-app/.env` file:

```env
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:4000/api/v1
EXPO_PUBLIC_USE_MOCK_DATA=false
```

**Critical:** Replace `YOUR_IP_ADDRESS` with your local machine's IP address. **Do NOT use `localhost`** - mobile devices need the actual IP address.

---

## 🔍 Finding Your IP Address

### Windows

```powershell
ipconfig
```

Look for **IPv4 Address** under your active network adapter (usually `192.168.x.x` or `10.x.x.x`).

**Avoid:** Virtual network adapters like:
- `192.168.56.1` (VirtualBox)
- `192.168.64.1` (Docker/Hyper-V)
- `192.168.11.1` (Other virtual adapters)

Use the IP address from your **main network connection** (Wi-Fi or Ethernet).

### macOS/Linux

```bash
ifconfig
# or
ip addr show
```

Look for your main network interface (usually `en0` on macOS, `eth0` or `wlan0` on Linux).

---

## 🗄️ Backend Setup

### Step 1: Configure Database

#### Option A: MongoDB Atlas (Recommended)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Create database user (username/password)
4. Configure Network Access:
   - Go to "Network Access" in Atlas
   - Add IP Address: `0.0.0.0/0` (for development) or your specific IP
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/hamere-trufat?retryWrites=true&w=majority
   ```
6. Add to `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hamere-trufat?retryWrites=true&w=majority
   ```

#### Option B: Local MongoDB

1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS (Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```
3. Add to `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hamere-trufat
   ```

### Step 2: Configure Supabase

1. Get your Supabase credentials from your Supabase project dashboard
2. Add to `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Step 3: Configure Cloudinary (Optional)

1. Sign up at https://cloudinary.com/
2. Go to Dashboard → Account Details
3. Copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret** (click "Reveal")
4. Add to `backend/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

**Note:** Backend will start without Cloudinary, but media uploads will be disabled.

### Step 4: Create Admin User

After backend is running, create an admin user:

```bash
cd backend
node scripts/create-admin.js "admin@hamere-trufat.com" "Admin123!" "Admin User"
```

Or register via API:

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@hamere-trufat.com",
    "password": "Admin123!",
    "role": "admin"
  }'
```

---

## 🖥️ Admin Panel Setup

### Step 1: Configure Environment

Create `admin/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### Step 2: Verify Setup

The admin panel is ready to use. No additional configuration needed.

---

## 📱 Mobile App Setup

### Step 1: Configure Environment

Create `mobile-app/.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:4000/api/v1
EXPO_PUBLIC_USE_MOCK_DATA=false
```

**Critical:** 
- Replace `YOUR_IP_ADDRESS` with your actual IP (not `localhost`)
- Ensure mobile device and computer are on the same Wi-Fi network

### Step 2: Install Expo Go (for Physical Device)

**iOS:**
- Download from App Store: https://apps.apple.com/app/expo-go/id982107779

**Android:**
- Download from Play Store: https://play.google.com/store/apps/details?id=host.exp.exponent

### Step 3: Verify Network Connectivity

From your mobile device browser, navigate to:
```
http://YOUR_IP_ADDRESS:4000/api/v1/news
```

You should see a JSON response. If not, check:
- Backend is running
- IP address is correct
- Device and computer are on same network
- Firewall allows connections on port 4000

---

## 🚀 Starting the Services

### Option 1: Automated Start (Windows)

```powershell
.\start-system.ps1
```

This opens 3 separate PowerShell windows, one for each service.

### Option 2: Manual Start

Open **3 separate terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Admin Panel:**
```bash
cd admin
npm run dev
```

**Terminal 3 - Mobile App:**
```bash
cd mobile-app
npm start
```

### Option 3: Using npm scripts (if available)

```bash
# From project root
npm run start:backend
npm run start:admin
npm run start:mobile
```

---

## ✅ Verification

### Backend Verification

1. **Check if backend is running:**
   ```bash
   curl http://localhost:4000/api/v1
   ```
   Should return: `Hello World!`

2. **Test news endpoint:**
   ```bash
   curl http://localhost:4000/api/v1/news
   ```
   Should return JSON with news items.

3. **Check backend logs:**
   - Should see: `Application is running on: http://0.0.0.0:4000/api/v1`
   - No error messages about missing configuration

### Admin Panel Verification

1. **Open browser:**
   ```
   http://localhost:3000
   ```
2. **Should see:**
   - Login page or dashboard
   - No console errors
   - Can register/login

### Mobile App Verification

1. **Start Expo:**
   ```bash
   cd mobile-app
   npm start
   ```

2. **Options:**
   - **Web:** Press `w` in terminal
   - **Physical Device:** Scan QR code with Expo Go app
   - **Emulator:** Press `a` (Android) or `i` (iOS)

3. **Verify data loads:**
   - News articles appear
   - No network errors in console
   - Data refreshes correctly

---

## 🔧 Troubleshooting

### Backend Won't Start

**Issue:** Backend fails to start

**Solutions:**
1. Check MongoDB connection:
   ```bash
   # Test MongoDB connection string
   mongosh "your-connection-string"
   ```

2. Verify environment variables:
   ```bash
   # Check .env file exists and has required values
   cat backend/.env
   ```

3. Check for port conflicts:
   ```bash
   # Windows
   netstat -ano | findstr :4000
   
   # macOS/Linux
   lsof -i :4000
   ```

4. Check Cloudinary (if using):
   - Verify credentials are correct
   - Backend will start without Cloudinary (media uploads disabled)

### Admin Panel "Failed to fetch"

**Issue:** Admin panel can't connect to backend

**Solutions:**
1. Ensure backend is running on port 4000
2. Check `NEXT_PUBLIC_API_URL` in `admin/.env.local`
3. Verify CORS settings in backend `.env`
4. Check browser console for detailed errors

### Mobile App Can't Fetch Data

**Issue:** Mobile app shows empty data or errors

**Solutions:**
1. **Verify IP Address:**
   ```bash
   # Check mobile-app/.env has correct IP
   cat mobile-app/.env
   ```

2. **Test Connectivity:**
   - From mobile device browser: `http://YOUR_IP:4000/api/v1/news`
   - Should see JSON response

3. **Check CORS:**
   - Verify backend CORS includes mobile app IP
   - Check backend logs for CORS errors

4. **Clear Expo Cache:**
   ```bash
   cd mobile-app
   npx expo start --clear
   ```

5. **Check Network:**
   - Ensure device and computer on same Wi-Fi
   - Check firewall allows port 4000
   - Try disabling VPN if active

6. **Check Console Logs:**
   - Open React Native Debugger
   - Look for detailed error messages
   - Check network request failures

### Port Already in Use

**Issue:** Port 4000 or 3000 already in use

**Solutions:**
1. **Find process using port:**
   ```bash
   # Windows
   netstat -ano | findstr :4000
   
   # macOS/Linux
   lsof -i :4000
   ```

2. **Kill process or change port:**
   - Kill the process, or
   - Change port in `.env` file

### Module Not Found

**Issue:** `Module not found` errors

**Solutions:**
```bash
# Delete node_modules and reinstall
cd [backend|admin|mobile-app]
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Connection Error

**Issue:** Backend can't connect to MongoDB

**Solutions:**
1. **Check connection string:**
   - Verify username/password are correct
   - Check cluster is not paused
   - Verify network access (IP whitelist)

2. **Test connection:**
   ```bash
   mongosh "your-connection-string"
   ```

3. **Check MongoDB service:**
   ```bash
   # If using local MongoDB
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl status mongod
   ```

---

## 📝 Next Steps

After successful installation:

1. **Create Admin User:**
   ```bash
   cd backend
   node scripts/create-admin.js "admin@example.com" "Password123!" "Admin Name"
   ```

2. **Access Admin Panel:**
   - Open: http://localhost:3000
   - Login with admin credentials

3. **Test Mobile App:**
   - Start Expo: `cd mobile-app && npm start`
   - Scan QR code with Expo Go
   - Verify data loads correctly

4. **Configure Cloudinary (Optional):**
   - Add credentials to `backend/.env`
   - Restart backend
   - Test media uploads

5. **Read Documentation:**
   - `MOBILE_APP_API_FETCHING_ISSUES.md` - API connectivity troubleshooting
   - `FIXES_APPLIED.md` - Recent fixes and improvements
   - `docs/DATABASE-SCHEMA.md` - Database structure
   - `docs/AUTH-FLOW.md` - Authentication flow

---

## 🌐 Access Points

Once everything is running:

- **Backend API:** http://localhost:4000/api/v1
- **Admin Panel:** http://localhost:3000
- **Mobile App:** 
  - Web: Press `w` in Expo terminal
  - Device: Scan QR code with Expo Go
  - Emulator: Press `a` (Android) or `i` (iOS)

---

## 📚 Additional Resources

- **Local Development:** See `RUN-LOCALLY.md`
- **Deployment:** See `DEPLOY.md`
- **Architecture:** See `docs/phase-2-architecture.md`
- **Testing:** See `docs/testing-guide.md`
- **MongoDB Troubleshooting:** See `MONGODB-TROUBLESHOOTING.md`

---

## 🆘 Getting Help

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review error logs in terminal/console
3. Check documentation files in `docs/` directory
4. Verify all environment variables are set correctly
5. Ensure all services are running and accessible

---

## ✅ Installation Checklist

- [ ] Node.js v18+ installed
- [ ] Git installed
- [ ] Repository cloned
- [ ] Dependencies installed (backend, admin, mobile-app)
- [ ] Backend `.env` configured
- [ ] Admin `.env.local` configured
- [ ] Mobile app `.env` configured with correct IP
- [ ] MongoDB configured (Atlas or local)
- [ ] Supabase credentials added
- [ ] Cloudinary configured (optional)
- [ ] Backend running successfully
- [ ] Admin panel accessible
- [ ] Mobile app connects to backend
- [ ] Admin user created
- [ ] Data loads in mobile app

---

*Installation Guide - Last Updated: 2025-12-26*
*For the latest updates, check the repository: https://github.com/hamerenohe0-max/hamere-trufat*

