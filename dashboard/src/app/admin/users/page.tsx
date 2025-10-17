"use client";

import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  Search,
  Eye,
  Edit,
  Trash2,
  Mail,
  Calendar,
  UserCheck,
  UserX
} from "lucide-react";

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      joinDate: '2024-01-15',
      lastActive: '2024-01-20',
      status: 'Active',
      programsViewed: 24,
      applicationsSubmitted: 3
    },
    {
      id: 2,
      name: 'Sarah Smith',
      email: 'sarah.smith@email.com',
      joinDate: '2024-01-14',
      lastActive: '2024-01-19',
      status: 'Active',
      programsViewed: 18,
      applicationsSubmitted: 2
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.j@email.com',
      joinDate: '2024-01-13',
      lastActive: '2024-01-13',
      status: 'Inactive',
      programsViewed: 5,
      applicationsSubmitted: 0
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Registered Users</h2>
            <p className="text-gray-600">Manage student accounts and monitor activity.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48 backdrop-blur-sm bg-white/50 border-white/30">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/30 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Join Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Activity</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(user.joinDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Last active: {new Date(user.lastActive).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{user.programsViewed} programs viewed</div>
                      <div className="text-sm text-gray-500">{user.applicationsSubmitted} applications</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={user.status === 'Active' ? 'default' : 'secondary'}
                        className="text-xs flex items-center gap-1"
                      >
                        {user.status === 'Active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 backdrop-blur-xl bg-white/40 border-white/20">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 backdrop-blur-xl bg-white/40 border-white/20">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.status === 'Active').length}
                </p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 backdrop-blur-xl bg-white/40 border-white/20">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => 
                    new Date(u.joinDate) > new Date(Date.now() - 7*24*60*60*1000)
                  ).length}
                </p>
                <p className="text-sm text-gray-600">New This Week</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 backdrop-blur-xl bg-white/40 border-white/20">
            <div className="flex items-center gap-3">
              <UserX className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.status === 'Inactive').length}
                </p>
                <p className="text-sm text-gray-600">Inactive Users</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
