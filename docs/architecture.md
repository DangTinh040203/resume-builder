# Architecture

How the system is composed and how a request flows end to end. Per-feature flows live under [Features](features/resume-editor.md).

---

## System overview

```mermaid
flowchart TB
    subgraph Client["Browser — apps/fe (Next.js 16, :3001)"]
        UI["React 19 UI<br/>builder / templates / auth"]
        Redux["Redux store<br/>resume + template slices"]
        PDF["@react-pdf/renderer<br/>live preview + export"]
        WS1["socket.io-client"]
        UI <--> Redux
        Redux --> PDF
    end

    subgraph Server["apps/be (NestJS 11, :4000)"]
        REST["REST /api/v1<br/>resume · user · health"]
        GW["WS gateway /interview"]
        RAG["RagService → GeminiAdapter"]
        Prisma["Prisma 7"]
        Cache["Cache (Keyv)"]
    end

    subgraph Ext["External services"]
        Clerk["Clerk<br/>auth + webhooks"]
        Gemini["Google Gemini<br/>flash-lite + live-audio"]
        PG[("PostgreSQL 16")]
        Redis[("Redis 7")]
    end

    UI -->|"Bearer JWT"| REST
    WS1 <-->|"audio frames"| GW
    REST --> RAG
    GW --> RAG
    RAG --> Gemini
    REST --> Prisma --> PG
    REST --> Cache --> Redis
    Clerk -->|"webhook user.*"| REST
    UI -.->|"sign-in / token"| Clerk
```

---

## Monorepo layout

```mermaid
flowchart LR
    root["resume-builder<br/>(pnpm + turbo)"]
    root --> fe["apps/fe"]
    root --> be["apps/be"]
    root --> shared["packages/shared<br/>types + utils"]
    root --> ui["packages/ui<br/>Radix + Tailwind"]
    root --> cfg["packages/*-config<br/>eslint · prettier · ts"]
    fe -.imports.-> ui
    fe -.imports.-> shared
    be -.imports.-> shared
```

Turbo orchestrates tasks across workspaces; `build` is cached and `dev` is persistent. See [Project Overview](resume-builder.md).

---

## Backend layering (per module)

Every feature module (`resume`, `user`, `rag`, `interview`) follows the same hexagonal-ish split:

```mermaid
flowchart TB
    P["presentation/<br/>controllers · DTOs · gateways · guards · pipes"]
    A["application/<br/>services · commands · listeners · interfaces"]
    D["domain/<br/>domain objects · enums"]
    I["infrastructure/<br/>repositories · adapters"]
    P --> A
    A --> D
    A --> I
    I --> D
```

- **presentation** — HTTP/WS entry points + validation
- **application** — use-case orchestration (services), interfaces (ports)
- **domain** — pure business types
- **infrastructure** — adapters that fulfill the ports (Prisma repos, Gemini adapter)

---

## Request lifecycle (HTTP)

Order of middleware/guards a request passes through, from `main.ts` + global providers:

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant M as Middleware<br/>(cookieParser · helmet · morgan · CORS)
    participant V as ValidationPipe
    participant G as ClerkAuthGuard
    participant T as ThrottlerGuard
    participant H as Controller handler
    participant F as GlobalExceptionFilter

    C->>M: HTTP request (Bearer JWT)
    M->>V: whitelist + transform DTO
    V->>G: verify Clerk JWT (skip if @Public)
    G->>T: rate-limit check (10/60s)
    T->>H: invoke handler
    H-->>C: ApiResponse
    Note over H,F: any throw → GlobalExceptionFilter<br/>→ standardized ApiErrorResponse
```

---

## Authentication model

Two distinct paths share Clerk:

| Path | Mechanism | Guard |
|---|---|---|
| REST requests | `Authorization: Bearer <Clerk JWT>` | `ClerkAuthGuard` (global, bypass with `@Public`) |
| WebSocket `/interview` | JWT in `handshake.auth.token` | `WsAuthGuard` (socket middleware) |
| Clerk → server webhook | Svix signature | `ClerkWebhookGuard` |

The DB `User` is resolved from the Clerk id on demand by `@CurrentDbUser()` → `UserByClerkIdPipe` → `UserService.findByProviderId()` (Redis-cached). See [Auth & Webhooks](features/auth-and-webhooks.md).

---

## AI integration

All LLM access funnels through one port so providers stay swappable:

```mermaid
flowchart LR
    S1["ResumeParserService"] --> RAG
    S2["ResumeMatchingService"] --> RAG
    S3["EmailGenerationService"] --> RAG
    RAG["RagService<br/>(LLMProvider port)"] --> GA["GeminiAdapter"]
    GA -->|"gemini-2.5-flash-lite<br/>(JSON schema mode)"| Gem["Gemini API"]
    GW["InterviewGateway"] --> GLA["GeminiLiveAdapter"]
    GLA -->|"native-audio model<br/>(bidi streaming)"| GemLive["Gemini Live"]
```

- Non-streaming features request **structured JSON** validated against a per-feature schema (`RESUME_SCHEMA`, `MATCH_CV_JD_SCHEMA`, `GENERATE_EMAIL_SCHEMA`, `EVALUATION_SCHEMA`).
- User-supplied text is run through `PromptSanitizer` before being embedded in prompts (prompt-injection defense).

---

## Data & caching

- **PostgreSQL** via Prisma — one `User` ↔ one `Resume` (+ child sections). See [Database Schema](database.md).
- **Redis** via Keyv — caches `user:provider:{id}` and `resume:user:{id}` (5-min TTL, 60s for nulls). Mutations invalidate the related keys.

---

## Feature deep-dives

- [Resume Editor & Live Preview](features/resume-editor.md)
- [PDF Export](features/pdf-export.md)
- [Resume Parsing](features/resume-parsing.md)
- [Job Matching](features/job-matching.md)
- [Email Generation](features/email-generation.md)
- [Live Interview](features/live-interview.md)
- [Auth & Webhooks](features/auth-and-webhooks.md)
- [Internationalization](features/i18n.md)
