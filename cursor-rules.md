# Cursor Rules

1. **Source of Truth**
   - Requirements reside in `docs/requirements.md` and architecture JSON.
   - Ask for clarification before altering domain behavior.

2. **Code Quality**
   - TypeScript everywhere (strict mode).
   - Exhaustive error handling; never swallow promises.
   - Prefer functional, testable units over monolith functions.

3. **Styling & UI**
   - Tailwind utility-first; shared tokens in `tailwind.config.ts`.
   - Reuse shadcn/ui primitives before building custom ones.

4. **State & Data**
   - Mobile: React Query + Zustand for cache/client state.
   - Admin: React Query + Server Actions when possible.
   - Backend: Domain-driven modules, DTO validation, repository pattern.

5. **APIs**
   - REST for mobile v1, GraphQL gateway optional.
   - Version endpoints (`/api/v1`).
   - Include OpenAPI schemas and Swagger UI in backend.

6. **Testing**
   - Unit: Jest for TS apps, React Testing Library for UI.
   - E2E: Detox (mobile) and Playwright (admin).

7. **Dev Experience**
   - Scripts must run cross-platform.
   - Document environment variables in `.env.example` per app.
   - Keep commit messages conventional (`feat: ...`).

8. **Security**
   - Never commit secrets; use `.env` + Vault instructions in docs.
   - Enforce JWT auth middleware on every protected route.
   - Sanitize/validate all inputs with `class-validator`.

9. **Review Checklist**
   - Lint & format before PR.
   - Update docs when behavior changes.
   - Include screenshots/GIFs for UI-impacting work.

10. **Communication**
    - Keep status updates concise; highlight blockers early.
