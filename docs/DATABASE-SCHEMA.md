# 📊 Database Schema Documentation

Complete database schema for the Hamere Trufat platform using MongoDB.

## Database Name

**`hamere-trufat`**

## Collections Overview

The database contains the following collections:

1. **users** - User accounts and authentication
2. **news** - News articles and posts
3. **newscomments** - Comments on news articles
4. **newsreactions** - Like/dislike reactions on news
5. **newsbookmarks** - Bookmarked news by users
6. **articles** - Long-form articles
7. **articlebookmarks** - Bookmarked articles by users
8. **events** - Church events and gatherings
9. **feasts** - Religious feasts and celebrations
10. **progressreports** - Progress reports with before/after images
11. **dailyreadings** - Daily Bible readings
12. **gamescores** - Game scores and leaderboards
13. **media** - Uploaded media files (images, videos, documents)
14. **notifications** - Push notifications and alerts
15. **publisherrequests** - Publisher role requests
16. **offlinecaches** - Offline sync cache data

---

## 1. Users Collection

**Collection:** `users`

### Schema

```typescript
{
  name: string (required)
  email: string (required, unique, indexed, lowercase)
  passwordHash: string (required)
  role: 'user' | 'publisher' | 'admin' (default: 'user')
  status: 'pending' | 'active' | 'suspended' (default: 'pending')
  profile: {
    bio?: string
    avatarUrl?: string
    language?: string
    region?: string
    phone?: string
  }
  otpCode?: string | null
  otpExpiresAt?: Date | null
  otpVerifiedAt?: Date | null
  refreshTokenHash?: string | null
  deviceSessions: [{
    deviceId: string (required)
    deviceName?: string
    devicePlatform?: string
    appVersion?: string
    lastIp?: string
    lastActiveAt: Date (default: Date.now)
  }]
  lastLoginAt?: Date
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Indexes
- `email` (unique)
- `email` (indexed)

---

## 2. News Collection

**Collection:** `news`

### Schema

```typescript
{
  title: string (required)
  summary: string (required)
  body: string (required)
  tags: string[] (default: [])
  authorId: string (required, indexed)
  coverImage?: string
  status: 'draft' | 'scheduled' | 'published' (default: 'draft')
  publishedAt?: Date
  scheduledAt?: Date
  views: number (default: 0)
  likes: number (default: 0)
  dislikes: number (default: 0)
  commentsCount: number (default: 0)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Indexes
- `authorId`
- `status, publishedAt` (compound, descending)
- `tags`

---

## 3. News Comments Collection

**Collection:** `newscomments`

### Schema

```typescript
{
  newsId: string (required, indexed)
  userId: string (required)
  body: string (required)
  translatedBody?: string
  likes: number (default: 0)
  likedBy: string[] (default: [])
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Indexes
- `newsId, createdAt` (compound, descending)

---

## 4. News Reactions Collection

**Collection:** `newsreactions`

### Schema

```typescript
{
  newsId: string (required, indexed)
  userId: string (required, indexed)
  reaction: 'like' | 'dislike' (required)
  createdAt: Date (default: Date.now)
}
```

### Indexes
- `newsId, userId` (compound, unique)

---

## 5. News Bookmarks Collection

**Collection:** `newsbookmarks`

### Schema

```typescript
{
  newsId: string (required, indexed)
  userId: string (required, indexed)
  createdAt: Date (default: Date.now)
}
```

### Indexes
- `newsId, userId` (compound, unique)

---

## 6. Articles Collection

**Collection:** `articles`

### Schema

```typescript
{
  title: string (required)
  slug: string (required, unique, indexed)
  content: string (required)
  excerpt?: string
  coverImage?: string
  authorId: string (required, indexed)
  publishedAt?: Date
  relatedEventIds: string[] (default: [])
  relatedFeastIds: string[] (default: [])
  keywords: string[] (default: [])
  views: number (default: 0)
  audioUrl?: string
  readingTime?: string
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Indexes
- `slug` (unique)
- `authorId`
- `publishedAt` (descending)

---

## 7. Article Bookmarks Collection

**Collection:** `articlebookmarks`

### Schema

```typescript
{
  articleId: string (required, indexed)
  userId: string (required, indexed)
  createdAt: Date (default: Date.now)
}
```

### Indexes
- `articleId, userId` (compound, unique)

---

## 8. Events Collection

**Collection:** `events`

### Schema

```typescript
{
  name: string (required)
  startDate: Date (required, indexed)
  endDate?: Date
  location: string (required)
  coordinates?: {
    lat: number (required)
    lng: number (required)
  }
  description?: string
  feastId?: string
  featured: boolean (default: false)
  flyerImages: string[] (default: [])
  reminderEnabled: boolean (default: false)
  views: number (default: 0)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Indexes
- `startDate`
- `featured, startDate` (compound)

---

## 9. Feasts Collection

**Collection:** `feasts`

### Schema

```typescript
{
  name: string (required)
  date: Date (required, indexed)
  region: string (required)
  description?: string
  icon?: string
  articleIds: string[] (default: [])
  biography?: string
  traditions: string[] (default: [])
  readings: string[] (default: [])
  prayers: string[] (default: [])
  reminderEnabled: boolean (default: false)
  views: number (default: 0)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Indexes
- `date`
- `region, date` (compound)

---

## 10. Progress Reports Collection

**Collection:** `progressreports`

### Schema

```typescript
{
  title: string (required)
  summary: string (required)
  pdfUrl?: string
  beforeImage?: string
  afterImage?: string
  mediaGallery: string[] (default: [])
  timeline: [{
    label: string (required)
    description: string (required)
    date: Date (required)
  }] (default: [])
  likes: number (default: 0)
  commentsCount: number (default: 0)
  likedBy: string[] (default: [])
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Indexes
- `createdAt` (descending)

---

## 11. Daily Readings Collection

**Collection:** `dailyreadings`

### Schema

```typescript
{
  date: Date (required, unique, indexed)
  gospel: {
    title: string (required)
    reference: string (required)
    body: string (required)
    audioUrl?: string
  } (required)
  epistle?: {
    title: string (required)
    reference: string (required)
    body: string (required)
  }
  psalms: string[] (default: [])
  reflections: string[] (default: [])
  language: 'amharic' | 'english' | 'geez' (default: 'amharic')
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Indexes
- `date` (unique)

---

## 12. Game Scores Collection

**Collection:** `gamescores`

### Schema

```typescript
{
  userId: string (required, indexed)
  game: 'trivia' | 'puzzle' | 'saint' | 'memory' (required, indexed)
  score: number (required)
  metadata: object (default: {})
  createdAt: Date (default: Date.now)
}
```

### Indexes
- `userId, game, score` (compound, score descending)
- `game, score` (compound, score descending)

---

## 13. Media Collection

**Collection:** `media`

### Schema

```typescript
{
  filename: string (required)
  url: string (required)
  cloudinaryId: string (required)
  type: 'image' | 'video' | 'document' | 'audio' (required)
  size: number (required)
  mimeType: string (required)
  uploadedBy: string (required, indexed)
  usageCount: number (default: 0)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Indexes
- `uploadedBy, createdAt` (compound, descending)
- `type`

---

## 14. Notifications Collection

**Collection:** `notifications`

### Schema

```typescript
{
  type: 'assignment' | 'submission' | 'news' | 'system' (required)
  title: string (required)
  body: string (required)
  targetUserIds: string[] (default: [])
  targetRole?: 'all' | 'user' | 'publisher' | 'admin'
  metadata: object (default: {})
  readByUserIds: string[] (default: [])
  sentAt?: Date
  sentCount: number (default: 0)
  readCount: number (default: 0)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Indexes
- `targetUserIds, createdAt` (compound, descending)
- `sentAt` (descending)

---

## 15. Publisher Requests Collection

**Collection:** `publisherrequests`

### Schema

```typescript
{
  userId: string (required, unique, indexed)
  status: 'pending' | 'approved' | 'rejected' (default: 'pending', indexed)
  requestedAt: Date (required)
  reviewedAt?: Date
  reviewedBy?: string
  rejectionReason?: string
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Indexes
- `userId` (unique)
- `status, requestedAt` (compound, descending)

---

## 16. Offline Cache Collection

**Collection:** `offlinecaches`

### Schema

```typescript
{
  key: string (required, indexed)
  entity: string (required, indexed)
  payload: object (required)
  expiresAt?: Date
  version: number (required)
  checksum: string (required)
  deviceId: string (required, indexed)
  userId: string (required, indexed)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Indexes
- `userId, deviceId, entity` (compound)
- `expiresAt` (TTL index for auto-deletion)

---

## Relationships

### User References
- `authorId` → `users._id` (in news, articles)
- `userId` → `users._id` (in comments, reactions, bookmarks, scores)
- `uploadedBy` → `users._id` (in media)
- `reviewedBy` → `users._id` (in publisherrequests)

### Content References
- `newsId` → `news._id` (in newscomments, newsreactions, newsbookmarks)
- `articleId` → `articles._id` (in articlebookmarks)
- `feastId` → `feasts._id` (in events)
- `relatedEventIds` → `events._id[]` (in articles)
- `relatedFeastIds` → `feasts._id[]` (in articles)

---

## Database Setup

### MongoDB Atlas Configuration

1. **Database Name:** `hamere-trufat`
2. **Connection String Format:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/hamere-trufat?retryWrites=true&w=majority
   ```

### Initial Setup

The schemas are automatically created when the backend starts. No manual database creation is needed.

### Indexes

All indexes are automatically created by Mongoose when the schemas are registered. The backend will create them on first connection.

---

## Notes

- All collections use MongoDB's automatic `_id` field
- Timestamps (`createdAt`, `updatedAt`) are automatically managed by Mongoose
- Unique indexes prevent duplicate entries
- Compound indexes optimize common query patterns
- TTL index on `offlinecaches.expiresAt` automatically deletes expired cache entries

