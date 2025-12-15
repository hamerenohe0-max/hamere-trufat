# PowerShell script to run all tests

Write-Host "🧪 Running All Tests for Hamere Trufat" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Backend Tests
Write-Host "📦 Running Backend Tests..." -ForegroundColor Yellow
Set-Location backend
try {
    npm test
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend tests passed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend tests failed!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
} catch {
    Write-Host "❌ Error running backend tests: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ""

# Mobile App Tests
Write-Host "📱 Running Mobile App Tests..." -ForegroundColor Yellow
Set-Location mobile-app
try {
    npm test
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Mobile app tests passed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Mobile app tests failed!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
} catch {
    Write-Host "❌ Error running mobile app tests: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "🎉 All tests completed!" -ForegroundColor Green

