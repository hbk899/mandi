# ── Stage 1: deps ────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# Copy workspace manifests only (for better layer caching)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/validators/package.json ./packages/validators/
COPY packages/ui/package.json ./packages/ui/

# Install all deps (needed for Prisma generate)
RUN pnpm install --frozen-lockfile

# ── Stage 2: build ────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# Copy deps from stage 1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy full source
COPY . .

# Generate Prisma client
RUN pnpm --filter @mandi/api db:generate

# Compile TypeScript
RUN pnpm --filter @mandi/api build

# ── Stage 3: production runner ────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# Only copy what's needed at runtime
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Install production deps only
RUN pnpm install --frozen-lockfile --prod

# Generate Prisma client in production image
RUN pnpm --filter @mandi/api db:generate

EXPOSE 4000

# Run migrations then start the server
CMD ["sh", "-c", "node apps/api/dist/server.js"]
