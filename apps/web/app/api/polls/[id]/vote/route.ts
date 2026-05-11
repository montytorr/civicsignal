import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { createVoteReceipt } from '@civicsignal/crypto'
import type { Database } from '@civicsignal/db'
import { rateLimit } from '@/lib/rate-limit'

type Poll = Pick<Database['public']['Tables']['polls']['Row'], 'id' | 'status' | 'cutoff_at'>
type Vote = Database['public']['Tables']['votes']['Row']

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

    // Rate limit: 10 vote submissions per user per hour across all polls.
    // The DB unique constraint prevents double-voting on a single poll;
    // this guard limits burst calls to the endpoint in case of client bugs or abuse.
    const { allowed, remaining } = rateLimit(`vote:${user.id}`, 10, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Try again later.', code: 'RATE_LIMITED' },
        {
          status: 429,
          headers: { 'Retry-After': '3600' },
        }
      )
    }

    const serviceClient = createServiceClient()
    const { data: profile } = await (serviceClient.from('profiles') as any)
      .select('verified')
      .eq('id', user.id)
      .single() as { data: { verified: boolean } | null }

    if (!profile?.verified) {
      return NextResponse.json(
        { success: false, error: 'You must verify your email before voting', code: 'UNVERIFIED' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { encryptedAnswer } = body

    if (!encryptedAnswer || typeof encryptedAnswer !== 'string') {
      return NextResponse.json(
        { success: false, error: 'encryptedAnswer is required', code: 'INVALID_BODY' },
        { status: 400 }
      )
    }

    // Verify poll is still active and cutoff has not passed.
    // Cast the table builder to any to bypass RLS-based `never` inference.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pollsTable = (supabase.from('polls') as any)
    const { data: poll, error: pollError } = await pollsTable
      .select('id, status, cutoff_at')
      .eq('id', pollId)
      .single() as { data: Poll | null; error: { message: string; code?: string } | null }

    if (pollError || !poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found', code: 'POLL_NOT_FOUND' },
        { status: 404 }
      )
    }

    if (poll.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Poll is not accepting votes', code: 'POLL_CLOSED' },
        { status: 409 }
      )
    }

    if (new Date(poll.cutoff_at) <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Poll cutoff has passed', code: 'POLL_CUTOFF_PASSED' },
        { status: 409 }
      )
    }

    // Check for an existing vote from this user (read via anon client — user can see their own vote)
    const { data: existingVote } = await (supabase.from('votes') as any)
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .maybeSingle() as { data: { id: string } | null }

    if (existingVote) {
      return NextResponse.json(
        { success: false, error: 'You have already voted on this poll', code: 'ALREADY_VOTED' },
        { status: 409 }
      )
    }

    const receipt = createVoteReceipt(pollId, user.id, encryptedAnswer)

    // Use service client for the insert to bypass RLS
    const { data: vote, error: insertError } = await (serviceClient.from('votes') as any)
      .insert({
        poll_id: pollId,
        user_id: user.id,
        encrypted_answer: encryptedAnswer,
        receipt_hash: receipt.hash,
      })
      .select()
      .single() as { data: Vote | null; error: { message: string; code?: string } | null }

    if (insertError) {
      // Unique constraint violation means duplicate vote
      if (insertError.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'You have already voted on this poll', code: 'ALREADY_VOTED' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        voteId: vote!.id,
        receipt: {
          hash: receipt.hash,
          shortHash: receipt.shortHash,
          timestamp: receipt.timestamp,
          pollId: receipt.pollId,
        },
      },
    })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
