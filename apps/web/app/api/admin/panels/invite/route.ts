import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const t = (client: ReturnType<typeof createServiceClient>, table: string): any =>
  (client as any).from(table)

export const POST = async (req: Request) => {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const db = createServiceClient()
    const { data: admin } = await (db.from('profiles') as any)
      .select('is_admin')
      .eq('id', user.id)
      .single()
    if (!admin?.is_admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { topicId, userId, minReputation = 1, activate = true } = body as {
      topicId?: string
      userId?: string
      minReputation?: number
      activate?: boolean
    }

    if (!topicId || !userId) {
      return NextResponse.json({ success: false, error: 'topicId and userId are required', code: 'INVALID_BODY' }, { status: 400 })
    }

    const { data: rep } = await t(db, 'user_topic_reputation')
      .select('score')
      .eq('topic_id', topicId)
      .eq('user_id', userId)
      .maybeSingle() as { data: { score: number } | null }

    if (!rep || rep.score < minReputation) {
      return NextResponse.json({ success: false, error: `User needs at least ${minReputation} topic reputation`, code: 'INSUFFICIENT_REPUTATION' }, { status: 403 })
    }

    const now = new Date().toISOString()
    const payload = {
      topic_id: topicId,
      user_id: userId,
      invited_by: user.id,
      status: activate ? 'active' : 'invited',
      min_reputation_at_invite: minReputation,
      accepted_at: activate ? now : null,
    }

    const { data: member, error } = await t(db, 'panel_members')
      .upsert(payload, { onConflict: 'topic_id,user_id' })
      .select('id, topic_id, user_id, status, min_reputation_at_invite, invited_at, accepted_at')
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, member })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
