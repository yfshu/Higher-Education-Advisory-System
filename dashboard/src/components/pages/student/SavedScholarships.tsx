import React, { useState } from 'react';
import StudentLayout from '../../layout/StudentLayout';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  BookmarkCheck,
  Star,
  Calendar,
  MapPin,
  DollarSign,
  Building2,
  Users,
  ExternalLink,
  Trash2,
  Filter,
  SortAsc,
  Heart,
  AlertCircle,
  CheckCircle,
  GraduationCap
} from 'lucide-react';

export default function SavedScholarships() {
  const [sortBy, setSortBy] = useState('deadline');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedScholarships, setSelectedScholarships] = useState<string[]>([]);

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
    },
    {
      id: '8',
      title: 'YTL Foundation Scholarship',
      organization: 'YTL Foundation',
      type: 'Need-based',
      amount: 'RM 60,000 - RM 100,000',
      level: 'Bachelor\'s Degree',
      field: 'Multiple Fields',
      location: 'Malaysia',
      deadline: '2024-01-25',
      applicants: '1,200+',
      description: 'Need-based scholarship supporting underprivileged students with academic excellence.',
      rating: 4.5,
      reviews: 89,
      status: 'closed',
      savedDate: '2024-01-05',
      matchScore: 78
    },
    {
      id: '9',
      title: 'Shell Malaysia Scholarship',
      organization: 'Shell Malaysia',
      type: 'Merit-based',
      amount: 'Full Coverage',
      level: 'Bachelor\'s Degree',
      field: 'Science & Engineering',
      location: 'Local & Overseas',
      deadline: '2024-05-15',
      applicants: '1,800+',
      description: 'Comprehensive scholarship for science and engineering students with industry exposure.',
      rating: 4.7,
      reviews: 156,
      status: 'upcoming',
      savedDate: '2024-01-15',
      matchScore: 89
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
    // In real app, this would remove from saved scholarships
    console.log('Removing scholarship:', scholarshipId);
  };

  const removeSelectedScholarships = () => {
    selectedScholarships.forEach(id => removeScholarship(id));
    setSelectedScholarships([]);
  };

  const getStatusBadge = (status: string, deadline: string) => {
    const daysUntilDeadline = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (status === 'closed' || daysUntilDeadline < 0) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Closed</Badge>;
    } else if (daysUntilDeadline <= 7) {
      return <Badge variant="destructive">Urgent - {daysUntilDeadline} days left</Badge>;
    } else if (daysUntilDeadline <= 30) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-600">Due Soon</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-green-100 text-green-600">Open</Badge>;
    }
  };

  const sortedScholarships = [...savedScholarships].sort((a, b) => {
    switch (sortBy) {
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
    if (filterBy === 'all') return true;
    if (filterBy === 'urgent') {
      const daysUntilDeadline = Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
    }
    if (filterBy === 'open') {
      const daysUntilDeadline = Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline > 0;
    }
    if (filterBy === 'closed') {
      const daysUntilDeadline = Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline < 0;
    }
    return true;
  });

  return (
    <StudentLayout title="Saved Scholarships">
      <div className="space-y-6">
        {/* Header */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <BookmarkCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Saved Scholarships</h1>
                  <p className="text-gray-600">Manage your bookmarked scholarship opportunities</p>
                </div>
              </div>
              <Link to="/student/scholarships">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Heart className="w-4 h-4 mr-2" />
                  Find More Scholarships
                </Button>
              </Link>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4 text-gray-500" />
                  <Select value={sortBy} onValueChange={setSortBy}>
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
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Select value={filterBy} onValueChange={setFilterBy}>
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

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-4">
            <div className="flex items-center gap-3">
              <BookmarkCheck className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-semibold text-gray-900">{savedScholarships.length}</p>
                <p className="text-sm text-gray-600">Total Saved</p>
              </div>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {savedScholarships.filter(s => {
                    const days = Math.ceil((new Date(s.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return days <= 7 && days >= 0;
                  }).length}
                </p>
                <p className="text-sm text-gray-600">Urgent Deadlines</p>
              </div>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {savedScholarships.filter(s => {
                    const days = Math.ceil((new Date(s.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return days > 0;
                  }).length}
                </p>
                <p className="text-sm text-gray-600">Still Open</p>
              </div>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(savedScholarships.reduce((acc, s) => acc + s.matchScore, 0) / savedScholarships.length)}%
                </p>
                <p className="text-sm text-gray-600">Avg Match Score</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Scholarship List */}
        <div className="space-y-4">
          {filteredScholarships.length === 0 ? (
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scholarships found</h3>
                <p className="text-gray-600 mb-4">
                  {filterBy === 'all' 
                    ? "You haven't saved any scholarships yet. Start exploring opportunities!"
                    : `No scholarships match the current filter: ${filterBy}`
                  }
                </p>
                <Link to="/student/scholarships">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Browse Scholarships
                  </Button>
                </Link>
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
                          <h3 className="text-xl font-semibold text-gray-900">{scholarship.title}</h3>
                          {getStatusBadge(scholarship.status, scholarship.deadline)}
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {scholarship.matchScore}% match
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeScholarship(scholarship.id)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <Building2 className="w-4 h-4" />
                        <span>{scholarship.organization}</span>
                        <span className="text-gray-400">•</span>
                        <Badge variant="secondary" className="text-xs">{scholarship.type}</Badge>
                      </div>

                      <p className="text-gray-700 mb-4">{scholarship.description}</p>

                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-500">Amount</p>
                            <p className="font-medium text-gray-900">{scholarship.amount}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-red-600" />
                          <div>
                            <p className="text-sm text-gray-500">Deadline</p>
                            <p className="font-medium text-gray-900">{new Date(scholarship.deadline).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium text-gray-900">{scholarship.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-500">Applicants</p>
                            <p className="font-medium text-gray-900">{scholarship.applicants}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-gray-900">{scholarship.rating}</span>
                            <span className="text-sm text-gray-500">({scholarship.reviews} reviews)</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            Saved on {new Date(scholarship.savedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <Link to={`/student/scholarship/${scholarship.id}`}>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            View Details
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Action Card */}
        {filteredScholarships.length > 0 && (
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Apply?</h3>
              <p className="text-gray-600 mb-4">
                Don't wait too long! Some scholarships have competitive deadlines.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link to="/student/scholarships">
                  <Button variant="outline" className="backdrop-blur-sm bg-white/50 border-white/30">
                    Find More Scholarships
                  </Button>
                </Link>
                <Link to="/student/help">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Get Application Help
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}