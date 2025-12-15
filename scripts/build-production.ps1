# Production Build Script
# Builds all three apps for production

Write-Host "🏗️  Building Production Versions" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Backend Build
Write-Host "📦 Building Backend..." -ForegroundColor Yellow
Set-Location backend
if (npm run build) {
    Write-Host "✅ Backend build complete" -ForegroundColor Green
} else {
    Write-Host "❌ Backend build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Admin Build
Write-Host ""
Write-Host "🖥️  Building Admin Panel..." -ForegroundColor Yellow
Set-Location admin
if (npm run build) {
    Write-Host "✅ Admin build complete" -ForegroundColor Green
} else {
    Write-Host "❌ Admin build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Mobile App Build Info
Write-Host ""
Write-Host "📱 Mobile App Build" -ForegroundColor Yellow
Write-Host "   Run these commands to build mobile app:" -ForegroundColor Gray
Write-Host "   cd mobile-app" -ForegroundColor White
Write-Host "   eas build --platform android --profile production" -ForegroundColor White
Write-Host "   eas build --platform ios --profile production" -ForegroundColor White
Write-Host ""

Write-Host "✅ Production builds ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Build Outputs:" -ForegroundColor Cyan
Write-Host "   Backend:  backend/dist/" -ForegroundColor White
Write-Host "   Admin:    admin/.next/" -ForegroundColor White
Write-Host "   Mobile:   Check EAS dashboard" -ForegroundColor White


