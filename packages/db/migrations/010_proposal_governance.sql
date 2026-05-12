-- 010_proposal_governance.sql
-- Proposal revision and appeal metadata so moderation decisions remain public but reversible.

alter table public.poll_proposals
  drop constraint if exists poll_proposals_status_check;

alter table public.poll_proposals
  add constraint poll_proposals_status_check
  check (status in ('pending', 'approved', 'rejected', 'changes_requested', 'appealed'));

alter table public.poll_proposals
  add column if not exists revision_count integer not null default 0,
  add column if not exists appeal_reason text,
  add column if not exists appealed_at timestamptz;

insert into public.source_templates (slug, label, region, topic_slug, source_of_truth, resolution_criteria_template) values
  ('who-public-health-emergency', 'WHO public health emergency', 'Global', 'health', 'World Health Organization official statement and WHO.int emergency page', 'Resolves according to the first official WHO statement or emergency page update. Media reports, member-state briefings, and unofficial documents do not count.'),
  ('iea-energy-report', 'IEA energy publication', 'Global', 'climate', 'International Energy Agency official report page', 'Resolves according to the named IEA report or data release published on iea.org. Previews, speeches, and third-party coverage do not count.'),
  ('national-court-ruling', 'National court ruling', 'National', 'geopol', 'Named court docket or official judgment publication', 'Resolves according to the final published judgment or docket entry from the named court. Oral arguments, leaks, and non-final orders do not count unless explicitly named.'),
  ('central-bank-rate-decision', 'Central bank rate decision', 'National', 'econ', 'Named central bank official monetary policy statement', 'Resolves according to the official monetary policy statement from the named central bank. Market expectations and press speculation do not count.'),
  ('local-council-vote', 'Local council vote', 'Local', 'local', 'Official local council minutes, agenda result, or clerk publication', 'Resolves according to the official council record or clerk publication. Campaign statements, local press previews, and unofficial livestream comments do not count.')
on conflict (slug) do update set
  label = excluded.label,
  region = excluded.region,
  topic_slug = excluded.topic_slug,
  source_of_truth = excluded.source_of_truth,
  resolution_criteria_template = excluded.resolution_criteria_template;
