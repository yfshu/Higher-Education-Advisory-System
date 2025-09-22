import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../App';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card } from '../../ui/card';
import { Shield, Mail, Lock, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate admin login process
    setTimeout(() => {
      login('admin', {
        id: 'admin-1',
        name: 'System Administrator',
        email: email
      });
      navigate('/admin/dashboard');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
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
              <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Admin Access</h1>
            <p className="text-gray-600">Sign in to admin panel</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
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
                  placeholder="Enter admin password"
                  className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-700 hover:bg-slate-800 text-white"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Access Admin Panel'}
            </Button>
          </form>

          {/* Demo Login */}
          <div className="mt-6 p-4 bg-slate-50/50 rounded-lg border border-slate-200/30">
            <p className="text-sm text-slate-800 mb-2 font-medium">Demo Admin Account:</p>
            <p className="text-xs text-slate-600">Email: admin@demo.com</p>
            <p className="text-xs text-slate-600">Password: admin123</p>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-amber-50/50 rounded-lg border border-amber-200/30">
            <p className="text-xs text-amber-800">
              <Shield className="w-4 h-4 inline mr-1" />
              This is a secure admin area. All activities are logged and monitored.
            </p>
          </div>

          {/* Student Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Not an admin?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Student Login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}