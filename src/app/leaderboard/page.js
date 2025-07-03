'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  Users, 
  Target, 
  Star,
  Calendar,
  Filter,
  Award,
  MapPin,
  Flame,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  fetchLeaderboard, 
  fetchWeeklyLeaderboard, 
  fetchMonthlyLeaderboard, 
  getUserLeaderboardStats 
} from '@/lib/dataAccess';

const timeframes = [
  { value: 'allTime', label: 'All Time', icon: Trophy },
  { value: 'monthly', label: 'This Month', icon: Calendar },
  { value: 'weekly', label: 'This Week', icon: TrendingUp }
];

const regions = [
  { value: 'all', label: 'All Regions', icon: Users },
  { value: 'Kigali', label: 'Kigali', icon: MapPin },
  { value: 'Eastern', label: 'Eastern Province', icon: MapPin },
  { value: 'Southern', label: 'Southern Province', icon: MapPin },
  { value: 'Western', label: 'Western Province', icon: MapPin },
  { value: 'Northern', label: 'Northern Province', icon: MapPin }
];

// Mock data fallback
const getMockLeaderboardData = () => [
  {
    id: 1,
    name: "Marie Uwimana",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=64&h=64&fit=crop&crop=face",
    points: 2450,
    level: 8,
    streak: 15,
    completedQuizzes: 34,
    completedSimulations: 12,
    achievements: 18,
    region: "Kigali",
    badge: "Constitution Expert",
    change: "+2"
  },
  {
    id: 2,
    name: "Jean Baptiste Nzeyimana",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
    points: 2380,
    level: 7,
    streak: 12,
    completedQuizzes: 31,
    completedSimulations: 11,
    achievements: 16,
    region: "Eastern",
    badge: "Civic Champion",
    change: "+1"
  },
  {
    id: 3,
    name: "Grace Mukamana",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
    points: 2340,
    level: 7,
    streak: 10,
    completedQuizzes: 29,
    completedSimulations: 13,
    achievements: 15,
    region: "Southern",
    badge: "Democracy Advocate",
    change: "-1"
  },
  {
    id: 4,
    name: "Alex Mugisha",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    points: 1250,
    level: 5,
    streak: 7,
    completedQuizzes: 23,
    completedSimulations: 8,
    achievements: 12,
    region: "Northern",
    badge: "Rising Star",
    change: "+3",
    isCurrentUser: true
  },
  {
    id: 5,
    name: "Immaculée Uwase",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face",
    points: 1180,
    level: 4,
    streak: 5,
    completedQuizzes: 21,
    completedSimulations: 7,
    achievements: 10,
    region: "Western",
    badge: "Active Learner",
    change: "+1"
  },
  {
    id: 6,
    name: "David Kayitare",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face",
    points: 1120,
    level: 4,
    streak: 8,
    completedQuizzes: 19,
    completedSimulations: 6,
    achievements: 9,
    region: "Kigali",
    badge: "Consistent Performer",
    change: "0"
  },
  {
    id: 7,
    name: "Ange Uwimana",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=64&h=64&fit=crop&crop=face",
    points: 1080,
    level: 4,
    streak: 6,
    completedQuizzes: 18,
    completedSimulations: 5,
    achievements: 8,
    region: "Eastern",
    badge: "Quiz Master",
    change: "+2"
  },
  {
    id: 8,
    name: "Patrick Habimana",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
    points: 1050,
    level: 3,
    streak: 4,
    completedQuizzes: 17,
    completedSimulations: 4,
    achievements: 7,
    region: "Southern",
    badge: "Newcomer",
    change: "+1"
  }
];

export default function LeaderboardPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('allTime');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Mock current user ID - in real app, get from auth context
  const currentUserId = 'test-user-id';

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      switch (selectedTimeframe) {
        case 'weekly':
          result = await fetchWeeklyLeaderboard(50);
          break;
        case 'monthly':
          result = await fetchMonthlyLeaderboard(50);
          break;
        default:
          result = await fetchLeaderboard(50);
          break;
      }

      if (result.success) {
        let data = result.data || [];
        
        // Filter by region if selected
        if (selectedRegion !== 'all') {
          data = data.filter(user => user.region === selectedRegion);
        }

        setLeaderboardData(data);
      } else {
        setError(result.error?.message || 'Failed to fetch leaderboard data');
        // Fallback to mock data
        setLeaderboardData(getMockLeaderboardData());
      }

      // Fetch user stats
      if (currentUserId) {
        const statsResult = await getUserLeaderboardStats(currentUserId);
        if (statsResult.success) {
          setUserStats(statsResult.data);
        }
      }

    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
      // Fallback to mock data
      setLeaderboardData(getMockLeaderboardData());
    } finally {
      setLoading(false);
    }
  };

  const refreshLeaderboard = async () => {
    setRefreshing(true);
    await fetchLeaderboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedTimeframe, selectedRegion]);

  // Filter data by region
  const filteredData = leaderboardData.filter(user => 
    selectedRegion === 'all' || user.region === selectedRegion
  );

  const getRankIcon = (position) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400">#{position}</span>;
    }
  };

  const getChangeIcon = (change) => {
    if (change.startsWith('+')) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (change.startsWith('-')) {
      return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    } else {
      return <span className="w-4 h-4 flex items-center justify-center text-slate-400">-</span>;
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Constitution Expert': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Civic Champion': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Democracy Advocate': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Rising Star': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Active Learner': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'Consistent Performer': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      case 'Quiz Master': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Civic Champions Leaderboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              See how you stack up against other civic learners across Rwanda. 
              Keep learning to climb the ranks!
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <p className="text-orange-800 dark:text-orange-300 text-sm">
                  {error} - Showing sample data instead.
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeframes.map(timeframe => (
                  <option key={timeframe.value} value={timeframe.value}>
                    {timeframe.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {regions.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={refreshLeaderboard}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="container mx-auto px-4 py-8">
        {filteredData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {filteredData.slice(0, 3).map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg text-center ${
                  index === 0 ? 'md:order-2 transform md:scale-105' : 
                  index === 1 ? 'md:order-1' : 'md:order-3'
                } ${user.isCurrentUser ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="relative mb-4">
                  <img
                    src={user.avatar || user.avatar_url || '/default-avatar.png'}
                    alt={user.name || user.full_name || 'User'}
                    className="w-16 h-16 rounded-full mx-auto mb-2"
                  />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    {getRankIcon(index + 1)}
                  </div>
                  {user.isCurrentUser && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        You
                      </span>
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  {user.name || user.full_name || 'Unknown User'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {user.region || 'Unknown Region'}
                </p>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                  {(user.points || user.total_points || 0).toLocaleString()}
                </div>
                <div className={`inline-block px-2 py-1 rounded-full text-xs ${getBadgeColor(user.badge || 'Newcomer')}`}>
                  {user.badge || 'Newcomer'}
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-center space-x-1">
                    <Flame className="w-3 h-3 text-red-500" />
                    <span className="text-slate-600 dark:text-slate-400">{user.streak || user.current_streak || 0}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-slate-600 dark:text-slate-400">{user.level || 1}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Complete Rankings
            </h2>
            {filteredData.length === 0 && (
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                No leaderboard data available for the selected filters.
              </p>
            )}
          </div>
          
          {filteredData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Learner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredData.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                        user.isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRankIcon(index + 1)}
                          {user.isCurrentUser && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={user.avatar || user.avatar_url || '/default-avatar.png'}
                            alt={user.name || user.full_name || 'User'}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-200">
                              {user.name || user.full_name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {user.region || 'Unknown Region'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-200">
                          {(user.points || user.total_points || 0).toLocaleString()}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block ${getBadgeColor(user.badge || 'Newcomer')}`}>
                          {user.badge || 'Newcomer'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-slate-900 dark:text-slate-200">
                            {user.level || 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 dark:text-slate-200">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Trophy className="w-3 h-3 text-blue-500" />
                              <span>{user.completedQuizzes || user.quizzes_completed || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Target className="w-3 h-3 text-green-500" />
                              <span>{user.completedSimulations || user.lessons_completed || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Flame className="w-3 h-3 text-red-500" />
                              <span>{user.streak || user.current_streak || 0}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          {getChangeIcon(user.change || '0')}
                          <span className={`text-sm ${
                            (user.change || '0').startsWith('+') ? 'text-green-600' :
                            (user.change || '0').startsWith('-') ? 'text-red-600' :
                            'text-slate-500'
                          }`}>
                            {user.change || '0'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
