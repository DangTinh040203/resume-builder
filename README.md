# Resume Builder

AI-powered resume builder — a **pnpm + Turborepo** monorepo with a **Next.js 16** frontend and a **NestJS 11** backend, backed by PostgreSQL, Redis, and Google Gemini.

## Features

- 📝 Section-based resume editor with live PDF preview (5 templates, 5 fonts)
- 🌐 11 UI locales (next-intl), RTL support
- 📄 PDF resume parsing → auto-fill (Gemini)
- 🎯 Job-description matching → score + gap analysis
- ✉️ AI-generated application emails
- 🎙️ Real-time voice mock interviews over WebSocket (Gemini Live Audio)

## Stack

| Concern          | Choice                                                               |
| ---------------- | -------------------------------------------------------------------- |
| Monorepo         | pnpm workspaces + Turborepo                                          |
| Frontend         | Next.js 16, React 19, Redux Toolkit, Tailwind 4, @react-pdf/renderer |
| Backend          | NestJS 11, Prisma 7, Socket.IO                                       |
| Auth             | Clerk (JWT + Svix webhooks)                                          |
| AI/LLM           | Google Gemini 2.5 Flash (`@google/genai`)                            |
| Database / Cache | PostgreSQL 16 / Redis 7                                              |

## Structure

```
apps/
  fe/          # @resume-builder/fe — Next.js (port 3001)
  be/          # @resume-builder/be — NestJS (port 4000)
packages/
  shared/      # shared types + utils
  ui/          # Radix UI + Tailwind component library
  eslint-config/  prettier-config/  typescript-config/
docker/        # Dockerfile.fe, Dockerfile.be, docker-compose.dev.yml
docs/          # documentation (docsify)
```

## Quick start

```bash
# 1. Start infra (PostgreSQL + Redis + pgAdmin)
pnpm docker:dev

# 2. Install deps
pnpm install

# 3. Create env files: apps/be/.env and apps/fe/.env.local
#    (see docs/dev-setup.md)

# 4. Set up the database
pnpm --filter @resume-builder/be db:generate
pnpm --filter @resume-builder/be db:migrate

# 5. Run both apps
pnpm dev
```

| Service     | URL                          |
| ----------- | ---------------------------- |
| Frontend    | http://localhost:3001        |
| Backend API | http://localhost:4000/api/v1 |
| Swagger     | http://localhost:4000/api    |

## Scripts

```bash
pnpm dev            # run FE + BE in parallel
pnpm dev:fe         # run only the frontend
pnpm dev:be         # run only the backend
pnpm build          # build all (build:fe / build:be for one)
pnpm lint           # lint all (lint:fix to autofix)
pnpm typecheck
pnpm test
pnpm format         # prettier across the repo
pnpm docs           # serve docs at http://localhost:3333
pnpm docker:dev     # start dev infra (docker:dev:down to stop)
```

## Documentation

Full docs live in [`docs/`](docs/README.md) (run `pnpm docs` to browse):

- [Project Overview](docs/resume-builder.md)
- [API Reference](docs/api-reference.md)
- [Database Schema](docs/database.md)
- [Dev Setup](docs/dev-setup.md)

## Requirements

Node >= 20, pnpm >= 9.15.4, Docker.
