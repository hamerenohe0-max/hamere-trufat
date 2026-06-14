# Fixing 404 Error for /api/v1/media/upload-signature

## Issue
Getting 404 error when calling `POST /api/v1/media/upload-signature`

## Root Cause
The backend server needs to be restarted after adding the new route.

## Solution

### 1. Restart the Backend Server

**Stop the current backend server** (if running):
- Press `Ctrl+C` in the terminal where the backend is running
- Or kill the process

**Start the backend server**:
```bash
cd backend
npm run start:dev
```

### 2. Verify Route Registration

After restarting, the route should be available at:
```
POST http://localhost:4000/api/v1/media/upload-signature
```

### 3. Test the Endpoint

You can test with curl (replace `YOUR_JWT_TOKEN` with an actual token):

```bash
curl -X POST "http://localhost:4000/api/v1/media/upload-signature?folder=hamere-trufat/news&resourceType=image" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "signature": "abc123...",
  "timestamp": 1234567890,
  "cloudName": "your-cloud-name",
  "apiKey": "your-api-key"
}
```

## Route Configuration Verification

✅ **Global Prefix**: `api/v1` (set in `main.ts`)
✅ **Controller**: `@Controller('media')` 
✅ **Endpoint**: `@Post('upload-signature')`
✅ **Module**: `MediaModule` imported in `AppModule`
✅ **Dependencies**: `SupabaseModule` imported in `MediaModule`

## Authentication

The route requires:
- ✅ Valid JWT token in `Authorization: Bearer <token>` header
- ✅ User role: `admin` or `publisher`

## If Still Getting 404 After Restart

1. **Check backend logs** for any startup errors
2. **Verify MediaModule is imported** in `app.module.ts`:
   ```typescript
   imports: [
     // ... other modules
     MediaModule,
   ]
   ```
3. **Check if route is registered** by looking at startup logs - NestJS should list all routes
4. **Verify the endpoint path** matches exactly: `/api/v1/media/upload-signature`

## Common Issues

### Issue: "Cannot find module"
- **Solution**: Run `npm install` in the backend directory

### Issue: TypeScript compilation errors
- **Solution**: Run `npm run build` to see all errors, fix them, then restart

### Issue: Port already in use
- **Solution**: Change PORT in `.env` or kill the process using port 4000

