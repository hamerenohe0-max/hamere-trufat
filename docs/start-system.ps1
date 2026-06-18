# Hamere Trufat - System Startup Script
# This script helps you start all three parts of the system

Write-Host "🚀 Hamere Trufat - System Startup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check backend config
Write-Host ""
Write-Host "📦 Starting Backend Server..." -ForegroundColor Yellow
Write-Host "   (This will open in a new window)" -ForegroundColor Gray

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Starting Backend...' -ForegroundColor Cyan; npm run start:dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🖥️  Starting Admin Panel..." -ForegroundColor Yellow
Write-Host "   (This will open in a new window)" -ForegroundColor Gray

# Start admin in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\admin'; Write-Host 'Starting Admin Panel...' -ForegroundColor Cyan; npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "📱 Starting Mobile App..." -ForegroundColor Yellow
Write-Host "   (This will open in a new window)" -ForegroundColor Gray

# Start mobile app in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\mobile-app'; Write-Host 'Starting Mobile App...' -ForegroundColor Cyan; npm start"

Write-Host ""
Write-Host "✅ All services starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access Points:" -ForegroundColor Cyan
Write-Host "   Backend API:    http://localhost:4000" -ForegroundColor White
Write-Host "   Admin Panel:    http://localhost:3000" -ForegroundColor White
Write-Host "   Mobile App:     Check the Expo terminal for QR code" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Wait a few seconds for services to start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 First time? Make sure to:" -ForegroundColor Yellow
Write-Host "   1. Install dependencies: npm install (in each directory)" -ForegroundColor Gray
Write-Host "   2. Create .env files (see RUN-SYSTEM-LOCALLY.md)" -ForegroundColor Gray
Write-Host "   3. Set up Supabase (see RUN-SYSTEM-LOCALLY.md)" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this window (services will keep running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

