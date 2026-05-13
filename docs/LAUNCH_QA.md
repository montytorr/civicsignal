# CivicSignal Launch QA

Status: active checklist  
Last updated: 2026-05-13

## Latest gate run — 2026-05-13 UTC

Result: **pass**

- `corepack pnpm -r test` — passed (crypto 33 tests, web 48 tests)
- `corepack pnpm --filter @civicsignal/web typecheck` — passed
- `corepack pnpm --filter @civicsignal/web build` — passed
- `node scripts/smoke-proposal-lifecycle.mjs` — `SMOKE_OK proposal-lifecycle`
- `node scripts/smoke-trusted-panels.mjs` — `SMOKE_OK trusted-panels`

Follow-up shipped from this pass:

- `/reports` now provides the first weekly signal report format and live beta counters.
- `/verify` now links a machine-readable `/api/audit/export` JSON snapshot.
- `/invites` now frames invites as an early-cohort operating loop rather than just code generation.
- Header/footer navigation now exposes signal reports and audit export.
- Production poll inventory checked: 43 active polls, 0 weak source/criteria rows, 0 synthetic lifecycle polls.

This checklist is the minimum bar before inviting a wider public beta cohort. CivicSignal is a trust product; broken trust flows are launch blockers, not cosmetic bugs.

## Required gates

Run from the repository root with production-like Supabase credentials loaded:

```bash
corepack pnpm -r test
corepack pnpm --filter @civicsignal/web typecheck
corepack pnpm --filter @civicsignal/web build
node scripts/smoke-proposal-lifecycle.mjs
node scripts/smoke-trusted-panels.mjs
```

Expected smoke output:

- `SMOKE_OK proposal-lifecycle ...`
- `SMOKE_OK trusted-panels ...`

The proposal lifecycle smoke must clean up every synthetic poll, proposal, vote, audit commitment, reputation event, dispute, evidence row, review row, profile, and auth user it creates. Synthetic `Approved proposal lifecycle poll ...` rows in production are a failure.

## Live route checks

These routes should return 200 in production:

- `/`
- `/polls`
- `/proposals`
- `/methodology`
- `/roadmap`
- `/verify`
- `/panels`
- `/leaderboard`
- `/archive`
- `/demo`
- `/reputation`

These authenticated routes should redirect unauthenticated visitors to sign-in rather than leaking privileged UI:

- `/admin`
- `/invites`
- `/panels/me`

## Launch content bar

- Active poll feed has at least 25 serious, non-duplicate polls.
- Each poll has neutral wording, source-of-truth, cutoff, resolution timing, and explicit resolution criteria.
- Public methodology, roadmap, verify, panels, README, and docs agree with shipped behavior.
- No public page says the MVP/schema/spec is merely an unbuilt draft.

## First beta operating loop

1. Invite 50-200 early users.
2. Moderate incoming proposals daily.
3. Resolve eligible polls against declared sources.
4. Publish a weekly public signal report summarizing participation, resolved outcomes, disputes, and methodology changes.
5. Treat stale methodology, hidden broken buttons, or synthetic QA data as launch blockers.
