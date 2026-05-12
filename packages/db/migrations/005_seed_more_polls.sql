-- 004_seed_more_polls.sql
-- Inserts 25 additional real-world civic polls spanning all 8 topics and
-- diverse regions. All questions are genuinely resolvable in 2026-2027.

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

  -- ── CLIMATE (4) ────────────────────────────────────────────────────────────

  -- 11
  (
    'climate',
    'Will global average surface temperature in 2026 be the hottest year on record?',
    'Global',
    '["Yes", "No"]',
    'WMO Global Climate Statement for 2026 (wmo.int/publication-series/wmo-global-climate-statements)',
    'Resolves Yes if the WMO annual Global Climate Statement published in early 2027 declares 2026 the warmest year on record in the combined instrumental surface temperature dataset. Resolves No if another year holds the record or the statement is inconclusive.',
    '2027-01-28 23:59:00+00',
    '2027-02-07 23:59:00+00'
  ),

  -- 12
  (
    'climate',
    'Will the Amazon basin experience a below-average dry-season fire count in 2026 compared to the 2015-2024 mean?',
    'Brazil',
    '["Yes", "No"]',
    'Brazil INPE PRODES and BDQueimadas fire monitoring database (queimadas.dgi.inpe.br)',
    'Resolves Yes if INPE reports the total Amazon basin active-fire count for July-October 2026 is strictly below the 2015-2024 mean for the same months. Resolves No otherwise.',
    '2026-11-15 23:59:00+00',
    '2026-11-30 23:59:00+00'
  ),

  -- 13
  (
    'climate',
    'Will the EU reach agreement on a common defense-plus-climate spending framework before October 2026?',
    'European Union',
    '["Yes", "No"]',
    'Official Journal of the European Union (eur-lex.europa.eu) and European Council conclusions',
    'Resolves Yes if the European Council formally adopts a joint framework explicitly linking defense and climate expenditure targets before 1 October 2026. Resolves No otherwise.',
    '2026-09-29 23:59:00+00',
    '2026-10-07 23:59:00+00'
  ),

  -- 14
  (
    'climate',
    'Will global CO2 emissions decline year-over-year in 2026 according to the IEA?',
    'Global',
    '["Yes", "No"]',
    'IEA Global Energy Review or CO2 Emissions from Energy Combustion report for 2026 (iea.org/reports)',
    'Resolves Yes if the IEA''s primary 2026 emissions report states that global energy-related CO2 emissions in 2026 were strictly lower than in 2025. Resolves No otherwise.',
    '2027-03-28 23:59:00+00',
    '2027-04-07 23:59:00+00'
  ),

  -- ── ECONOMICS (4) ──────────────────────────────────────────────────────────

  -- 15
  (
    'econ',
    'Will India''s GDP growth exceed 7% in Q2 2026 (April-June) according to the Ministry of Statistics?',
    'India',
    '["Yes", "No"]',
    'India Ministry of Statistics and Programme Implementation (MoSPI) National Accounts press release for Q2 2026-27 (mospi.gov.in)',
    'Resolves Yes if the MoSPI advance or revised estimate for April-June 2026 GDP growth at constant prices reports a rate strictly above 7.0% year-on-year. Resolves No otherwise.',
    '2026-11-28 23:59:00+00',
    '2026-12-07 23:59:00+00'
  ),

  -- 16
  (
    'econ',
    'Will the eurozone enter a technical recession (two consecutive quarters of negative GDP growth) in 2026?',
    'European Union',
    '["Yes", "No"]',
    'Eurostat GDP and main aggregates flash estimates (ec.europa.eu/eurostat/statistics-explained/index.php/GDP_and_main_aggregates)',
    'Resolves Yes if Eurostat flash estimates published in 2026 show two consecutive quarters of negative quarter-on-quarter real GDP growth in the eurozone. Resolves No if no such sequence is reported by 31 December 2026.',
    '2026-12-29 23:59:00+00',
    '2027-01-07 23:59:00+00'
  ),

  -- 17
  (
    'econ',
    'Will the Bank of Japan raise its policy rate above 1% before the end of 2026?',
    'Japan',
    '["Yes", "No"]',
    'Bank of Japan Monetary Policy Meeting statements and press releases (boj.or.jp/en/mopo/)',
    'Resolves Yes if the Bank of Japan officially sets its uncollateralised overnight call rate target or policy rate above 1.00% in any Monetary Policy Meeting statement dated on or before 31 December 2026. Resolves No otherwise.',
    '2026-12-29 23:59:00+00',
    '2027-01-07 23:59:00+00'
  ),

  -- 18
  (
    'econ',
    'Will the US unemployment rate rise above 5% at any point in 2026?',
    'United States',
    '["Yes", "No"]',
    'US Bureau of Labor Statistics monthly Employment Situation Summary (bls.gov/news.release/empsit.toc.htm)',
    'Resolves Yes if any BLS monthly Employment Situation report published in 2026 reports a seasonally-adjusted national unemployment rate strictly above 5.0%. Resolves No if no such figure appears in 2026 reports.',
    '2026-12-05 23:59:00+00',
    '2026-12-12 23:59:00+00'
  ),

  -- ── GEOPOLITICS (4) ────────────────────────────────────────────────────────

  -- 19
  (
    'geopol',
    'Will NATO formally accept a new member state in 2026?',
    'Global',
    '["Yes", "No"]',
    'NATO official membership announcements (nato.int/cps/en/natohq/topics_52044.htm)',
    'Resolves Yes if NATO issues a formal accession announcement for a new member state at any point in 2026. Resolves No if no such announcement is made before 31 December 2026.',
    '2026-12-29 23:59:00+00',
    '2027-01-07 23:59:00+00'
  ),

  -- 20
  (
    'geopol',
    'Will the WTO Appellate Body resume operations with a full bench of seven members before July 2026?',
    'Global',
    '["Yes", "No"]',
    'WTO Dispute Settlement Body meeting records and Appellate Body membership page (wto.org/english/tratop_e/dispu_e/appellate_body_e.htm)',
    'Resolves Yes if the WTO Dispute Settlement Body formally appoints enough members to restore a full seven-member Appellate Body bench before 1 July 2026. Resolves No otherwise.',
    '2026-06-29 23:59:00+00',
    '2026-07-07 23:59:00+00'
  ),

  -- 21
  (
    'geopol',
    'Will G7 leaders agree on a new Russia sanctions package at the 2026 G7 Summit?',
    'Global',
    '["Yes", "No"]',
    'Official G7 Summit communiqué (g7italy.it or the host-country portal for the 2026 Summit)',
    'Resolves Yes if the official G7 Summit communiqué published at the conclusion of the 2026 summit explicitly announces a new or expanded sanctions package targeting Russia. Resolves No otherwise.',
    '2026-06-14 23:59:00+00',
    '2026-06-21 23:59:00+00'
  ),

  -- 22
  (
    'geopol',
    'Will Israel and a new Arab state establish formal diplomatic relations in 2026?',
    'Middle East',
    '["Yes", "No"]',
    'Official government announcements from the relevant states and UN treaty registration records',
    'Resolves Yes if both the Israeli government and the government of a state with which it did not previously have formal relations jointly announce the establishment of full diplomatic relations, with an announcement dated in 2026. Resolves No otherwise.',
    '2026-12-29 23:59:00+00',
    '2027-01-07 23:59:00+00'
  ),

  -- ── PUBLIC HEALTH (3) ──────────────────────────────────────────────────────

  -- 23
  (
    'health',
    'Will the WHO approve a new malaria vaccine for wide use in sub-Saharan Africa before October 2026?',
    'Sub-Saharan Africa',
    '["Yes", "No"]',
    'WHO prequalification database and official press releases (extranet.who.int/pqweb/vaccines)',
    'Resolves Yes if the WHO issues prequalification or a positive policy recommendation for a malaria vaccine not previously approved (other than RTS,S/AS01 and R21/Matrix-M) before 1 October 2026. Resolves No otherwise.',
    '2026-09-29 23:59:00+00',
    '2026-10-07 23:59:00+00'
  ),

  -- 24
  (
    'health',
    'Will US FDA approve a new Alzheimer''s disease-modifying treatment in 2026?',
    'United States',
    '["Yes", "No"]',
    'FDA drug approvals database (fda.gov/drugs/nda-and-bla-approvals)',
    'Resolves Yes if the FDA grants full or accelerated approval to a drug with a claimed disease-modifying mechanism of action for Alzheimer''s disease, with an approval date in 2026 and distinct from previously approved agents (lecanemab, donanemab). Resolves No otherwise.',
    '2026-12-29 23:59:00+00',
    '2027-01-07 23:59:00+00'
  ),

  -- 25
  (
    'health',
    'Will global measles cases in 2026 exceed the 2023 total reported by WHO?',
    'Global',
    '["Yes", "No"]',
    'WHO Global Health Observatory measles data and the joint WHO-UNICEF annual measles report for 2026',
    'Resolves Yes if the WHO annual measles surveillance report covering 2026 (expected publication 2027) records a global total of confirmed and probable measles cases strictly higher than the 2023 total. Resolves No otherwise.',
    '2027-03-28 23:59:00+00',
    '2027-04-07 23:59:00+00'
  ),

  -- ── SCIENCE (3) ────────────────────────────────────────────────────────────

  -- 26
  (
    'science',
    'Will NASA''s Artemis III crewed Moon landing mission launch in 2026?',
    'Global',
    '["Yes", "No"]',
    'NASA official Artemis mission status page (nasa.gov/artemis) and NASA/commercial launch records',
    'Resolves Yes if Artemis III lifts off from Earth with a crew on board on or before 31 December 2026, as confirmed by NASA''s official mission updates. Resolves No otherwise.',
    '2026-12-29 23:59:00+00',
    '2027-01-07 23:59:00+00'
  ),

  -- 27
  (
    'science',
    'Will a peer-reviewed study report room-temperature ambient-pressure superconductivity confirmed by independent labs in 2026?',
    'Global',
    '["Yes", "No"]',
    'Publications in Nature, Science, or Physical Review Letters indexed by Web of Science or Scopus, with independent replication noted in the same or follow-up study by end of 2026',
    'Resolves Yes if a peer-reviewed paper reporting room-temperature (above 20°C) ambient-pressure superconductivity is published in a major journal AND at least one independent laboratory publishes a replication result, both indexed before 31 December 2026. Resolves No otherwise.',
    '2026-12-29 23:59:00+00',
    '2027-01-07 23:59:00+00'
  ),

  -- 28
  (
    'science',
    'Will the James Webb Space Telescope confirm biosignature gases in an exoplanet atmosphere in 2026?',
    'Global',
    '["Yes", "No"]',
    'NASA/ESA/CSA JWST official science publications page and the peer-reviewed paper itself (STScI JWST blog: webbtelescope.org/news)',
    'Resolves Yes if NASA, ESA, or CSA officially announces a JWST finding of confirmed biosignature gases (dimethyl sulfide, phosphine, or equivalent) in an exoplanet atmosphere, backed by a peer-reviewed paper published or accepted in 2026. Resolves No otherwise.',
    '2026-12-29 23:59:00+00',
    '2027-01-07 23:59:00+00'
  ),

  -- ── TECHNOLOGY (3) ─────────────────────────────────────────────────────────

  -- 29
  (
    'tech',
    'Will a publicly available AI model achieve a score above 90% on the MMLU benchmark in 2026?',
    'Global',
    '["Yes", "No"]',
    'MMLU leaderboard on Papers With Code (paperswithcode.com/sota/multi-task-language-understanding-on-mmlu) and the model''s official technical report',
    'Resolves Yes if any model with publicly accessible weights or API access reports a 5-shot MMLU score strictly above 90.0% on the standard test split, as listed on the Papers With Code leaderboard with a date in 2026. Resolves No otherwise.',
    '2026-12-29 23:59:00+00',
    '2027-01-07 23:59:00+00'
  ),

  -- 30
  (
    'tech',
    'Will China''s semiconductor industry produce a 5nm-class chip without foreign EUV lithography tools in 2026?',
    'China',
    '["Yes", "No"]',
    'SMIC, Huawei, or CXMT official product announcements and independent teardown reports by TechInsights or similar firms',
    'Resolves Yes if SMIC or another Chinese fab publicly ships a chip with transistor density consistent with a 5nm-class node (verified by a credible third-party teardown report) without the use of ASML EUV equipment, announced by 31 December 2026. Resolves No otherwise.',
    '2026-12-29 23:59:00+00',
    '2027-01-07 23:59:00+00'
  ),

  -- 31
  (
    'tech',
    'Will the EU Digital Markets Act result in Apple opening iPhone sideloading to all EU users in 2026?',
    'European Union',
    '["Yes", "No"]',
    'Apple Developer News and Updates (developer.apple.com/news/) and the European Commission DMA enforcement tracker',
    'Resolves Yes if Apple ships an iOS update in 2026 that enables sideloading (installation of apps from non-App-Store sources) for all EU-resident iPhone users, confirmed by Apple''s official developer notes or a European Commission compliance decision. Resolves No otherwise.',
    '2026-12-29 23:59:00+00',
    '2027-01-07 23:59:00+00'
  ),

  -- ── ENERGY (2) ─────────────────────────────────────────────────────────────

  -- 32
  (
    'energy',
    'Will global offshore wind capacity additions in 2026 exceed 25 GW according to IRENA?',
    'Global',
    '["Yes", "No"]',
    'IRENA Renewable Capacity Statistics 2027 report (irena.org/Publications/2027/Mar/Renewable-capacity-statistics-2027)',
    'Resolves Yes if the IRENA Renewable Capacity Statistics report covering year-end 2026 data reports global newly installed offshore wind capacity strictly above 25 GW for the year 2026. Resolves No otherwise.',
    '2027-04-28 23:59:00+00',
    '2027-05-07 23:59:00+00'
  ),

  -- 33
  (
    'energy',
    'Will Brent crude oil average below $70 per barrel in Q3 2026?',
    'Global',
    '["Yes", "No"]',
    'ICE Brent front-month futures daily settlement prices (theice.com/products/219/Brent-Crude-Futures) averaged over July-September 2026',
    'Resolves Yes if the arithmetic mean of daily ICE Brent front-month settlement prices for all trading days in July, August, and September 2026 is strictly below $70.00 USD per barrel. Resolves No otherwise.',
    '2026-10-05 23:59:00+00',
    '2026-10-12 23:59:00+00'
  ),

  -- ── ELECTIONS (2) ──────────────────────────────────────────────────────────

  -- 34
  (
    'elect',
    'Will the incumbent party win the 2026 German federal election?',
    'Germany',
    '["Yes", "No"]',
    'German Federal Returning Officer official election results (bundeswahlleiter.de)',
    'Resolves Yes if the party that leads (or led the largest bloc of) the outgoing federal government retains the chancellorship after the 2026 federal election, as confirmed by the Federal Returning Officer. Resolves No if a different party forms the government.',
    '2026-10-12 23:59:00+00',
    '2026-10-26 23:59:00+00'
  ),

  -- 35
  (
    'elect',
    'Will voter turnout in the 2026 Brazilian municipal elections exceed 80%?',
    'Brazil',
    '["Yes", "No"]',
    'Brazilian Superior Electoral Court (TSE) official results portal (tse.jus.br)',
    'Resolves Yes if the TSE reports national voter turnout (valid votes cast as a percentage of registered electors) strictly above 80% for the first round of the 2026 Brazilian municipal elections. Resolves No otherwise.',
    '2026-10-08 18:00:00+00',
    '2026-10-15 23:59:00+00'
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
join topic_ids t on t.slug = p.topic_slug
where not exists (select 1 from public.polls existing where existing.question = p.question);
