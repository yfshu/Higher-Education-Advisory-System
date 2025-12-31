"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import { useAuthModals } from "@/components/auth/AuthModalProvider";

export default function LoginRoute() {
  const router = useRouter();
  const { openLogin, closeLogin, isLoginOpen } = useAuthModals();

  useEffect(() => {
    openLogin();
  }, [openLogin]);

  useEffect(() => {
    // Only redirect if modal closes AND we're still on the login page
    // Don't interfere if user is being redirected after successful login
    if (!isLoginOpen && window.location.pathname === '/auth/login') {
      // Check if there's a session - if yes, don't redirect (login is handling it)
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // No session, safe to redirect back
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push("/");
          }
        }
        // If session exists, let the login flow handle redirect
      };
      checkSession();
    }
  }, [isLoginOpen, closeLogin, router]);

  return null;
}
