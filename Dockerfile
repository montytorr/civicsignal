# syntax=docker/dockerfile:1
# Multi-stage build for @civicsignal/web (Next.js standalone output)

# ─── base ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

# ─── deps ─────────────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

# Copy only the manifests that pnpm needs for the install graph
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json                 ./apps/web/package.json
COPY packages/ui/package.json              ./packages/ui/package.json
COPY packages/db/package.json              ./packages/db/package.json
COPY packages/crypto/package.json          ./packages/crypto/package.json
COPY services/resolver/package.json        ./services/resolver/package.json

# Install all dependencies (including workspace cross-links)
RUN pnpm install --frozen-lockfile

# ─── builder ──────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

# Bring in the full install tree from the deps stage
COPY --from=deps /app/node_modules        ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy workspace package node_modules where pnpm may have hoisted them
COPY --from=deps /app/packages            ./packages
COPY --from=deps /app/services            ./services

# Copy source (overrides the empty dirs above with real source)
COPY . .

# Public Supabase values are baked into the Next.js client bundle at build time.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Build only the web app; Turborepo resolves workspace dependencies
RUN pnpm --filter @civicsignal/web build

# ─── runner ───────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user required by Next.js standalone hardening guidance
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# The standalone output is a self-contained directory tree; copy it wholesale
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./

# Static assets must be layered on top of the standalone tree
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static    ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public          ./apps/web/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is emitted by Next.js into the standalone root for monorepos
CMD ["node", "apps/web/server.js"]
