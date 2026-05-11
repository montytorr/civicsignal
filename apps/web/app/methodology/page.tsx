import type { Metadata } from 'next'
import { MethodPage } from '@/components/method-page'

export const metadata: Metadata = {
  title: 'Methodology | CivicSignal',
}

export default function Page() {
  return <MethodPage />
}
