# API Reference (resume-builder backend)

NestJS backend (`apps/be`). All HTTP routes are prefixed with **`/api/v1`** (`{API_PREFIX}/v{API_VERSION}`). Auth is Clerk Bearer JWT (`Authorization: Bearer <token>`) on every route except those marked `@Public`. Interactive docs: Swagger at **`/api`** (non-production only).

---

## Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/health` | Public | `{ status, timestamp }` |

---

## Resume — `/api/v1/resumes`

| Method | Path | Auth | Throttle | Body | Returns |
|---|---|---|---|---|---|
| GET | `/resumes` | Bearer | global | — | current user's `Resume` (or null) |
| GET | `/resumes/:id` | Bearer | global | — | `Resume` (ownership-checked) |
| POST | `/resumes/:id` | Bearer | global | `UpdateResumeDto` | updated `Resume` |
| DELETE | `/resumes/:id` | Bearer | global | — | void |
| POST | `/resumes/parse` | Bearer | 5/min | multipart `file` (PDF ≤ 5 MB) | parsed resume JSON |
| POST | `/resumes/match` | Bearer | 5/min | `MatchResumeDto` (or multipart `file`) | `{ overallScore, strengths[], suggestions[] }` |
| POST | `/resumes/:id/generate-email` | Bearer | 5/min | `GenerateEmailDto` | `{ subject, body }` |

PDF uploads are validated by **magic bytes** (`FileMagicBytesValidator`), not the MIME header.

---

## User — `/api/v1/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/users/clerk` | Public + `ClerkWebhookGuard` (Svix) | Clerk webhook: `user.created` / `updated` / `deleted` → sync DB. On `user.created`, an empty `Resume` is created. |

---

## Interview — WebSocket gateway

Namespace **`/interview`** (Socket.IO). Auth: Clerk JWT via `client.handshake.auth.token` or `Authorization: Bearer` header, validated by `WsAuthGuard`.

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `interview:start` | `StartInterviewDto` | begin a session |
| `interview:audio` | `{ audio: string }` (base64 PCM) | stream a mic audio chunk |
| `interview:playback-complete` | — | client finished playing AI audio |
| `interview:stop` | — | end session → trigger evaluation |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `interview:started` | `{ sessionId }` | session created |
| `interview:audio` | `{ audio }` (base64) | AI audio response |
| `interview:turn-complete` | `{ questionNumber, totalQuestions }` | question answered |
| `interview:interrupted` | — | turn interrupted |
| `interview:evaluating` | — | evaluation in progress |
| `interview:feedback` | `InterviewFeedback` | final scores + verdict |
| `interview:session-lost` | `{ message }` | upstream session dropped |
| `interview:error` | `{ message }` | error |

---

## DTOs

### UpdateResumeDto
`PartialType(CreateResumeDto)` — every field optional. `CreateResumeDto`:

| Field | Type | Notes |
|---|---|---|
| `title` | string | 1–200, required |
| `subTitle` | string? | ≤ 200 |
| `overview` | string | ≤ 5000, required |
| `avatar` | string \| null? | — |
| `information[]` | `{ label(1–100), value(1–200) }` | ≤ 20 |
| `educations[]` | `{ school, degree, major, startDate, endDate? }` | ≤ 20 |
| `workExperiences[]` | `{ company, position, description?, startDate, endDate? }` | ≤ 30 |
| `projects[]` | `{ title, subTitle, details?, technologies?, position?, responsibilities?, domain?, demo? }` | ≤ 50 |
| `skills[]` | `{ label(1–100), value(1–100) }` | ≤ 50 |
| `certifications[]` | `{ name, issuer, date }` | ≤ 30 |
| `languages[]` | `{ name, description? }` | ≤ 20 |

### MatchResumeDto
```ts
{ resumeId: string /* UUID */, jobDescription: string /* ≤ 20000 */ }
```

### GenerateEmailDto
```ts
{
  jobDescription: string,              // ≤ 20000
  matchContext: {
    strengths: string[],
    suggestions: string[],
    overallScore: number,
  }
}
```

### CreateUserDto (webhook-derived)
```ts
{
  firstName?: string | null,
  lastName?: string | null,
  email: string,        // valid email
  avatar: string,       // valid URL
  provider: string,     // e.g. "clerk"
  providerId: string,   // Clerk user id
}
```

### StartInterviewDto
```ts
{
  jobDescription: string,                 // ≤ 20000
  questionCount: number,                  // 1–10
  interviewType: 'TECHNICAL' | 'BEHAVIORAL' | 'ALL',
  voiceName?: string,                     // Gemini voice
  language?: string,                      // default English
  speechRate?: number,                    // 0.5–2.0, default 1.0
}
```

---

## Error shape

All errors flow through `GlobalExceptionFilter`:

```ts
{
  statusCode: number,
  timestamp: string,   // ISO-8601
  path: string,        // request URL
  message: string | string[] | object,
  error?: string,      // HTTP status text
}
```

## Rate limiting

Global `ThrottlerGuard`: **10 requests / 60 s** (`THROTTLE_LIMIT` / `THROTTLE_TTL`). AI-heavy resume endpoints (`/parse`, `/match`, `/generate-email`) override to **5 / min**.
