'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { CsWordmark } from '@civicsignal/ui'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

const BASE_TABS = [
  { label: 'Active polls', href: '/polls' },
  { label: 'Methodology', href: '/methodology' },
  { label: 'Roadmap', href: '/roadmap' },
  { label: 'Archive', href: '/archive' },
]

export const AppNav = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [handle, setHandle] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('handle, is_admin')
          .eq('id', currentUser.id)
          .single() as { data: { handle: string; is_admin: boolean } | null; error: unknown }

        setHandle(profile?.handle ?? null)
        setIsAdmin(profile?.is_admin ?? false)
      }

      setLoading(false)
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setHandle(null)
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const tabs = [
    ...BASE_TABS,
    ...(user ? [{ label: 'Reputation', href: handle ? `/u/${handle}` : '/u' }] : []),
    ...(isAdmin ? [{ label: 'Admin', href: '/admin' }] : []),
  ]

  const isActive = (href: string) => {
    if (href === '/polls') return pathname === '/polls' || pathname.startsWith('/polls/')
    if (href.startsWith('/u/')) return pathname.startsWith('/u/')
    return pathname === href || pathname.startsWith(href + '/')
  }

  const initials = handle ? handle.split('-').slice(0, 2).map((s) => s[0]).join('') : null

  return (
    <nav
      className="cs-nav-pad w-full flex items-center justify-between border-b border-parchment-line"
      style={{ padding: '22px 56px' }}
    >
      <Link href="/" className="shrink-0">
        <CsWordmark size={18} />
      </Link>

      <div className="cs-nav-tabs flex items-center" style={{ gap: 4 }}>
        {tabs.map(({ label, href }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className="relative transition-colors"
                style={{
                  padding: '0 14px',
                  fontSize: 13.5,
                  fontWeight: active ? 500 : 400,
                  color: active
                    ? 'var(--color-parchment-ink)'
                    : 'var(--color-parchment-ink-soft)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Link>
            )
          })}
      </div>

      <div className="flex items-center gap-3 shrink-0">
          {loading ? null : user && handle ? (
            <>
              <span
                className="cs-hide-mobile font-mono text-parchment-muted tracking-[0.04em]"
                style={{ fontSize: 11 }}
              >
                {handle}
              </span>
              <div className="w-7 h-7 rounded-full bg-parchment-surface-alt border border-parchment-line flex items-center justify-center shrink-0">
                <span className="font-mono text-[10px] font-medium text-parchment-ink-soft tracking-[0.03em]">
                  {initials}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="cs-hide-mobile"
                style={{
                  fontSize: 12,
                  color: 'var(--color-parchment-muted)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                  fontFamily: 'inherit',
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-parchment-ink-soft)',
                padding: '6px 12px',
                border: '1px solid var(--color-parchment-line)',
                borderRadius: 3,
              }}
            >
              Sign in
            </Link>
          )}
      </div>
    </nav>
  )
}
