#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-/root/projects/civicsignal}
cd "$APP_DIR"

git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true
if [ -n "${GITHUB_TOKEN:-}" ]; then
  git remote set-url origin "https://x-access-token:${GITHUB_TOKEN}@github.com/montytorr/civicsignal.git"
fi

git fetch origin main
git reset --hard origin/main

# Keep Next/Docker COPY happy even if no static public assets have landed yet.
mkdir -p apps/web/public
[ -e apps/web/public/.gitkeep ] || touch apps/web/public/.gitkeep

corepack pnpm install --frozen-lockfile
corepack pnpm -r test

# Avoid stale root-owned Next artifacts from manual smoke builds breaking the self-hosted runner.
# The runner has Docker access, so use a throwaway root container to clean artifacts
# even when a prior manual/root build left files the runner user cannot unlink.
if [ -d apps/web/.next ]; then
  docker run --rm -v "$APP_DIR/apps/web/.next:/target" alpine:3.20 sh -c 'rm -rf /target/* /target/.[!.]* /target/..?*'
  rmdir apps/web/.next 2>/dev/null || true
fi

ENV_FILE=${ENV_FILE:-/home/runner/civicsignal-secrets/web.env}
if [ ! -f "$ENV_FILE" ]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi
set -a
. "$ENV_FILE"
set +a

corepack pnpm --filter @civicsignal/web build

docker compose build web resolver
docker compose up -d web resolver

for i in {1..30}; do
  if docker exec civicsignal-web wget --quiet --tries=1 --spider http://127.0.0.1:3000/api/health; then
    echo "civicsignal deployed $(git rev-parse --short HEAD)"
    exit 0
  fi
  sleep 2
done

docker logs --tail=100 civicsignal-web >&2 || true
exit 1
