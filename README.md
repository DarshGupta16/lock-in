# lock-in — The Trigger for My Focus Sessions

> **"Commit to the work, lock the distractions."**

`lock-in` is a minimalist web application used to initiate focus sessions. It serves as the frontend "trigger" for the **Hold Idiot Accountable (HIA)** system.

This repository contains a Next.js application designed to be simple, fast, and frictionless. Its primary purpose is to capture intent (subject and duration) and signal the HIA system to begin enforcement.

---

## The Workflow

1. **Set Intent**: Enter the subject of the focus session and intended duration.
2. **Trigger Enforcement**: Upon clicking "Commence Session", the app sends a `SESSION_START` event to the HIA Ingest API.
3. **Network Lockdown**: The HIA backend triggers network enforcement (Pi-hole/Tailscale) and session logging.
4. **Active Focus**: The UI transitions to a minimalist countdown timer.

---

## Features

- **Brutalist UI**: High-contrast, distraction-free interface designed for speed.
- **HIA Integration**: Direct communication with the `hia` ingest endpoint.
- **Session Persistence**: Timer survives page refreshes via `localStorage`.
- **Dockerized**: Ready for containerized deployment.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS.
- **Runtime**: Bun.
- **Icons**: Lucide React.
- **API**: Fetch API with Zod validation.
- **Deployment**: Docker (Multi-stage build).

---

## Commands

| Task | Command |
| :--- | :--- |
| Install Dependencies | `bun install` |
| Development Server | `bun run dev` |
| Production Build | `bun run build` |
| Start Production | `bun start` |
| Docker Build | `docker build -t lock-in .` |

---

## Design Philosophy

- **Zero Friction**: Starting a session should take less than 5 seconds.
- **Intentionality**: Requiring a subject forces definition of work before starting.
- **Commitment**: Once "Commence" is pressed, the network locks down. There is no "undo".