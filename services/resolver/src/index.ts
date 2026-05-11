import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../../../apps/web/.env.local') })

import { createClient } from '@supabase/supabase-js'
import { buildMerkleRoot, decryptVote } from '@civicsignal/crypto'
import type { Database } from '@civicsignal/db'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('[resolver] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY)

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// ─── Step 1: Auto-close polls past their cutoff ──────────────────────────────

const autoClosePolls = async () => {
  const { data: polls, error } = await (supabase.from('polls') as any)
    .select('id, question')
    .eq('status', 'active')
    .lt('cutoff_at', new Date().toISOString()) as {
      data: Array<{ id: string; question: string }> | null
      error: { message: string } | null
    }

  if (error) {
    console.error('[resolver] autoClosePolls — query error:', error.message)
    return
  }

  if (!polls || polls.length === 0) return

  console.log(`[resolver] Closing ${polls.length} expired poll(s)`)

  for (const poll of polls) {
    const { error: updateError } = await (supabase.from('polls') as any)
      .update({ status: 'closed' })
      .eq('id', poll.id)

    if (updateError) {
      console.error(`[resolver] Failed to close poll ${poll.id}:`, updateError.message)
    } else {
      console.log(`[resolver] Closed poll ${poll.id} — "${poll.question}"`)
    }
  }
}

// ─── Step 2: Generate Merkle commitments for newly closed polls ───────────────

const generateCommitments = async () => {
  // Find closed polls that don't yet have an audit_commitment of type 'vote'
  const { data: closedPolls, error: pollError } = await (supabase.from('polls') as any)
    .select('id, question')
    .eq('status', 'closed') as {
      data: Array<{ id: string; question: string }> | null
      error: { message: string } | null
    }

  if (pollError) {
    console.error('[resolver] generateCommitments — polls query error:', pollError.message)
    return
  }

  if (!closedPolls || closedPolls.length === 0) return

  // Filter to polls that do not yet have a 'vote' commitment
  const { data: existingCommitments, error: commitError } = await (supabase.from('audit_commitments') as any)
    .select('poll_id')
    .eq('batch_type', 'vote')
    .in('poll_id', closedPolls.map((p) => p.id)) as {
      data: Array<{ poll_id: string }> | null
      error: { message: string } | null
    }

  if (commitError) {
    console.error('[resolver] generateCommitments — commitments query error:', commitError.message)
    return
  }

  const committedPollIds = new Set((existingCommitments ?? []).map((c) => c.poll_id))
  const uncommittedPolls = closedPolls.filter((p) => !committedPollIds.has(p.id))

  if (uncommittedPolls.length === 0) return

  console.log(`[resolver] Generating commitments for ${uncommittedPolls.length} newly closed poll(s)`)

  for (const poll of uncommittedPolls) {
    const { data: votes, error: voteError } = await (supabase.from('votes') as any)
      .select('id, receipt_hash')
      .eq('poll_id', poll.id) as {
        data: Array<{ id: string; receipt_hash: string }> | null
        error: { message: string } | null
      }

    if (voteError) {
      console.error(`[resolver] Failed to fetch votes for poll ${poll.id}:`, voteError.message)
      continue
    }

    const leaves = (votes ?? []).map((v) => v.receipt_hash)
    const merkleRoot = buildMerkleRoot(leaves)

    const { error: insertError } = await (supabase.from('audit_commitments') as any)
      .insert({
        poll_id: poll.id,
        merkle_root: merkleRoot,
        batch_type: 'vote',
        metadata: { vote_count: leaves.length },
      })

    if (insertError) {
      console.error(`[resolver] Failed to insert commitment for poll ${poll.id}:`, insertError.message)
    } else {
      console.log(`[resolver] Committed Merkle root for poll ${poll.id} — ${leaves.length} vote(s), root: ${merkleRoot.slice(0, 16)}…`)
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the plain-text answer from a stored vote value.
 * If a secretKey is available, attempts decryption; falls back to treating the
 * value as plain text so pre-encryption votes still score correctly.
 */
const getPlainAnswer = (encryptedAnswer: string, secretKey: string | null): string => {
  if (!secretKey) return encryptedAnswer
  try {
    return decryptVote(encryptedAnswer, secretKey)
  } catch {
    return encryptedAnswer // fallback for pre-encryption votes
  }
}

// ─── Step 3: Process reputation for resolved polls ────────────────────────────

const processResolutions = async () => {
  // Find resolved polls that have no reputation events yet
  const { data: resolvedPolls, error: pollError } = await (supabase.from('polls') as any)
    .select('id, topic_id, question, outcome')
    .eq('status', 'resolved')
    .not('outcome', 'is', null) as {
      data: Array<{ id: string; topic_id: string; question: string; outcome: string }> | null
      error: { message: string } | null
    }

  if (pollError) {
    console.error('[resolver] processResolutions — polls query error:', pollError.message)
    return
  }

  if (!resolvedPolls || resolvedPolls.length === 0) return

  // Filter to polls with no reputation events yet
  const { data: processedPolls, error: eventsError } = await (supabase.from('reputation_events') as any)
    .select('poll_id')
    .in('poll_id', resolvedPolls.map((p) => p.id)) as {
      data: Array<{ poll_id: string }> | null
      error: { message: string } | null
    }

  if (eventsError) {
    console.error('[resolver] processResolutions — events query error:', eventsError.message)
    return
  }

  const processedPollIds = new Set((processedPolls ?? []).map((e) => e.poll_id))
  const unprocessedPolls = resolvedPolls.filter((p) => !processedPollIds.has(p.id))

  if (unprocessedPolls.length === 0) return

  console.log(`[resolver] Processing reputation for ${unprocessedPolls.length} resolved poll(s)`)

  for (const poll of unprocessedPolls) {
    const { data: votes, error: voteError } = await (supabase.from('votes') as any)
      .select('id, user_id, encrypted_answer')
      .eq('poll_id', poll.id) as {
        data: Array<{ id: string; user_id: string; encrypted_answer: string }> | null
        error: { message: string } | null
      }

    if (voteError) {
      console.error(`[resolver] Failed to fetch votes for poll ${poll.id}:`, voteError.message)
      continue
    }

    if (!votes || votes.length === 0) {
      console.log(`[resolver] Poll ${poll.id} has no votes — skipping`)
      continue
    }

    // Fetch the poll's secret key from audit_commitments (stored during poll creation)
    const { data: commitment } = await (supabase.from('audit_commitments') as any)
      .select('metadata')
      .eq('poll_id', poll.id)
      .eq('batch_type', 'vote')
      .maybeSingle() as {
        data: { metadata: { secretKey?: string } } | null
      }

    const secretKey = commitment?.metadata?.secretKey ?? null
    if (secretKey) {
      console.log(`[resolver] Poll ${poll.id} — using encryption key for decryption`)
    } else {
      console.log(`[resolver] Poll ${poll.id} — no secret key found, treating answers as plain text`)
    }

    console.log(`[resolver] Processing ${votes.length} vote(s) for poll ${poll.id} — outcome: "${poll.outcome}"`)

    const reputationEvents = votes.map((vote) => {
      const plainAnswer = getPlainAnswer(vote.encrypted_answer, secretKey)
      const isCorrect = plainAnswer.trim() === poll.outcome.trim()
      return {
        user_id: vote.user_id,
        poll_id: poll.id,
        topic_id: poll.topic_id,
        delta: isCorrect ? 1 : 0,
        _is_correct: isCorrect,
      }
    })

    // Insert all reputation events in one batch
    const eventsToInsert = reputationEvents.map(({ _is_correct, ...event }) => event)
    const { error: insertError } = await (supabase.from('reputation_events') as any)
      .insert(eventsToInsert)

    if (insertError) {
      console.error(`[resolver] Failed to insert reputation events for poll ${poll.id}:`, insertError.message)
      continue
    }

    // Increment user_topic_reputation for each voter using read-then-write.
    // We avoid a plain upsert because Supabase's PostgREST upsert replaces
    // existing rows rather than incrementing column values.
    for (const event of reputationEvents) {
      const { data: existing } = await (supabase.from('user_topic_reputation') as any)
        .select('score, resolved_count, correct_count')
        .eq('user_id', event.user_id)
        .eq('topic_id', event.topic_id)
        .maybeSingle() as {
          data: { score: number; resolved_count: number; correct_count: number } | null
        }

      if (existing) {
        const { error: updateError } = await (supabase.from('user_topic_reputation') as any)
          .update({
            score: existing.score + event.delta,
            resolved_count: existing.resolved_count + 1,
            correct_count: existing.correct_count + (event._is_correct ? 1 : 0),
          })
          .eq('user_id', event.user_id)
          .eq('topic_id', event.topic_id)

        if (updateError) {
          console.error(`[resolver] Failed to update reputation for user ${event.user_id}:`, updateError.message)
        }
      } else {
        const { error: insertRepError } = await (supabase.from('user_topic_reputation') as any)
          .insert({
            user_id: event.user_id,
            topic_id: event.topic_id,
            score: event.delta,
            resolved_count: 1,
            correct_count: event._is_correct ? 1 : 0,
          })

        if (insertRepError) {
          console.error(`[resolver] Failed to insert reputation for user ${event.user_id}:`, insertRepError.message)
        }
      }
    }

    const correctCount = reputationEvents.filter((e) => e._is_correct).length
    console.log(`[resolver] Poll ${poll.id} — ${correctCount}/${votes.length} correct, reputation events written`)
  }
}

// ─── Main loop ────────────────────────────────────────────────────────────────

let running = true

const shutdown = (signal: string) => {
  console.log(`[resolver] Received ${signal} — shutting down gracefully`)
  running = false
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

const run = async () => {
  console.log('[resolver] CivicSignal resolver service starting')
  console.log(`[resolver] Connected to ${SUPABASE_URL}`)

  while (running) {
    const start = Date.now()
    console.log(`[resolver] Tick at ${new Date().toISOString()}`)

    try {
      await autoClosePolls()
    } catch (err) {
      console.error('[resolver] autoClosePolls threw unexpectedly:', err)
    }

    try {
      await generateCommitments()
    } catch (err) {
      console.error('[resolver] generateCommitments threw unexpectedly:', err)
    }

    try {
      await processResolutions()
    } catch (err) {
      console.error('[resolver] processResolutions threw unexpectedly:', err)
    }

    const elapsed = Date.now() - start
    console.log(`[resolver] Tick completed in ${elapsed}ms — sleeping 60s`)

    // Sleep in small increments so SIGINT/SIGTERM can interrupt promptly
    const sleepEnd = Date.now() + 60_000
    while (running && Date.now() < sleepEnd) {
      await sleep(250)
    }
  }

  console.log('[resolver] Exited cleanly')
}

run().catch((err) => {
  console.error('[resolver] Fatal error:', err)
  process.exit(1)
})
