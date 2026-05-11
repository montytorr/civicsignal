import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { Database } from '@civicsignal/db'

type Poll = Database['public']['Tables']['polls']['Row']
type PollStatusPick = Pick<Poll, 'id' | 'status'>

type Params = { params: Promise<{ id: string }> }

export const POST = async (_req: Request, { params }: Params) => {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const serviceClient = createServiceClient()
    const { data: profile } = await (serviceClient.from('profiles') as any)
      .select('is_admin')
      .eq('id', user.id)
      .single()
    if (!profile?.is_admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const { data: poll, error: fetchError } = await (serviceClient.from('polls') as any)
      .select('id, status')
      .eq('id', id)
      .single() as { data: PollStatusPick | null; error: { message: string } | null }

    if (fetchError || !poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      )
    }

    if (poll.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: `Cannot publish a poll with status "${poll.status}"`, code: 'INVALID_STATUS' },
        { status: 409 }
      )
    }

    const { data: updated, error: updateError } = await (serviceClient.from('polls') as any)
      .update({ status: 'active' })
      .eq('id', id)
      .select()
      .single() as { data: Poll | null; error: { message: string } | null }

    if (updateError || !updated) {
      return NextResponse.json(
        { success: false, error: updateError?.message ?? 'Failed to publish poll' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
