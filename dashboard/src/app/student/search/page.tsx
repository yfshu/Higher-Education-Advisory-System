"use client";

import { useState } from "react";
import Link from "next/link";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  MapPin,
  GraduationCap,
  Clock,
  Star,
  Heart,
  Calendar,
  BookOpen,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";

export default function SearchPrograms() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    programType: '',
    field: '',
    duration: '',
    tuitionRange: [0, 5000],
    startDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const programs = [
    {
      id: 1,
      title: 'Computer Science',
      university: 'University of Malaya',
      location: 'Kuala Lumpur, Malaysia',
      type: 'Bachelor',
      field: 'Computer Science & IT',
      duration: '4 years',
      tuitionFee: 3500,
      startDate: 'July 2024',
      deadline: '2024-03-15',
      rating: 4.8,
      reviews: 456,
      description: 'Comprehensive computer science program with focus on software engineering, AI, and industry partnerships.',
      tags: ['Programming', 'AI', 'Software Engineering', 'Industry Partners'],
      saved: false
    },
    {
      id: 2,
      title: 'Information Technology',
      university: 'Universiti Teknologi Malaysia',
      location: 'Johor Bahru, Malaysia',
      type: 'Bachelor',
      field: 'Computer Science & IT',
      duration: '4 years',
      tuitionFee: 3200,
      startDate: 'July 2024',
      deadline: '2024-04-01',
      rating: 4.7,
      reviews: 389,
      description: 'Modern IT program with specializations in networking, cybersecurity, and web development.',
      tags: ['Networking', 'Cybersecurity', 'Web Development', 'Database'],
      saved: true
    },
    {
      id: 3,
      title: 'Business Administration',
      university: 'Universiti Kebangsaan Malaysia',
      location: 'Bangi, Malaysia',
      type: 'Bachelor',
      field: 'Business & Management',
      duration: '3 years',
      tuitionFee: 2800,
      startDate: 'July 2024',
      deadline: '2024-02-15',
      rating: 4.5,
      reviews: 523,
      description: 'Comprehensive business program focusing on ASEAN markets and digital transformation.',
      tags: ['Management', 'Marketing', 'ASEAN Business', 'Digital'],
      saved: false
    },
    {
      id: 4,
      title: 'Engineering (Mechanical)',
      university: 'Universiti Putra Malaysia',
      location: 'Serdang, Malaysia',
      type: 'Bachelor',
      field: 'Engineering',
      duration: '4 years',
      tuitionFee: 3100,
      startDate: 'July 2024',
      deadline: '2024-01-31',
      rating: 4.6,
      reviews: 234,
      description: 'Industry-focused mechanical engineering with automotive and manufacturing specializations.',
      tags: ['Automotive', 'Manufacturing', 'CAD/CAM', 'Industry 4.0'],
      saved: false
    },
    {
      id: 5,
      title: 'Medicine',
      university: 'Universiti Malaya',
      location: 'Kuala Lumpur, Malaysia',
      type: 'Bachelor',
      field: 'Medicine & Health Sciences',
      duration: '5 years',
      tuitionFee: 4500,
      startDate: 'July 2024',
      deadline: '2024-10-15',
      rating: 4.9,
      reviews: 178,
      description: 'Premier medical program with clinical rotations at leading Malaysian hospitals.',
      tags: ['Clinical Medicine', 'Research', 'Hospital Training', 'Community Health'],
      saved: false
    },
    {
      id: 6,
      title: 'Mass Communication',
      university: 'Universiti Teknologi MARA',
      location: 'Shah Alam, Malaysia',
      type: 'Bachelor',
      field: 'Mass Communication',
      duration: '3 years',
      tuitionFee: 2600,
      startDate: 'July 2024',
      deadline: '2024-11-30',
      rating: 4.4,
      reviews: 267,
      description: 'Modern mass communication program with digital media and broadcast journalism focus.',
      tags: ['Digital Media', 'Journalism', 'Broadcasting', 'Social Media'],
      saved: false
    },
    {
      id: 7,
      title: 'Accounting',
      university: 'Universiti Utara Malaysia',
      location: 'Kedah, Malaysia',
      type: 'Bachelor',
      field: 'Accounting & Finance',
      duration: '3 years',
      tuitionFee: 2700,
      startDate: 'July 2024',
      deadline: '2024-03-30',
      rating: 4.3,
      reviews: 345,
      description: 'Professional accounting program with ACCA and CPA pathway recognition.',
      tags: ['ACCA', 'CPA', 'Auditing', 'Financial Analysis'],
      saved: false
    },
    {
      id: 8,
      title: 'Architecture',
      university: 'Universiti Teknologi Malaysia',
      location: 'Johor Bahru, Malaysia',
      type: 'Bachelor',
      field: 'Architecture & Built Environment',
      duration: '5 years',
      tuitionFee: 3800,
      startDate: 'July 2024',
      deadline: '2024-02-28',
      rating: 4.7,
      reviews: 198,
      description: 'Comprehensive architecture program with sustainable design and urban planning focus.',
      tags: ['Sustainable Design', 'Urban Planning', 'CAD', 'Green Building'],
      saved: false
    }
  ];

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.field.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !filters.location || program.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesType = !filters.programType || program.type === filters.programType;
    const matchesField = !filters.field || program.field === filters.field;
    const matchesTuition = program.tuitionFee >= filters.tuitionRange[0] && program.tuitionFee <= filters.tuitionRange[1];

    return matchesSearch && matchesLocation && matchesType && matchesField && matchesTuition;
  });

  const resetFilters = () => {
    setFilters({
      location: '',
      programType: '',
      field: '',
      duration: '',
      tuitionRange: [0, 5000],
      startDate: ''
    });
  };

  return (
    <StudentLayout title="Search Programs">
      <div className="space-y-6">
        {/* Search Header */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Find Your Perfect Malaysian University Program
          </h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search Malaysian programs, universities, or fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="backdrop-blur-sm bg-white/50"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Filter Programs</h3>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Clear All
                </Button>
              </div>
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={filters.location} onValueChange={(value) => setFilters({...filters, location: value})}>
                    <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                      <SelectValue placeholder="Any location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Location</SelectItem>
                      <SelectItem value="kuala lumpur">Kuala Lumpur</SelectItem>
                      <SelectItem value="johor">Johor</SelectItem>
                      <SelectItem value="penang">Penang</SelectItem>
                      <SelectItem value="selangor">Selangor</SelectItem>
                      <SelectItem value="perak">Perak</SelectItem>
                      <SelectItem value="kedah">Kedah</SelectItem>
                      <SelectItem value="pahang">Pahang</SelectItem>
                      <SelectItem value="sabah">Sabah</SelectItem>
                      <SelectItem value="sarawak">Sarawak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Program Type</Label>
                  <Select value={filters.programType} onValueChange={(value) => setFilters({...filters, programType: value})}>
                    <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Type</SelectItem>
                      <SelectItem value="Foundation">Foundation</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Bachelor">Bachelor</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Field of Study</Label>
                  <Select value={filters.field} onValueChange={(value) => setFilters({...filters, field: value})}>
                    <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                      <SelectValue placeholder="Any field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Field</SelectItem>
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

                <div className="space-y-2 md:col-span-2">
                  <Label>Tuition Fee Range (RM/semester)</Label>
                  <div className="px-3">
                    <Slider
                      value={filters.tuitionRange}
                      onValueChange={(value) => setFilters({...filters, tuitionRange: value})}
                      max={5000}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>RM {filters.tuitionRange[0].toLocaleString()}</span>
                      <span>RM {filters.tuitionRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Found {filteredPrograms.length} programs matching your criteria
          </p>
          <Select defaultValue="relevance">
            <SelectTrigger className="w-48 backdrop-blur-sm bg-white/50 border-white/30">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="tuition-low">Lowest Tuition</SelectItem>
              <SelectItem value="tuition-high">Highest Tuition</SelectItem>
              <SelectItem value="deadline">Application Deadline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Programs Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredPrograms.map((program) => (
            <Card key={program.id} className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{program.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {program.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {program.university}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {program.location}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className={program.saved ? 'text-red-600' : 'text-muted-foreground'}>
                    <Heart className={`w-5 h-5 ${program.saved ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                {/* Rating and Reviews */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium text-foreground">{program.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({program.reviews} reviews)</span>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-sm mb-4">{program.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {program.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Program Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium text-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {program.duration}
                    </p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Tuition Fee</p>
                    <p className="font-medium text-foreground">RM {program.tuitionFee.toLocaleString()}/semester</p>
                  </div>
                </div>

                {/* Start Date and Deadline */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>Starts: {program.startDate}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Apply by: {new Date(program.deadline).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/student/program/${program.id}`} className="flex-1">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Button variant="outline" className="backdrop-blur-sm bg-white/50">
                    Compare
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {filteredPrograms.length > 0 && (
          <div className="text-center">
            <Button variant="outline" className="backdrop-blur-sm bg-white/50">
              Load More Programs
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredPrograms.length === 0 && (
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg text-center p-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No programs found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters to find more programs.
            </p>
            <Button onClick={resetFilters} variant="outline" className="backdrop-blur-sm bg-white/50">
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
