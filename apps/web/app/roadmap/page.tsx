import type { Metadata } from 'next'
import { RoadmapPage } from '@/components/roadmap-page'

export const metadata: Metadata = {
  title: 'Roadmap | CivicSignal',
}

export default function Page() {
  return <RoadmapPage />
}
