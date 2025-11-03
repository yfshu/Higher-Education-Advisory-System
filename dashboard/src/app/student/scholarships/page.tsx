"use client";

import { useState } from "react";
import Link from "next/link";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Star,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  GraduationCap,
  Building2,
  ExternalLink,
  Bookmark,
  BookmarkCheck
} from "lucide-react";

export default function ScholarshipSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    level: 'all',
    field: 'all',
    amount: 'all',
    organization: 'all',
    location: 'all'
  });
  const [savedScholarships, setSavedScholarships] = useState<string[]>(['1', '3', '5']);

  const scholarshipTypes = [
    'Merit-based',
    'Need-based',
    'Athletic',
    'Academic Excellence',
    'Leadership',
    'Community Service',
    'Research',
    'Minority',
    'International Students'
  ];

  const educationLevels = [
    'Foundation',
    'Diploma', 
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD'
  ];

  const fieldOptions = [
    'Computer Science & IT',
    'Engineering', 
    'Medicine & Health Sciences',
    'Business & Management',
    'Pure Sciences',
    'Arts & Humanities',
    'Social Sciences',
    'Education',
    'Law',
    'Architecture & Built Environment'
  ];

  const scholarships = [
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
      reviews: 124
    },
    {
      id: '2', 
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
      reviews: 203
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
      reviews: 67
    }
  ];

  const toggleSaveScholarship = (scholarshipId: string) => {
    setSavedScholarships(prev => 
      prev.includes(scholarshipId) 
        ? prev.filter(id => id !== scholarshipId)
        : [...prev, scholarshipId]
    );
  };

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = scholarship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scholarship.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scholarship.field.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filters.type === 'all' || scholarship.type === filters.type;
    const matchesLevel = filters.level === 'all' || scholarship.level === filters.level;
    const matchesField = filters.field === 'all' || scholarship.field.includes(filters.field);
    
    return matchesSearch && matchesType && matchesLevel && matchesField;
  });

  return (
    <StudentLayout title="Scholarship Search">
      <div className="space-y-6">
        {/* Search Header */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Scholarship Opportunities</h1>
                <p className="text-muted-foreground">Discover funding opportunities from Malaysian organizations</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search scholarships, organizations, or fields..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Filters */}
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                  <SelectValue placeholder="Scholarship Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {scholarshipTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.level} onValueChange={(value) => setFilters({...filters, level: value})}>
                <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                  <SelectValue placeholder="Education Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {educationLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.field} onValueChange={(value) => setFilters({...filters, field: value})}>
                <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                  <SelectValue placeholder="Field of Study" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  {fieldOptions.map(field => (
                    <SelectItem key={field} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.amount} onValueChange={(value) => setFilters({...filters, amount: value})}>
                <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                  <SelectValue placeholder="Amount Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Amount</SelectItem>
                  <SelectItem value="partial">Partial Coverage</SelectItem>
                  <SelectItem value="full">Full Coverage</SelectItem>
                  <SelectItem value="50k">Up to RM 50,000</SelectItem>
                  <SelectItem value="100k">Up to RM 100,000</SelectItem>
                  <SelectItem value="150k">RM 100,000+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.location} onValueChange={(value) => setFilters({...filters, location: value})}>
                <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                  <SelectValue placeholder="Study Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Location</SelectItem>
                  <SelectItem value="local">Malaysia Only</SelectItem>
                  <SelectItem value="overseas">Overseas Only</SelectItem>
                  <SelectItem value="both">Local & Overseas</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => setFilters({type: 'all', level: 'all', field: 'all', amount: 'all', organization: 'all', location: 'all'})}
                className="backdrop-blur-sm bg-white/50 border-white/30"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredScholarships.length} scholarship{filteredScholarships.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
          <Button asChild variant="outline" className="backdrop-blur-sm bg-white/50 border-white/30">
            <Link href="/student/saved">
              <Bookmark className="w-4 h-4 mr-2" />
              Saved ({savedScholarships.length})
            </Link>
          </Button>
        </div>

        {/* Scholarship Cards */}
        <div className="grid gap-6">
          {filteredScholarships.map((scholarship) => (
            <Card key={scholarship.id} className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">{scholarship.title}</h3>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {scholarship.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Building2 className="w-4 h-4" />
                      <span>{scholarship.organization}</span>
                    </div>
                    <p className="text-muted-foreground mb-4">{scholarship.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSaveScholarship(scholarship.id)}
                    className="text-muted-foreground hover:text-yellow-600"
                  >
                    {savedScholarships.includes(scholarship.id) ? (
                      <BookmarkCheck className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium text-foreground">{scholarship.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Level</p>
                      <p className="font-medium text-foreground">{scholarship.level}</p>
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
                    <Calendar className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-medium text-foreground">{new Date(scholarship.deadline).toLocaleDateString()}</p>
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
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{scholarship.applicants} applicants</span>
                    </div>
                  </div>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href={`/student/scholarship/${scholarship.id}`}>
                      View Details
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredScholarships.length === 0 && (
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No scholarships found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters to find more opportunities.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setFilters({type: 'all', level: 'all', field: 'all', amount: 'all', organization: 'all', location: 'all'});
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Clear All Filters
              </Button>
            </div>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
