# Phase 2 — Architecture & Planning

## 1. React Native Module Folder Structure

```
mobile-app/src
├─ features/
│  ├─ auth/
│  ├─ assignments/
│  ├─ submissions/
│  ├─ news/
│  ├─ articles/
│  ├─ events/
│  ├─ feasts/
│  ├─ notifications/
│  └─ offline/
│      └─ {components,hooks,screens,services,types,state}
├─ navigation/
│  └─ routes.ts
├─ services/
├─ store/
└─ types/
   └─ models.ts
```

Each feature bundle includes `components`, `hooks`, `screens`, `services`, `types`, and `state` to keep UI, data, and state logic isolated.

## 2. Backend Module Folder Structure

```
backend/src/modules
├─ auth/
├─ assignments/
├─ submissions/
├─ users/
├─ news/
├─ articles/
├─ events/
├─ feasts/
├─ notifications/
├─ media/
├─ roles/
└─ sync/
    └─ {controllers,services,dto,entities,schemas}
```

Future providers/repositories live under each module’s `services` folder; transport contracts stay in `dto`.

## 3. Admin Panel Module Folder Structure

```
admin/src/features
├─ dashboard/
├─ assignments/
├─ submissions/
├─ news/
├─ articles/
├─ events/
├─ feasts/
├─ users/
├─ roles/
└─ notifications/
    └─ {components,pages,hooks,services,types}
```

Each feature exposes server actions plus client hooks to keep React Query boundaries clear.

## 4. Navigation Structure (Mobile)

- **Root Stack**: `Onboarding`, `Auth`, `MainTabs`, `AssignmentDetails`, `SubmissionForm`, `NewsDetails`, `EventDetails`, `FeastDetails`, `Settings`.
- **Tab Navigator (inside `MainTabs`)**: `DashboardTab`, `AssignmentsTab`, `ContentTab`, `ProfileTab`.
- **Drawer**: optional `MainDrawer` wrapper to expose Offline Sync, Settings, Support if discovery shows value; stub reserved in `navigation/routes.ts`.
- Guarding strategy: stack screens use auth guard, tabs optionally filter by role (e.g., publishers see `ContentTab` authoring tools).

Reference implementation outline: `mobile-app/src/navigation/routes.ts`.

## 5. API Routes by Module

| Module | REST Routes | Notes |
| --- | --- | --- |
| Auth | `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/register` | JWT issuing + refresh |
| Users | `GET /api/v1/users`, `GET /api/v1/users/:id`, `POST /api/v1/users`, `PATCH /api/v1/users/:id`, `DELETE /api/v1/users/:id` | Admin + publisher scoped |
| Assignments | `GET /api/v1/assignments`, `GET /api/v1/assignments/:id`, `POST /api/v1/assignments`, `PATCH /api/v1/assignments/:id`, `POST /api/v1/assignments/:id/assign`, `POST /api/v1/assignments/:id/complete` | |
| Submissions | `POST /api/v1/submissions`, `GET /api/v1/submissions`, `GET /api/v1/submissions/:id`, `PATCH /api/v1/submissions/:id/status` | Upload endpoints stream to S3 |
| News | `GET/POST/PATCH/DELETE /api/v1/news` | Publisher-only mutations |
| Articles | `GET/POST/PATCH/DELETE /api/v1/articles` | GraphQL alias `articles` as well |
| Events | `GET/POST/PATCH/DELETE /api/v1/events` | Supports query params for date range |
| Feasts | `GET/POST/PATCH/DELETE /api/v1/feasts` | Linked to events/articles |
| Notifications | `POST /api/v1/notifications/send`, `GET /api/v1/notifications/feed` | Integrates Expo push + email |
| Media | `POST /api/v1/media/upload`, `GET /api/v1/media/:id` | Signed URLs |
| Sync | `POST /api/v1/sync/pull`, `POST /api/v1/sync/push` | Offline delta sync |

GraphQL schema will mirror core collections (`users`, `assignments`, `submissions`, `content` union) for admin analytics.

## 6. Database Models

- **User**: `_id`, `name`, `email`, `phone`, `passwordHash`, `role`, `status`, `lastActiveAt`, `profile`, `preferences`.
- **Assignment**: `_id`, `title`, `description`, `region`, `priority`, `dueDate`, `status`, `assigneeIds`, `submissionIds`, `metadata`, `audit`.
- **Submission**: `_id`, `assignmentId`, `collectorId`, `payload`, `mediaRefs`, `geo`, `deviceId`, `syncState`, `review`, `audit`.
- **News**: `_id`, `title`, `summary`, `body`, `tags`, `authorId`, `status`, `publishedAt`.
- **Article**: `_id`, `title`, `slug`, `content`, `coverImage`, `authorId`, `publishedAt`, `relatedEventIds`, `relatedFeastIds`.
- **Event**: `_id`, `name`, `startDate`, `endDate`, `location`, `description`, `feastId`, `featured`.
- **Feast**: `_id`, `name`, `date`, `region`, `description`, `icon`, `articleIds`.
- **Notification**: `_id`, `type`, `title`, `body`, `targetAudience`, `userIds`, `deliveryChannels`, `status`.
- **OfflineCache**: `_id`, `entity`, `payload`, `checksum`, `expiresAt`, `deviceId`.

## 7. Model Relationships

- `User (1) — (M) Assignment` via `assigneeIds`.
- `Assignment (1) — (M) Submission`.
- `User (1) — (M) Submission` via `collectorId`.
- `Feast (1) — (M) Event`; `Event (M) — (M) Article`.
- `Article (M) — (1) User` (author).
- `News` optionally references `Event` or `Feast` through `relatedIds`.
- `Notification (M) — (M) User` by `userIds`.
- Cascade delete rules: removing Users soft-deactivates assignments/submissions instead of hard delete.

## 8. Frontend TypeScript Interfaces

See `mobile-app/src/types/models.ts` for shared interfaces consumed across mobile + admin packages (can be symlinked or copied to a shared package in Phase 3). Definitions cover `User`, `Assignment`, `Submission`, `NewsItem`, `Article`, `Event`, `Feast`, `Notification`, and `OfflineCacheRecord`.

## 9. Offline Caching Architecture

- **Layers**: Zustand store ➜ React Query cache ➜ SQLite/AsyncStorage persistence (via `expo-sqlite` + `expo-file-system`).
- **Sync flow**: 
  1. React Query mutations enqueue payloads into `offline/state/pendingQueue`.
  2. Background task (`expo-task-manager`) flushes queue when `networkStatus === online`.
  3. `sync` module negotiates delta with `/api/v1/sync/pull` & `/api/v1/sync/push`, storing version + checksum per entity (`OfflineCacheRecord`).
- **Conflict handling**: server timestamps win; device keeps shadow copy to retry with patched payload.
- **Admin**: read-only caching through IndexedDB (Next.js) using React Query + persistQueryClient.

## 10. Push Notification Architecture

- **Backend**: `notifications` module publishes to Expo Push + SendGrid via job queue (BullMQ). Stores delivery receipts for retries.
- **Mobile**: `notifications/services` registers for Expo push tokens, syncs token to backend (`POST /notifications/register`). Foreground notifications route through `notifications/hooks/useNotificationRouter`.
- **Admin**: send composer UI triggers backend job; also consumes notifications via WebSocket/SSE for alert center.

## 11. Permissions & Roles

- Roles: `user` (field collector), `publisher` (content team), `admin` (operations).
- Backend guard stack:
  - JWT guard ensures identity.
  - `RolesGuard` matches `@Roles('publisher')` metadata.
  - `PoliciesGuard` grants fine-grained checks (ownership, region restrictions).
- Mobile UI hides privileged routes; admin Next.js pages use middleware to redirect unauthorized roles.
- Permissions matrix:

| Capability | User | Publisher | Admin |
| --- | --- | --- | --- |
| View assignments | ✅ | ✅ | ✅ |
| Manage assignments | ❌ | ❌ | ✅ |
| Submit field data | ✅ | ❌ | ✅ |
| Manage content (news/articles/events/feasts) | ❌ | ✅ | ✅ |
| Manage users/roles | ❌ | ❌ | ✅ |
| Send notifications | ✅ (self-trigger) | ✅ (content) | ✅ |

## 12. Environment Variable Structure

| App | File | Keys |
| --- | --- | --- |
| Mobile (`mobile-app`) | `.env`, `.env.example` | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_PUSH_KEY`, `EXPO_PUBLIC_BUILD_ENV`, `EXPO_PUBLIC_MAPS_TOKEN` |
| Backend (`backend`) | `.env`, `.env.example` | `NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `S3_BUCKET`, `S3_REGION`, `SENDGRID_KEY`, `EXPO_PUSH_TOKEN`, `REDIS_URL`, `LOGTAIL_TOKEN` |
| Admin (`admin`) | `.env.local`, `.env.example` | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_SENTRY_DSN`, `UPLOAD_TOKEN`, `FEATURE_FLAGS` |

All env files stay out of git; `docs/requirements.md` references the `.env.example` obligation per app.

---

Phase 2 deliverables are now in place: module folders exist, navigation defined, API/database/relationship plans documented, frontend models codified, and caching/notifications/permissions/env strategies outlined.


