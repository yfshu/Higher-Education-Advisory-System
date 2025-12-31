"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, Eye, EyeOff, CheckCircle2, XCircle, Lock } from "lucide-react";
import { useAuthModals } from "@/components/auth/AuthModalProvider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { openLogin } = useAuthModals();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);

  // Debug logging
  console.log("🎨 Render - hasValidToken:", hasValidToken, "error:", error, "success:", success);

  // Password validation states
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  useEffect(() => {
    let mounted = true;

    console.log("🚀 Component mounted, starting password reset flow");

    // Listen for auth state changes - PASSWORD_RECOVERY event
    const authStateChangeResult = supabase.auth.onAuthStateChange((event: string, session: unknown) => {
      console.log("🔐 Auth event:", event, "Has session:", !!session);
      
      if (event === 'PASSWORD_RECOVERY' && session && mounted) {
        console.log("✅ PASSWORD_RECOVERY event - token is valid");
        setHasValidToken(true);
        setError("");
      }
    });

    // Store subscription safely
    const subscription = authStateChangeResult?.data?.subscription;

    // Check for token in background
    const checkSession = async () => {
      const hash = window.location.hash;
      console.log("🔗 URL hash:", hash);
      
      if (!hash || !hash.includes('access_token')) {
        console.log("❌ No access token in URL");
        return;
      }

      console.log("⏳ Waiting for Supabase to process hash...");
      
      // Give Supabase time to process the hash
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data, error } = await supabase.auth.getSession();
      console.log("📦 Session check - Has session:", !!data?.session, "Error:", error);
      
      if (!error && data?.session && mounted) {
        console.log("✅ Session established - token is valid");
        setHasValidToken(true);
        setError("");
      } else {
        console.log("❌ No valid session");
      }
    };

    checkSession();

    return () => {
      console.log("🔚 Component unmounting");
      mounted = false;
      // Defensive cleanup: only unsubscribe if subscription exists
      if (subscription && typeof subscription.unsubscribe === 'function') {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.warn('Error unsubscribing from auth state change in reset-password:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    // Validate password in real-time
    setPasswordChecks({
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    });
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!Object.values(passwordChecks).every(Boolean)) {
      setError("Please meet all password requirements");
      return;
    }

    setLoading(true);

    try {
      // Check if we have a valid session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        throw new Error("Invalid or expired reset link. Please request a new password reset.");
      }

      console.log("🔄 Updating password...");
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      console.log("✅ Password updated successfully");

      // Sign out the user after password update
      await supabase.auth.signOut();

      setSuccess(true);
      
      // Redirect to home and open login modal after 2 seconds
      setTimeout(() => {
        router.push("/");
        setTimeout(() => {
          openLogin();
        }, 300);
      }, 2000);
    } catch (err: unknown) {
      console.log("❌ Error updating password:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update password. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md border-none shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <CardContent className="pt-12 pb-8">
            <div className="text-center space-y-6">
              {/* Success Icon */}
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg ring-8 ring-green-500/20">
                <CheckCircle2 className="size-10 text-white stroke-[3]" />
              </div>

              {/* Title */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Password Updated!</h2>
                <p className="text-gray-300 text-base">
                  Your password has been successfully updated.
                </p>
              </div>

              {/* Instructions */}
              <p className="text-gray-400 text-sm">
                You can now log in with your new password. Redirecting you to login...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-base text-gray-600 mt-2">
              Create a new password for your account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Token validation warning */}
            {!hasValidToken && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertDescription className="text-yellow-800 text-sm">
                  ⚠️ Please use the reset link from your email to access this page. If you arrived here directly, the password reset will not work.
                </AlertDescription>
              </Alert>
            )}

            {/* Error message */}
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                New Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="new-password"
                  name="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="h-11 pl-10 pr-10"
                  required
                  autoComplete="new-password"
                  title=""
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                <div className="space-y-1.5">
                  <PasswordCheck met={passwordChecks.minLength} text="At least 8 characters" />
                  <PasswordCheck met={passwordChecks.hasUppercase} text="One uppercase letter" />
                  <PasswordCheck met={passwordChecks.hasNumber} text="One number" />
                  <PasswordCheck met={passwordChecks.hasSpecial} text="One special character" />
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="h-11 pl-10 pr-10"
                  required
                  autoComplete="new-password"
                  title=""
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  Passwords do not match
                </p>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <p className="text-sm text-green-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !Object.values(passwordChecks).every(Boolean) || newPassword !== confirmPassword}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </Button>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function PasswordCheck({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
      <span className={met ? "text-green-600" : "text-gray-600"}>{text}</span>
    </div>
  );
}

