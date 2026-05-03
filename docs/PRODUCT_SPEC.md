# CivicSignal Product Spec — MVP

Status: draft v0.1
Created: 2026-05-03

## Product Promise

CivicSignal lets verified humans answer resolvable civic/world-event questions, keeps active vote splits hidden until cutoff, and awards non-transferable topic reputation only when outcomes resolve correctly.

The MVP must feel like civic infrastructure, not gambling, crypto, or social polling.

## Primary MVP Goals

1. Publish serious real-world polls with objective resolution criteria.
2. Let pseudonymous verified users submit one sealed answer before cutoff.
3. Reveal aggregate results only after cutoff.
4. Resolve polls against documented sources of truth.
5. Award topic-specific reputation only to correct answers.
6. Produce an auditable record through signed receipts and append-only events.

## Non-Goals For MVP

- No token.
- No user wallets.
- No user-paid gas.
- No financial staking or cash rewards.
- No liquid/transferable reputation.
- No complex quadratic governance yet.

## User Roles

### Visitor

- Reads landing page, methodology, public resolved poll results.
- Can browse limited active poll metadata.
- Cannot vote.

### Verified Participant

- Has account, pseudonym, verification status, and abuse score.
- Can answer active polls before cutoff.
- Can view own receipt after voting.
- Can view personal topic reputation and history.

### Resolver/Admin

- Creates polls.
- Sets cutoff, resolution date, source of truth, and topic tags.
- Resolves polls with evidence URLs and notes.
- Can void malformed/disputed polls with public reason.

### Auditor/Public

- Can inspect resolved-poll export, methodology, and later Merkle commitments.

## Core Flows

### 1. Onboarding

1. User creates account.
2. User chooses public pseudonym.
3. User completes verification v1: email + phone/device/rate-limit checks.
4. User sees trust/methodology explanation before first vote.

### 2. Browse Polls

Poll feed shows:

- Question
- Topic and geography tags
- Cutoff time
- Resolution date
- Source-of-truth label
- Verified participant count
- Status: active / cutoff / resolving / resolved / void
- Explicit note: active vote split hidden until cutoff

Active feed must not show live percentages.

### 3. Vote

1. User opens poll detail.
2. UI shows question, options, cutoff, source, resolution criteria, topic reputation impact.
3. User chooses one answer and confirms.
4. Backend stores sealed answer, returns signed receipt.
5. User can see “answered” state but not aggregate distribution before cutoff.

### 4. Cutoff Reveal

After cutoff:

- No more votes accepted.
- Aggregate counts can be shown.
- Individual public user votes remain pseudonymous/private unless user opts into public history later.

### 5. Resolution

Admin/resolver selects winning option or voids poll.

Resolution requires:

- Outcome
- Evidence URL(s)
- Source-of-truth note
- Resolver identity/admin account
- Timestamp
- Public explanation

### 6. Reputation Update

When a poll resolves:

- Correct voters receive topic-specific reputation gain.
- Incorrect voters receive no reputation gain in MVP.
- Confidence/accuracy stats can reflect misses, but core reputation only increases on correct outcomes.
- Updates are written as append-only reputation events.

## MVP Pages

1. Landing page
2. Methodology / trust page
3. Poll feed
4. Poll detail
5. Vote confirmation / receipt
6. Profile / reputation
7. Admin poll creation
8. Admin resolution queue

## Trust Rules

- Votes hidden until cutoff.
- Every poll has explicit source of truth before voting opens.
- Every resolution has evidence.
- Reputation events are append-only.
- Users are pseudonymous publicly, verified privately.
- Audit layer is transparent but not UX-heavy.

## First Beta Domain

Recommendation: global civic/world events.

Reason: it matches the product’s public-good/global thesis, avoids being boxed into France/EU politics too early, and gives enough poll volume to test reputation across topics.

Seed categories:

- Elections & governance
- Geopolitics
- Economy & markets
- Climate & energy
- Technology & AI
- Public health

## Success Criteria For Private Beta

- 50–200 verified users
- 25–50 seeded polls
- At least 10 resolved polls
- No duplicate-vote abuse incident
- Vote split remains hidden until cutoff
- Reputation update correctness verified by tests/scripts
- Public methodology page shipped

## Product Taste Guardrail

If a screen looks like Polymarket, a casino, a crypto wallet, or a meme leaderboard, it is wrong. CivicSignal should look like calm public infrastructure with enough product polish to earn trust.
