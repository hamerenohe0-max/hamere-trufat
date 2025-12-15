# Install Deployment CLI Tools

Write-Host "🔧 Installing Deployment CLI Tools" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if npm is available
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing Railway CLI..." -ForegroundColor Yellow
npm install -g @railway/cli
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Railway CLI installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Railway CLI installation failed (you can still use web UI)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
npm install -g vercel
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Vercel CLI installation failed (you can still use web UI)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Installing EAS CLI..." -ForegroundColor Yellow
npm install -g eas-cli
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ EAS CLI installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  EAS CLI installation failed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Run: railway login" -ForegroundColor White
Write-Host "   2. Run: vercel login" -ForegroundColor White
Write-Host "   3. Run: eas login" -ForegroundColor White
Write-Host "   4. Then run the deployment script" -ForegroundColor White

