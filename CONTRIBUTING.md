# Contributing to CivicSignal

Thank you for your interest in contributing. CivicSignal is an open, verifiable civic polling and reputation platform. Contributions of all kinds are welcome — bug reports, feature proposals, documentation, civic poll templates, and code.

CivicSignal is not a betting product, token launch, or partisan campaign tool. Contributions should strengthen verified-human participation, public auditability, clear resolution standards, and democratic legitimacy.

## Before you contribute

Please read the public product docs before proposing a substantial change:

- `README.md` — thesis, architecture, reputation model, and roadmap.
- `docs/PRODUCT_SPEC.md` — MVP product behavior.
- `docs/MVP_SCHEMA.md` — database and domain model.
- `docs/DESIGN_BRIEF.md` — product tone and interface direction.

Open an issue first for changes that affect moderation policy, verification, reputation, vote privacy, resolution, auditability, or public methodology. Small documentation fixes can go straight to a pull request.

## Getting started

### Prerequisites

- Node.js 22+
- pnpm 9 (`corepack enable && corepack prepare pnpm@9 --activate`)
- A Supabase project (free tier works for local dev)

### Fork and clone

```bash
git clone https://github.com/<your-fork>/civicsignal.git
cd civicsignal
pnpm install
```

### Environment

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example apps/web/.env.local
# edit apps/web/.env.local
```

### Run in development

```bash
pnpm dev
```

This starts both the Next.js web app (`apps/web`) and the resolver service via Turborepo. The web app uses `--webpack` (Turbopack has known issues in this monorepo).

### Database migrations

Migrations live in `packages/db/migrations/`. To apply them against your Supabase project:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db query --linked -f packages/db/migrations/<file>.sql
```

## Product contribution standards

### Poll proposals and templates

When contributing a poll idea or source template, include:

- **Question** — short, neutral, and resolvable.
- **Topic** — one existing CivicSignal topic where possible.
- **Region** — global, regional, national, or local jurisdiction.
- **Options** — at least two clear outcomes.
- **Source-of-truth** — a single official source or named publication.
- **Resolution criteria** — exactly what counts, what does not, and which timestamp/timezone matters.

Avoid questions that depend on vibes, opinion polling, private data, or subjective expert judgment. If the answer cannot be resolved from a public source, it is not ready.

### Moderation and appeals

Proposal moderation should preserve public notes. Use:

- `pending` for new or revised proposals.
- `changes_requested` when the idea is promising but underspecified.
- `rejected` when it is out of scope, subjective, unsafe, or not publicly resolvable.
- `appealed` when the proposer asks moderators to reconsider a rejection.
- `approved` only when it has been turned into a draft poll.

### Trust-surface alignment

When a feature changes CivicSignal's trust model, update the public surfaces in the same PR: homepage, methodology, roadmap, README, and any relevant smoke script. Stale public methodology is a bug.

## Workflow

1. **Branch** — create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. **Code** — follow the style guide below.
3. **Typecheck, build, and test** before opening a PR:
   ```bash
   pnpm typecheck
   pnpm --filter @civicsignal/web build
   corepack pnpm -r test
   ```
4. **Run lifecycle smoke checks** when touching proposal, poll, dispute, panel, or audit flows:
   ```bash
   node scripts/smoke-proposal-lifecycle.mjs
   node scripts/smoke-trusted-panels.mjs
   ```
5. **Pull request** — open a PR against `main`. Describe what the change does, why it matters, and which public trust surfaces changed.

## Code style

- TypeScript everywhere; no `any` unless absolutely necessary.
- Arrow functions for all functions and components.
- React functional components with hooks only — no class components.
- Named exports preferred; default exports for top-level page/component files.
- Self-documenting code over inline comments. Add a comment only when the *why* is non-obvious.
- Tailwind CSS utility classes for styling; avoid inline `style` props.
- Keep components small and focused. Extract reusable logic into custom hooks under `hooks/`.

## Monorepo layout

| Path | Purpose |
|------|---------|
| `apps/web` | Next.js 16 frontend |
| `packages/ui` | Shared React component library |
| `packages/db` | Supabase client, types, migrations |
| `packages/crypto` | Vote encryption / Merkle utilities |
| `services/resolver` | Background service that resolves closed polls |

## Reporting issues

Open a GitHub Issue using the closest template. Include steps to reproduce, expected behavior, actual behavior, and your Node/pnpm versions for bugs.

For poll/source-template proposals, include enough detail for a moderator to decide whether the question is neutral, safe, and publicly resolvable. `docs/EXAMPLE_POLL_PROPOSAL.md` is the recommended format.

## Pull request checklist

Before requesting review, confirm:

- [ ] The change does not introduce wagering, tradable-token, or pay-to-influence mechanics.
- [ ] Any trust-model change updates public docs or explains why no public docs changed.
- [ ] Poll/reputation changes preserve pseudonymous-by-default verified-human participation.
- [ ] New environment variables are added to `.env.example` without real secrets.
- [ ] Relevant typecheck/build/test/smoke checks were run, or the PR explains why they were not.

## Reporting security issues

Please do not open public issues for vulnerabilities involving authentication, vote privacy, service-role keys, identity verification, or audit-log integrity. Email the maintainers privately instead, then coordinate disclosure after a fix is available.

## License

By contributing you agree that your contributions will be licensed under the [Mozilla Public License 2.0](./LICENSE).
