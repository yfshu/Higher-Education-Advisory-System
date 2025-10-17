'use client';
import { GraduationCap, Mail, Lock, ArrowLeft, Shield, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your BackToSchool account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Login */}
          <div className="space-y-4 mt-6">
            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/30">
              <p className="text-sm text-blue-800 mb-2 font-medium flex items-center">
                <GraduationCap className="w-4 h-4 mr-2" />
                Demo Student Account:
              </p>
              <p className="text-xs text-blue-600">Email: student@demo.com</p>
              <p className="text-xs text-blue-600">Password: demo123</p>
            </div>
            
            <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200/30">
              <p className="text-sm text-slate-800 mb-2 font-medium flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Demo Admin Account:
              </p>
              <p className="text-xs text-slate-600">Email: admin@demo.com</p>
              <p className="text-xs text-slate-600">Password: admin123</p>
            </div>
            
            {/* Account Detection Info */}
            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/30">
              <p className="text-xs text-amber-800">
                💡 The system automatically detects your account type based on your email address.
              </p>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Create Account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}