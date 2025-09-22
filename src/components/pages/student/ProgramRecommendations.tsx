import React, { useState } from 'react';
import StudentLayout from '../../layout/StudentLayout';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import {
  Star,
  MapPin,
  Calendar,
  GraduationCap,
  Clock,
  Filter,
  Search,
  Bookmark,
  ExternalLink,
  Heart,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProgramRecommendations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const recommendations = [
    {
      id: 1,
      title: 'Computer Science BSc',
      university: 'University of Technology London',
      location: 'London, UK',
      matchPercentage: 95,
      duration: '3 years',
      tuitionFee: '£9,250/year',
      deadline: '2024-03-15',
      requirements: 'A-levels: AAB including Mathematics',
      description: 'Comprehensive computer science program covering software engineering, algorithms, and artificial intelligence.',
      tags: ['Programming', 'AI/ML', 'Software Engineering'],
      rating: 4.8,
      applicationCount: 234,
      type: 'Bachelor',
      saved: false
    },
    {
      id: 2,
      title: 'Data Science MSc',
      university: 'Edinburgh Research University',
      location: 'Edinburgh, UK',
      matchPercentage: 92,
      duration: '1 year',
      tuitionFee: '£22,000/year',
      deadline: '2024-04-01',
      requirements: 'Bachelor in relevant field with 2:1 or higher',
      description: 'Advanced data science program with focus on machine learning, statistics, and big data analytics.',
      tags: ['Data Analytics', 'Machine Learning', 'Statistics'],
      rating: 4.9,
      applicationCount: 189,
      type: 'Master',
      saved: true
    },
    {
      id: 3,
      title: 'Software Engineering BSc',
      university: 'Manchester Institute of Technology',
      location: 'Manchester, UK',
      matchPercentage: 88,
      duration: '3 years',
      tuitionFee: '£9,250/year',
      deadline: '2024-02-28',
      requirements: 'A-levels: ABB including Mathematics or Computer Science',
      description: 'Practical software engineering program with industry placements and real-world projects.',
      tags: ['Software Development', 'Web Technologies', 'Mobile Apps'],
      rating: 4.6,
      applicationCount: 312,
      type: 'Bachelor',
      saved: false
    },
    {
      id: 4,
      title: 'Artificial Intelligence MSc',
      university: 'Cambridge Advanced Studies',
      location: 'Cambridge, UK',
      matchPercentage: 90,
      duration: '2 years',
      tuitionFee: '£35,000/year',
      deadline: '2024-05-15',
      requirements: 'Bachelor in Computer Science or related field with 1st class honours',
      description: 'Cutting-edge AI program covering deep learning, neural networks, and ethical AI development.',
      tags: ['Artificial Intelligence', 'Deep Learning', 'Research'],
      rating: 4.9,
      applicationCount: 156,
      type: 'Master',
      saved: false
    }
  ];

  const filteredRecommendations = recommendations.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.university.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'bachelor' && program.type === 'Bachelor') ||
                         (selectedFilter === 'master' && program.type === 'Master');
    return matchesSearch && matchesFilter;
  });

  return (
    <StudentLayout title="AI Recommendations">
      <div className="space-y-6">
        {/* Header */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Personalized Recommendations
              </h2>
              <p className="text-gray-600">Based on your profile and preferences</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Our AI has analyzed your academic background, interests, and goals to find the best matching programs. 
            Results are ranked by compatibility score.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search recommendations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('all')}
              size="sm"
            >
              All Programs
            </Button>
            <Button
              variant={selectedFilter === 'bachelor' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('bachelor')}
              size="sm"
            >
              Bachelor
            </Button>
            <Button
              variant={selectedFilter === 'master' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('master')}
              size="sm"
            >
              Master
            </Button>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="space-y-6">
          {filteredRecommendations.map((program) => (
            <Card key={program.id} className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg overflow-hidden">
              <div className="p-6">
                {/* Header with Match Score */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{program.title}</h3>
                      <Badge className="bg-green-500/20 text-green-700 border-green-200/30">
                        {program.matchPercentage}% Match
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {program.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {program.university}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {program.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {program.duration}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      {program.rating} • {program.applicationCount} applications
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={program.saved ? 'text-red-600 hover:text-red-700' : 'text-gray-600 hover:text-red-600'}
                  >
                    {program.saved ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
                  </Button>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4">{program.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {program.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Tuition Fee</p>
                    <p className="font-medium text-gray-900">{program.tuitionFee}</p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Application Deadline</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(program.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Entry Requirements</p>
                    <p className="font-medium text-gray-900 text-sm">{program.requirements}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link to={`/student/program/${program.id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Button variant="outline" className="backdrop-blur-sm bg-white/50">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save Program
                  </Button>
                  <Button variant="outline" className="backdrop-blur-sm bg-white/50">
                    Compare
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {filteredRecommendations.length > 0 && (
          <div className="text-center">
            <Button variant="outline" className="backdrop-blur-sm bg-white/50">
              Load More Recommendations
            </Button>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}