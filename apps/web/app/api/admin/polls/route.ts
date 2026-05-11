import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { generatePollKeypair } from '@civicsignal/crypto'
import type { Database } from '@civicsignal/db'

type Poll = Database['public']['Tables']['polls']['Row']

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

    const serviceClient = createServiceClient()
    const { data: profile } = await (serviceClient.from('profiles') as any)
      .select('is_admin')
      .eq('id', user.id)
      .single()
    if (!profile?.is_admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const { data: polls, error } = await (supabase.from('polls') as any)
      .select('*, topics(slug, label)')
      .order('created_at', { ascending: false }) as { data: Poll[] | null; error: { message: string } | null }

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

export const POST = async (req: Request) => {
  try {
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

    const body = await req.json()
    const {
      question,
      topicId,
      region,
      options,
      sourceOfTruth,
      resolutionCriteria,
      cutoffAt,
      resolvesAt,
    } = body

    if (!question || !topicId || !region || !options || !sourceOfTruth || !cutoffAt || !resolvesAt) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields', code: 'INVALID_BODY' },
        { status: 400 }
      )
    }

    if (typeof question !== 'string' || question.trim().length === 0 || question.trim().length > 500) {
      return NextResponse.json(
        { success: false, error: 'question must be a non-empty string (max 500 chars)', code: 'INVALID_BODY' },
        { status: 400 }
      )
    }

    if (typeof topicId !== 'string' || topicId.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'topicId must be a non-empty string', code: 'INVALID_BODY' },
        { status: 400 }
      )
    }

    if (typeof region !== 'string' || region.trim().length === 0 || region.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: 'region must be a non-empty string (max 100 chars)', code: 'INVALID_BODY' },
        { status: 400 }
      )
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { success: false, error: 'options must be an array with at least 2 entries', code: 'INVALID_OPTIONS' },
        { status: 400 }
      )
    }

    if (!options.every((o: unknown) => typeof o === 'string' && (o as string).trim().length > 0)) {
      return NextResponse.json(
        { success: false, error: 'Each option must be a non-empty string', code: 'INVALID_OPTIONS' },
        { status: 400 }
      )
    }

    if (typeof sourceOfTruth !== 'string' || sourceOfTruth.trim().length === 0 || sourceOfTruth.trim().length > 500) {
      return NextResponse.json(
        { success: false, error: 'sourceOfTruth must be a non-empty string (max 500 chars)', code: 'INVALID_BODY' },
        { status: 400 }
      )
    }

    const cutoffDate = new Date(cutoffAt)
    const resolvesDate = new Date(resolvesAt)
    if (isNaN(cutoffDate.getTime()) || isNaN(resolvesDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'cutoffAt and resolvesAt must be valid date strings', code: 'INVALID_BODY' },
        { status: 400 }
      )
    }

    if (resolvesDate <= cutoffDate) {
      return NextResponse.json(
        { success: false, error: 'resolvesAt must be after cutoffAt', code: 'INVALID_BODY' },
        { status: 400 }
      )
    }

    const keypair = generatePollKeypair()

    const { data: poll, error: pollError } = await (serviceClient.from('polls') as any)
      .insert({
        question,
        topic_id: topicId,
        region,
        options,
        source_of_truth: sourceOfTruth,
        resolution_criteria: resolutionCriteria ?? null,
        cutoff_at: cutoffAt,
        resolves_at: resolvesAt,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single() as { data: Poll | null; error: { message: string } | null }

    if (pollError || !poll) {
      return NextResponse.json(
        { success: false, error: pollError?.message ?? 'Failed to create poll' },
        { status: 500 }
      )
    }

    // Store keypair in audit_commitments so the secret key is available at resolution
    const { error: commitError } = await (serviceClient.from('audit_commitments') as any)
      .insert({
        poll_id: poll.id,
        merkle_root: keypair.publicKey,
        batch_type: 'vote',
        metadata: {
          type: 'keypair',
          publicKey: keypair.publicKey,
          secretKey: keypair.secretKey,
        },
      }) as { error: { message: string } | null }

    if (commitError) {
      // Non-fatal — log but still return the created poll
      console.error('Failed to store poll keypair:', commitError.message)
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          poll,
          publicKey: keypair.publicKey,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
