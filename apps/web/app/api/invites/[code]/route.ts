import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

type Props = {
  params: Promise<{ code: string }>
}

export const POST = async (_req: Request, { params }: Props) => {
  try {
    const { code } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Look up the invite
    const { data: invite, error: lookupError } = await (supabase.from('invites') as any)
      .select('id, code, created_by, used_by')
      .eq('code', code.toUpperCase())
      .maybeSingle()

    if (lookupError) {
      return NextResponse.json(
        { success: false, error: lookupError.message },
        { status: 500 }
      )
    }

    if (!invite) {
      return NextResponse.json(
        { success: false, error: 'Invite code not found', code: 'INVALID_CODE' },
        { status: 404 }
      )
    }

    if (invite.used_by) {
      return NextResponse.json(
        { success: false, error: 'Invite code has already been used', code: 'CODE_USED' },
        { status: 400 }
      )
    }

    if (invite.created_by === user.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot redeem your own invite code', code: 'SELF_REDEEM' },
        { status: 400 }
      )
    }

    const serviceClient = createServiceClient()
    const { error: updateError } = await (serviceClient.from('invites') as any)
      .update({ used_by: user.id, used_at: new Date().toISOString() })
      .eq('id', invite.id)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: { redeemed: true } })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
