"use client";

import { useState } from "react";
import Link from "next/link";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  MapPin,
  Calendar,
  GraduationCap,
  ExternalLink,
  Trash2,
  Star,
  DollarSign,
  Building2,
  Users,
  Filter,
  SortAsc,
  AlertCircle,
  Search,
  Award
} from "lucide-react";

export default function SavedItems() {
  const [programSortBy, setProgramSortBy] = useState('deadline');
  const [scholarshipSortBy, setScholarshipSortBy] = useState('deadline');
  const [scholarshipFilterBy, setScholarshipFilterBy] = useState('all');
  const [selectedScholarships, setSelectedScholarships] = useState<string[]>([]);

  const savedPrograms = [
    {
      id: 1,
      title: 'Computer Science',
      university: 'University of Malaya',
      location: 'Kuala Lumpur, Malaysia',
      type: 'Bachelor',
      savedDate: '2024-01-15',
      deadline: '2024-03-15',
      matchPercentage: 95
    },
    {
      id: 2,
      title: 'Software Engineering',
      university: 'Universiti Teknologi Malaysia',
      location: 'Johor Bahru, Malaysia',
      type: 'Bachelor',
      savedDate: '2024-01-12',
      deadline: '2024-04-01',
      matchPercentage: 92
    },
    {
      id: 3,
      title: 'Business Administration',
      university: 'Universiti Kebangsaan Malaysia',
      location: 'Bangi, Malaysia',
      type: 'Bachelor',
      savedDate: '2024-01-10',
      deadline: '2024-02-28',
      matchPercentage: 88
    }
  ];

  const savedScholarships = [
    {
      id: '1',
      title: 'MARA Excellence Scholarship',
      organization: 'Majlis Amanah Rakyat (MARA)',
      type: 'Merit-based',
      amount: 'Up to RM 150,000',
      level: 'Bachelor\'s Degree',
      field: 'Engineering',
      location: 'Malaysia & Overseas',
      deadline: '2024-03-15',
      applicants: '2,500+',
      description: 'Full scholarship for outstanding SPM graduates to pursue engineering degrees at top universities worldwide.',
      rating: 4.8,
      reviews: 124,
      status: 'upcoming',
      savedDate: '2024-01-10',
      matchScore: 95
    },
    {
      id: '3',
      title: 'Genting Scholarship Award',
      organization: 'Genting Group',
      type: 'Merit-based',
      amount: 'RM 80,000 - RM 120,000',
      level: 'Bachelor\'s Degree',
      field: 'Business & Management',
      location: 'Malaysia',
      deadline: '2024-04-30',
      applicants: '800+',
      description: 'Corporate scholarship for business and hospitality management studies with guaranteed internship opportunities.',
      rating: 4.6,
      reviews: 67,
      status: 'upcoming',
      savedDate: '2024-01-12',
      matchScore: 88
    },
    {
      id: '5',
      title: 'Petronas Education Scholarship',
      organization: 'Petroliam Nasional Berhad',
      type: 'Merit-based',
      amount: 'Up to RM 200,000',
      level: 'Bachelor\'s Degree',
      field: 'Engineering',
      location: 'Local & Overseas',
      deadline: '2024-03-01',
      applicants: '3,000+',
      description: 'Premium scholarship for engineering students with guaranteed career path in the oil and gas industry.',
      rating: 4.7,
      reviews: 203,
      status: 'urgent',
      savedDate: '2024-01-08',
      matchScore: 92
    }
  ];

  const toggleScholarshipSelection = (scholarshipId: string) => {
    setSelectedScholarships(prev => 
      prev.includes(scholarshipId) 
        ? prev.filter(id => id !== scholarshipId)
        : [...prev, scholarshipId]
    );
  };

  const removeScholarship = (scholarshipId: string) => {
    // Remove scholarship functionality would be implemented here
  };

  const removeSelectedScholarships = () => {
    selectedScholarships.forEach(id => removeScholarship(id));
    setSelectedScholarships([]);
  };

  const getStatusBadge = (status: string, deadline: string) => {
    const daysUntilDeadline = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (status === 'closed' || daysUntilDeadline < 0) {
      return <Badge variant="secondary" className="bg-gray-100 text-muted-foreground">Closed</Badge>;
    } else if (daysUntilDeadline <= 7) {
      return <Badge variant="destructive">Urgent - {daysUntilDeadline} days left</Badge>;
    } else if (daysUntilDeadline <= 30) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-600">Due Soon</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-green-100 text-green-600">Open</Badge>;
    }
  };

  const sortedPrograms = [...savedPrograms].sort((a, b) => {
    switch (programSortBy) {
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'match':
        return b.matchPercentage - a.matchPercentage;
      case 'saved':
        return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const sortedScholarships = [...savedScholarships].sort((a, b) => {
    switch (scholarshipSortBy) {
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'match':
        return b.matchScore - a.matchScore;
      case 'amount':
        return b.amount.localeCompare(a.amount);
      case 'saved':
        return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
      default:
        return 0;
    }
  });

  const filteredScholarships = sortedScholarships.filter(scholarship => {
    if (scholarshipFilterBy === 'all') return true;
    if (scholarshipFilterBy === 'urgent') {
      const daysUntilDeadline = Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
    }
    if (scholarshipFilterBy === 'open') {
      const daysUntilDeadline = Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline > 0;
    }
    if (scholarshipFilterBy === 'closed') {
      const daysUntilDeadline = Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline < 0;
    }
    return true;
  });

  return (
    <StudentLayout title="Saved Items">
      <div className="space-y-6">
        {/* Header */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">Saved Items</h1>
                  <p className="text-muted-foreground">Manage your saved programs and scholarships</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button asChild variant="outline" className="backdrop-blur-sm bg-white/50 border-white/30">
                  <Link href="/student/search">
                    <Search className="w-4 h-4 mr-2" />
                    Find Programs
                  </Link>
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/student/scholarships">
                    <Award className="w-4 h-4 mr-2" />
                    Find Scholarships
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary Statistics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-semibold text-foreground">{savedPrograms.length}</p>
                <p className="text-sm text-muted-foreground">Saved Programs</p>
              </div>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-semibold text-foreground">{savedScholarships.length}</p>
                <p className="text-sm text-muted-foreground">Saved Scholarships</p>
              </div>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {[...savedPrograms, ...savedScholarships].filter(item => {
                    const days = Math.ceil((new Date(item.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return days <= 7 && days >= 0;
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">Urgent Deadlines</p>
              </div>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {Math.round((savedPrograms.reduce((acc, p) => acc + p.matchPercentage, 0) + 
                    savedScholarships.reduce((acc, s) => acc + s.matchScore, 0)) / 
                    (savedPrograms.length + savedScholarships.length))}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Match Score</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="programs" className="w-full">
          <TabsList className="grid w-full grid-cols-2 backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg p-1 h-12">
            <TabsTrigger 
              value="programs" 
              className="flex items-center gap-2 h-10 rounded-lg backdrop-blur-sm bg-white/20 border border-transparent hover:bg-white/40 hover:border-blue-200/50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:shadow-md transition-all duration-200 font-medium"
            >
              <GraduationCap className="w-4 h-4" />
              Programs ({savedPrograms.length})
            </TabsTrigger>
            <TabsTrigger 
              value="scholarships" 
              className="flex items-center gap-2 h-10 rounded-lg backdrop-blur-sm bg-white/20 border border-transparent hover:bg-white/40 hover:border-yellow-200/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:border-yellow-500 data-[state=active]:shadow-md transition-all duration-200 font-medium"
            >
              <Award className="w-4 h-4" />
              Scholarships ({savedScholarships.length})
            </TabsTrigger>
          </TabsList>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6 mt-6">
            {/* Program Controls */}
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <SortAsc className="w-4 h-4 text-muted-foreground" />
                      <Select value={programSortBy} onValueChange={setProgramSortBy}>
                        <SelectTrigger className="w-48 backdrop-blur-sm bg-white/50 border-white/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deadline">Sort by Deadline</SelectItem>
                          <SelectItem value="match">Sort by Match Score</SelectItem>
                          <SelectItem value="name">Sort by Name</SelectItem>
                          <SelectItem value="saved">Sort by Date Saved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {savedPrograms.length} program{savedPrograms.length !== 1 ? 's' : ''} saved
                  </p>
                </div>
              </div>
            </Card>

            {/* Programs List */}
            <div className="space-y-4">
              {sortedPrograms.length === 0 ? (
                <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No programs saved yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start exploring Malaysian university programs and save the ones you are interested in.
                    </p>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Link href="/student/search">
                        <Search className="w-4 h-4 mr-2" />
                        Browse Programs
                      </Link>
                    </Button>
                  </div>
                </Card>
              ) : (
                sortedPrograms.map((program) => (
                  <Card key={program.id} className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{program.title}</h3>
                            <Badge className="bg-green-500/20 text-green-700">
                              {program.matchPercentage}% Match
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <GraduationCap className="w-4 h-4" />
                              {program.university}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {program.location}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Saved on {new Date(program.savedDate).toLocaleDateString()}</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Deadline: {new Date(program.deadline).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Link href={`/student/program/${program.id}`}>
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Scholarships Tab */}
          <TabsContent value="scholarships" className="space-y-6 mt-6">
            {/* Scholarship Controls */}
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <SortAsc className="w-4 h-4 text-gray-500" />
                      <Select value={scholarshipSortBy} onValueChange={setScholarshipSortBy}>
                        <SelectTrigger className="w-48 backdrop-blur-sm bg-white/50 border-white/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deadline">Sort by Deadline</SelectItem>
                          <SelectItem value="match">Sort by Match Score</SelectItem>
                          <SelectItem value="amount">Sort by Amount</SelectItem>
                          <SelectItem value="saved">Sort by Date Saved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <Select value={scholarshipFilterBy} onValueChange={setScholarshipFilterBy}>
                        <SelectTrigger className="w-48 backdrop-blur-sm bg-white/50 border-white/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Scholarships</SelectItem>
                          <SelectItem value="urgent">Urgent Deadlines</SelectItem>
                          <SelectItem value="open">Open Applications</SelectItem>
                          <SelectItem value="closed">Closed Applications</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {selectedScholarships.length > 0 && (
                    <Button 
                      variant="destructive" 
                      onClick={removeSelectedScholarships}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Selected ({selectedScholarships.length})
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Scholarships List */}
            <div className="space-y-4">
              {filteredScholarships.length === 0 ? (
                <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No scholarships found</h3>
                    <p className="text-muted-foreground mb-4">
                      {scholarshipFilterBy === 'all' 
                        ? "You haven't saved any scholarships yet. Start exploring opportunities!"
                        : `No scholarships match the current filter: ${scholarshipFilterBy}`
                      }
                    </p>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Link href="/student/scholarships">
                        <Award className="w-4 h-4 mr-2" />
                        Browse Scholarships
                      </Link>
                    </Button>
                  </div>
                </Card>
              ) : (
                filteredScholarships.map((scholarship) => (
                  <Card key={scholarship.id} className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedScholarships.includes(scholarship.id)}
                          onChange={() => toggleScholarshipSelection(scholarship.id)}
                          className="mt-2 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-semibold text-foreground">{scholarship.title}</h3>
                              {getStatusBadge(scholarship.status, scholarship.deadline)}
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {scholarship.matchScore}% match
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeScholarship(scholarship.id)}
                              className="text-muted-foreground hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground mb-3">
                            <Building2 className="w-4 h-4" />
                            <span>{scholarship.organization}</span>
                            <span className="text-muted-foreground">•</span>
                            <Badge variant="secondary" className="text-xs">{scholarship.type}</Badge>
                          </div>

                          <p className="text-muted-foreground mb-4">{scholarship.description}</p>

                          <div className="grid md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="font-medium text-foreground">{scholarship.amount}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-red-600" />
                              <div>
                                <p className="text-sm text-muted-foreground">Deadline</p>
                                <p className="font-medium text-foreground">{new Date(scholarship.deadline).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-purple-600" />
                              <div>
                                <p className="text-sm text-muted-foreground">Location</p>
                                <p className="font-medium text-foreground">{scholarship.location}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-sm text-muted-foreground">Applicants</p>
                                <p className="font-medium text-foreground">{scholarship.applicants}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium text-foreground">{scholarship.rating}</span>
                                <span className="text-sm text-muted-foreground">({scholarship.reviews} reviews)</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                Saved on {new Date(scholarship.savedDate).toLocaleDateString()}
                              </span>
                            </div>
                            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                              <Link href={`/student/scholarship/${scholarship.id}`}>
                                View Details
                                <ExternalLink className="w-4 h-4 ml-2" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Card */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Keep Exploring</h3>
            <p className="text-muted-foreground mb-4">
              Continue discovering programs and scholarships that match your goals and interests.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button asChild variant="outline" className="backdrop-blur-sm bg-white/50 border-white/30">
                <Link href="/student/search">
                  <Search className="w-4 h-4 mr-2" />
                  Find More Programs
                </Link>
              </Button>
              <Button asChild variant="outline" className="backdrop-blur-sm bg-white/50 border-white/30">
                <Link href="/student/scholarships">
                  <Award className="w-4 h-4 mr-2" />
                  Find More Scholarships
                </Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/student/help">
                  Get Help
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
