"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthModals } from "@/components/auth/AuthModalProvider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function ConfirmEmailPage() {
  const router = useRouter();
  const { openLogin } = useAuthModals();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token')) {
        const { error } = await supabase.auth.getSession();
        
        if (!error) {
          // Show success modal instead of redirecting immediately
          setIsVerifying(false);
          setShowSuccess(true);
        } else {
          setIsVerifying(false);
          router.push("/");
        }
      } else {
        setIsVerifying(false);
        router.push("/");
      }
    };

    handleEmailConfirmation();
  }, [router]);

  const handleContinueToLogin = () => {
    setShowSuccess(false);
    router.push("/");
    setTimeout(() => {
      openLogin();
    }, 300);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Background content */}
      </div>

      {/* Verification Success Modal */}
      <Dialog open={showSuccess} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[480px] border-none shadow-2xl p-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="flex flex-col items-center justify-center px-8 py-12 text-center">
            {/* Success Icon */}
            <div className="mb-8 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg ring-8 ring-green-500/20">
              <Check className="size-10 text-white stroke-[3]" />
            </div>

            {/* Title */}
            <DialogTitle className="mb-4 text-3xl font-bold text-white tracking-tight">
              Verification Successful
            </DialogTitle>

            {/* Description */}
            <p className="text-base text-gray-300 mb-8 max-w-sm leading-relaxed">
              Your email has been verified successfully. You can now log in to access your account and explore the platform.
            </p>

            {/* CTA Button */}
            <Button
              onClick={handleContinueToLogin}
              className="w-full max-w-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

