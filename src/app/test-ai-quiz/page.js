'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, XCircle, Loader2, Play, Database, Sparkles } from 'lucide-react';
import { runAllAIQuizMigrations } from '@/lib/aiQuizMigration';
import { generateAIQuiz } from '@/lib/dataAccess';

export default function AIQuizTestPage() {
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [quizTestStatus, setQuizTestStatus] = useState(null);
  const [quizTestLoading, setQuizTestLoading] = useState(false);
  const [fullSetupStatus, setFullSetupStatus] = useState(null);
  const [fullSetupLoading, setFullSetupLoading] = useState(false);
  const [debugStatus, setDebugStatus] = useState(null);
  const [debugLoading, setDebugLoading] = useState(false);

  const runFullSetup = async () => {
    setFullSetupLoading(true);
    try {
      const response = await fetch('/api/migrate-and-seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      setFullSetupStatus(result);
    } catch (error) {
      setFullSetupStatus({ 
        success: false, 
        error: error.message 
      });
    } finally {
      setFullSetupLoading(false);
    }
  };

  const debugDatabase = async () => {
    setDebugLoading(true);
    try {
      const response = await fetch('/api/debug-db', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      setDebugStatus(result);
    } catch (error) {
      setDebugStatus({ 
        success: false, 
        error: error.message 
      });
    } finally {
      setDebugLoading(false);
    }
  };

  const runMigration = async () => {
    setMigrationLoading(true);
    try {
      const result = await runAllAIQuizMigrations();
      setMigrationStatus(result);
    } catch (error) {
      setMigrationStatus({ 
        success: false, 
        error: error.message,
        migration: { success: false, error: error.message },
        achievements: { success: false, error: error.message }
      });
    } finally {
      setMigrationLoading(false);
    }
  };

  const testQuizGeneration = async () => {
    setQuizTestLoading(true);
    try {
      const testPrompt = `Generate a 3-question quiz about Rwanda governance for intermediate level.`;
      const testPreferences = {
        difficulty: 'intermediate',
        topic: 'governance',
        questionCount: 3
      };
      
      console.log('Testing quiz generation with:', { testPrompt, testPreferences });
      
      // Test the API endpoint directly
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: testPrompt,
          userId: 'test-user-id',
          preferences: testPreferences
        })
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      setQuizTestStatus(result);
    } catch (error) {
      console.error('Quiz generation error:', error);
      setQuizTestStatus({ 
        success: false, 
        error: error.message 
      });
    } finally {
      setQuizTestLoading(false);
    }
  };

  const StatusIcon = ({ success, loading }) => {
    if (loading) return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    if (success === true) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (success === false) return <XCircle className="w-5 h-5 text-red-500" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-blue-600" />
            AI Quiz System Test
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Test the AI quiz functionality and database setup
          </p>
        </div>

        <div className="space-y-6">
          {/* Full Setup - New Primary Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl shadow-sm p-6 border-2 border-green-200 dark:border-green-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-green-600" />
                Complete Database Setup
              </h2>
              <StatusIcon success={fullSetupStatus?.success} loading={fullSetupLoading} />
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Run complete database migration and seed Rwanda civic education content (recommended for first-time setup).
            </p>
            
            <button
              onClick={runFullSetup}
              disabled={fullSetupLoading}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg font-medium"
            >
              {fullSetupLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Setting up database...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  Run Complete Setup
                </>
              )}
            </button>

            {fullSetupStatus && (
              <div className="mt-4 p-4 rounded-lg bg-white dark:bg-slate-800 border">
                <h3 className="font-medium mb-2">Setup Results:</h3>
                {fullSetupStatus.success ? (
                  <div className="space-y-2 text-sm">
                    <div className="text-green-600 dark:text-green-400">
                      ✅ Complete setup successful!
                    </div>
                    {fullSetupStatus.results && (
                      <div className="space-y-1">
                        <div>• Migrations: ✅ Completed</div>
                        <div>• Quizzes: ✅ {fullSetupStatus.results.quizzes?.skipped ? 'Already exists' : 'Seeded'}</div>
                        <div>• Questions: ✅ {fullSetupStatus.results.questions?.questionCount || 0} seeded</div>
                        <div>• Lessons: ✅ {fullSetupStatus.results.lessons?.skipped ? 'Already exists' : 'Seeded'}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600 dark:text-red-400 text-sm">
                    ❌ Error: {fullSetupStatus.error || 'Setup failed'}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Database Debug Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Database Debug</h2>
              <StatusIcon success={debugStatus?.success} loading={debugLoading} />
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Check current database structure and available tables.
            </p>
            
            <button
              onClick={debugDatabase}
              disabled={debugLoading}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {debugLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking Database...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Debug Database
                </>
              )}
            </button>

            {debugStatus && (
              <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
                <h3 className="font-medium mb-2">Database Debug Results:</h3>
                {debugStatus.success ? (
                  <div className="space-y-2 text-sm">
                    <div className="text-green-600 dark:text-green-400">
                      ✅ Database connection successful
                    </div>
                    {debugStatus.tables && (
                      <div className="bg-white dark:bg-slate-800 p-3 rounded border">
                        <div><strong>Available Tables:</strong></div>
                        <ul className="list-disc list-inside mt-1">
                          {debugStatus.tables.map(table => (
                            <li key={table}>{table}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {debugStatus.quizzes && (
                      <div className="bg-white dark:bg-slate-800 p-3 rounded border">
                        <div><strong>Quizzes Table Info:</strong></div>
                        <div>Columns: {debugStatus.quizzes.columns?.join(', ') || 'Not available'}</div>
                        <div>Sample Data: {debugStatus.quizzes.sampleCount || 0} rows</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600 dark:text-red-400 text-sm">
                    ❌ Error: {debugStatus.error || 'Database debug failed'}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Manual Migration Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Manual Migration Only</h2>
              <StatusIcon success={migrationStatus?.success} loading={migrationLoading} />
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Run only the database migration to add AI quiz support (no sample data).
            </p>
            
            <button
              onClick={runMigration}
              disabled={migrationLoading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {migrationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Migration...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Migration
                </>
              )}
            </button>

            {migrationStatus && (
              <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
                <h3 className="font-medium mb-2">Migration Results:</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <StatusIcon success={migrationStatus.migration?.success} />
                    <span className="ml-2">Database schema update</span>
                  </div>
                  <div className="flex items-center">
                    <StatusIcon success={migrationStatus.achievements?.success} />
                    <span className="ml-2">Achievements setup</span>
                  </div>
                </div>
                {!migrationStatus.success && (
                  <div className="mt-2 text-red-600 dark:text-red-400 text-sm">
                    Error: {migrationStatus.error || 'Migration failed'}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Quiz Generation Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Quiz Generation Test</h2>
              <StatusIcon success={quizTestStatus?.success} loading={quizTestLoading} />
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Test the AI quiz generation API endpoint with a sample request.
            </p>
            
            <button
              onClick={testQuizGeneration}
              disabled={quizTestLoading}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {quizTestLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Test Quiz Generation
                </>
              )}
            </button>

            {quizTestStatus && (
              <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
                <h3 className="font-medium mb-2">Quiz Generation Results:</h3>
                {quizTestStatus.success ? (
                  <div className="space-y-2 text-sm">
                    <div className="text-green-600 dark:text-green-400">
                      ✅ Quiz generated successfully!
                    </div>
                    {quizTestStatus.quiz && (
                      <div className="bg-white dark:bg-slate-800 p-3 rounded border">
                        <div><strong>Quiz ID:</strong> {quizTestStatus.quiz.id}</div>
                        <div><strong>Title:</strong> {quizTestStatus.quiz.title}</div>
                        <div><strong>Description:</strong> {quizTestStatus.quiz.description}</div>
                        <div><strong>AI Generated:</strong> {quizTestStatus.quiz.ai_generated ? 'Yes' : 'No'}</div>
                        <div><strong>Difficulty:</strong> {quizTestStatus.quiz.difficulty_level}</div>
                        <div><strong>Questions Count:</strong> {quizTestStatus.quiz.questions_count || 'N/A'}</div>
                      </div>
                    )}
                    {quizTestStatus.data && !quizTestStatus.quiz && (
                      <div className="bg-white dark:bg-slate-800 p-3 rounded border">
                        <div><strong>Raw Response:</strong></div>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(quizTestStatus.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-red-600 dark:text-red-400 text-sm">
                      ❌ Error: {quizTestStatus.error || 'Quiz generation failed'}
                    </div>
                    {quizTestStatus.details && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border text-xs">
                        <div><strong>Details:</strong></div>
                        <pre className="mt-1 overflow-auto">
                          {JSON.stringify(quizTestStatus.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Status Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Required Components:</h3>
                <div className="space-y-1 text-sm">
                  <div>✅ Database schema (quizzes table)</div>
                  <div>✅ API endpoint (/api/generate-quiz)</div>
                  <div>✅ AI service integration (mock)</div>
                  <div>✅ Quiz generation UI</div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Next Steps:</h3>
                <div className="space-y-1 text-sm">
                  <div>1. Run complete database setup (recommended)</div>
                  <div>2. Test quiz generation</div>
                  <div>3. Configure real AI service (optional)</div>
                  <div>4. Use AI quiz generation in app</div>
                  <div>5. View quizzes at /quiz</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
