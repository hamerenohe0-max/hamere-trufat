# Hamere Trufat Backend API Reference

Technical reference for frontend, admin panel, and mobile app developers.

Last updated: 2026-06-09

## 1. Overview

The backend is a NestJS API backed by Supabase/Postgres. Frontend clients should call the NestJS API only. They should not call Supabase directly for application data.

Base path:

```text
{API_BASE_URL}/api/v1
```

Local default:

```text
http://localhost:4000/api/v1
```

Client environment variables:

```text
Admin:      NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
Mobile app: EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Backend environment variables:

```text
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:8081
```

## 2. Conventions

### Authentication

Most protected routes use a Bearer JWT:

```http
Authorization: Bearer <accessToken>
```

Tokens are returned by login, register, refresh, and guest-session endpoints.

When an access token expires, clients should call:

```http
POST /auth/refresh
```

with:

```json
{
  "refreshToken": "..."
}
```

### Roles

Supported backend roles:

```text
user
publisher
admin
guest
```

General behavior:

- Public routes do not require a token.
- Protected user routes require any signed-in non-guest user unless noted.
- Publisher routes usually allow `publisher` and `admin`.
- Admin routes usually require `admin`; some admin content routes also allow `publisher`.
- Guest tokens are valid JWTs, but role-guarded routes such as `/users/me` do not allow `guest`.

### Response Shapes

List endpoints generally return:

```json
{
  "items": [],
  "total": 0,
  "limit": 20,
  "offset": 0
}
```

Single-resource endpoints return the object directly.

Delete endpoints usually return an empty response or `{}`.

### Field Naming

The backend often returns database-shaped `snake_case` fields for content resources:

```json
{
  "created_at": "...",
  "updated_at": "...",
  "author_id": "...",
  "cover_image": "..."
}
```

Frontend and mobile code may map these into `camelCase` UI models:

```json
{
  "createdAt": "...",
  "updatedAt": "...",
  "authorId": "...",
  "coverImage": "..."
}
```

Do not assume all API responses are camelCase. Map at the client boundary.

### Errors

Typical error response from NestJS:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

Common status codes:

| Status | Meaning |
| --- | --- |
| `400` | Invalid request body or query |
| `401` | Missing/invalid/expired access token |
| `403` | Authenticated but role is not allowed |
| `404` | Resource not found |
| `429` | Rate limit exceeded |
| `500` | Server or integration failure |

## 3. Auth API

### Register

```http
POST /auth/register
Public
```

Body:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "phone": "+251...",
  "role": "user",
  "requireOtp": false,
  "device": {
    "deviceId": "device-id",
    "deviceName": "iPhone",
    "devicePlatform": "ios",
    "appVersion": "1.0.0"
  }
}
```

Response:

```json
{
  "user": {
    "id": "...",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "status": "active",
    "profile": {},
    "createdAt": "...",
    "updatedAt": "..."
  },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900,
    "refreshExpiresIn": 604800,
    "guest": false
  },
  "otpRequired": false
}
```

### Login

```http
POST /auth/login
Public
```

Body:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "device": {
    "deviceId": "device-id",
    "deviceName": "Chrome",
    "devicePlatform": "web"
  }
}
```

Response:

```json
{
  "user": {},
  "tokens": {}
}
```

### Refresh Token

```http
POST /auth/refresh
Public
```

Body:

```json
{
  "refreshToken": "..."
}
```

Response:

```json
{
  "user": {},
  "tokens": {}
}
```

Guest refresh returns `user: null`.

### Guest Session

```http
POST /auth/guest
Public
```

Response:

```json
{
  "user": null,
  "tokens": {
    "accessToken": "...",
    "refreshToken": "...",
    "guest": true
  }
}
```

### Verify OTP

```http
POST /auth/verify-otp
Public
```

Body:

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

Response:

```json
{
  "success": true
}
```

### Forgot Password

```http
POST /auth/forgot-password
Public
```

Body:

```json
{
  "email": "user@example.com"
}
```

Response:

```json
{
  "success": true
}
```

### Reset Password

```http
POST /auth/reset-password
Public
```

Body:

```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newPassword123"
}
```

Response:

```json
{
  "success": true
}
```

### Logout

```http
POST /auth/logout
Auth: user, publisher, admin
```

Response:

```json
{
  "success": true
}
```

## 4. User API

### Get Current User

```http
GET /users/me
Auth: user, publisher, admin
```

### Update Current User Profile

```http
PATCH /users/me
Auth: user, publisher, admin
```

Body:

```json
{
  "name": "Updated Name",
  "bio": "Short bio",
  "avatarUrl": "https://example.com/avatar.jpg",
  "language": "amharic",
  "region": "Addis Ababa",
  "phone": "+251..."
}
```

### Change Password

```http
POST /users/me/change-password
Auth: user, publisher, admin
```

Body:

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

### Public Profile

```http
GET /users/:id/profile
Public
```

Used by article author/profile screens.

## 5. News API

### List News

```http
GET /news?status=published&limit=20&offset=0
Public, optional auth
```

Query:

| Name | Type | Notes |
| --- | --- | --- |
| `status` | string | Defaults to `published` |
| `authorId` | string | Optional author filter |
| `limit` | number | Defaults to `20` |
| `offset` | number | Defaults to `0` |

Response:

```json
{
  "items": [],
  "total": 0,
  "limit": 20,
  "offset": 0
}
```

### Get News Detail

```http
GET /news/:id
Public, optional auth
```

If a valid token is supplied, the response may include user-specific fields such as:

```json
{
  "userReaction": "like",
  "bookmarked": true
}
```

### Create News

```http
POST /news
Auth: admin, publisher
```

Body:

```json
{
  "title": "News title",
  "summary": "Short summary",
  "body": "Full body",
  "tags": ["church", "event"],
  "images": ["https://..."],
  "coverImage": "https://...",
  "status": "draft",
  "scheduledAt": "2026-06-10T10:00:00.000Z"
}
```

### Update News

```http
PATCH /news/:id
Auth: admin, publisher
```

Publishers can only update their own news. Admins can update any news.

### Delete News

```http
DELETE /news/:id
Auth: admin, publisher
```

Publishers can only delete their own news. Admins can delete any news.

### Publish News

```http
POST /news/:id/publish
Auth: admin, publisher
```

### React to News

```http
POST /news/:id/reactions
Auth: any valid JWT
```

Body:

```json
{
  "reaction": "like"
}
```

Allowed values:

```text
like
dislike
```

Response:

```json
{
  "likes": 10,
  "dislikes": 1,
  "userReaction": "like"
}
```

### Toggle News Bookmark

```http
POST /news/:id/bookmark
Auth: any valid JWT
```

Response:

```json
{
  "bookmarked": true
}
```

### My News Bookmarks

```http
GET /news/bookmarks/my?limit=20&offset=0
Auth: any valid JWT
```

## 6. Articles API

### List Articles

```http
GET /articles?limit=20&offset=0&authorId=...
Public, optional auth
```

Public calls return only published articles. Authenticated admin/publisher calls may include drafts depending on role and endpoint.

### My Articles

```http
GET /articles/my
Auth: publisher, admin
```

Publishers receive their own articles. Admins receive all articles.

### Get Article Detail

```http
GET /articles/:id
Public, optional auth
```

### Get Article by Slug

```http
GET /articles/slug/:slug
Public
```

### Get Articles by Author

```http
GET /articles/author/:authorId?limit=20&offset=0
Public
```

### Create Article

```http
POST /articles
Auth: admin, publisher
```

Body:

```json
{
  "title": "Article title",
  "excerpt": "Short excerpt",
  "content": "Full article",
  "coverImage": "https://...",
  "images": ["https://..."],
  "keywords": ["faith"],
  "relatedEventIds": [],
  "relatedFeastIds": [],
  "audioUrl": "https://...",
  "readingTime": "4 min",
  "status": "published"
}
```

### Update Article

```http
PATCH /articles/:id
Auth: admin, publisher
```

### Delete Article

```http
DELETE /articles/:id
Auth: admin, publisher
```

### React to Article

```http
POST /articles/:id/reactions
Auth: any valid JWT
```

Body:

```json
{
  "reaction": "like"
}
```

### Toggle Article Bookmark

```http
POST /articles/:id/bookmark
Auth: any valid JWT
```

### My Article Bookmarks

```http
GET /articles/bookmarks/my?limit=20&offset=0
Auth: any valid JWT
```

## 7. Events API

### List Events

```http
GET /events?featured=true&startDate=2026-06-09&limit=20&offset=0
Public
```

### Get Event Detail

```http
GET /events/:id
Public
```

### Create Event

```http
POST /events
Auth: admin, publisher
```

Body:

```json
{
  "name": "Event name",
  "startDate": "2026-06-09T10:00:00.000Z",
  "endDate": "2026-06-09T12:00:00.000Z",
  "location": "Addis Ababa",
  "coordinates": { "lat": 9.03, "lng": 38.74 },
  "description": "Event description",
  "feastId": "...",
  "featured": true,
  "flyerImages": ["https://..."],
  "reminderEnabled": false
}
```

### Update Event

```http
PATCH /events/:id
Auth: admin, publisher
```

Service rule: only admins can update events.

### Delete Event

```http
DELETE /events/:id
Auth: admin
```

### Toggle Event Reminder

```http
POST /events/:id/reminder
Auth: any valid JWT
```

Response is the updated event object.

## 8. Feasts API

### List Feasts

```http
GET /feasts?region=...&date=2026-06-09&limit=20&offset=0
Public
```

### Get Feast Detail

```http
GET /feasts/:id
Public
```

### Get Feast by Date

```http
GET /feasts/date/:date
Public
```

### Create Feast

```http
POST /feasts
Auth: admin, publisher
```

Body:

```json
{
  "name": "Feast name",
  "date": "2026-06-09T00:00:00.000Z",
  "region": "Ethiopia",
  "description": "Description",
  "icon": "https://...",
  "articleIds": [],
  "biography": "Biography",
  "traditions": [],
  "readings": [],
  "prayers": [],
  "reminderEnabled": false
}
```

### Update Feast

```http
PATCH /feasts/:id
Auth: admin, publisher
```

Service rule: only admins can update feasts.

### Delete Feast

```http
DELETE /feasts/:id
Auth: admin
```

### Toggle Feast Reminder

```http
POST /feasts/:id/reminder
Auth: any valid JWT
```

Response is the updated feast object.

## 9. Readings API

There are two reading controllers. Mobile daily-word screens primarily use `/readings`. Prayer-specific screens may use `/daily-readings`.

### List Readings

```http
GET /readings?language=amharic&limit=20&offset=0
Public
```

### Get Reading by Date

```http
GET /readings/date/:date
Public
```

If the exact date is not available, the backend tries to return the closest reading.

### Get Today's Reading

```http
GET /readings/today
Public
```

### Get Reading by ID

```http
GET /readings/:id
Public
```

### Create Reading

```http
POST /readings
Auth: admin, publisher
```

Body:

```json
{
  "date": "2026-06-09T00:00:00.000Z",
  "gospel": {
    "title": "John",
    "reference": "John 1:1",
    "body": "..."
  },
  "epistle": {},
  "psalms": [],
  "reflections": [],
  "language": "amharic"
}
```

### Update Reading

```http
PATCH /readings/:id
Auth: admin, publisher
```

### Delete Reading

```http
DELETE /readings/:id
Auth: admin
```

### Reading Reminder

```http
POST /readings/date/:date/reminder
Auth: any valid JWT
```

Body:

```json
{
  "enabled": true
}
```

Response:

```json
{
  "reminderEnabled": true
}
```

### Daily Readings Alias

```http
GET  /daily-readings/today
GET  /daily-readings/:date
POST /daily-readings
```

`POST /daily-readings` requires `admin` or `publisher`.

## 10. Progress Reports API

### List Progress Reports

```http
GET /progress?limit=20&offset=0
Public
```

### Get Progress Report

```http
GET /progress/:id
Public
```

### Create Progress Report

```http
POST /progress
Auth: admin, publisher
```

Body:

```json
{
  "title": "Project update",
  "summary": "Short summary",
  "pdfUrl": "https://...",
  "beforeImage": "https://...",
  "afterImage": "https://...",
  "mediaGallery": ["https://..."],
  "timeline": [
    {
      "date": "2026-06-09",
      "title": "Started",
      "description": "Work began"
    }
  ]
}
```

### Update Progress Report

```http
PATCH /progress/:id
Auth: admin, publisher
```

Service rule: only admins can update progress reports.

### Delete Progress Report

```http
DELETE /progress/:id
Auth: admin
```

### Toggle Progress Like

```http
POST /progress/:id/like
Auth: any valid JWT
```

Response is the updated progress report object.

### Add Progress Comment Count

```http
POST /progress/:id/comments
Auth: any valid JWT
```

Body:

```json
{
  "body": "Great progress!"
}
```

Current behavior increments `comments_count`. Full comment storage is not implemented yet.

Response:

```json
{
  "success": true
}
```

## 11. Notifications API

### Create Notification

```http
POST /notifications
Auth: admin, publisher
```

Body:

```json
{
  "type": "news",
  "title": "Notification title",
  "body": "Notification body",
  "targetUserIds": [],
  "metadata": {}
}
```

### My Notifications

```http
GET /notifications?limit=20&offset=0
Auth: any valid JWT
```

### Get Notification

```http
GET /notifications/:id
Auth: any valid JWT
```

### Mark Notification as Read

```http
POST /notifications/:id/read
Auth: any valid JWT
```

### Delete Notification

```http
DELETE /notifications/:id
Auth: admin, publisher
```

## 12. Media API

Media routes require `admin` or `publisher`.

### Generate Cloudinary Upload Signature

```http
POST /media/upload-signature?folder=hamere-trufat/news&resourceType=image
Auth: admin, publisher
```

Response:

```json
{
  "timestamp": 1710000000,
  "signature": "...",
  "cloudName": "...",
  "apiKey": "..."
}
```

### Upload File Through Backend

```http
POST /media/upload
Auth: admin, publisher
Content-Type: multipart/form-data
```

Form field:

```text
file=<binary>
```

### List Media

```http
GET /media?userId=...&limit=50&offset=0
Auth: admin, publisher
```

Without `userId`, this returns media for the current user.

### Delete Media

```http
DELETE /media/:id
Auth: admin, publisher
```

Non-admin users can only delete their own media.

## 13. Games API

### Save Score

```http
POST /games/scores
Auth: any valid JWT
```

Body:

```json
{
  "game": "trivia",
  "score": 120,
  "metadata": {}
}
```

Currently accepted game values in the controller:

```text
trivia
puzzle
saint
memory
```

### My Scores

```http
GET /games/scores/my?game=trivia
Auth: any valid JWT
```

### Leaderboard

```http
GET /games/scores/leaderboard/:game?limit=10
Public
```

### My High Score

```http
GET /games/scores/high/:game
Auth: any valid JWT
```

## 14. Roles and Publisher Requests

### Request Publisher Role

```http
POST /roles/publisher/request
Auth: any valid JWT
```

### List Publisher Requests

```http
GET /roles/publisher/requests?status=pending&limit=20&offset=0
Auth: admin
```

### Get Publisher Request

```http
GET /roles/publisher/requests/:id
Auth: admin
```

### Approve Publisher Request

```http
POST /roles/publisher/requests/:id/approve
Auth: admin
```

### Reject Publisher Request

```http
POST /roles/publisher/requests/:id/reject
Auth: admin
```

Body:

```json
{
  "reason": "Optional rejection reason"
}
```

## 15. Admin API

All `/admin/*` routes require a valid JWT. Some allow `publisher`; user-management routes require `admin`.

### Dashboard

```http
GET /admin/dashboard/stats
Auth: admin, publisher

GET /admin/dashboard/charts?days=30
Auth: admin, publisher

GET /admin/dashboard/content
Auth: admin, publisher

GET /admin/analytics?startDate=2026-06-01&endDate=2026-06-09
Auth: admin, publisher
```

### Admin News

```http
GET    /admin/news
GET    /admin/news/:id
POST   /admin/news
PATCH  /admin/news/:id
DELETE /admin/news/:id
POST   /admin/news/:id/publish
POST   /admin/news/:id/schedule
```

Auth: `admin`, `publisher`

`POST /admin/news` and `PATCH /admin/news/:id` support either JSON image URLs or multipart image uploads with field name `images`.

Schedule body:

```json
{
  "publishAt": "2026-06-10T10:00:00.000Z"
}
```

### Admin Content

Articles:

```http
GET    /admin/articles
GET    /admin/articles/:id
POST   /admin/articles
PATCH  /admin/articles/:id
DELETE /admin/articles/:id
```

Events:

```http
GET    /admin/events
POST   /admin/events
PATCH  /admin/events/:id
DELETE /admin/events/:id
```

Feasts:

```http
GET    /admin/feasts
GET    /admin/feasts/:id
POST   /admin/feasts
PATCH  /admin/feasts/:id
DELETE /admin/feasts/:id
```

Progress:

```http
GET    /admin/progress
POST   /admin/progress
PATCH  /admin/progress/:id
DELETE /admin/progress/:id
```

Auth: `admin`, `publisher`

Some service-level operations are admin-only even if the controller allows publisher. For example, event, feast, and progress update/delete operations are enforced as admin-only in services.

### Admin Media

```http
GET    /admin/media?limit=50&offset=0
POST   /admin/media/upload
DELETE /admin/media/:id
```

Auth: `admin`, `publisher`

### Admin Notifications

```http
GET    /admin/notifications
POST   /admin/notifications
DELETE /admin/notifications/:id
```

Auth: `admin`, `publisher`

### Admin Users

```http
GET    /admin/users?role=user&status=active
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

Auth: `admin`

`DELETE /admin/users/:id` currently performs a safe soft delete by suspending the user and clearing the refresh token. It does not physically remove the database row.

## 16. Offline Sync API

Used by mobile offline support.

### Save Cache

```http
POST /sync/cache
Auth: any valid JWT
```

Body:

```json
{
  "deviceId": "device-id",
  "entity": "news",
  "key": "news-list",
  "payload": {},
  "expiresAt": "2026-06-10T10:00:00.000Z"
}
```

### Get Cache

```http
GET /sync/cache?deviceId=...&entity=news&key=news-list
Auth: any valid JWT
```

### Get All Cache

```http
GET /sync/cache/all?deviceId=...&entity=news
Auth: any valid JWT
```

### Sync Data

```http
POST /sync/sync
Auth: any valid JWT
```

Body:

```json
{
  "deviceId": "device-id",
  "data": [
    {
      "entity": "news",
      "key": "news-list",
      "payload": {},
      "version": 1
    }
  ]
}
```

### Delete Cache

```http
DELETE /sync/cache?deviceId=...&entity=news&key=news-list
Auth: any valid JWT
```

## 17. Legacy / Simple Collection APIs

These currently exist as simple public endpoints.

### Assignments

```http
GET /assignments
Public
```

### Submissions

```http
GET  /submissions
POST /submissions
Public
```

Body for `POST /submissions` is currently flexible:

```json
{
  "any": "payload"
}
```

## 18. Frontend Integration Checklist

### Admin Panel

Use:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Recommended client behavior:

- Store `accessToken` and `refreshToken`.
- Send `Authorization: Bearer <accessToken>` unless the endpoint is public.
- On `401`, call `/auth/refresh` once, then retry the original request.
- Route guard admin pages by `user.role`.
- Map backend snake_case fields in service files, not inside UI components.

### Mobile App

Use:

```text
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_USE_MOCK_DATA=false
```

Recommended client behavior:

- Use guest session for public browsing if desired.
- Do not call role-guarded routes such as `/users/me` while in guest mode.
- Public content routes can be called with or without a token.
- Send a token to news/article detail routes when available so user-specific reaction state can be included.
- Keep offline queue method names aligned with API service methods: `react`, `bookmark`, `like`, `comment`.

## 19. Known Current Limitations

- News comments do not have a full backend persistence API yet.
- Progress comments currently increment `comments_count`; full comment records are not stored yet.
- Some service-level permissions are stricter than controller-level decorators. For example, event, feast, and progress updates are effectively admin-only.
- Game score controller currently lists only `trivia`, `puzzle`, `saint`, and `memory` as accepted body values, while the mobile game model contains more game names. Extend the backend type if all games should sync scores.
- The API does not currently generate an OpenAPI/Swagger spec. This document is the source of truth until Swagger is added.

