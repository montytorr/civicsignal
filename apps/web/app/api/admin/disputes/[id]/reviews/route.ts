import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const t = (client: ReturnType<typeof createServiceClient>, table: string): any =>
  (client as any).from(table)

const VALID_DECISIONS = ['uphold', 'dismiss'] as const
type Decision = typeof VALID_DECISIONS[number]

type Params = { params: Promise<{ id: string }> }

export const POST = async (req: Request, { params }: Params) => {
  try {
    const { id: disputeId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const { decision, rationale } = body as { decision?: Decision; rationale?: string }
    if (!decision || !VALID_DECISIONS.includes(decision)) {
      return NextResponse.json({ success: false, error: 'decision must be uphold or dismiss', code: 'INVALID_DECISION' }, { status: 400 })
    }
    if (!rationale || typeof rationale !== 'string' || rationale.trim().length < 8 || rationale.length > 2000) {
      return NextResponse.json({ success: false, error: 'rationale is required (8-2000 chars)', code: 'INVALID_BODY' }, { status: 400 })
    }

    const db = createServiceClient()
    const { data: dispute } = await t(db, 'disputes')
      .select('id, poll_id, status, polls(topic_id)')
      .eq('id', disputeId)
      .single() as { data: { id: string; poll_id: string; status: string; polls: { topic_id: string } | null } | null }

    if (!dispute) {
      return NextResponse.json({ success: false, error: 'Dispute not found', code: 'DISPUTE_NOT_FOUND' }, { status: 404 })
    }
    if (!['open', 'reviewing'].includes(dispute.status)) {
      return NextResponse.json({ success: false, error: 'Dispute is already closed', code: 'DISPUTE_CLOSED' }, { status: 409 })
    }

    const topicId = dispute.polls?.topic_id
    const [{ data: profile }, { data: panelMember }] = await Promise.all([
      (db.from('profiles') as any).select('is_admin').eq('id', user.id).single(),
      topicId
        ? t(db, 'panel_members').select('id, status').eq('topic_id', topicId).eq('user_id', user.id).eq('status', 'active').maybeSingle()
        : Promise.resolve({ data: null }),
    ]) as [{ data: { is_admin?: boolean } | null }, { data: { id: string; status: string } | null }]

    if (!profile?.is_admin && !panelMember) {
      return NextResponse.json({ success: false, error: 'Panel or admin access required', code: 'NOT_PANELIST' }, { status: 403 })
    }

    const { data: review, error: reviewError } = await t(db, 'dispute_reviews')
      .upsert({
        dispute_id: disputeId,
        reviewer_id: user.id,
        decision,
        rationale: rationale.trim(),
      }, { onConflict: 'dispute_id,reviewer_id' })
      .select('id, decision, rationale, reviewer_id, created_at')
      .single()

    if (reviewError) {
      return NextResponse.json({ success: false, error: reviewError.message }, { status: 500 })
    }

    await t(db, 'disputes').update({ status: 'reviewing' }).eq('id', disputeId).eq('status', 'open')

    const { data: reviews } = await t(db, 'dispute_reviews')
      .select('decision')
      .eq('dispute_id', disputeId) as { data: Array<{ decision: Decision }> | null }

    const counts = (reviews ?? []).reduce((acc, r) => {
      acc[r.decision] = (acc[r.decision] ?? 0) + 1
      return acc
    }, {} as Record<Decision, number>)

    const closingDecision = counts.uphold >= 2 ? 'upheld' : counts.dismiss >= 2 ? 'dismissed' : null
    if (closingDecision) {
      await t(db, 'disputes')
        .update({ status: closingDecision, resolved_at: new Date().toISOString(), resolution_notes: `Panel review: ${closingDecision}` })
        .eq('id', disputeId)
      if (closingDecision === 'upheld') {
        await t(db, 'polls').update({ status: 'disputed' }).eq('id', dispute.poll_id)
      }
    }

    return NextResponse.json({ success: true, review, counts, closedAs: closingDecision })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
