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
    .select('*, polls(question)')
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
      polls: { question: string } | null
    }> | null
  }
  return data ?? []
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
