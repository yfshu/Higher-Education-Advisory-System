"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash2, BookOpen, GraduationCap, MapPin, Users, Eye, Loader2 } from "lucide-react";
import Link from "next/link";

interface Program {
  id: number;
  name: string;
  level: string | null;
  duration_months: number | null;
  tuition_fee_amount: number | null;
  university: {
    id: number;
    name: string;
    city: string | null;
    state: string | null;
  } | null;
  created_at: string | null;
}

export default function ProgramManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
        const response = await fetch(`${backendUrl}/api/programs`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch programs: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setPrograms(result.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching programs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load programs');
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.university?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (program.level && program.level.toLowerCase() === filterType.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const getLevelDisplay = (level: string | null): string => {
    if (!level) return 'N/A';
    return level;
  };

  const getLocation = (program: Program): string => {
    if (!program.university) return 'Unknown';
    const parts = [program.university.city, program.university.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Malaysia';
  };

  if (loading) {
    return (
      <AdminLayout title="Program Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading programs...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Program Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading programs</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Program Management">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Malaysian University Programs
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Add, edit, and manage university programs from Malaysian institutions.
            </p>
          </div>
          <Button asChild className="bg-slate-700 hover:bg-slate-800 text-white">
            <Link href="/admin/programs/new">
              Add New Program
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search programs or universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-white/30"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              size="sm"
              className="text-xs sm:text-sm"
            >
              All
            </Button>
            <Button
              variant={filterType === 'foundation' ? 'default' : 'outline'}
              onClick={() => setFilterType('foundation')}
              size="sm"
              className="text-xs sm:text-sm"
            >
              Foundation
            </Button>
            <Button
              variant={filterType === 'diploma' ? 'default' : 'outline'}
              onClick={() => setFilterType('diploma')}
              size="sm"
              className="text-xs sm:text-sm"
            >
              Diploma
            </Button>
            <Button
              variant={filterType === 'bachelor' ? 'default' : 'outline'}
              onClick={() => setFilterType('bachelor')}
              size="sm"
              className="text-xs sm:text-sm"
            >
              Degree
            </Button>
          </div>
        </div>

        {/* Programs Table */}
        <Card className="backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/30 dark:bg-slate-800/30 border-b border-white/20">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Program</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">University</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Type</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 hidden sm:table-cell">Duration</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 hidden lg:table-cell">Tuition</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      {searchTerm || filterType !== 'all' ? 'No programs found matching your criteria.' : 'No programs available.'}
                    </td>
                  </tr>
                ) : (
                  filteredPrograms.map((program) => (
                    <tr key={program.id} className="hover:bg-white/20 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{program.name}</div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {getLocation(program)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">{program.university?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <Badge variant="outline" className="text-xs">
                          {getLevelDisplay(program.level)}
                        </Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <span className="text-gray-900 dark:text-gray-100 text-sm">
                          {program.duration_months ? `${program.duration_months} months` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                        <span className="text-gray-900 dark:text-gray-100 text-sm">
                          {program.tuition_fee_amount ? `RM ${program.tuition_fee_amount.toLocaleString()}` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/student/program/${program.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
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

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">{programs.length}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Programs</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {programs.filter(p => p.level && ['Foundation', 'Diploma', 'Bachelor'].includes(p.level)).length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Programs</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {programs.length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Programs</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {programs.filter(p => p.level === 'Foundation').length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Foundation</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
