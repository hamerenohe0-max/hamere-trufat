# Database Schema Documentation

Complete database schema for the Hamere Trufat platform using PostgreSQL (Supabase).

## Database

**Platform:** Supabase (PostgreSQL 15+)
**Extension:** `uuid-ossp` (for UUID generation)

## Tables Overview

The database contains the following 18 tables:

1. **users** - User accounts and authentication
2. **device_sessions** - User device sessions (normalized from embedded array)
3. **news** - News articles and posts
4. **news_bookmarks** - Bookmarked news by users
5. **news_reactions** - Like/dislike reactions on news
6. **news_comments** - Comments on news articles
7. **articles** - Long-form articles
8. **article_bookmarks** - Bookmarked articles by users
9. **events** - Church events and gatherings
10. **feasts** - Religious feasts and celebrations
11. **game_scores** - Game scores and leaderboards
12. **media** - Uploaded media files (images, videos, documents)
13. **notifications** - Push notifications and alerts
14. **progress_reports** - Progress reports with before/after images
15. **daily_readings** - Daily Bible readings (morning/evening)
16. **publisher_requests** - Publisher role requests
17. **offline_cache** - Offline sync cache data
18. **publishers** - Publisher profile data (separated from users)

---

## 1. Users Table

**Table:** `users`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| name | TEXT | NOT NULL | User's display name |
| email | TEXT | NOT NULL, UNIQUE | User's email address |
| password_hash | TEXT | NOT NULL | Bcrypt password hash |
| role | TEXT | NOT NULL, DEFAULT 'user', CHECK (role IN ('user', 'publisher', 'admin')) | User role |
| status | TEXT | NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending', 'active', 'suspended')) | Account status |
| profile | JSONB | DEFAULT '{}' | Profile data (bio, avatar_url, language, region, phone) |
| otp_code | TEXT | | OTP verification code |
| otp_expires_at | TIMESTAMPTZ | | OTP expiration timestamp |
| otp_verified_at | TIMESTAMPTZ | | OTP verification timestamp |
| refresh_token_hash | TEXT | | Hashed refresh token |
| last_login_at | TIMESTAMPTZ | | Last login timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Indexes
- `idx_users_email` on `email`

### Triggers
- `update_users_updated_at`: Sets `updated_at = NOW()` on UPDATE

---

## 2. Device Sessions Table

**Table:** `device_sessions`

This table normalizes what would be an embedded array of devices on the user document in a document database.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Owner user |
| device_id | TEXT | NOT NULL | Device identifier |
| device_name | TEXT | | Human-readable device name |
| device_platform | TEXT | | Platform (iOS, Android, web) |
| app_version | TEXT | | App version at last session |
| last_ip | TEXT | | Last known IP address |
| last_active_at | TIMESTAMPTZ | DEFAULT NOW() | Last activity timestamp |

### Constraints
- `UNIQUE(user_id, device_id)` — one session record per device per user

---

## 3. News Table

**Table:** `news`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| title | TEXT | NOT NULL | News headline |
| summary | TEXT | NOT NULL | Short summary |
| body | TEXT | NOT NULL | Full news body |
| tags | TEXT[] | DEFAULT '{}' | Array of tags |
| author_id | UUID | NOT NULL, REFERENCES users(id) | Author user |
| cover_image | TEXT | | URL of cover image |
| images | TEXT[] | DEFAULT '{}' | Additional image URLs |
| status | TEXT | NOT NULL, DEFAULT 'draft', CHECK (status IN ('draft', 'scheduled', 'published')) | Publication status |
| published_at | TIMESTAMPTZ | | Publication timestamp |
| scheduled_at | TIMESTAMPTZ | | Scheduled publish timestamp |
| views | INTEGER | DEFAULT 0 | View count |
| likes | INTEGER | DEFAULT 0 | Like count |
| dislikes | INTEGER | DEFAULT 0 | Dislike count |
| comments_count | INTEGER | DEFAULT 0 | Comment count |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Indexes
- `idx_news_author` on `author_id`
- `idx_news_status` on `(status, published_at DESC)`

### Triggers
- `update_news_updated_at`: Sets `updated_at = NOW()` on UPDATE

---

## 4. News Bookmarks Table

**Table:** `news_bookmarks`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| news_id | UUID | NOT NULL, REFERENCES news(id) ON DELETE CASCADE | Bookmarked news |
| user_id | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Bookmarking user |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Bookmark timestamp |

### Constraints
- `UNIQUE(news_id, user_id)` — one bookmark per user per news

---

## 5. News Reactions Table

**Table:** `news_reactions`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| news_id | UUID | NOT NULL, REFERENCES news(id) ON DELETE CASCADE | Reacted news |
| user_id | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Reacting user |
| reaction | TEXT | NOT NULL, CHECK (reaction IN ('like', 'dislike')) | Reaction type |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Reaction timestamp |

### Constraints
- `UNIQUE(news_id, user_id)` — one reaction per user per news

---

## 6. News Comments Table

**Table:** `news_comments`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| news_id | UUID | NOT NULL, REFERENCES news(id) ON DELETE CASCADE | Parent news |
| user_id | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Comment author |
| body | TEXT | NOT NULL | Comment text |
| translated_body | TEXT | | Auto-translated text |
| likes | INTEGER | DEFAULT 0 | Like count |
| liked_by | UUID[] | DEFAULT '{}' | Array of user IDs who liked |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Indexes
- `idx_news_comments_news` on `(news_id, created_at DESC)`

### Triggers
- `update_news_comments_updated_at`: Sets `updated_at = NOW()` on UPDATE

---

## 7. Articles Table

**Table:** `articles`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| title | TEXT | NOT NULL | Article title |
| slug | TEXT | NOT NULL, UNIQUE | URL-friendly unique slug |
| content | TEXT | NOT NULL | Article body content |
| excerpt | TEXT | | Short excerpt / preview |
| cover_image | TEXT | | URL of cover image |
| images | TEXT[] | DEFAULT '{}' | Additional image URLs |
| author_id | UUID | NOT NULL, REFERENCES users(id) | Author user |
| published_at | TIMESTAMPTZ | | Publication timestamp |
| related_event_ids | UUID[] | DEFAULT '{}' | Related event IDs |
| related_feast_ids | UUID[] | DEFAULT '{}' | Related feast IDs |
| keywords | TEXT[] | DEFAULT '{}' | SEO keywords |
| views | INTEGER | DEFAULT 0 | View count |
| audio_url | TEXT | | URL of audio narration |
| reading_time | TEXT | | Estimated reading time |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Indexes
- `idx_articles_slug` on `slug` (unique)
- `idx_articles_author` on `author_id`

### Triggers
- `update_articles_updated_at`: Sets `updated_at = NOW()` on UPDATE

---

## 8. Article Bookmarks Table

**Table:** `article_bookmarks`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| article_id | UUID | NOT NULL, REFERENCES articles(id) ON DELETE CASCADE | Bookmarked article |
| user_id | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Bookmarking user |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Bookmark timestamp |

### Constraints
- `UNIQUE(article_id, user_id)` — one bookmark per user per article

---

## 9. Events Table

**Table:** `events`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| name | TEXT | NOT NULL | Event name |
| start_date | TIMESTAMPTZ | NOT NULL | Event start date/time |
| end_date | TIMESTAMPTZ | | Event end date/time |
| location | TEXT | NOT NULL | Event location |
| coordinates | JSONB | | `{ lat: number, lng: number }` |
| description | TEXT | | Event description |
| feast_id | UUID | | Associated feast ID |
| featured | BOOLEAN | DEFAULT FALSE | Featured event flag |
| flyer_images | TEXT[] | DEFAULT '{}' | Flyer image URLs |
| reminder_enabled | BOOLEAN | DEFAULT FALSE | Reminder toggle |
| views | INTEGER | DEFAULT 0 | View count |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Indexes
- `idx_events_start_date` on `start_date`

### Triggers
- `update_events_updated_at`: Sets `updated_at = NOW()` on UPDATE

---

## 10. Feasts Table

**Table:** `feasts`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| name | TEXT | NOT NULL | Feast name |
| date | TIMESTAMPTZ | NOT NULL | Feast date |
| region | TEXT | NOT NULL | Region (e.g. Ethiopian, Eritrean) |
| description | TEXT | | Feast description |
| icon | TEXT | | Icon URL |
| article_ids | UUID[] | DEFAULT '{}' | Related article IDs |
| biography | TEXT | | Saint biography (if applicable) |
| traditions | TEXT[] | DEFAULT '{}' | Tradition descriptions |
| readings | TEXT[] | DEFAULT '{}' | Scripture readings |
| prayers | TEXT[] | DEFAULT '{}' | Prayer texts |
| reminder_enabled | BOOLEAN | DEFAULT FALSE | Reminder toggle |
| views | INTEGER | DEFAULT 0 | View count |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Indexes
- `idx_feasts_date` on `date`
- `idx_feasts_region_date` on `(region, date)`

### Triggers
- `update_feasts_updated_at`: Sets `updated_at = NOW()` on UPDATE

---

## 11. Game Scores Table

**Table:** `game_scores`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Player user |
| game | TEXT | NOT NULL, CHECK (game IN ('trivia', 'puzzle', 'saint', 'memory')) | Game type |
| score | INTEGER | NOT NULL | Player score |
| metadata | JSONB | DEFAULT '{}' | Additional game metadata |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Score timestamp |

### Indexes
- `idx_game_scores_user_game` on `(user_id, game, score DESC)`
- `idx_game_scores_leaderboard` on `(game, score DESC)`

---

## 12. Media Table

**Table:** `media`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| filename | TEXT | NOT NULL | Original filename |
| url | TEXT | NOT NULL | Public URL |
| cloudinary_id | TEXT | NOT NULL | Cloudinary asset ID |
| type | TEXT | NOT NULL, CHECK (type IN ('image', 'video', 'document', 'audio')) | Media type |
| size | INTEGER | NOT NULL | File size in bytes |
| mime_type | TEXT | NOT NULL | MIME type |
| uploaded_by | UUID | NOT NULL, REFERENCES users(id) | Uploading user |
| usage_count | INTEGER | DEFAULT 0 | Times used across app |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Indexes
- `idx_media_uploaded_by` on `(uploaded_by, created_at DESC)`

### Triggers
- `update_media_updated_at`: Sets `updated_at = NOW()` on UPDATE

---

## 13. Notifications Table

**Table:** `notifications`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| type | TEXT | NOT NULL, CHECK (type IN ('assignment', 'submission', 'news', 'system')) | Notification type |
| title | TEXT | NOT NULL | Notification title |
| body | TEXT | NOT NULL | Notification body |
| target_user_ids | UUID[] | DEFAULT '{}' | Targeted user IDs |
| target_role | TEXT | CHECK (target_role IN ('all', 'user', 'publisher', 'admin')) | Target role filter |
| metadata | JSONB | DEFAULT '{}' | Additional metadata |
| read_by_user_ids | UUID[] | DEFAULT '{}' | Users who have read it |
| sent_at | TIMESTAMPTZ | | When notification was sent |
| sent_count | INTEGER | DEFAULT 0 | Delivery count |
| read_count | INTEGER | DEFAULT 0 | Read count |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Indexes
- `idx_notifications_target` GIN index on `target_user_ids`

### Triggers
- `update_notifications_updated_at`: Sets `updated_at = NOW()` on UPDATE

---

## 14. Progress Reports Table

**Table:** `progress_reports`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| title | TEXT | NOT NULL | Report title |
| summary | TEXT | NOT NULL | Report summary |
| pdf_url | TEXT | | URL to PDF report |
| before_image | TEXT | | URL of before image |
| after_image | TEXT | | URL of after image |
| media_gallery | TEXT[] | DEFAULT '{}' | Gallery image URLs |
| timeline | JSONB | DEFAULT '[]' | Array of `{ label, description, date }` |
| likes | INTEGER | DEFAULT 0 | Like count |
| comments_count | INTEGER | DEFAULT 0 | Comment count |
| liked_by | UUID[] | DEFAULT '{}' | Array of user IDs who liked |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Triggers
- `update_progress_reports_updated_at`: Sets `updated_at = NOW()` on UPDATE

---

## 15. Daily Readings Table

**Table:** `daily_readings`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| date | DATE | NOT NULL | Reading date |
| time_of_day | TEXT | NOT NULL, CHECK (time_of_day IN ('Morning', 'Evening')) | Morning or Evening |
| gospel_geez | TEXT | | Gospel text in Ge'ez |
| gospel_amharic | TEXT | | Gospel text in Amharic |
| gospel_audio_url | TEXT | | Gospel audio URL |
| gospel_ref | TEXT | | Gospel scripture reference |
| epistle_geez | TEXT | | Epistle text in Ge'ez |
| epistle_amharic | TEXT | | Epistle text in Amharic |
| epistle_ref | TEXT | | Epistle scripture reference |
| psalm_geez | TEXT | | Psalm text in Ge'ez |
| psalm_amharic | TEXT | | Psalm text in Amharic |
| psalm_audio_url | TEXT | | Psalm audio URL |
| psalm_ref | TEXT | | Psalm scripture reference |
| acts_geez | TEXT | | Acts text in Ge'ez |
| acts_amharic | TEXT | | Acts text in Amharic |
| acts_ref | TEXT | | Acts scripture reference |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Constraints
- `UNIQUE(date, time_of_day)` — one morning and one evening reading per date

### Triggers
- `update_daily_readings_updated_at`: Sets `updated_at = NOW()` on UPDATE

### Row Level Security
- `"Public can view daily readings"` — SELECT for everyone
- `"Admins can manage daily readings"` — ALL for admin users

---

## 16. Publisher Requests Table

**Table:** `publisher_requests`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | NOT NULL, UNIQUE, REFERENCES users(id) ON DELETE CASCADE | Requesting user |
| status | TEXT | NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending', 'approved', 'rejected')) | Request status |
| requested_at | TIMESTAMPTZ | NOT NULL | When requested |
| reviewed_at | TIMESTAMPTZ | | When reviewed |
| reviewed_by | UUID | REFERENCES users(id) | Admin who reviewed |
| rejection_reason | TEXT | | Reason if rejected |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Indexes
- `idx_publisher_requests_status` on `(status, requested_at DESC)`

### Triggers
- `update_publisher_requests_updated_at`: Sets `updated_at = NOW()` on UPDATE

---

## 17. Offline Cache Table

**Table:** `offline_cache`

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| key | TEXT | NOT NULL | Cache key |
| entity | TEXT | NOT NULL | Entity type (e.g. 'news', 'feasts') |
| payload | JSONB | NOT NULL | Cached data |
| expires_at | TIMESTAMPTZ | | Cache expiration |
| version | INTEGER | NOT NULL | Data version for invalidation |
| checksum | TEXT | NOT NULL | Integrity checksum |
| device_id | TEXT | NOT NULL | Device identifier |
| user_id | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Owner user |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Indexes
- `idx_offline_cache_user_device` on `(user_id, device_id, entity)`

### Triggers
- `update_offline_cache_updated_at`: Sets `updated_at = NOW()` on UPDATE

---

## 18. Publishers Table

**Table:** `publishers`

This table stores extended profile data for users with the `publisher` role, normalized out of the `users.profile` JSONB column.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, REFERENCES users(id) ON DELETE CASCADE | Matches users.id |
| bio | TEXT | | Publisher biography |
| phone | TEXT | | Contact phone number |
| region | TEXT | | Geographic region |
| language | TEXT | | Preferred language |
| avatar_url | TEXT | | Profile avatar URL |
| website_url | TEXT | | Personal website |
| social_links | JSONB | DEFAULT '{}' | Social media links |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Indexes
- `idx_publishers_region` on `region`

### Triggers
- `update_publishers_updated_at`: Sets `updated_at = NOW()` on UPDATE

---

## Relationships

### Foreign Key References

| Source Table | Column(s) | References | On Delete |
|-------------|-----------|------------|-----------|
| device_sessions | user_id | users(id) | CASCADE |
| news | author_id | users(id) | — |
| news_bookmarks | news_id | news(id) | CASCADE |
| news_bookmarks | user_id | users(id) | CASCADE |
| news_reactions | news_id | news(id) | CASCADE |
| news_reactions | user_id | users(id) | CASCADE |
| news_comments | news_id | news(id) | CASCADE |
| news_comments | user_id | users(id) | CASCADE |
| articles | author_id | users(id) | — |
| article_bookmarks | article_id | articles(id) | CASCADE |
| article_bookmarks | user_id | users(id) | CASCADE |
| game_scores | user_id | users(id) | CASCADE |
| media | uploaded_by | users(id) | — |
| publisher_requests | user_id | users(id) | CASCADE |
| publisher_requests | reviewed_by | users(id) | — |
| offline_cache | user_id | users(id) | CASCADE |
| publishers | id | users(id) | CASCADE |

### Soft / Array-Based References

| Source Table | Column | Target Table | Nature |
|-------------|--------|-------------|--------|
| events | feast_id | feasts(id) | Optional single FK |
| articles | related_event_ids | events(id) | Array of UUIDs |
| articles | related_feast_ids | feasts(id) | Array of UUIDs |
| feasts | article_ids | articles(id) | Array of UUIDs |
| news_comments | liked_by | users(id) | Array of UUIDs |
| notifications | target_user_ids | users(id) | Array of UUIDs |
| notifications | read_by_user_ids | users(id) | Array of UUIDs |
| progress_reports | liked_by | users(id) | Array of UUIDs |

---

## Database Setup

### Supabase Configuration

1. **Project:** Supabase PostgreSQL 15+
2. **Extension:** `uuid-ossp` (enabled in migration)
3. **Schema:** Public schema (`public`)

### Migrations

Migrations are stored in `backend/supabase/migrations/` and are run sequentially:

| File | Description |
|------|-------------|
| `001_initial_schema.sql` | Core tables (17 tables, trigger function, updated_at triggers) |
| `002_add_news_images.sql` | Adds `images` array column to `news` |
| `003_add_articles_images.sql` | Adds `images` array column to `articles` |
| `004_ensure_news_engagement_columns.sql` | Ensures likes/dislikes/comments_count on news |
| `005_separate_publishers_table.sql` | Creates `publishers` table, migrates existing publisher profiles |
| `006_daily_readings_table.sql` | Recreates `daily_readings` with individual columns and RLS |
| `007_mock_daily_readings.sql` | Inserts mock daily reading data |

An `all_in_one_schema_setup.sql` file combines all migrations into a single script.

### Automated Timestamps

All tables with an `updated_at` column have a `BEFORE UPDATE` trigger that automatically sets `updated_at = NOW()` using the `update_updated_at_column()` function.

### Row Level Security (RLS)

RLS is enabled on the `daily_readings` table:
- Public read access via `"Public can view daily readings"` policy
- Admin write access via `"Admins can manage daily readings"` policy

Additional RLS policies should be applied to other tables as needed for production.

---

## Notes

- All primary keys use `UUID` type generated with `gen_random_uuid()` (except `daily_readings` which uses `uuid_generate_v4()`)
- The `publishers` table uses its `id` column as both PK and FK to `users(id)` (1:1 relationship)
- Array columns (`TEXT[]`, `UUID[]`) and JSONB columns provide flexible data storage
- Unique constraints on junction tables (`news_bookmarks`, `news_reactions`, `article_bookmarks`) prevent duplicate entries
- GIN index on `notifications.target_user_ids` enables efficient array containment queries
- Composite indexes optimize common query patterns (user scores, leaderboards, filtered listings)
