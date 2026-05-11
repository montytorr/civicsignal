-- 003_seed_polls.sql
-- Inserts 10 real-world civic polls across diverse topics and regions.
-- Topic UUIDs are resolved by slug via a CTE to avoid hardcoding.

with topic_ids as (
  select slug, id from public.topics
  where slug in ('climate', 'econ', 'geopol', 'health', 'science', 'tech', 'energy', 'elect')
)

insert into public.polls (
  topic_id,
  question,
  region,
  options,
  source_of_truth,
  resolution_criteria,
  cutoff_at,
  resolves_at,
  status
)
select
  t.id as topic_id,
  p.question,
  p.region,
  p.options::jsonb,
  p.source_of_truth,
  p.resolution_criteria,
  p.cutoff_at::timestamptz,
  p.resolves_at::timestamptz,
  'active' as status
from (
  values

  -- 1. Climate / Global
  (
    'climate',
    'Will the IPCC AR7 Synthesis Report be published before 31 December 2026?',
    'Global',
    '["Yes", "No"]',
    'IPCC.ch official publications page (https://www.ipcc.ch/reports/)',
    'Resolves Yes if the IPCC AR7 Synthesis Report appears as a published document on ipcc.ch on or before 31 December 2026 23:59 UTC. Resolves No otherwise.',
    '2026-12-24 23:59:00+00',
    '2027-01-07 23:59:00+00'
  ),

  -- 2. Economics / US
  (
    'econ',
    'Will the U.S. Federal Reserve cut its benchmark rate at the June 2026 FOMC meeting?',
    'United States',
    '["Cut", "Hold", "Raise"]',
    'Federal Reserve press release issued on the final day of the June 2026 FOMC meeting (federalreserve.gov/monetarypolicy/fomc.htm)',
    'Resolves Cut if the Federal Open Market Committee votes to lower the federal funds target range at its June 2026 meeting. Resolves Raise if the range is increased. Resolves Hold if the range is unchanged.',
    '2026-06-17 18:00:00+00',
    '2026-06-18 23:59:00+00'
  ),

  -- 3. Geopolitics / UN
  (
    'geopol',
    'Will at least 60 nations sign the High Seas Treaty implementation framework by 30 September 2026?',
    'Global',
    '["Yes", "No"]',
    'UN Division for Ocean Affairs and the Law of the Sea (DOALOS) official signatory list (un.org/depts/los)',
    'Resolves Yes if the DOALOS official signatory list records 60 or more distinct UN member state signatures on the BBNJ Agreement implementation framework on or before 30 September 2026. Resolves No otherwise.',
    '2026-09-29 23:59:00+00',
    '2026-10-07 23:59:00+00'
  ),

  -- 4. Public Health / Global
  (
    'health',
    'Will WHO declare a Public Health Emergency of International Concern in Q3 2026?',
    'Global',
    '["Yes", "No"]',
    'WHO official PHEIC declarations page (who.int/emergencies/overview)',
    'Resolves Yes if the WHO Director-General formally declares a Public Health Emergency of International Concern (PHEIC) with an announcement dated between 1 July 2026 and 30 September 2026 inclusive. Resolves No if no such declaration is issued in that window.',
    '2026-09-29 23:59:00+00',
    '2026-10-07 23:59:00+00'
  ),

  -- 5. Science / Global
  (
    'science',
    'Will SpaceX Starship complete a fully-reusable orbital flight in 2026?',
    'Global',
    '["Yes", "No"]',
    'SpaceX official mission updates (spacex.com/updates) and FAA launch licensing records',
    'Resolves Yes if SpaceX publicly confirms, and FAA records confirm, a Starship mission in which both the Super Heavy booster and Ship upper stage are recovered intact (not expended) following an orbital trajectory on or before 31 December 2026. Resolves No otherwise.',
    '2026-12-28 23:59:00+00',
    '2027-01-07 23:59:00+00'
  ),

  -- 6. Technology / EU
  (
    'tech',
    'Will the EU AI Act enforcement begin general-purpose model audits before Q4 2026?',
    'European Union',
    '["Yes", "No"]',
    'EU AI Office official enforcement notices and the Official Journal of the European Union (eur-lex.europa.eu)',
    'Resolves Yes if the EU AI Office or a designated national authority formally initiates at least one general-purpose AI model audit procedure (as defined under the AI Act Chapter V) with a notice dated before 1 October 2026. Resolves No otherwise.',
    '2026-09-29 23:59:00+00',
    '2026-10-07 23:59:00+00'
  ),

  -- 7. Energy / OPEC+
  (
    'energy',
    'Will OPEC+ announce a production cut at its next ministerial meeting?',
    'Global',
    '["Cut", "Hold", "Increase"]',
    'OPEC official communiqué published on opec.org following the next OPEC+ Joint Ministerial Monitoring Committee (JMMC) or full ministerial meeting',
    'Resolves Cut if the official post-meeting communiqué states that aggregate OPEC+ production targets are reduced relative to the prior agreement. Resolves Increase if targets are raised. Resolves Hold if targets are unchanged.',
    '2026-06-29 23:59:00+00',
    '2026-07-07 23:59:00+00'
  ),

  -- 8. Elections / France
  (
    'elect',
    'Will voter turnout in the 2027 French presidential election exceed 75%?',
    'France',
    '["Yes", "No"]',
    'French Ministry of the Interior official election results portal (interieur.gouv.fr/Elections)',
    'Resolves Yes if the Ministry of the Interior official results for the 2027 French presidential election (first or second round, whichever is referenced in the question) report a national turnout figure strictly above 75.00%. Resolves No otherwise.',
    '2027-04-27 20:00:00+00',
    '2027-05-04 23:59:00+00'
  ),

  -- 9. Geopolitics / UN Security Council
  (
    'geopol',
    'Will the UN Security Council adopt a new resolution on climate security before 2027?',
    'Global',
    '["Yes", "No"]',
    'UN Security Council official resolutions database (undocs.org/en/S/RES)',
    'Resolves Yes if a UN Security Council resolution explicitly addressing climate change as a security threat is adopted (not merely proposed or vetoed) and published in the UN resolutions database with a date on or before 31 December 2026. Resolves No otherwise.',
    '2026-12-28 23:59:00+00',
    '2027-01-07 23:59:00+00'
  ),

  -- 10. Economics / UK
  (
    'econ',
    'Will UK annual CPI inflation fall below 2% before December 2026?',
    'United Kingdom',
    '["Yes", "No"]',
    'UK Office for National Statistics (ONS) Consumer Price Index release (ons.gov.uk/economy/inflationandpriceindices)',
    'Resolves Yes if any ONS monthly CPI release published before 1 December 2026 reports a 12-month CPI rate strictly below 2.0%. Resolves No if no such release is published before that date.',
    '2026-11-30 23:59:00+00',
    '2026-12-07 23:59:00+00'
  )

) as p(
  topic_slug,
  question,
  region,
  options,
  source_of_truth,
  resolution_criteria,
  cutoff_at,
  resolves_at
)
join topic_ids t on t.slug = p.topic_slug;
