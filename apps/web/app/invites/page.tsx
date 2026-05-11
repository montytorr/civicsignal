import { createClient } from '@/lib/supabase-server'
import { InvitesPage } from '@/components/invites-page'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invites } = await (supabase.from('invites') as any)
    .select('id, code, used_by, used_at, created_at')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  return <InvitesPage initialInvites={invites ?? []} />
}
