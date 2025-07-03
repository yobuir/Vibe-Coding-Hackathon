'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  AlertCircle,
  History,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchQuizWithQuestions, 
  createQuizAttempt, 
  submitQuizAnswer, 
  completeQuizAttempt, 
  fetchUserQuizAttempts,
  fetchAttemptAnswers
} from '@/lib/dataAccess';
import { useRouter, useParams } from 'next/navigation';

export default function QuizDetailPage() {
  const params = useParams();
  const id = params.id;
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [previousAttempts, setPreviousAttempts] = useState([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [attemptAnswers, setAttemptAnswers] = useState([]);
  const { user } = useAuth();
  const router = useRouter();

  // Load quiz data
  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        
        const result = await fetchQuizWithQuestions(id);
        
        if (result.success) {
          setQuiz(result.data);
          
          // If there's a time limit, initialize the countdown
          if (result.data.time_limit_seconds) {
            setTimeRemaining(result.data.time_limit_seconds);
          }
          
          // Create a quiz attempt
          if (user) {
            // Get previous attempts
            const previousAttemptsResult = await fetchUserQuizAttempts(user.id, result.data.id);
            if (previousAttemptsResult.success) {
              setPreviousAttempts(previousAttemptsResult.data);
            }
            
            // Create new attempt
            const attemptResult = await createQuizAttempt(user.id, result.data.id);
            if (attemptResult.success) {
              setAttemptId(attemptResult.data.id);
            } else {
              console.error('Failed to create quiz attempt:', attemptResult.error);
            }
          }
        } else {
          setError('Failed to load quiz');
          console.error('Error loading quiz:', result.error);
        }
      } catch (err) {
        setError('Error loading quiz');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadQuiz();
    }
  }, [id, user]);

  // Handle countdown timer
  useEffect(() => {
    if (!timeRemaining || quizCompleted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCompleteQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, quizCompleted]);

  const formatTime = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelection = (questionId, optionId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId
    });

    // Submit the answer in the background
    if (attemptId) {
      submitQuizAnswer(attemptId, questionId, optionId);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleCompleteQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleCompleteQuiz = async () => {
    if (!attemptId) return;
    
    try {
      setSubmitting(true);
      const result = await completeQuizAttempt(attemptId);
      
      if (result.success) {
        setQuizCompleted(true);
        setResult(result.data);
      } else {
        setError('Failed to complete quiz');
        console.error('Error completing quiz:', result.error);
      }
    } catch (err) {
      setError('Error completing quiz');
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewAttempts = async () => {
    if (!user || !quiz) return;
    
    try {
      setLoading(true);
      // Fetch previous attempts for the quiz
      const attemptsResult = await fetch(`/api/quizzes/${quiz.id}/attempts?userId=${user.id}`);
      const attemptsData = await attemptsResult.json();
      
      if (attemptsResult.ok) {
        setPreviousAttempts(attemptsData);
        
        // If there's at least one attempt, load the first attempt's answers
        if (attemptsData.length > 0) {
          setAttemptId(attemptsData[0].id);
          setAttemptAnswers(attemptsData[0].answers);
          setShowAnswers(true);
        }
      } else {
        console.error('Failed to fetch attempts:', attemptsData);
      }
    } catch (err) {
      console.error('Error fetching attempts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryQuiz = async () => {
    try {
      setSubmitting(true);
      
      // Reset quiz state
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setQuizCompleted(false);
      setResult(null);
      setShowAnswers(false);
      setAttemptAnswers([]);
      
      // Reset timer if there was a time limit
      if (quiz && quiz.time_limit_seconds) {
        setTimeRemaining(quiz.time_limit_seconds);
      }
      
      // Create a new attempt
      if (user) {
        const attemptResult = await createQuizAttempt(user.id, quiz.id);
        if (attemptResult.success) {
          setAttemptId(attemptResult.data.id);
        } else {
          setError('Failed to start a new quiz attempt');
        }
      }
    } catch (err) {
      console.error('Error retrying quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowAnswers = async () => {
    if (!result) return;
    
    try {
      setSubmitting(true);
      const answersResult = await fetchAttemptAnswers(attemptId);
      
      if (answersResult.success) {
        setAttemptAnswers(answersResult.data);
        setShowAnswers(!showAnswers);
      } else {
        console.error('Error fetching attempt answers:', answersResult.error);
      }
    } catch (err) {
      console.error('Error fetching attempt answers:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <Navigation />
        <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-lg text-slate-600 dark:text-slate-400">Loading quiz...</p>
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
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
            <button 
              onClick={() => router.push('/quiz')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Back to Quizzes
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <Navigation />
        <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-lg text-amber-600 dark:text-amber-400">Quiz not found</p>
            <button 
              onClick={() => router.push('/quiz')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Back to Quizzes
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Display quiz result if completed
  if (quizCompleted && result) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <Navigation />
        <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm mb-6">
              <div className="text-center mb-8">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                  result.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {result.passed ? (
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <h2 className="text-2xl font-bold mt-4">
                  {result.passed ? 'Quiz Passed!' : 'Quiz Failed'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  You scored {result.score} out of {result.max_possible_score} points 
                  ({Math.round(result.percentage_score)}%)
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Your Score</span>
                    <span className="font-semibold">{Math.round(result.percentage_score)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${
                        result.passed ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.round(result.percentage_score)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Passing Score</span>
                    <span className="font-semibold">{quiz.passing_score || 70}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full">
                    <div 
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${quiz.passing_score || 70}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleShowAnswers}
                  className="w-full px-4 py-3 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors mb-4"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : showAnswers ? (
                    <EyeOff className="w-5 h-5 mr-2" />
                  ) : (
                    <Eye className="w-5 h-5 mr-2" />
                  )}
                  {showAnswers ? 'Hide Answers' : 'View Correct Answers'}
                </button>
              </div>
              
              {showAnswers && attemptAnswers.length > 0 && (
                <div className="mt-8 space-y-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                  <h3 className="text-xl font-semibold mb-4">Question Review</h3>
                  
                  {attemptAnswers.map((answer, index) => (
                    <div key={answer.id} className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg">
                      <p className="font-medium mb-2">
                        {index + 1}. {answer.quiz_questions.question_text}
                      </p>
                      
                      <div className="ml-6 mb-4">
                        <p className="flex items-center mb-1">
                          <span className="mr-2">Your answer:</span> 
                          <span className={answer.is_correct ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                            {answer.answer_options?.option_text || 'No answer'}
                            {answer.is_correct ? (
                              <CheckCircle className="w-4 h-4 inline ml-1" />
                            ) : (
                              <XCircle className="w-4 h-4 inline ml-1" />
                            )}
                          </span>
                        </p>
                        
                        {!answer.is_correct && (
                          <p className="flex items-center text-green-600 dark:text-green-400">
                            <span className="mr-2">Correct answer:</span>
                            <span className="font-medium">
                              {quiz.questions
                                .find(q => q.id === answer.question_id)?.options
                                .find(o => o.is_correct)?.option_text || 'Unknown'}
                            </span>
                          </p>
                        )}
                      </div>
                      
                      {answer.quiz_questions.explanation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-500 dark:border-blue-400 text-sm">
                          <p className="font-medium mb-1">Explanation:</p>
                          <p className="text-slate-700 dark:text-slate-300">{answer.quiz_questions.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Attempts List */}
            {previousAttempts.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Previous Attempts</h3>
                
                <div className="space-y-4">
                  {previousAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-600 dark:text-slate-400 text-sm">
                          Attempted on {new Date(attempt.created_at).toLocaleString()}
                        </span>
                        
                        <div className="flex items-center">
                          <span className={`text-xs font-semibold rounded-full px-3 py-1 mr-2 ${
                            attempt.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {attempt.passed ? 'Passed' : 'Failed'}
                          </span>
                          
                          <button
                            onClick={() => {
                              setAttemptId(attempt.id);
                              setAttemptAnswers(attempt.answers);
                              setShowAnswers(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View Answers
                          </button>
                        </div>
                      </div>
                      
                      {showAnswers && attemptId === attempt.id && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2">Your Answers</h4>
                          
                          <div className="space-y-2">
                            {Object.entries(attemptAnswers).map(([questionId, optionId]) => {
                              const question = quiz.questions.find(q => q.id === questionId);
                              const option = question?.options.find(o => o.id === optionId);
                              
                              return (
                                <div key={questionId} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                  <p className="text-slate-700 dark:text-slate-300 text-sm mb-1">
                                    {question?.question_text}
                                  </p>
                                  <p className={`text-sm font-semibold ${
                                    option?.is_correct ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {option?.option_text}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Retry Quiz Button */}
            {previousAttempts.length > 0 && !quizCompleted && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleRetryQuiz}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry Quiz
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Display current question
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const hasSelected = selectedAnswers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Navigation />
      <main className="flex-1 pt-16 pb-12 px-4 md:px-8 ml-0 md:ml-64">
        <div className="max-w-3xl mx-auto">
          {/* Quiz Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => router.push('/quiz')}
                className="flex items-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
              </button>
              
              {timeRemaining && (
                <div className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                  <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400 mr-2" />
                  <span className={`font-mono ${timeRemaining < 30 ? 'text-red-600 dark:text-red-400' : ''}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{quiz.description}</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mb-2">
              <div 
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}% complete</span>
            </div>
          </div>
          
          {/* Question */}
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm mb-6"
          >
            <h2 className="text-xl font-semibold mb-6">
              {currentQuestion.question_text}
            </h2>
            
            {/* Answer Options */}
            <div className="space-y-4">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleAnswerSelection(currentQuestion.id, option.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedAnswers[currentQuestion.id] === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mr-3 ${
                      selectedAnswers[currentQuestion.id] === option.id
                        ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {selectedAnswers[currentQuestion.id] === option.id && (
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className={`${
                      selectedAnswers[currentQuestion.id] === option.id
                        ? 'text-slate-900 dark:text-slate-100 font-medium'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {option.option_text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-2 rounded-lg ${
                currentQuestionIndex === 0
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
              } transition-colors`}
            >
              Previous
            </button>
            
            <button
              onClick={isLastQuestion ? handleCompleteQuiz : handleNextQuestion}
              disabled={!hasSelected || submitting}
              className={`px-6 py-2 rounded-lg flex items-center ${
                !hasSelected || submitting
                  ? 'bg-blue-300 dark:bg-blue-800/50 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } transition-colors`}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLastQuestion ? 'Complete Quiz' : 'Next'}
              {!submitting && !isLastQuestion && <ChevronRight className="w-4 h-4 ml-2" />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
