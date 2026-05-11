-- Topics
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  created_at timestamptz default now()
);

-- User profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null,
  verified boolean default false,
  verified_at timestamptz,
  created_at timestamptz default now()
);

-- Polls
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) not null,
  question text not null,
  region text not null,
  options jsonb not null,
  source_of_truth text not null,
  resolution_criteria text,
  cutoff_at timestamptz not null,
  resolves_at timestamptz not null,
  status text default 'draft' check (status in ('draft', 'active', 'closed', 'resolved', 'disputed')),
  outcome text,
  resolution_notes text,
  resolution_source_url text,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id),
  commitment_hash text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Votes (one per user per poll)
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.polls(id) not null,
  user_id uuid references public.profiles(id) not null,
  encrypted_answer text not null,
  answer text,
  receipt_hash text not null,
  created_at timestamptz default now(),
  unique(poll_id, user_id)
);

-- Reputation events
create table if not exists public.reputation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  poll_id uuid references public.polls(id) not null,
  topic_id uuid references public.topics(id) not null,
  delta integer not null default 0,
  created_at timestamptz default now()
);

-- Aggregated user-topic reputation
create table if not exists public.user_topic_reputation (
  user_id uuid references public.profiles(id) not null,
  topic_id uuid references public.topics(id) not null,
  score integer default 0,
  resolved_count integer default 0,
  correct_count integer default 0,
  primary key (user_id, topic_id)
);

-- Audit commitments
create table if not exists public.audit_commitments (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.polls(id),
  merkle_root text not null,
  batch_type text not null check (batch_type in ('vote', 'reputation', 'resolution')),
  metadata jsonb,
  created_at timestamptz default now()
);

-- Disputes
create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.polls(id) not null,
  flagged_by uuid references public.profiles(id) not null,
  reason text not null,
  status text default 'open' check (status in ('open', 'reviewing', 'upheld', 'dismissed')),
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- Invites
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  created_by uuid references public.profiles(id),
  used_by uuid references public.profiles(id),
  used_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_polls_status on public.polls(status);
create index if not exists idx_polls_topic on public.polls(topic_id);
create index if not exists idx_polls_cutoff on public.polls(cutoff_at);
create index if not exists idx_votes_poll on public.votes(poll_id);
create index if not exists idx_votes_user on public.votes(user_id);
create index if not exists idx_reputation_events_user on public.reputation_events(user_id);
create index if not exists idx_reputation_events_poll on public.reputation_events(poll_id);
create index if not exists idx_user_topic_rep_user on public.user_topic_reputation(user_id);

-- Seed topics
insert into public.topics (slug, label) values
  ('geopol', 'Geopolitics'),
  ('climate', 'Climate'),
  ('econ', 'Economics'),
  ('health', 'Public Health'),
  ('science', 'Science'),
  ('elect', 'Elections'),
  ('tech', 'Technology'),
  ('energy', 'Energy')
on conflict (slug) do nothing;
