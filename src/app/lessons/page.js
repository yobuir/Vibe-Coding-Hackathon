'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Star, 
  ChevronRight,
  Play,
  CheckCircle,
  Loader2,
  FileText,
  Filter,
  Search,
  RotateCcw,
  Target,
  TrendingUp
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchPublishedLessons, fetchUserProgress } from '@/lib/dataAccess';

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    async function loadLessonsAndProgress() {
      try {
        setLoading(true);
        const result = await fetchPublishedLessons();
        
        if (result.success) {
          setLessons(result.data);
          
          // Fetch user progress for each lesson if user is logged in
          if (user && result.data.length > 0) {
            const progressPromises = result.data.map(lesson => 
              fetchUserProgress(user.id, lesson.id, 'lesson')
            );
            
            const progressResults = await Promise.all(progressPromises);
            const progressMap = {};
            
            result.data.forEach((lesson, index) => {
              if (progressResults[index].success && progressResults[index].data) {
                progressMap[lesson.id] = progressResults[index].data;
              }
            });
            
            setUserProgress(progressMap);
          }
        } else {
          setError('Failed to load lessons');
          console.error('Error loading lessons:', result.error);
        }
      } catch (err) {
        setError('Error loading lessons');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLessonsAndProgress();
  }, [user]);

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Filter lessons based on search and categories
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || lesson.difficulty_level === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Get unique categories and difficulties
  const categories = [...new Set(lessons.map(lesson => lesson.category))].filter(Boolean);
  const difficulties = [...new Set(lessons.map(lesson => lesson.difficulty_level))].filter(Boolean);

  // Calculate stats
  const totalLessons = lessons.length;
  const completedLessons = Object.values(userProgress).filter(p => p.completion_status === 'completed').length;
  const inProgressLessons = Object.values(userProgress).filter(p => p.completion_status === 'in_progress').length;
  const totalDuration = lessons.reduce((total, lesson) => total + (lesson.estimated_duration_minutes || 0), 0);

  const getProgressForLesson = (lessonId) => {
    return userProgress[lessonId] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <Navigation />
        <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-lg text-slate-600 dark:text-slate-400">Loading lessons...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <Navigation />
        <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Navigation />
      
      <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Civic Education Lessons</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Learn about civic concepts through comprehensive, interactive lessons.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty} className="capitalize">{difficulty}</option>
                ))}
              </select>
            </div>

            {/* Active Filters */}
            {(searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">Active filters:</span>
                {searchQuery && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                    Search: &quot;{searchQuery}&quot;
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm">
                    Category: {selectedCategory}
                  </span>
                )}
                {selectedDifficulty !== 'all' && (
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-sm capitalize">
                    Level: {selectedDifficulty}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                  }}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalLessons}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Available Lessons</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedLessons}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inProgressLessons}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">In Progress</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalDuration} min</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Duration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lessons Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredLessons.map((lesson) => {
              const progress = getProgressForLesson(lesson.id);
              const isCompleted = progress?.completion_status === 'completed';
              const isInProgress = progress?.completion_status === 'in_progress';
              const completionPercentage = progress?.completion_percentage || 0;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 relative"
                >
                  {/* Progress Indicator */}
                  {user && progress && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-600'
                        }`}
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Lesson Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-xl font-semibold mr-2 line-clamp-2">
                            {lesson.title}
                          </h3>
                          {isCompleted && (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          )}
                          {isInProgress && (
                            <div className="w-5 h-5 flex-shrink-0">
                              <div className="w-full h-full border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                          {lesson.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar for In-Progress Lessons */}
                    {user && isInProgress && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(completionPercentage)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Lesson Metadata */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {lesson.estimated_duration_minutes || 0} minutes
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty_level)}`}>
                          {lesson.difficulty_level || 'Beginner'}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <FileText className="w-4 h-4 mr-2 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          Category: {lesson.category}
                        </span>
                      </div>

                      {lesson.tags && lesson.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {lesson.tags.slice(0, 3).map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                          {lesson.tags.length > 3 && (
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-md">
                              +{lesson.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button 
                      className={`w-full py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center group ${
                        isCompleted 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : isInProgress 
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      }`}
                      onClick={() => {
                        // Navigate to lesson page
                        window.location.href = `/lessons/${lesson.id}`;
                      }}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Review Lesson
                        </>
                      ) : isInProgress ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Continue Lesson
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Lesson
                        </>
                      )}
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredLessons.length === 0 && lessons.length > 0 && (
            <div className="text-center py-12">
              <Filter className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
                No Lessons Match Your Filters
              </h3>
              <p className="text-slate-500 dark:text-slate-500 mb-4">
                Try adjusting your search terms or filters to find lessons.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {filteredLessons.length === 0 && lessons.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
                No Lessons Available
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                Check back later for new lessons to expand your civic knowledge.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
