# ── Stage 1: Build ───────────────────────────────────────────────
# Install deps and compile inside Docker so all pnpm shims
# and Prisma client are generated with /app paths (not local paths).
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# ① Copy manifests first for better layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json        ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/validators/package.json ./packages/validators/
COPY packages/ui/package.json     ./packages/ui/

# ② Install ALL deps inside Docker (shims generated with /app/... paths)
RUN pnpm install --frozen-lockfile

# ③ Copy workspace package sources (needed by tsup to inline them)
COPY packages/config/src     ./packages/config/src
COPY packages/validators/src ./packages/validators/src

# ④ Copy API source + config files
#    Root tsconfig.json must be here because apps/api/tsconfig.json extends it
COPY tsconfig.json         ./tsconfig.json
COPY apps/api/src          ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY apps/api/tsup.config.ts ./apps/api/tsup.config.ts
COPY apps/api/prisma       ./apps/api/prisma

# ⑤ Generate Prisma client (written into /app/... paths)
RUN pnpm --filter @mandi/api db:generate

# ⑥ Bundle: inlines @mandi/config + @mandi/validators, rest stays external
RUN pnpm --filter @mandi/api build

# ── Stage 2: Production image ─────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# ① Copy manifests (pnpm needs these to know the workspace structure)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json        ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/validators/package.json ./packages/validators/
COPY packages/ui/package.json     ./packages/ui/

# ② Install ALL deps inside Docker (not --prod; prisma CLI is a devDep)
#    pnpm generates fresh shims with /app/... paths here too.
RUN pnpm install --frozen-lockfile

# ③ Copy Prisma schema + migrations, then regenerate client for this env
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
RUN pnpm --filter @mandi/api db:generate

# ④ Copy the single-file bundled server (workspace deps are inlined)
COPY --from=builder /app/apps/api/dist/server.js ./apps/api/dist/server.js

EXPOSE 4000

# Run DB migrations then start
CMD ["sh", "-c", \
  "pnpm --filter @mandi/api db:migrate:deploy && \
   node apps/api/dist/server.js"]
