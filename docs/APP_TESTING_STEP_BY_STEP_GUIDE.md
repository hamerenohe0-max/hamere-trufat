# Hamere Trufat App Testing Guide

Step-by-step guide for testing the backend API, admin dashboard, and mobile app.

Last updated: 2026-06-13

## 1. What This Guide Covers

Use this guide to test:

- Backend API startup, auth, protected routes, and content APIs.
- Admin dashboard login, dashboard pages, content management, media, users, and profile settings.
- Mobile app startup, guest session, auth, public content, reactions/bookmarks, offline behavior, and Expo launch modes.

Recommended testing order:

1. Backend
2. Admin dashboard
3. Mobile app
4. End-to-end cross-app flows

## 2. Prerequisites

Install these before testing:

- Node.js LTS
- npm
- Supabase project with schema applied
- Expo Go app for physical mobile testing
- Android Studio emulator or Xcode simulator if testing emulators
- Git

Optional but recommended:

- Postman, Insomnia, or VS Code REST Client
- A real mobile device on the same Wi-Fi network as your computer

## 3. Install Dependencies

Run these from the repository root.

```powershell
cd backend
npm install
```

```powershell
cd ..\admin
npm install
```

```powershell
cd ..\mobile-app
npm install
```

Return to the repository root:

```powershell
cd ..
```

## 4. Environment Setup

### Backend `.env`

Create `backend/.env` from `backend/.env.example`.

```powershell
Copy-Item backend\.env.example backend\.env
```

Set real values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

JWT_SECRET=change-this-for-local-testing
JWT_REFRESH_SECRET=change-this-for-local-testing
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=4000
CORS_ORIGIN=http://localhost:3000,http://localhost:19006,http://localhost:8081
```

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` is required by the backend.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in admin or mobile apps.
- If Cloudinary upload tests are needed, also add Cloudinary backend credentials.

### Admin `.env.local`

Create `admin/.env.local`.

```powershell
New-Item -ItemType File -Force admin\.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

Cloudinary values are only needed for unsigned/direct upload flows. Backend media upload uses backend Cloudinary config.

### Mobile `.env`

Create `mobile-app/.env` from `mobile-app/.env.example`.

```powershell
Copy-Item mobile-app\.env.example mobile-app\.env
```

For Expo Web:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_USE_MOCK_DATA=false
```

For Android emulator:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000/api/v1
EXPO_PUBLIC_USE_MOCK_DATA=false
```

For physical phone on same Wi-Fi:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:4000/api/v1
EXPO_PUBLIC_USE_MOCK_DATA=false
```

Example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.50:4000/api/v1
EXPO_PUBLIC_USE_MOCK_DATA=false
```

Find your LAN IP on Windows:

```powershell
ipconfig
```

Use the IPv4 address for your active Wi-Fi or Ethernet adapter.

## 5. Supabase Setup Check

Before running the backend:

1. Open your Supabase project.
2. Confirm the schema has these tables:
   - `users`
   - `publishers`
   - `publisher_requests`
   - `news`
   - `articles`
   - `events`
   - `feasts`
   - `daily_readings`
   - `progress_reports`
   - `media`
   - `notifications`
   - `device_sessions`
   - `offline_cache`
   - `game_scores`
3. Confirm the backend service role key is copied into `backend/.env`.
4. Confirm at least one admin user exists, or register a user and update the role to `admin` in Supabase.

Minimum admin user fields:

```text
role = admin
status = active
```

## 6. Start the Apps

Use three separate terminals.

### Terminal 1: Backend

```powershell
cd backend
npm run start:dev
```

Expected result:

```text
Application is running on: http://0.0.0.0:4000/api/v1
```

### Terminal 2: Admin Dashboard

```powershell
cd admin
npm run dev
```

Expected result:

```text
http://localhost:3000
```

Open:

```text
http://localhost:3000
```

### Terminal 3: Mobile App

For Expo:

```powershell
cd mobile-app
npm run start
```

For web:

```powershell
npm run web
```

For Android:

```powershell
npm run android
```

For iOS:

```powershell
npm run ios
```

## 7. Backend Automated Tests

Run these after dependencies are installed.

```powershell
cd backend
npm run build
```

Expected:

- TypeScript build completes.
- No Nest dependency injection errors.

Run unit tests:

```powershell
npm test
```

Run e2e tests:

```powershell
npm run test:e2e
```

Run coverage:

```powershell
npm run test:cov
```

Pass criteria:

- Build succeeds.
- Tests pass or failures are documented with exact test names.
- No missing provider errors such as `Nest can't resolve dependencies`.

## 8. Backend Manual Smoke Tests

You can test with PowerShell.

### Health Check

```powershell
Invoke-RestMethod http://localhost:4000/api/v1
```

Expected:

- A successful response from the root app controller.

### Register User

```powershell
$body = @{
  name = "Test User"
  email = "test-user@example.com"
  password = "password123"
  requireOtp = $false
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://localhost:4000/api/v1/auth/register `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

Expected:

- `user` object.
- `tokens.accessToken`.
- `tokens.refreshToken`.

### Login

```powershell
$body = @{
  email = "test-user@example.com"
  password = "password123"
} | ConvertTo-Json

$login = Invoke-RestMethod `
  -Uri http://localhost:4000/api/v1/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$accessToken = $login.tokens.accessToken
$refreshToken = $login.tokens.refreshToken
```

Expected:

- Login succeeds.
- `$accessToken` is set.

### Current User

```powershell
Invoke-RestMethod `
  -Uri http://localhost:4000/api/v1/users/me `
  -Headers @{ Authorization = "Bearer $accessToken" }
```

Expected:

- Current user profile.

### Public Content Routes

```powershell
Invoke-RestMethod http://localhost:4000/api/v1/news
Invoke-RestMethod http://localhost:4000/api/v1/articles
Invoke-RestMethod http://localhost:4000/api/v1/events
Invoke-RestMethod http://localhost:4000/api/v1/feasts
Invoke-RestMethod http://localhost:4000/api/v1/progress
Invoke-RestMethod http://localhost:4000/api/v1/readings/today
```

Expected:

- List endpoints return `{ items, total, limit, offset }`.
- `readings/today` returns a reading object or `null` if no data exists.

### Token Refresh

```powershell
$body = @{
  refreshToken = $refreshToken
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://localhost:4000/api/v1/auth/refresh `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

Expected:

- New token bundle.

### Guest Session

```powershell
Invoke-RestMethod `
  -Uri http://localhost:4000/api/v1/auth/guest `
  -Method POST
```

Expected:

- `user` is `null`.
- token bundle has `guest: true`.

## 9. Admin Dashboard Testing

Open:

```text
http://localhost:3000
```

### Login Flow

1. Open `/auth/login`.
2. Login with an admin account.
3. Confirm redirect to dashboard.
4. Open browser devtools.
5. Confirm API requests use:

```text
http://localhost:4000/api/v1
```

Pass criteria:

- Login succeeds.
- Access token is stored in admin auth store.
- Dashboard routes are accessible.
- Non-admin users are blocked from admin-only pages.

### Dashboard Page

Test:

1. Open dashboard home.
2. Confirm stats load from:
   - `/admin/dashboard/stats`
   - `/admin/dashboard/charts`
   - `/admin/dashboard/content`
3. Open analytics page.
4. Confirm analytics loads from:
   - `/admin/analytics`

Pass criteria:

- No 401, 403, or 404 in network tab.
- Empty data states render cleanly.

### News Management

Test:

1. Open News page.
2. Create a draft news item.
3. Add title, summary, body, tags, and image URL.
4. Save.
5. Open the detail page.
6. Edit the news item.
7. Publish it.
8. Schedule another item.
9. Delete a test item.

Expected routes:

```text
GET    /admin/news
GET    /admin/news/:id
POST   /admin/news
PATCH  /admin/news/:id
POST   /admin/news/:id/publish
POST   /admin/news/:id/schedule
DELETE /admin/news/:id
```

Pass criteria:

- Created item appears in the list.
- Published item appears in mobile/public news list.
- Schedule action does not return 404.
- Delete removes or hides the test item.

### Articles Management

Test:

1. Open Articles page.
2. Create article.
3. Edit article.
4. Delete test article.

Expected routes:

```text
GET    /articles/my
POST   /articles
GET    /articles/:id
PATCH  /articles/:id
DELETE /articles/:id
```

Pass criteria:

- Publisher sees own articles.
- Admin can update any article.
- Public/mobile article list shows only published content.

### Events Management

Test:

1. Open Events page.
2. Create event.
3. Edit event as admin.
4. Delete event as admin.

Expected routes:

```text
GET    /events
POST   /events
GET    /events/:id
PATCH  /events/:id
DELETE /events/:id
```

Pass criteria:

- Admin update/delete works.
- Publisher create may work, but update/delete are service-level admin-only.

### Feasts Management

Test:

1. Open Feasts page.
2. Confirm list loads.
3. Open a feast detail/edit flow if available.
4. Create a feast.
5. Edit as admin.
6. Delete as admin.

Expected routes:

```text
GET    /admin/feasts
GET    /admin/feasts/:id
POST   /admin/feasts
PATCH  /admin/feasts/:id
DELETE /admin/feasts/:id
```

Pass criteria:

- `GET /admin/feasts/:id` does not return 404.
- Admin can edit/delete.

### Progress Management

Test:

1. Open Progress page.
2. Create progress report.
3. Edit as admin.
4. Delete as admin.

Expected routes:

```text
GET    /progress
POST   /progress
GET    /progress/:id
PATCH  /progress/:id
DELETE /progress/:id
```

Pass criteria:

- Progress report appears in admin and mobile.
- Admin update/delete works.

### Media Library

Test:

1. Open Media page.
2. Upload an image.
3. Confirm image appears in media grid.
4. Delete uploaded test image.

Expected routes:

```text
GET    /admin/media
POST   /admin/media/upload
DELETE /admin/media/:id
```

Pass criteria:

- Upload does not return 404.
- Image URL is stored.
- `uploadedAt` date renders correctly.
- Admin can delete media, including media uploaded by other users.

### Users and Publishers

Test:

1. Open Users page.
2. Filter users by role/status.
3. Open a user.
4. Suspend user.
5. Activate user.
6. Delete test user.
7. Open Publishers page.
8. Approve or reject a test publisher request.

Expected routes:

```text
GET    /admin/users
GET    /admin/users/:id
PATCH  /admin/users/:id
POST   /admin/users/:id/suspend
POST   /admin/users/:id/activate
DELETE /admin/users/:id
GET    /admin/publishers
GET    /admin/publishers/requests
POST   /admin/publishers/:id/approve
POST   /admin/publishers/:id/reject
```

Pass criteria:

- Suspend prevents login.
- Activate restores access.
- Delete performs safe soft delete/suspension.

### Profile Settings

Test:

1. Open Profile page.
2. Update name, bio, region, language, phone, avatar URL.
3. Change password.
4. Logout.
5. Login with the new password.

Expected routes:

```text
GET   /users/me
PATCH /users/me
POST  /users/me/change-password
```

Pass criteria:

- Profile data persists.
- Password change works.

## 10. Mobile App Testing

### Start Mobile App

Use one of:

```powershell
cd mobile-app
npm run start
```

```powershell
npm run web
```

```powershell
npm run android
```

```powershell
npm run ios
```

### Mobile Startup / Guest Session

Test:

1. Launch app.
2. Confirm splash screen finishes.
3. Confirm app auto-starts guest session if no user is logged in.
4. Confirm Home screen loads.

Expected backend route:

```text
POST /auth/guest
```

Pass criteria:

- No network error.
- Home screen loads public content.
- Guest cannot edit profile.

### Mobile Registration

Test:

1. Go to Register.
2. Create user with name, email, password, phone.
3. Confirm redirect to Home or Login depending on response.

Expected route:

```text
POST /auth/register
```

Pass criteria:

- User is created in Supabase.
- Token is stored in mobile auth store.

### Mobile Login

Test:

1. Logout or clear app storage.
2. Open Login.
3. Login with registered user.

Expected route:

```text
POST /auth/login
```

Pass criteria:

- Login succeeds.
- Home greeting shows user name.
- `/users/me` works on profile screen.

### Mobile Home

Test:

1. Open Home.
2. Pull to refresh.
3. Confirm these sections load:
   - Daily reading
   - Latest news
   - Featured articles
   - Events

Expected routes:

```text
GET /readings/date/:date
GET /news?status=published
GET /articles
GET /events
```

Pass criteria:

- No uncaught loading errors.
- Empty states are clean if database has no content.

### Mobile News

Test:

1. Open News list.
2. Open a news detail.
3. Like news.
4. Dislike news.
5. Bookmark news.

Expected routes:

```text
GET  /news?status=published&limit=20&offset=0
GET  /news/:id
POST /news/:id/reactions
POST /news/:id/bookmark
```

Pass criteria:

- List loads published news only.
- Detail images render.
- Reaction count updates.
- Bookmark toggles.

### Mobile Articles

Test:

1. Open Articles list.
2. Open article detail.
3. Open author profile.
4. Like/dislike article.
5. Bookmark article.

Expected routes:

```text
GET  /articles
GET  /articles/:id
GET  /users/:id/profile
GET  /articles?authorId=:id
POST /articles/:id/reactions
POST /articles/:id/bookmark
```

Pass criteria:

- Article list loads.
- Author page loads.
- Reactions and bookmarks work.

### Mobile Events

Test:

1. Open Events list.
2. Open event detail.
3. Toggle reminder.

Expected routes:

```text
GET  /events
GET  /events/:id
POST /events/:id/reminder
```

Pass criteria:

- Event details load.
- Reminder request succeeds.

### Mobile Feasts

Test:

1. Open Feasts list.
2. Open feast detail.
3. Toggle reminder.

Expected routes:

```text
GET  /feasts
GET  /feasts/:id
POST /feasts/:id/reminder
```

Pass criteria:

- Feasts come from backend, not mock-only service.
- Detail fields render: biography, traditions, readings, prayers.

### Mobile Readings

Test:

1. Open Daily Readings.
2. Change date if UI supports it.
3. Toggle reading reminder.

Expected routes:

```text
GET  /readings/date/:date
GET  /readings/today
POST /readings/date/:date/reminder
```

Pass criteria:

- Exact or closest reading loads.
- Reminder toggle returns `{ reminderEnabled: true/false }`.

### Mobile Progress

Test:

1. Open Progress list.
2. Open progress detail.
3. Like progress.
4. Add test comment if UI exposes the action.

Expected routes:

```text
GET  /progress
GET  /progress/:id
POST /progress/:id/like
POST /progress/:id/comments
```

Pass criteria:

- Progress data comes from backend.
- Like count updates.
- Comment action returns success.

### Mobile Profile

Test as logged-in user:

1. Open Profile.
2. Update profile fields.
3. Save.

Expected routes:

```text
GET   /users/me
PATCH /users/me
```

Pass criteria:

- Guest mode shows guest message.
- Logged-in user can edit profile.

### Mobile Settings

Test:

1. Change theme.
2. Change font scale.
3. Toggle notification preferences.
4. Logout.

Pass criteria:

- Local preferences persist after app reload.
- Logout clears session and returns to guest/login flow.

### Mobile Games

Test:

1. Open Games.
2. Play each game.
3. Confirm UI works.
4. For games wired to backend score sync, confirm score endpoints.

Expected score routes:

```text
POST /games/scores
GET  /games/scores/my
GET  /games/scores/leaderboard/:game
GET  /games/scores/high/:game
```

Important:

- Backend controller currently accepts `trivia`, `puzzle`, `saint`, and `memory` score names.
- If other games should sync scores, extend backend accepted game values.

## 11. Cross-App End-to-End Tests

### Publish News in Admin, Read in Mobile

1. Login to admin.
2. Create news as draft.
3. Publish news.
4. Open mobile News.
5. Confirm the item appears.
6. Open detail.
7. Like and bookmark.

Pass criteria:

- Admin create/publish works.
- Mobile sees published item.
- Reactions/bookmarks persist.

### Create Article in Admin, Read in Mobile

1. Login to admin/publisher.
2. Create published article.
3. Open mobile Articles.
4. Open article detail.
5. Open author profile.

Pass criteria:

- Article appears in mobile.
- Author profile resolves.

### Create Event in Admin, Read in Mobile

1. Create event in admin.
2. Open mobile Events.
3. Open event detail.

Pass criteria:

- Event appears in mobile.
- Dates and location render correctly.

### Create Feast in Admin, Read in Mobile

1. Create feast in admin.
2. Open mobile Feasts.
3. Open feast detail.

Pass criteria:

- Feast appears in mobile.
- Detail fields render.

### Create Progress Report in Admin, Read in Mobile

1. Create progress report in admin.
2. Open mobile Progress.
3. Open detail.
4. Like report.

Pass criteria:

- Progress appears in mobile.
- Like endpoint succeeds.

## 12. Offline and Network Tests

### Mobile Offline Banner

1. Start app online.
2. Turn off Wi-Fi/network.
3. Confirm offline banner appears.
4. Turn network back on.
5. Confirm banner disappears.

### Offline Queue

1. Go offline.
2. Perform a supported offline action.
3. Go online.
4. Trigger sync.

Expected behavior:

- Queue processes pending actions.
- Failed items retry up to configured limit.
- Completed items are cleared.

Known limitation:

- News comments are not fully supported by backend persistence yet.

### Offline Cache

1. Open app online and load news/articles/feasts/readings.
2. Go offline.
3. Reopen those screens.

Pass criteria:

- Previously cached data is available where offline cache is implemented.

## 13. Build and Production Checks

### Backend Build

```powershell
cd backend
npm run build
```

### Admin Build

```powershell
cd admin
npm run build
```

### Mobile Tests

```powershell
cd mobile-app
npm test
```

### Mobile Production Builds

Android:

```powershell
cd mobile-app
npm run build:android
```

iOS:

```powershell
npm run build:ios
```

All platforms:

```powershell
npm run build:all
```

## 14. Common Problems and Fixes

### Backend Cannot Start

Check:

- `backend/.env` exists.
- Supabase URL and service role key are correct.
- Port `4000` is free.
- Dependencies are installed.

Useful command:

```powershell
cd backend
npm run build
```

### Admin Gets 401

Check:

- Admin user exists.
- User status is `active`.
- Token is present in browser storage.
- Backend `JWT_SECRET` did not change after login.

Fix:

1. Clear browser local storage.
2. Login again.

### Admin Gets 403

Check:

- User role is `admin` for admin-only pages.
- Publisher users may not perform service-level admin-only actions such as event/feast/progress update/delete.

### Admin or Mobile Gets 404

Check:

- API URL includes `/api/v1`.
- Backend is running on port `4000`.
- Client env points to the correct host.

Correct:

```text
http://localhost:4000/api/v1
```

Incorrect:

```text
http://localhost:4000
```

### Mobile Device Cannot Reach Backend

If testing on physical phone, do not use `localhost`.

Use:

```text
http://YOUR_COMPUTER_LAN_IP:4000/api/v1
```

Also check:

- Phone and computer are on same Wi-Fi.
- Windows firewall allows Node/backend traffic.
- Backend listens on `0.0.0.0`.

### Android Emulator Cannot Reach Backend

Use:

```text
http://10.0.2.2:4000/api/v1
```

### CORS Error

Update backend `.env`:

```env
CORS_ORIGIN=http://localhost:3000,http://localhost:19006,http://localhost:8081
```

Restart backend after changing `.env`.

### Empty Lists

If routes work but lists are empty:

- Confirm Supabase tables have data.
- Confirm content status is `published` for public mobile lists.
- Confirm admin created content in the correct table.

## 15. Final Release Checklist

Before handing the app to testers:

- Backend `npm run build` passes.
- Backend `npm test` passes or known failures are documented.
- Admin `npm run build` passes.
- Mobile `npm test` passes.
- Admin login works.
- Mobile guest startup works.
- Mobile registered-user login works.
- Admin-created news appears in mobile.
- Admin-created article appears in mobile.
- Admin-created event appears in mobile.
- Admin-created feast appears in mobile.
- Admin-created progress report appears in mobile.
- Mobile reactions/bookmarks work.
- Profile update works on admin and mobile.
- Token refresh works after access token expiry.
- No 404s in browser/mobile network logs for expected API calls.
- Production environment variables are configured.

