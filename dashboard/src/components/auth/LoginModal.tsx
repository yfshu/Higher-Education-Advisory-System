"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff, Mail, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

import { useAuthModals } from "./AuthModalProvider";

interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginModal() {
  const { isLoginOpen, closeLogin, switchToRegister } = useAuthModals();
  const router = useRouter();
  const [view, setView] = useState<"login" | "forgot" | "update">("login");
  const [formData, setFormData] = useState<LoginFormState>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const REMEMBER_EMAIL_KEY = "hea.remember.email";

  const resetForm = () =>
    setFormData((prev) => ({
      email: prev.rememberMe ? prev.email : "",
      password: "",
      rememberMe: prev.rememberMe,
    }));

  useEffect(() => {
    // Prefill remembered email when modal opens
    if (isLoginOpen) {
      const rememberedEmail = typeof window !== "undefined" ? localStorage.getItem(REMEMBER_EMAIL_KEY) : null;
      if (rememberedEmail) {
        setFormData((prev) => ({ ...prev, email: rememberedEmail, rememberMe: true }));
      }
      setView("login");
      setError(null);
      setStatus(null);
    }
  }, [isLoginOpen]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setView("update");
        setError(null);
        setStatus("Please enter a new password to complete reset.");
      }
    });
    return () => {
      try {
        data.subscription.unsubscribe();
      } catch {}
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const { email, password } = formData;
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = errBody?.message || `Login failed with status ${res.status}`;
        setError(msg);
        setLoading(false);
        return;
      }

      const body = await res.json();
      const accessToken: string = body?.accessToken ?? "";
      const refreshToken: string = body?.refreshToken ?? "";
      const role: string = body?.user?.role ?? "student";

      if (!accessToken || !refreshToken) {
        setError("Missing session tokens from backend response.");
        setLoading(false);
        return;
      }

      const { error: setErrorResult } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (setErrorResult) {
        setError(setErrorResult.message);
        setLoading(false);
        return;
      }

      // Persist or clear remembered email preference
      if (formData.rememberMe) {
        try {
          localStorage.setItem(REMEMBER_EMAIL_KEY, formData.email);
        } catch {}
      } else {
        try {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        } catch {}
      }

      setStatus("Signed in successfully.");
      // Clear fields after successful login
      resetForm();
      closeLogin();

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/student");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unexpected error during login.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const sendResetEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const res = await fetch(`${backendUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, redirectTo: origin }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = errBody?.message || `Failed with status ${res.status}`;
        setError(msg);
      } else {
        setStatus("Password reset email sent. Check your inbox.");
        setView("login");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes.data.session?.access_token;
      if (!accessToken) {
        setError("No active recovery session found.");
      } else {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
        const res = await fetch(`${backendUrl}/api/auth/update-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ password: newPassword }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          const msg = errBody?.message || `Failed with status ${res.status}`;
          setError(msg);
        } else {
          setStatus("Password updated. You can now sign in.");
          setView("login");
          setNewPassword("");
          setConfirmPassword("");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isLoginOpen}
      onOpenChange={(open) => {
        if (!open) {
          // Clear fields when closing the modal
          resetForm();
          closeLogin();
        }
      }}
    >
      <DialogContent className="max-w-md gap-0 border-none bg-white/95 p-0 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-6 p-6">
          <DialogHeader className="gap-3 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-600">
              <GraduationCap className="size-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Welcome Back!
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Sign in to continue exploring Malaysian universities and programs.
            </DialogDescription>
          </DialogHeader>
          {view === "login" && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="login-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="login-email"
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="Enter your email"
                  required
                  className="h-11 pl-10 text-gray-900 placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, password: event.target.value }))
                  }
                  placeholder="Enter your password"
                  required
                  className="h-11 pl-10 pr-10 text-gray-900 placeholder:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <Checkbox
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, rememberMe: Boolean(checked) }))
                  }
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => {
                  setView("forgot");
                  setStatus(null);
                  setError(null);
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {status && <p className="text-sm text-green-600">{status}</p>}

            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          )}

          {view === "forgot" && (
          <form className="space-y-4" onSubmit={sendResetEmail}>
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="forgot-email"
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="Enter your email"
                  required
                  className="h-11 pl-10 text-gray-900 placeholder:text-gray-500"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {status && <p className="text-sm text-green-600">{status}</p>}
            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button type="button" variant="secondary" className="flex-1" onClick={() => { setView("login"); setError(null); setStatus(null); }}>
                Back to Sign In
              </Button>
            </div>
          </form>
          )}

          {view === "update" && (
          <form className="space-y-4" onSubmit={updatePassword}>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {status && <p className="text-sm text-green-600">{status}</p>}
            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
              <Button type="button" variant="secondary" className="flex-1" onClick={() => { setView("login"); setError(null); setStatus(null); }}>
                Back to Sign In
              </Button>
            </div>
          </form>
          )}

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={switchToRegister}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Create Account
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
