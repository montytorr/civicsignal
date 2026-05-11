import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { decryptVote, buildMerkleRoot } from '@civicsignal/crypto'
import type { Database } from '@civicsignal/db'

type VoteRow = Database['public']['Tables']['votes']['Row']
type PollRow = Database['public']['Tables']['polls']['Row']
type AuditRow = Database['public']['Tables']['audit_commitments']['Row']
type UserTopicRepRow = Database['public']['Tables']['user_topic_reputation']['Row']

// Shorthand for casting the Supabase table builder past RLS-based `never` inference
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (client: ReturnType<typeof createServiceClient>, table: string): any =>
  (client as any).from(table)

type Params = { params: Promise<{ id: string }> }

export const POST = async (req: Request, { params }: Params) => {
  try {
    const { id: pollId } = await params

    // Auth check uses the cookie-based client
    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // All subsequent DB operations use the service client to bypass RLS
    const db = createServiceClient()

    const { data: profile } = await (db.from('profiles') as any)
      .select('is_admin')
      .eq('id', user.id)
      .single()
    if (!profile?.is_admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { outcome, notes, sourceUrl } = body

    if (!outcome || typeof outcome !== 'string') {
      return NextResponse.json(
        { success: false, error: 'outcome is required', code: 'INVALID_BODY' },
        { status: 400 }
      )
    }

    // Fetch the poll and verify it can be resolved
    const { data: poll, error: pollError } = await t(db, 'polls')
      .select('id, status, topic_id, options, cutoff_at')
      .eq('id', pollId)
      .single() as { data: Pick<PollRow, 'id' | 'status' | 'topic_id' | 'options' | 'cutoff_at'> | null; error: { message: string } | null }

    if (pollError || !poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      )
    }

    if (poll.status !== 'active' && poll.status !== 'closed') {
      return NextResponse.json(
        { success: false, error: `Cannot resolve a poll with status "${poll.status}"`, code: 'INVALID_STATUS' },
        { status: 409 }
      )
    }

    const options = poll.options as string[]
    if (!options.includes(outcome)) {
      return NextResponse.json(
        { success: false, error: `"${outcome}" is not a valid option for this poll`, code: 'INVALID_OUTCOME' },
        { status: 400 }
      )
    }

    // Retrieve the keypair stored at poll creation
    const { data: keypairCommitment, error: keypairError } = await t(db, 'audit_commitments')
      .select('metadata')
      .eq('poll_id', pollId)
      .eq('batch_type', 'vote')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle() as { data: Pick<AuditRow, 'metadata'> | null; error: { message: string } | null }

    if (keypairError || !keypairCommitment?.metadata) {
      return NextResponse.json(
        { success: false, error: 'Poll encryption keypair not found — cannot decrypt votes', code: 'KEYPAIR_MISSING' },
        { status: 500 }
      )
    }

    const meta = keypairCommitment.metadata as Record<string, string>
    const secretKey = meta.secretKey

    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: 'Secret key missing from keypair record', code: 'KEYPAIR_MISSING' },
        { status: 500 }
      )
    }

    // Mark poll resolved first so no new votes can be cast
    const resolvedAt = new Date().toISOString()
    const { error: resolveError } = await t(db, 'polls')
      .update({
        status: 'resolved',
        outcome,
        resolution_notes: notes ?? null,
        resolution_source_url: sourceUrl ?? null,
        resolved_at: resolvedAt,
        resolved_by: user.id,
      })
      .eq('id', pollId) as { error: { message: string } | null }

    if (resolveError) {
      return NextResponse.json(
        { success: false, error: resolveError.message },
        { status: 500 }
      )
    }

    // Fetch all votes for the poll
    const { data: votes, error: votesError } = await t(db, 'votes')
      .select('id, user_id, encrypted_answer, receipt_hash')
      .eq('poll_id', pollId) as { data: Pick<VoteRow, 'id' | 'user_id' | 'encrypted_answer' | 'receipt_hash'>[] | null; error: { message: string } | null }

    if (votesError) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch votes: ' + votesError.message },
        { status: 500 }
      )
    }

    const allVotes: Pick<VoteRow, 'id' | 'user_id' | 'encrypted_answer' | 'receipt_hash'>[] = votes ?? []

    // Decrypt votes and score them
    const reputationInserts: {
      user_id: string
      poll_id: string
      topic_id: string
      delta: number
    }[] = []

    const correctUsers: string[] = []

    for (const vote of allVotes) {
      let decryptedAnswer: string | null = null

      try {
        decryptedAnswer = decryptVote(vote.encrypted_answer, secretKey)
      } catch {
        // Decryption failure — skip this vote but do not abort resolution
        console.error(`Failed to decrypt vote ${vote.id} for user ${vote.user_id}`)
        continue
      }

      // Persist the decrypted answer on the vote row
      await t(db, 'votes')
        .update({ answer: decryptedAnswer })
        .eq('id', vote.id)

      const isCorrect = decryptedAnswer === outcome
      if (isCorrect) {
        correctUsers.push(vote.user_id)
      }

      reputationInserts.push({
        user_id: vote.user_id,
        poll_id: pollId,
        topic_id: poll.topic_id,
        delta: isCorrect ? 1 : 0,
      })
    }

    // Bulk insert reputation events
    if (reputationInserts.length > 0) {
      const { error: repError } = await t(db, 'reputation_events')
        .insert(reputationInserts) as { error: { message: string } | null }

      if (repError) {
        console.error('Failed to insert reputation events:', repError.message)
      }
    }

    // Upsert user_topic_reputation aggregates
    for (const insert of reputationInserts) {
      const isCorrect = insert.delta === 1

      const { data: existing } = await t(db, 'user_topic_reputation')
        .select('score, resolved_count, correct_count')
        .eq('user_id', insert.user_id)
        .eq('topic_id', insert.topic_id)
        .maybeSingle() as { data: Pick<UserTopicRepRow, 'score' | 'resolved_count' | 'correct_count'> | null }

      if (existing) {
        await t(db, 'user_topic_reputation')
          .update({
            score: existing.score + insert.delta,
            resolved_count: existing.resolved_count + 1,
            correct_count: existing.correct_count + (isCorrect ? 1 : 0),
          })
          .eq('user_id', insert.user_id)
          .eq('topic_id', insert.topic_id)
      } else {
        await t(db, 'user_topic_reputation')
          .insert({
            user_id: insert.user_id,
            topic_id: insert.topic_id,
            score: insert.delta,
            resolved_count: 1,
            correct_count: isCorrect ? 1 : 0,
          })
      }
    }

    // Build Merkle root from all vote receipt hashes and store as audit commitment
    const receiptHashes = allVotes.map((v) => v.receipt_hash)
    const merkleRoot = buildMerkleRoot(receiptHashes)

    const { data: auditCommitment, error: auditError } = await t(db, 'audit_commitments')
      .insert({
        poll_id: pollId,
        merkle_root: merkleRoot,
        batch_type: 'resolution',
        metadata: {
          outcome,
          resolvedAt,
          resolvedBy: user.id,
          totalVotes: allVotes.length,
          correctVotes: correctUsers.length,
          sourceUrl: sourceUrl ?? null,
        },
      })
      .select()
      .single() as { data: Pick<AuditRow, 'id'> | null; error: { message: string } | null }

    if (auditError) {
      console.error('Failed to store audit commitment:', auditError.message)
    }

    // Store commitment hash on the poll row
    const shortMerkle = `0x${merkleRoot.slice(0, 4).toUpperCase()}…${merkleRoot.slice(-4).toUpperCase()}`
    await t(db, 'polls')
      .update({ commitment_hash: shortMerkle })
      .eq('id', pollId)

    return NextResponse.json({
      success: true,
      data: {
        pollId,
        outcome,
        totalVotes: allVotes.length,
        correctVotes: correctUsers.length,
        merkleRoot,
        commitmentId: auditCommitment?.id ?? null,
      },
    })
  } catch (err) {
    console.error('Resolve error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
