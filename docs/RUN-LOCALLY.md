# 🚀 Run Locally

Complete guide to run the Hamere Trufat platform on your local machine.

## 📋 Prerequisites

- **Node.js** v18+ - [Download](https://nodejs.org)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud option)
- **Git** - [Download](https://git-scm.com)

## 🔧 Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Admin Panel
cd ../admin
npm install

# Mobile App
cd ../mobile-app
npm install
```

### 2. Environment Configuration

#### Backend (`backend/.env`)

```env
MONGODB_URI=mongodb://localhost:27017/hamere-trufat
JWT_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=4000
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
```

#### Admin Panel (`admin/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

#### Mobile App (`mobile-app/.env`)

```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_USE_MOCK_DATA=false
```

> **Tip**: Use the `setup-env.ps1` script to automatically create these files.

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows: MongoDB should start as a service automatically
# Or start manually: net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env`

## ▶️ Running the System

### Option 1: Automated Start (Recommended)

```powershell
.\start-system.ps1
```

This script starts all three services in separate windows.

### Option 2: Manual Start

Open three terminal windows:

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

## 🌐 Access Points

Once running, access the system at:

- **Backend API**: http://localhost:4000/api/v1
- **Admin Panel**: http://localhost:3000
- **Mobile App Web**: Press `w` in the Expo terminal, or scan QR code with Expo Go app

## 📱 Mobile App Options

### On Your Phone
1. Install [Expo Go](https://expo.dev/client) app
2. Ensure phone and computer are on the same WiFi
3. Scan QR code from the mobile-app terminal

### Web Browser
Press `w` in the Expo terminal to open in browser

### Emulators
- **Android**: Press `a` (requires Android Studio)
- **iOS**: Press `i` (Mac only, requires Xcode)

## 🔍 Verification

### Backend
- Visit: http://localhost:4000/api/v1
- Should see API response

### Admin Panel
- Visit: http://localhost:3000
- Should see login page
- Register first admin user if needed

### Mobile App
- QR code visible in terminal
- Or press `w` for web version

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Change port in .env file
PORT=4001  # for backend
# Or stop the service using that port
```

### MongoDB Connection Error
- Verify MongoDB is running: `mongod --version`
- Check connection string in `backend/.env`
- For Atlas: Ensure IP whitelist includes `0.0.0.0/0`

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Mobile App Can't Connect to Backend
- Ensure backend is running first
- For physical device: Use computer's IP address instead of `localhost`
  - Find IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
  - Update: `EXPO_PUBLIC_API_URL=http://YOUR_IP:4000/api/v1`

## 📚 Additional Resources

- **Testing**: See `docs/testing-guide.md`
- **Architecture**: See `docs/phase-2-architecture.md`
- **Deployment**: See `DEPLOY.md`

