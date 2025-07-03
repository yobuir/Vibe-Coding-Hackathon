'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Clock, 
  Trophy, 
  Star, 
  ChevronRight,
  BookOpen,
  Target,
  Award,
  Loader2,
  Sparkles,
  Brain,
  Plus,
  RefreshCw,
  MapPin,
  Users,
  Building,
  Flag,
  Scale,
  Vote,
  Info
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import AIQuizInfo from '@/components/AIQuizInfo';
import { useAuth } from '@/context/AuthContext';
import { fetchPublishedQuizzes, getUserQuizStats, generateAIQuiz } from '@/lib/dataAccess';

// AI Prompt for Rwanda Civic Education Quiz Generation
const RWANDA_CIVIC_AI_PROMPT = `
You are CivicSpark AI, an expert in Rwanda's civic education and governance. Generate comprehensive, accurate, and engaging quiz questions about Rwanda's civic systems, history, and contemporary governance.

CONTEXT AND SCOPE:
- Focus exclusively on Rwanda's civic education, governance, history, and democratic processes
- Target different knowledge levels: Beginner, Intermediate, Advanced
- Ensure cultural sensitivity and accuracy
- Include practical, real-world applications

RWANDA-SPECIFIC TOPICS TO COVER:
1. GOVERNANCE & INSTITUTIONS:
   - Constitution of Rwanda (2003, amended 2015)
   - Structure of government (Executive, Legislative, Judicial)
   - President, Prime Minister, and Cabinet roles
   - Parliament (Chamber of Deputies, Senate)
   - Local government (Districts, Sectors, Cells, Villages)
   - Rwanda Governance Board (RGB)
   - National Unity and Reconciliation Commission

2. DEMOCRATIC PROCESSES:
   - Electoral system and voting rights
   - Political parties and their roles
   - Citizen participation mechanisms
   - Community service (Umuganda)
   - National Dialogue Council (Umushyikirano)
   - Citizen feedback mechanisms

3. HISTORY & NATIONAL IDENTITY:
   - Pre-colonial Rwanda
   - Colonial period and its impact
   - 1994 Genocide against the Tutsi
   - Post-genocide reconstruction
   - Unity and reconciliation efforts
   - National symbols and their meanings

4. RIGHTS & RESPONSIBILITIES:
   - Bill of Rights in Rwanda's Constitution
   - Gender equality and women's representation
   - Youth rights and responsibilities
   - Freedom of expression and its limits
   - Right to information
   - Civic duties and obligations

5. INSTITUTIONS & SERVICES:
   - National institutions (NISR, RRA, etc.)
   - Public service delivery
   - Education system and civic education
   - Healthcare system
   - Justice system and Gacaca courts
   - Anti-corruption efforts

6. DEVELOPMENT & VISION:
   - Vision 2050
   - National Strategy for Transformation (NST1)
   - Sustainable Development Goals in Rwanda
   - Economic development initiatives
   - Digital transformation (Digital Rwanda)
   - Environmental protection and green growth

QUESTION GENERATION GUIDELINES:
- Generate 5-10 multiple choice questions per request
- Include 4 options (A, B, C, D) for each question
- Provide clear, educational explanations for correct answers
- Vary difficulty levels based on user's profile
- Include scenario-based questions for practical application
- Ensure questions are culturally appropriate and current
- Reference specific laws, policies, or institutions when relevant

DIFFICULTY LEVELS:
- Beginner: Basic facts, simple concepts, fundamental rights
- Intermediate: Relationships between institutions, processes, recent developments
- Advanced: Complex policy analysis, historical connections, comparative governance

RESPONSE FORMAT:
Return a JSON object with this structure:
{
  "quiz_title": "Rwanda Civic Knowledge Quiz",
  "difficulty_level": "beginner|intermediate|advanced",
  "estimated_time": "5-10 minutes",
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "options": {
        "A": "Option A",
        "B": "Option B", 
        "C": "Option C",
        "D": "Option D"
      },
      "correct_answer": "A",
      "explanation": "Detailed explanation of why this is correct and educational context",
      "topic": "governance|democracy|history|rights|institutions|development",
      "difficulty": "beginner|intermediate|advanced"
    }
  ],
  "learning_objectives": ["Objective 1", "Objective 2"],
  "additional_resources": ["Resource 1", "Resource 2"]
}

SAMPLE QUESTIONS BY DIFFICULTY:

BEGINNER:
"What is the capital city of Rwanda?"
"In which year did Rwanda adopt its current constitution?"
"What is Umuganda?"

INTERMEDIATE:
"How many members are in Rwanda's Chamber of Deputies?"
"What is the role of the National Unity and Reconciliation Commission?"
"Which institution is responsible for tax collection in Rwanda?"

ADVANCED:
"How does Rwanda's electoral system ensure gender representation in parliament?"
"What are the key principles of Rwanda's post-genocide justice system?"
"How does the National Dialogue Council contribute to participatory governance?"

Remember to:
- Use current, accurate information
- Respect Rwanda's cultural values
- Promote civic engagement
- Encourage critical thinking
- Support Rwanda's unity and reconciliation efforts
- Reference official sources when possible
`;

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [userStats, setUserStats] = useState({
    completed: 0,
    averageScore: 0
  });
  const [showGenerator, setShowGenerator] = useState(false);
  const [showAIInfo, setShowAIInfo] = useState(false);
  const [quizPreferences, setQuizPreferences] = useState({
    difficulty: 'intermediate',
    topic: 'governance',
    questionCount: 5
  });
  const { user } = useAuth();

  // Rwanda-specific topics
  const rwandaTopics = [
    { id: 'governance', label: 'Governance & Institutions', icon: Building },
    { id: 'democracy', label: 'Democratic Processes', icon: Vote },
    { id: 'history', label: 'History & National Identity', icon: Flag },
    { id: 'rights', label: 'Rights & Responsibilities', icon: Scale },
    { id: 'institutions', label: 'Public Institutions', icon: Users },
    { id: 'development', label: 'Development & Vision 2050', icon: Target }
  ];

  useEffect(() => {
    async function loadQuizzes() {
      try {
        setLoading(true);
        const quizResult = await fetchPublishedQuizzes();
        
        if (quizResult.success) {
          setQuizzes(quizResult.data);
        } else {
          setError('Failed to load quizzes');
          console.error('Error loading quizzes:', quizResult.error);
        }

        if (user) {
          const statsResult = await getUserQuizStats(user.id);
          if (statsResult.success) {
            setUserStats({
              completed: statsResult.data.completed || 0,
              averageScore: statsResult.data.averageScore || 0
            });
          } else {
            console.error('Error loading user stats:', statsResult.error);
          }
        }
      } catch (err) {
        setError('Error loading quizzes');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadQuizzes();
  }, [user]);

  const handleGenerateQuiz = async () => {
    if (!user) {
      alert('Please login to generate quizzes');
      return;
    }

    setGeneratingQuiz(true);
    try {
      // Prepare the AI prompt with user preferences
      const customPrompt = `${RWANDA_CIVIC_AI_PROMPT}

USER PREFERENCES:
- Difficulty Level: ${quizPreferences.difficulty}
- Topic Focus: ${quizPreferences.topic}
- Number of Questions: ${quizPreferences.questionCount}
- User Location: Rwanda (customize for local context)

Please generate ${quizPreferences.questionCount} questions focused on ${quizPreferences.topic} at ${quizPreferences.difficulty} level.`;

      // Call your AI service (replace with your actual API call)
      const response = await generateAIQuiz({
        prompt: customPrompt,
        userId: user.id,
        preferences: quizPreferences
      });

      if (response.success) {
        // Add the generated quiz to the quizzes list
        setQuizzes([response.data, ...quizzes]);
        setShowGenerator(false);
        // Show success message
        alert('Quiz generated successfully! You can now take the quiz.');
      } else {
        throw new Error(response.error || 'Failed to generate quiz');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatTimeLimit = (seconds) => {
    if (!seconds) return 'No time limit';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <Navigation />
        <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-lg text-slate-600 dark:text-slate-400">Loading quizzes...</p>
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
            <Trophy className="w-12 h-12 text-red-500 mx-auto mb-4" />
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center">
                  <Flag className="w-8 h-8 mr-3 text-blue-600" />
                  Rwanda Civic Knowledge Quizzes
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Test your understanding of Rwanda's governance, history, and civic systems.
                </p>
              </div>
            <div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowGenerator(!showGenerator)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center group"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Generate AI Quiz
                  <Sparkles className="w-4 h-4 ml-2 group-hover:animate-pulse" />
                </button>
                <button
                  onClick={() => setShowAIInfo(true)}
                  className="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-lg font-medium hover:shadow-md transition-all duration-200 flex items-center border border-blue-200 dark:border-blue-800"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Learn About AI Quizzes
                </button>
              </div>
            </div>
            </div>
          </div>

          {/* AI Quiz Generator */}
          {showGenerator && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-8 border border-blue-200 dark:border-blue-800"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-blue-500" />
                AI Quiz Generator
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                  <select
                    value={quizPreferences.difficulty}
                    onChange={(e) => setQuizPreferences({...quizPreferences, difficulty: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Topic Focus</label>
                  <select
                    value={quizPreferences.topic}
                    onChange={(e) => setQuizPreferences({...quizPreferences, topic: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                  >
                    {rwandaTopics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Questions</label>
                  <select
                    value={quizPreferences.questionCount}
                    onChange={(e) => setQuizPreferences({...quizPreferences, questionCount: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                  >
                    <option value="5">5 Questions</option>
                    <option value="10">10 Questions</option>
                    <option value="15">15 Questions</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowGenerator(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateQuiz}
                  disabled={generatingQuiz}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {generatingQuiz ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Quiz
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                  <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{quizzes.length}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Available Quizzes</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.completed}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mr-4">
                  <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.averageScore ? userStats.averageScore.toFixed(1) : '0'}%</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Average Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rwanda Topics Overview */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-green-600" />
              Rwanda Civic Education Topics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rwandaTopics.map(topic => {
                const Icon = topic.icon;
                return (
                  <div key={topic.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <Icon className="w-6 h-6 mr-3 text-blue-500" />
                      <span className="font-medium">{topic.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quiz Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  {/* Quiz Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                        {quiz.description}
                      </p>
                    </div>
                    {quiz.ai_generated && (
                      <div className="ml-2">
                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                          <Brain className="w-3 h-3 mr-1" />
                          AI
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quiz Metadata */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {formatTimeLimit(quiz.time_limit_seconds)}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty_level)}`}>
                        {quiz.difficulty_level || 'Beginner'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Target className="w-4 h-4 mr-2 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        Passing Score: {quiz.passing_score || 70}%
                      </span>
                    </div>

                    {quiz.tags && quiz.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {quiz.tags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                        {quiz.tags.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-md">
                            +{quiz.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center group"
                    onClick={() => {
                      window.location.href = `/quiz/${quiz.id}`;
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Quiz
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {quizzes.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
                No Quizzes Available Yet
              </h3>
              <p className="text-slate-500 dark:text-slate-500 mb-6">
                Generate your first AI-powered Rwanda civic quiz to get started!
              </p>
              <button
                onClick={() => setShowGenerator(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center mx-auto"
              >
                <Brain className="w-5 h-5 mr-2" />
                Generate Your First Quiz
              </button>
            </div>
          )}
        </div>

        {/* AI Quiz Info Modal */}
        {showAIInfo && (
          <AIQuizInfo onClose={() => setShowAIInfo(false)} />
        )}
      </main>
    </div>
  );
}