-- 009_poll_proposals.sql
-- Community poll authoring: verified-user proposals, moderation state, and reusable source templates.

create table if not exists public.source_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  region text not null,
  topic_slug text,
  source_of_truth text not null,
  resolution_criteria_template text not null,
  created_at timestamptz default now()
);

create table if not exists public.poll_proposals (
  id uuid primary key default gen_random_uuid(),
  proposed_by uuid references public.profiles(id) not null,
  topic_id uuid references public.topics(id) not null,
  question text not null,
  region text not null,
  options jsonb not null,
  source_of_truth text not null,
  resolution_criteria text not null,
  cutoff_at timestamptz not null,
  resolves_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'changes_requested')),
  moderator_id uuid references public.profiles(id),
  moderator_notes text,
  poll_id uuid references public.polls(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  moderated_at timestamptz
);

create index if not exists idx_poll_proposals_status_created on public.poll_proposals(status, created_at desc);
create index if not exists idx_poll_proposals_topic on public.poll_proposals(topic_id);
create index if not exists idx_poll_proposals_proposed_by on public.poll_proposals(proposed_by);
create index if not exists idx_source_templates_region on public.source_templates(region);

alter table public.source_templates enable row level security;
alter table public.poll_proposals enable row level security;

create policy "Source templates are publicly readable"
  on public.source_templates for select using (true);

create policy "Poll proposals are publicly readable"
  on public.poll_proposals for select using (true);

create policy "Verified users can create own poll proposals"
  on public.poll_proposals for insert with check (auth.uid() = proposed_by);

create policy "Users can update own pending poll proposals"
  on public.poll_proposals for update using (auth.uid() = proposed_by and status = 'pending');

insert into public.source_templates (slug, label, region, topic_slug, source_of_truth, resolution_criteria_template) values
  ('eu-commission-official', 'EU Commission official publication', 'European Union', 'geopol', 'European Commission official press release or EUR-Lex publication', 'Resolves according to the first official European Commission or EUR-Lex publication matching the question. Drafts, leaks, and unofficial briefings do not count.'),
  ('us-federal-register', 'US Federal Register rule/action', 'United States', 'geopol', 'Federal Register publication plus named agency docket', 'Resolves according to the final Federal Register publication or named agency docket. Proposed rules do not count unless the question explicitly asks about proposal publication.'),
  ('un-official-vote', 'UN official vote record', 'United Nations', 'geopol', 'United Nations Digital Library voting record or official meeting record', 'Resolves according to the official UN voting/meeting record. Press coverage and draft resolutions do not count.'),
  ('elections-certified-result', 'Certified election result', 'Global', 'elect', 'Official election authority certified result', 'Resolves according to the final certified result from the named election authority. Projections, exit polls, and media calls do not count.'),
  ('ipcc-publication', 'IPCC publication', 'Global', 'climate', 'IPCC.ch publication page and official press release', 'Resolves YES only if the named IPCC report or synthesis is officially published on ipcc.ch by the cutoff specified in the question. Leaks and pre-publication drafts do not count.'),
  ('economic-stat-release', 'Official economic statistic release', 'Global', 'econ', 'Named official statistics agency release', 'Resolves according to the first official release from the named statistics agency. Later revisions do not change the result unless the question explicitly says revised data.')
on conflict (slug) do update set
  label = excluded.label,
  region = excluded.region,
  topic_slug = excluded.topic_slug,
  source_of_truth = excluded.source_of_truth,
  resolution_criteria_template = excluded.resolution_criteria_template;
