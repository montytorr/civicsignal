import { createClient } from '@/lib/supabase-server'
import type { Database } from '@civicsignal/db'

type Profile = Database['public']['Tables']['profiles']['Row']

export const getActivePolls = async () => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('polls')
    .select('id, question, topic_id, region, options, cutoff_at, resolves_at, status, topics(slug, label)')
    .in('status', ['active', 'closed'])
    .order('cutoff_at')
  return data ?? []
}

export const getPollById = async (id: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('polls')
    .select('*, topics(slug, label)')
    .eq('id', id)
    .single()
  return data
}

export const getUserVote = async (pollId: string) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('votes')
    .select('*')
    .eq('poll_id', pollId)
    .eq('user_id', user.id)
    .maybeSingle()
  return data
}

export const getVoteCount = async (pollId: string) => {
  const supabase = await createClient()
  const { count } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('poll_id', pollId)
  return count ?? 0
}

export const getVoteCountsByPoll = async (pollIds: string[]) => {
  if (pollIds.length === 0) return new Map<string, number>()
  const supabase = await createClient()
  const { data } = await (supabase.from('votes') as any)
    .select('poll_id')
    .in('poll_id', pollIds) as { data: Array<{ poll_id: string }> | null }

  const counts = new Map<string, number>()
  pollIds.forEach((id) => counts.set(id, 0))
  ;(data ?? []).forEach((row) => {
    counts.set(row.poll_id, (counts.get(row.poll_id) ?? 0) + 1)
  })
  return counts
}

export const getVoteDistribution = async (pollId: string) => {
  const supabase = await createClient()
  const { data } = await (supabase.from('votes') as any)
    .select('answer')
    .eq('poll_id', pollId) as { data: Array<{ answer: string | null }> | null }

  const counts = new Map<string, number>()
  ;(data ?? []).forEach((row) => {
    if (row.answer) counts.set(row.answer, (counts.get(row.answer) ?? 0) + 1)
  })
  return counts
}

export const getUserProfile = async (handle: string) => {
  const supabase = await createClient()
  const { data } = await (supabase.from('profiles') as any)
    .select('*')
    .eq('handle', handle)
    .maybeSingle() as { data: Profile | null }
  return data
}

export const getUserReputation = async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_topic_reputation')
    .select('*, topics(slug, label)')
    .eq('user_id', userId)
    .order('score', { ascending: false })
  return data ?? []
}

export const getRecentContributions = async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reputation_events')
    .select('*, polls(question), topics(label)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)
  return data ?? []
}

export const getPendingVotes = async (userId: string) => {
  const supabase = await createClient()
  const { data } = await (supabase.from('votes') as any)
    .select('id, poll_id, answer, receipt_hash, created_at, polls(question, status, resolves_at, cutoff_at, topics(label))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20) as { data: Array<{
      id: string
      poll_id: string
      answer: string | null
      receipt_hash: string
      created_at: string
      polls: { question: string; status: string; resolves_at: string; cutoff_at: string; topics: { label: string } | null } | null
    }> | null }
  return data ?? []
}

export const getTopics = async () => {
  const supabase = await createClient()
  const { data } = await supabase.from('topics').select('*').order('label')
  return data ?? []
}

export const getPlatformStats = async () => {
  const supabase = await createClient()
  const [users, polls, regions] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('polls').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
    supabase.from('polls').select('region').in('status', ['active', 'closed', 'resolved']),
  ])
  const uniqueRegions = new Set((regions.data ?? []).map((r: any) => r.region))
  return {
    verifiedHumans: users.count ?? 0,
    pollsResolved: polls.count ?? 0,
    regions: uniqueRegions.size,
  }
}

export const getAdminPolls = async () => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('polls')
    .select('*, topics(slug, label)')
    .order('created_at', { ascending: false })
  return data ?? []
}

export const getTopicLeaderboard = async (topicSlug: string, limit = 20) => {
  const supabase = await createClient()
  const { data } = await (supabase
    .from('user_topic_reputation') as any)
    .select('user_id, score, resolved_count, correct_count, profiles(handle, verified), topics!inner(slug, label)')
    .eq('topics.slug', topicSlug)
    .order('score', { ascending: false })
    .limit(limit)
  return (data ?? []) as Array<{
    user_id: string
    score: number
    resolved_count: number
    correct_count: number
    profiles: { handle: string; verified: boolean } | null
    topics: { slug: string; label: string } | null
  }>
}

export const getResolvedPolls = async () => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('polls')
    .select('id, question, topic_id, region, options, resolved_at, resolves_at, outcome, topics(slug, label)')
    .eq('status', 'resolved')
    .order('resolved_at', { ascending: false })
  return (data ?? []) as Array<{
    id: string
    question: string
    topic_id: string
    region: string
    options: string[]
    resolved_at: string | null
    resolves_at: string
    outcome: string | null
    topics: { slug: string; label: string } | null
  }>
}

export const getAwaitingResolution = async () => {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('polls')
    .select('id, question, topic_id, resolves_at, source_of_truth, options, topics(slug, label)')
    .eq('status', 'closed')
    .order('resolves_at') as { data: Array<{
      id: string
      question: string
      topic_id: string
      resolves_at: string
      source_of_truth: string | null
      options: string[]
      topics: { slug: string; label: string } | null
    }> | null }
  return data ?? []
}

export const getAuditStats = async () => {
  const supabase = await createClient()
  const [polls, commitments] = await Promise.all([
    supabase.from('polls').select('*', { count: 'exact', head: true }),
    (supabase as any).from('audit_commitments').select('*', { count: 'exact', head: true }),
  ])
  return { totalPolls: polls.count ?? 0, totalCommitments: commitments.count ?? 0 }
}

export const getOpenDisputes = async () => {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('disputes')
    .select('*, polls(question, topic_id, topics(label))')
    .in('status', ['open', 'reviewing'])
    .order('created_at', { ascending: false }) as {
    data: Array<{
      id: string
      poll_id: string
      flagged_by: string
      reason: string
      status: string
      created_at: string
      resolved_at: string | null
      polls: { question: string; topic_id: string; topics: { label: string } | null } | null
    }> | null
  }

  const disputes = data ?? []
  const ids = disputes.map((d) => d.id)
  if (ids.length === 0) return []

  const [evidenceRes, reviewRes] = await Promise.all([
    (supabase as any).from('dispute_evidence').select('*').in('dispute_id', ids).order('created_at').then((r: any) => r).catch(() => ({ data: [] })),
    (supabase as any).from('dispute_reviews').select('*, profiles(handle)').in('dispute_id', ids).order('created_at').then((r: any) => r).catch(() => ({ data: [] })),
  ]) as [
    { data: Array<{ id: string; dispute_id: string; submitted_by: string; summary: string; source_url: string | null; created_at: string }> | null },
    { data: Array<{ id: string; dispute_id: string; reviewer_id: string; decision: string; rationale: string; created_at: string; profiles: { handle: string } | null }> | null },
  ]

  return disputes.map((d) => ({
    ...d,
    evidence: (evidenceRes.data ?? []).filter((e) => e.dispute_id === d.id),
    reviews: (reviewRes.data ?? []).filter((r) => r.dispute_id === d.id),
  }))
}

export const getPanelTransparency = async () => {
  const supabase = await createClient()
  const [members, evidence, reviews] = await Promise.all([
    (supabase as any).from('panel_members').select('*, topics(label, slug), profiles(handle)').order('invited_at', { ascending: false }).limit(50).then((r: any) => r).catch(() => ({ data: [] })),
    (supabase as any).from('dispute_evidence').select('*, disputes(poll_id, status, polls(question))').order('created_at', { ascending: false }).limit(50).then((r: any) => r).catch(() => ({ data: [] })),
    (supabase as any).from('dispute_reviews').select('*, profiles(handle), disputes(poll_id, status, polls(question))').order('created_at', { ascending: false }).limit(50).then((r: any) => r).catch(() => ({ data: [] })),
  ])

  return {
    members: members.data ?? [],
    evidence: evidence.data ?? [],
    reviews: reviews.data ?? [],
  }
}

export const getPollPublicKey = async (pollId: string) => {
  const supabase = await createClient()
  const { data } = await (supabase.from('audit_commitments') as any)
    .select('metadata')
    .eq('poll_id', pollId)
    .eq('batch_type', 'vote')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle() as { data: { metadata: { publicKey?: string } } | null }
  return data?.metadata?.publicKey ?? null
}

export const getAuditCommitments = async () => {
  const supabase = await createClient()
  const { data } = await (supabase.from('audit_commitments') as any)
    .select('id, poll_id, merkle_root, batch_type, created_at, polls(question)')
    .order('created_at', { ascending: false })
  return (data ?? []) as Array<{
    id: string
    poll_id: string
    merkle_root: string
    batch_type: string
    created_at: string
    polls: { question: string } | null
  }>
}

export const getPanelInviteCandidates = async () => {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('user_topic_reputation')
    .select('user_id, topic_id, score, resolved_count, correct_count, profiles(handle, verified), topics(slug, label)')
    .gt('score', 0)
    .order('score', { ascending: false })
    .limit(100)
    .then((r: any) => r)
    .catch(() => ({ data: [] }))

  const rows = data ?? []
  const userIds = Array.from(new Set(rows.map((r: any) => r.user_id).filter(Boolean)))
  const topicIds = Array.from(new Set(rows.map((r: any) => r.topic_id).filter(Boolean)))

  const { data: memberships } = userIds.length && topicIds.length
    ? await (supabase as any)
      .from('panel_members')
      .select('user_id, topic_id, status')
      .in('user_id', userIds)
      .in('topic_id', topicIds)
      .then((r: any) => r)
      .catch(() => ({ data: [] }))
    : { data: [] }

  return rows.map((row: any) => ({
    ...row,
    panelStatus: (memberships ?? []).find((m: any) => m.user_id === row.user_id && m.topic_id === row.topic_id)?.status ?? null,
  }))
}

export const getMyPanelWorkspace = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, memberships: [], disputes: [] }

  const { data: memberships } = await (supabase as any)
    .from('panel_members')
    .select('*, topics(label, slug)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('accepted_at', { ascending: false })
    .then((r: any) => r)
    .catch(() => ({ data: [] }))

  const topicIds = (memberships ?? []).map((m: any) => m.topic_id)
  if (topicIds.length === 0) return { user, memberships: memberships ?? [], disputes: [] }

  const { data: disputes } = await (supabase as any)
    .from('disputes')
    .select('*, polls(question, topic_id, topics(label))')
    .in('status', ['open', 'reviewing'])
    .in('polls.topic_id', topicIds)
    .order('created_at', { ascending: false })
    .then((r: any) => r)
    .catch(() => ({ data: [] }))

  const ids = (disputes ?? []).map((d: any) => d.id)
  if (ids.length === 0) return { user, memberships: memberships ?? [], disputes: [] }

  const [evidenceRes, reviewRes] = await Promise.all([
    (supabase as any).from('dispute_evidence').select('*').in('dispute_id', ids).order('created_at').then((r: any) => r).catch(() => ({ data: [] })),
    (supabase as any).from('dispute_reviews').select('*, profiles(handle)').in('dispute_id', ids).order('created_at').then((r: any) => r).catch(() => ({ data: [] })),
  ])

  return {
    user,
    memberships: memberships ?? [],
    disputes: (disputes ?? []).map((d: any) => ({
      ...d,
      evidence: (evidenceRes.data ?? []).filter((e: any) => e.dispute_id === d.id),
      reviews: (reviewRes.data ?? []).filter((r: any) => r.dispute_id === d.id),
    })),
  }
}
