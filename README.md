# Skelly

A pnpm + Turborepo scaffold for building a small full-stack TypeScript app with:

- a Next.js frontend (`apps/web`)
- an Express API (`apps/api`)
- a shared Prisma DB package (`packages/db`)
- shared validation/schema types (`packages/schema`)
- a shared UI component package (`packages/ui`)

---

To use, run:

```
pnpm dlx degit lmulvey/skelly my-app
```

---

## Why this scaffold exists

This setup is optimized for quickly building product ideas while keeping boundaries clean:

- **Apps stay thin** and focus on runtime behavior.
- **Domain concerns are shared** (`@repo/schema`, `@repo/db`, `@repo/ui`) to avoid copy/paste drift.
- **Tooling is centralized** (`@repo/biome-config`, `@repo/typescript-config`, `@repo/tailwind-config`) so standards are consistent everywhere.
- **Turbo caching + task graph** keeps local and CI runs fast as the workspace grows.

---

## Workspace layout

### Apps

- `apps/web` — Next.js app router frontend
  - Uses `@repo/ui` components and `@repo/tailwind-config` styles.
  - Imports shared UI CSS from `@repo/ui/styles.css` in `app/globals.css`.
- `apps/api` — Express API (TypeScript)
  - Exposes `/health` and `/items` CRUD routes.
  - Uses `@repo/schema` for Zod validation and `@repo/db` for Prisma access.

### Packages

- `packages/ui` (`@repo/ui`) — shared React UI library
  - Exports component entry points via `"./*": "./src/components/ui/*.tsx"`.
  - Exports shared stylesheet via `"./styles.css": "./src/styles/globals.css"`.
  - Uses package-local `#...` aliases (for example `#utils`) via `package.json#imports` + `tsconfig` paths.
  - Why: keeps internal imports ergonomic without leaking app-specific aliases (like `~/...`) into consumers.

- `packages/tailwind-config` (`@repo/tailwind-config`) — shared Tailwind v4 primitives
  - Exports `tailwind-styles.css` and a reusable PostCSS config (`./postcss`).
  - Why: one source of theme/utilities used by both app and package styles.

- `packages/db` (`@repo/db`) — Prisma + Postgres integration
  - Owns Prisma schema, migrations, generated client, and Dockerized local Postgres.
  - Exports a configured `prisma` client from `src/client.ts`.
  - Why: DB concerns are isolated from apps and reusable across services.

- `packages/schema` (`@repo/schema`) — shared Zod schemas + types
  - Exports request/response validation models used by API and clients.
  - Why: shared contracts reduce mismatch bugs between frontend and backend.

- `packages/biome-config` / `packages/typescript-config`
  - Centralized linting and TS config presets for consistency.

---

## Tailwind + UI integration (important)

Tailwind works across app + shared UI because all three pieces are present:

1. `apps/web/app/globals.css` imports both:
   - `@repo/ui/styles.css`
   - `@repo/tailwind-config`
2. `apps/web/postcss.config.js` uses `@repo/tailwind-config/postcss`.
3. Shared UI package exposes its stylesheet through `@repo/ui/styles.css`.

If one of these is missing, classes from shared UI components can appear to “not work”.

---

## Scripts

From repo root:

- `pnpm dev` — runs all `dev` tasks in Turbo
- `pnpm build` — runs all build tasks
- `pnpm lint` — runs Biome across workspace
- `pnpm check-types` — runs type checks across workspace

Per-app/package examples:

- `pnpm --filter web dev`
- `pnpm --filter api dev`
- `pnpm --filter @repo/db start`
- `pnpm --filter @repo/db migrate:dev`

---

## Getting started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Set up database env

   ```bash
   cp packages/db/.env.example packages/db/.env
   ```

3. Start Postgres and apply migrations

   ```bash
   pnpm --filter @repo/db start
   pnpm --filter @repo/db migrate:dev
   ```

4. Run apps

   ```bash
   pnpm dev
   ```

Default ports:

- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- Postgres (docker): `5433`

---

## Notes and conventions

- Use `#...` aliases only inside `packages/ui` for internal module ergonomics.
- Use package imports (`@repo/ui`, `@repo/schema`, `@repo/db`) across workspace boundaries.
- Keep validation rules in `@repo/schema`; avoid duplicating Zod schemas in apps.
- Keep DB logic in `@repo/db`; consume the exported client in apps.
