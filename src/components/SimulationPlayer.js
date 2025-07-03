'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import SimulationResults from '@/components/SimulationResults';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  Trophy,
  Target,
  RotateCcw,
  Home,
  Share2,
  Award
} from 'lucide-react';

export default function SimulationPlayer({ simulationId, onExit }) {
  const { user } = useAuth();
  const [gameState, setGameState] = useState('loading'); // loading, playing, completed, error
  const [currentScenario, setCurrentScenario] = useState(null);
  const [progress, setProgress] = useState({ currentStep: 1, totalSteps: 1, percentage: 0, score: 0 });
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [previousChoices, setPreviousChoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id && simulationId) {
      initializeSimulation();
    }
  }, [user?.id, simulationId]);

  const initializeSimulation = async () => {
    try {
      setGameState('loading');
      
      // First, try to resume existing progress
      const progressResponse = await fetch(`/api/simulations?action=progress&userId=${user.id}&simulationId=${simulationId}`);
      const progressData = await progressResponse.json();
      
      if (progressData.success && progressData.data) {
        // Resume existing simulation
        const resumeResponse = await fetch('/api/simulations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'resume',
            userId: user.id,
            simulationId: simulationId,
            progressData: progressData.data
          })
        });
        
        const resumeData = await resumeResponse.json();
        if (resumeData.success) {
          setSimulation(resumeData.data.simulation);
          setCurrentScenario(resumeData.data.currentScenario);
          setProgress(resumeData.data.progress);
          setPreviousChoices(resumeData.data.previousChoices || []);
          setGameState('playing');
          return;
        }
      }
      
      // Start new simulation
      const startResponse = await fetch('/api/simulations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          userId: user.id,
          simulationId: simulationId
        })
      });
      
      const startData = await startResponse.json();
      if (startData.success) {
        setSimulation(startData.data.simulation);
        setCurrentScenario(startData.data.scenario);
        setProgress(startData.data.progress);
        setGameState('playing');
      } else {
        throw new Error(startData.error || 'Failed to start simulation');
      }
    } catch (error) {
      console.error('Error initializing simulation:', error);
      setGameState('error');
    }
  };

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
  };

  const handleNextStep = async () => {
    if (!selectedChoice || loading) return;

    try {
      setLoading(true);
      
      // Submit choice - ensure all required parameters are sent
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'makeChoice',
          userId: user.id,
          simulationId: simulationId,
          step: currentScenario.step,
          choiceId: selectedChoice.id
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update previous choices
        setPreviousChoices(prev => [...prev, {
          stepId: currentScenario.step,
          choiceId: selectedChoice.id,
          points: selectedChoice.points
        }]);
        
        // Show feedback first
        setShowFeedback(true);
        
        // Wait for feedback display, then proceed
        setTimeout(() => {
          setShowFeedback(false);
          setSelectedChoice(null);
          
          if (data.data.completed) {
            // Simulation completed
            setResults(data.data.results);
            setGameState('completed');
          } else {
            // Continue to next step
            setCurrentScenario(data.data.nextScenario);
            setProgress(data.data.progress);
          }
        }, 3000); // Show feedback for 3 seconds
      } else {
        throw new Error(data.error || 'Failed to submit choice');
      }
    } catch (error) {
      console.error('Error submitting choice:', error);
      setGameState('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = async () => {
    await initializeSimulation();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I completed ${simulation?.title}!`,
          text: `I scored ${results?.finalScore}% in the ${simulation?.title} simulation on Rwanda Civic Education App!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading simulation...</p>
        </div>
      </div>
    );
  }

  if (gameState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-6">Unable to load the simulation. Please try again.</p>
          <div className="space-x-4">
            <button
              onClick={handleRestart}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onExit}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'completed' && results) {
    return (
      <SimulationResults
        results={results}
        simulationTitle={simulation?.title}
        onRestart={handleRestart}
        onExit={onExit}
        onShare={handleShare}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onExit}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit Simulation</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Step {progress.currentStep} of {progress.totalSteps}
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <div className="text-sm font-medium text-blue-600">
                {progress.score} points
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {currentScenario && (
              <motion.div
                key={currentScenario.step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* Scenario Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-6xl">{currentScenario.image}</div>
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-2">{currentScenario.title}</h2>
                  <p className="text-blue-100 text-center">{simulation?.title}</p>
                </div>

                {/* Scenario Content */}
                <div className="p-8">
                  <div className="text-center mb-8">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {currentScenario.description}
                    </p>
                  </div>

                  {/* Feedback Display */}
                  {showFeedback && selectedChoice && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-l-4 border-blue-500"
                    >
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-6 h-6 text-blue-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-blue-800 mb-2">Your Choice</h3>
                          <p className="text-blue-700 mb-3">{selectedChoice.text}</p>
                          <p className="text-sm text-blue-600">
                            {currentScenario.feedback?.[selectedChoice.id] || currentScenario.explanation}
                          </p>
                          <div className="mt-3 flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-yellow-700">
                              +{selectedChoice.points} points
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Choices */}
                  {!showFeedback && (
                    <div className="space-y-4 mb-8">
                      {currentScenario.choices?.map((choice, index) => (
                        <motion.button
                          key={choice.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleChoiceSelect(choice)}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                            selectedChoice?.id === choice.id
                              ? 'border-blue-500 bg-blue-50 text-blue-900'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{choice.text}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                {choice.points} pts
                              </span>
                              {selectedChoice?.id === choice.id && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  {!showFeedback && (
                    <div className="text-center">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNextStep}
                        disabled={!selectedChoice || loading}
                        className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                          selectedChoice && !loading
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>Continue</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
