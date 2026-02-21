# Bun Migration Plan: lock-in

This plan outlines the surgical migration from npm to Bun to improve build speeds and runtime performance, while maintaining the project's "Focus-First" minimalist philosophy.

## Phase 1: Branch Preparation
- [x] **Create Migration Branch:** Create and check out a new branch dedicated to this migration.
  - `git checkout -b migration/npm-to-bun`
- [ ] **Initial Push:** Push the new branch to the remote repository.
  - `git push -u origin migration/npm-to-bun`

## Phase 2: Dependency & Lockfile Migration
- [x] **Generate Bun Lockfile:** Run `bun install` to generate the text-based `bun.lock` file.
  - `bun install`
- [x] **Remove npm Lockfile:** Delete the now-redundant `package-lock.json`.
  - `rm package-lock.json`
- [x] **Commit & Push:**

## Phase 3: Dockerization Update
- [x] **Update Dockerfile:** Modify the multi-stage build to use `oven/bun` images.
  - Replace `node:20-alpine` with `oven/bun:1-alpine`.
  - Update `deps` stage: Use `bun install --frozen-lockfile`.
  - Update `builder` stage: Use `bun run build`.
  - Update `runner` stage: Continue using `node:20-alpine` for the standalone output.
- [x] **Update docker-compose:** Ensure any build arguments or image references in `compose.yml` align with the new Dockerfile.
- [x] **Commit & Push:**

## Phase 4: Local Environment & Documentation
- [x] **Update Scripts:** Audit `package.json` scripts to ensure compatibility with `bun run`.
- [x] **Update Documentation:** Revise `README.md` and `GEMINI.md` to replace npm commands with Bun equivalents.
- [x] **Commit & Push:**

## Phase 5: Verification & Validation
- [ ] **Local Build Check:** Run `bun run build` to verify the Next.js standalone output.
- [ ] **Docker Build Check:** Run `docker build -t lock-in .` to verify the containerization process.
- [ ] **Runtime Check:** Start the container and verify the HIA API integration and session persistence.
- [ ] **Commit & Push:** (Any final fixes discovered during verification).
