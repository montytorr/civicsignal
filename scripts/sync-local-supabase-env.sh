#!/usr/bin/env bash
set -euo pipefail

SOURCE_ENV=${SOURCE_ENV:-/srv/supabase/civic/.env}
TARGET_ENV=${TARGET_ENV:-/home/runner/civicsignal-secrets/web.env}

if [ ! -r "$SOURCE_ENV" ] || [ ! -r "$TARGET_ENV" ]; then
  echo "Source or target runtime environment is not readable" >&2
  exit 1
fi

read_value() {
  local key=$1
  awk -F= -v key="$key" '$1 == key { print substr($0, index($0, "=") + 1); exit }' "$SOURCE_ENV"
}

SYNC_ANON_KEY=$(read_value ANON_KEY)
SYNC_SERVICE_ROLE_KEY=$(read_value SERVICE_ROLE_KEY)
if [ -z "$SYNC_ANON_KEY" ] || [ -z "$SYNC_SERVICE_ROLE_KEY" ]; then
  echo "Local Supabase runtime keys are missing" >&2
  exit 1
fi
export SYNC_ANON_KEY SYNC_SERVICE_ROLE_KEY

target_dir=$(dirname "$TARGET_ENV")
staged=$(mktemp "$target_dir/.civicsignal-env.XXXXXX")
cleanup() {
  rm -f "$staged"
}
trap cleanup EXIT

awk '
  BEGIN { anon = 0; service = 0; url = 0; db = 0 }
  /^NEXT_PUBLIC_SUPABASE_URL=/ {
    print "NEXT_PUBLIC_SUPABASE_URL=https://civicsignal.montytorr.com/supabase"
    url = 1
    next
  }
  /^NEXT_PUBLIC_SUPABASE_ANON_KEY=/ {
    print "NEXT_PUBLIC_SUPABASE_ANON_KEY=" ENVIRON["SYNC_ANON_KEY"]
    anon = 1
    next
  }
  /^SUPABASE_SERVICE_ROLE_KEY=/ {
    print "SUPABASE_SERVICE_ROLE_KEY=" ENVIRON["SYNC_SERVICE_ROLE_KEY"]
    service = 1
    next
  }
  /^SUPABASE_DB_URL=/ {
    print "SUPABASE_DB_URL="
    db = 1
    next
  }
  { print }
  END {
    if (!url) print "NEXT_PUBLIC_SUPABASE_URL=https://civicsignal.montytorr.com/supabase"
    if (!anon) print "NEXT_PUBLIC_SUPABASE_ANON_KEY=" ENVIRON["SYNC_ANON_KEY"]
    if (!service) print "SUPABASE_SERVICE_ROLE_KEY=" ENVIRON["SYNC_SERVICE_ROLE_KEY"]
    if (!db) print "SUPABASE_DB_URL="
  }
' "$TARGET_ENV" > "$staged"

chmod --reference="$TARGET_ENV" "$staged"
chown --reference="$TARGET_ENV" "$staged"
mv -f "$staged" "$TARGET_ENV"
trap - EXIT

echo "CivicSignal runtime environment synchronized to local Supabase"
