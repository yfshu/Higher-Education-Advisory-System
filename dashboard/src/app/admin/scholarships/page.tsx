"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Award,
  Loader2,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { DeleteScholarshipDialog } from "@/components/admin/DeleteScholarshipDialog";

interface Scholarship {
  id: number;
  name: string;
  provider: string | null;
  amount: number | null;
  type: 'Merit-based' | 'Need-based' | 'Academic' | 'Other' | null;
  location: string | null;
  deadline: string | null;
    status: 'active' | 'expired' | 'draft' | null;
  description: string | null;
  study_levels: string[] | null;
  eligibility_requirements: any;
  benefits: any;
  applicant_count: number | null;
  application_url: string | null;
}

export default function ScholarshipManagement() {
  const { userData } = useUser();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    amount: '',
    type: 'Merit-based' as 'Merit-based' | 'Need-based' | 'Academic' | 'Other',
    location: '',
    deadline: '',
    description: '',
    status: 'active' as 'active' | 'expired' | 'draft',
    eligibility_requirements: '',
    benefits: '',
    application_url: '',
  });

  const handleRefresh = useCallback(async () => {
    if (!userData?.accessToken) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const response = await fetch(`${backendUrl}/api/scholarships?all=true&t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${userData.accessToken}`,
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch scholarships: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        console.log(`✅ Fetched ${result.data.length} scholarships (count: ${result.count})`);
        setScholarships(result.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching scholarships:", err);
      setError(err instanceof Error ? err.message : "Failed to load scholarships");
      setScholarships([]);
    } finally {
      setLoading(false);
    }
  }, [userData?.accessToken]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || scholarship.status === filterStatus;
    const matchesType = filterType === 'all' || scholarship.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredScholarships.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedScholarships = filteredScholarships.slice(startIndex, endIndex);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.accessToken) {
      toast.error("Please log in to perform this action.");
      return;
    }

    try {
      setSubmitting(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";

      // Prepare payload
      const payload: any = {
        name: formData.name,
        provider: formData.provider || null,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        type: formData.type || null,
        location: formData.location || null,
        deadline: formData.deadline || null,
        description: formData.description || null,
        status: formData.status || 'active',
        application_url: formData.application_url || null,
      };

      // Parse eligibility_requirements and benefits if provided
      // Backend expects objects, so ensure we always send an object or null
      if (formData.eligibility_requirements && formData.eligibility_requirements.trim()) {
        try {
          const parsed = JSON.parse(formData.eligibility_requirements);
          // Ensure it's an object, not an array or primitive
          if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            payload.eligibility_requirements = parsed;
          } else {
            // If parsed value is not an object, wrap it
            payload.eligibility_requirements = { requirements: Array.isArray(parsed) ? parsed : [parsed] };
          }
        } catch {
          // If not valid JSON, create a simple object from text lines
          const lines = formData.eligibility_requirements.split('\n').filter(r => r.trim());
          payload.eligibility_requirements = lines.length > 0 ? { requirements: lines } : null;
        }
      } else {
        payload.eligibility_requirements = null;
      }

      // Benefits is a string field in the database, not JSONB
      payload.benefits = formData.benefits && formData.benefits.trim() ? formData.benefits.trim() : null;

      let response;
      if (editingScholarship) {
        response = await fetch(`${backendUrl}/api/scholarships/${editingScholarship.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.accessToken}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${backendUrl}/api/scholarships`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.accessToken}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save scholarship");
      }

      toast.success(editingScholarship ? "Scholarship updated successfully!" : "Scholarship created successfully!");
      resetForm();
      setIsAddDialogOpen(false);
      setEditingScholarship(null);
      setTimeout(() => {
        handleRefresh();
      }, 300);
    } catch (error) {
      console.error("Error saving scholarship:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save scholarship");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      provider: '',
      amount: '',
      type: 'Merit-based',
      location: '',
      deadline: '',
      description: '',
      status: 'active',
      eligibility_requirements: '',
      benefits: '',
      application_url: '',
    });
  };

  const handleEdit = (scholarship: Scholarship) => {
    setFormData({
      name: scholarship.name,
      provider: scholarship.provider || '',
      amount: scholarship.amount?.toString() || '',
      type: scholarship.type || 'Merit-based',
      location: scholarship.location || '',
      deadline: scholarship.deadline || '',
      description: scholarship.description || '',
      status: scholarship.status || 'active',
      eligibility_requirements: scholarship.eligibility_requirements 
        ? (typeof scholarship.eligibility_requirements === 'string' 
          ? scholarship.eligibility_requirements 
          : JSON.stringify(scholarship.eligibility_requirements, null, 2))
        : '',
      benefits: scholarship.benefits
        ? (typeof scholarship.benefits === 'string'
          ? scholarship.benefits
          : JSON.stringify(scholarship.benefits, null, 2))
        : '',
      application_url: scholarship.application_url || '',
    });
    setEditingScholarship(scholarship);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setSelectedScholarship(null);
    setDeleteDialogOpen(false);
    setTimeout(() => {
      handleRefresh();
    }, 300);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string | null) => {
    switch (type) {
      case 'Merit-based': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Need-based': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Academic': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Other': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Scholarship Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading scholarships...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Scholarship Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading scholarships</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={handleRefresh} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Scholarship Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Scholarship Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage scholarship programs and opportunities</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Scholarship
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingScholarship ? 'Edit Scholarship' : 'Add New Scholarship'}
                </DialogTitle>
                <DialogDescription>
                  {editingScholarship ? 'Update scholarship information' : 'Create a new scholarship opportunity'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Scholarship Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Malaysia Excellence Scholarship"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Input
                      id="provider"
                      value={formData.provider}
                      onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                      placeholder="e.g., Ministry of Education Malaysia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Award Amount (RM)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="e.g., 50000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Scholarship Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Merit-based">Merit-based</SelectItem>
                        <SelectItem value="Need-based">Need-based</SelectItem>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Malaysia, Overseas, Both"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Application Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="application_url">Application URL</Label>
                  <Input
                    id="application_url"
                    type="url"
                    value={formData.application_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, application_url: e.target.value }))}
                    placeholder="https://example.com/apply"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed scholarship description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eligibility_requirements">Eligibility Requirements (JSON or text)</Label>
                    <Textarea
                      id="eligibility_requirements"
                      value={formData.eligibility_requirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, eligibility_requirements: e.target.value }))}
                      placeholder='{"academic": "SPM: 5 credits", "income": "Below RM 5,000"}'
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits (JSON or text)</Label>
                    <Textarea
                      id="benefits"
                      value={formData.benefits}
                      onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                      placeholder='{"tuition": "Full coverage", "living": "RM 1,000/month"}'
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingScholarship(null);
                      resetForm();
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingScholarship ? 'Update Scholarship' : 'Add Scholarship'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-blue-50/80 dark:from-slate-900/80 dark:to-blue-950/40 border-2 border-blue-300/50 dark:border-blue-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">Total Scholarships</CardTitle>
              <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{scholarships.length}</div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-amber-50/80 dark:from-slate-900/80 dark:to-amber-950/40 border-2 border-amber-300/50 dark:border-amber-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-amber-400 dark:hover:border-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">Active Scholarships</CardTitle>
              <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{scholarships.filter(s => s.status === 'active').length}</div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-emerald-50/80 dark:from-slate-900/80 dark:to-emerald-950/40 border-2 border-emerald-300/50 dark:border-emerald-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-emerald-400 dark:hover:border-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">Total Value</CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                RM {scholarships.reduce((sum, s) => sum + (s.amount || 0), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-purple-50/60 dark:from-slate-900/80 dark:to-purple-950/40 border-2 border-purple-300/50 dark:border-purple-600/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-700 dark:text-slate-200">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search scholarships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Merit-based">Merit-based</SelectItem>
                  <SelectItem value="Need-based">Need-based</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Scholarships Table */}
        <Card className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-900/80 dark:to-slate-950/60 border-2 border-slate-300/50 dark:border-slate-700/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-700 dark:text-slate-200">Scholarship Programs ({filteredScholarships.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-slate-300/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Scholarship Name</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Provider</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Amount</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Type</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Deadline</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedScholarships.map((scholarship) => (
                    <TableRow key={scholarship.id} className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <TableCell className="font-medium text-slate-700 dark:text-slate-200">{scholarship.name}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">{scholarship.provider || '-'}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 font-medium">
                        {scholarship.amount ? `RM ${scholarship.amount.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(scholarship.type)}>
                          {scholarship.type || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString('en-GB') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(scholarship.status)}>
                          {scholarship.status || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(scholarship)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(scholarship)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {paginatedScholarships.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No scholarships found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
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
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Results Info */}
        {filteredScholarships.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {startIndex + 1} - {Math.min(endIndex, filteredScholarships.length)} of {filteredScholarships.length} scholarships
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <DeleteScholarshipDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        scholarship={selectedScholarship ? { id: selectedScholarship.id, name: selectedScholarship.name } : null}
        onConfirm={handleDeleteSuccess}
      />
    </AdminLayout>
  );
}
