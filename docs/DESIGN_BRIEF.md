# CivicSignal — Claude Design Brief

Status: design brief
Audience: Claude Design / product designer
Created: 2026-05-03

## Product Summary

CivicSignal is a global, open-source, public-good civic platform for verified-human polling on real-world events. Users are pseudonymous by default, vote on resolvable civic/world-event questions, and earn non-transferable topic-specific reputation only when their answers resolve correctly.

This should not look like a crypto app, betting product, survey SaaS, or partisan media site. It should feel like credible civic infrastructure: calm, trustworthy, modern, transparent, and global.

## Core Product Principles

1. Public-good civic platform.
2. Global from day one.
3. Pseudonymous by default.
4. Verified-human underneath, without public doxxing.
5. Poll answers hidden until cutoff.
6. Reputation is non-transferable and topic-specific.
7. Only correct/winning outcomes increase reputation.
8. Open-source and transparent.
9. Blockchain/auditability should be mostly invisible in UX.
10. Democracy roadmap should be visible but not preachy.

## Design Goal

Create the first-pass app design for CivicSignal: a serious, usable civic polling platform that makes people feel they are contributing to public intelligence, not gambling or posting opinions into a void.

The product should communicate:

- Trust
- Legitimacy
- Clarity
- Global civic relevance
- Calm confidence
- Transparency
- Human participation

## Visual Direction

### Mood

- Institutional but not bureaucratic
- Civic but not government-looking
- Modern but not startup-silly
- Open-source credible
- Serious, clean, human

### Avoid

- Crypto gradients / token dashboards
- Casino/prediction-market energy
- Loud gamification
- Partisan red/blue aesthetics
- Overly corporate SaaS blandness
- Dark dystopian surveillance vibes

### Suggested style

- Light-first interface
- Warm neutral background
- Deep navy / civic blue as primary
- Signal green or amber for outcomes/reputation
- Restrained accent color for active polls
- Lots of whitespace
- Clear information hierarchy
- Cards for polls
- Transparent methodology callouts

## Core Screens To Design

### 1. Landing Page

Purpose: explain CivicSignal quickly and credibly.

Must include:

- Hero: “CivicSignal — verified-human polling for public intelligence”
- Subheading about pseudonymous verified people answering real-world questions and earning reputation for correct civic judgment.
- CTA: “Join the beta” / “Explore active polls”
- Three pillars:
  - Verified humans
  - Hidden votes until cutoff
  - Non-transferable topic reputation
- Public-good/open-source note
- Democracy roadmap section
- Example poll cards
- Methodology preview

### 2. Poll Feed

Purpose: browse active questions.

Poll cards should show:

- Question
- Topic tag
- Region/global tag
- Cutoff time
- Resolution date
- Number of verified participants, but NOT current vote split before cutoff
- Source-of-truth label
- User status: not answered / answered / closed / resolved

Important: because votes are hidden until cutoff, avoid bars/percentages on active polls. Use “Votes hidden until cutoff” as a trust feature.

### 3. Poll Detail Page

Purpose: answer one civic question with confidence.

Must include:

- Clear question
- Outcome options
- Cutoff timer
- Resolution criteria
- Source of truth
- Topic reputation impact
- Hidden-until-cutoff explanation
- Submit answer flow
- After voting: receipt/status state, but no public vote distribution before cutoff

### 4. Reputation Profile

Purpose: show pseudonymous civic reputation.

Must include:

- Pseudonymous handle
- Verified-human badge/status without exposing identity
- Overall reputation
- Topic-specific reputation cards
- Accuracy / resolved count
- Recent resolved wins
- Public contribution framing, not “profit/loss”

### 5. Resolved Poll Page

Purpose: transparent archive after cutoff and resolution.

Must include:

- Final outcome
- Source evidence
- Vote distribution revealed after cutoff
- Reputation awarded
- Resolution notes
- Dispute window/status
- Public audit/commitment reference if available

### 6. Methodology / Trust Page

Purpose: make the platform credible.

Must explain:

- Verified-human model
- Pseudonymity
- Hidden votes
- Resolution criteria
- Reputation model
- Open-source commitment
- Auditability / public commitments
- Governance roadmap

### 7. Admin / Resolver Interface

Purpose: internal/admin workflow for creating and resolving polls.

Must include:

- Create poll form
- Topic/source/cutoff/resolution fields
- Resolution notes
- Evidence/source URL
- Resolve outcome action
- Dispute tracking

## UX Rules

- Do not show active poll results before cutoff.
- Always show why/how a poll resolves.
- Treat verification as privacy-preserving.
- Make reputation feel earned and civic, not financial.
- Never imply users earn money.
- Make open-source trust visible but not nerd-only.
- Use plain English. No governance jargon unless explained.

## Key Components

- Poll card
- Topic badge
- Verified-human badge
- Hidden-until-cutoff badge
- Resolution source panel
- Reputation topic card
- Public audit badge
- Outcome/reputation event row
- Methodology callout
- Democracy roadmap timeline

## Example Copy

### Hero

CivicSignal
Verified-human polling for public intelligence.

Answer real-world civic questions, stay pseudonymous by default, and build non-transferable reputation when your judgment proves right.

### Trust line

Votes stay hidden until cutoff. Reputation can’t be bought, transferred, or traded.

### Open-source line

CivicSignal is being built in the open as public-good civic infrastructure.

### Poll hidden state

Results hidden until cutoff to reduce herd behavior and preserve independent judgment.

## Deliverables Requested From Claude Design

1. Visual direction / style system.
2. Landing page design.
3. App dashboard / poll feed design.
4. Poll detail voting flow.
5. Reputation profile design.
6. Methodology/trust page design.
7. Component set with spacing/type/color guidance.
8. Notes for implementation in a Next.js/Tailwind app.

## Strong Recommendation

Make this feel like a civic institution for the internet age: trustworthy, global, transparent, and calm. If it starts looking like Polymarket, tone it down. If it starts looking like a government form, humanize it. The sweet spot is public-interest infrastructure with elegant consumer-grade UX.
