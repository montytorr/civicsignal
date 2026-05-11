import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { Database } from '@civicsignal/db'

type DisputeStatus = Database['public']['Enums']['dispute_status']
type DisputeRow = Database['public']['Tables']['disputes']['Row']

// Cast table builder past RLS-based `never` inference
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (client: ReturnType<typeof createServiceClient>, table: string): any =>
  (client as any).from(table)

const VALID_STATUSES: DisputeStatus[] = ['reviewing', 'upheld', 'dismissed']

type Params = { params: Promise<{ id: string }> }

export const PATCH = async (req: Request, { params }: Params) => {
  try {
    const { id: disputeId } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const db = createServiceClient()
    const { data: profile } = await (db.from('profiles') as any)
      .select('is_admin')
      .eq('id', user.id)
      .single()
    if (!profile?.is_admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { status, notes } = body as { status: DisputeStatus; notes?: string }

    if (!status || typeof status !== 'string' || !VALID_STATUSES.includes(status as DisputeStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `status must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      )
    }

    if (notes !== undefined && (typeof notes !== 'string' || notes.length > 2000)) {
      return NextResponse.json(
        { success: false, error: 'notes must be a string (max 2000 chars)', code: 'INVALID_BODY' },
        { status: 400 }
      )
    }

    // Fetch the dispute to verify it exists and get the poll_id
    const { data: dispute, error: fetchError } = await t(db, 'disputes')
      .select('id, poll_id, status')
      .eq('id', disputeId)
      .single() as { data: Pick<DisputeRow, 'id' | 'poll_id' | 'status'> | null; error: { message: string } | null }

    if (fetchError || !dispute) {
      return NextResponse.json(
        { success: false, error: 'Dispute not found', code: 'DISPUTE_NOT_FOUND' },
        { status: 404 }
      )
    }

    const resolvedAt = status === 'upheld' || status === 'dismissed'
      ? new Date().toISOString()
      : null

    const updatePayload: Record<string, unknown> = { status }
    if (resolvedAt) updatePayload.resolved_at = resolvedAt
    if (notes !== undefined) updatePayload.notes = notes

    const { data: updated, error: updateError } = await t(db, 'disputes')
      .update(updatePayload)
      .eq('id', disputeId)
      .select()
      .single() as { data: DisputeRow | null; error: { message: string } | null }

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    // If upheld, mark the poll status back to 'disputed'
    if (status === 'upheld') {
      const { error: pollUpdateError } = await t(db, 'polls')
        .update({ status: 'disputed' })
        .eq('id', dispute.poll_id) as { error: { message: string } | null }

      if (pollUpdateError) {
        console.error('Failed to update poll status to disputed:', pollUpdateError.message)
      }
    }

    return NextResponse.json({ success: true, dispute: updated })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
