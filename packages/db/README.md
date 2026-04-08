# DB

Isolated Postgres + Prisma app for local database development and migrations.

## Quick start

1. Copy `.env.example` to `.env`.
2. Start Postgres: `pnpm start`
3. Apply migrations: `pnpm migrate:dev`

## Scripts

- `pnpm dev` runs Postgres in the foreground
- `pnpm start` runs Postgres in the background
- `pnpm stop` stops Postgres
- `pnpm reset` removes container and volume
- `pnpm logs` tails Postgres logs
- `pnpm generate` regenerates Prisma client
- `pnpm migrate:dev` creates/applies local migrations
- `pnpm migrate:deploy` applies committed migrations
- `pnpm studio` opens Prisma Studio

## Notes

- Postgres is exposed on port `5433` to avoid conflicts.
- All migration files live in `prisma/migrations`.