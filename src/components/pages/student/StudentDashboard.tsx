import React from 'react';
import StudentLayout from '../../layout/StudentLayout';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import {
  BookOpen,
  Target,
  Clock,
  TrendingUp,
  Star,
  ArrowRight,
  MapPin,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const recentRecommendations = [
    {
      id: 1,
      title: 'Computer Science BSc',
      university: 'University of Technology',
      location: 'London, UK',
      matchPercentage: 95,
      deadline: '2024-03-15',
      type: 'Bachelor'
    },
    {
      id: 2,
      title: 'Software Engineering',
      university: 'Tech Institute',
      location: 'Manchester, UK',
      matchPercentage: 88,
      deadline: '2024-02-28',
      type: 'Bachelor'
    },
    {
      id: 3,
      title: 'Data Science MSc',
      university: 'Research University',
      location: 'Edinburgh, UK',
      matchPercentage: 92,
      deadline: '2024-04-01',
      type: 'Master'
    }
  ];

  const savedPrograms = [
    { title: 'AI & Machine Learning', university: 'Cambridge University', saved: '2 days ago' },
    { title: 'Cybersecurity BSc', university: 'Imperial College', saved: '1 week ago' },
    { title: 'Web Development', university: 'King\'s College', saved: '2 weeks ago' }
  ];

  return (
    <StudentLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome back, John! 👋
          </h2>
          <p className="text-gray-600 mb-6">
            Your personalized education recommendations are ready. Let's continue your journey to find the perfect program.
          </p>
          <div className="flex gap-4">
            <Link to="/student/recommendations">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                View New Recommendations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/student/search">
              <Button variant="outline" className="backdrop-blur-sm bg-white/50">
                Explore Programs
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6 backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Profile Completion</p>
                <p className="text-2xl font-semibold text-gray-900">85%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Progress value={85} className="mt-3" />
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Programs Viewed</p>
                <p className="text-2xl font-semibold text-gray-900">24</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12 this week
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Saved Programs</p>
                <p className="text-2xl font-semibold text-gray-900">8</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Ready to apply</p>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Days Until Deadline</p>
                <p className="text-2xl font-semibold text-gray-900">23</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-orange-600 mt-2">Next deadline approaching</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Recommendations */}
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Latest Recommendations</h3>
                <Link to="/student/recommendations">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentRecommendations.map((program) => (
                  <div key={program.id} className="flex items-start gap-4 p-4 rounded-lg bg-white/30 backdrop-blur-sm border border-white/20">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{program.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {program.matchPercentage}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{program.university}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {program.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Deadline: {new Date(program.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Link to={`/student/program/${program.id}`}>
                      <Button size="sm" variant="outline" className="backdrop-blur-sm bg-white/50">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Saved Programs */}
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Saved Programs</h3>
                <Link to="/student/saved">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {savedPrograms.map((program, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-white/30 backdrop-blur-sm border border-white/20">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{program.title}</h4>
                      <p className="text-sm text-gray-600">{program.university}</p>
                      <p className="text-xs text-gray-500">Saved {program.saved}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                      <Star className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/student/profile">
              <Button variant="outline" className="w-full justify-start backdrop-blur-sm bg-white/50">
                <Target className="w-4 h-4 mr-2" />
                Complete Profile
              </Button>
            </Link>
            <Link to="/student/search">
              <Button variant="outline" className="w-full justify-start backdrop-blur-sm bg-white/50">
                <BookOpen className="w-4 h-4 mr-2" />
                Search Programs
              </Button>
            </Link>
            <Link to="/student/help">
              <Button variant="outline" className="w-full justify-start backdrop-blur-sm bg-white/50">
                <Star className="w-4 h-4 mr-2" />
                Get Help
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}