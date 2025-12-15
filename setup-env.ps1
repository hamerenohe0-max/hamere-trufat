# Quick Environment Setup Script
# Creates basic .env files if they don't exist

Write-Host "🔧 Setting up environment files..." -ForegroundColor Cyan
Write-Host ""

# Backend .env
$backendEnv = "backend\.env"
if (!(Test-Path $backendEnv)) {
    Write-Host "Creating backend/.env..." -ForegroundColor Yellow
    @"
MONGODB_URI=mongodb://localhost:27017/hamere-trufat
JWT_SECRET=dev-secret-key-change-in-production-$(Get-Random)
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production-$(Get-Random)
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=4000
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
"@ | Out-File -FilePath $backendEnv -Encoding utf8
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
} else {
    Write-Host "✅ backend/.env already exists" -ForegroundColor Green
}

# Mobile App .env
$mobileEnv = "mobile-app\.env"
if (!(Test-Path $mobileEnv)) {
    Write-Host "Creating mobile-app/.env..." -ForegroundColor Yellow
    @"
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_USE_MOCK_DATA=false
"@ | Out-File -FilePath $mobileEnv -Encoding utf8
    Write-Host "✅ Created mobile-app/.env" -ForegroundColor Green
} else {
    Write-Host "✅ mobile-app/.env already exists" -ForegroundColor Green
}

# Admin .env.local
$adminEnv = "admin\.env.local"
if (!(Test-Path $adminEnv)) {
    Write-Host "Creating admin/.env.local..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
"@ | Out-File -FilePath $adminEnv -Encoding utf8
    Write-Host "✅ Created admin/.env.local" -ForegroundColor Green
} else {
    Write-Host "✅ admin/.env.local already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Make sure MongoDB is running (or use MongoDB Atlas)" -ForegroundColor White
Write-Host "   2. Install dependencies: npm install (in each directory)" -ForegroundColor White
Write-Host "   3. Run: .\start-system.ps1" -ForegroundColor White
Write-Host ""

