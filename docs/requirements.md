# Hamere Trufat Requirements

## Vision
Deliver a unified platform for Hamere Trufat to coordinate mobile data collection, backend services, and an admin dashboard for analytics and configuration.

## Tech Stack
- Mobile: React Native + Expo (TypeScript)
- Backend: NestJS (TypeScript) + MongoDB (Mongoose ODM)
- Admin: Next.js (App Router, TypeScript) + Tailwind CSS + shadcn/ui
- Tooling: Node.js 24 LTS, npm, Git, Expo CLI, Nest CLI

## Functional Requirements
1. Mobile collectors can authenticate, sync assignments, capture submissions (text, images, GPS), and work offline.
2. Backend exposes secure REST + GraphQL APIs, handles auth (JWT), data validation, and scheduling.
3. Admin dashboard displays submission analytics, assignment management, and staff roles/permissions.
4. Notifications via Expo push or email when new assignments or approvals occur.
5. Audit logging for all CRUD operations.

## Non-Functional Requirements
- Security: role-based access control, encrypted secrets, OWASP best practices.
- Reliability: automated testing, CI-ready scripts, environment-based configs.
- Performance: paginate large datasets, cache hot reads, CDN-ready assets.
- Scalability: modular architecture ready for microservices, container-friendly.

## Deliverables for Phase 1
- Workspace structure (`mobile-app`, `backend`, `admin`, `docs`).
- Installed tooling (Node, Git, Expo CLI, Nest CLI).
- Initialized apps with baseline dependencies.
- Architecture JSON and cursor rules to align future contributors.
