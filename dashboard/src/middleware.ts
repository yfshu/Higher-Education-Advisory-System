import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { parseAppMetadata, parseUserMetadata } from '@/lib/auth/role';

/**
 * Middleware for route protection
 * 
 * Uses createServerClient from @supabase/ssr to properly read auth cookies and session.
 * 
 * Only runs on /admin/* and /dashboard/* routes (not /auth/*)
 */
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Debug: Log all cookies
  const allCookies = req.cookies.getAll();
  console.log('[Middleware] All cookies:', allCookies.map(c => c.name));

  // Create Supabase client for middleware using @supabase/ssr
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  console.log('[Middleware] Session check:', {
    pathname,
    hasSession: !!session,
    hasUser: !!session?.user,
    error: sessionError?.message,
    userId: session?.user?.id,
    email: session?.user?.email,
  });

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    // If not authenticated, redirect to login
    if (!session?.user) {
      console.log('❌ [Middleware] No session for /admin, redirecting to login');
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // ✅ Get role from app_metadata (same pattern as backend)
    const appMeta = parseAppMetadata(session.user.app_metadata);
    const userMeta = parseUserMetadata(session.user.user_metadata);

    console.log('[Middleware] Parsed metadata:', {
      app_metadata_role: appMeta.role,
      user_metadata_role: userMeta.role,
    });

    // Priority: app_metadata.role > user_metadata.role > default 'student'
    const role = appMeta.role || userMeta.role || 'student';

    console.log('[Middleware] Role detection:', {
      role,
      userId: session.user.id,
      email: session.user.email,
    });

    // Only admin can access /admin routes
    if (role !== 'admin') {
      console.log('❌ [Middleware] Non-admin user trying to access /admin, redirecting to /student');
      return NextResponse.redirect(new URL('/student', req.url));
    }

    console.log('✅ [Middleware] Admin access granted to /admin');
    return res;
  }

  // Student route protection (redirect admin users to /admin)
  if (pathname.startsWith('/student')) {
    // If not authenticated, redirect to login
    if (!session?.user) {
      console.log('❌ [Middleware] No session for /student, redirecting to login');
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // ✅ Get role from app_metadata
    const appMeta = parseAppMetadata(session.user.app_metadata);
    const userMeta = parseUserMetadata(session.user.user_metadata);
    const role = appMeta.role || userMeta.role || 'student';

    // Admin users should go to /admin, not /student
    if (role === 'admin') {
      console.log('❌ [Middleware] Admin user trying to access /student, redirecting to /admin');
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    console.log('✅ [Middleware] Student access granted to /student');
    return res;
  }

  // For all other routes, just continue
  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
  ],
  // Middleware always runs in Edge Runtime by default in Next.js
  // No need to specify runtime explicitly
};
