import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = new Set([
  '/',
  '/pricing',
  '/privacy',
  '/terms',
  '/changelog',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot',
  '/auth/reset',
  '/setup-error',
])

function isPublicPath(pathname: string) {
  if (PUBLIC_ROUTES.has(pathname)) return true
  return (
    pathname.startsWith('/api/auth/signup-precheck') ||
    pathname.startsWith('/api/chat') ||
    pathname.startsWith('/api/v1') ||
    pathname.startsWith('/api/stripe/webhook') ||
    pathname.startsWith('/api/lemonsqueezy/webhook') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/leads') ||
    pathname.startsWith('/api/messages') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/widget') ||
    pathname.startsWith('/docs')
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Env-var sanity check. Without these, every Supabase call would throw —
  // surface a single helpful page instead of a cascade of cryptic errors.
  if (!url || !key) {
    if (isPublicPath(pathname) || pathname === '/setup-error') return response
    return NextResponse.redirect(new URL('/setup-error?reason=env', request.url))
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // If Supabase is unreachable (project paused, DNS, network), treat the user
  // as anonymous instead of crashing the request. Public pages still render;
  // protected pages redirect to login as they would for any unauthenticated user.
  let user: { id: string } | null = null
  let supabaseReachable = true
  try {
    const result = await supabase.auth.getUser()
    user = result.data.user as { id: string } | null
  } catch {
    supabaseReachable = false
  }

  if (isPublicPath(pathname)) return response

  if (!supabaseReachable) {
    return NextResponse.redirect(new URL('/setup-error?reason=unreachable', request.url))
  }

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (pathname.startsWith('/dashboard')) {
    try {
      const { data: org } = await supabase
        .from('organizations')
        .select('id, plan, trial_ends_at')
        .eq('user_id', user.id)
        .single()

      if (!org) {
        return NextResponse.redirect(new URL('/auth/signup', request.url))
      }

      // Trial expiration no longer blocks the user — they're silently
      // downgraded to the permanent free tier by the daily cron, and the
      // app's runtime gates respect free-tier limits via effectivePlan().
    } catch {
      // Database temporarily unreachable — let the page render and the
      // client-side data fetch will show its own error state.
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|widget.js).*)'],
}
