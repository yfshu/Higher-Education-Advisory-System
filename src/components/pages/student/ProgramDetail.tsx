import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import StudentLayout from '../../layout/StudentLayout';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Progress } from '../../ui/progress';
import {
  Star,
  MapPin,
  Calendar,
  GraduationCap,
  Clock,
  Heart,
  Share2,
  CheckCircle,
  AlertCircle,
  Users,
  Book,
  Award,
  Globe,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';

export default function ProgramDetail() {
  const { id } = useParams();
  const [saved, setSaved] = useState(false);

  // Mock program data - in real app, this would be fetched based on ID
  const program = {
    id: 1,
    title: 'Computer Science BSc',
    university: 'University of Technology London',
    location: 'London, UK',
    type: 'Bachelor',
    duration: '3 years',
    tuitionFee: 9250,
    startDate: 'September 2024',
    deadline: '2024-03-15',
    rating: 4.8,
    reviews: 156,
    matchPercentage: 95,
    description: 'Our Computer Science BSc program is designed to provide students with a comprehensive understanding of computer science principles and practical skills. The curriculum covers software engineering, algorithms, artificial intelligence, and data structures.',
    tags: ['Programming', 'AI/ML', 'Software Engineering', 'Data Structures'],
    requirements: {
      academic: 'A-levels: AAB including Mathematics and one science subject',
      english: 'IELTS 6.5 overall with no less than 6.0 in each component',
      experience: 'No prior programming experience required',
      other: 'Personal statement and reference required'
    },
    curriculum: [
      { year: 1, subjects: ['Programming Fundamentals', 'Mathematics for CS', 'Digital Systems', 'Software Engineering Principles'] },
      { year: 2, subjects: ['Data Structures & Algorithms', 'Database Systems', 'Computer Networks', 'Web Development'] },
      { year: 3, subjects: ['Artificial Intelligence', 'Machine Learning', 'Cybersecurity', 'Final Project'] }
    ],
    facilities: [
      'State-of-the-art computer labs',
      '24/7 access to development environments',
      'Industry-standard software licenses',
      'High-performance computing cluster',
      'Modern lecture theatres and seminar rooms'
    ],
    careerOutcomes: [
      { role: 'Software Developer', percentage: 35 },
      { role: 'Data Scientist', percentage: 20 },
      { role: 'Systems Analyst', percentage: 15 },
      { role: 'Product Manager', percentage: 12 },
      { role: 'Research & Development', percentage: 10 },
      { role: 'Other', percentage: 8 }
    ],
    employmentStats: {
      employmentRate: 92,
      averageSalary: 45000,
      graduateSatisfaction: 88
    },
    contact: {
      admissions: '+44 20 7123 4567',
      email: 'admissions@utl.ac.uk',
      website: 'https://www.utl.ac.uk'
    }
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const handleShare = () => {
    navigator.share?.({
      title: program.title,
      text: `Check out this ${program.type} program at ${program.university}`,
      url: window.location.href
    });
  };

  return (
    <StudentLayout title={program.title}>
      <div className="space-y-6">
        {/* Program Header */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">{program.title}</h1>
                  <Badge className="bg-green-500/20 text-green-700 border-green-200/30">
                    {program.matchPercentage}% Match
                  </Badge>
                  <Badge variant="outline">{program.type}</Badge>
                </div>
                
                <div className="flex items-center gap-6 text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    <span className="font-medium">{program.university}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{program.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{program.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-medium text-gray-900">{program.rating}</span>
                    <span className="text-gray-500">({program.reviews} reviews)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {program.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleShare} className="backdrop-blur-sm bg-white/50">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSave}
                  className={`backdrop-blur-sm ${saved ? 'bg-red-50/50 border-red-200/30 text-red-600' : 'bg-white/50'}`}
                >
                  <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">£{program.tuitionFee.toLocaleString()}</p>
                <p className="text-sm text-gray-600">per year</p>
              </div>
              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{program.duration}</p>
                <p className="text-sm text-gray-600">duration</p>
              </div>
              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{program.startDate.split(' ')[0]}</p>
                <p className="text-sm text-gray-600">start date</p>
              </div>
              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(program.deadline).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-gray-600">deadline</p>
              </div>
            </div>

            {/* Apply Button */}
            <div className="text-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                <ExternalLink className="w-5 h-5 mr-2" />
                Apply Now
              </Button>
            </div>
          </div>
        </Card>

        {/* Program Details Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="backdrop-blur-sm bg-white/50 border border-white/20">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="careers">Career Outcomes</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Description</h3>
                <p className="text-gray-700 leading-relaxed mb-6">{program.description}</p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Employment Rate</h4>
                    <p className="text-2xl font-bold text-blue-600">{program.employmentStats.employmentRate}%</p>
                    <p className="text-sm text-gray-600">within 6 months</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Average Salary</h4>
                    <p className="text-2xl font-bold text-green-600">£{program.employmentStats.averageSalary.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">starting salary</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Satisfaction</h4>
                    <p className="text-2xl font-bold text-purple-600">{program.employmentStats.graduateSatisfaction}%</p>
                    <p className="text-sm text-gray-600">graduate satisfaction</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Structure</h3>
                <div className="space-y-6">
                  {program.curriculum.map((year) => (
                    <div key={year.year} className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Book className="w-5 h-5 text-blue-600" />
                        Year {year.year}
                      </h4>
                      <div className="grid md:grid-cols-2 gap-2">
                        {year.subjects.map((subject, index) => (
                          <div key={index} className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>{subject}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Entry Requirements</h3>
                <div className="space-y-4">
                  {Object.entries(program.requirements).map(([key, value]) => (
                    <div key={key} className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1 capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </h4>
                          <p className="text-gray-700">{value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="careers" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Career Paths</h3>
                <div className="space-y-4">
                  {program.careerOutcomes.map((career, index) => (
                    <div key={index} className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{career.role}</span>
                        <span className="text-sm font-medium text-gray-600">{career.percentage}%</span>
                      </div>
                      <Progress value={career.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="facilities" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Facilities & Resources</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {program.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Information */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Get More Information</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{program.contact.admissions}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{program.contact.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Website</p>
                  <p className="font-medium text-blue-600">{program.contact.website}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}