# Add Cloudinary Environment Variables to backend/.env
# Run this script to add Cloudinary configuration

$backendEnv = "backend\.env"

if (!(Test-Path $backendEnv)) {
    Write-Host "❌ backend/.env file not found!" -ForegroundColor Red
    Write-Host "Please run setup-env.ps1 first to create the .env file." -ForegroundColor Yellow
    exit 1
}

Write-Host "🔧 Adding Cloudinary environment variables to backend/.env..." -ForegroundColor Cyan
Write-Host ""

# Read existing content
$content = Get-Content $backendEnv -Raw

# Check if Cloudinary variables already exist
if ($content -match "CLOUDINARY_CLOUD_NAME") {
    Write-Host "⚠️  Cloudinary variables already exist in backend/.env" -ForegroundColor Yellow
    Write-Host "Please update them manually if needed." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Current Cloudinary variables:" -ForegroundColor Cyan
    Get-Content $backendEnv | Select-String -Pattern "CLOUDINARY"
    exit 0
}

# Add Cloudinary variables
$cloudinaryVars = @"

# Cloudinary Configuration
# Get these from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
"@

# Append to file
Add-Content -Path $backendEnv -Value $cloudinaryVars

Write-Host "✅ Added Cloudinary environment variables to backend/.env" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Open backend/.env in a text editor" -ForegroundColor White
Write-Host "   2. Replace the placeholder values with your actual Cloudinary credentials:" -ForegroundColor White
Write-Host "      - CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name" -ForegroundColor White
Write-Host "      - CLOUDINARY_API_KEY: Your Cloudinary API key" -ForegroundColor White
Write-Host "      - CLOUDINARY_API_SECRET: Your Cloudinary API secret" -ForegroundColor White
Write-Host ""
Write-Host "   3. Get your credentials from: https://cloudinary.com/console" -ForegroundColor White
Write-Host "   4. Restart your backend server after updating the values" -ForegroundColor White
Write-Host ""

