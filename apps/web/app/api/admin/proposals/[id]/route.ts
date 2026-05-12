import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { generatePollKeypair } from '@civicsignal/crypto'

const t = (client: ReturnType<typeof createServiceClient>, table: string): any => (client as any).from(table)
const ACTIONS = ['approve', 'reject', 'changes_requested', 'update'] as const

type Action = typeof ACTIONS[number]
type Params = { params: Promise<{ id: string }> }

const editableFields = (body: any) => {
  const out: Record<string, unknown> = {}
  if (typeof body.question === 'string') out.question = body.question.trim()
  if (typeof body.topicId === 'string') out.topic_id = body.topicId
  if (typeof body.region === 'string') out.region = body.region.trim()
  if (Array.isArray(body.options)) out.options = body.options.map(String).map((o: string) => o.trim()).filter(Boolean)
  if (typeof body.sourceOfTruth === 'string') out.source_of_truth = body.sourceOfTruth.trim()
  if (typeof body.resolutionCriteria === 'string') out.resolution_criteria = body.resolutionCriteria.trim()
  if (body.cutoffAt) out.cutoff_at = new Date(body.cutoffAt).toISOString()
  if (body.resolvesAt) out.resolves_at = new Date(body.resolvesAt).toISOString()
  return out
}

export const PATCH = async (req: Request, { params }: Params) => {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })

    const db = createServiceClient()
    const { data: admin } = await (db.from('profiles') as any).select('is_admin').eq('id', user.id).single()
    if (!admin?.is_admin) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })

    const body = await req.json()
    const action = body.action as Action
    if (!ACTIONS.includes(action)) return NextResponse.json({ success: false, error: 'Invalid moderation action', code: 'INVALID_ACTION' }, { status: 400 })

    const { data: current, error: fetchError } = await t(db, 'poll_proposals').select('*').eq('id', id).single()
    if (fetchError || !current) return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 })

    const edits = editableFields(body)
    if (action === 'update') {
      const { data, error } = await t(db, 'poll_proposals')
        .update({ ...edits, moderator_notes: body.moderatorNotes ?? current.moderator_notes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, proposal: data })
    }

    if (action === 'reject' || action === 'changes_requested') {
      const { data, error } = await t(db, 'poll_proposals')
        .update({
          ...edits,
          status: action,
          moderator_id: user.id,
          moderator_notes: body.moderatorNotes ?? null,
          moderated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, proposal: data })
    }

    const proposal = { ...current, ...edits }
    const keypair = generatePollKeypair()
    const { data: poll, error: pollError } = await t(db, 'polls')
      .insert({
        topic_id: proposal.topic_id,
        question: proposal.question,
        region: proposal.region,
        options: proposal.options,
        source_of_truth: proposal.source_of_truth,
        resolution_criteria: proposal.resolution_criteria,
        cutoff_at: proposal.cutoff_at,
        resolves_at: proposal.resolves_at,
        status: 'draft',
        created_by: proposal.proposed_by,
      })
      .select('id')
      .single()
    if (pollError || !poll) return NextResponse.json({ success: false, error: pollError?.message ?? 'Failed to create poll draft' }, { status: 500 })

    await t(db, 'audit_commitments').insert({
      poll_id: poll.id,
      merkle_root: keypair.publicKey,
      batch_type: 'vote',
      metadata: { type: 'keypair', publicKey: keypair.publicKey, secretKey: keypair.secretKey, proposalId: id },
    })

    const { data: updated, error: updateError } = await t(db, 'poll_proposals')
      .update({
        ...edits,
        status: 'approved',
        poll_id: poll.id,
        moderator_id: user.id,
        moderator_notes: body.moderatorNotes ?? 'Approved into draft poll.',
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    if (updateError) return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })

    return NextResponse.json({ success: true, proposal: updated, poll })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
