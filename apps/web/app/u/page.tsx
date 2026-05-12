import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('handle')
    .eq('id', user.id)
    .maybeSingle() as { data: { handle: string } | null }

  if (profile?.handle) {
    redirect(`/u/${profile.handle}`)
  }

  redirect('/verify')
}
