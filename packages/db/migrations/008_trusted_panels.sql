-- 008_trusted_panels.sql
-- Adds the first Trusted Panels layer: evidence packets, reputation-gated panel membership,
-- and multi-review dispute decisions with public transparency.

create table if not exists public.panel_members (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) not null,
  user_id uuid references public.profiles(id) not null,
  invited_by uuid references public.profiles(id),
  status text not null default 'invited' check (status in ('invited', 'active', 'declined', 'removed')),
  min_reputation_at_invite integer not null default 1,
  invited_at timestamptz default now(),
  accepted_at timestamptz,
  removed_at timestamptz,
  unique(topic_id, user_id)
);

create table if not exists public.dispute_evidence (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid references public.disputes(id) on delete cascade not null,
  submitted_by uuid references public.profiles(id) not null,
  summary text not null,
  source_url text,
  created_at timestamptz default now()
);

create table if not exists public.dispute_reviews (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid references public.disputes(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) not null,
  decision text not null check (decision in ('uphold', 'dismiss')),
  rationale text not null,
  created_at timestamptz default now(),
  unique(dispute_id, reviewer_id)
);

create index if not exists idx_panel_members_topic_status on public.panel_members(topic_id, status);
create index if not exists idx_panel_members_user_status on public.panel_members(user_id, status);
create index if not exists idx_dispute_evidence_dispute on public.dispute_evidence(dispute_id, created_at);
create index if not exists idx_dispute_reviews_dispute on public.dispute_reviews(dispute_id, created_at);

alter table public.panel_members enable row level security;
alter table public.dispute_evidence enable row level security;
alter table public.dispute_reviews enable row level security;

create policy "Panel memberships are publicly readable"
  on public.panel_members for select using (true);

create policy "Dispute evidence is publicly readable"
  on public.dispute_evidence for select using (true);

create policy "Authenticated users can submit dispute evidence"
  on public.dispute_evidence for insert with check (auth.uid() = submitted_by);

create policy "Dispute reviews are publicly readable"
  on public.dispute_reviews for select using (true);

create policy "Panelists can submit own dispute reviews"
  on public.dispute_reviews for insert with check (auth.uid() = reviewer_id);
