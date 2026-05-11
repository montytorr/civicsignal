import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { Database } from '@civicsignal/db'

type PollRow = Pick<
  Database['public']['Tables']['polls']['Row'],
  'id' | 'status' | 'topic_id' | 'resolved_at'
>
type DisputeRow = Database['public']['Tables']['disputes']['Row']

// Cast table builder past RLS-based `never` inference
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (client: ReturnType<typeof createServiceClient>, table: string): any =>
  (client as any).from(table)

type Params = { params: Promise<{ id: string }> }

export const POST = async (req: Request, { params }: Params) => {
  try {
    const { id: pollId } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { reason } = body

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'reason is required', code: 'INVALID_BODY' },
        { status: 400 }
      )
    }

    if (reason.trim().length > 1000) {
      return NextResponse.json(
        { success: false, error: 'reason must be 1000 characters or fewer', code: 'INVALID_BODY' },
        { status: 400 }
      )
    }

    const db = createServiceClient()

    // Fetch the poll
    const { data: poll, error: pollError } = await t(db, 'polls')
      .select('id, status, topic_id, resolved_at')
      .eq('id', pollId)
      .single() as { data: PollRow | null; error: { message: string } | null }

    if (pollError || !poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found', code: 'POLL_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Poll must be resolved
    if (poll.status !== 'resolved') {
      return NextResponse.json(
        { success: false, error: 'Only resolved polls can be disputed', code: 'POLL_NOT_RESOLVED' },
        { status: 409 }
      )
    }

    // Dispute window: within 24h of resolution
    if (!poll.resolved_at) {
      return NextResponse.json(
        { success: false, error: 'Poll resolution timestamp missing', code: 'NO_RESOLVED_AT' },
        { status: 409 }
      )
    }

    const resolvedAt = new Date(poll.resolved_at)
    const windowCloseAt = new Date(resolvedAt.getTime() + 24 * 60 * 60 * 1000)
    if (new Date() > windowCloseAt) {
      return NextResponse.json(
        { success: false, error: 'Dispute window has closed (24h after resolution)', code: 'WINDOW_CLOSED' },
        { status: 409 }
      )
    }

    // User must have reputation in the poll's topic
    const { data: reputation } = await t(db, 'user_topic_reputation')
      .select('score')
      .eq('user_id', user.id)
      .eq('topic_id', poll.topic_id)
      .maybeSingle() as { data: { score: number } | null }

    if (!reputation || reputation.score <= 0) {
      return NextResponse.json(
        { success: false, error: 'You must have reputation in this topic to dispute a resolution', code: 'NO_REPUTATION' },
        { status: 403 }
      )
    }

    // Check for an existing dispute from this user on this poll
    const { data: existing } = await t(db, 'disputes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('flagged_by', user.id)
      .maybeSingle() as { data: { id: string } | null }

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You have already flagged this resolution', code: 'ALREADY_DISPUTED' },
        { status: 409 }
      )
    }

    const { data: dispute, error: insertError } = await t(db, 'disputes')
      .insert({
        poll_id: pollId,
        flagged_by: user.id,
        reason: reason.trim(),
        status: 'open',
      })
      .select('id')
      .single() as { data: Pick<DisputeRow, 'id'> | null; error: { message: string } | null }

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, dispute: { id: dispute!.id } })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
