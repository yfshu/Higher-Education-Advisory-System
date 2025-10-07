import React, { useState } from 'react';
import AdminLayout from '../../layout/AdminLayout';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Users,
  Award,
  Filter,
  Download,
  Eye
} from 'lucide-react';

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: string;
  type: 'Merit-based' | 'Need-based' | 'Sports' | 'Academic' | 'Minority' | 'Other';
  eligibility: string;
  deadline: string;
  status: 'Active' | 'Inactive' | 'Expired';
  applicants: number;
  description: string;
  requirements: string[];
  documentRequired: string[];
}

export default function ScholarshipManagement() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([
    {
      id: '1',
      name: 'Malaysia Excellence Scholarship',
      provider: 'Ministry of Education Malaysia',
      amount: 'RM 50,000/year',
      type: 'Merit-based',
      eligibility: 'Malaysian citizens with excellent SPM results (minimum 8A+)',
      deadline: '2025-03-15',
      status: 'Active',
      applicants: 245,
      description: 'Full scholarship covering tuition fees, living allowance, and book allowance for undergraduate studies at local public universities.',
      requirements: ['SPM certificate with minimum 8A+', 'Malaysian citizenship', 'Family income below RM 5,000'],
      documentRequired: ['SPM certificate', 'Birth certificate', 'Income statement', 'Bank statement']
    },
    {
      id: '2',
      name: 'Yayasan Khazanah Scholarship',
      provider: 'Yayasan Khazanah',
      amount: 'Full sponsorship',
      type: 'Academic',
      eligibility: 'Outstanding Malaysian students for local and overseas universities',
      deadline: '2025-02-28',
      status: 'Active',
      applicants: 189,
      description: 'Comprehensive scholarship program covering full tuition, living expenses, and career development opportunities.',
      requirements: ['Excellent academic record', 'Leadership experience', 'Community involvement'],
      documentRequired: ['Academic transcripts', 'Personal statement', 'Reference letters', 'Interview']
    },
    {
      id: '3',
      name: 'JPA Scholarship Program',
      provider: 'Public Service Department (JPA)',
      amount: 'RM 40,000/year',
      type: 'Merit-based',
      eligibility: 'Top Malaysian students for overseas studies',
      deadline: '2025-01-31',
      status: 'Expired',
      applicants: 456,
      description: 'Government scholarship for pursuing undergraduate studies at top overseas universities with bond requirements.',
      requirements: ['Minimum CGPA 3.5', 'IELTS/TOEFL scores', 'Leadership qualities'],
      documentRequired: ['Academic transcripts', 'Language proficiency certificates', 'Interview assessment']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    amount: '',
    type: 'Merit-based' as Scholarship['type'],
    eligibility: '',
    deadline: '',
    description: '',
    requirements: '',
    documentRequired: ''
  });

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || scholarship.status === filterStatus;
    const matchesType = filterType === 'all' || scholarship.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const scholarshipData: Scholarship = {
      id: editingScholarship?.id || Date.now().toString(),
      name: formData.name,
      provider: formData.provider,
      amount: formData.amount,
      type: formData.type,
      eligibility: formData.eligibility,
      deadline: formData.deadline,
      status: 'Active',
      applicants: editingScholarship?.applicants || 0,
      description: formData.description,
      requirements: formData.requirements.split('\n').filter(req => req.trim()),
      documentRequired: formData.documentRequired.split('\n').filter(doc => doc.trim())
    };

    if (editingScholarship) {
      setScholarships(prev => prev.map(s => s.id === editingScholarship.id ? scholarshipData : s));
    } else {
      setScholarships(prev => [...prev, scholarshipData]);
    }

    resetForm();
    setIsAddDialogOpen(false);
    setEditingScholarship(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      provider: '',
      amount: '',
      type: 'Merit-based',
      eligibility: '',
      deadline: '',
      description: '',
      requirements: '',
      documentRequired: ''
    });
  };

  const handleEdit = (scholarship: Scholarship) => {
    setFormData({
      name: scholarship.name,
      provider: scholarship.provider,
      amount: scholarship.amount,
      type: scholarship.type,
      eligibility: scholarship.eligibility,
      deadline: scholarship.deadline,
      description: scholarship.description,
      requirements: scholarship.requirements.join('\n'),
      documentRequired: scholarship.documentRequired.join('\n')
    });
    setEditingScholarship(scholarship);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this scholarship?')) {
      setScholarships(prev => prev.filter(s => s.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-yellow-100 text-yellow-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Merit-based': return 'bg-blue-100 text-blue-800';
      case 'Need-based': return 'bg-purple-100 text-purple-800';
      case 'Sports': return 'bg-orange-100 text-orange-800';
      case 'Academic': return 'bg-green-100 text-green-800';
      case 'Minority': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scholarship Management</h1>
            <p className="text-gray-600 mt-1">Manage scholarship programs and opportunities</p>
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
                    <Label htmlFor="name">Scholarship Name</Label>
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
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Award Amount</Label>
                    <Input
                      id="amount"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="e.g., RM 50,000/year"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Scholarship Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Scholarship['type'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Merit-based">Merit-based</SelectItem>
                        <SelectItem value="Need-based">Need-based</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Minority">Minority</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Application Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eligibility">Eligibility Criteria</Label>
                  <Input
                    id="eligibility"
                    value={formData.eligibility}
                    onChange={(e) => setFormData(prev => ({ ...prev, eligibility: e.target.value }))}
                    placeholder="Brief eligibility description"
                    required
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
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements (one per line)</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                      placeholder="SPM certificate with minimum 8A+&#10;Malaysian citizenship&#10;Family income below RM 5,000"
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="documentRequired">Required Documents (one per line)</Label>
                    <Textarea
                      id="documentRequired"
                      value={formData.documentRequired}
                      onChange={(e) => setFormData(prev => ({ ...prev, documentRequired: e.target.value }))}
                      placeholder="SPM certificate&#10;Birth certificate&#10;Income statement&#10;Bank statement"
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
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingScholarship ? 'Update Scholarship' : 'Add Scholarship'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scholarships</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scholarships.length}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Scholarships</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scholarships.filter(s => s.status === 'Active').length}</div>
              <p className="text-xs text-muted-foreground">Currently accepting applications</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scholarships.reduce((sum, s) => sum + s.applicants, 0)}</div>
              <p className="text-xs text-muted-foreground">Across all scholarships</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RM 2.5M</div>
              <p className="text-xs text-muted-foreground">Estimated annual value</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
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
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Minority">Minority</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scholarships Table */}
        <Card>
          <CardHeader>
            <CardTitle>Scholarship Programs ({filteredScholarships.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scholarship Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applicants</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScholarships.map((scholarship) => (
                    <TableRow key={scholarship.id}>
                      <TableCell className="font-medium">{scholarship.name}</TableCell>
                      <TableCell>{scholarship.provider}</TableCell>
                      <TableCell>{scholarship.amount}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(scholarship.type)}>
                          {scholarship.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(scholarship.deadline).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(scholarship.status)}>
                          {scholarship.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{scholarship.applicants}</TableCell>
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
                            onClick={() => handleDelete(scholarship.id)}
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
            
            {filteredScholarships.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No scholarships found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}