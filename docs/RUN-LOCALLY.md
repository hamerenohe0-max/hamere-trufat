# 🚀 Run Locally

Complete guide to run the Hamere Trufat platform on your local machine.

## 📋 Prerequisites

- **Node.js** v18+ - [Download](https://nodejs.org)
- **Supabase** - [Create a free project](https://supabase.com) (PostgreSQL database with auth, storage, and real-time APIs)
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
SUPABASE_URL=https://obcvkqtgdhohkrjdhdmk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iY3ZrcXRnZGhvaGtyamRoZG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODI2MTksImV4cCI6MjA4MTk1ODYxOX0.EJ2D1N5L2bGj1N_qyiL2g6LaHBleqgZEx3Sc2J-p6TE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iY3ZrcXRnZGhvaGtyamRoZG1rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM4MjYxOSwiZXhwIjoyMDgxOTU4NjE5fQ.D6TPH3i32zJujLoSegpMIFwtnKjZpRAJ60CqDFbJ5_M
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

### 3. Set Up Supabase

1. Create a free project at https://supabase.com
2. Copy your project's `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from the Supabase dashboard (Settings → API)
3. Add them to `backend/.env` as shown above

> No local database server needed — Supabase runs in the cloud. The SQL schema is applied automatically via migrations.

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

### Supabase Connection Error
- Verify `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are set in `backend/.env`
- Check your Supabase project is active at https://supabase.com
- Ensure the project's IP restrictions (if any) allow your connection

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

