"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useUser();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear Supabase session
        await supabase.auth.signOut();
        
        // Clear user context and localStorage
        logout();
        
        // Preserve "Remember Me" email before clearing
        const rememberEmail = localStorage.getItem("hea.remember.email");
        
        // Clear all localStorage items
        localStorage.clear();
        
        // Restore "Remember Me" email if it existed
        if (rememberEmail) {
          localStorage.setItem("hea.remember.email", rememberEmail);
        }
        
        // Clear all sessionStorage items
        sessionStorage.clear();
        
        // Clear any cached data
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        
        // Show success message
        toast.success("Logged out successfully!");
        
        // Small delay to show toast before redirect
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.warn("Logout error", err);
        toast.error("Error during logout. Please try again.");
      } finally {
        // Force redirect to homepage
        window.location.href = "/";
      }
    };
    
    performLogout();
  }, [logout, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
}