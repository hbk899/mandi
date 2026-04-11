# ── Stage 1: Build ───────────────────────────────────────────────
# Install deps and compile inside Docker so all pnpm shims
# and Prisma client are generated with /app/... paths (not local paths).
FROM node:20-alpine AS builder
WORKDIR /app

# OpenSSL is required by Prisma's schema engine at generate time
RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# ① Copy manifests first for better layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json            ./apps/api/
COPY packages/config/package.json     ./packages/config/
COPY packages/validators/package.json ./packages/validators/
COPY packages/ui/package.json         ./packages/ui/

# ② Install ALL deps inside Docker (shims generated with /app/... paths)
RUN pnpm install --frozen-lockfile

# ③ Copy workspace package sources (tsup inlines these into dist/server.js)
COPY packages/config/src     ./packages/config/src
COPY packages/validators/src ./packages/validators/src

# ④ Copy API source + config
#    Root tsconfig.json is required because apps/api/tsconfig.json extends it
COPY tsconfig.json            ./tsconfig.json
COPY apps/api/src             ./apps/api/src
COPY apps/api/tsconfig.json   ./apps/api/tsconfig.json
COPY apps/api/tsup.config.ts  ./apps/api/tsup.config.ts
COPY apps/api/prisma          ./apps/api/prisma

# ⑤ Generate Prisma client — binaryTargets in schema.prisma includes
#    linux-musl-openssl-3.0.x so the correct Alpine binary is downloaded
RUN pnpm --filter @mandi/api db:generate

# ⑥ Bundle API — @mandi/config + @mandi/validators inlined, rest external
RUN pnpm --filter @mandi/api build

# ── Stage 2: Production image ─────────────────────────────────────
# Copy node_modules directly from builder instead of re-installing.
# The builder ran pnpm install at /app so every shim already has
# /app/... paths and the Prisma client is already generated.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# OpenSSL is required at runtime by the Prisma query engine and
# schema engine (migrate deploy). Alpine ships without it by default.
RUN apk add --no-cache openssl

# Runtime node_modules: root .pnpm store (contains Prisma engine +
# generated client from builder) and API-level node_modules (symlinks
# into that store + .bin/prisma shim with correct /app/... paths).
COPY --from=builder /app/node_modules          ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Prisma schema + migrations (needed by migrate deploy at startup)
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Single-file bundled server (@mandi/* workspace packages are inlined)
COPY --from=builder /app/apps/api/dist/server.js ./apps/api/dist/server.js

EXPOSE 4000

# Run DB migrations then start the server.
# Use the absolute path to the shim so it works regardless of PATH.
CMD ["sh", "-c", \
  "/app/apps/api/node_modules/.bin/prisma migrate deploy \
     --schema=/app/apps/api/prisma/schema.prisma && \
   node /app/apps/api/dist/server.js"]
