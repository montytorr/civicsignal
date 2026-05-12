import type { Metadata } from 'next'
import { DemoPage } from '@/components/demo-page'

export const metadata: Metadata = {
  title: 'Civic loop demo | CivicSignal',
  description: 'A guided walkthrough of CivicSignal proposals, moderation, voting, resolution, disputes, panels, and reputation.',
}

export default function Page() {
  return <DemoPage />
}
