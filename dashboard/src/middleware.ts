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

  // Use getUser() instead of getSession() to verify token validity
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log('[Middleware] User check:', {
    pathname,
    hasUser: !!user,
    error: userError?.message,
    userId: user?.id,
    email: user?.email,
  });

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    // If not authenticated, redirect to login with redirect param
    if (!user || userError) {
      console.log('❌ [Middleware] No user for /admin, redirecting to login');
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ✅ Get role from app_metadata (same pattern as backend)
    const appMeta = parseAppMetadata(user.app_metadata);
    const userMeta = parseUserMetadata(user.user_metadata);

    console.log('[Middleware] Parsed metadata:', {
      app_metadata_role: appMeta.role,
      user_metadata_role: userMeta.role,
    });

    // Priority: app_metadata.role > user_metadata.role > default 'student'
    const role = appMeta.role || userMeta.role || 'student';

    console.log('[Middleware] Role detection:', {
      role,
      userId: user.id,
      email: user.email,
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
    // If not authenticated, redirect to login with redirect param
    if (!user || userError) {
      console.log('❌ [Middleware] No user for /student, redirecting to login');
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ✅ Get role from app_metadata
    const appMeta = parseAppMetadata(user.app_metadata);
    const userMeta = parseUserMetadata(user.user_metadata);
    const role = appMeta.role || userMeta.role || 'student';

    // Allow admin users to access program detail pages for viewing
    // This allows admins to preview what students see
    const isProgramDetailPage = pathname.startsWith('/student/program/') || 
                                pathname.startsWith('/student/course/');
    
    if (role === 'admin' && !isProgramDetailPage) {
      console.log('❌ [Middleware] Admin user trying to access /student, redirecting to /admin');
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    // If admin is accessing program detail page, allow it
    if (role === 'admin' && isProgramDetailPage) {
      console.log('✅ [Middleware] Admin viewing program detail page, allowing access');
      return res;
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
