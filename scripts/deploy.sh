#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}
cd "$APP_DIR"

git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true
origin_url=$(git remote get-url origin 2>/dev/null || true)
restore_origin() {
  if [ -n "$origin_url" ]; then
    git remote set-url origin "$origin_url"
  fi
}
if [ -n "${GITHUB_TOKEN:-}" ]; then
  git remote set-url origin "https://x-access-token:${GITHUB_TOKEN}@github.com/montytorr/civicsignal.git"
  trap restore_origin EXIT
fi

git fetch origin main
git reset --hard origin/main

# Keep Next/Docker COPY happy even if no static public assets have landed yet.
mkdir -p apps/web/public
[ -e apps/web/public/.gitkeep ] || touch apps/web/public/.gitkeep

corepack pnpm install --frozen-lockfile
scripts/check-local-supabase-cutover.sh
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

NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL_OVERRIDE:-https://civicsignal.montytorr.com/supabase}
: "${NEXT_PUBLIC_SUPABASE_ANON_KEY:?Local Supabase anon key is required}"
: "${SUPABASE_SERVICE_ROLE_KEY:?Local Supabase service role key is required}"
export NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY

DB_CONTAINER=${DB_CONTAINER:-civic-supabase-db-1}
if ! docker inspect "$DB_CONTAINER" >/dev/null 2>&1; then
  echo "Missing local CivicSignal database container" >&2
  exit 1
fi
if ! docker exec "$DB_CONTAINER" psql -X -U postgres -d postgres -Atqc "SELECT 1" >/dev/null; then
  echo "Local CivicSignal database probe failed" >&2
  exit 1
fi

echo "Applying CivicSignal database migrations"
docker exec -i "$DB_CONTAINER" psql -X -U postgres -d postgres -v ON_ERROR_STOP=1 -q <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL

# The fresh local database was seeded before the ledger existed. Bootstrap the
# ledger only when the complete tracked schema is already present.
ledger_count=$(docker exec "$DB_CONTAINER" psql -X -U postgres -d postgres -Atqc "SELECT count(*) FROM schema_migrations")
core_schema_exists=$(docker exec "$DB_CONTAINER" psql -X -U postgres -d postgres -Atqc "SELECT to_regclass('public.polls') IS NOT NULL")
if [ "$ledger_count" = "0" ] && [ "$core_schema_exists" = "t" ]; then
  schema_contract_count=$(docker exec "$DB_CONTAINER" psql -X -U postgres -d postgres -Atqc \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('audit_commitments','dispute_evidence','dispute_reviews','disputes','invites','panel_members','poll_proposals','polls','profiles','reputation_events','source_templates','topics','user_topic_reputation','votes')")
  if [ "$schema_contract_count" != "14" ]; then
    echo "Refusing to bootstrap migration ledger from an incomplete local schema" >&2
    exit 1
  fi
  echo "Bootstrapping migration ledger from existing local schema"
  for migration in packages/db/migrations/*.sql; do
    filename=$(basename "$migration")
    docker exec "$DB_CONTAINER" psql -X -U postgres -d postgres -v ON_ERROR_STOP=1 -q \
      -c "INSERT INTO schema_migrations(filename) VALUES ('$filename') ON CONFLICT DO NOTHING"
  done
fi

for migration in packages/db/migrations/*.sql; do
  filename=$(basename "$migration")
  already_applied=$(docker exec "$DB_CONTAINER" psql -X -U postgres -d postgres -Atqc "SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE filename = '$filename')")
  if [ "$already_applied" = "t" ]; then
    echo "Skipping migration $filename"
    continue
  fi
  echo "Applying migration $filename"
  docker exec -i "$DB_CONTAINER" psql -X -U postgres -d postgres -v ON_ERROR_STOP=1 -f - < "$migration"
  docker exec "$DB_CONTAINER" psql -X -U postgres -d postgres -v ON_ERROR_STOP=1 -q \
    -c "INSERT INTO schema_migrations(filename) VALUES ('$filename') ON CONFLICT DO NOTHING"
done

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
