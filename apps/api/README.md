# API

Express API service for this monorepo.

## What it uses

- `@repo/db` for Prisma client and database access.
- `@repo/schema` for Zod validation schemas shared with other apps/packages.
- `express` + `cors` for HTTP API layer.

## Why these pieces were added

- Shared `@repo/schema` contracts keep request validation consistent and reusable.
- Shared `@repo/db` centralizes Prisma setup, migrations, and environment handling.
- API routes stay focused on transport and orchestration rather than duplicated validation/DB boilerplate.

## Scripts

- `pnpm --filter api dev` — run API in watch mode (default port `3001`)
- `pnpm --filter api build` — compile API to `dist`
- `pnpm --filter api start` — run compiled API
- `pnpm --filter api lint` — Biome checks/fixes
- `pnpm --filter api check-types` — TypeScript checks

## Endpoints

- `GET /health` — liveness check
- `GET /items` — list items
- `GET /items/:id` — fetch item by id
- `POST /items` — create item (`{ "name": string }`)
- `PUT /items/:id` — update item (`{ "name": string }`)
- `DELETE /items/:id` — delete item
- `POST /llm/stream` — stream model text response (`text/plain` chunks)

### `POST /llm/stream` request body

```json
{
	"prompt": "Explain vector databases in simple terms"
}
```

- `prompt` is required.
- Model/settings are configured server-side in the route and are not user-configurable.

## Local development

From repo root:

```bash
pnpm install
cp packages/db/.env.example packages/db/.env
cp apps/api/.env.example apps/api/.env
pnpm --filter @repo/db start
pnpm --filter @repo/db migrate:dev
pnpm --filter api dev
```

## Notes

- Validation failures return structured error payloads derived from `@repo/schema`.
- Not-found updates/deletes are normalized to `404` responses.
- `/llm/stream` requires `AI_GATEWAY_API_KEY` in `apps/api/.env`.
- Streaming response is plain text chunks (suitable for `fetch` stream readers on the client).