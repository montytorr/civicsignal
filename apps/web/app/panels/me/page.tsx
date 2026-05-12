import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getMyPanelWorkspace } from '@/lib/queries'
import { PanelWorkspacePage } from '@/components/panel-workspace-page'

export const metadata: Metadata = {
  title: 'Panel workspace | CivicSignal',
}

export default async function Page() {
  const workspace = await getMyPanelWorkspace() as any
  if (!workspace.user) redirect('/auth/signin')
  return <PanelWorkspacePage memberships={workspace.memberships} disputes={workspace.disputes} />
}
