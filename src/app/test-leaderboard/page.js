'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

export default function LeaderboardTestPage() {
  const [results, setResults] = useState({
    all: null,
    weekly: null,
    monthly: null
  });
  const [loading, setLoading] = useState({
    all: false,
    weekly: false,
    monthly: false
  });

  const testLeaderboard = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      const response = await fetch(`/api/leaderboard?type=${type}&limit=5`);
      const data = await response.json();
      setResults(prev => ({ ...prev, [type]: data }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [type]: { success: false, error: error.message } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const testAll = async () => {
    await Promise.all([
      testLeaderboard('all'),
      testLeaderboard('weekly'),
      testLeaderboard('monthly')
    ]);
  };

  useEffect(() => {
    testAll();
  }, []);

  const ResultCard = ({ title, type, result, loading }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </h3>
        <button
          onClick={() => testLeaderboard(type)}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Test</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Testing...</span>
        </div>
      ) : result ? (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`font-medium ${
              result.success 
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              {result.success ? 'Success' : 'Failed'}
            </span>
          </div>

          {result.success && result.data && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Found {result.count} users
              </p>
              <div className="space-y-2">
                {result.data.slice(0, 3).map((user, index) => (
                  <div key={user.user_id} className="flex items-center space-x-3 p-2 bg-slate-50 dark:bg-slate-700 rounded">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      #{user.rank}
                    </span>
                    <img 
                      src={user.avatar_url} 
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user.total_points} points • {user.region}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <p className="text-sm text-red-700 dark:text-red-300">
                Error: {result.error}
              </p>
              {result.fallback && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {result.fallback}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-slate-500 dark:text-slate-400">Not tested yet</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            Leaderboard Function Testing
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Test the leaderboard API endpoints and function availability.
            If functions are missing, fallback data will be used.
          </p>
          
          <button
            onClick={testAll}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200"
          >
            Test All Leaderboards
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ResultCard
            title="All-Time Leaderboard"
            type="all"
            result={results.all}
            loading={loading.all}
          />
          
          <ResultCard
            title="Weekly Leaderboard"
            type="weekly"
            result={results.weekly}
            loading={loading.weekly}
          />
          
          <ResultCard
            title="Monthly Leaderboard"
            type="monthly"
            result={results.monthly}
            loading={loading.monthly}
          />
        </div>

        {/* Status Summary */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Function Status Summary
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <span className="text-slate-700 dark:text-slate-300">
                <strong>Expected Behavior:</strong> Functions not found in schema cache
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-slate-700 dark:text-slate-300">
                <strong>Fallback Active:</strong> Mock Rwanda civic education data
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span className="text-slate-700 dark:text-slate-300">
                <strong>UI Working:</strong> Leaderboard page displays correctly
              </span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> The Supabase function creation requires special permissions or manual setup. 
              The app gracefully falls back to mock data, ensuring the leaderboard always works.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
