import React from 'react';
import StudentLayout from '../../layout/StudentLayout';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Heart, MapPin, Calendar, GraduationCap, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SavedPrograms() {
  const savedPrograms = [
    {
      id: 1,
      title: 'Computer Science BSc',
      university: 'University of Technology London',
      location: 'London, UK',
      type: 'Bachelor',
      savedDate: '2024-01-15',
      deadline: '2024-03-15',
      matchPercentage: 95
    },
    {
      id: 2,
      title: 'Data Science MSc',
      university: 'Edinburgh Research University',
      location: 'Edinburgh, UK',
      type: 'Master',
      savedDate: '2024-01-12',
      deadline: '2024-04-01',
      matchPercentage: 92
    }
  ];

  return (
    <StudentLayout title="Saved Programs">
      <div className="space-y-6">
        <div className="backdrop-blur-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Your Saved Programs
          </h2>
          <p className="text-gray-600">
            Keep track of programs you're interested in and compare them later.
          </p>
        </div>

        <div className="space-y-4">
          {savedPrograms.map((program) => (
            <Card key={program.id} className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{program.title}</h3>
                      <Badge className="bg-green-500/20 text-green-700">
                        {program.matchPercentage}% Match
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
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Saved on {new Date(program.savedDate).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Deadline: {new Date(program.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/student/program/${program.id}`}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}