# Resume Builder — Documentation

AI-powered resume builder: a pnpm + Turborepo monorepo with a Next.js 16 frontend and a NestJS 11 backend, backed by PostgreSQL, Redis, and Google Gemini.

## Contents

- [Project Overview](resume-builder.md) — monorepo, frontend, backend, shared packages
- [API Reference](api-reference.md) — REST endpoints, WebSocket events, DTOs
- [Database Schema](database.md) — Prisma models and relationships
- [Dev Setup](dev-setup.md) — local environment setup

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                  resume-builder                      │
│  ┌───────────────────┐  ┌──────────────────────────┐ │
│  │     apps/fe        │  │        apps/be           │ │
│  │   Next.js 16       │  │       NestJS 11          │ │
│  │   React 19         │◄─►   Prisma + PostgreSQL    │ │
│  │   Redux + Clerk    │  │    Redis + Gemini AI     │ │
│  │   Port: 3001       │  │      Port: 4000          │ │
│  └───────────────────┘  └──────────────────────────┘ │
│                                                        │
│  packages/  shared · ui · eslint/prettier/ts configs  │
└──────────────────────────────────────────────────────┘
```

## Tech Stack

| Concern | Choice |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js 16, React 19, Redux Toolkit, Tailwind 4, @react-pdf/renderer |
| Backend | NestJS 11, Prisma 7, Socket.IO |
| Auth | Clerk (JWT + Svix webhooks) |
| AI/LLM | Google Gemini 2.5 Flash (`@google/genai`) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (Keyv) |

## Key Features

- Section-based resume editor with live PDF preview (5 templates, 5 fonts, 11 UI locales)
- PDF resume parsing → auto-fill (Gemini)
- Job-description matching → score + gap analysis
- AI-generated application emails
- Real-time voice mock interviews over WebSocket (Gemini Live Audio)
