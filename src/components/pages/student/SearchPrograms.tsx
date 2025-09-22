import React, { useState } from 'react';
import StudentLayout from '../../layout/StudentLayout';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Slider } from '../../ui/slider';
import {
  Search,
  Filter,
  MapPin,
  GraduationCap,
  Clock,
  Star,
  Heart,
  Calendar,
  BookOpen,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SearchPrograms() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    programType: '',
    field: '',
    duration: '',
    tuitionRange: [0, 50000],
    startDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const programs = [
    {
      id: 1,
      title: 'Computer Science BSc',
      university: 'University of Technology London',
      location: 'London, UK',
      type: 'Bachelor',
      field: 'Technology',
      duration: '3 years',
      tuitionFee: 9250,
      startDate: 'September 2024',
      deadline: '2024-03-15',
      rating: 4.8,
      reviews: 156,
      description: 'Comprehensive computer science program with focus on software engineering and AI.',
      tags: ['Programming', 'AI', 'Software Engineering'],
      saved: false
    },
    {
      id: 2,
      title: 'Data Science MSc',
      university: 'Edinburgh Research University',
      location: 'Edinburgh, UK',
      type: 'Master',
      field: 'Technology',
      duration: '1 year',
      tuitionFee: 22000,
      startDate: 'September 2024',
      deadline: '2024-04-01',
      rating: 4.9,
      reviews: 98,
      description: 'Advanced data science program with hands-on experience in machine learning.',
      tags: ['Machine Learning', 'Statistics', 'Big Data'],
      saved: true
    },
    {
      id: 3,
      title: 'Business Administration MBA',
      university: 'London Business School',
      location: 'London, UK',
      type: 'Master',
      field: 'Business',
      duration: '2 years',
      tuitionFee: 45000,
      startDate: 'September 2024',
      deadline: '2024-02-15',
      rating: 4.7,
      reviews: 234,
      description: 'World-class MBA program with global perspective and industry connections.',
      tags: ['Leadership', 'Strategy', 'Finance'],
      saved: false
    },
    {
      id: 4,
      title: 'Mechanical Engineering BEng',
      university: 'Imperial College London',
      location: 'London, UK',
      type: 'Bachelor',
      field: 'Engineering',
      duration: '4 years',
      tuitionFee: 12500,
      startDate: 'September 2024',
      deadline: '2024-01-31',
      rating: 4.6,
      reviews: 189,
      description: 'Prestigious engineering program with state-of-the-art facilities.',
      tags: ['Design', 'Manufacturing', 'Innovation'],
      saved: false
    },
    {
      id: 5,
      title: 'Psychology BSc',
      university: 'University of Cambridge',
      location: 'Cambridge, UK',
      type: 'Bachelor',
      field: 'Science',
      duration: '3 years',
      tuitionFee: 11500,
      startDate: 'October 2024',
      deadline: '2024-10-15',
      rating: 4.8,
      reviews: 145,
      description: 'Research-intensive psychology program with clinical and experimental tracks.',
      tags: ['Research', 'Clinical', 'Behavioral Science'],
      saved: false
    },
    {
      id: 6,
      title: 'Digital Marketing MA',
      university: 'Manchester Digital Institute',
      location: 'Manchester, UK',
      type: 'Master',
      field: 'Business',
      duration: '1 year',
      tuitionFee: 18000,
      startDate: 'January 2025',
      deadline: '2024-11-30',
      rating: 4.5,
      reviews: 87,
      description: 'Contemporary marketing program focused on digital strategies and analytics.',
      tags: ['Digital Strategy', 'Analytics', 'Social Media'],
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
      tuitionRange: [0, 50000],
      startDate: ''
    });
  };

  return (
    <StudentLayout title="Search Programs">
      <div className="space-y-6">
        {/* Search Header */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Find Your Perfect Program
          </h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search programs, universities, or fields..."
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
                <h3 className="font-semibold text-gray-900">Filter Programs</h3>
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
                      <SelectItem value="london">London</SelectItem>
                      <SelectItem value="edinburgh">Edinburgh</SelectItem>
                      <SelectItem value="manchester">Manchester</SelectItem>
                      <SelectItem value="cambridge">Cambridge</SelectItem>
                      <SelectItem value="oxford">Oxford</SelectItem>
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
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Arts">Arts & Humanities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Tuition Fee Range (£/year)</Label>
                  <div className="px-3">
                    <Slider
                      value={filters.tuitionRange}
                      onValueChange={(value) => setFilters({...filters, tuitionRange: value})}
                      max={50000}
                      step={1000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>£{filters.tuitionRange[0].toLocaleString()}</span>
                      <span>£{filters.tuitionRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
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
                      <h3 className="font-semibold text-gray-900">{program.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {program.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
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
                  <Button variant="ghost" size="sm" className={program.saved ? 'text-red-600' : 'text-gray-400'}>
                    <Heart className={`w-5 h-5 ${program.saved ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                {/* Rating and Reviews */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium text-gray-900">{program.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">({program.reviews} reviews)</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">{program.description}</p>

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
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {program.duration}
                    </p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Tuition Fee</p>
                    <p className="font-medium text-gray-900">£{program.tuitionFee.toLocaleString()}/year</p>
                  </div>
                </div>

                {/* Start Date and Deadline */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>Starts: {program.startDate}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Apply by: {new Date(program.deadline).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link to={`/student/program/${program.id}`} className="flex-1">
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
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No programs found</h3>
            <p className="text-gray-600 mb-4">
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