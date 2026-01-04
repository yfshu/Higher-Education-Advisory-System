"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Users, Search, Eye, Edit, Trash2, Mail, Calendar, UserCheck, UserX, Loader2, Phone, GraduationCap, Globe } from "lucide-react";
import { getAllUsers, getUserById, updateUser, deleteUser, type RecentUser, type UserDetails, type UpdateUserRequest } from "@/lib/api/admin";
import { useUser } from "@/contexts/UserContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function UserManagement() {
  const { userData } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState<RecentUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // View/Edit/Delete states
  const [viewingUser, setViewingUser] = useState<UserDetails | null>(null);
  const [editingUser, setEditingUser] = useState<UserDetails | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateUserRequest>({});
  const [saving, setSaving] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchUsers = async () => {
    if (!userData?.accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await getAllUsers(userData.accessToken, 50, 0);
      setUsers(result.users);
      setTotalUsers(result.total);
    } catch (err) {
      // Don't show error for session expiry - global handler will show modal
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        return;
      }
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userData?.accessToken]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || user.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleViewUser = async (userId: string) => {
    if (!userData?.accessToken) return;
    
    try {
      setViewLoading(true);
      const userDetails = await getUserById(userData.accessToken, userId);
      setViewingUser(userDetails);
    } catch (err) {
      // Don't show error for session expiry - global handler will show modal
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        return;
      }
      toast.error(err instanceof Error ? err.message : "Failed to load user details");
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditUser = async (userId: string) => {
    if (!userData?.accessToken) return;
    
    try {
      setViewLoading(true);
      const userDetails = await getUserById(userData.accessToken, userId);
      setEditingUser(userDetails);
      setEditFormData({
        email: userDetails.email,
        fullName: userDetails.fullName || '',
        phoneNumber: userDetails.phoneNumber || '',
        isActive: userDetails.status === 'Active',
      });
    } catch (err) {
      // Don't show error for session expiry - global handler will show modal
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        return;
      }
      toast.error(err instanceof Error ? err.message : "Failed to load user details");
    } finally {
      setViewLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!userData?.accessToken || !editingUser) return;
    
    try {
      setSaving(true);
      // Ensure isActive is explicitly set as boolean
      const isActiveValue = editFormData.isActive;
      const updateData = {
        ...editFormData,
        isActive: isActiveValue === true || (typeof isActiveValue === 'string' && (isActiveValue === 'active' || isActiveValue === 'true')),
      };
      console.log('Saving user with data:', updateData); // Debug log
      await updateUser(userData.accessToken, editingUser.id, updateData);
      toast.success("User updated successfully!");
      setEditingUser(null);
      await fetchUsers(); // Refresh list
    } catch (err) {
      // Don't show error for session expiry - global handler will show modal
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        return;
      }
      console.error('Error updating user:', err); // Debug log
      toast.error(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userData?.accessToken || !deletingUserId) return;
    
    try {
      await deleteUser(userData.accessToken, deletingUserId);
      toast.success("User deleted successfully!");
      setDeletingUserId(null);
      await fetchUsers(); // Refresh list
    } catch (err) {
      // Don't show error for session expiry - global handler will show modal
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        return;
      }
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

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
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 h-11 backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48 h-11 backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>All Users</span>
                </div>
              </SelectItem>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-green-600" />
                  <span>Active</span>
                </div>
              </SelectItem>
              <SelectItem value="inactive">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-red-600" />
                  <span>Inactive</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => {
            setItemsPerPage(parseInt(value, 10));
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-full sm:w-32 h-11 backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
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
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      {searchTerm || filterStatus !== 'all' ? 'No users found matching your criteria.' : 'No users available.'}
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/20 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={user.fullName || user.email} 
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm sm:text-base flex-shrink-0">
                              {(user.fullName || user.email).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                              {user.fullName || 'Unknown User'}
                            </div>
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
                          className={`text-xs flex items-center gap-1 ${
                            user.status === 'Active' 
                              ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                              : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                          }`}
                        >
                          {user.status === 'Active' ? (
                            <UserCheck className="w-3 h-3" />
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewUser(user.id)}
                            title="View user"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditUser(user.id)}
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeletingUserId(user.id)}
                            title="Delete user"
                          >
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-2 border-blue-500/60 dark:border-blue-400/60 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">{users.length}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-2 border-green-500/60 dark:border-green-400/60 shadow-md hover:shadow-lg transition-all">
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
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-2 border-purple-500/60 dark:border-purple-400/60 shadow-md hover:shadow-lg transition-all">
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
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-2 border-orange-500/60 dark:border-orange-400/60 shadow-md hover:shadow-lg transition-all">
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

      {/* View User Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View user information and profile</DialogDescription>
          </DialogHeader>
          {viewLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : viewingUser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {viewingUser.avatarUrl ? (
                  <img src={viewingUser.avatarUrl} alt={viewingUser.fullName} className="w-16 h-16 rounded-full" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                    {viewingUser.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{viewingUser.fullName || 'Unknown'}</h3>
                  <p className="text-sm text-muted-foreground">{viewingUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{viewingUser.email}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge 
                      className={`text-xs flex items-center gap-1 ${
                        viewingUser.status === 'Active' 
                          ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                          : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                      }`}
                    >
                      {viewingUser.status === 'Active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      {viewingUser.status}
                    </Badge>
                  </div>
                </div>
                {viewingUser.phoneNumber && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{viewingUser.phoneNumber}</span>
                    </div>
                  </div>
                )}
                {viewingUser.studyLevel && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Study Level</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{viewingUser.studyLevel}</span>
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Joined</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {viewingUser.joined ? formatDistanceToNow(new Date(viewingUser.joined), { addSuffix: true }) : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingUser(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {viewLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : editingUser ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input
                  id="edit-fullName"
                  type="text"
                  value={editFormData.fullName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                <Input
                  id="edit-phoneNumber"
                  type="tel"
                  value={editFormData.phoneNumber || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                  className="mt-1"
                  placeholder="+60123456789"
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editFormData.isActive ? 'active' : 'inactive'}
                  onValueChange={(value) => setEditFormData({ ...editFormData, isActive: value === 'active' })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingUserId} onOpenChange={(open) => !open && setDeletingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
