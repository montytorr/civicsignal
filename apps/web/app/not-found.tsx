import Link from 'next/link'
import { Eyebrow, Btn } from '@civicsignal/ui'

export default function NotFound() {
  return (
    <main
      style={{ maxWidth: 1280, margin: '0 auto', padding: 40 }}
      className="flex flex-col items-center justify-center text-center min-h-[60vh]"
    >
      <Eyebrow className="mb-4">Error</Eyebrow>
      <p className="mono text-[72px] font-semibold leading-none tracking-tight text-parchment-ink mb-3">
        404
      </p>
      <h1 className="text-[20px] font-semibold text-parchment-ink mb-2">
        Page not found
      </h1>
      <p className="text-[14px] text-parchment-muted mb-8 max-w-[400px]">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/polls">
        <Btn kind="primary" size="md">
          Back to polls
        </Btn>
      </Link>
    </main>
  )
}
