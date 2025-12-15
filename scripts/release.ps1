# Release Script - Builds and prepares all apps for production

Write-Host "🚀 Starting Release Process" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if production env files exist
$backendEnvExists = Test-Path "backend\.env.production"
$adminEnvExists = Test-Path "admin\.env.production.local"
$mobileEnvExists = Test-Path "mobile-app\.env.production"

if (-not $backendEnvExists) {
    Write-Host "⚠️  WARNING: backend/.env.production not found" -ForegroundColor Yellow
    Write-Host "   Copy backend/.env.production.example to backend/.env.production" -ForegroundColor Gray
    Write-Host "   and fill in your production values" -ForegroundColor Gray
    Write-Host ""
}

if (-not $adminEnvExists) {
    Write-Host "⚠️  WARNING: admin/.env.production.local not found" -ForegroundColor Yellow
    Write-Host "   Copy admin/.env.production.example to admin/.env.production.local" -ForegroundColor Gray
    Write-Host "   and fill in your production values" -ForegroundColor Gray
    Write-Host ""
}

# Build Backend
Write-Host "📦 Building Backend..." -ForegroundColor Yellow
Set-Location backend
if (npm run build) {
    Write-Host "✅ Backend build complete" -ForegroundColor Green
    Write-Host "   Output: backend/dist/" -ForegroundColor Gray
} else {
    Write-Host "❌ Backend build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Build Admin
Write-Host ""
Write-Host "🖥️  Building Admin Panel..." -ForegroundColor Yellow
Set-Location admin
if (npm run build) {
    Write-Host "✅ Admin build complete" -ForegroundColor Green
    Write-Host "   Output: admin/.next/" -ForegroundColor Gray
} else {
    Write-Host "❌ Admin build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Mobile App Info
Write-Host ""
Write-Host "📱 Mobile App Build" -ForegroundColor Yellow
Write-Host "   To build mobile app, run:" -ForegroundColor Gray
Write-Host "   cd mobile-app" -ForegroundColor White
Write-Host "   eas build --platform android --profile production" -ForegroundColor White
Write-Host "   eas build --platform ios --profile production" -ForegroundColor White
Write-Host ""

Write-Host "✅ Production builds ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Review RELEASE-GUIDE.md for deployment instructions" -ForegroundColor White
Write-Host "   2. Deploy backend to your hosting provider" -ForegroundColor White
Write-Host "   3. Deploy admin panel to Vercel/Netlify" -ForegroundColor White
Write-Host "   4. Build and submit mobile app to stores" -ForegroundColor White
Write-Host ""
Write-Host "📚 See RELEASE-GUIDE.md for detailed instructions" -ForegroundColor Cyan

