# Quick Environment Setup Script
# Creates basic .env files if they don't exist

Write-Host "Setting up environment files..."

# Backend .env
$backendEnv = "backend\.env"
if (!(Test-Path $backendEnv)) {
    Write-Host "Creating $backendEnv..."
    $backendContent = @"
MONGODB_URI=mongodb://localhost:27017/hamere-trufat
JWT_SECRET=dev-secret-key-change-in-production-$(Get-Random)
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production-$(Get-Random)
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=4000
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
SUPABASE_URL=https://obcvkqtgdhohkrjdhdmk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iY3ZrcXRnZGhvaGtyamRoZG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODI2MTksImV4cCI6MjA4MTk1ODYxOX0.EJ2D1N5L2bGj1N_qyiL2g6LaHBleqgZEx3Sc2J-p6TE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iY3ZrcXRnZGhvaGtyamRoZG1rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM4MjYxOSwiZXhwIjoyMDgxOTU4NjE5fQ.D6TPH3i32zJujLoSegpMIFwtnKjZpRAJ60CqDFbJ5_M
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
"@
    $backendContent | Out-File -FilePath $backendEnv -Encoding UTF8
    Write-Host "Created $backendEnv"
} else {
    Write-Host "$backendEnv already exists"
}

# Mobile App .env
$mobileEnv = "mobile-app\.env"
if (!(Test-Path $mobileEnv)) {
    Write-Host "Creating $mobileEnv..."
    $mobileContent = @"
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_USE_MOCK_DATA=false
"@
    $mobileContent | Out-File -FilePath $mobileEnv -Encoding UTF8
    Write-Host "Created $mobileEnv"
} else {
    Write-Host "$mobileEnv already exists"
}

# Admin .env.local
$adminEnv = "admin\.env.local"
if (!(Test-Path $adminEnv)) {
    Write-Host "Creating $adminEnv..."
    $adminContent = @"
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
"@
    $adminContent | Out-File -FilePath $adminEnv -Encoding UTF8
    Write-Host "Created $adminEnv"
} else {
    Write-Host "$adminEnv already exists"
}

Write-Host "Environment setup complete!"
