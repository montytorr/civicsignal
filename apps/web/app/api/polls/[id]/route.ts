import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

type Params = { params: Promise<{ id: string }> }

export const GET = async (_req: Request, { params }: Params) => {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: poll, error } = await supabase
      .from('polls')
      .select('*, topics(slug, label)')
      .eq('id', id)
      .in('status', ['active', 'closed', 'resolved', 'disputed'])
      .single()

    if (error || !poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: poll })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
