import React from 'react';
import AdminLayout from '../../layout/AdminLayout';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  AlertTriangle,
  Calendar,
  BarChart3,
  Plus,
  Eye,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const recentUsers = [
    { name: 'Ahmad Rahman', email: 'ahmad.rahman@gmail.com', joined: '2024-01-15', status: 'Active' },
    { name: 'Siti Nurhaliza', email: 'siti.nurhaliza@hotmail.com', joined: '2024-01-14', status: 'Active' },
    { name: 'Raj Kumar', email: 'raj.kumar@yahoo.com', joined: '2024-01-13', status: 'Pending' },
    { name: 'Lim Wei Ming', email: 'weiming.lim@gmail.com', joined: '2024-01-12', status: 'Active' }
  ];

  const recentPrograms = [
    { title: 'Computer Science', university: 'University of Malaya', added: '2024-01-10', applications: 245 },
    { title: 'Software Engineering', university: 'Universiti Teknologi Malaysia', added: '2024-01-09', applications: 189 },
    { title: 'Information Technology', university: 'Universiti Putra Malaysia', added: '2024-01-08', applications: 156 },
    { title: 'Business Administration', university: 'Universiti Kebangsaan Malaysia', added: '2024-01-07', applications: 134 }
  ];

  const systemAlerts = [
    { type: 'warning', message: 'High SPM student registration activity detected from Klang Valley', time: '2 hours ago' },
    { type: 'info', message: 'Weekly Malaysian university data sync completed successfully', time: '1 day ago' },
    { type: 'error', message: 'Failed recommendation update for 3 STPM students', time: '2 days ago' }
  ];

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-slate-500/20 to-blue-500/20 border border-white/20 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            BackToSchool Admin Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            Monitor and manage the Malaysian Higher Education Advisory System. Track student registrations, university programs, and recommendation analytics across 150+ Malaysian institutions.
          </p>
          <div className="flex gap-4">
            <Link to="/admin/programs">
              <Button className="bg-slate-700 hover:bg-slate-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add New Program
              </Button>
            </Link>
            <Link to="/admin/scholarships">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Award className="w-4 h-4 mr-2" />
                Add Scholarship
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="outline" className="backdrop-blur-sm bg-white/50">
                <Eye className="w-4 h-4 mr-2" />
                View Users
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-5 gap-6">
          <Card className="p-6 backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Malaysian Students</p>
                <p className="text-2xl font-semibold text-gray-900">2,847</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +47 this week
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Malaysian Programs</p>
                <p className="text-2xl font-semibold text-gray-900">5,156</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +23 this month
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Scholarship Programs</p>
                <p className="text-2xl font-semibold text-gray-900">248</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +8 this month
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recommendations Made</p>
                <p className="text-2xl font-semibold text-gray-900">12,450</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +156 today
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">System Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">3</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-orange-600 mt-2">1 requires attention</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Recent User Registrations</h3>
                <Link to="/admin/users">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-700">
                    View All
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentUsers.map((user, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-white/30 backdrop-blur-sm border border-white/20">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">Joined {new Date(user.joined).toLocaleDateString()}</p>
                    </div>
                    <Badge 
                      variant={user.status === 'Active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {user.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Programs */}
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Recently Added Programs</h3>
                <Link to="/admin/programs">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-700">
                    Manage Programs
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentPrograms.map((program, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-white/30 backdrop-blur-sm border border-white/20">
                    <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{program.title}</h4>
                      <p className="text-sm text-gray-600">{program.university}</p>
                      <p className="text-xs text-gray-500">Added {new Date(program.added).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{program.applications}</p>
                      <p className="text-xs text-gray-500">applications</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* System Alerts */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6 border-b border-white/20">
            <h3 className="font-semibold text-gray-900">System Alerts & Notifications</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemAlerts.map((alert, index) => (
                <div key={index} className={`flex items-center gap-4 p-4 rounded-lg border ${
                  alert.type === 'error' ? 'bg-red-50/50 border-red-200/30' :
                  alert.type === 'warning' ? 'bg-yellow-50/50 border-yellow-200/30' :
                  'bg-blue-50/50 border-blue-200/30'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    alert.type === 'error' ? 'bg-red-100' :
                    alert.type === 'warning' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    <AlertTriangle className={`w-4 h-4 ${
                      alert.type === 'error' ? 'text-red-600' :
                      alert.type === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.time}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-5 gap-4">
            <Link to="/admin/programs">
              <Button variant="outline" className="w-full justify-start backdrop-blur-sm bg-white/50">
                <BookOpen className="w-4 h-4 mr-2" />
                Manage Programs
              </Button>
            </Link>
            <Link to="/admin/scholarships">
              <Button variant="outline" className="w-full justify-start backdrop-blur-sm bg-white/50">
                <Award className="w-4 h-4 mr-2" />
                Manage Scholarships
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="outline" className="w-full justify-start backdrop-blur-sm bg-white/50">
                <Users className="w-4 h-4 mr-2" />
                User Management
              </Button>
            </Link>
            <Link to="/admin/content">
              <Button variant="outline" className="w-full justify-start backdrop-blur-sm bg-white/50">
                <Settings className="w-4 h-4 mr-2" />
                Content Settings
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start backdrop-blur-sm bg-white/50">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics Report
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}