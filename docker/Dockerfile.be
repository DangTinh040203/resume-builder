FROM node:20-alpine AS base
RUN npm i -g pnpm

# ─── deps ───────────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/be/package.json ./apps/be/
COPY packages/shared/package.json ./packages/shared/
COPY packages/typescript-config/package.json ./packages/typescript-config/
RUN pnpm install --frozen-lockfile

# ─── builder ────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/be/node_modules ./apps/be/node_modules
COPY . .

RUN pnpm --filter @resume-builder/be db:generate
RUN pnpm --filter @resume-builder/be build

# ─── runner ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/be/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/be/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/be/src/libs/databases/prisma ./prisma

USER nestjs

EXPOSE 4000

CMD ["node", "dist/main"]
