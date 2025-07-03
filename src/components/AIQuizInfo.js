'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  BookOpen, 
  Target, 
  Clock, 
  Award,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

export default function AIQuizInfo({ onClose }) {
  const [currentTab, setCurrentTab] = useState('features');

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Generation',
      description: 'Advanced AI creates contextually relevant questions about Rwanda civic education'
    },
    {
      icon: Target,
      title: 'Difficulty Levels',
      description: 'Choose from Beginner, Intermediate, or Advanced based on your knowledge level'
    },
    {
      icon: BookOpen,
      title: 'Topic-Specific',
      description: 'Focus on specific areas like governance, democracy, history, rights, institutions, or development'
    },
    {
      icon: Clock,
      title: 'Customizable Length',
      description: 'Generate 5, 10, or 15 questions depending on your available time'
    },
    {
      icon: Award,
      title: 'Achievement System',
      description: 'Earn points and badges for completing AI-generated quizzes'
    },
    {
      icon: Sparkles,
      title: 'Rwanda-Focused',
      description: 'All content specifically tailored to Rwanda\'s unique civic systems and governance'
    }
  ];

  const topics = [
    {
      name: 'Governance & Institutions',
      description: 'Constitution, government structure, parliamentary system, local administration',
      examples: ['Rwanda Constitution', 'Parliamentary procedures', 'Local government structure', 'Executive powers']
    },
    {
      name: 'Democratic Processes',
      description: 'Elections, voting rights, citizen participation, community engagement',
      examples: ['Voting procedures', 'Umuganda community service', 'National Dialogue Council', 'Electoral system']
    },
    {
      name: 'History & National Identity',
      description: 'Pre-colonial period, independence, post-genocide reconstruction, national symbols',
      examples: ['Traditional governance', 'Independence history', 'Unity and reconciliation', 'National symbols']
    },
    {
      name: 'Rights & Responsibilities',
      description: 'Constitutional rights, gender equality, civic duties, legal framework',
      examples: ['Bill of Rights', 'Gender representation', 'Citizen obligations', 'Legal protections']
    },
    {
      name: 'Public Institutions',
      description: 'Government agencies, public services, regulatory bodies, service delivery',
      examples: ['Rwanda Revenue Authority', 'Rwanda Governance Board', 'Public service delivery', 'Regulatory bodies']
    },
    {
      name: 'Development & Vision',
      description: 'Vision 2050, development strategies, sustainability, economic growth',
      examples: ['Vision 2050 goals', 'NST1 strategy', 'Sustainable development', 'Economic transformation']
    }
  ];

  const tabs = [
    { id: 'features', label: 'Features', icon: Sparkles },
    { id: 'topics', label: 'Topics', icon: BookOpen },
    { id: 'howto', label: 'How to Use', icon: Info }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-8 h-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">AI Quiz Generation</h2>
                <p className="text-blue-100">Powered by CivicSpark AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${
                  currentTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentTab === 'features' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {currentTab === 'topics' && (
            <div className="space-y-4">
              {topics.map((topic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <h3 className="font-semibold text-lg mb-2">{topic.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{topic.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {topic.examples.map((example, exIndex) => (
                      <span
                        key={exIndex}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {currentTab === 'howto' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <h3 className="font-semibold">Quick Start</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The AI quiz generator is ready to use! Just click "Generate AI Quiz" and customize your preferences.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Step-by-Step Guide</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                    <div>
                      <h4 className="font-medium">Open Quiz Generator</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Click "Generate AI Quiz" button on the quiz page</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                    <div>
                      <h4 className="font-medium">Choose Difficulty</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Select Beginner, Intermediate, or Advanced based on your knowledge level</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                    <div>
                      <h4 className="font-medium">Select Topic</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Choose which aspect of Rwanda civic education you want to focus on</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</div>
                    <div>
                      <h4 className="font-medium">Set Question Count</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pick 5, 10, or 15 questions depending on your available time</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">5</div>
                    <div>
                      <h4 className="font-medium">Generate & Take Quiz</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Click "Generate Quiz" and then "Start Quiz" when it appears in the list</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
                  <h3 className="font-semibold">Current Status</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The AI quiz generator currently uses a mock service with pre-written questions. 
                  For full AI integration, configure your preferred AI service (OpenAI, Anthropic, etc.) in the environment settings.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Powered by CivicSpark AI • Rwanda Civic Education
            </div>
            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
