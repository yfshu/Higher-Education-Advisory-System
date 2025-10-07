import React, { useState } from 'react';
import AdminLayout from '../../layout/AdminLayout';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  GraduationCap,
  MapPin,
  Calendar,
  Users,
  Eye,
  Filter
} from 'lucide-react';

export default function ProgramManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProgram, setNewProgram] = useState({
    title: '',
    university: '',
    location: '',
    type: '',
    duration: '',
    tuitionFee: '',
    deadline: '',
    requirements: '',
    description: '',
    field: ''
  });

  const programs = [
    {
      id: 1,
      title: 'Computer Science',
      university: 'University of Malaya',
      location: 'Kuala Lumpur, Malaysia',
      type: 'Bachelor',
      duration: '4 years',
      tuitionFee: 'RM 3,500/semester',
      deadline: '2024-03-15',
      applications: 456,
      status: 'Active',
      field: 'Computer Science & IT',
      lastUpdated: '2024-01-10'
    },
    {
      id: 2,
      title: 'Software Engineering',
      university: 'Universiti Teknologi Malaysia',
      location: 'Johor Bahru, Malaysia',
      type: 'Bachelor',
      duration: '4 years',
      tuitionFee: 'RM 3,200/semester',
      deadline: '2024-04-01',
      applications: 312,
      status: 'Active',
      field: 'Computer Science & IT',
      lastUpdated: '2024-01-08'
    },
    {
      id: 3,
      title: 'Business Administration',
      university: 'Universiti Kebangsaan Malaysia',
      location: 'Bangi, Malaysia',
      type: 'Bachelor',
      duration: '3 years',
      tuitionFee: 'RM 2,800/semester',
      deadline: '2024-02-15',
      applications: 289,
      status: 'Active',
      field: 'Business & Management',
      lastUpdated: '2024-01-05'
    },
    {
      id: 4,
      title: 'Mechanical Engineering',
      university: 'Universiti Putra Malaysia',
      location: 'Serdang, Malaysia',
      type: 'Bachelor',
      duration: '4 years',
      tuitionFee: 'RM 3,100/semester',
      deadline: '2024-01-31',
      applications: 234,
      status: 'Draft',
      field: 'Engineering',
      lastUpdated: '2024-01-12'
    }
  ];

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.university.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || program.type.toLowerCase() === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAddProgram = () => {
    console.log('Adding new program:', newProgram);
    setIsAddDialogOpen(false);
    setNewProgram({
      title: '',
      university: '',
      location: '',
      type: '',
      duration: '',
      tuitionFee: '',
      deadline: '',
      requirements: '',
      description: '',
      field: ''
    });
  };

  return (
    <AdminLayout title="Program Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Malaysian University Programs
            </h2>
            <p className="text-gray-600">
              Add, edit, and manage university programs from Malaysian institutions across public and private universities.
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-700 hover:bg-slate-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add New Program
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl backdrop-blur-xl bg-white/90">
              <DialogHeader>
                <DialogTitle>Add New Program</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Program Title</Label>
                    <Input
                      value={newProgram.title}
                      onChange={(e) => setNewProgram({...newProgram, title: e.target.value})}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>University</Label>
                    <Input
                      value={newProgram.university}
                      onChange={(e) => setNewProgram({...newProgram, university: e.target.value})}
                      placeholder="e.g., University of Malaya"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={newProgram.location}
                      onChange={(e) => setNewProgram({...newProgram, location: e.target.value})}
                      placeholder="e.g., Kuala Lumpur, Malaysia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Program Type</Label>
                    <Select onValueChange={(value) => setNewProgram({...newProgram, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Foundation">Foundation</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Bachelor">Bachelor</SelectItem>
                        <SelectItem value="Master">Master</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      value={newProgram.duration}
                      onChange={(e) => setNewProgram({...newProgram, duration: e.target.value})}
                      placeholder="e.g., 4 years"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tuition Fee</Label>
                    <Input
                      value={newProgram.tuitionFee}
                      onChange={(e) => setNewProgram({...newProgram, tuitionFee: e.target.value})}
                      placeholder="e.g., RM 3,500/semester"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Application Deadline</Label>
                    <Input
                      type="date"
                      value={newProgram.deadline}
                      onChange={(e) => setNewProgram({...newProgram, deadline: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Field of Study</Label>
                  <Select onValueChange={(value) => setNewProgram({...newProgram, field: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science & IT">Computer Science & IT</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Business & Management">Business & Management</SelectItem>
                      <SelectItem value="Medicine & Health Sciences">Medicine & Health Sciences</SelectItem>
                      <SelectItem value="Pure Sciences">Pure Sciences</SelectItem>
                      <SelectItem value="Arts & Humanities">Arts & Humanities</SelectItem>
                      <SelectItem value="Social Sciences">Social Sciences</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Law">Law</SelectItem>
                      <SelectItem value="Architecture & Built Environment">Architecture & Built Environment</SelectItem>
                      <SelectItem value="Accounting & Finance">Accounting & Finance</SelectItem>
                      <SelectItem value="Mass Communication">Mass Communication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Entry Requirements</Label>
                  <Textarea
                    value={newProgram.requirements}
                    onChange={(e) => setNewProgram({...newProgram, requirements: e.target.value})}
                    placeholder="e.g., SPM: 5 credits including Mathematics and English, or STPM: CGPA 3.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Program Description</Label>
                  <Textarea
                    value={newProgram.description}
                    onChange={(e) => setNewProgram({...newProgram, description: e.target.value})}
                    placeholder="Detailed program description..."
                    className="min-h-20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProgram} className="bg-slate-700 hover:bg-slate-800 text-white">
                    Add Program
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search programs or universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filterType === 'bachelor' ? 'default' : 'outline'}
              onClick={() => setFilterType('bachelor')}
              size="sm"
            >
              Bachelor
            </Button>
            <Button
              variant={filterType === 'master' ? 'default' : 'outline'}
              onClick={() => setFilterType('master')}
              size="sm"
            >
              Master
            </Button>
          </div>
        </div>

        {/* Programs Table */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/30 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Program</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">University</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Applications</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredPrograms.map((program) => (
                  <tr key={program.id} className="hover:bg-white/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{program.title}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {program.location}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{program.university}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-xs">
                        {program.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{program.applications}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={program.status === 'Active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {program.status}
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

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 backdrop-blur-xl bg-white/40 border-white/20">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-semibold text-gray-900">{programs.length}</p>
                <p className="text-sm text-gray-600">Total Programs</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 backdrop-blur-xl bg-white/40 border-white/20">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {programs.filter(p => p.status === 'Active').length}
                </p>
                <p className="text-sm text-gray-600">Active Programs</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 backdrop-blur-xl bg-white/40 border-white/20">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {programs.reduce((sum, p) => sum + p.applications, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Applications</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 backdrop-blur-xl bg-white/40 border-white/20">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {programs.filter(p => new Date(p.deadline) < new Date(Date.now() + 30*24*60*60*1000)).length}
                </p>
                <p className="text-sm text-gray-600">Closing Soon</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}