import { getUserProfile, getUserReputation, getRecentContributions } from '@/lib/queries'
import { ReputationPage } from '@/components/reputation-page'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const profile = await getUserProfile(handle)
  if (!profile) return notFound()
  const [reputation, contributions] = await Promise.all([
    getUserReputation(profile.id),
    getRecentContributions(profile.id),
  ])
  return <ReputationPage profile={profile} reputation={reputation} contributions={contributions} />
}
