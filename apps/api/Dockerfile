# ── Stage 1: Install all dependencies ────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# Copy workspace manifests for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/validators/package.json ./packages/validators/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# Restore installed deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules 2>/dev/null || true

# Copy full monorepo source (tsup needs workspace packages to inline them)
COPY . .

# Generate Prisma client into node_modules
RUN pnpm --filter @mandi/api db:generate

# Bundle: inlines @mandi/config + @mandi/validators, leaves all else external
RUN pnpm --filter @mandi/api build

# ── Stage 3: Minimal production image ─────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Bundled server (includes workspace packages inline)
COPY --from=builder /app/apps/api/dist/server.js ./dist/server.js

# Prisma schema + migrations (needed by migrate deploy & generate)
COPY --from=builder /app/apps/api/prisma ./prisma

# Runtime node_modules: all external runtime deps + Prisma engine
# We copy the root monorepo node_modules which has everything flattened
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000

# Run DB migrations then start the server
CMD ["sh", "-c", "node ./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma && node dist/server.js"]
