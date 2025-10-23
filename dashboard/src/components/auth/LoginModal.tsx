"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";

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
  const [formData, setFormData] = useState<LoginFormState>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    const { email, password } = formData;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Determine role and redirect accordingly
    const userId = data.user?.id ?? (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      setError("Failed to determine authenticated user.");
      setLoading(false);
      return;
    }

    const { data: details, error: detailsError } = await supabase
      .from("users_details")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (detailsError) {
      // If role fetch fails, default to student
      console.warn("Failed to fetch user role:", detailsError.message);
    }

    const role = details?.role ?? "student";

    setStatus("Signed in successfully.");
    closeLogin();

    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/student");
    }

    setLoading(false);
  };

  return (
    <Dialog open={isLoginOpen} onOpenChange={(open) => (!open ? closeLogin() : null)}>
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
                  className="h-11 pl-10"
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
                  className="h-11 pl-10 pr-10"
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
              <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {status && <p className="text-sm text-green-600">{status}</p>}

            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="grid gap-3 rounded-lg bg-blue-50/70 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-blue-800">
              <GraduationCap className="size-4" />
              Demo Student
            </p>
            <p className="text-xs text-blue-700">Email: student@demo.com</p>
            <p className="text-xs text-blue-700">Password: demo123</p>
          </div>

          <div className="grid gap-3 rounded-lg bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <Shield className="size-4" />
              Demo Admin
            </p>
            <p className="text-xs text-slate-600">Email: admin@demo.com</p>
            <p className="text-xs text-slate-600">Password: admin123</p>
          </div>

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
