import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-server'

export const GET = async (request: NextRequest) => {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const serviceClient = createServiceClient()
        await (serviceClient.from('profiles') as any)
          .update({ verified: true, verified_at: new Date().toISOString() })
          .eq('id', user.id)
      }

      return NextResponse.redirect(`${origin}/polls`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin`)
}
