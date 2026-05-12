import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase-server'
import { getTopics, getOpenDisputes, getAwaitingResolution, getAuditStats, getPanelInviteCandidates, getPendingPollProposals } from '@/lib/queries'
import { AdminPage } from '@/components/admin-page'

export const metadata: Metadata = {
  title: 'Admin | CivicSignal',
}

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/polls')
  }

  const serviceClient = createServiceClient()
  const { data: profile } = await (serviceClient.from('profiles') as any)
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/polls')
  }

  const [topics, disputes, awaitingResolution, auditStats, panelCandidates, pendingProposals] = await Promise.all([
    getTopics(),
    getOpenDisputes(),
    getAwaitingResolution(),
    getAuditStats(),
    getPanelInviteCandidates(),
    getPendingPollProposals(),
  ])

  return (
    <AdminPage
      topics={topics}
      disputes={disputes}
      awaitingResolution={awaitingResolution}
      auditStats={auditStats}
      panelCandidates={panelCandidates}
      pendingProposals={pendingProposals}
    />
  )
}
