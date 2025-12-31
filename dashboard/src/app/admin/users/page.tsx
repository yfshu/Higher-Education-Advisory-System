"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Eye, Edit, Trash2, Mail, Calendar, UserCheck, UserX, Loader2 } from "lucide-react";
import { getRecentUsers, type RecentUser } from "@/lib/api/admin";
import { useUser } from "@/contexts/UserContext";
import { formatDistanceToNow } from "date-fns";

export default function UserManagement() {
  const { userData } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userData?.accessToken) {
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all users (we'll limit to 50 for now)
        const usersData = await getRecentUsers(userData.accessToken, 50);
        setUsers(usersData);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err instanceof Error ? err.message : "Failed to load users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userData?.accessToken]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout title="User Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="User Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading users</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Management">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Registered Users</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Manage student accounts and monitor activity.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/30"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/30">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/30 dark:bg-slate-800/30 border-b border-white/20">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">User</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 hidden sm:table-cell">Join Date</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Status</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      {searchTerm || filterStatus !== 'all' ? 'No users found matching your criteria.' : 'No users available.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/20 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm sm:text-base flex-shrink-0">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">{user.email}</div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-gray-900 dark:text-gray-100 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {user.joined ? formatDistanceToNow(new Date(user.joined), { addSuffix: true }) : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <Badge 
                          variant={user.status === 'Active' ? 'default' : 'secondary'}
                          className="text-xs flex items-center gap-1"
                        >
                          {user.status === 'Active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-1 sm:gap-2">
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">{users.length}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {users.filter(u => u.status === 'Active').length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {users.filter(u => {
                    if (!u.joined) return false;
                    const joinDate = new Date(u.joined);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return joinDate > weekAgo;
                  }).length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">New This Week</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <UserX className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {users.filter(u => u.status === 'Inactive').length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Inactive Users</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
