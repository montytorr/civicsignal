'use client'

import { Eyebrow, Btn } from '@civicsignal/ui'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main
      style={{ maxWidth: 1280, margin: '0 auto', padding: 40 }}
      className="flex flex-col items-center justify-center text-center min-h-[60vh]"
    >
      <Eyebrow className="mb-4">Error</Eyebrow>
      <h1 className="text-[20px] font-semibold text-parchment-ink mb-2">
        Something went wrong
      </h1>
      <p className="text-[14px] text-parchment-muted mb-8 max-w-[440px]">
        An unexpected error occurred. You can try again, or return to the home page if the problem
        persists.
      </p>
      <Btn kind="primary" size="md" onClick={reset}>
        Try again
      </Btn>
    </main>
  )
}
