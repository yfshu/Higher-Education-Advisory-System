import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  GraduationCap,
  BookOpen,
  Users,
  Target,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="backdrop-blur-xl bg-white/30 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-800">EduAdvisor</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
                  Student Login
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
                  Admin Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <span className="block text-blue-600">Higher Education Path</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get personalized university program recommendations powered by AI. 
            Discover programs that match your academic background, interests, and career goals.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8">
                I Have an Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Why Choose EduAdvisor?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform combines advanced AI technology with comprehensive program data 
              to provide you with the most relevant educational opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 backdrop-blur-xl bg-white/40 border-white/20 shadow-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Personalized Recommendations
              </h3>
              <p className="text-gray-600">
                Our AI analyzes your academic background, interests, and preferences 
                to suggest programs that align with your goals.
              </p>
            </Card>

            <Card className="p-6 backdrop-blur-xl bg-white/40 border-white/20 shadow-xl">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Comprehensive Database
              </h3>
              <p className="text-gray-600">
                Access detailed information about thousands of programs from 
                universities worldwide, including requirements and career outcomes.
              </p>
            </Card>

            <Card className="p-6 backdrop-blur-xl bg-white/40 border-white/20 shadow-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Expert Guidance
              </h3>
              <p className="text-gray-600">
                Get insights from education experts and connect with advisors 
                who can help you make informed decisions about your future.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Getting started with your education journey is simple and straightforward.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Create Profile',
                description: 'Sign up and complete your academic profile with your background and interests.'
              },
              {
                step: '2',
                title: 'Get Recommendations',
                description: 'Our AI analyzes your profile and generates personalized program suggestions.'
              },
              {
                step: '3',
                title: 'Explore Programs',
                description: 'Browse detailed program information, requirements, and university details.'
              },
              {
                step: '4',
                title: 'Make Decisions',
                description: 'Save your favorite programs and get guidance for your application process.'
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-semibold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Ready to Discover Your Future?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students who have found their perfect educational path with EduAdvisor.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-12">
              Start Free Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="backdrop-blur-xl bg-white/30 border-t border-white/20 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-800">EduAdvisor</span>
          </div>
          <div className="text-center text-gray-600">
            <p>&copy; 2024 EduAdvisor. Empowering students to make informed educational decisions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}