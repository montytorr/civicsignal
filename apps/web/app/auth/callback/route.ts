import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-server'

export const GET = async (request: NextRequest) => {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const serviceClient = createServiceClient()
        const handle =
          typeof user.user_metadata?.handle === 'string' && user.user_metadata.handle.length > 0
            ? user.user_metadata.handle
            : `civic-${user.id.slice(0, 8)}`

        await (serviceClient.from('profiles') as any)
          .upsert(
            {
              id: user.id,
              handle,
              verified: true,
              verified_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          )
      }

      return NextResponse.redirect(`${origin}${next.startsWith('/') ? next : '/onboarding'}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin`)
}
