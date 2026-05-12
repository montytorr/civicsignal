#!/usr/bin/env node
const base = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!base || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
const req = async (path, init = {}) => {
  const res = await fetch(`${base}${path}`, { ...init, headers: { ...headers, Prefer: init.prefer ?? init.headers?.Prefer ?? '', ...(init.headers ?? {}) } })
  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { json = text }
  if (!res.ok) throw new Error(`${res.status} ${typeof json === 'object' && json?.message ? json.message : text}`)
  return json
}

const proposals = [
  {
    topic: 'climate',
    question: 'Will the International Energy Agency report global coal demand declining year-over-year in its 2026 Coal report?',
    region: 'Global',
    options: ['Yes', 'No'],
    source_of_truth: 'International Energy Agency Coal 2026 report page and data tables',
    resolution_criteria: 'Resolves YES if the official IEA Coal 2026 publication reports global coal demand lower than the prior year. Press previews and third-party summaries do not count.',
    cutoff_at: '2026-12-01T23:59:00Z',
    resolves_at: '2027-01-15T23:59:00Z',
    status: 'pending',
  },
  {
    topic: 'geopol',
    question: 'Will the UN General Assembly adopt a resolution calling for an international AI safety treaty before 31 December 2026?',
    region: 'United Nations',
    options: ['Yes', 'No'],
    source_of_truth: 'United Nations Digital Library official General Assembly voting record',
    resolution_criteria: 'Resolves YES if an adopted UNGA resolution explicitly calls for negotiation, drafting, or adoption of an international AI safety treaty by 2026-12-31. Drafts and speeches do not count.',
    cutoff_at: '2026-12-20T23:59:00Z',
    resolves_at: '2027-01-15T23:59:00Z',
    status: 'pending',
  },
  {
    topic: 'econ',
    question: 'Will the Bank of England cut Bank Rate below 4.0% before 31 December 2026?',
    region: 'United Kingdom',
    options: ['Yes', 'No'],
    source_of_truth: 'Bank of England Monetary Policy Committee decisions page',
    resolution_criteria: 'Resolves YES if an official MPC decision sets Bank Rate below 4.0% with a decision date on or before 2026-12-31. Market pricing and speeches do not count.',
    cutoff_at: '2026-12-18T23:59:00Z',
    resolves_at: '2027-01-08T23:59:00Z',
    status: 'changes_requested',
    moderator_notes: 'Needs explicit handling if an emergency unscheduled MPC meeting occurs; otherwise source and outcome are strong.',
  },
  {
    topic: 'health',
    question: 'Will the WHO publish updated pandemic influenza preparedness guidance before 30 September 2026?',
    region: 'Global',
    options: ['Yes', 'No'],
    source_of_truth: 'World Health Organization official publications page',
    resolution_criteria: 'Resolves YES if WHO publishes a new or updated pandemic influenza preparedness guidance document on who.int by 2026-09-30 23:59 UTC. Regional-office-only publications do not count.',
    cutoff_at: '2026-09-20T23:59:00Z',
    resolves_at: '2026-10-10T23:59:00Z',
    status: 'approved',
    moderator_notes: 'Approved as an example of narrow source-based public-health authoring.',
  },
  {
    topic: 'elect',
    question: 'Will France publish final official turnout above 70% for the first round of the 2027 presidential election?',
    region: 'France',
    options: ['Yes', 'No'],
    source_of_truth: 'French Ministry of Interior official election results',
    resolution_criteria: 'Resolves YES if the Ministry of Interior final first-round turnout figure is strictly above 70.00%. Media projections and partial counts do not count.',
    cutoff_at: '2027-04-10T23:59:00Z',
    resolves_at: '2027-05-05T23:59:00Z',
    status: 'pending',
  },
]

try {
  const profiles = await req('/rest/v1/profiles?select=id,handle,verified,is_admin&or=(is_admin.eq.true,verified.eq.true)&limit=1')
  if (!profiles.length) throw new Error('No verified/admin profile available to own seed proposals')
  const owner = profiles[0]
  const topics = await req('/rest/v1/topics?select=id,slug')
  const topicId = new Map(topics.map((t) => [t.slug, t.id]))
  let inserted = 0
  let updated = 0

  for (const proposal of proposals) {
    const existing = await req(`/rest/v1/poll_proposals?select=id,status&question=eq.${encodeURIComponent(proposal.question)}&limit=1`)
    const body = {
      proposed_by: owner.id,
      topic_id: topicId.get(proposal.topic),
      question: proposal.question,
      region: proposal.region,
      options: proposal.options,
      source_of_truth: proposal.source_of_truth,
      resolution_criteria: proposal.resolution_criteria,
      cutoff_at: proposal.cutoff_at,
      resolves_at: proposal.resolves_at,
      status: proposal.status,
      moderator_notes: proposal.moderator_notes ?? null,
    }
    if (!body.topic_id) throw new Error(`Missing topic ${proposal.topic}`)
    if (existing.length) {
      await req(`/rest/v1/poll_proposals?id=eq.${existing[0].id}`, { method: 'PATCH', prefer: 'return=minimal', body: JSON.stringify(body) })
      updated++
    } else {
      await req('/rest/v1/poll_proposals', { method: 'POST', prefer: 'return=minimal', body: JSON.stringify(body) })
      inserted++
    }
  }
  console.log(`SEED_OK launch-proposals owner=${owner.handle} inserted=${inserted} updated=${updated}`)
} catch (err) {
  console.error('SEED_FAIL launch-proposals:', err.message)
  process.exit(1)
}
