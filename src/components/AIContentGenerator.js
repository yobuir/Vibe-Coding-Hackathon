'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, SparklesIcon, BookOpenIcon, PlayIcon } from 'lucide-react';

export default function AIContentGenerator() {
  const [activeTab, setActiveTab] = useState('quiz');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [quizForm, setQuizForm] = useState({
    topic: 'governance',
    difficulty: 'beginner',
    questionCount: 5,
    prompt: 'Generate a quiz about Rwanda\'s constitutional framework and governance structures.'
  });

  const [simulationForm, setSimulationForm] = useState({
    topic: 'governance',
    difficulty: 'beginner',
    prompt: 'Create a simulation about local government decision-making processes in Rwanda.'
  });

  const topicOptions = [
    { value: 'governance', label: 'Governance & Politics' },
    { value: 'citizenship', label: 'Citizenship & Rights' },
    { value: 'history', label: 'History & Culture' },
    { value: 'economics', label: 'Economics & Development' },
    { value: 'community', label: 'Community & Society' },
    { value: 'environment', label: 'Environment & Sustainability' }
  ];

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: quizForm.prompt,
          preferences: {
            topic: quizForm.topic,
            difficulty: quizForm.difficulty,
            questionCount: quizForm.questionCount
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      setResult({
        type: 'quiz',
        data: data.quiz,
        message: data.message,
        warning: data.warning
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSimulation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate-simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: simulationForm.prompt,
          preferences: {
            topic: simulationForm.topic,
            difficulty: simulationForm.difficulty
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate simulation');
      }

      setResult({
        type: 'simulation',
        data: data.simulation,
        message: data.message,
        warning: data.warning
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quiz'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BookOpenIcon className="w-5 h-5 inline mr-2" />
            Generate Quiz
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'simulation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PlayIcon className="w-5 h-5 inline mr-2" />
            Generate Simulation
          </button>
        </nav>
      </div>

      {/* Quiz Generation Form */}
      {activeTab === 'quiz' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Generate AI-Powered Quiz</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <select
                value={quizForm.topic}
                onChange={(e) => setQuizForm({...quizForm, topic: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {topicOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={quizForm.difficulty}
                onChange={(e) => setQuizForm({...quizForm, difficulty: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {difficultyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <select
                value={quizForm.questionCount}
                onChange={(e) => setQuizForm({...quizForm, questionCount: parseInt(e.target.value)})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={3}>3 questions</option>
                <option value={5}>5 questions</option>
                <option value={10}>10 questions</option>
                <option value={15}>15 questions</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Prompt
              </label>
              <textarea
                value={quizForm.prompt}
                onChange={(e) => setQuizForm({...quizForm, prompt: e.target.value})}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what you want the quiz to focus on..."
              />
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              ) : (
                <SparklesIcon className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        </div>
      )}

      {/* Simulation Generation Form */}
      {activeTab === 'simulation' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Generate AI-Powered Simulation</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <select
                value={simulationForm.topic}
                onChange={(e) => setSimulationForm({...simulationForm, topic: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {topicOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={simulationForm.difficulty}
                onChange={(e) => setSimulationForm({...simulationForm, difficulty: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {difficultyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Prompt
              </label>
              <textarea
                value={simulationForm.prompt}
                onChange={(e) => setSimulationForm({...simulationForm, prompt: e.target.value})}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the simulation scenario you want to create..."
              />
            </div>

            <button
              onClick={handleGenerateSimulation}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              ) : (
                <SparklesIcon className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Generating...' : 'Generate Simulation'}
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {result.type === 'quiz' ? 'Generated Quiz' : 'Generated Simulation'}
            </h3>
            <span className="text-sm text-green-600">{result.message}</span>
          </div>
          
          {result.warning && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">{result.warning}</p>
            </div>
          )}

          {result.type === 'quiz' ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold text-lg">{result.data.quiz_title}</h4>
                <p className="text-sm text-gray-600 mt-2">
                  Difficulty: {result.data.difficulty_level} | 
                  Time: {result.data.estimated_time} | 
                  Questions: {result.data.questions?.length || 0}
                </p>
              </div>
              
              {result.data.questions?.slice(0, 2).map((question, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-medium">Question {index + 1}</h5>
                  <p className="text-sm text-gray-700 mt-1">{question.question}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Correct: {question.correct_answer} - {question.options?.[question.correct_answer]}
                  </div>
                </div>
              ))}
              
              {result.data.questions?.length > 2 && (
                <p className="text-sm text-gray-500 text-center">
                  ... and {result.data.questions.length - 2} more questions
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold text-lg">{result.data.title}</h4>
                <p className="text-sm text-gray-600 mt-2">{result.data.description}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Difficulty: {result.data.difficulty_level} | 
                  Category: {result.data.category} | 
                  Time: {result.data.estimated_time}
                </p>
              </div>
              
              {result.data.scenario && (
                <div className="border-l-4 border-green-500 pl-4">
                  <h5 className="font-medium">Scenario</h5>
                  <p className="text-sm text-gray-700 mt-1">{result.data.scenario.context}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Role:</strong> {result.data.scenario.role}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
