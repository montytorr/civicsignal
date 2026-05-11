import type { Metadata } from 'next'
import { getActivePolls, getTopics } from '@/lib/queries'
import { FeedPage } from '@/components/feed-page'
import { mapDbPollToUiPoll } from '@/lib/mappers'

export const metadata: Metadata = {
  title: 'Active Polls | CivicSignal',
}

export default async function Page() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dbPolls, rawTopics] = await Promise.all([getActivePolls(), getTopics()]) as [any[], any[]]
  const polls = dbPolls.map((p) => mapDbPollToUiPoll(p, 0, false))
  return <FeedPage polls={polls} topics={rawTopics.map((t) => t.label as string)} />
}
