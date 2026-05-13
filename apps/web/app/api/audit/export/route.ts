import { NextResponse } from 'next/server'
import { getAuditCommitments, getAuditOverview, getPollProposals, getSourceTemplates } from '@/lib/queries'
import { createClient } from '@/lib/supabase-server'

export const GET = async () => {
  const supabase = await createClient()
  const [overview, commitments, proposals, sourceTemplates, disputesRes] = await Promise.all([
    getAuditOverview(),
    getAuditCommitments(),
    getPollProposals(250),
    getSourceTemplates(),
    (supabase as any)
      .from('disputes')
      .select('id, poll_id, reason, status, created_at, resolved_at, resolution_notes, polls(question)')
      .order('created_at', { ascending: false })
      .limit(250)
      .then((r: any) => r)
      .catch(() => ({ data: [] })),
  ])

  return NextResponse.json({
    schema: 'civicsignal.audit-export.v1',
    generatedAt: new Date().toISOString(),
    overview,
    commitments,
    proposals,
    sourceTemplates,
    disputes: disputesRes.data ?? [],
  })
}
