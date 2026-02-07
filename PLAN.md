# Development Plan: lock-in

## Phase 1: Project Foundation
- [x] **Scaffolding:** Initialize Next.js project with TypeScript, Tailwind CSS, and App Router.
- [x] **Dependency Management:** Ensure `lucide-react` and `zod` are installed.
- [x] **Configuration:** Setup `.env.example`.
- [x] **Global Styling:** Define the "Focus" color palette in `src/app/globals.css`.

## Phase 2: UI Implementation (Focus-First)
- [x] **Main Layout:** Minimalist, high-contrast black/white theme.
- [x] **Intent Component:** Subject input with auto-focus.
- [x] **Duration Component:** Quick-select buttons + custom input.
- [x] **Trigger Button:** "Commence Session" button with loading state.
- [x] **Active Session UI:** Large tabular-nums countdown timer.

## Phase 3: Integration & Logic
- [x] **API Layer:** `lib/hia.ts` implemented for `SESSION_START`.
- [x] **Session State:** Local state + `localStorage` persistence.
- [x] **The "Lock" Workflow:** Integrated with HIA `ingest` endpoint.

## Phase 4: Polish & Resilience
- [x] **Error Handling:** Red error alerts for API failures.
- [x] **Persistence:** `localStorage` used to keep timer running across refreshes.
- [ ] **Mobile Optimization:** (Completed in Phase 2 via Tailwind responsiveness).
- [x] **Zero-Friction Enhancements:** `Enter` key support for starting sessions.

## Phase 5: Dockerization & Deployment
- [x] **Dockerfile:** Create a multi-stage build Dockerfile for the Next.js app.
- [x] **Documentation:** Update README with Docker build/run instructions.
