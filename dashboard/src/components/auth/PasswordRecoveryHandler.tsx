"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/**
 * Global handler for Supabase PASSWORD_RECOVERY event
 * Detects when user clicks reset password link and redirects to reset page
 */
export default function PasswordRecoveryHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("🔐 PasswordRecoveryHandler mounted");

    const authStateChangeResult = supabase.auth.onAuthStateChange((event: string, session: unknown) => {
      console.log("🔐 Auth event:", event, "Path:", pathname);

      if (event === "PASSWORD_RECOVERY") {
        console.log("✅ PASSWORD_RECOVERY detected! Redirecting to reset page...");
        
        // Only redirect if not already on reset password page
        if (pathname !== "/auth/reset-password") {
          // Preserve the hash (contains the token)
          const hash = window.location.hash;
          router.push(`/auth/reset-password${hash}`);
        }
      }
    });

    // Store subscription safely
    const subscription = authStateChangeResult?.data?.subscription;

    return () => {
      console.log("🔐 PasswordRecoveryHandler unmounting");
      // Defensive cleanup: only unsubscribe if subscription exists
      if (subscription && typeof subscription.unsubscribe === 'function') {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.warn('Error unsubscribing from password recovery handler:', error);
        }
      }
    };
  }, [router, pathname]);

  return null; // This component doesn't render anything
}

