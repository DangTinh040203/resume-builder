# Monitoring & Centralized Logging

> Planning + tech-stack proposal for replacing the manual
> "SSH into the VM → `sudo docker logs`" workflow with a realtime, searchable
> log dashboard and proper error tracking.

## 1. Context & Problem

Checking production logs today requires: open GCP → `gcloud compute ssh resume-builder-vm` → `sudo docker logs <container>`.
There is **no realtime view, no search, no historical trace, and no error alerting.**

Current state of the three containers (`fe`, `be`, `nginx`):

| Service          | How it logs today                                                                   | Problem                                                       |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **be** (NestJS)  | Winston `nestLike` (colored, pretty, **multiline**) + `morgan('combined')` → stdout | Not machine-parseable; colors/multiline break log aggregation |
| **fe** (Next.js) | default `console` → stdout                                                          | Unstructured                                                  |
| **nginx**        | default access/error logs **inside container** (no volume)                          | Lost on container recreate                                    |

There is also **no correlation/request ID**, so a single request cannot be traced across log lines.

**Goal**

1. A **realtime + searchable log dashboard** for all services.
2. **Error tracking** with grouped exceptions, stack traces, and alerts.

## 2. Decisions (confirmed)

- **Self-host** the logging stack as extra containers in the existing `docker-compose.prod.yml` (VM is e2-medium ≥ 4 GB; ~400–600 MB headroom is fine).
- **Add Sentry** (SaaS free tier) for error tracking — self-hosting Sentry is too heavy for one VM.

## 3. Recommended Tech Stack

| Concern             | Tool              | Why                                                                                                                                                 |
| ------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Log shipping        | **Grafana Alloy** | Modern Promtail successor. Tails Docker logs via the Docker socket, auto-labels by container / compose-service. One agent, zero per-service config. |
| Log storage / index | **Loki**          | Lightweight — indexes labels, not full text → cheap RAM/disk. Built for single-VM. Retention & compaction built in.                                 |
| Dashboard + search  | **Grafana**       | Realtime "Explore" tail, LogQL search, prebuilt dashboards, alerting. Served behind nginx + TLS.                                                    |
| Error tracking      | **Sentry (SaaS)** | Grouped errors, source-mapped (readable) FE stack traces, breadcrumbs, releases, email/Slack alerts. Free tier: 5k errors/mo.                       |

This is the canonical lightweight self-hosted **"PLG" stack** (Promtail/Alloy → Loki → Grafana), which slots directly into docker-compose.

**Data flow**

```text
fe / be / nginx (stdout) ──► Alloy (Docker socket) ──► Loki ──► Grafana dashboard
app code (exceptions)    ──► Sentry SDK ──────────────────────► sentry.io (alerts)
```

### Why not the alternatives

- **Grafana Cloud (free tier):** great, but you chose to keep data on your own VM.
- **GCP Cloud Logging:** native and zero-infra, but the console UX is weaker than Grafana and it bills per-GB past the free tier.
- **Self-hosted Sentry / ELK:** too heavy (multi-GB RAM) for a single shared VM.

## 4. Implementation Plan

### Part A — Observability stack (infra)

1. **Add services to `docker/docker-compose.prod.yml`** (single-compose approach — reuses the existing nginx for TLS and the existing deploy pipeline):
   - `loki` (`grafana/loki:3.x`) — internal only (no published ports), volume `loki_data`, `mem_limit: 256m`, config from `./monitoring/loki-config.yml`.
   - `alloy` (`grafana/alloy:latest`) — mounts `/var/run/docker.sock:ro` + `./monitoring/alloy-config.alloy`, `mem_limit: 128m`.
   - `grafana` (`grafana/grafana:11.x`) — `expose: 3000` (no host publish), volume `grafana_data`, provisioning mounted read-only, env `GF_SECURITY_ADMIN_PASSWORD`, `GF_USERS_ALLOW_SIGN_UP=false`, `GF_SERVER_ROOT_URL=https://grafana.cv-builder.site`, `mem_limit: 256m`.
   - Add `logging:` (json-file, `max-size: 10m`, `max-file: 3`) to **all** services (fe/be/nginx too) to cap on-disk log growth.

2. **New config files under `deployment/monitoring/`** (version-controlled, shipped by the deploy workflow):
   - `loki-config.yml` — filesystem storage, single-binary mode, **retention 14d** via compactor.
   - `alloy-config.alloy` — `discovery.docker` + `loki.source.docker` tailing all containers; relabel to keep `container`, `compose_service`, `compose_project` as Loki labels; ship to `loki:3100`.
   - `grafana/provisioning/datasources/loki.yml` — auto-wire the Loki datasource.
   - `grafana/provisioning/dashboards/dashboards.yml` + `dashboards/overview.json` — prebuilt dashboard: log volume by service, **error-rate panel** (LogQL `level=error`), recent-errors table, per-service log stream. Plus Grafana "Explore" for realtime tail.

3. **Expose Grafana securely** — new `deployment/nginx/conf.d/grafana.conf`: `grafana.cv-builder.site → grafana:3000` over 443, ACME challenge block on 80, WebSocket upgrade headers (Grafana Live needs them). Mirrors the existing `api.conf` pattern. Auth = Grafana's own login (strong admin password), signup disabled. _(Optional hardening: nginx IP allowlist or basic-auth in front.)_

4. **TLS + DNS for the subdomain:**
   - Add `grafana.cv-builder.site` to the SAN cert in `deployment/scripts/init-letsencrypt.sh` (extend the `domains=(...)` list) and re-run it on the VM once.
   - Add a `grafana.cv-builder.site` A-record → VM IP (manual).

### Part B — Make logs machine-readable + traceable (BE)

5. **`apps/be/src/libs/configs/logger.config.ts`** — branch on `NODE_ENV`: production → `winston.format.json()` (one JSON line per log: level/timestamp/context); development → keep the current `nestLike` pretty format. JSON is what makes Loki/LogQL filtering by `level`, `context`, etc. work.

6. **Request correlation ID** — add a middleware (`apps/be/src/libs/middlewares/request-id.middleware.ts`) that reads/sets `x-request-id` and attaches it to the log context, so one request is traceable across all log lines and into Sentry.

7. **HTTP logs as JSON** — in `apps/be/src/main.ts`, switch `morgan('combined')` to a JSON token format (or route morgan through Winston) in production.

### Part C — Error tracking (Sentry)

8. **Backend (`@sentry/nestjs`)** — new `apps/be/src/instrument.ts` (`Sentry.init({ dsn, tracesSampleRate, environment })`) imported as the **first line** of `main.ts`; register `SentryModule.forRoot()` + the Sentry global filter so unhandled exceptions and the request-id are reported with stack traces.

9. **Frontend (`@sentry/nextjs`)** — add `sentry.client.config.ts` / `sentry.server.config.ts` / `instrumentation.ts`, and wrap `apps/fe/next.config.mjs` with `withSentryConfig` to upload **source maps** at build (readable FE stack traces).

10. **Wire env + build:**
    - `BE_ENV_PRODUCTION`: add `SENTRY_DSN`, `GRAFANA_ADMIN_PASSWORD`, `SENTRY_ENVIRONMENT=production`.
    - `FE_ENV_PRODUCTION` / FE build args in `.github/workflows/deploy.yml`: add `NEXT_PUBLIC_SENTRY_DSN` (runtime) + `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (build-time, for source-map upload). Extend the existing `grep -E '^(NEXT_PUBLIC_...)'` extraction block.
    - Update `apps/be/.env.example` and `apps/fe/.env.example`.

### Part D — Deploy pipeline

11. **`.github/workflows/deploy.yml`** — in the "prepare files" + SCP steps, also copy `deployment/monitoring/` → `/opt/resume-builder/monitoring/`. The existing `docker compose pull && up -d` then brings up the new services automatically. No new job needed.

## 5. Files Touched

**Add**

- `deployment/monitoring/loki-config.yml`
- `deployment/monitoring/alloy-config.alloy`
- `deployment/monitoring/grafana/provisioning/datasources/loki.yml`
- `deployment/monitoring/grafana/provisioning/dashboards/dashboards.yml` + `dashboards/overview.json`
- `deployment/nginx/conf.d/grafana.conf`
- `apps/be/src/instrument.ts`
- `apps/be/src/libs/middlewares/request-id.middleware.ts`
- FE Sentry config files (`sentry.client.config.ts`, `sentry.server.config.ts`, `instrumentation.ts`)

**Edit**

- `docker/docker-compose.prod.yml`
- `deployment/scripts/init-letsencrypt.sh`
- `deployment/README.md`
- `.github/workflows/deploy.yml`
- `apps/be/src/libs/configs/logger.config.ts`
- `apps/be/src/main.ts`
- `apps/fe/next.config.mjs`
- `apps/be/.env.example`, `apps/fe/.env.example`

## 6. Trade-offs

- **Single-compose vs separate compose:** chose single-compose for simplicity (reuses nginx TLS + existing deploy SCP). Cost: a `docker compose up` recreates monitoring alongside the app — harmless. Separate `docker-compose.monitoring.yml` + shared external network is cleaner isolation but more wiring; not worth it on one VM.
- **Loki retention 14d** keeps disk bounded; bump later if needed.
- **mem_limits + log rotation** protect the app from a monitoring memory/disk spike.
- **Sentry SaaS** avoids a heavy self-hosted Sentry; only the SDKs live in the repo.

## 7. Estimated Resource Cost

| Container       | RAM (limit) | Disk                                |
| --------------- | ----------- | ----------------------------------- |
| loki            | 256 MB      | log volume, capped by 14d retention |
| grafana         | 256 MB      | small (dashboards/DB)               |
| alloy           | 128 MB      | negligible                          |
| **Total extra** | **~640 MB** | bounded                             |

Comfortable on an e2-medium (4 GB).

## 8. Verification

1. **Local sanity:** `docker compose -f docker/docker-compose.prod.yml config` parses; bring monitoring up locally and confirm Alloy → Loki connectivity in Alloy's logs.
2. **Deploy:** push to `main`; confirm `loki`, `alloy`, `grafana` are healthy (`sudo docker ps`).
3. **Dashboard:** open `https://grafana.cv-builder.site`, log in, Explore → Loki → `{compose_service="be"}` → confirm **realtime tail**; then `{compose_service="be"} | json | level="error"` → confirm error filtering. Check fe/nginx streams too.
4. **Trace:** trigger a request, grab its `x-request-id`, search Loki for it, confirm all related lines return.
5. **Sentry:** throw a test error in BE and FE → confirm it appears on sentry.io with a readable (source-mapped for FE) stack trace and the request-id tag, and the alert email fires.

## 9. Manual Steps at Rollout

- Create Sentry org/projects (BE + FE) and copy the DSNs + an auth token into the `*_ENV_PRODUCTION` secrets.
- Add the `grafana.cv-builder.site` DNS A-record → VM IP.
- Re-run `sudo bash scripts/init-letsencrypt.sh` on the VM once (new SAN cert including the grafana subdomain).
- Set a strong `GRAFANA_ADMIN_PASSWORD`.
