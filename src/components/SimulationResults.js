'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  CheckCircle, 
  Target,
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Users,
  Share2,
  Download
} from 'lucide-react';

const SimulationResults = ({ 
  results, 
  onRestart, 
  onExit, 
  onShare, 
  simulationTitle = "Civic Simulation" 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [achievementAnimation, setAchievementAnimation] = useState(false);

  useEffect(() => {
    // Trigger achievement animation if new achievements were earned
    if (results.newAchievements && results.newAchievements.length > 0) {
      setTimeout(() => setAchievementAnimation(true), 1000);
    }
  }, [results.newAchievements]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 70) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getPerformanceMessage = (score) => {
    if (score >= 90) return { title: "Outstanding!", message: "You're a civic leader!" };
    if (score >= 70) return { title: "Great Work!", message: "You're building strong civic skills!" };
    if (score >= 50) return { title: "Good Effort!", message: "Keep practicing to improve!" };
    return { title: "Keep Learning!", message: "Every attempt makes you better!" };
  };

  const performance = getPerformanceMessage(results.finalScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className={`w-20 h-20 bg-gradient-to-br ${getScoreBgColor(results.finalScore)} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Simulation Complete!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {simulationTitle}
          </p>
        </motion.div>

        {/* Score Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg mb-6"
        >
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(results.finalScore)} mb-2`}>
              {results.finalScore}%
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              {performance.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {performance.message}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {results.correctAnswers || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Correct
                </div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {Math.round((results.timeSpent || 0) / 60)}m
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Time Spent
                </div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  +{results.pointsEarned || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Points
                </div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {results.totalSteps || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Steps
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* New Achievements */}
        {results.newAchievements && results.newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 mb-6 border border-yellow-200 dark:border-yellow-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">
                New Achievements Unlocked!
              </h3>
            </div>
            <div className="space-y-3">
              {results.newAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg"
                >
                  <div className="text-2xl">{achievement.badge || '🏆'}</div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {achievement.title}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {achievement.description}
                    </div>
                  </div>
                  <div className="ml-auto text-yellow-600 dark:text-yellow-400 font-bold">
                    +{achievement.points} pts
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Detailed Results */}
        {results.stepResults && results.stepResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Step-by-Step Results
              </h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            {showDetails && (
              <div className="space-y-4">
                {results.stepResults.map((step, index) => (
                  <div
                    key={step.stepId}
                    className="border border-slate-200 dark:border-slate-600 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-800 dark:text-slate-200">
                        Step {index + 1}: {step.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {step.correct ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center">
                            <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full"></div>
                          </div>
                        )}
                        <span className={`text-sm font-medium ${step.correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {step.pointsEarned} pts
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Your choice: {step.userChoice}
                    </p>
                    {step.feedback && (
                      <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 p-2 rounded">
                        {step.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={onRestart}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            <Target className="w-5 h-5" />
            <span>Try Again</span>
          </button>
          
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Results</span>
            </button>
          )}

          <button
            onClick={onExit}
            className="flex items-center justify-center space-x-2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span>Back to Simulations</span>
          </button>
        </motion.div>

        {/* Learning Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">
            💡 Learning Tips
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <li>• Review the feedback for each step to understand different perspectives</li>
            <li>• Try the simulation again with different choices to explore all options</li>
            <li>• Apply these scenarios to real-world situations in your community</li>
            <li>• Discuss your choices with friends and family to learn from others</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default SimulationResults;
