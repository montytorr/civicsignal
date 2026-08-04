#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-/root/projects/civicsignal}
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

run_migrations=false
if [ -n "${SUPABASE_DB_URL:-}" ]; then
  db_host=${SUPABASE_DB_URL#*@}
  db_host=${db_host%%[:/]*}
  if getent ahosts "$db_host" >/dev/null 2>&1; then
    db_probe_error=$(mktemp)
    if psql "$SUPABASE_DB_URL" -Atqc "SELECT 1" >/dev/null 2>"$db_probe_error"; then
      run_migrations=true
    elif grep -Eq 'ENOTFOUND.*tenant/user .* not found' "$db_probe_error"; then
      echo "WARNING: skipping database migrations because the configured Supabase project no longer exists" >&2
    else
      cat "$db_probe_error" >&2
      rm -f "$db_probe_error"
      exit 1
    fi
    rm -f "$db_probe_error"
  else
    echo "WARNING: skipping database migrations because $db_host does not resolve" >&2
  fi
fi

if [ "$run_migrations" = true ]; then
  echo "Applying CivicSignal database migrations"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL

  # Production predates the migration ledger. If the core schema already exists but
  # the ledger is empty, mark current migrations as applied instead of replaying
  # years of CREATE POLICY noise on every deploy.
  ledger_count=$(psql "$SUPABASE_DB_URL" -Atqc "SELECT count(*) FROM schema_migrations")
  core_schema_exists=$(psql "$SUPABASE_DB_URL" -Atqc "SELECT to_regclass('public.polls') IS NOT NULL")
  if [ "$ledger_count" = "0" ] && [ "$core_schema_exists" = "t" ]; then
    echo "Bootstrapping migration ledger from existing production schema"
    for migration in packages/db/migrations/*.sql; do
      filename=$(basename "$migration")
      psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q \
        -c "INSERT INTO schema_migrations(filename) VALUES ('$filename') ON CONFLICT DO NOTHING"
    done
  fi

  for migration in packages/db/migrations/*.sql; do
    filename=$(basename "$migration")
    already_applied=$(psql "$SUPABASE_DB_URL" -Atqc "SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE filename = '$filename')")
    if [ "$already_applied" = "t" ]; then
      echo "Skipping migration $filename"
      continue
    fi
    echo "Applying migration $filename"
    psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$migration"
    psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q \
      -c "INSERT INTO schema_migrations(filename) VALUES ('$filename') ON CONFLICT DO NOTHING"
  done
fi

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
