import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const publicRoutes = ['/', '/pricing', '/auth/login', '/auth/signup']
  const isPublic = publicRoutes.some(r => pathname === r) ||
    pathname.startsWith('/api/chat') ||
    pathname.startsWith('/api/stripe/webhook') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/widget')

  if (isPublic) return response

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname.startsWith('/dashboard')) {
    const { data: org } = await supabase
      .from('organizations')
      .select('id, plan, trial_ends_at')
      .eq('user_id', user.id)
      .single()

    if (!org) {
      return NextResponse.redirect(new URL('/auth/signup', request.url))
    }

    if (org.plan === 'trial' && org.trial_ends_at) {
      const trialExpired = new Date(org.trial_ends_at) < new Date()
      if (trialExpired && pathname !== '/dashboard/billing') {
        return NextResponse.redirect(new URL('/dashboard/billing?expired=true', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|widget.js).*)'],
}
