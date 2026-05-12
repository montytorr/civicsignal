import { getUserProfile, getUserReputation, getRecentContributions, getPendingVotes } from '@/lib/queries'
import { ReputationPage } from '@/components/reputation-page'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const profile = await getUserProfile(handle)
  if (!profile) return notFound()
  const [reputation, contributions, pendingVotes] = await Promise.all([
    getUserReputation(profile.id),
    getRecentContributions(profile.id),
    getPendingVotes(profile.id),
  ])
  return <ReputationPage profile={profile} reputation={reputation} contributions={contributions} pendingVotes={pendingVotes} />
}
