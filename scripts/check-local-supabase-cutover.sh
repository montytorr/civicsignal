#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}
cd "$APP_DIR"

NEXT_PUBLIC_SUPABASE_URL=https://civicsignal.example.test/supabase \
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key \
NEXT_PUBLIC_SITE_URL=https://civicsignal.example.test \
SUPABASE_SERVICE_ROLE_KEY=test-service-role-key \
CIVICSIGNAL_ENV_FILE=/dev/null \
  docker compose config --quiet

if rg -q 'psql "\$SUPABASE_DB_URL"' scripts/deploy.sh; then
  echo "deploy script must not place database credentials in process arguments" >&2
  exit 1
fi

rg -q 'docker exec.*\bpsql\b' scripts/deploy.sh
rg -q 'NEXT_PUBLIC_SUPABASE_URL_OVERRIDE.*civicsignal\.montytorr\.com/supabase' scripts/deploy.sh
rg -q '\$GITHUB_WORKSPACE/scripts/deploy\.sh' .github/workflows/deploy.yml

echo "local Supabase cutover contract verified"
