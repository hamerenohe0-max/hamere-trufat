# 🔐 Authentication Flow Documentation

Complete authentication flow for the Hamere Trufat platform across Backend, Admin Panel, and Mobile App.

## Overview

The platform uses **JWT (JSON Web Tokens)** for authentication with:
- **Access Tokens** - Short-lived (1 hour default)
- **Refresh Tokens** - Long-lived (7 days default)
- **OTP Verification** - Optional for registration
- **Guest Sessions** - For unauthenticated users
- **Role-Based Access** - user, publisher, admin, guest

---

## 🔄 Authentication Flows

### 1. Registration Flow

```
User → Frontend → Backend → Database
```

#### Steps:

1. **User submits registration form**
   - Email, password, name, phone (optional), role (optional)
   - Device context (deviceId, deviceName, platform)

2. **Backend validates and creates user**
   ```typescript
   POST /api/v1/auth/register
   {
     email: "user@example.com",
     password: "SecurePass123!",
     name: "John Doe",
     phone: "+1234567890",
     role: "user", // optional: 'user' | 'publisher' | 'admin'
     device: { deviceId, deviceName, devicePlatform }
   }
   ```

3. **OTP Check (Optional)**
   - If `AUTH_REQUIRE_OTP=true` or `requireOtp=true`:
     - Generate 6-digit OTP
     - Store in user record with 10-minute expiry
     - Set user status to `pending`
     - Return `otpRequired: true` (no tokens yet)
   - If OTP not required:
     - Set user status to `active`
     - Generate tokens immediately

4. **OTP Verification (If Required)**
   ```typescript
   POST /api/v1/auth/verify-otp
   {
     email: "user@example.com",
     code: "123456"
   }
   ```
   - Verify OTP code and expiry
   - Activate user account
   - Generate tokens

5. **Response**
   ```typescript
   {
     user: {
       id: string,
       email: string,
       name: string,
       role: 'user' | 'publisher' | 'admin',
       status: 'active'
     },
     tokens: {
       accessToken: string,
       refreshToken: string,
       expiresIn: 3600, // seconds
       refreshExpiresIn: 604800 // seconds
     },
     otpRequired: boolean
   }
   ```

6. **Frontend stores tokens**
   - Admin Panel: Zustand store (in-memory)
   - Mobile App: AsyncStorage (persisted)

---

### 2. Login Flow

```
User → Frontend → Backend → Database → Frontend
```

#### Steps:

1. **User submits credentials**
   ```typescript
   POST /api/v1/auth/login
   {
     email: "user@example.com",
     password: "SecurePass123!",
     device: { deviceId, deviceName, devicePlatform }
   }
   ```

2. **Backend validates**
   - Find user by email
   - Compare password hash (bcrypt)
   - Check user status:
     - ❌ `suspended` → Reject
     - ⚠️ `pending` (OTP not verified) → Reject
     - ✅ `active` → Proceed

3. **Generate tokens**
   - Create JWT access token (1 hour)
   - Create JWT refresh token (7 days)
   - Hash and store refresh token in database
   - Record device session

4. **Response**
   ```typescript
   {
     user: SafeUser,
     tokens: TokenBundle
   }
   ```

5. **Frontend stores session**
   - Save tokens and user data
   - Redirect to dashboard/home

---

### 3. Token Refresh Flow

```
Frontend → Backend → Database → Frontend
```

#### Automatic Refresh (Mobile App):

1. **API request fails with 401**
   - Access token expired

2. **Automatic refresh attempt**
   ```typescript
   POST /api/v1/auth/refresh
   {
     refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

3. **Backend validates refresh token**
   - Verify JWT signature
   - Check token hasn't expired
   - Compare with stored hash in database
   - Verify user still exists

4. **Issue new tokens**
   - Generate new access token
   - Generate new refresh token
   - Update stored refresh token hash

5. **Retry original request**
   - Use new access token
   - User doesn't notice interruption

#### Manual Refresh (Admin Panel):

- Tokens stored in Zustand (not persisted)
- Refresh on page reload or manual call

---

### 4. Protected Route Access

```
Request → JWT Guard → Role Guard → Controller
```

#### Steps:

1. **Request includes token**
   ```
   Authorization: Bearer <accessToken>
   ```

2. **JWT Strategy validates token**
   - Extract token from `Authorization` header
   - Verify signature with `JWT_SECRET`
   - Check expiration
   - Decode payload:
     ```typescript
     {
       sub: userId,
       role: 'user' | 'publisher' | 'admin',
       email: 'user@example.com',
       guest: false
     }
     ```

3. **Load user data**
   - If guest: Return guest user object
   - If authenticated: Fetch user from database
   - Return `SafeUser` (no password hash)

4. **Role Guard checks permissions**
   ```typescript
   @Roles('admin', 'publisher')
   @UseGuards(JwtAuthGuard, RolesGuard)
   ```
   - Verify user role matches required roles
   - Reject if insufficient permissions

5. **Controller receives user**
   ```typescript
   @CurrentUser() user: SafeUser
   ```

---

### 5. Logout Flow

```
User → Frontend → Backend → Database
```

#### Steps:

1. **User clicks logout**
   ```typescript
   POST /api/v1/auth/logout
   Authorization: Bearer <accessToken>
   ```

2. **Backend invalidates refresh token**
   - Clear `refreshTokenHash` from user record
   - Refresh token can no longer be used

3. **Frontend clears session**
   - Remove tokens from storage
   - Clear user data
   - Redirect to login

---

### 6. Guest Session Flow

```
User → Frontend → Backend → Frontend
```

#### Steps:

1. **User accesses app without login**
   ```typescript
   POST /api/v1/auth/guest
   ```

2. **Backend generates guest tokens**
   - Create temporary guest ID: `guest_<timestamp>`
   - Generate tokens with `guest: true` flag
   - No user record created

3. **Frontend stores guest session**
   - Mobile App: Persists in AsyncStorage
   - Allows limited access (read-only content)

4. **Guest restrictions**
   - Cannot create/edit content
   - Cannot comment or react
   - Can browse public content

---

### 7. Password Reset Flow

```
User → Frontend → Backend → Email (future) → Frontend
```

#### Steps:

1. **Request password reset**
   ```typescript
   POST /api/v1/auth/forgot-password
   {
     email: "user@example.com"
   }
   ```

2. **Backend generates OTP**
   - Create 6-digit code
   - Store with 10-minute expiry
   - **Note:** Currently stored in DB (email sending not implemented)

3. **User enters OTP and new password**
   ```typescript
   POST /api/v1/auth/reset-password
   {
     email: "user@example.com",
     code: "123456",
     newPassword: "NewSecurePass123!"
   }
   ```

4. **Backend validates and updates**
   - Verify OTP code and expiry
   - Hash new password
   - Clear OTP fields
   - User can now login with new password

---

## 🔑 Token Structure

### Access Token Payload

```typescript
{
  sub: string,        // User ID
  role: string,       // 'user' | 'publisher' | 'admin' | 'guest'
  email?: string,     // User email (if authenticated)
  guest: boolean,      // Is guest session
  iat: number,        // Issued at
  exp: number         // Expiration time
}
```

### Token Storage

**Admin Panel:**
- Zustand store (in-memory)
- Lost on page refresh
- Must login again

**Mobile App:**
- AsyncStorage (persisted)
- Survives app restarts
- Auto-refresh on token expiry

---

## 🛡️ Security Features

### 1. Password Hashing
- **Algorithm:** bcrypt
- **Rounds:** 12
- **Storage:** Only hash stored, never plain text

### 2. JWT Security
- **Secret:** `JWT_SECRET` from environment
- **Algorithm:** HS256
- **Expiration:** Access (1h), Refresh (7d)

### 3. Refresh Token Security
- **Storage:** Hashed in database (bcrypt)
- **Validation:** Compare hash on refresh
- **Invalidation:** Cleared on logout

### 4. Device Tracking
- Records device sessions
- Tracks last IP address
- Device ID for mobile apps

### 5. Account Status
- **pending:** Awaiting OTP verification
- **active:** Can login and use app
- **suspended:** Blocked from access

---

## 📱 Platform-Specific Details

### Admin Panel (Next.js)

**Storage:** Zustand (in-memory)
```typescript
// Store structure
{
  user: AdminUser | null,
  tokens: TokenBundle | null
}
```

**Auth Client:**
- `authClient.login()` - Login
- `authClient.profile()` - Get current user
- `authClient.logout()` - Logout

**Protected Routes:**
- Uses `AuthGate` component
- Redirects to `/auth/login` if not authenticated

### Mobile App (React Native)

**Storage:** AsyncStorage (persisted)
```typescript
// Store structure
{
  user: User | null,
  tokens: TokenBundle | null,
  guest: boolean,
  hydrated: boolean
}
```

**Auth API:**
- `authApi.register()` - Register
- `authApi.login()` - Login
- `authApi.verifyOtp()` - Verify OTP
- `authApi.guest()` - Start guest session
- `authApi.logout()` - Logout

**Auto-Refresh:**
- Automatically refreshes expired tokens
- Retries failed requests after refresh
- Clears session if refresh fails

**Offline Support:**
- Tokens cached locally
- Works offline with cached data
- Syncs when connection restored

---

## 🔍 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/auth/register` | No | Register new user |
| POST | `/api/v1/auth/verify-otp` | No | Verify OTP code |
| POST | `/api/v1/auth/login` | No | Login user |
| POST | `/api/v1/auth/refresh` | No | Refresh access token |
| POST | `/api/v1/auth/logout` | Yes | Logout user |
| POST | `/api/v1/auth/forgot-password` | No | Request password reset |
| POST | `/api/v1/auth/reset-password` | No | Reset password with OTP |
| POST | `/api/v1/auth/guest` | No | Create guest session |

### User Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/users/me` | Yes | Get current user profile |
| PATCH | `/api/v1/users/me` | Yes | Update user profile |

---

## 🎯 Role-Based Access Control

### Roles

1. **guest**
   - Read-only access
   - Browse public content
   - No write operations

2. **user**
   - Read content
   - Comment and react
   - Submit assignments
   - Cannot publish content

3. **publisher**
   - All user permissions
   - Create news/articles
   - Manage own content
   - Requires admin approval

4. **admin**
   - Full access
   - Manage all content
   - Approve publishers
   - User management

### Role Guards

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'publisher')
```

---

## 🔄 Session Management

### Token Lifecycle

1. **Login/Register** → Tokens issued
2. **API Requests** → Access token used
3. **Token Expires** → Refresh token used
4. **New Tokens** → Old refresh token invalidated
5. **Logout** → All tokens invalidated

### Token Expiration

- **Access Token:** 1 hour (configurable via `JWT_EXPIRES_IN`)
- **Refresh Token:** 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`)

---

## 📝 Example Flows

### Complete Registration with OTP

```typescript
// 1. Register
const registerResponse = await authApi.register({
  email: "user@example.com",
  password: "Pass123!",
  name: "John Doe",
  requireOtp: true
});
// Returns: { user, tokens: empty, otpRequired: true }

// 2. Verify OTP
await authApi.verifyOtp({
  email: "user@example.com",
  code: "123456"
});

// 3. Login to get tokens
const loginResponse = await authApi.login({
  email: "user@example.com",
  password: "Pass123!"
});
// Returns: { user, tokens }
```

### Auto-Refresh Example

```typescript
// API call with expired token
try {
  const data = await apiFetch('/api/v1/news');
} catch (error) {
  // If 401, automatically:
  // 1. Call /auth/refresh
  // 2. Get new tokens
  // 3. Retry original request
  // 4. Return data
}
```

---

## 🚨 Error Handling

### Common Errors

| Error | Status | Description |
|-------|--------|-------------|
| Invalid credentials | 401 | Wrong email/password |
| Account suspended | 401 | User account suspended |
| OTP verification pending | 400 | Must verify OTP first |
| Invalid refresh token | 401 | Refresh token invalid/expired |
| Email already registered | 409 | Email exists |
| OTP expired | 400 | OTP code expired |

---

## 🔧 Configuration

### Environment Variables

```env
# Backend
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
AUTH_REQUIRE_OTP=false  # Optional: require OTP for all registrations
```

---

## 📚 Summary

**Key Points:**
- ✅ JWT-based authentication
- ✅ Access + Refresh token pattern
- ✅ Optional OTP verification
- ✅ Guest sessions supported
- ✅ Role-based access control
- ✅ Automatic token refresh (mobile)
- ✅ Device tracking
- ✅ Secure password hashing

**Storage:**
- Admin: In-memory (Zustand)
- Mobile: Persistent (AsyncStorage)

**Security:**
- Passwords: bcrypt hashed
- Tokens: JWT with secrets
- Refresh tokens: Hashed in database

