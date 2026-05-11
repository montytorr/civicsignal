'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 38,
  padding: '0 14px',
  fontSize: 14,
  fontFamily: 'inherit',
  color: '#0E1F36',
  background: '#F5F1E8',
  border: '1px solid #D9D1BD',
  borderRadius: 3,
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 12,
  fontWeight: 500,
  color: '#3A4861',
}

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/polls')
    router.refresh()
  }

  return (
    <div style={{ background: '#F5F1E8', minHeight: '100vh' }}>
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 40px 80px' }}>
        <div
          style={{
            maxWidth: 440,
            margin: '40px auto 0',
            background: '#FBF8F1',
            border: '1px solid #D9D1BD',
            borderRadius: 4,
            padding: '36px 40px',
          }}
        >
          <h1
            style={{
              margin: '0 0 6px',
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: '-0.015em',
              color: '#0E1F36',
            }}
          >
            Sign in
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 13.5, color: '#6B7488' }}>
            Welcome back to CivicSignal.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            {error && (
              <div
                style={{
                  marginBottom: 16,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#9B3B2E',
                  background: 'rgba(155, 59, 46, 0.07)',
                  border: '1px solid rgba(155, 59, 46, 0.2)',
                  borderRadius: 3,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 38,
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'inherit',
                color: '#FBF8F1',
                background: loading ? '#3A4861' : '#0E1F36',
                border: 'none',
                borderRadius: 3,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{ margin: '22px 0 0', fontSize: 13, color: '#6B7488', textAlign: 'center' }}>
            No account yet?{' '}
            <Link
              href="/auth/signup"
              style={{ color: '#244B6B', fontWeight: 500 }}
            >
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
