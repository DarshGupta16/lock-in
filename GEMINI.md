# GEMINI.md - Project Context & Instructions

## Project Resources
- **README.md:** General project description and philosophy.
- **SETUP.md:** Installation and Docker instructions (git-ignored).
- **PLAN.md:** Detailed development roadmap and feature checklist.
- **GEMINI.md:** Instructional context and project standards (this file).
- **Dockerfile:** Containerization for deployment.

## Core Architecture
The project is structured as a modern Next.js application:
- `/app`: Contains the main pages and session handling logic.
- `/components`: Reusable UI elements (timer, inputs).
- `/lib`: API clients and utility functions for external services (HIA API).

## Building and Running
Based on the `README.md`, the following commands are used for development:

| Task | Command |
| :--- | :--- |
| Install Dependencies | `bun install` |
| Development Server | `bun run dev` |
| Production Build | `bun run build` |
| Start Production | `bun start` |
| Docker Build | `docker build -t lock-in .` |

## Development Conventions
- **Focus on Speed:** The UI must remain minimalist and fast (target < 5 seconds to start a session).
- **No Distractions:** Avoid adding features that complicate the core "lock-in" workflow.
- **Environment Variables:** External endpoints for HIA must be configured via `.env` files (not committed).
- **Commitment Loop:** Ensure the "Start" action is definitive, triggering all enforcement hooks immediately.
- **Modularity:** Keep components small and focused. Use TypeScript for all new code.

## Current Project Status
- **Core Implementation Complete:** Next.js 15 app with minimalist Focus UI and HIA API integration.
- **Persistence:** `localStorage` implemented for session continuity.
- **Deployment Ready:** Dockerfile and Docker Compose configuration finalized.
- **Documentation:** README and PLAN updated with current architecture.