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

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
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

    return () => {
      console.log("🔐 PasswordRecoveryHandler unmounting");
      authListener.subscription.unsubscribe();
    };
  }, [router, pathname]);

  return null; // This component doesn't render anything
}

