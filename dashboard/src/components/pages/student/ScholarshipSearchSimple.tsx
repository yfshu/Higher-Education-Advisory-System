import React from 'react';
import StudentLayout from '../../layout/StudentLayout';
import { Card } from '../../ui/card';

export default function ScholarshipSearchSimple() {
  return (
    <StudentLayout title="Scholarship Search">
      <div className="space-y-6">
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scholarship Search</h2>
          <p className="text-gray-600">
            This is a simplified scholarship search page. The full feature is being loaded...
          </p>
        </Card>
      </div>
    </StudentLayout>
  );
}