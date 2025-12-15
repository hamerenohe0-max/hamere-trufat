# Interactive Deployment Script
# This script will guide you through deployment step by step

Write-Host "🚀 Interactive Deployment Guide" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if CLI tools are installed
$railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue

if (-not $railwayInstalled -or -not $vercelInstalled) {
    Write-Host "⚠️  CLI tools not installed. Installing now..." -ForegroundColor Yellow
    Write-Host ""
    & "$PSScriptRoot\install-deployment-tools.ps1"
    Write-Host ""
    Write-Host "Press Enter to continue after tools are installed..." -ForegroundColor Yellow
    Read-Host
}

# Load secrets
$secretsFile = Join-Path $PSScriptRoot "..\DEPLOYMENT-SECRETS.txt"
if (Test-Path $secretsFile) {
    $secrets = Get-Content $secretsFile
    $jwtSecret = ($secrets | Select-String "JWT_SECRET=").ToString().Split("=")[1]
    $jwtRefreshSecret = ($secrets | Select-String "JWT_REFRESH_SECRET=").ToString().Split("=")[1]
} else {
    Write-Host "⚠️  Secrets file not found. Generating new secrets..." -ForegroundColor Yellow
    & "$PSScriptRoot\..\scripts\generate-secrets.js"
    Write-Host "Please update DEPLOYMENT-SECRETS.txt and run again." -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Deployment Checklist" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Before we start, make sure you have:" -ForegroundColor Yellow
Write-Host "  [ ] MongoDB Atlas account and connection string" -ForegroundColor White
Write-Host "  [ ] Railway account (https://railway.app)" -ForegroundColor White
Write-Host "  [ ] Vercel account (https://vercel.com)" -ForegroundColor White
Write-Host "  [ ] GitHub repository created" -ForegroundColor White
Write-Host ""
$ready = Read-Host "Are you ready to proceed? (y/n)"
if ($ready -ne "y" -and $ready -ne "Y") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

# Step 1: Git setup
Write-Host ""
Write-Host "📦 Step 1: Git Setup" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

$gitRemote = git remote get-url origin 2>$null
if (-not $gitRemote) {
    Write-Host "Git remote not set. Please provide your GitHub repository URL:" -ForegroundColor Yellow
    $repoUrl = Read-Host "GitHub repository URL (e.g., https://github.com/username/hamere-trufat.git)"
    if ($repoUrl) {
        git remote add origin $repoUrl
        Write-Host "✅ Git remote added" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Git remote already set: $gitRemote" -ForegroundColor Green
}

$hasUncommitted = git diff --quiet 2>$null
if (-not $hasUncommitted) {
    Write-Host ""
    Write-Host "You have uncommitted changes. Commit them now?" -ForegroundColor Yellow
    $commit = Read-Host "Commit message (or press Enter to skip)"
    if ($commit) {
        git add .
        git commit -m $commit
        Write-Host "✅ Changes committed" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Push to GitHub now?" -ForegroundColor Yellow
$push = Read-Host "Push to GitHub? (y/n)"
if ($push -eq "y" -or $push -eq "Y") {
    git push -u origin main
    Write-Host "✅ Code pushed to GitHub" -ForegroundColor Green
}

# Step 2: MongoDB
Write-Host ""
Write-Host "🗄️  Step 2: MongoDB Connection String" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please provide your MongoDB Atlas connection string:" -ForegroundColor Yellow
Write-Host "(Format: mongodb+srv://username:password@cluster.mongodb.net/...)" -ForegroundColor Gray
$mongodbUri = Read-Host "MongoDB URI"

# Step 3: Railway Deployment
Write-Host ""
Write-Host "🚂 Step 3: Deploy Backend to Railway" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your JWT secrets:" -ForegroundColor Yellow
Write-Host "  JWT_SECRET: $jwtSecret" -ForegroundColor Gray
Write-Host "  JWT_REFRESH_SECRET: $jwtRefreshSecret" -ForegroundColor Gray
Write-Host ""

if ($railwayInstalled) {
    Write-Host "Logging into Railway..." -ForegroundColor Yellow
    railway login
    Write-Host ""
    Write-Host "Creating Railway project..." -ForegroundColor Yellow
    railway init
    Write-Host ""
    Write-Host "Setting environment variables..." -ForegroundColor Yellow
    
    railway variables set NODE_ENV=production
    railway variables set PORT=4000
    railway variables set "MONGODB_URI=$mongodbUri"
    railway variables set "JWT_SECRET=$jwtSecret"
    railway variables set "JWT_REFRESH_SECRET=$jwtRefreshSecret"
    railway variables set CORS_ORIGIN=https://your-admin.vercel.app
    
    Write-Host ""
    Write-Host "Deploying..." -ForegroundColor Yellow
    railway up
    Write-Host ""
    Write-Host "Getting deployment URL..." -ForegroundColor Yellow
    $railwayUrl = railway domain
    Write-Host "✅ Backend deployed! URL: $railwayUrl" -ForegroundColor Green
} else {
    Write-Host "⚠️  Railway CLI not installed. Please deploy manually:" -ForegroundColor Yellow
    Write-Host "  1. Go to https://railway.app" -ForegroundColor White
    Write-Host "  2. New Project → Deploy from GitHub" -ForegroundColor White
    Write-Host "  3. Set Root Directory: backend" -ForegroundColor White
    Write-Host "  4. Add environment variables (see above)" -ForegroundColor White
    $railwayUrl = Read-Host "Enter your Railway URL after deployment"
}

# Step 4: Vercel Deployment
Write-Host ""
Write-Host "▲ Step 4: Deploy Admin to Vercel" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "$railwayUrl/api/v1"
Write-Host "Backend URL: $backendUrl" -ForegroundColor Yellow
Write-Host ""

if ($vercelInstalled) {
    Write-Host "Logging into Vercel..." -ForegroundColor Yellow
    vercel login
    Write-Host ""
    Write-Host "Deploying admin panel..." -ForegroundColor Yellow
    Set-Location "..\admin"
    vercel --prod --env NEXT_PUBLIC_API_URL=$backendUrl
    Set-Location ".."
    Write-Host "✅ Admin panel deployed!" -ForegroundColor Green
    $vercelUrl = Read-Host "Enter your Vercel URL"
} else {
    Write-Host "⚠️  Vercel CLI not installed. Please deploy manually:" -ForegroundColor Yellow
    Write-Host "  1. Go to https://vercel.com" -ForegroundColor White
    Write-Host "  2. Import GitHub repository" -ForegroundColor White
    Write-Host "  3. Set Root Directory: admin" -ForegroundColor White
    Write-Host "  4. Add environment variable: NEXT_PUBLIC_API_URL=$backendUrl" -ForegroundColor White
    $vercelUrl = Read-Host "Enter your Vercel URL after deployment"
}

# Step 5: Update CORS
Write-Host ""
Write-Host "🔧 Step 5: Update Backend CORS" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

if ($railwayInstalled) {
    railway variables set "CORS_ORIGIN=$vercelUrl"
    Write-Host "✅ CORS updated" -ForegroundColor Green
} else {
    Write-Host "⚠️  Please update CORS_ORIGIN in Railway dashboard to: $vercelUrl" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is live:" -ForegroundColor Cyan
Write-Host "  Backend: $railwayUrl" -ForegroundColor White
Write-Host "  Admin: $vercelUrl" -ForegroundColor White
Write-Host ""
Write-Host "📱 Next: Build mobile app with EAS" -ForegroundColor Yellow

