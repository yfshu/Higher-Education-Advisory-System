import React from 'react';
import StudentLayout from '../../layout/StudentLayout';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { History, Calendar, Eye, TrendingUp } from 'lucide-react';

export default function RecommendationHistory() {
  const recommendations = [
    {
      date: '2024-01-15',
      count: 5,
      topMatch: 'Computer Science BSc - 95%',
      status: 'viewed'
    },
    {
      date: '2024-01-10',
      count: 8,
      topMatch: 'Data Science MSc - 92%',
      status: 'partially_viewed'
    }
  ];

  return (
    <StudentLayout title="Recommendation History">
      <div className="space-y-6">
        <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <History className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recommendation History</h2>
              <p className="text-gray-600">Track your AI recommendations over time</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <Card key={index} className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {new Date(rec.date).toLocaleDateString()}
                      </span>
                      <Badge variant="secondary">{rec.count} programs</Badge>
                    </div>
                    <p className="text-gray-600">Top match: {rec.topMatch}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}