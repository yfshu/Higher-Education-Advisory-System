import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';
import { Button } from '../ui/button';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  Settings,
  LogOut,
  Shield
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/programs', icon: BookOpen, label: 'Program Management' },
    { href: '/admin/users', icon: Users, label: 'User Management' },
    { href: '/admin/content', icon: FileText, label: 'Content Management' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Sidebar */}
      <div className="w-64 backdrop-blur-xl bg-white/30 border-r border-white/20 shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Shield className="w-8 h-8 text-slate-700" />
            <span className="font-semibold text-gray-800">Admin Panel</span>
          </div>
          
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-500/20 text-slate-700 backdrop-blur-sm border border-slate-200/30'
                      : 'text-gray-600 hover:bg-white/50 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center text-white">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="font-medium text-gray-800">{user?.name}</div>
              <div className="text-sm text-gray-500">Administrator</div>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-white/50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/40 border-b border-white/20 shadow-sm">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </div>
    </div>
  );
}