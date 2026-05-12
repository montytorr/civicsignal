import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase-server'
import { getPollProposals, getSourceTemplates, getTopics } from '@/lib/queries'
import { ProposalsPage } from '@/components/proposals-page'

export const metadata: Metadata = {
  title: 'Poll proposals | CivicSignal',
  description: 'Community poll proposal submission and public moderation log.',
}

export default async function Page() {
  const supabase = await createClient()
  const [{ data: { user } }, topics, templates, proposals] = await Promise.all([
    supabase.auth.getUser(),
    getTopics(),
    getSourceTemplates(),
    getPollProposals(),
  ])

  return <ProposalsPage topics={topics as any} templates={templates as any} proposals={proposals as any} signedIn={Boolean(user)} />
}
