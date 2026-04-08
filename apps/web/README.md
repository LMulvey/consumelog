# Web App

Next.js frontend for this monorepo.

## What it uses

- `@repo/ui` for shared UI components.
- `@repo/tailwind-config` for shared Tailwind v4 theme/utilities.
- `@repo/db` for typed database access in server-side code.

## Why these pieces are wired this way

- Shared UI CSS is imported in `app/globals.css` via `@repo/ui/styles.css`.
- Shared Tailwind primitives are imported via `@repo/tailwind-config`.
- PostCSS is delegated to `@repo/tailwind-config/postcss` in `postcss.config.js`.

This keeps Tailwind and design tokens consistent across apps/packages and prevents style drift.

## Scripts

- `pnpm --filter web dev` — run Next.js dev server on `http://localhost:3000`
- `pnpm --filter web build` — production build
- `pnpm --filter web start` — run production build
- `pnpm --filter web lint` — Biome checks/fixes
- `pnpm --filter web check-types` — Next typegen + TypeScript checks

## Local development

From repo root:

```bash
pnpm install
pnpm --filter @repo/db start
pnpm --filter @repo/db migrate:dev
pnpm --filter api dev
pnpm --filter web dev
```

## Notes

- If Tailwind classes from shared UI appear missing, verify `app/globals.css` still imports both `@repo/ui/styles.css` and `@repo/tailwind-config`.
- Prefer consuming shared components from `@repo/ui/*` instead of duplicating component logic inside the app.
