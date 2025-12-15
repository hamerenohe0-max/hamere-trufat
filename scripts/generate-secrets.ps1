# Generate secure JWT secrets for production

Write-Host "🔐 Generating JWT Secrets" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
$jwtRefreshSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Write-Host "JWT_SECRET:" -ForegroundColor Yellow
Write-Host $jwtSecret -ForegroundColor Green
Write-Host ""
Write-Host "JWT_REFRESH_SECRET:" -ForegroundColor Yellow
Write-Host $jwtRefreshSecret -ForegroundColor Green
Write-Host ""
Write-Host "✅ Copy these to your hosting environment variables!" -ForegroundColor Cyan

