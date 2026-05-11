-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.polls enable row level security;
alter table public.votes enable row level security;
alter table public.reputation_events enable row level security;
alter table public.user_topic_reputation enable row level security;
alter table public.audit_commitments enable row level security;
alter table public.disputes enable row level security;
alter table public.invites enable row level security;
alter table public.topics enable row level security;

-- Topics: public read
create policy "Topics are publicly readable" on public.topics for select using (true);

-- Profiles: public read, own write
create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Polls: public read for active/closed/resolved, full access for service role
create policy "Active polls are publicly readable" on public.polls for select using (status in ('active', 'closed', 'resolved'));
create policy "Admins can manage polls" on public.polls for all using (auth.jwt() ->> 'role' = 'service_role');

-- Votes: users can insert own, read own
create policy "Users can insert own vote" on public.votes for insert with check (auth.uid() = user_id);
create policy "Users can read own votes" on public.votes for select using (auth.uid() = user_id);

-- Reputation events: public read
create policy "Reputation events are publicly readable" on public.reputation_events for select using (true);

-- User topic reputation: public read
create policy "User reputation is publicly readable" on public.user_topic_reputation for select using (true);

-- Audit commitments: public read
create policy "Audit commitments are publicly readable" on public.audit_commitments for select using (true);

-- Disputes: public read, authenticated users with reputation can insert
create policy "Disputes are publicly readable" on public.disputes for select using (true);
create policy "Authenticated users can create disputes" on public.disputes for insert with check (auth.uid() = flagged_by);

-- Invites: users can read own invites
create policy "Users can read own invites" on public.invites for select using (auth.uid() = created_by or auth.uid() = used_by);
