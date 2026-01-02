"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/contexts/UserContext";

interface SessionExpiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectPath?: string;
}

export function SessionExpiredModal({
  open,
  onOpenChange,
  redirectPath,
}: SessionExpiredModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useUser();

  const handleLogin = () => {
    // Clear session
    logout();
    
    // Determine redirect path
    const redirect = redirectPath || pathname || '/student';
    const loginUrl = `/auth/login?redirect=${encodeURIComponent(redirect)}`;
    
    // Close modal and redirect
    onOpenChange(false);
    router.push(loginUrl);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <DialogTitle>Session Expired</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Your session has expired. Please log in again to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
            Go to Login
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

