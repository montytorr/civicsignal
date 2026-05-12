import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const t = (client: ReturnType<typeof createServiceClient>, table: string): any => (client as any).from(table)

const validateProposal = (body: any) => {
  const { question, topicId, region, options, sourceOfTruth, resolutionCriteria, cutoffAt, resolvesAt } = body
  if (!question || typeof question !== 'string' || question.trim().length < 12 || question.length > 500) return 'Question must be 12-500 characters.'
  if (!topicId || typeof topicId !== 'string') return 'Topic is required.'
  if (!region || typeof region !== 'string' || region.length > 100) return 'Region is required.'
  if (!Array.isArray(options) || options.map(String).map((o) => o.trim()).filter(Boolean).length < 2) return 'Add at least two outcome options.'
  if (!sourceOfTruth || typeof sourceOfTruth !== 'string' || sourceOfTruth.trim().length < 8 || sourceOfTruth.length > 500) return 'Source-of-truth is required.'
  if (!resolutionCriteria || typeof resolutionCriteria !== 'string' || resolutionCriteria.trim().length < 20 || resolutionCriteria.length > 2000) return 'Resolution criteria must be specific.'
  const cutoff = new Date(cutoffAt)
  const resolves = new Date(resolvesAt)
  if (Number.isNaN(cutoff.getTime()) || Number.isNaN(resolves.getTime())) return 'Cutoff and resolution date must be valid.'
  if (cutoff >= resolves) return 'Cutoff must be before resolution date.'
  return null
}

export const GET = async () => {
  const db = createServiceClient()
  const { data, error } = await t(db, 'poll_proposals')
    .select('id, question, region, options, source_of_truth, resolution_criteria, cutoff_at, resolves_at, status, moderator_notes, poll_id, created_at, moderated_at, topics(slug, label), profiles!poll_proposals_proposed_by_fkey(handle)')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, proposals: data ?? [] })
}

export const POST = async (req: Request) => {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })

    const db = createServiceClient()
    const { data: profile } = await (db.from('profiles') as any).select('verified').eq('id', user.id).single()
    if (!profile?.verified) return NextResponse.json({ success: false, error: 'Verified account required', code: 'UNVERIFIED' }, { status: 403 })

    const body = await req.json()
    const validationError = validateProposal(body)
    if (validationError) return NextResponse.json({ success: false, error: validationError, code: 'INVALID_BODY' }, { status: 400 })

    const { data: proposal, error } = await t(db, 'poll_proposals')
      .insert({
        proposed_by: user.id,
        topic_id: body.topicId,
        question: body.question.trim(),
        region: body.region.trim(),
        options: body.options.map(String).map((o: string) => o.trim()).filter(Boolean),
        source_of_truth: body.sourceOfTruth.trim(),
        resolution_criteria: body.resolutionCriteria.trim(),
        cutoff_at: new Date(body.cutoffAt).toISOString(),
        resolves_at: new Date(body.resolvesAt).toISOString(),
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, proposal }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
