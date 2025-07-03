'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  TrendingUp, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  BarChart3, 
  User, 
  Sparkles,
  Flame,
  Loader2
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase, fetchUserProfile, fetchUserAchievements } from '@/lib/supabase';
import { fetchPublishedQuizzes, fetchPublishedLessons } from '@/lib/dataAccess';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [activePeriod, setActivePeriod] = useState('week');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, profile } = useAuth();
  const router = useRouter();
  
  // Icons map for achievement types
  const iconMap = {
    'quiz': Award,
    'streak': Flame,
    'lesson': BookOpen,
    'social': User
  };
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user achievements
        const { data: achievementsData, error: achievementsError } = await fetchUserAchievements(user.id);
        
        if (achievementsError) {
          console.error('Error fetching achievements:', achievementsError);
        }
        
        // Fetch recent activity
        const { data: recentActivity, error: activityError } = await supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (activityError) {
          console.error('Error fetching recent activity:', activityError);
        }
        
        // Fetch quiz statistics
        const { data: quizStats, error: quizError } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id);
          
        if (quizError) {
          console.error('Error fetching quiz results:', quizError);
        }
        
        // Fetch user ranking
        const { data: rankingData, error: rankingError } = await supabase
          .rpc('get_user_ranking', { user_id: user.id });
          
        if (rankingError) {
          console.error('Error fetching user ranking:', rankingError);
        }
        
        // Fetch total users
        const { count: totalUsers, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.error('Error fetching total users count:', countError);
        }
        
        // Fetch recommended content
        const { data: recommendedContent, error: recommendedError } = await supabase
          .rpc('get_recommended_content', { user_id: user.id })
          .limit(3);
          
        if (recommendedError) {
          console.error('Error fetching recommended content:', recommendedError);
        }
        
        // Fetch progress data (weekly and monthly)
        const { data: progressData, error: progressError } = await supabase
          .rpc('get_user_progress', { user_id: user.id });
          
        if (progressError) {
          console.error('Error fetching progress data:', progressError);
        }
        
        // Format achievements data
        const formattedAchievements = achievementsData ? achievementsData.map(item => ({
          id: item.achievements.id,
          title: item.achievements.title,
          description: item.achievements.description,
          icon: iconMap[item.achievements.type] || Award,
          earned: true,
          date: new Date(item.earned_at).toISOString().split('T')[0]
        })) : [];
        
        // Add some unearned achievements if available
        const { data: unearned, error: unearnedError } = await supabase
          .from('achievements')
          .select('*')
          .not('id', 'in', `(${formattedAchievements.map(a => `'${a.id}'`).join(',') || 'null'})`)
          .limit(2);
          
        if (unearnedError) {
          console.error('Error fetching unearned achievements:', unearnedError);
        }
        
        if (unearned) {
          unearned.forEach(item => {
            formattedAchievements.push({
              id: item.id,
              title: item.title,
              description: item.description,
              icon: iconMap[item.type] || Award,
              earned: false
            });
          });
        }
        
        // Calculate quiz statistics
        const completedQuizzes = quizStats?.length || 0;
        const totalQuizzes = completedQuizzes; // Fallback, ideally we'd have a total available count
        const averageScore = quizStats?.length ? 
          Math.round(quizStats.reduce((acc, curr) => acc + (curr.score / curr.total_questions * 100), 0) / quizStats.length) : 
          0;
        
        // Format activity data
        const formattedActivity = recentActivity ? recentActivity.map(item => ({
          id: item.id,
          type: item.activity_type,
          title: item.title,
          date: new Date(item.created_at).toISOString().split('T')[0],
          result: item.details,
          points: item.points_earned
        })) : [];
        
        // Build comprehensive user data object
        const dashboardData = {
          name: profile?.full_name || 'User',
          points: profile?.points || 0,
          streak: profile?.streak || 0,
          completedLessons: profile?.completed_lessons || 0,
          totalQuizzes: totalQuizzes,
          quizzesCompleted: completedQuizzes,
          averageScore: averageScore,
          ranking: rankingData?.[0]?.rank || 0,
          totalUsers: totalUsers || 0,
          achievements: formattedAchievements,
          recentActivity: formattedActivity,
          weeklyProgress: progressData?.weekly_progress || [0, 0, 0, 0, 0, 0, 0],
          monthlyProgress: progressData?.monthly_progress || Array(12).fill(0),
          recommendedContent: recommendedContent || []
        };
        
        setUserData(dashboardData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, profile]);
  
  // Fallback data in case of errors or for new users
  const fallbackUserData = {
    name: profile?.full_name || "New User",
    points: 0,
    streak: 0,
    completedLessons: 0,
    totalQuizzes: 0,
    quizzesCompleted: 0,
    averageScore: 0,
    ranking: 0,
    totalUsers: 0,
    achievements: [
      {
        id: 'civic-starter',
        title: 'Civic Starter',
        description: 'Complete your first quiz',
        icon: Award,
        earned: false
      }
    ],
    recentActivity: [],
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
    monthlyProgress: Array(12).fill(0),
    recommendedContent: [
      {
        id: 'rc1',
        title: 'Introduction to Rwandan Civic Rights',
        type: 'lesson',
        duration: '5 min',
        difficulty: 'Beginner'
      },
      {
        id: 'rc2',
        title: 'Rwanda\'s Developmental Goals',
        type: 'quiz',
        duration: '5 min',
        difficulty: 'Advanced'
      }
    ]
  };

  // Helper function to get progress data based on active period
  const getProgressData = () => {
    return activePeriod === 'week' ? displayData.weeklyProgress : displayData.monthlyProgress;
  };

  // Helper function to get labels for the chart
  const getProgressLabels = () => {
    if (activePeriod === 'week') {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else {
      return Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);
    }
  };

  // If loading, show a loading indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <Navigation />
        
        <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-lg text-slate-600 dark:text-slate-400">Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  // Use actual data from Supabase or fallback data if there's an issue
  const displayData = userData || fallbackUserData;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Navigation />
      
      <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {displayData.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Continue your journey in civic education. You&apos;re making great progress!
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Current streak</p>
                <p className="text-xl font-bold">{displayData.streak} days</p>
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Points</h2>
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{displayData.points}</p>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+150 this week</span>
              </div>
            </motion.div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Lessons Completed</h2>
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{displayData.completedLessons}</p>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                <span>{Math.round((displayData.completedLessons / 60) * 100)}% of curriculum</span>
              </div>
            </div>
            
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Quiz Score Avg</h2>
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{displayData.averageScore}%</p>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                <span>{displayData.quizzesCompleted}/{displayData.totalQuizzes} quizzes completed</span>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Ranking</h2>
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">#{displayData.ranking}</p>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <span>Top {Math.round((displayData.ranking / displayData.totalUsers) * 100)}% of users</span>
              </div>
            </motion.div>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Progress & Activity */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress Chart */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium">Your Progress</h2>
                  <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                    <button
                      onClick={() => setActivePeriod('week')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        activePeriod === 'week' 
                          ? 'bg-white dark:bg-slate-800 shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setActivePeriod('month')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        activePeriod === 'month' 
                          ? 'bg-white dark:bg-slate-800 shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Month
                    </button>
                  </div>
                </div>
                
                {/* Simple Chart Visualization */}
                <div className="h-64 flex items-end space-x-2">
                  {getProgressData().map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        style={{ height: `${value}%` }} 
                        className="w-full bg-gradient-to-t from-blue-500 to-purple-600 rounded-t-md"
                      ></div>
                      <span className="text-xs mt-2 text-slate-500 dark:text-slate-400">
                        {getProgressLabels()[index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-medium mb-6">Recent Activity</h2>
                
                {displayData.recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">No recent activity yet.</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                      Complete lessons and quizzes to see your activity here.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {displayData.recentActivity.map(activity => (
                        <div key={activity.id} className="flex items-start">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4
                            ${activity.type === 'quiz' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                            ${activity.type === 'lesson' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                            ${activity.type === 'simulation' ? 'bg-purple-100 dark:bg-purple-900/30' : ''}
                          `}>
                            {activity.type === 'quiz' && <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                            {activity.type === 'lesson' && <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />}
                            {activity.type === 'simulation' && <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium">{activity.title}</h3>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{activity.date}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-400">{activity.result}</span>
                              <span className="text-green-600 dark:text-green-400">+{activity.points} points</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-6 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                      View All Activity
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Right Column - Achievements & Recommended */}
            <div className="space-y-8">
              {/* Achievements */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-medium mb-6">Your Achievements</h2>
                <div className="space-y-4">
                  {displayData.achievements.map(achievement => (
                    <div 
                      key={achievement.id} 
                      className={`p-4 rounded-lg border ${
                        achievement.earned 
                          ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-slate-200 dark:border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mr-4">
                          <achievement.icon className={`w-5 h-5 ${
                            achievement.earned 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-slate-400 dark:text-slate-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{achievement.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {achievement.description}
                          </p>
                          {achievement.earned && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Earned on {achievement.date}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recommended Content */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-medium mb-6">Recommended For You</h2>
                <div className="space-y-4">
                  {displayData.recommendedContent.map(content => (
                    <div 
                      key={content.id}
                      className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{content.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full
                          ${content.type === 'quiz' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : ''}
                          ${content.type === 'lesson' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
                        `}>
                          {content.type}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{content.duration}</span>
                        <span className="mx-2">•</span>
                        <span>{content.difficulty}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  View All Recommendations
                </button>
              </div>
              
              {/* Upcoming Deadline */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-xl shadow-sm text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Weekly Challenge</h2>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <p className="mb-4">Complete 3 quizzes before the weekend to earn bonus points and a special badge!</p>
                <div className="w-full bg-white/20 h-2 rounded-full mb-2">
                  <div className="bg-white h-2 rounded-full w-2/3"></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span>2/3 completed</span>
                  <span>Ends in 2 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
