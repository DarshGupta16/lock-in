# Implementation Plan: Break Feature

This plan outlines the implementation of the "Break" feature in the `lock-in` project, corresponding to the feature recently added to the `hold-idiot-accountable` (HIA) backend.

## 1. Research Findings (HIA Commit `60a857a`)
- **Events**: `BREAK_START` and `BREAK_STOP` added to `EventType`.
- **Payloads**:
  - `BREAK_START`: Includes `duration_sec` and `next_session` (subject, duration, blocklist).
  - `BREAK_STOP`: Includes optional `reason`.
- **Backend Behavior**: `BREAK_STOP` automatically triggers `SESSION_START` with the `next_session` details stored during `BREAK_START`.

## 2. Type Definitions (`lib/types.ts`)
- Update `EventType` enum:
  ```typescript
  export enum EventType {
    SESSION_START = "SESSION_START",
    SESSION_STOP = "SESSION_STOP",
    BREAK_START = "BREAK_START",
    BREAK_STOP = "BREAK_STOP",
  }
  ```
- Define `BreakStartSchema` and `BreakStopSchema`.
- Update `SessionState` to support the new status and break data:
  ```typescript
  export interface SessionState {
    status: 'IDLE' | 'FOCUSING' | 'BREAK';
    subject?: string;
    startTime?: string;
    durationSec?: number;
    endTime?: string;
    blocklist?: string[];
    // For Break state
    nextSession?: {
      subject: string;
      durationSec: number;
    };
  }
  ```

## 3. API Integration (`lib/hia.ts`)
- Implement `startBreak(durationSec: number, nextSession: { subject: string, planned_duration_sec: number, blocklist: string[] })`.
- Implement `stopBreak(reason?: string)`.
- Update `getSessionStatus` to parse `activeBreak` from the HIA response and map it to the internal `SessionState`.

## 4. Session Hook (`hooks/useSession.ts`)
- Update `useSession` state to include `status`.
- Update `syncStatus` effect:
  - If `data.activeSession` is present -> `status: 'FOCUSING'`.
  - Else if `data.activeBreak` is present -> `status: 'BREAK'`.
  - Else -> `status: 'IDLE'`.
- Map `activeBreak` fields (`started_at`, `duration_sec`) to `startTime`, `durationSec`, and `endTime`.
- Expose `handleStartBreak` and `handleStopBreak`.

## 5. UI Implementation

### 5.1 Initiation Form (`components/InitiationForm.tsx`)
- Add a "Take a Break" button below "Commence Session".
- Default break duration: 10 minutes (add a small toggle or preset for this).
- When clicked, it calls `handleStartBreak` using current form values (subject, session duration, blocklist) as the "next session".

### 5.2 Break Session Component (`components/BreakSession.tsx`)
- New component inspired by `ActiveSession.tsx`.
- Displays "ON BREAK" in indigo/blue theme (as seen in HIA).
- Shows a countdown timer.
- Displays "Upcoming: [Subject]" to remind the user what's next.
- "Skip Break" button to end break early.

### 5.3 Page Integration (`app/page.tsx`)
- Refactor the conditional rendering:
  - `status === 'IDLE'` -> `InitiationForm`
  - `status === 'FOCUSING'` -> `ActiveSession`
  - `status === 'BREAK'` -> `BreakSession`

## 6. Execution Workflow & Source Control
- **Phase 1: Foundations**
  - Update `lib/types.ts` and `lib/hia.ts`.
  - Commit: `feat(api): add break event types and API methods`
  - Push.
- **Phase 2: Logic**
  - Update `hooks/useSession.ts`.
  - Commit: `feat(hooks): update useSession to handle break state`
  - Push.
- **Phase 3: UI Components**
  - Create `components/BreakSession.tsx`.
  - Update `components/InitiationForm.tsx`.
  - Commit: `feat(ui): implement BreakSession and update InitiationForm`
  - Push.
- **Phase 4: Integration**
  - Update `app/page.tsx`.
  - Final polish and testing.
  - Commit: `feat(ui): integrate break feature into main page`
  - Push.

---
*Verified against HIA backend implementation details.*
