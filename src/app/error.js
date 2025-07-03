'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong!</h1>
          <p className="text-gray-600 mb-8">
            We encountered an unexpected error. This has been logged and our team will look into it.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          
          <Link 
            href="/"
            className="inline-block w-full bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Go to Homepage
          </Link>
          
          <Link 
            href="/dashboard"
            className="inline-block w-full bg-green-100 text-green-800 px-6 py-3 rounded-lg font-medium hover:bg-green-200 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <details className="text-left">
            <summary className="cursor-pointer">Error details (for developers)</summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {error?.message || 'Unknown error'}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
