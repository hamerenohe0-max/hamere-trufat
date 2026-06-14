# Simple script to verify tests can run locally

Write-Host "🧪 Testing Setup Verification" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Check Backend
Write-Host "📦 Checking Backend Tests..." -ForegroundColor Yellow
Set-Location backend

if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    
    # Try to run a simple test
    Write-Host "Running test..." -ForegroundColor Gray
    $backendTest = npm test -- src/app.controller.spec.ts --silent 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend tests are working!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend tests may need attention" -ForegroundColor Yellow
        Write-Host "Run 'npm test' in backend directory to see details" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Dependencies not installed. Run 'npm install' first" -ForegroundColor Red
}

Set-Location ..

Write-Host ""

# Check Mobile App
Write-Host "📱 Checking Mobile App Tests..." -ForegroundColor Yellow
Set-Location mobile-app

if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    
    # Try to run a simple test
    Write-Host "Running test..." -ForegroundColor Gray
    $mobileTest = npm test -- --passWithNoTests --silent 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Mobile app tests are working!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Mobile app tests may need attention" -ForegroundColor Yellow
        Write-Host "Run 'npm test' in mobile-app directory to see details" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Dependencies not installed. Run 'npm install' first" -ForegroundColor Red
}

Set-Location ..

Write-Host ""
Write-Host "📝 To run tests:" -ForegroundColor Cyan
Write-Host "   Backend:    cd backend && npm test" -ForegroundColor White
Write-Host "   Mobile App: cd mobile-app && npm test" -ForegroundColor White
Write-Host ""
Write-Host "📚 See RUN-TESTS-LOCALLY.md for detailed instructions" -ForegroundColor Cyan

