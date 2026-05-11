import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const INVITE_CODE_LENGTH = 8
const MAX_ACTIVE_INVITES = 5

const generateCode = () =>
  Array.from({ length: INVITE_CODE_LENGTH }, () =>
    INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)]
  ).join('')

export const GET = async () => {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data: invites, error } = await (supabase.from('invites') as any)
      .select('id, code, used_by, used_at, created_at')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: invites ?? [] })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = async () => {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Count active (unused) invites for this user
    const { count, error: countError } = await (supabase.from('invites') as any)
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.id)
      .is('used_by', null)

    if (countError) {
      return NextResponse.json(
        { success: false, error: countError.message },
        { status: 500 }
      )
    }

    if ((count ?? 0) >= MAX_ACTIVE_INVITES) {
      return NextResponse.json(
        { success: false, error: `Maximum of ${MAX_ACTIVE_INVITES} active invites allowed`, code: 'MAX_INVITES_REACHED' },
        { status: 400 }
      )
    }

    const code = generateCode()
    const serviceClient = createServiceClient()

    const { data: invite, error: insertError } = await (serviceClient.from('invites') as any)
      .insert({ code, created_by: user.id })
      .select('id, code, used_by, used_at, created_at')
      .single()

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: invite }, { status: 201 })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
