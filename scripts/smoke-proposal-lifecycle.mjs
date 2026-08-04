#!/usr/bin/env node
import crypto from 'node:crypto'

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

const stamp = Date.now()
const password = crypto.randomBytes(18).toString('base64url') + 'Aa1!'
const ids = []
const proposalIds = []
let pollId = null
let disputeId = null

const cleanup = async () => {
  if (disputeId) {
    try { await req(`/rest/v1/dispute_reviews?dispute_id=eq.${disputeId}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
    try { await req(`/rest/v1/dispute_evidence?dispute_id=eq.${disputeId}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
    try { await req(`/rest/v1/disputes?id=eq.${disputeId}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
  }
  if (pollId) {
    try { await req(`/rest/v1/votes?poll_id=eq.${pollId}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
    try { await req(`/rest/v1/reputation_events?poll_id=eq.${pollId}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
    try { await req(`/rest/v1/audit_commitments?poll_id=eq.${pollId}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
    try { await req(`/rest/v1/poll_proposals?poll_id=eq.${pollId}`, { method: 'PATCH', prefer: 'return=minimal', body: JSON.stringify({ poll_id: null }) }) } catch {}
    try { await req(`/rest/v1/polls?id=eq.${pollId}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
  }
  for (const pid of proposalIds) {
    try { await req(`/rest/v1/poll_proposals?id=eq.${pid}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
  }
  for (const id of ids) {
    try { await req(`/rest/v1/panel_members?user_id=eq.${id}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
    try { await req(`/rest/v1/user_topic_reputation?user_id=eq.${id}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
    try { await req(`/rest/v1/profiles?id=eq.${id}`, { method: 'DELETE', prefer: 'return=minimal' }) } catch {}
    try { await req(`/auth/v1/admin/users/${id}`, { method: 'DELETE' }) } catch {}
  }
}

const createUser = async (suffix, isAdmin = false) => {
  const handle = `proposal-smoke-${suffix}-${stamp}`
  const user = await req('/auth/v1/admin/users', { method: 'POST', body: JSON.stringify({ email: `${handle}@smoke.civicsignal.test`, password, email_confirm: true, user_metadata: { handle } }) })
  ids.push(user.id)
  await req('/rest/v1/profiles?on_conflict=id', { method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal', body: JSON.stringify({ id: user.id, handle, verified: true, verified_at: new Date().toISOString(), is_admin: isAdmin }) })
  return user.id
}

try {
  const [topic] = await req('/rest/v1/topics?select=id,label,slug&limit=1')
  if (!topic) throw new Error('No topic found')
  const proposer = await createUser('proposer')
  const admin = await createUser('admin', true)
  const panelist = await createUser('panelist')
  const now = new Date()
  const future = (ms) => new Date(now.getTime() + ms).toISOString()

  const [proposal] = await req('/rest/v1/poll_proposals?select=id,status,revision_count', {
    method: 'POST',
    prefer: 'return=representation',
    body: JSON.stringify({
      proposed_by: proposer,
      topic_id: topic.id,
      question: `Proposal lifecycle smoke test ${stamp}`,
      region: 'Global',
      options: ['Yes', 'No'],
      source_of_truth: 'CivicSignal smoke harness',
      resolution_criteria: 'Synthetic proposal lifecycle smoke test only.',
      cutoff_at: future(86_400_000),
      resolves_at: future(172_800_000),
      status: 'pending',
    }),
  })
  proposalIds.push(proposal.id)

  await req(`/rest/v1/poll_proposals?id=eq.${proposal.id}`, { method: 'PATCH', prefer: 'return=minimal', body: JSON.stringify({ status: 'changes_requested', moderator_id: admin, moderator_notes: 'Smoke asks for sharper criteria.', moderated_at: now.toISOString() }) })
  await req(`/rest/v1/poll_proposals?id=eq.${proposal.id}`, { method: 'PATCH', prefer: 'return=minimal', body: JSON.stringify({ status: 'pending', revision_count: 1, resolution_criteria: 'Synthetic proposal lifecycle smoke test only; official smoke harness is the sole source.', updated_at: now.toISOString() }) })
  await req(`/rest/v1/poll_proposals?id=eq.${proposal.id}`, { method: 'PATCH', prefer: 'return=minimal', body: JSON.stringify({ status: 'rejected', moderator_id: admin, moderator_notes: 'Smoke rejection for appeal path.', moderated_at: now.toISOString() }) })
  await req(`/rest/v1/poll_proposals?id=eq.${proposal.id}`, { method: 'PATCH', prefer: 'return=minimal', body: JSON.stringify({ status: 'appealed', appeal_reason: 'Smoke appeal verifies reconsideration path.', appealed_at: now.toISOString(), updated_at: now.toISOString() }) })

  const [poll] = await req('/rest/v1/polls?select=id', {
    method: 'POST',
    prefer: 'return=representation',
    body: JSON.stringify({
      topic_id: topic.id,
      question: `Approved proposal lifecycle poll ${stamp}`,
      region: 'Global',
      options: ['Yes', 'No'],
      source_of_truth: 'CivicSignal smoke harness',
      resolution_criteria: 'Synthetic lifecycle smoke only.',
      cutoff_at: new Date(now.getTime() - 3600_000).toISOString(),
      resolves_at: new Date(now.getTime() - 1800_000).toISOString(),
      status: 'draft',
      created_by: proposer,
    }),
  })
  pollId = poll.id
  await req(`/rest/v1/poll_proposals?id=eq.${proposal.id}`, { method: 'PATCH', prefer: 'return=minimal', body: JSON.stringify({ status: 'approved', poll_id: pollId, moderator_id: admin, moderator_notes: 'Approved after appeal in smoke.', moderated_at: now.toISOString() }) })
  await req('/rest/v1/audit_commitments', { method: 'POST', prefer: 'return=minimal', body: JSON.stringify({ poll_id: pollId, merkle_root: `smoke-root-${stamp}`, batch_type: 'vote', metadata: { type: 'smoke', proposalId: proposal.id } }) })
  await req(`/rest/v1/polls?id=eq.${pollId}`, { method: 'PATCH', prefer: 'return=minimal', body: JSON.stringify({ status: 'active' }) })
  await req('/rest/v1/votes', { method: 'POST', prefer: 'return=minimal', body: JSON.stringify({ poll_id: pollId, user_id: proposer, encrypted_answer: `sealed-${stamp}`, answer: 'Yes', receipt_hash: crypto.randomBytes(16).toString('hex') }) })
  await req(`/rest/v1/polls?id=eq.${pollId}`, { method: 'PATCH', prefer: 'return=minimal', body: JSON.stringify({ status: 'resolved', outcome: 'Yes', resolved_at: now.toISOString(), resolved_by: admin, resolution_notes: 'Synthetic lifecycle resolution.', resolution_source_url: 'https://civicsignal.montytorr.com/methodology' }) })
  await req('/rest/v1/reputation_events', { method: 'POST', prefer: 'return=minimal', body: JSON.stringify({ poll_id: pollId, user_id: proposer, topic_id: topic.id, delta: 1 }) })

  await req('/rest/v1/panel_members?on_conflict=topic_id,user_id', { method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal', body: JSON.stringify({ user_id: panelist, topic_id: topic.id, status: 'active', min_reputation_at_invite: 1, accepted_at: now.toISOString() }) })
  const [dispute] = await req('/rest/v1/disputes?select=id', { method: 'POST', prefer: 'return=representation', body: JSON.stringify({ poll_id: pollId, flagged_by: proposer, reason: 'Synthetic lifecycle dispute.', status: 'open' }) })
  disputeId = dispute.id
  await req('/rest/v1/dispute_evidence', { method: 'POST', prefer: 'return=minimal', body: JSON.stringify({ dispute_id: disputeId, submitted_by: proposer, summary: 'Lifecycle smoke evidence packet.', source_url: 'https://civicsignal.montytorr.com/verify' }) })
  await req('/rest/v1/dispute_reviews', { method: 'POST', prefer: 'return=minimal', body: JSON.stringify({ dispute_id: disputeId, reviewer_id: panelist, decision: 'dismiss', rationale: 'Smoke panel review dismisses synthetic dispute.' }) })
  await req(`/rest/v1/disputes?id=eq.${disputeId}`, { method: 'PATCH', prefer: 'return=minimal', body: JSON.stringify({ status: 'dismissed', resolved_at: now.toISOString(), resolution_notes: 'Lifecycle smoke closed after panel review.' }) })

  const [check] = await req(`/rest/v1/poll_proposals?select=status,revision_count,appeal_reason,polls(status,outcome),profiles!poll_proposals_proposed_by_fkey(handle)&id=eq.${proposal.id}`)
  if (check.status !== 'approved' || check.revision_count !== 1 || !check.appeal_reason || check.polls.status !== 'resolved' || check.polls.outcome !== 'Yes') {
    throw new Error(`Unexpected lifecycle result: ${JSON.stringify(check)}`)
  }
  console.log(`SMOKE_OK proposal-lifecycle proposal=${proposal.id} poll=${pollId} dispute=${disputeId} topic=${topic.label}`)
} catch (err) {
  console.error('SMOKE_FAIL proposal-lifecycle:', err.message)
  process.exitCode = 1
} finally {
  await cleanup()
}
