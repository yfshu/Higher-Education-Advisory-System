import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { parseAppMetadata, parseUserMetadata } from '@/lib/auth/role';

// Force dynamic rendering - admin routes require authentication
export const dynamic = 'force-dynamic';

/**
 * Server-side admin route protection
 * 
 * This runs BEFORE the page renders, ensuring admin-only access.
 * This is the PRIMARY protection layer since middleware only checks for auth cookies.
 * 
 * DEBUG: This layout checks role from app_metadata.role
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const cookieStore = await cookies();
    
    // Create Supabase client for server-side
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Server components can't set cookies, but this is required by the API
            // Cookies are set by middleware/client-side
          },
        },
      }
    );

    // Get the current user - use getUser() instead of getSession() for security
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log('🔍 [AdminLayout Server] User check:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      error: userError?.message,
    });

    // If not authenticated, redirect to login
    if (!user || userError) {
      console.log('❌ [AdminLayout Server] No user or error, redirecting to login');
      redirect('/auth/login');
    }

    // ✅ Get role from app_metadata (same pattern as backend)
    const appMeta = parseAppMetadata(user.app_metadata);
    const userMeta = parseUserMetadata(user.user_metadata);

    console.log('🔍 [AdminLayout Server] Parsed metadata:', {
      app_metadata_role: appMeta.role,
      user_metadata_role: userMeta.role,
    });

    // Priority: app_metadata.role > user_metadata.role > default 'student'
    const finalRole = appMeta.role || userMeta.role || 'student';

    console.log('🔍 [AdminLayout Server] Role detection:', {
      app_metadata_role: appMeta.role,
      user_metadata_role: userMeta.role,
      final_role: finalRole,
      userId: user.id,
      email: user.email,
    });

    // If not admin, redirect to student dashboard
    if (finalRole !== 'admin') {
      console.log('❌ [AdminLayout Server] Non-admin user detected, redirecting to /student');
      redirect('/student');
    }

    console.log('✅ [AdminLayout Server] Admin access granted');
    
    // Admin user - allow access
    return <>{children}</>;
  } catch (error) {
    // redirect() throws a NEXT_REDIRECT error, which is expected
    // Re-throw it so Next.js handles it properly
    if (error && typeof error === 'object' && 'digest' in error) {
      const digest = error.digest as string;
      // NEXT_REDIRECT is expected - re-throw it
      if (digest.includes('NEXT_REDIRECT')) {
        throw error;
      }
      // DYNAMIC_SERVER_USAGE is expected for protected routes - allow it
      if (digest.includes('DYNAMIC_SERVER_USAGE')) {
        console.log('⚠️ [AdminLayout Server] Dynamic server usage detected (expected for protected routes)');
        // Continue rendering - this is not an error
        return <>{children}</>;
      }
    }
    console.error('❌ [AdminLayout Server] Unexpected error:', error);
    // On unexpected error, redirect to login for safety
    redirect('/auth/login');
  }
}
