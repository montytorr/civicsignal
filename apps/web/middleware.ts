import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/polls', '/admin', '/u']

const isProtected = (pathname: string) =>
  PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))

/* ------------------------------------------------------------------ */
/*  Lightweight in-memory rate limiter for auth endpoints (edge-safe)  */
/* ------------------------------------------------------------------ */
const AUTH_RATE_PATHS = ['/auth/signin', '/auth/signup']
const AUTH_MAX_ATTEMPTS = 10
const AUTH_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

const authAttempts = new Map<string, { count: number; resetAt: number }>()

const isAuthRateLimited = (ip: string): boolean => {
  const now = Date.now()
  const entry = authAttempts.get(ip)

  if (!entry || now > entry.resetAt) {
    authAttempts.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS })
    return false
  }

  if (entry.count >= AUTH_MAX_ATTEMPTS) {
    return true
  }

  entry.count++
  return false
}

export const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl

  // Rate-limit auth endpoints by IP before any other processing
  if (AUTH_RATE_PATHS.some((p) => pathname.startsWith(p)) && request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (isAuthRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many authentication attempts. Try again later.', code: 'RATE_LIMITED' },
        { status: 429, headers: { 'Retry-After': '900' } }
      )
    }
  }

  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (isProtected(pathname) && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/signin'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
