# 📋 Project Requirements Checklist

Complete list of everything needed to run the Hamere Trufat platform.

## ✅ Prerequisites (Must Have)

### 1. Software Installation

- [ ] **Node.js** v18 or higher
  - Download: https://nodejs.org
  - Verify: `node --version` (should show v18+)
  - Includes npm automatically

- [ ] **Git** (for version control)
  - Download: https://git-scm.com
  - Verify: `git --version`

- [ ] **Supabase** (PostgreSQL database)
   - Sign up: https://supabase.com
   - Free tier: 500MB database, 2GB storage
   - No local installation needed
   - Provides database, auth, and file storage

### 2. Accounts (Optional - for full features)

- [ ] **Supabase Account** (free - required for database)
- [ ] **Expo Account** (for mobile app - free)
  - Sign up: https://expo.dev
  - Not required for local development

## 🔧 Setup Steps

### Step 1: Install Dependencies

Run in each directory:

```powershell
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

### Step 2: Environment Configuration

Create/update these files:

#### `backend/.env`
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=4000
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
```

#### `admin/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

#### `mobile-app/.env`
```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_USE_MOCK_DATA=false
```

> **Tip**: Run `.\setup-env.ps1` to auto-create these files (Windows)

### Step 3: Run Database Migrations

1. [ ] Ensure Supabase credentials are set in `backend/.env`
2. [ ] Run migrations:
   ```powershell
   cd backend
   npm run migrate
   ```
3. [ ] Verify tables are created in Supabase dashboard (Table Editor)

### Step 4: Create Admin User

After backend is running:

```powershell
node scripts/create-admin.js "admin@hamere-trufat.com" "Admin123!" "Admin User"
```

Or register via API:
```powershell
curl -X POST http://localhost:4000/api/v1/auth/register -H "Content-Type: application/json" -d '{"name":"Admin User","email":"admin@hamere-trufat.com","password":"Admin123!","role":"admin"}'
```

## ▶️ Running the Project

### Option 1: Automated Start (Windows)

```powershell
.\start-system.ps1
```

This opens 3 PowerShell windows, one for each service.

### Option 2: Manual Start

Open **3 separate terminal windows**:

**Terminal 1 - Backend:**
```powershell
cd backend
npm run start:dev
```

**Terminal 2 - Admin Panel:**
```powershell
cd admin
npm run dev
```

**Terminal 3 - Mobile App:**
```powershell
cd mobile-app
npm start
```

## 🌐 Access Points

Once running, access at:

- **Backend API**: http://localhost:4000/api/v1
- **Admin Panel**: http://localhost:3000
- **Mobile App**: 
  - Web: Press `w` in Expo terminal
  - Phone: Scan QR code with Expo Go app
  - Emulator: Press `a` (Android) or `i` (iOS)

## 📱 Mobile App Setup (Optional)

### For Physical Device:

1. [ ] Install **Expo Go** app on your phone
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
2. [ ] Ensure phone and computer are on same WiFi network
3. [ ] Scan QR code from mobile-app terminal

### For Web Browser:

- Press `w` in the mobile-app terminal
- Opens in browser automatically

### For Emulators:

- **Android**: Requires Android Studio
- **iOS**: Requires Xcode (Mac only)

## 🔍 Verification Checklist

### Backend
- [ ] Visit http://localhost:4000/api/v1
- [ ] Should see API response (not error)
- [ ] No database connection errors in terminal

### Admin Panel
- [ ] Visit http://localhost:3000
- [ ] Should see login page
- [ ] Can register/login with admin credentials

### Mobile App
- [ ] Terminal shows QR code
- [ ] Can open in web browser (press `w`)
- [ ] Can connect to backend API

## 🆘 Common Issues & Solutions

### Port Already in Use
- **Solution**: Change port in `.env` file or stop the service using that port

### Supabase Connection Error
- **Solution**: 
  - Verify `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env`
  - Check Supabase project is active (not paused) in dashboard
  - Regenerate keys if they were rotated

### Module Not Found
- **Solution**: 
  ```powershell
  cd [backend|admin|mobile-app]
  rm -rf node_modules package-lock.json
  npm install
  ```

### Backend Won't Start
- **Solution**: 
  - Check Supabase connection (verify credentials)
  - Verify `.env` file exists and has correct values
  - Check terminal for error messages

### Admin Panel "Failed to fetch"
- **Solution**: 
  - Ensure backend is running on port 4000
  - Check `NEXT_PUBLIC_API_URL` in `admin/.env.local`
  - Verify CORS settings in backend

## 📦 Project Structure

```
hamere-trufat/
├── backend/          # NestJS API (port 4000)
├── admin/            # Next.js Admin Panel (port 3000)
├── mobile-app/       # React Native App (Expo)
├── scripts/          # Utility scripts
├── docs/             # Documentation
└── README.md         # Main documentation
```

## 🎯 Quick Start Summary

1. ✅ Install Node.js v18+
2. ✅ Install Git
3. ✅ Set up Supabase (free account)
4. ✅ Install dependencies: `npm install` in each directory
5. ✅ Create `.env` files (use `setup-env.ps1`)
6. ✅ Configure Supabase credentials
7. ✅ Start all services (use `start-system.ps1` or manual)
8. ✅ Create admin user
9. ✅ Access admin panel at http://localhost:3000

## 📚 Additional Resources

- **Local Development**: See `RUN-LOCALLY.md`
- **Deployment**: See `DEPLOY.md`
- **Supabase Troubleshooting**: See `SUPABASE-TROUBLESHOOTING.md`
- **Architecture**: See `docs/phase-2-architecture.md`

