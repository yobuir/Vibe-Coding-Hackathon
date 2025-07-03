'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Navigation from '../../components/Navigation';
import SimulationPlayer from '../../components/SimulationPlayer';
import LoadingSpinner from '../../components/LoadingSpinner';
import withErrorBoundary from '../../components/withErrorBoundary';
import { 
  Users, 
  DollarSign, 
  Vote, 
  Scale, 
  Building, 
  ArrowRight,
  Play,
  Clock,
  Trophy,
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  Award,
  BarChart3
} from 'lucide-react';

const simulations = [
  {
    id: 1,
    title: "Local Election Campaign",
    description: "Run for mayor in your district and learn about campaign strategies, voter outreach, and democratic processes.",
    icon: Vote,
    difficulty: "Intermediate",
    duration: "20 min",
    participants: 1250,
    color: "from-blue-500 to-indigo-600",
    category: "Elections",
    objectives: [
      "Develop campaign strategy",
      "Manage campaign budget",
      "Engage with voters",
      "Participate in debates"
    ],
    skills: ["Leadership", "Communication", "Strategic Planning", "Public Speaking"]
  },
  {
    id: 2,
    title: "Community Budget Planning",
    description: "Allocate limited resources across different community needs and understand budget prioritization.",
    icon: DollarSign,
    difficulty: "Advanced",
    duration: "25 min",
    participants: 980,
    color: "from-green-500 to-emerald-600",
    category: "Budget",
    objectives: [
      "Analyze community needs",
      "Allocate budget efficiently",
      "Balance competing priorities",
      "Present budget proposal"
    ],
    skills: ["Financial Planning", "Decision Making", "Data Analysis", "Presentation"]
  },
  {
    id: 3,
    title: "Citizens' Rights Workshop",
    description: "Navigate real-world scenarios involving citizen rights and learn how to advocate for yourself and others.",
    icon: Scale,
    difficulty: "Beginner",
    duration: "15 min",
    participants: 1890,
    color: "from-purple-500 to-pink-600",
    category: "Rights",
    objectives: [
      "Identify fundamental rights",
      "Understand legal protections",
      "Practice advocacy skills",
      "Know when to seek help"
    ],
    skills: ["Legal Awareness", "Critical Thinking", "Advocacy", "Problem Solving"]
  },
  {
    id: 4,
    title: "Town Hall Meeting",
    description: "Participate in a virtual town hall meeting discussing local issues and community solutions.",
    icon: Users,
    difficulty: "Intermediate",
    duration: "30 min",
    participants: 750,
    color: "from-orange-500 to-red-600",
    category: "Civic Engagement",
    objectives: [
      "Present community issues",
      "Listen to diverse perspectives",
      "Build consensus",
      "Develop action plans"
    ],
    skills: ["Public Speaking", "Active Listening", "Collaboration", "Diplomacy"]
  },
  {
    id: 5,
    title: "Government Structure Explorer",
    description: "Navigate through different levels of government and understand how policies are made and implemented.",
    icon: Building,
    difficulty: "Beginner",
    duration: "18 min",
    participants: 1456,
    color: "from-teal-500 to-cyan-600",
    category: "Government",
    objectives: [
      "Map government structure",
      "Trace policy development",
      "Understand roles & responsibilities",
      "Identify decision makers"
    ],
    skills: ["Systems Thinking", "Research", "Analysis", "Civic Knowledge"]
  },
  {
    id: 6,
    title: "Constitutional Convention",
    description: "Participate in drafting constitutional amendments and understand the democratic process of constitutional change.",
    icon: Scale,
    difficulty: "Advanced",
    duration: "35 min",
    participants: 456,
    color: "from-violet-500 to-purple-600",
    category: "Constitution",
    objectives: [
      "Analyze constitutional principles",
      "Draft amendment proposals",
      "Debate constitutional issues",
      "Reach democratic consensus"
    ],
    skills: ["Legal Writing", "Debate", "Compromise", "Constitutional Law"]
  }
];

function Simulations() {
  const { user, loading: authLoading } = useAuth();
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [filter, setFilter] = useState('All');
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const categories = ['All', 'Elections', 'Budget', 'Rights', 'Civic Engagement', 'Government', 'Constitution'];

  useEffect(() => {
    if (user?.id) {
      loadUserStats();
    }
  }, [user?.id]);

  const loadUserStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch(`/api/simulations?action=stats&userId=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setUserStats(data.data);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const filteredSimulations = filter === 'All' 
    ? simulations 
    : simulations.filter(sim => sim.category === filter);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleStartSimulation = (simulation) => {
    setActiveSimulation(simulation.id);
  };

  const handleExitSimulation = () => {
    setActiveSimulation(null);
    setSelectedSimulation(null);
    // Reload stats when returning from simulation
    if (user?.id) {
      loadUserStats();
    }
  };

  // If user is in active simulation, show simulation player
  if (activeSimulation) {
    return (
      <SimulationPlayer 
        simulationId={activeSimulation}
        onExit={handleExitSimulation}
      />
    );
  }

  // If a simulation is selected, show detailed view
  if (selectedSimulation) {
    const sim = selectedSimulation;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 shadow-sm p-4">
          <div className="container mx-auto flex items-center justify-between">
            <button
              onClick={() => setSelectedSimulation(null)}
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Simulations</span>
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {sim.title}
            </h1>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${sim.color} rounded-xl flex items-center justify-center`}>
                      <sim.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(sim.difficulty)}`}>
                        {sim.difficulty}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {sim.category}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                    {sim.title}
                  </h2>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {sim.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">Duration</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{sim.duration}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">Participants</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{sim.participants.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                      Learning Objectives
                    </h3>
                    <ul className="space-y-2">
                      {sim.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600 dark:text-slate-400">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                      Skills You'll Practice
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {sim.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartSimulation(sim)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Simulation</span>
                  </button>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                      Simulation Tips
                    </h4>
                  </div>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                    <li>• Take your time to read all information</li>
                    <li>• Consider multiple perspectives</li>
                    <li>• Don't be afraid to make mistakes</li>
                    <li>• Learning happens through doing</li>
                    <li>• Ask yourself "why" at each decision point</li>
                    <li>• Think about real-world applications</li>
                  </ul>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main simulations listing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Navigation />
      
      <div className="md:ml-64">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                Civic Simulations
              </h1>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Practice real-world civic scenarios in a safe, interactive environment. 
                Build skills and confidence through hands-on experience.
              </p>
            </div>
          </div>
        </div>

        {/* User Stats */}
        {user && (
          <div className="container mx-auto px-4 py-6">
            {loadingStats ? (
              <div className="flex justify-center">
                <LoadingSpinner size="small" />
              </div>
            ) : userStats ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">
                  Your Simulation Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{userStats.totalCompleted || 0}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{userStats.averageScore || 0}%</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Avg Score</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{userStats.badges?.length || 0}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Badges</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      {userStats.recentCompletions?.length > 0 ? 'Active' : 'Ready'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Status</div>
                  </div>
                </div>
                
                {userStats.badges && userStats.badges.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Badges:</h4>
                    <div className="flex flex-wrap gap-2">
                      {userStats.badges.map((badge, index) => (
                        <span key={index} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
                          🏆 {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6 text-center"
              >
                <Target className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Start Your Simulation Journey!
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Complete simulations to earn badges and track your civic learning progress.
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Simulations Grid */}
        <div className="container mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSimulations.map((simulation, index) => (
              <motion.div
                key={simulation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedSimulation(simulation)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${simulation.color} rounded-lg flex items-center justify-center`}>
                    <simulation.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(simulation.difficulty)}`}>
                      {simulation.difficulty}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  {simulation.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  {simulation.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{simulation.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{simulation.participants.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {simulation.category}
                  </span>
                  <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    <span className="text-sm font-medium">Start</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withErrorBoundary(Simulations);
