import React from 'react';
import { useParams, Link } from 'react-router-dom';
import StudentLayout from '../../layout/StudentLayout';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ScholarshipDetailSimple() {
  const { id } = useParams();

  return (
    <StudentLayout title="Scholarship Details">
      <div className="space-y-6">
        <Link 
          to="/student/scholarships" 
          className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Scholarship Search
        </Link>

        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scholarship Details</h2>
          <p className="text-gray-600 mb-4">
            Viewing scholarship ID: {id}
          </p>
          <p className="text-gray-600">
            This is a simplified scholarship detail page. The full feature is being loaded...
          </p>
        </Card>
      </div>
    </StudentLayout>
  );
}