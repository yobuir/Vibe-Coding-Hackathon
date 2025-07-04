import React from 'react';
import AIContentGenerator from '@/components/AIContentGenerator';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Content Administration</h1>
            <p className="text-gray-600 mb-8">
              Generate AI-powered quizzes and simulations for the Rwanda Civic Education platform.
            </p> 
            <AIContentGenerator />
          </div>
        </div>
      </div>
    </div>
  );
}
