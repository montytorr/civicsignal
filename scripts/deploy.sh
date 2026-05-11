#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-/root/projects/civicsignal}
cd "$APP_DIR"

git fetch origin main
git reset --hard origin/main

# Keep Next/Docker COPY happy even if no static public assets have landed yet.
mkdir -p apps/web/public
[ -e apps/web/public/.gitkeep ] || touch apps/web/public/.gitkeep

corepack pnpm install --frozen-lockfile
corepack pnpm -r test
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
