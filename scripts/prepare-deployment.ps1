# Prepare Deployment Script
# This script prepares everything for deployment

Write-Host "🚀 Preparing for Deployment" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository exists" -ForegroundColor Green
}

# Generate secrets
Write-Host ""
Write-Host "🔐 Generating JWT secrets..." -ForegroundColor Yellow
node scripts/generate-secrets.js

# Build backend
Write-Host ""
Write-Host "📦 Building backend..." -ForegroundColor Yellow
Set-Location backend
if (npm run build) {
    Write-Host "✅ Backend build complete" -ForegroundColor Green
} else {
    Write-Host "❌ Backend build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Build admin
Write-Host ""
Write-Host "🖥️  Building admin panel..." -ForegroundColor Yellow
Set-Location admin
if (npm run build) {
    Write-Host "✅ Admin build complete" -ForegroundColor Green
} else {
    Write-Host "❌ Admin build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "✅ Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Set up accounts (see SETUP-ACCOUNTS.md)" -ForegroundColor White
Write-Host "   2. Create GitHub repository" -ForegroundColor White
Write-Host "   3. Push code to GitHub" -ForegroundColor White
Write-Host "   4. Deploy to Railway (see DEPLOYMENT-QUICK-START.md)" -ForegroundColor White
Write-Host "   5. Deploy to Vercel (see DEPLOYMENT-QUICK-START.md)" -ForegroundColor White
Write-Host ""
Write-Host "📚 See DEPLOYMENT-QUICK-START.md for detailed steps" -ForegroundColor Cyan

