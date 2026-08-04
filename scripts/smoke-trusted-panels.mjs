#!/usr/bin/env node
import crypto from 'node:crypto'

const base = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!base || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
}

const req = async (path, init = {}) => {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { ...headers, Prefer: init.prefer ?? init.headers?.Prefer ?? '', ...(init.headers ?? {}) },
  })
  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { json = text }
  if (!res.ok) {
    const msg = typeof json === 'object' && json?.message ? json.message : text
    throw new Error(`${res.status} ${msg}`)
  }
  return json
}

const stamp = Date.now()
const password = crypto.randomBytes(18).toString('base64url') + 'Aa1!'
const ids = []
let pollId = null
let disputeId = null

const cleanup = async () => {
  if (disputeId) {
    try { await req(`/rest/v1/dispute_reviews?dispute_id=eq.${disputeId}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
    try { await req(`/rest/v1/dispute_evidence?dispute_id=eq.${disputeId}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
    try { await req(`/rest/v1/disputes?id=eq.${disputeId}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
  }
  if (pollId) {
    try { await req(`/rest/v1/polls?id=eq.${pollId}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
  }
  for (const id of ids) {
    try { await req(`/rest/v1/panel_members?user_id=eq.${id}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
    try { await req(`/rest/v1/user_topic_reputation?user_id=eq.${id}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
    try { await req(`/rest/v1/profiles?id=eq.${id}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
    try { await req(`/auth/v1/admin/users/${id}`, { method: 'DELETE' }) } catch {}
  }
}

const createUser = async (suffix) => {
  const handle = `panel-smoke-${suffix}-${stamp}`
  const user = await req('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email: `${handle}@smoke.civicsignal.test`, password, email_confirm: true, user_metadata: { handle } }),
  })
  const id = user.id
  ids.push(id)
  await req('/rest/v1/profiles?on_conflict=id', {
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=minimal',
    body: JSON.stringify({ id, handle, verified: true, verified_at: new Date().toISOString() }),
  })
  return id
}

try {
  const [topic] = await req('/rest/v1/topics?select=id,label&limit=1')
  if (!topic) throw new Error('No topic found')

  const userA = await createUser('a')
  const userB = await createUser('b')
  pollId = crypto.randomUUID()
  const now = new Date()

  await req('/rest/v1/polls', {
    method: 'POST',
    prefer: 'return=minimal',
    body: JSON.stringify({
      id: pollId,
      topic_id: topic.id,
      question: `Trusted Panels smoke test ${stamp}`,
      region: 'Global',
      options: ['Yes', 'No'],
      source_of_truth: 'CivicSignal smoke harness',
      resolution_criteria: 'Synthetic smoke test only.',
      cutoff_at: new Date(now.getTime() - 3600_000).toISOString(),
      resolves_at: new Date(now.getTime() - 1800_000).toISOString(),
      status: 'resolved',
      outcome: 'Yes',
      resolved_at: now.toISOString(),
    }),
  })

  await req('/rest/v1/user_topic_reputation?on_conflict=user_id,topic_id', {
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=minimal',
    body: JSON.stringify([
      { user_id: userA, topic_id: topic.id, score: 3, resolved_count: 3, correct_count: 3 },
      { user_id: userB, topic_id: topic.id, score: 3, resolved_count: 3, correct_count: 3 },
    ]),
  })

  await req('/rest/v1/panel_members?on_conflict=topic_id,user_id', {
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=minimal',
    body: JSON.stringify([
      { user_id: userA, topic_id: topic.id, status: 'active', min_reputation_at_invite: 1, accepted_at: now.toISOString() },
      { user_id: userB, topic_id: topic.id, status: 'active', min_reputation_at_invite: 1, accepted_at: now.toISOString() },
    ]),
  })

  const [dispute] = await req('/rest/v1/disputes?select=id', {
    method: 'POST',
    prefer: 'return=representation',
    body: JSON.stringify({ poll_id: pollId, flagged_by: userA, reason: 'Smoke evidence says the source wording should be reviewed.', status: 'open' }),
  })
  disputeId = dispute.id

  await req('/rest/v1/dispute_evidence', {
    method: 'POST',
    prefer: 'return=minimal',
    body: JSON.stringify({ dispute_id: dispute.id, submitted_by: userA, summary: 'Synthetic evidence packet for trusted panel smoke test.', source_url: 'https://civicsignal.montytorr.com/panels' }),
  })

  await req('/rest/v1/dispute_reviews', {
    method: 'POST',
    prefer: 'return=minimal',
    body: JSON.stringify([
      { dispute_id: dispute.id, reviewer_id: userA, decision: 'dismiss', rationale: 'Smoke review one dismisses after checking the synthetic source.' },
      { dispute_id: dispute.id, reviewer_id: userB, decision: 'dismiss', rationale: 'Smoke review two agrees and closes the synthetic dispute.' },
    ]),
  })

  await req(`/rest/v1/disputes?id=eq.${dispute.id}`, {
    method: 'PATCH',
    prefer: 'return=minimal',
    body: JSON.stringify({ status: 'dismissed', resolved_at: now.toISOString(), resolution_notes: 'Trusted Panels smoke test closed by two matching reviews.' }),
  })

  const [check] = await req(`/rest/v1/disputes?select=status,dispute_evidence(id),dispute_reviews(id)&id=eq.${dispute.id}`)
  if (check.status !== 'dismissed' || check.dispute_evidence.length !== 1 || check.dispute_reviews.length !== 2) {
    throw new Error(`Unexpected smoke result: ${JSON.stringify(check)}`)
  }
  console.log(`SMOKE_OK trusted-panels poll=${pollId} dispute=${dispute.id} topic=${topic.label}`)
} catch (err) {
  console.error('SMOKE_FAIL trusted-panels:', err.message)
  process.exitCode = 1
} finally {
  await cleanup()
}
