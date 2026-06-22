# Database Schema

PostgreSQL via Prisma 7 (`@prisma/client` + `@prisma/adapter-pg`). Schema is **modular** — one file per model under `apps/be/src/libs/databases/prisma/schema/`, with migrations in `../migrations/`.

```
schema/
├── schema.prisma          # datasource + generator
├── user.prisma
├── resume.prisma          # Resume + ResumeInformation
├── education.prisma
├── work-experience.prisma
├── project.prisma
├── skill.prisma
├── certification.prisma
└── language.prisma
```

---

## Relationships

```
User ──1:1── Resume ─┬─1:N─ ResumeInformation
                     ├─1:N─ Education
                     ├─1:N─ WorkExperience
                     ├─1:N─ Project
                     ├─1:N─ Skill
                     ├─1:N─ Certification
                     └─1:N─ Language
```

**Key constraint:** one user has exactly one resume — `Resume.userId` is `@unique`. All relations are `onDelete: Cascade`, so deleting a `User` cascades to its `Resume` and all child rows.

---

## Models

### User (`user.prisma`)

| Field | Type | Notes |
|---|---|---|
| `id` | string | UUID, PK |
| `providerId` | string | Clerk user id |
| `provider` | string | e.g. `"clerk"` |
| `firstName` | string? | |
| `lastName` | string? | |
| `email` | string | **unique** |
| `avatar` | string? | |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |
| `resume` | Resume? | 1:1, cascade |

### Resume (`resume.prisma`)

| Field | Type | Notes |
|---|---|---|
| `id` | string | UUID, PK |
| `userId` | string | FK → User, **unique** (enforces 1:1) |
| `title` | string | |
| `subTitle` | string | |
| `overview` | string | |
| `avatar` | string? | |
| `createdAt` / `updatedAt` | DateTime | |
| relations | — | `information[]`, `educations[]`, `workExperiences[]`, `projects[]`, `skills[]`, `certifications[]`, `languages[]` (all cascade) |

Indexed on `userId`.

### ResumeInformation (`resume.prisma`)
`id` (UUID PK), `label`, `value`, `resumeId` (FK, indexed). Generic label/value contact rows.

### Education (`education.prisma`)
`id`, `school`, `degree`, `major`, `startDate` (DateTime), `endDate?` (null = "Present"), `resumeId` (FK, indexed).

### WorkExperience (`work-experience.prisma`)
`id`, `company`, `position`, `description`, `startDate`, `endDate?` (null = "Present"), `resumeId` (FK, indexed).

### Project (`project.prisma`)
`id`, `title`, `subTitle`, `details`, `technologies` (default `""`), `position` (default `""`), `responsibilities` (default `""`), `domain` (default `""`), `demo?`, `resumeId` (FK, indexed).

### Skill (`skill.prisma`)
`id`, `label`, `value`, `resumeId` (FK, indexed).

### Certification (`certification.prisma`)
`id`, `name`, `issuer`, `date` (DateTime), `resumeId` (FK, indexed).

### Language (`language.prisma`)
`id`, `name`, `description` (e.g. "Fluent", "Intermediate"), `resumeId` (FK, indexed).

---

## Working with the schema

```bash
cd apps/be
pnpm db:generate         # regenerate Prisma client after schema edits
pnpm db:migrate          # create + apply a dev migration
pnpm db:push             # push schema without a migration (prototyping)
pnpm db:studio           # browse data at localhost:5555
pnpm db:migrate:deploy   # apply migrations in production
pnpm db:migrate:reset    # drop + recreate (destructive)
```

The Prisma datasource URL resolves to `DIRECT_URL || DATABASE_URL` (see `prisma.config.ts`).
