"use client";

import { useState } from "react";
import Link from "next/link";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Star,
  MapPin,
  Calendar,
  GraduationCap,
  Clock,
  Search,
  Bookmark,
  ExternalLink,
  Heart,
  TrendingUp
} from "lucide-react";

export default function ProgramRecommendations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const recommendations = [
    {
      id: 1,
      title: 'Computer Science',
      university: 'University of Malaya',
      location: 'Kuala Lumpur, Malaysia',
      matchPercentage: 95,
      duration: '4 years',
      tuitionFee: 'RM 3,500/semester',
      deadline: '2024-03-15',
      requirements: 'SPM: 5 credits including Mathematics and English OR STPM: CGPA 3.0',
      description: 'Comprehensive computer science program covering software engineering, algorithms, artificial intelligence, and data structures with strong industry connections.',
      tags: ['Programming', 'AI/ML', 'Software Engineering', 'Data Structures'],
      rating: 4.8,
      applicationCount: 456,
      type: 'Bachelor',
      saved: false
    },
    {
      id: 2,
      title: 'Information Technology',
      university: 'Universiti Teknologi Malaysia',
      location: 'Johor Bahru, Malaysia',
      matchPercentage: 92,
      duration: '4 years',
      tuitionFee: 'RM 3,200/semester',
      deadline: '2024-04-01',
      requirements: 'SPM: 5 credits including Mathematics OR STPM: CGPA 2.5',
      description: 'Modern IT program focusing on networking, cybersecurity, web development, and database management with industry internships.',
      tags: ['Networking', 'Cybersecurity', 'Web Development', 'Database'],
      rating: 4.7,
      applicationCount: 389,
      type: 'Bachelor',
      saved: true
    },
    {
      id: 3,
      title: 'Software Engineering',
      university: 'Universiti Putra Malaysia',
      location: 'Serdang, Malaysia',
      matchPercentage: 88,
      duration: '4 years',
      tuitionFee: 'RM 3,100/semester',
      deadline: '2024-02-28',
      requirements: 'SPM: 5 credits including Mathematics and Additional Mathematics OR STPM: CGPA 2.67',
      description: 'Practical software engineering program with emphasis on mobile app development, web technologies, and software project management.',
      tags: ['Mobile Development', 'Web Technologies', 'Project Management', 'Agile'],
      rating: 4.6,
      applicationCount: 312,
      type: 'Bachelor',
      saved: false
    },
    {
      id: 4,
      title: 'Data Science',
      university: 'Universiti Kebangsaan Malaysia',
      location: 'Bangi, Malaysia',
      matchPercentage: 90,
      duration: '4 years',
      tuitionFee: 'RM 3,300/semester',
      deadline: '2024-05-15',
      requirements: 'SPM: 5 credits including Mathematics and Science OR STPM: CGPA 3.0',
      description: 'Cutting-edge data science program covering machine learning, big data analytics, statistical modeling, and business intelligence.',
      tags: ['Machine Learning', 'Big Data', 'Statistics', 'Business Intelligence'],
      rating: 4.9,
      applicationCount: 267,
      type: 'Bachelor',
      saved: false
    },
    {
      id: 5,
      title: 'Business Administration',
      university: 'Universiti Malaya',
      location: 'Kuala Lumpur, Malaysia',
      matchPercentage: 85,
      duration: '3 years',
      tuitionFee: 'RM 2,800/semester',
      deadline: '2024-03-30',
      requirements: 'SPM: 5 credits including Mathematics and English OR STPM: CGPA 2.5',
      description: 'Comprehensive business program covering management, marketing, finance, and entrepreneurship with focus on Malaysian and ASEAN markets.',
      tags: ['Management', 'Marketing', 'Finance', 'Entrepreneurship'],
      rating: 4.5,
      applicationCount: 523,
      type: 'Bachelor',
      saved: false
    },
    {
      id: 6,
      title: 'Engineering (Mechanical)',
      university: 'Universiti Teknologi Petronas',
      location: 'Tronoh, Perak, Malaysia',
      matchPercentage: 87,
      duration: '4 years',
      tuitionFee: 'RM 4,200/semester',
      deadline: '2024-04-15',
      requirements: 'SPM: 5 credits including Mathematics, Additional Mathematics, and Physics OR STPM: CGPA 3.0',
      description: 'Industry-focused mechanical engineering program with specializations in oil & gas, automotive, and manufacturing sectors.',
      tags: ['Oil & Gas', 'Automotive', 'Manufacturing', 'CAD/CAM'],
      rating: 4.8,
      applicationCount: 234,
      type: 'Bachelor',
      saved: false
    }
  ];

  const filteredRecommendations = recommendations.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.university.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'bachelor' && program.type === 'Bachelor') ||
                         (selectedFilter === 'diploma' && program.type === 'Diploma');
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
            Our AI has analyzed your SPM/STPM results, interests, and career goals to find the best matching programs from Malaysian universities. 
            Results are ranked by compatibility score and aligned with local industry demands.
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
              variant={selectedFilter === "bachelor" ? "default" : "outline"}
              onClick={() => setSelectedFilter("bachelor")}
              size="sm"
            >
              Bachelors
            </Button>
            <Button
              variant={selectedFilter === 'diploma' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('diploma')}
              size="sm"
            >
              Diploma
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
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href={`/student/program/${program.id}`}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
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
