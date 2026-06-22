# resume-builder

The main monorepo — latest version of the CV Builder system. Contains both Frontend and Backend in a single repository.

**Path:** `/home/dangtinh/Documents/resume-builder`
**Build tool:** Turborepo + pnpm workspaces (Node >= 20, pnpm >= 9.15.4)

---

## Monorepo Structure

```
resume-builder/
├── apps/
│   ├── fe/                    # @resume-builder/fe — Next.js 16 (port 3001)
│   └── be/                    # @resume-builder/be — NestJS 11 (port 4000)
├── packages/
│   ├── shared/                # @resume-builder/shared — shared types + utils
│   ├── ui/                    # @resume-builder/ui — Radix UI + Tailwind (48 components)
│   ├── eslint-config/         # base / next-js / react-internal / node configs
│   ├── prettier-config/
│   └── typescript-config/     # base / nextjs / nestjs / react-library
├── docker/                    # Dockerfile.fe, Dockerfile.be, docker-compose.dev.yml
├── docs/                      # this documentation (docsify)
├── package.json               # root workspace scripts
├── pnpm-workspace.yaml        # globs: apps/*, packages/*
└── turbo.json
```

### turbo.json — task pipeline

| Task | dependsOn | cache | outputs |
|---|---|---|---|
| `build` | `^build` | yes | `.next/**` (excl. cache), `dist/**` |
| `dev` | — | no | persistent |
| `lint` / `typecheck` | `^lint` / `^typecheck` | yes | — |
| `test` | `^build` | yes | — |

**Global env passed to tasks:** `NODE_ENV`, `FE_URL`, `PORT`, `CLERK_SECRET_KEY`

### Root scripts (`package.json`)

```bash
pnpm dev              # turbo run dev --parallel  (FE + BE together)
pnpm dev:fe           # run only @resume-builder/fe
pnpm dev:be           # run only @resume-builder/be
pnpm build            # turbo run build
pnpm build:fe         # build only @resume-builder/fe
pnpm build:be         # build only @resume-builder/be
pnpm lint             # turbo run lint
pnpm lint:fix
pnpm typecheck        # turbo run typecheck
pnpm test
pnpm format           # prettier --write "**/*.{ts,tsx,js,mjs,json,md,css}"
pnpm docs             # docsify-cli serve docs --port 3333
pnpm docker:dev       # docker compose -f docker/docker-compose.dev.yml up -d
pnpm docker:dev:down
```

---

## Frontend (`apps/fe`)

`@resume-builder/fe` — Next.js 16.0.10 + React 19.2.1, App Router, multi-locale.

### Tech Stack (exact versions)

| Layer | Library | Version |
|---|---|---|
| Framework | next / react / react-dom | 16.0.10 / 19.2.1 |
| Auth | @clerk/nextjs | 6.36.5 |
| State | @reduxjs/toolkit + react-redux + redux-persist | 2.11.2 / 9.2.0 / 6.0.0 |
| i18n | next-intl | 4.11.0 |
| PDF | @react-pdf/renderer + jsPDF + @rawwee/react-pdf-html | 4.3.2 / 4.0.0 / 1.2.1 |
| Rich Text | quill + react-quill-new | 2.0.3 / 3.7.0 |
| Drag & Drop | @dnd-kit/core + sortable + utilities | 6.3.1 / 10.0.0 / 3.2.2 |
| Forms | react-hook-form + @hookform/resolvers + zod | 7.69.0 / 5.2.2 / 3.25.76 |
| HTTP / WS | axios / socket.io-client | 1.13.3 / 4.8.3 |
| Styling | tailwindcss + framer-motion + next-themes | 4.1.11 / 12.23.26 / 0.4.6 |
| UI kit | @resume-builder/ui (workspace) | — |
| Testing | vitest | 4.0.18 |

### Routes (App Router)

All routes live under `app/[locale]/`. `localePrefix: 'as-needed'` — the `/en` prefix is optional for the default locale.

| Route | Description |
|---|---|
| `/` | Landing page — Hero, Features, HowItWorks, TemplatePreview, Benefits, Stats, Testimonials, FAQ, CTA |
| `/builder` | Main editor — left section nav, center form, sticky right live-preview. `Ctrl/Cmd+S` saves. Tab state via `?step=` |
| `/templates` | Template gallery (2/3/4-col responsive grid); upload PDF or start blank |
| `/auth/sign-in` | Email + password (Clerk) |
| `/auth/sign-up` | Email + password + confirm (Clerk) |
| `/auth/verify-otp` | 6-digit email OTP verification |
| `/auth/sso-callback` | Clerk SSO/OAuth callback |

### Internationalization

- **11 locales:** `en` (default), `vi`, `ja`, `zh`, `th`, `hi`, `es`, `fr`, `ar`, `ko`, `de`
- Config: `i18n/routing.ts` (locales + `defaultLocale: 'en'`), `i18n/request.ts` (deep-merges `en.json` base with locale overlay), `i18n/navigation.ts` (typed `Link`, `redirect`, `useRouter`)
- Messages: `messages/{locale}.json`
- RTL: `dir="rtl"` set for Arabic in `app/[locale]/layout.tsx`
- No `middleware.ts` — locale detection is handled by the `next-intl` plugin in `next.config.mjs`

### Redux Store (`stores/`)

Persisted via redux-persist + AsyncStorage. Two slices:

**`resume.slice.ts`** — `{ resume: Resume | null }`
- `setResume(payload)` — replace entire resume
- `updateResume(payload)` — shallow-merge partial updates
- selector: `resumeSelector`

**`template.slice.ts`** — `{ templateConfig: { format, previewMode }, templateSelected: string | null }`
- `updateTemplateConfigFormat(Partial<Format>)`, `setTemplateSelected(id)`, `updatePreviewMode(bool)`
- selectors: `templateConfigSelector`, `templateFormatSelector`, `templateSelectedSelector`

The `Format` object drives the live PDF preview — typography (`fontSize`, `fontFamily`, `titleSize`, `lineHeight`, `fontWeight`, `letterSpacing`), layout (`sectionSpacing`, `margin`, `columnLayout`, `sectionOrder`, `hiddenSections`, `headerStyle`), and appearance (`color` default `#1e3a8a`, `theme`, `borderStyle`, `dateFormat` default `MM/YYYY`).

### Services (`services/`)

`HttpService` (base, Axios) injects `Authorization: Bearer <token>` via a request interceptor; token comes from Clerk `session.getToken()`. Use `useService(ServiceClass)` / `useHttp()` to get an authenticated instance. `baseURL = NEXT_PUBLIC_BASE_URL`, `withCredentials: true`.

| Service | Method | Calls |
|---|---|---|
| `ResumeService` | `getResume()` | `GET /resumes` |
| | `updateResume(id, dto)` | `POST /resumes/:id` |
| | `resumeParse(file)` | `POST /resumes/parse` (multipart) |
| | `matchResume(resumeId, jd?, file?)` | `POST /resumes/match` (multipart) |
| | `generateEmail(resumeId, jd, matchResult)` | `POST /resumes/:id/generate-email` |
| `InterviewService` | socket.io | connects to `{NEXT_PUBLIC_WS_URL}/interview` (see [API reference](api-reference.md)) |

### Hooks (`hooks/`)

- `useService` / `useHttp` — authenticated service instance (injects Clerk token)
- `useSyncResume` — pushes Redux resume → backend; `{ sync, isSyncing, resume }`, guards against concurrent saves
- `useGlobalSaveShortcut` — binds `Ctrl/Cmd+S` to `useSyncResume().sync()`
- `useInterview` — full interview state machine (`idle → setup → connecting → active → evaluating → result`), Web Audio capture @16kHz + gapless playback, mute, mic/AI analyser nodes for visualization
- `use-template-style.tsx` + `use-template-0{1..5}-style.tsx` — generate `@react-pdf/renderer` StyleSheets from `Format`

### Templates & Fonts

- 5 templates (`configs/template.config.ts`): `template-01` Classic, `-02` Modern, `-03` Elegant, `-04` Compact, `-05` Executive. Each is `({ resume, templateFormat }) => <Page size="A4">`.
- Section rendering registry (`components/templates/section-registry.tsx`) keyed by `SectionType`: personal, summary, skills, education, experience, projects, certifications, languages.
- 5 fonts (`configs/font.config.ts`): Inter, Roboto, Open Sans, Lato, Lobster Two — registered with `@react-pdf/renderer` from `public/fonts/`.

### Env (`apps/fe/.example.env`)

Validated at build with `@t3-oss/env-nextjs` (Zod). Copy to `.env` / `.env.local`.

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_BASE_URL=http://localhost:4000/api/v1   # must match the BE port
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_REDIRECT_URL=/auth/sign-in/sso-callback
# NEXT_PUBLIC_WS_URL=ws://localhost:4000             # optional, for interview
```

> The checked-in `.example.env` points `NEXT_PUBLIC_BASE_URL` at `:3000`. For this monorepo the BE runs on `:4000`, so set it accordingly.

### next.config.mjs highlights

- `output: 'standalone'` (Docker-ready)
- `transpilePackages: ['@resume-builder/ui']`
- `serverExternalPackages: ['@react-pdf/renderer', '@rawwee/react-pdf-html']`
- `experimental.optimizePackageImports`: lucide-react, framer-motion, @clerk/nextjs, react-hook-form, @hookform/resolvers, @reduxjs/toolkit, react-redux, zod
- `images`: all HTTPS hosts allowed; formats AVIF + WebP
- `headers`: 1-year immutable cache for static assets & `/_next/static`
- `typescript.ignoreBuildErrors: true`
- wrapped with `createNextIntlPlugin('./i18n/request.ts')`

### Scripts

```bash
cd apps/fe
pnpm dev            # rm -rf .next && next dev -p 3001
pnpm build          # next build
pnpm start          # next start
pnpm lint / lint:fix
pnpm typecheck      # tsc --noEmit
pnpm test           # vitest
```

---

## Backend (`apps/be`)

`@resume-builder/be` — NestJS 11, modular monolith. Full REST + WebSocket reference in **[api-reference.md](api-reference.md)**; full data model in **[database.md](database.md)**.

### Tech Stack (exact versions)

| Layer | Library | Version |
|---|---|---|
| Framework | @nestjs/core, common, platform-express | ^11.0.1 |
| WebSocket | @nestjs/websockets + platform-socket.io + socket.io | ^11.1.16 / 4.8.3 |
| Config | @nestjs/config | ^4.0.2 |
| Docs | @nestjs/swagger | ^11.2.5 |
| Cache | @nestjs/cache-manager + keyv + @keyv/redis | ^3.1.0 / ^5.6.0 / ^5.1.5 |
| Rate limit | @nestjs/throttler | ^6.5.0 |
| Events | @nestjs/event-emitter | ^3.0.1 |
| ORM | @prisma/client + @prisma/adapter-pg + pg | ^7.2.0 / ^7.2.0 / ^8.17.1 |
| Auth | @clerk/backend + svix (webhook verify) | ^2.29.3 / ^1.84.1 |
| AI/LLM | @google/genai | ^1.41.0 |
| Validation | class-validator + class-transformer + joi | ^0.14.3 / ^0.5.1 / ^18.0.2 |
| Security | helmet + cors | ^8.1.0 / ^2.8.5 |
| Files | pdf-parse + file-type | ^2.4.5 / ^16.5.4 |
| Logging | winston + nest-winston + morgan | ^3.19.0 / ^1.10.2 / ^1.10.1 |

### Module Architecture

```
apps/be/src/
├── main.ts                    # bootstrap (see middleware order below)
├── app/
│   ├── app.module.ts
│   └── health.controller.ts   # GET /health  (@Public)
├── modules/
│   ├── resume/                # CRUD + parse + match + generate-email
│   ├── user/                  # Clerk webhook sync
│   ├── rag/                   # Gemini LLM abstraction
│   └── interview/             # live interview WebSocket gateway
└── libs/
    ├── configs/               # env.config.ts (Env enum), logger.config.ts
    ├── databases/prisma/      # modular schema/ + migrations/
    ├── cache/                 # Keyv/Redis cache service + cache.keys.ts
    ├── guards/                # ClerkAuthGuard, ClerkWebhookGuard, WsAuthGuard
    ├── decorators/            # @Public, @CurrentDbUser, @CurrentProviderUser
    ├── filters/               # GlobalExceptionFilter
    └── pipes/                 # FileMagicBytesValidator, UserByClerkIdPipe
```

Each module follows a layered layout: `presentation/` (controllers, DTOs, gateways, guards, pipes), `application/` (services, commands, listeners, interfaces), `domain/`, `infrastructure/` (repositories, adapters).

### Services by module

| Module | Service | Responsibility |
|---|---|---|
| resume | `ResumeService` | CRUD by user/id, update, delete; Redis cache invalidation |
| | `ResumeParserService` | PDF → structured resume JSON via Gemini |
| | `ResumeMatchingService` | resume vs JD → score + strengths + suggestions |
| | `EmailGenerationService` | application email from resume + JD + match context |
| user | `UserService` | find by Clerk providerId (cached) |
| | `ClerkWebhookService` | process `user.created/updated/deleted` → DB |
| rag | `RagService` | unified Gemini call, optional JSON schema |
| interview | `InterviewService` | live session: audio I/O, silence timers, nudges, history |
| | `InterviewEvaluationService` | post-interview feedback scores + verdict |

### main.ts bootstrap (middleware order)

1. `NestFactory.create(AppModule)` with custom Winston logger
2. global prefix `{API_PREFIX}/v{API_VERSION}` → `/api/v1`
3. `cookieParser()`
4. global `ValidationPipe` — `whitelist`, `transform`, `enableImplicitConversion`, custom `formatError()` exception factory
5. CORS — origin `FRONTEND_ORIGIN`, `credentials: true`
6. `helmet()`
7. `morgan` — `combined` in prod, `dev` otherwise
8. Swagger at `/api` (skipped when `NODE_ENV=production`), Bearer auth scheme
9. `listen(PORT)`

**Global providers:** `ClerkAuthGuard` (`APP_GUARD`), `ThrottlerGuard` (`APP_GUARD`), `GlobalExceptionFilter` (`APP_FILTER`).

### Guards / decorators / pipes / filters

- **Guards:** `ClerkAuthGuard` (Bearer JWT on all routes except `@Public`, skips WS), `ClerkWebhookGuard` (Svix signature on the webhook route), `WsAuthGuard` (Clerk JWT from socket handshake), `ThrottlerGuard` (global 10/60s, override per-route with `@Throttle`).
- **Decorators:** `@Public()`, `@CurrentDbUser()` (resolves Clerk ID → DB `User` via `UserByClerkIdPipe`), `@CurrentProviderUser()` (raw Clerk JWT payload).
- **Pipes:** `FileMagicBytesValidator(['application/pdf'])` (validates by real magic bytes, not MIME header), `UserByClerkIdPipe`.
- **Filters:** `GlobalExceptionFilter` → standardized `ApiErrorResponse { statusCode, timestamp, path, message, error? }`, masks internals in production.

### Cache (`libs/cache`)

- Store: Redis via `@keyv/redis`; default TTL **5 min**; namespace = `REDIS_NAMESPACE` (default `cv-builder`).
- API: `get<T>(key)`, `set<T>(key, value, ttl?)`, `del(key)`.
- Keys: `user:provider:{providerId}`, `resume:user:{userId}`, `resume:id:{resumeId}`. Null values cached 60s to prevent cache penetration. Resume/user mutations invalidate the related keys.

### Env (`apps/be/.env`)

Defined in `src/libs/configs/env.config.ts` (`Env` enum). **Required:** `PORT`, `FRONTEND_ORIGIN`, `CLERK_WEBHOOK_SECRET`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, `GEMINI_API_KEY`.

| Var | Required | Default |
|---|---|---|
| `NODE_ENV` | no | — |
| `PORT` | **yes** | — |
| `FRONTEND_ORIGIN` | **yes** | — |
| `API_PREFIX` | no | `api` |
| `API_VERSION` | no | `1` |
| `CLERK_WEBHOOK_SECRET` | **yes** | — |
| `CLERK_PUBLISHABLE_KEY` | **yes** | — |
| `CLERK_SECRET_KEY` | **yes** | — |
| `DATABASE_URL` | **yes** | — |
| `REDIS_URL` | **yes** | — |
| `REDIS_NAMESPACE` | no | `cv-builder` |
| `THROTTLE_TTL` | no | `60000` |
| `THROTTLE_LIMIT` | no | `10` |
| `GEMINI_API_KEY` | **yes** | — |
| `GEMINI_LIVE_MODEL` | no | `gemini-2.5-flash-native-audio-preview-12-2025` |

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

### Prisma config (`prisma.config.ts`)

```ts
{
  schema: 'src/libs/databases/prisma/schema',
  migrations: { path: 'src/libs/databases/prisma/migrations' },
  datasource: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
}
```

### Scripts

```bash
cd apps/be
pnpm dev                 # nest start --watch
pnpm build               # nest build
pnpm start               # node dist/main
pnpm test / test:cov

pnpm db:generate         # prisma generate  --config prisma.config.ts
pnpm db:push             # prisma db push
pnpm db:migrate          # prisma migrate dev
pnpm db:migrate:deploy   # prisma migrate deploy (prod)
pnpm db:migrate:reset    # prisma migrate reset
pnpm db:studio           # prisma studio (localhost:5555)
```

---

## Shared Packages

### `@resume-builder/shared`
Entry `src/index.ts` re-exports `types/resume`, `types/api`, `utils`.
- Types: `Resume`, `ResumeSection`, `SectionType`, `ResumeSectionItem`, `User`; API `ApiResponse<T>`, `ApiError`, `PaginatedResponse<T>`.
- Utils: `generateId()`, `formatDate(date)`.

### `@resume-builder/ui`
Radix UI + Tailwind 4 component library, **48 components** (accordion → tooltip), plus charts (recharts), command menu (cmdk), toast (sonner), drawer (vaul), OTP input. Exports: `./globals.css`, `./components/*`, `./hooks/*`, `./lib/*`, `./postcss.config`.

### Config packages
- `eslint-config`: `./base`, `./next-js`, `./react-internal`, `./node`
- `prettier-config`: single-quote, semi, `trailingComma: all`, `tabWidth: 2`, `printWidth: 80`
- `typescript-config`: `base.json`, `nextjs.json`, `nestjs.json`, `react-library.json`

---

## Notes / gaps

- **No GitHub Actions** workflows in this repo (`.github/workflows/` absent).
- **No root README** — this `docs/` set is the canonical documentation.
- Backend has **no committed `.env.example`** — use the table above.
