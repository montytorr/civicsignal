import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const GET = async () => {
  try {
    const supabase = await createClient()
    const { data: polls, error } = await supabase
      .from('polls')
      .select('*, topics(slug, label)')
      .in('status', ['active', 'closed'])
      .order('cutoff_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: polls ?? [] })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
