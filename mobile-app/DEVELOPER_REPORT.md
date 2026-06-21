# Hamere Trufat — Mobile App Developer Report

> **Tech Stack:** Expo SDK 54 · React Native 0.81.5 · React 19.1 · Expo Router 6 · TypeScript 5.9 · Zustand 5 · React Query 5

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Navigation & Routing](#2-navigation--routing)
3. [Feature Overview](#3-feature-overview)
4. [Data Flow Architecture](#4-data-flow-architecture)
5. [State Management](#5-state-management)
6. [API Layer](#6-api-layer)
7. [Offline Architecture](#7-offline-architecture)
8. [Theming](#8-theming)
9. [Shared Components](#9-shared-components)
10. [Key Dependencies](#10-key-dependencies)
11. [Environment Variables](#11-environment-variables)
12. [Testing](#12-testing)
13. [Backend Integration Points](#13-backend-integration-points)
14. [Developer Notes](#14-developer-notes)

---

## 1. Project Structure

```
mobile-app/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx               # Root layout (providers + splash gate)
│   ├── index.tsx                 # Entry → IndexGateScreen
│   ├── (auth)/                   # Auth screens (no tabs)
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── otp.tsx
│   │   └── forgot-password.tsx
│   └── (protected)/              # Authenticated screens (tab bar)
│       ├── _layout.tsx           # Tab navigator with CustomTabBar
│       ├── home.tsx
│       ├── profile.tsx           # Hidden from tab bar
│       ├── settings.tsx
│       ├── sync.tsx              # Hidden stub
│       ├── articles/
│       ├── events/
│       ├── feasts/
│       ├── games/
│       ├── news/
│       ├── progress/
│       └── readings/
├── src/
│   ├── components/               # Shared UI components
│   ├── config/                   # API config, design tokens (colors)
│   ├── data/                     # Mock data (7 files)
│   ├── features/                 # Feature modules (13 features)
│   │   ├── articles/
│   │   ├── auth/
│   │   ├── bootstrap/
│   │   ├── dashboard/
│   │   ├── events/
│   │   ├── feasts/
│   │   ├── games/                # 13 games + data
│   │   ├── news/
│   │   ├── prayers/
│   │   ├── profile/
│   │   ├── progress/
│   │   ├── readings/
│   │   ├── settings/
│   │   └── sync/
│   ├── hooks/                    # Shared hooks (8 offline-aware hooks)
│   ├── navigation/               # Legacy route types
│   ├── services/                 # API client, auth, offline services
│   │   └── offline/              # SQLite cache, queue, sync, audio cache
│   ├── store/                    # Zustand stores (4 persisted)
│   ├── types/                    # Domain models
│   └── utils/                    # Date formatting
├── __tests__/                    # Jest tests
├── app.config.js                 # Expo config (plugins, env)
├── package.json
├── tsconfig.json
└── .env                          # EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USE_MOCK_DATA
```

---

## 2. Navigation & Routing

The app uses **Expo Router 6** (file-based routing) with nested layouts.

### Root Layout (`app/_layout.tsx`)

Wraps the entire app in:
- `ErrorBoundary` > `SafeAreaProvider` > `ThemeProvider` > `QueryClientProvider`
- Always-mounted `OfflineBanner`
- Stack navigator: `(auth)` and `(protected)` groups

### Auth Group `(auth)/`

Standalone screens (no tabs): Login, Register, OTP verification, Forgot Password.

### Protected Group `(protected)/_layout.tsx`

**Custom Tab Bar** (`CustomTabBar.tsx`) with 7 tabs:

| Tab | Icon | Stack |
|-----|------|-------|
| Prayers | book | DailyReadings, Alarms |
| News | newspaper | NewsList, NewsDetail |
| Articles | document | ArticleList, ArticleDetail, Author |
| **Home** | **center button** | Dashboard (single screen) |
| Games | gamepad | GamesIndex + 13 game screens |
| Events | calendar | EventsList, EventDetail |
| Settings | gear | Settings, Profile (hidden), Sync (hidden) |

**Hidden screens** (can navigate to but no tab link): `profile`, `sync`, `feasts/**`, `progress/**`.

Each tab group has its own nested `Stack` navigator defined in `app/(protected)/<feature>/_layout.tsx`.

### Route Registration

Expo Router auto-registers files in `app/`. The entry point `app/index.tsx` renders `IndexGateScreen` which shows the splash screen, hydrates auth, then redirects to either `(auth)/login` or `(protected)/home`.

---

## 3. Feature Overview

### 3.1 Bootstrap (`features/bootstrap/`)
- **IndexGateScreen** — App entry gate. Shows animated splash, hydrates persisted auth, auto-starts guest session, redirects to home or login.

### 3.2 Auth (`features/auth/`)
- **LoginScreen** — Email/password login with guest session fallback.
- **RegisterScreen** — Name, email, phone, password registration.
- **OtpScreen** — 6-digit OTP code entry.
- **ForgotPasswordScreen** — Two-stage: request reset code → new password.

### 3.3 Dashboard/Home (`features/dashboard/`)
- **HomeScreen** — Main hub: daily Gospel reading card, horizontal news/ articles carousels, events list, user avatar in header.
- **DashboardSections** — Card-based layout for Daily Gospel, News, Progress, Featured Article, Today's Saint, Upcoming Event, Quick Links.
- **dashboard.api.ts** — Fetches from 5 parallel endpoints to compose the dashboard summary.

### 3.4 Daily Readings & Prayers (`features/readings/`, `features/prayers/`)
- **DailyReadingsScreen** — Date navigator with Morning/Evening tabs, Geez/Amharic toggle, audio playback for Gospel.
- **AlarmsScreen** — 7 canonical prayer hour toggles (Negh, Selest, Scdest, Teseat, Serk, Neven, Lelit).
- Audio via `expo-av`, alarms via `expo-notifications`.

### 3.5 News (`features/news/`)
- **NewsListScreen** — Scrollable list of news cards.
- **NewsDetailScreen** — Full article with multi-image carousel, reactions (like/dislike), bookmarks, translation, comments, related articles.
- **NewsImageGallery** — Instagram-style carousel with full-screen pinch-to-zoom viewer. Handles Google Drive link conversion.
- **useNewsStore** — Persisted Zustand store for offline bookmarks and reactions.

### 3.6 Articles & Authors (`features/articles/`)
- **ArticlesListScreen** — Scrollable list of article cards.
- **ArticleDetailScreen** — Full spiritual article with author card, reactions, bookmark, share, keywords.
- **AuthorScreen** — Social-media-style profile: cover photo, avatar, stats, follow, posts/about tabs, list/grid toggle.
- **AuthorCard / PublisherProfile** — Reusable author display components.

### 3.7 Events (`features/events/`)
- **EventsListScreen** — Featured/past events with date badges.
- **EventDetailScreen** — Flyer images, info card, add-to-calendar (expo-calendar), open-in-maps, reminder toggle, share.

### 3.8 Feasts (`features/feasts/`)
- **FeastsListScreen** — Month-grouped feast calendar.
- **FeastDetailScreen** — Biography, traditions, readings, prayers, reminder.

### 3.9 Games (`features/games/`)
13 educational/spiritual games with local leaderboard:

| Screen | Game Type |
|--------|-----------|
| TriviaScreen | Bible trivia quiz |
| WhoSaidItScreen | Quote-to-speaker matching |
| ScriptureScrambleScreen | Unscramble Bible words |
| ParableScreen | Identify parables from clues |
| MemoryScreen | Card memory match |
| FaithBingoScreen | Faith-themed bingo |
| BibleJourneyScreen | Journey through Bible events |
| VirtueQuestScreen | Christian virtue challenges |
| ChurchHistoryScreen | Church history quiz |
| PrayerMatchupScreen | Match prayers to purposes |
| BibleCharadesScreen | Act-out Bible stories |
| GuessTheSaintScreen | Identify saints from clues |
| PuzzleScreen | Word puzzles |

- **useGameStore** — Persisted leaderboard (top 10 per game, max 100 scores).
- **games_data.ts** — All question/answer datasets.

### 3.10 Progress Reports (`features/progress/`)
- **ProgressListScreen** — Cards with title, summary, likes.
- **ProgressDetailScreen** — PDF viewer (opens via Linking), Before/After image comparison, timeline component, like/comment.

### 3.11 Profile (`features/profile/`)
- **ProfileScreen** — Avatar picker (expo-image-picker), name, bio, language, region, phone fields. Avatar uploads to `POST /api/v1/users/me/avatar` (backend uploads to Cloudinary).

### 3.12 Settings (`features/settings/`)
- **SettingsScreen** — Theme (light/dark/system), font scale, notification prefs, offline mode prefs, edit profile link, logout.

### 3.13 Sync (`features/sync/`)
- **SyncScreen** — Placeholder stub for offline queue management UI (not yet implemented).

---

## 4. Data Flow Architecture

```
Screen Component
  │
  ├── Feature Hook (e.g. useNewsList)
  │     wraps React Query
  │     │
  │     ├── Feature API Service (e.g. news.api.ts)
  │     │     │
  │     │     └── apiFetch<T>()  (src/services/api.ts)
  │     │           │
  │     │           ├── Injects Bearer token from useAuthStore
  │     │           ├── Sends JSON body (or FormData for file uploads)
  │     │           ├── Auto-refreshes tokens on 401
  │     │           └── Normalizes network & HTTP errors
  │     │
  │     └── Offline Layer (optional)
  │           ├── CacheService (SQLite read-through cache)
  │           ├── QueueService (deferred mutations)
  │           └── AudioService (FileSystem audio cache)
  │
  └── Zustand Store (persisted to AsyncStorage)
        ├── useAuthStore — user, tokens, guest
        ├── usePreferencesStore — theme, font, notifications, offline
        ├── useNewsStore — bookmarks, reactions (offline)
        └── useGameStore — leaderboard scores
```

### Pattern: Feature Module Structure

Each feature follows a consistent pattern:

```
features/<name>/
├── screens/      # Screen components (consumed by app/<route>/[file].tsx)
├── components/   # Feature-specific UI components
├── hooks/        # React Query wrappers (useFeature*, useMutation*)
├── services/     # API service objects (feature.api.ts)
└── state/        # Zustand stores (optional, for offline data)
```

---

## 5. State Management

### Zustand Stores (all persisted to AsyncStorage via `zustand/middleware/persist`)

| Store | Key | Purpose |
|-------|-----|---------|
| `useAuthStore` | `hamere-auth` | User object, JWT tokens, guest flag, hydration state |
| `usePreferencesStore` | `hamere-preferences` | Theme (light/dark/system), language, font scale, notification prefs, offline mode prefs |
| `useNewsStore` | `hamere-news` | Offline bookmarks (`Record<id, title>`) and reactions (`Record<id, like|dislike>`) |
| `useGameStore` | `hamere-games` | Game scores array (capped at 100), leaderboard top-10 per game |

### React Query

All server state is managed via `@tanstack/react-query`. Key conventions:
- Query keys follow the pattern `['feature']` or `['feature', id]`
- Mutations invalidate related queries on success
- Custom hooks wrap both queries and mutations for each feature
- Offline-aware hooks (`useOfflineQuery`, etc.) provide cached fallbacks

---

## 6. API Layer

### Core: `apiFetch<T>()` (`src/services/api.ts`)

- **Base URL**: `EXPO_PUBLIC_API_URL` (from `api.config.ts`), defaults to `http://192.168.0.117:4000/api/v1`
- **Auto-auth**: Reads `accessToken` from `useAuthStore` and injects as `Bearer` header
- **Auto-refresh**: On 401, attempts token refresh using `refreshToken`, retries the original request once
- **Error handling**: Normalizes HTTP errors to readable messages (network, 400, 401, 403, 404, 500)
- **Content-Type**: Defaults to `application/json`; for file uploads, use raw `fetch()` with `FormData` (see `auth.ts` → `uploadAvatar`)

### Auth Service (`src/services/auth.ts`)

Endpoints:
- `POST /auth/register` — no auth
- `POST /auth/login` — no auth
- `POST /auth/verify-otp` — no auth
- `POST /auth/forgot-password` — no auth
- `POST /auth/reset-password` — no auth
- `POST /auth/guest` — no auth
- `GET /users/me` — requires auth
- `PATCH /users/me` — requires auth (JSON body for profile fields)
- `POST /users/me/avatar` — requires auth (multipart file upload)
- `POST /auth/logout` — requires auth

### Feature API Services

Each feature module has its own API service file (e.g., `news.api.ts`, `articles.api.ts`) that:
1. Defines response types
2. Maps backend snake_case to frontend camelCase
3. Calls `apiFetch<T>()` for each endpoint
4. Supports mock data fallback (checked via `shouldUseMockData()`)

---

## 7. Offline Architecture

The app has a comprehensive offline layer built on SQLite, FileSystem, and a queue system.

### Database (`offline/database.ts`)

SQLite database (`hamere_offline.db`) with 7 tables:
- `news_cache`, `articles_cache`, `feasts_cache`, `readings_cache` — entity caches
- `bookmarks` — user bookmarks
- `audio_cache` — cached audio metadata
- `offline_queue` — deferred mutation actions

### Cache Service (`offline/cache.service.ts`)

CRUD operations for cached entities:
- `getCachedNews()`, `cacheNews()`, `clearNewsCache()` (and same for articles, feasts, readings, bookmarks)
- `clearAllCaches()` — cleanup on logout

### Queue Service (`offline/queue.service.ts`)

- `enqueue(action)` — adds a pending action to the queue
- `getPendingActions()` — retrieves all unprocessed actions
- `markComplete/failed/processing(id)` — status tracking
- `getQueueSize()` — used by OfflineBanner to show count
- `clearCompleted()` — cleanup

### Sync Service (`offline/sync.service.ts`)

- `syncQueue()` — processes all pending actions in FIFO order
- `syncCacheOnOpen()` — pre-fetches and caches all entity types
- `syncInBackground()` — scheduled synchronization

### Audio Service (`offline/audio.service.ts`)

- `cacheAudio(url)` — downloads to FileSystem document directory
- `getCachedAudio(url)` — returns local URI if cached, null otherwise
- `getCachedAudioUrl(url)` — returns cached URI or starts background download
- `cleanExpiredAudio()` / `clearAudioCache()` — cleanup

### Background Sync (`offline/background-sync.ts`)

- Registers periodic background fetch via `expo-background-fetch`
- `performBackgroundSync()` — syncs queue + refreshes caches
- Runs every 15 minutes minimum when app is backgrounded

### Offline-Aware Hooks (`hooks/useOffline*.ts`)

- **`useOfflineQuery`** — Drop-in replacement for `useQuery` with AsyncStorage cache fallback
- **`useOfflineActions`** — Queues comments/likes/bookmarks when offline
- **`useOfflineCache`** — Triggers sync when coming online (via NetInfo listener)
- **`useOfflineAudio`** — Serves cached audio or falls back to network download
- **`useOfflineQueue`** — Manages queue size display and triggers auto-sync on connectivity restoration

---

## 8. Theming

Implemented via React Context (`ThemeProvider`) reading from `usePreferencesStore`:

- **Modes**: `light`, `dark`, `system` (reads device color scheme via Appearance API)
- **Design Tokens**: Defined in `src/config/colors.ts`
  - `primary`: deep green `#14381B`
  - `secondary`: warm brown `#9D6531`
  - Light/dark theme objects: `background` (primary, secondary, tertiary), `text` (primary, secondary, tertiary, inverse), `border` (light, medium, subtle)
  - Semantic colors: `success` (green), `error` (red), `warning` (amber), `info` (blue)
- **Font Scaling**: 0.8x to 1.5x via `fontScale` preference
- **`ThemedText`** component auto-applies theme colors and font scale based on `type` prop
- **`CustomTabBar`** adapts to both light and dark themes
- **`OfflineBanner`** / **`NetworkStatus`** — themed status indicators

---

## 9. Shared Components

Located in `src/components/`:

| Component | Purpose |
|-----------|---------|
| `ThemeProvider` | React context for light/dark/system theming |
| `ThemedText` | Text with auto-theme colors and font scaling |
| `CustomTabBar` | 7-tab bottom bar with center home button |
| `OfflineBanner` | Sliding banner when offline (shows queue count) |
| `NetworkStatus` | Animated offline indicator overlay |
| `ErrorBoundary` | Class-based error boundary with retry |
| `ErrorView` | Error display with emoji, message, retry |
| `SplashScreen` | Animated logo splash (2.5s) |
| `LoadingSkeleton` | Shimmer skeleton and card skeleton |
| `InfoCard` | Simple card with title, subtitle, children |
| `ArticleCard` | Article preview (standard/featured variants) |
| `NewsCard` | News preview (standard/featured variants) |
| `EventCard` | Event card with date, name, location |
| `AudioPlayer` | Full audio player (play, seek, speed, volume) |

---

## 10. Key Dependencies

| Category | Package | Version |
|----------|---------|---------|
| Framework | expo | ~54.0.25 |
| UI | react-native | 0.81.5 |
| UI | react | 19.1.0 |
| Router | expo-router | ^6.0.15 |
| Navigation | @react-navigation/native | ^7.1.21 |
| Navigation | @react-navigation/native-stack | ^7.7.0 |
| Server State | @tanstack/react-query | ^5.90.10 |
| Client State | zustand | ^5.0.8 |
| Storage | @react-native-async-storage/async-storage | ^1.23.1 |
| Database | expo-sqlite | ~15.0.2 |
| Audio | expo-av | ~14.0.6 |
| Notifications | expo-notifications | ^0.32.16 |
| Calendar | expo-calendar | ~13.0.5 |
| Image Picker | expo-image-picker | ~17.0.11 |
| File System | expo-file-system | ~18.0.4 |
| Network Info | @react-native-community/netinfo | ^11.3.1 |
| Icons | @expo/vector-icons | ^15.0.3 |
| Haptics | expo-haptics | ~13.0.1 |
| Testing | @testing-library/react-native | ^12.8.0 |
| Testing | jest-expo | ~54.0.1 |

---

## 11. Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `EXPO_PUBLIC_API_URL` | `http://192.168.0.117:4000/api/v1` | Backend API base URL |
| `EXPO_PUBLIC_USE_MOCK_DATA` | `false` | Toggle mock data fallback |
| `EXPO_PUBLIC_SENTRY_DSN` | (empty) | Sentry error tracking (not wired yet) |

API config resolution order:
1. `process.env.EXPO_PUBLIC_API_URL`
2. `app.config.js` → `expo.extra.EXPO_PUBLIC_API_URL`
3. Hardcoded fallback

---

## 12. Testing

- **Framework**: Jest with `jest-expo` preset
- **Library**: `@testing-library/react-native` + `@testing-library/jest-native`
- **Test files**: Located in `src/__tests__/`
  - `components/OfflineBanner.test.tsx`
  - `hooks/useNetworkStatus.test.ts`
  - `offline/offline.test.ts`
  - `services/offline/cache.service.test.ts`
  - `services/offline/queue.service.test.ts`
- **Run tests**: `npm test` / `npm run test:watch` / `npm run test:coverage`
- **Custom runner**: `test-runner.js` at project root

---

## 13. Backend Integration Points

The mobile app communicates with the NestJS backend at `api/v1/`. Key endpoints:

| Endpoint | Module | Auth | Notes |
|----------|--------|------|-------|
| `POST /auth/*` | Auth | No | Register, login, OTP, password reset |
| `POST /auth/guest` | Auth | No | Auto-creates guest session |
| `POST /auth/refresh` | Auth | Refresh | Token refresh |
| `POST /auth/logout` | Auth | Yes | Session invalidation |
| `GET /users/me` | Users | Yes | Current user profile |
| `PATCH /users/me` | Users | Yes | Update profile (JSON body) |
| `POST /users/me/avatar` | Users | Yes | Upload avatar (multipart file) |
| `GET /news` | News | Optional | Published news list |
| `GET /news/:id` | News | Optional | News detail with reactions |
| `POST /news/:id/react` | News | Yes | Toggle like/dislike |
| `POST /news/:id/bookmark` | News | Yes | Toggle bookmark |
| `POST /news/:id/translate` | News | Optional | Translate body |
| `GET /articles` | Articles | Optional | Published articles |
| `GET /articles/:id` | Articles | Optional | Article detail |
| `GET /articles/author/:id` | Articles | Optional | Author profile |
| `POST /articles/:id/react` | Articles | Yes | Toggle like/dislike |
| `POST /articles/:id/bookmark` | Articles | Yes | Toggle bookmark |
| `GET /events` | Events | Optional | Events list |
| `GET /events/:id` | Events | Optional | Event detail |
| `POST /events/:id/reminder` | Events | Yes | Toggle reminder |
| `GET /feasts` | Feasts | Optional | Feast list |
| `GET /feasts/:id` | Feasts | Optional | Feast detail |
| `POST /feasts/:id/reminder` | Feasts | Yes | Toggle reminder |
| `GET /progress` | Progress | Optional | Progress reports |
| `GET /progress/:id` | Progress | Optional | Report detail |
| `POST /progress/:id/like` | Progress | Yes | Toggle like |
| `POST /progress/:id/comments` | Progress | Yes | Add comment |
| `GET /daily-readings/:date` | Readings | Optional | Daily reading |
| `POST /daily-readings/reminder` | Readings | Yes | Set reading reminder |
| `GET /dashboard/summary` | Dashboard | Optional | Aggregate home data |
| `GET /prayers/:date` | Prayers | Optional | Prayer reading |

---

## 14. Developer Notes

### Running the App

```bash
cd mobile-app

# Install dependencies (if needed)
npm install

# Start Expo dev server
npx expo start

# Run on specific platforms
npx expo start --android
npx expo start --ios
npx expo start --web
```

### Environment Setup

Copy `.env.example` to `.env` and set:
```
EXPO_PUBLIC_API_URL=http://<your-local-ip>:4000/api/v1
EXPO_PUBLIC_USE_MOCK_DATA=false
```

The backend must be running locally on port 4000 for the app to work. The default config points to `192.168.0.117:4000` — change this to your machine's local IP.

### Common Patterns

1. **Adding a new screen**: Create the file in `features/<name>/screens/`, then create a route file in `app/<route>/` that re-exports it (or renders inline for simple cases).

2. **Adding a new API endpoint**: Add the method to the feature's `*.api.ts` service, then wrap in a hook using `useQuery` / `useMutation`.

3. **Offline support**: For new features, use `useOfflineQuery` instead of `useQuery` and add cache tables to the SQLite schema if needed.

4. **Theme support**: Use `useTheme()` hook from `ThemeProvider` for dynamic colors. Use `ThemedText` instead of `<Text>` for auto-themed typography.

5. **File uploads**: The app uses `FormData` + raw `fetch()` rather than `apiFetch` for multipart uploads (see `auth.ts` → `uploadAvatar`). The backend endpoint must accept `FileInterceptor('file')`.

### Known Issues / TODOs

- `HomeScreen` uses `user.image` but the model has `user.avatarUrl` — inconsistency to resolve
- `SyncScreen` is a placeholder stub
- Assignments feature has hooks but no screens
- `EXPO_PUBLIC_SENTRY_DSN` is not wired into the app
- Mock data is used as a hard fallback when the API fails (not just when `USE_MOCK_DATA=true`)
- Some game screens may use hardcoded placeholder text
- `dashboard.api.ts` fetches 5 parallel endpoints without error isolation (one failure fails all)
