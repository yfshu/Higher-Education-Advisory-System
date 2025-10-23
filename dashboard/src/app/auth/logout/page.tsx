"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Logout error", err);
      } finally {
        router.replace("/");
      }
    };
    void run();
  }, [router]);

  return null;
}