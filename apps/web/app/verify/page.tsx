import type { Metadata } from 'next'
import { getAuditCommitments } from '@/lib/queries'
import { VerifyPage } from '@/components/verify-page'

export const metadata: Metadata = {
  title: 'Commitment verification | CivicSignal',
  description:
    'Public log of every Merkle root published before cutoff. Re-hash and compare to verify no votes were changed after sealing.',
}

export default async function Page() {
  const commitments = await getAuditCommitments()
  return <VerifyPage commitments={commitments} />
}
