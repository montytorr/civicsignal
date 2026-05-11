# Contributing to CivicSignal

Thank you for your interest in contributing. CivicSignal is an open, verifiable civic prediction platform. Contributions of all kinds are welcome — bug reports, feature proposals, documentation, and code.

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

## Workflow

1. **Branch** — create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. **Code** — follow the style guide below.
3. **Typecheck and lint** before opening a PR:
   ```bash
   pnpm typecheck
   pnpm lint
   ```
4. **Pull request** — open a PR against `main`. Describe what the change does and why.

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

Open a GitHub Issue. Include steps to reproduce, expected behavior, actual behavior, and your Node/pnpm versions.

## License

By contributing you agree that your contributions will be licensed under the [Mozilla Public License 2.0](./LICENSE).
