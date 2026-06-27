# Deployment

Files that live on the **GCE VM** (`resume-builder-vm`). The deploy workflow
(`.github/workflows/deploy.yml`) copies `docker-compose.prod.yml` and this
`nginx/` folder into `/opt/resume-builder/` on every push to `main`.

```text
deployment/
├── nginx/
│   └── conf.d/
│       ├── app.conf   # cv-builder.site (+ www) → fe:3001
│       └── api.conf   # api.cv-builder.site     → be:4000 (+ WebSocket /interview)
└── scripts/
    ├── setup-gcp-cicd.sh   # run LOCALLY  — keyless SSH/WIF + registry perms
    └── init-letsencrypt.sh # run ON THE VM — issue + auto-renew HTTPS cert
```

Production domains:

| Host                  | Target  |
| --------------------- | ------- |
| `cv-builder.site`     | fe:3001 |
| `www.cv-builder.site` | → apex  |
| `api.cv-builder.site` | be:4000 |

Matching env (in the `*_ENV_PRODUCTION` secrets):
`NEXT_PUBLIC_BASE_URL=https://api.cv-builder.site/api/v1`,
`NEXT_PUBLIC_WS_URL=wss://api.cv-builder.site`,
`FRONTEND_ORIGIN=https://cv-builder.site`.

## Setup order (once)

### 1. GCP — keyless auth for GitHub (run locally)

```bash
gcloud auth login            # an owner/editor account
bash deployment/scripts/setup-gcp-cicd.sh
```

Then add the two printed values as repo secrets (`GCP_WORKLOAD_IDENTITY_PROVIDER`,
`GCP_SERVICE_ACCOUNT`). `BE_ENV_PRODUCTION` / `FE_ENV_PRODUCTION` are already set.

### 2. DNS

Point A-records `cv-builder.site`, `www.cv-builder.site`, `api.cv-builder.site`
at the VM's external IP.

### 3. First deploy

Push to `main` (or run the **Deploy** workflow manually). This pushes the images,
copies `.env` + `docker-compose.yml` + `nginx/` to the VM, and starts the stack.
nginx will fail until certs exist — expected; do step 4 next.

### 4. HTTPS certificate (run on the VM)

```bash
gcloud compute ssh resume-builder-vm --zone asia-southeast1-c   # OS Login

cd /opt/resume-builder
sudo bash scripts/init-letsencrypt.sh
```

It boots nginx with a temporary self-signed cert, obtains the real Let's Encrypt
SAN cert (all three hosts) over HTTP-01, reloads nginx, and installs a
twice-daily renew cron. Re-runs are safe.

> The `certbot_www` named volume in `docker-compose.prod.yml` is shared between
> nginx (serving the ACME challenge) and the certbot container (writing it).
