'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  MessageSquare, 
  Brain, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  RefreshCw,
  Zap,
  Users,
  Target
} from 'lucide-react';

export default function IntegrationTestPage() {
  const [loading, setLoading] = useState({
    migration: false,
    aiQuiz: false,
    whatsapp: false
  });
  const [results, setResults] = useState({
    migration: null,
    aiQuiz: null,
    whatsapp: null
  });

  const runMigrationTest = async () => {
    setLoading(prev => ({ ...prev, migration: true }));
    try {
      const response = await fetch('/api/migrate-and-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setResults(prev => ({ ...prev, migration: data }));
    } catch (error) {
      setResults(prev => ({ ...prev, migration: { success: false, error: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, migration: false }));
    }
  };

  const runAIQuizTest = async () => {
    setLoading(prev => ({ ...prev, aiQuiz: true }));
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Rwanda Constitution',
          difficulty: 'medium',
          questionCount: 5
        })
      });
      const data = await response.json();
      setResults(prev => ({ ...prev, aiQuiz: data }));
    } catch (error) {
      setResults(prev => ({ ...prev, aiQuiz: { success: false, error: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, aiQuiz: false }));
    }
  };

  const runWhatsAppTest = async () => {
    setLoading(prev => ({ ...prev, whatsapp: true }));
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '+250788123456',
          message: 'Test message from Rwanda Civic Education App! 🇷🇼',
          type: 'achievement_unlocked'
        })
      });
      const data = await response.json();
      setResults(prev => ({ ...prev, whatsapp: data }));
    } catch (error) {
      setResults(prev => ({ ...prev, whatsapp: { success: false, error: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, whatsapp: false }));
    }
  };

  const TestCard = ({ 
    title, 
    description, 
    icon: Icon, 
    onTest, 
    loading, 
    result, 
    testType 
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <button
        onClick={onTest}
        disabled={loading}
        className="w-full mb-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Testing...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            <span>Run Test</span>
          </>
        )}
      </button>

      {result && (
        <div className={`p-4 rounded-lg ${
          result.success 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <span className={`font-medium ${
              result.success 
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}>
              {result.success ? 'Test Passed' : 'Test Failed'}
            </span>
          </div>
          <pre className={`text-xs overflow-auto max-h-32 ${
            result.success 
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            Rwanda Civic Education App
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-6">
            Comprehensive integration testing for AI-generated quizzes, WhatsApp notifications, 
            database migrations, and dynamic leaderboards.
          </p>
          
          {/* Feature Status */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">AI Quiz Generation</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">WhatsApp Integration</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Dynamic Leaderboard</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Database Migrations</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <a
            href="/leaderboard"
            className="flex items-center space-x-3 p-4 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700"
          >
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Leaderboard</h3>
              <p className="text-sm text-slate-500">View rankings</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
          </a>
          
          <a
            href="/test-leaderboard"
            className="flex items-center space-x-3 p-4 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700"
          >
            <Target className="w-6 h-6 text-purple-500" />
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Test Functions</h3>
              <p className="text-sm text-slate-500">API testing</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
          </a>
          
          <a
            href="/quiz"
            className="flex items-center space-x-3 p-4 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700"
          >
            <Brain className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Take Quiz</h3>
              <p className="text-sm text-slate-500">Test knowledge</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
          </a>
          
          <a
            href="/test-whatsapp"
            className="flex items-center space-x-3 p-4 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700"
          >
            <MessageSquare className="w-6 h-6 text-green-500" />
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">WhatsApp Test</h3>
              <p className="text-sm text-slate-500">Send notifications</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
          </a>
          
          <a
            href="/dashboard"
            className="flex items-center space-x-3 p-4 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700"
          >
            <Users className="w-6 h-6 text-indigo-500" />
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Dashboard</h3>
              <p className="text-sm text-slate-500">User overview</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
          </a>
        </div>

        {/* Integration Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TestCard
            title="Database Migration"
            description="Test database setup, migrations, and seeding"
            icon={Database}
            onTest={runMigrationTest}
            loading={loading.migration}
            result={results.migration}
            testType="migration"
          />

          <TestCard
            title="AI Quiz Generation"
            description="Test AI-powered quiz creation with Rwanda content"
            icon={Brain}
            onTest={runAIQuizTest}
            loading={loading.aiQuiz}
            result={results.aiQuiz}
            testType="aiQuiz"
          />

          <TestCard
            title="WhatsApp Notifications"
            description="Test WhatsApp Business API integration"
            icon={MessageSquare}
            onTest={runWhatsAppTest}
            loading={loading.whatsapp}
            result={results.whatsapp}
            testType="whatsapp"
          />
        </div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-center">
            Key Features Implemented
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                🧠 AI-Powered Learning
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• Rwanda-specific civic education content</li>
                <li>• Dynamic quiz generation with multiple difficulty levels</li>
                <li>• Constitution, governance, and democracy topics</li>
                <li>• Intelligent question variations and explanations</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                📱 WhatsApp Integration
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• Real-time achievement notifications</li>
                <li>• Quiz completion alerts</li>
                <li>• Lesson progress updates</li>
                <li>• Weekly leaderboard summaries</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                🏆 Dynamic Leaderboards
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• Regional and national rankings</li>
                <li>• Weekly, monthly, and all-time views</li>
                <li>• User progress tracking and streaks</li>
                <li>• Achievement badges and levels</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                🗄️ Robust Backend
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• Supabase database with automatic migrations</li>
                <li>• Comprehensive error handling and fallbacks</li>
                <li>• Production-ready API endpoints</li>
                <li>• Scalable data seeding and management</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>
            Rwanda Civic Education App - Built with Next.js, Supabase, and WhatsApp Business API
          </p>
          <p className="mt-1">
            Empowering citizens through interactive civic education and AI-powered learning
          </p>
        </div>
      </div>
    </div>
  );
}
