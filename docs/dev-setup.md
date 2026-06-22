# Dev Setup

Local development setup for the `resume-builder` monorepo.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | >= 20 |
| pnpm | >= 9.15.4 (`npm i -g pnpm`) |
| Docker + Docker Compose | latest |
| PostgreSQL 16 + Redis 7 | via Docker (below) or local |

**Accounts / keys needed:**

| Key | Source |
|---|---|
| `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | [clerk.com](https://clerk.com) → Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks → endpoint → Signing Secret |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API Key |

---

## Quick start

```bash
cd /home/dangtinh/Documents/resume-builder

# 1. Start infra (PostgreSQL + Redis + pgAdmin)
pnpm docker:dev

# 2. Install dependencies
pnpm install

# 3. Create env files (see below)
#    apps/be/.env  and  apps/fe/.env.local

# 4. Set up the database
cd apps/be
pnpm db:generate
pnpm db:migrate
cd ../..

# 5. Run both apps
pnpm dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:4000/api/v1 |
| Swagger UI | http://localhost:4000/api |
| Prisma Studio | http://localhost:5555 (`pnpm --filter @resume-builder/be db:studio`) |
| pgAdmin | http://localhost:5050 (admin@admin.com / admin) |

Stop infra with `pnpm docker:dev:down`.

---

## Infrastructure (`docker/docker-compose.dev.yml`)

`pnpm docker:dev` brings up:

| Service | Image | Port | Notes |
|---|---|---|---|
| PostgreSQL | postgres:16-alpine | 5432 | db `resume_builder_db`, `postgres/postgres` |
| Redis | redis:7-alpine | 6379 | |
| pgAdmin | dpage/pgadmin4 | 5050 | admin@admin.com / admin |

Data persists in named volumes (`postgres_data`, `redis_data`, `pgadmin_data`).

If you prefer raw containers instead of compose:

```bash
docker run -d --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
docker run -d --name redis -p 6379:6379 redis:7
```

---

## Backend env (`apps/be/.env`)

Required: `PORT`, `FRONTEND_ORIGIN`, `CLERK_WEBHOOK_SECRET`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, `GEMINI_API_KEY`.

```env
PORT=4000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:3001
API_PREFIX=api
API_VERSION=1

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/resume_builder_db
REDIS_URL=redis://localhost:6379
REDIS_NAMESPACE=resume-builder

CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

GEMINI_API_KEY=...
GEMINI_LIVE_MODEL=gemini-2.5-flash-native-audio-preview-12-2025

THROTTLE_TTL=60000
THROTTLE_LIMIT=10
```

See the full env table in [Project Overview → Backend env](resume-builder.md#env-appsbeenv).

## Frontend env (`apps/fe/.env.local`)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_REDIRECT_URL=/auth/sign-in/sso-callback
# NEXT_PUBLIC_WS_URL=ws://localhost:4000   # optional, interview feature
```

> A starter `apps/fe/.example.env` is checked in, but it points `NEXT_PUBLIC_BASE_URL` at `:3000`. Set it to `:4000` to match this backend.

---

## Clerk webhook (local)

Clerk needs a public URL to deliver user lifecycle events to `POST /api/v1/users/clerk`. Use ngrok:

```bash
ngrok http 4000          # → https://xxxx.ngrok.io
```

Clerk Dashboard → Webhooks → Add Endpoint:
- URL: `https://xxxx.ngrok.io/api/v1/users/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`
- Copy the Signing Secret → `CLERK_WEBHOOK_SECRET`

---

## Serve the docs

```bash
pnpm docs     # docsify-cli serve docs --port 3333  → http://localhost:3333
```

---

## Run in Docker (production-style)

```bash
# from repo root
docker build -f docker/Dockerfile.be -t resume-builder-be .
docker build -f docker/Dockerfile.fe -t resume-builder-fe .
```

Both Dockerfiles are multi-stage (`deps → builder → runner`) on `node:20-alpine`. BE runs `node dist/main` on `:4000`; FE runs the Next.js standalone server on `:3001`.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Prisma client missing | `cd apps/be && pnpm db:generate` |
| Port in use | `lsof -i :3001` (or `:4000`) → `kill -9 <PID>` |
| Containers won't start | `docker compose -f docker/docker-compose.dev.yml down -v` then `pnpm docker:dev` |
| Webhook not received | verify ngrok URL + `CLERK_WEBHOOK_SECRET` match the Clerk Dashboard |
