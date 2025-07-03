'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Star, 
  ChevronLeft,
  Play,
  Pause,
  CheckCircle,
  Loader2,
  FileText,
  Award,
  RotateCcw,
  ArrowRight,
  User,
  Calendar,
  Target
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchLesson, 
  updateUserProgress, 
  fetchUserProgress 
} from '@/lib/dataAccess';
import { 
  LessonProgressTracker, 
  LessonAnalytics, 
  LessonUtils,
  useLessonState 
} from '@/lib/lessonUtils';

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStudying, setIsStudying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [progressTracker, setProgressTracker] = useState(null);
  const [outline, setOutline] = useState([]);
  const { saveState, loadState, clearState } = useLessonState();

  useEffect(() => {
    async function loadLessonAndProgress() {
      try {
        setLoading(true);
        
        // Fetch lesson data
        const lessonResult = await fetchLesson(params.id);
        if (!lessonResult.success) {
          setError('Failed to load lesson');
          return;
        }
        setLesson(lessonResult.data);

        // Extract lesson outline
        if (lessonResult.data.content) {
          const lessonOutline = LessonUtils.extractOutline(lessonResult.data.content);
          setOutline(lessonOutline);
        }

        // Fetch user progress if logged in
        if (user) {
          const progressResult = await fetchUserProgress(user.id, params.id, 'lesson');
          if (progressResult.success && progressResult.data) {
            setProgress(progressResult.data);
            setCurrentPosition(progressResult.data.last_position || 0);
            setCompletionPercentage(progressResult.data.completion_percentage || 0);
          }

          // Load saved state
          const savedState = loadState(params.id);
          if (savedState) {
            setCurrentPosition(savedState.position || 0);
            setIsStudying(savedState.isStudying || false);
          }

          // Initialize progress tracker
          const tracker = new LessonProgressTracker(
            params.id,
            user.id,
            lessonResult.data.estimated_duration_minutes || 0
          );
          
          tracker.onCheckpoint = (checkpoint) => {
            LessonAnalytics.trackCheckpoint(params.id, user.id, checkpoint);
          };
          
          setProgressTracker(tracker);
        }
      } catch (err) {
        setError('Error loading lesson');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadLessonAndProgress();
    }
  }, [params.id, user]);

  // Cleanup effect to save progress when component unmounts or user leaves
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (progressTracker && isStudying) {
        progressTracker.pause();
        saveState(params.id, {
          position: currentPosition,
          isStudying: false,
          percentage: completionPercentage
        });
      }
    };

    const handleVisibilityChange = () => {
      if (progressTracker) {
        if (document.hidden) {
          progressTracker.pause();
        } else if (isStudying) {
          progressTracker.resume();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Cleanup progress tracker
      if (progressTracker && isStudying) {
        progressTracker.pause();
      }
    };
  }, [progressTracker, isStudying, currentPosition, completionPercentage, params.id]);

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const startStudying = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    setIsStudying(true);
    
    // Start progress tracking
    if (progressTracker) {
      progressTracker.start();
      LessonAnalytics.trackStart(params.id, user.id);
    }
    
    // Update progress to in_progress if not already started
    if (!progress || progress.completion_status === 'not_started') {
      await updateUserProgress(
        user.id, 
        params.id, 
        null, 
        'lesson', 
        'in_progress', 
        0, 
        0
      );
    }

    // Save state
    saveState(params.id, {
      position: currentPosition,
      isStudying: true,
      startTime: Date.now()
    });
  };

  const pauseStudying = () => {
    setIsStudying(false);
    if (progressTracker) {
      progressTracker.pause();
    }
    saveState(params.id, {
      position: currentPosition,
      isStudying: false,
      percentage: completionPercentage
    });
  };

  const resumeStudying = () => {
    setIsStudying(true);
    if (progressTracker) {
      progressTracker.resume();
    }
    saveState(params.id, {
      position: currentPosition,
      isStudying: true,
      percentage: completionPercentage
    });
  };

  const updateProgress = async (newPosition, percentage) => {
    if (!user) return;

    setCurrentPosition(newPosition);
    setCompletionPercentage(percentage);

    // Update progress tracker
    if (progressTracker) {
      progressTracker.updateScrollPosition(newPosition / 100);
    }

    // Determine status based on percentage
    let status = 'in_progress';
    if (percentage >= 100) {
      status = 'completed';
      setIsStudying(false);
      
      // Track completion
      if (progressTracker) {
        const timeSpent = progressTracker.stop();
        LessonAnalytics.trackCompletion(params.id, user.id, timeSpent);
      }
    }

    await updateUserProgress(
      user.id, 
      params.id, 
      null, 
      'lesson', 
      status, 
      percentage, 
      newPosition
    );

    // Save state
    saveState(params.id, {
      position: newPosition,
      isStudying: isStudying,
      percentage: percentage
    });

    // Refresh progress
    const progressResult = await fetchUserProgress(user.id, params.id, 'lesson');
    if (progressResult.success && progressResult.data) {
      setProgress(progressResult.data);
    }
  };

  const resetProgress = async () => {
    if (!user) return;

    await updateUserProgress(
      user.id, 
      params.id, 
      null, 
      'lesson', 
      'not_started', 
      0, 
      0
    );

    setCurrentPosition(0);
    setCompletionPercentage(0);
    setIsStudying(false);
    
    // Refresh progress
    const progressResult = await fetchUserProgress(user.id, params.id, 'lesson');
    if (progressResult.success && progressResult.data) {
      setProgress(progressResult.data);
    }
  };

  const completeLesson = async () => {
    if (progressTracker) {
      const timeSpent = progressTracker.stop();
      LessonAnalytics.trackCompletion(params.id, user.id, timeSpent);
    }
    await updateProgress(100, 100);
    clearState(params.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <Navigation />
        <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-lg text-slate-600 dark:text-slate-400">Loading lesson...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <Navigation />
        <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-red-600 dark:text-red-400">{error || 'Lesson not found'}</p>
            <button 
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Navigation />
      
      <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Lessons
            </button>
            
            <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
              {lesson.description}
            </p>

            {/* Lesson Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">
                  {lesson.estimated_duration_minutes || 0} minutes
                </span>
              </div>
              
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty_level)}`}>
                {lesson.difficulty_level || 'Beginner'}
              </span>
              
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">
                  {lesson.category}
                </span>
              </div>

              {lesson.created_at && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {new Date(lesson.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {lesson.tags && lesson.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {lesson.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Progress Card */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Your Progress</h3>
                {progress && progress.completion_status === 'completed' && (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Completed
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(completionPercentage)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {(!progress || progress.completion_status === 'not_started') && (
                  <button 
                    onClick={startStudying}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Lesson
                  </button>
                )}

                {progress && progress.completion_status === 'in_progress' && (
                  <>
                    <button 
                      onClick={isStudying ? pauseStudying : resumeStudying}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center"
                    >
                      {isStudying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {isStudying ? 'Pause' : 'Continue'}
                    </button>

                    <button 
                      onClick={completeLesson}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </button>
                  </>
                )}

                {progress && progress.completion_status === 'completed' && (
                  <button 
                    onClick={resetProgress}
                    className="bg-slate-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors flex items-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restart Lesson
                  </button>
                )}
              </div>

              {/* Progress Details */}
              {progress && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Status</p>
                      <p className="font-medium capitalize">{progress.completion_status.replace('_', ' ')}</p>
                    </div>
                    {progress.started_at && (
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Started</p>
                        <p className="font-medium">{new Date(progress.started_at).toLocaleDateString()}</p>
                      </div>
                    )}
                    {progress.completed_at && (
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Completed</p>
                        <p className="font-medium">{new Date(progress.completed_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Lesson Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Lesson Content</h2>
            
            {/* Interactive Reading Experience */}
            {isStudying ? (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div 
                  className="lesson-content"
                  dangerouslySetInnerHTML={{ __html: lesson.content || '<p>Lesson content will be displayed here.</p>' }}
                />
                
                {/* Study Controls */}
                <div className="not-prose mt-8 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Reading Progress Tracker
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => updateProgress(25, 25)}
                        className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        25%
                      </button>
                      <button 
                        onClick={() => updateProgress(50, 50)}
                        className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        50%
                      </button>
                      <button 
                        onClick={() => updateProgress(75, 75)}
                        className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        75%
                      </button>
                      <button 
                        onClick={() => updateProgress(100, 100)}
                        className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                  
                  {/* Current Progress Display */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-slate-600 dark:text-slate-400">
                        Progress: {Math.round(completionPercentage)}%
                      </span>
                    </div>
                    {progressTracker && (
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          Reading time: {Math.round(progressTracker.totalTimeSpent / 60)}min
                        </span>
                      </div>
                    )}
                    <button 
                      onClick={isStudying ? pauseStudying : resumeStudying}
                      className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {isStudying ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                      {isStudying ? 'Pause' : 'Resume'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                {lesson.content ? (
                  <div className="prose prose-slate dark:prose-invert max-w-none opacity-50">
                    <div dangerouslySetInnerHTML={{ __html: lesson.content.substring(0, 200) + '...' }} />
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    This lesson contains comprehensive content about {lesson.title.toLowerCase()}.
                  </p>
                )}
                <p className="text-sm text-slate-400 mb-6">
                  Start the lesson to view the full content
                </p>
                <button 
                  onClick={startStudying}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center mx-auto"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Reading
                </button>
              </div>
            )}
          </motion.div>

          {/* Lesson Outline */}
          {outline.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mt-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                Lesson Outline
              </h3>
              <div className="space-y-2">
                {outline.map((heading, index) => (
                  <div 
                    key={index}
                    className={`flex items-center py-1 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
                      heading.level === 1 ? 'font-semibold' : 
                      heading.level === 2 ? 'font-medium ml-4' : 'ml-8'
                    }`}
                    onClick={() => {
                      const element = document.getElementById(heading.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <span className={`w-2 h-2 rounded-full mr-3 ${
                      heading.level === 1 ? 'bg-blue-500' :
                      heading.level === 2 ? 'bg-green-500' : 'bg-amber-500'
                    }`}></span>
                    <span className="text-sm">{heading.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Lesson Objectives */}
          {lesson.objectives && lesson.objectives.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mt-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-500" />
                Learning Objectives
              </h3>
              <ul className="space-y-2">
                {lesson.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">{objective}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Related Lessons or Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mt-6"
          >
            <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center">
                  <Award className="w-5 h-5 mr-3 text-amber-500" />
                  <span>Take a quiz to test your knowledge</span>
                </div>
                <button 
                  onClick={() => router.push('/quiz')}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  Start Quiz
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-3 text-green-500" />
                  <span>Explore more lessons</span>
                </div>
                <button 
                  onClick={() => router.push('/lessons')}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  Browse Lessons
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
