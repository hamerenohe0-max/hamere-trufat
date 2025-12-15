@echo off
echo 🚀 Starting Release Process
echo =========================
echo.

echo 📦 Building Backend...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Backend build failed
    cd ..
    exit /b 1
)
echo ✅ Backend build complete
cd ..

echo.
echo 🖥️  Building Admin Panel...
cd admin
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Admin build failed
    cd ..
    exit /b 1
)
echo ✅ Admin build complete
cd ..

echo.
echo 📱 Mobile App Build
echo    To build mobile app, run:
echo    cd mobile-app
echo    eas build --platform android --profile production
echo    eas build --platform ios --profile production
echo.

echo ✅ Production builds ready!
echo.
echo 📋 Next Steps:
echo    1. Review RELEASE-GUIDE.md for deployment instructions
echo    2. Deploy backend to your hosting provider
echo    3. Deploy admin panel to Vercel/Netlify
echo    4. Build and submit mobile app to stores
echo.
echo 📚 See RELEASE-GUIDE.md for detailed instructions

