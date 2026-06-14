# Cloudinary Setup Script
# Configures backend/.env with Cloudinary account: dwngllfd4

Write-Host "🔧 Configuring Cloudinary for account: dwngllfd4" -ForegroundColor Cyan
Write-Host ""

$backendEnv = "backend\.env"

if (!(Test-Path $backendEnv)) {
    Write-Host "⚠️  backend/.env not found. Creating it..." -ForegroundColor Yellow
    @"
# Backend Environment Variables
CLOUDINARY_CLOUD_NAME=dwngllfd4
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
"@ | Out-File -FilePath $backendEnv -Encoding utf8
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
} else {
    Write-Host "✅ backend/.env exists" -ForegroundColor Green
    $content = Get-Content $backendEnv -Raw
    
    # Update or add Cloudinary variables
    if ($content -match "CLOUDINARY_CLOUD_NAME") {
        $content = $content -replace "CLOUDINARY_CLOUD_NAME=.*", "CLOUDINARY_CLOUD_NAME=dwngllfd4"
        Write-Host "✅ Updated CLOUDINARY_CLOUD_NAME to dwngllfd4" -ForegroundColor Green
    } else {
        Add-Content -Path $backendEnv -Value "`nCLOUDINARY_CLOUD_NAME=dwngllfd4"
        Write-Host "✅ Added CLOUDINARY_CLOUD_NAME=dwngllfd4" -ForegroundColor Green
    }
    
    if ($content -notmatch "CLOUDINARY_API_KEY") {
        Add-Content -Path $backendEnv -Value "CLOUDINARY_API_KEY=your-api-key-here"
        Write-Host "✅ Added CLOUDINARY_API_KEY placeholder" -ForegroundColor Green
    }
    
    if ($content -notmatch "CLOUDINARY_API_SECRET") {
        Add-Content -Path $backendEnv -Value "CLOUDINARY_API_SECRET=your-api-secret-here"
        Write-Host "✅ Added CLOUDINARY_API_SECRET placeholder" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Get your Cloudinary credentials from: https://console.cloudinary.com/" -ForegroundColor White
Write-Host "   2. Open backend/.env and replace:" -ForegroundColor White
Write-Host "      - CLOUDINARY_API_KEY=your-api-key-here" -ForegroundColor Yellow
Write-Host "      - CLOUDINARY_API_SECRET=your-api-secret-here" -ForegroundColor Yellow
Write-Host "   3. Restart the backend server" -ForegroundColor White
Write-Host ""
Write-Host "✅ Cloudinary cloud name is set to: dwngllfd4" -ForegroundColor Green
Write-Host ""

