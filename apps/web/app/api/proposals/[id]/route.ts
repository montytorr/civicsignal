import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const t = (client: ReturnType<typeof createServiceClient>, table: string): any => (client as any).from(table)

type Params = { params: Promise<{ id: string }> }

const proposalFields = (body: any) => {
  const out: Record<string, unknown> = {}
  if (typeof body.question === 'string' && body.question.trim().length >= 12) out.question = body.question.trim()
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
    const { data: current, error: fetchError } = await t(db, 'poll_proposals').select('*').eq('id', id).single()
    if (fetchError || !current) return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 })
    if (current.proposed_by !== user.id) return NextResponse.json({ success: false, error: 'Only the proposer can revise or appeal this proposal' }, { status: 403 })

    const body = await req.json()
    if (body.action === 'appeal') {
      if (current.status !== 'rejected') return NextResponse.json({ success: false, error: 'Only rejected proposals can be appealed', code: 'INVALID_STATUS' }, { status: 409 })
      const reason = typeof body.appealReason === 'string' ? body.appealReason.trim() : ''
      if (reason.length < 12) return NextResponse.json({ success: false, error: 'Appeal reason must explain what should be reconsidered', code: 'INVALID_BODY' }, { status: 400 })
      const { data, error } = await t(db, 'poll_proposals')
        .update({ status: 'appealed', appeal_reason: reason, appealed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id, status, appeal_reason, appealed_at')
        .single()
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, proposal: data })
    }

    if (body.action === 'revise') {
      if (!['changes_requested', 'rejected'].includes(current.status)) return NextResponse.json({ success: false, error: 'Only proposals needing changes or rejected proposals can be revised', code: 'INVALID_STATUS' }, { status: 409 })
      const edits = proposalFields(body)
      if (Object.keys(edits).length === 0) return NextResponse.json({ success: false, error: 'No valid revision fields provided', code: 'INVALID_BODY' }, { status: 400 })
      const { data, error } = await t(db, 'poll_proposals')
        .update({ ...edits, status: 'pending', revision_count: (current.revision_count ?? 0) + 1, appeal_reason: null, appealed_at: null, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id, status, revision_count')
        .single()
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, proposal: data })
    }

    return NextResponse.json({ success: false, error: 'Invalid proposal action', code: 'INVALID_ACTION' }, { status: 400 })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
