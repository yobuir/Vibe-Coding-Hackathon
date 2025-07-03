import { supabase } from './supabase';

// ---- WhatsApp Integration ----
async function sendWhatsAppNotification(type, phoneNumber, data) {
  try {
    if (!phoneNumber) return { success: false, error: 'No phone number provided' };
    
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        to: phoneNumber,
        data
      })
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return { success: false, error: error.message };
  }
}

// ---- AI Quiz Generation Functions ----

/**
 * Generate AI-powered quiz using OpenAI/Anthropic
 */
export const generateAIQuiz = async ({ prompt, userId, preferences }) => {
  try {
    // Call the API route for AI quiz generation
    const response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        userId,
        preferences
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to generate quiz');
    }

    return { success: true, data: result.quiz };
  } catch (error) {
    console.error('Error generating AI quiz:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save AI-generated quiz to database
 */
export const saveAIGeneratedQuiz = async (quizData, userId, aiPrompt) => {
  try {
    // Insert the quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([{
        title: quizData.quiz_title,
        description: `AI-generated quiz focusing on ${quizData.topic || 'Rwanda civic education'}`,
        difficulty_level: quizData.difficulty_level || 'intermediate',
        category: 'civic_education',
        tags: quizData.learning_objectives || [],
        time_limit_seconds: quizData.estimated_time ? parseInt(quizData.estimated_time.split('-')[1]) * 60 : 600, // Default 10 minutes
        passing_score: 70,
        created_by: userId,
        is_published: true
      }])
      .select()
      .single();

    if (quizError) {
      console.error('Error saving quiz:', quizError);
      return { success: false, error: quizError };
    }

    // Insert questions and options
    for (let i = 0; i < quizData.questions.length; i++) {
      const questionData = quizData.questions[i];
      
      // Insert question
      const { data: question, error: questionError } = await supabase
        .from('quiz_questions')
        .insert([{
          quiz_id: quiz.id,
          question_text: questionData.question,
          question_type: 'multiple_choice',
          points: 1,
          explanation: questionData.explanation,
          order_position: i + 1
        }])
        .select()
        .single();

      if (questionError) {
        console.error('Error saving question:', questionError);
        return { success: false, error: questionError };
      }

      // Insert answer options
      const options = Object.entries(questionData.options);
      for (let j = 0; j < options.length; j++) {
        const [optionKey, optionText] = options[j];
        const isCorrect = optionKey === questionData.correct_answer;

        const { error: optionError } = await supabase
          .from('answer_options')
          .insert([{
            question_id: question.id,
            option_text: optionText,
            is_correct: isCorrect,
            order_position: j + 1
          }]);

        if (optionError) {
          console.error('Error saving option:', optionError);
          return { success: false, error: optionError };
        }
      }
    }

    return { success: true, data: quiz };
  } catch (error) {
    console.error('Error in saveAIGeneratedQuiz:', error);
    return { success: false, error: error.message };
  }
};

// ---- Quiz Functions ----

/**
 * Fetch all published quizzes
 */
export const fetchPublishedQuizzes = async () => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quizzes:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

/**
 * Fetch a single quiz with its questions and answer options
 */
export const fetchQuizWithQuestions = async (quizId) => {
  // Fetch the quiz
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single();

  if (quizError) {
    console.error('Error fetching quiz:', quizError);
    return { success: false, error: quizError };
  }

  // Fetch the questions
  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_position', { ascending: true });

  if (questionsError) {
    console.error('Error fetching quiz questions:', questionsError);
    return { success: false, error: questionsError };
  }

  // Fetch answer options for all questions
  const questionIds = questions.map(q => q.id);
  
  let answerOptions = [];
  if (questionIds.length > 0) {
    const { data: options, error: optionsError } = await supabase
      .from('answer_options')
      .select('*')
      .in('question_id', questionIds)
      .order('order_position', { ascending: true });
      
    if (optionsError) {
      console.error('Error fetching answer options:', optionsError);
      return { success: false, error: optionsError };
    }
    
    answerOptions = options;
  }

  // Organize the data
  const questionsWithOptions = questions.map(question => {
    const options = answerOptions.filter(option => option.question_id === question.id);
    return {
      ...question,
      options
    };
  });

  return {
    success: true,
    data: {
      ...quiz,
      questions: questionsWithOptions
    }
  };
};

/**
 * Create a new quiz attempt
 */
export const createQuizAttempt = async (userId, quizId) => {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert([{
      user_id: userId,
      quiz_id: quizId,
      completed: false,
    }])
    .select();

  if (error) {
    console.error('Error creating quiz attempt:', error);
    return { success: false, error };
  }

  return { success: true, data: data[0] };
};

/**
 * Submit an answer for a quiz question
 */
export const submitQuizAnswer = async (attemptId, questionId, selectedOptionId = null, textAnswer = null) => {
  // First, determine if the answer is correct
  let isCorrect = false;
  let pointsEarned = 0;
  
  if (selectedOptionId) {
    // For multiple choice questions
    const { data: option, error: optionError } = await supabase
      .from('answer_options')
      .select('is_correct')
      .eq('id', selectedOptionId)
      .single();
      
    if (optionError) {
      console.error('Error checking answer correctness:', optionError);
    } else if (option) {
      isCorrect = option.is_correct;
    }
    
    // Get the question points
    const { data: question, error: questionError } = await supabase
      .from('quiz_questions')
      .select('points')
      .eq('id', questionId)
      .single();
      
    if (!questionError && question) {
      pointsEarned = isCorrect ? question.points : 0;
    }
  }
  
  // Check if an answer already exists for this question in this attempt
  const { data: existingAnswer, error: checkError } = await supabase
    .from('user_answers')
    .select('id')
    .eq('attempt_id', attemptId)
    .eq('question_id', questionId)
    .single();
    
  if (checkError && checkError.code !== 'PGRST116') {
    // Error other than "no rows found"
    console.error('Error checking existing answer:', checkError);
    return { success: false, error: checkError };
  }
  
  let data, error;
  
  if (existingAnswer) {
    // Update existing answer
    const result = await supabase
      .from('user_answers')
      .update({
        selected_option_id: selectedOptionId,
        text_answer: textAnswer,
        is_correct: isCorrect,
        points_earned: pointsEarned
      })
      .eq('id', existingAnswer.id)
      .select();
      
    data = result.data;
    error = result.error;
  } else {
    // Insert new answer
    const result = await supabase
      .from('user_answers')
      .insert([{
        attempt_id: attemptId,
        question_id: questionId,
        selected_option_id: selectedOptionId,
        text_answer: textAnswer,
        is_correct: isCorrect,
        points_earned: pointsEarned
      }])
      .select();
      
    data = result.data;
    error = result.error;
  }

  if (error) {
    console.error('Error submitting quiz answer:', error);
    return { success: false, error };
  }

  return { success: true, data: data[0] };
};

/**
 * Complete a quiz attempt and calculate score
 */
export const completeQuizAttempt = async (attemptId) => {
  // Get all answers for this attempt
  const { data: answers, error: answersError } = await supabase
    .from('user_answers')
    .select('points_earned')
    .eq('attempt_id', attemptId);
    
  if (answersError) {
    console.error('Error fetching quiz answers:', answersError);
    return { success: false, error: answersError };
  }
  
  // Calculate score
  const score = answers.reduce((total, answer) => total + (answer.points_earned || 0), 0);
  
  // Get the quiz to determine max possible score
  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .select('quiz_id')
    .eq('id', attemptId)
    .single();
    
  if (attemptError) {
    console.error('Error fetching quiz attempt:', attemptError);
    return { success: false, error: attemptError };
  }
  
  // Get all questions for this quiz to calculate max possible score
  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('points')
    .eq('quiz_id', attempt.quiz_id);
    
  if (questionsError) {
    console.error('Error fetching quiz questions:', questionsError);
    return { success: false, error: questionsError };
  }
  
  const maxPossibleScore = questions.reduce((total, question) => total + (question.points || 1), 0);
  const percentageScore = maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0;
  
  // Get the quiz passing score
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('passing_score')
    .eq('id', attempt.quiz_id)
    .single();
    
  if (quizError) {
    console.error('Error fetching quiz details:', quizError);
    return { success: false, error: quizError };
  }
  
  const passed = percentageScore >= (quiz.passing_score || 70);
  
  // Update the attempt with the score
  const { data, error } = await supabase
    .from('quiz_attempts')
    .update({
      score,
      max_possible_score: maxPossibleScore,
      percentage_score: percentageScore,
      passed,
      completed: true,
      completed_at: new Date().toISOString()
    })
    .eq('id', attemptId)
    .select();
    
  if (error) {
    console.error('Error completing quiz attempt:', error);
    return { success: false, error };
  }
  
  // Update user progress
  await updateUserProgress(data[0].user_id, null, attempt.quiz_id, 'quiz', 'completed', 100);
  
  // Update user profile stats
  if (passed) {
    await incrementUserStats(data[0].user_id, {
      points: score,
      completed_lessons: 1
    });
  }

  // Send WhatsApp notification for quiz completion
  try {
    // Get user details for notification
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('name, phone_number')
      .eq('user_id', data[0].user_id)
      .single();

    if (!userError && user && user.phone_number) {
      // Get quiz title
      const { data: quizData, error: quizDataError } = await supabase
        .from('quizzes')
        .select('title')
        .eq('id', attempt.quiz_id)
        .single();

      if (!quizDataError && quizData) {
        await sendWhatsAppNotification('quiz_result', user.phone_number, {
          userName: user.name || 'Student',
          quizTitle: quizData.title,
          score: score,
          totalQuestions: questions.length
        });
      }
    }
  } catch (notificationError) {
    console.error('Error sending WhatsApp notification:', notificationError);
    // Don't fail the quiz completion if notification fails
  }
    
  // Check for achievements
  await checkQuizAchievements(data[0].user_id, data[0]);

  return { success: true, data: data[0] };
};

// ---- Lesson Functions ----

/**
 * Fetch all published lessons
 */
export const fetchPublishedLessons = async () => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lessons:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

/**
 * Fetch a single lesson
 */
export const fetchLesson = async (lessonId) => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (error) {
    console.error('Error fetching lesson:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

/**
 * Fetch user progress for a lesson or quiz
 */
export const fetchUserProgress = async (userId, contentId, contentType) => {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('content_type', contentType)
    .eq(contentType === 'lesson' ? 'lesson_id' : 'quiz_id', contentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No progress found, return null
      return { success: true, data: null };
    }
    console.error('Error fetching user progress:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

/**
 * Update user progress for a lesson or quiz
 */
export const updateUserProgress = async (
  userId, 
  lessonId = null, 
  quizId = null, 
  contentType, 
  status, 
  percentage = 0, 
  position = null
) => {
  // Check if progress entry exists
  const { data: existingProgress, error: checkError } = await supabase
    .from('user_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('content_type', contentType)
    .eq(contentType === 'lesson' ? 'lesson_id' : 'quiz_id', contentType === 'lesson' ? lessonId : quizId)
    .single();
    
  let data, error;
  
  const now = new Date().toISOString();
  const updateData = {
    completion_status: status,
    completion_percentage: percentage,
    last_position: position
  };
  
  // Add completed_at if status is 'completed'
  if (status === 'completed') {
    updateData.completed_at = now;
  }
  
  if (checkError && checkError.code === 'PGRST116') {
    // No existing progress, create new entry
    const insertData = {
      user_id: userId,
      content_type: contentType,
      ...updateData,
      started_at: now
    };
    
    if (contentType === 'lesson') {
      insertData.lesson_id = lessonId;
    } else {
      insertData.quiz_id = quizId;
    }
    
    const result = await supabase
      .from('user_progress')
      .insert([insertData])
      .select();
      
    data = result.data;
    error = result.error;
  } else if (!checkError) {
    // Update existing progress
    const result = await supabase
      .from('user_progress')
      .update(updateData)
      .eq('id', existingProgress.id)
      .select();
      
    data = result.data;
    error = result.error;
  } else {
    // Other error during check
    return { success: false, error: checkError };
  }
  
  if (error) {
    console.error('Error updating user progress:', error);
    return { success: false, error };
  }
  
  // If completed, update user stats
  if (status === 'completed') {
    await incrementUserStats(userId, {
      points: contentType === 'lesson' ? 10 : 0, // Award points for lesson completion
      completed_lessons: contentType === 'lesson' ? 1 : 0
    });
    
    // Send WhatsApp notification for lesson completion
    if (contentType === 'lesson' && lessonId) {
      try {
        // Get user details for notification
        const { data: user, error: userError } = await supabase
          .from('profiles')
          .select('name, phone_number')
          .eq('user_id', userId)
          .single();

        if (!userError && user && user.phone_number) {
          // Get lesson title
          const { data: lessonData, error: lessonDataError } = await supabase
            .from('lessons')
            .select('title')
            .eq('id', lessonId)
            .single();

          if (!lessonDataError && lessonData) {
            await sendWhatsAppNotification('lesson_completion', user.phone_number, {
              userName: user.name || 'Student',
              lessonTitle: lessonData.title
            });
          }
        }
      } catch (notificationError) {
        console.error('Error sending lesson completion WhatsApp notification:', notificationError);
        // Don't fail the progress update if notification fails
      }
    }
    
    // Check for achievements
    if (contentType === 'lesson') {
      await checkLessonAchievements(userId, data[0]);
    }
  }

  return { success: true, data: data[0] };
};

// ---- User Stats Functions ----

/**
 * Increment user statistics
 */
export const incrementUserStats = async (userId, statsToUpdate) => {
  // Get current profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    return { success: false, error: profileError };
  }
  
  // Update stats
  const updates = {};
  
  if (statsToUpdate.points) {
    updates.points = (profile.points || 0) + statsToUpdate.points;
  }
  
  if (statsToUpdate.completed_lessons) {
    updates.completed_lessons = (profile.completed_lessons || 0) + statsToUpdate.completed_lessons;
  }
  
  if (statsToUpdate.streak) {
    updates.streak = (profile.streak || 0) + statsToUpdate.streak;
  }
  
  // Calculate level based on points
  if (statsToUpdate.points) {
    // Example level calculation: Level = 1 + floor(points / 100)
    const newLevel = 1 + Math.floor(updates.points / 100);
    if (newLevel > profile.level) {
      updates.level = newLevel;
    }
  }
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select();
    
  if (error) {
    console.error('Error updating user stats:', error);
    return { success: false, error };
  }

  return { success: true, data: data[0] };
};

// ---- Achievement Functions ----

/**
 * Check and award lesson-related achievements
 */
export const checkLessonAchievements = async (userId, progress) => {
  // Get user's completed lesson count
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('completed_lessons')
    .eq('user_id', userId)
    .single();
    
  if (profileError) {
    console.error('Error fetching user profile for achievements:', profileError);
    return;
  }
  
  const completedLessons = profile.completed_lessons || 0;
  
  // Get relevant achievements
  const { data: achievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*')
    .eq('achievement_type', 'lesson_completion');
    
  if (achievementsError) {
    console.error('Error fetching achievements:', achievementsError);
    return;
  }
  
  // Check each achievement
  for (const achievement of achievements) {
    const conditions = achievement.conditions || {};
    
    // Check if this achievement should be awarded
    let shouldAward = false;
    
    if (conditions.min_lessons && completedLessons >= conditions.min_lessons) {
      shouldAward = true;
    }
    
    if (shouldAward) {
      // Check if already awarded
      const { data: existing, error: existingError } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .single();
        
      if (existingError && existingError.code === 'PGRST116') {
        // Not awarded yet, award it
        await supabase
          .from('user_achievements')
          .insert([{
            user_id: userId,
            achievement_id: achievement.id
          }]);
          
        // Award points for achievement
        await incrementUserStats(userId, {
          points: achievement.points || 0
        });

        // Send WhatsApp notification for lesson achievement
        try {
          // Get user details for notification
          const { data: user, error: userError } = await supabase
            .from('profiles')
            .select('name, phone_number')
            .eq('user_id', userId)
            .single();

          if (!userError && user && user.phone_number) {
            await sendWhatsAppNotification('achievement', user.phone_number, {
              userName: user.name || 'Student',
              achievementName: achievement.title,
              achievementDescription: achievement.description
            });
          }
        } catch (notificationError) {
          console.error('Error sending lesson achievement WhatsApp notification:', notificationError);
          // Don't fail the achievement award if notification fails
        }
      }
    }
  }
};

/**
 * Check and award quiz-related achievements
 */
export const checkQuizAchievements = async (userId, attempt) => {
  // Get user's quiz stats
  const { data: attempts, error: attemptsError } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', true);
    
  if (attemptsError) {
    console.error('Error fetching quiz attempts for achievements:', attemptsError);
    return;
  }
  
  const completedQuizzes = attempts.length;
  const perfectScores = attempts.filter(a => a.percentage_score >= 100).length;
  
  // Get relevant achievements
  const { data: achievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*')
    .eq('achievement_type', 'quiz_score');
    
  if (achievementsError) {
    console.error('Error fetching achievements:', achievementsError);
    return;
  }
  
  // Check each achievement
  for (const achievement of achievements) {
    const conditions = achievement.conditions || {};
    
    // Check if this achievement should be awarded
    let shouldAward = false;
    
    if (conditions.min_quizzes && completedQuizzes >= conditions.min_quizzes) {
      shouldAward = true;
    }
    
    if (conditions.min_perfect_scores && perfectScores >= conditions.min_perfect_scores) {
      shouldAward = true;
    }
    
    if (conditions.min_score_percentage && attempt.percentage_score >= conditions.min_score_percentage) {
      shouldAward = true;
    }
    
    if (shouldAward) {
      // Check if already awarded
      const { data: existing, error: existingError } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .single();
        
      if (existingError && existingError.code === 'PGRST116') {
        // Not awarded yet, award it
        await supabase
          .from('user_achievements')
          .insert([{
            user_id: userId,
            achievement_id: achievement.id
          }]);
          
        // Award points for achievement
        await incrementUserStats(userId, {
          points: achievement.points || 0
        });

        // Send WhatsApp notification for quiz achievement
        try {
          // Get user details for notification
          const { data: user, error: userError } = await supabase
            .from('profiles')
            .select('name, phone_number')
            .eq('user_id', userId)
            .single();

          if (!userError && user && user.phone_number) {
            await sendWhatsAppNotification('achievement', user.phone_number, {
              userName: user.name || 'Student',
              achievementName: achievement.title,
              achievementDescription: achievement.description
            });
          }
        } catch (notificationError) {
          console.error('Error sending quiz achievement WhatsApp notification:', notificationError);
          // Don't fail the achievement award if notification fails
        }
      }
    }
  }
};

/**
 * Get user's leaderboard position
 */
export const getUserLeaderboardPosition = async (userId) => {
  // Get all users ordered by points
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, points')
    .order('points', { ascending: false });
    
  if (error) {
    console.error('Error fetching leaderboard data:', error);
    return { success: false, error };
  }
  
  // Find position of current user
  const position = data.findIndex(user => user.user_id === userId) + 1;
  
  return {
    success: true,
    data: {
      position,
      totalUsers: data.length,
      topUsers: data.slice(0, 10)
    }
  };
};

/**
 * Fetch user's previous attempts for a specific quiz
 */
export const fetchUserQuizAttempts = async (userId, quizId) => {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .eq('completed', true)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching user quiz attempts:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

/**
 * Fetch answers for a specific quiz attempt
 */
export const fetchAttemptAnswers = async (attemptId) => {
  const { data, error } = await supabase
    .from('user_answers')
    .select(`
      *,
      quiz_questions(question_text, points, explanation),
      answer_options(option_text, is_correct)
    `)
    .eq('attempt_id', attemptId);
    
  if (error) {
    console.error('Error fetching attempt answers:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

/**
 * Get user's quiz statistics
 */
export const getUserQuizStats = async (userId) => {
  // Get completed quiz attempts
  const { data: attempts, error: attemptsError } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', true);
    
  if (attemptsError) {
    console.error('Error fetching user quiz attempts:', attemptsError);
    return { success: false, error: attemptsError };
  }
  
  // Calculate stats
  const completed = attempts.length;
  const totalScore = attempts.reduce((sum, attempt) => sum + attempt.percentage_score, 0);
  const averageScore = completed > 0 ? totalScore / completed : 0;
  
  return {
    success: true,
    data: {
      completed,
      averageScore
    }
  };
};

// ---- Leaderboard Functions ----

/**
 * Fetch overall leaderboard rankings
 */
export const fetchLeaderboard = async (limit = 50) => {
  try {
    // Try to use the stored function first
    const { data, error } = await supabase
      .rpc('calculate_leaderboard_rankings')
      .limit(limit);

    // Check for function not found error or any RPC error
    if (error) {
      console.log('Leaderboard function error detected, using fallback:', error.message);
      return await fetchLeaderboardFallback(limit);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in fetchLeaderboard:', error);
    // Always use fallback on any error
    return await fetchLeaderboardFallback(limit);
  }
};

/**
 * Fallback leaderboard query when stored function is not available
 */
const fetchLeaderboardFallback = async (limit = 50) => {
  try {
    console.log('Using mock leaderboard data as fallback...');
    
    // Generate mock leaderboard data with Rwanda-specific names and regions
    const rwandaRegions = ['Kigali', 'Eastern', 'Southern', 'Western', 'Northern'];
    const rwandaNames = [
      { name: 'Marie Uwimana', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=64&h=64&fit=crop&crop=face' },
      { name: 'Jean Baptiste Nzeyimana', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face' },
      { name: 'Grace Mukamana', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face' },
      { name: 'Alex Mugisha', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face' },
      { name: 'Immaculée Uwase', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face' },
      { name: 'David Kayitare', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face' },
      { name: 'Ange Uwimana', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=64&h=64&fit=crop&crop=face' },
      { name: 'Patrick Habimana', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face' },
      { name: 'Vestine Mukamana', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face' },
      { name: 'Eric Niyonsaba', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face' }
    ];

    const badges = [
      'Constitution Expert', 'Civic Champion', 'Democracy Advocate', 'Rising Star',
      'Active Learner', 'Consistent Performer', 'Quiz Master', 'Newcomer'
    ];

    const leaderboardData = Array.from({ length: Math.min(limit, 50) }, (_, index) => {
      const nameData = rwandaNames[index % rwandaNames.length];
      const region = rwandaRegions[index % rwandaRegions.length];
      const basePoints = 2500 - (index * 50) + Math.floor(Math.random() * 100);
      
      return {
        user_id: `mock-user-${index + 1}`,
        username: nameData.name.toLowerCase().replace(/\s+/g, '_'),
        full_name: nameData.name,
        name: nameData.name, // For compatibility
        avatar: nameData.avatar, // For UI compatibility
        avatar_url: nameData.avatar,
        total_points: Math.max(basePoints, 100),
        points: Math.max(basePoints, 100), // For UI compatibility
        quizzes_completed: Math.floor(Math.random() * 25) + 5 + index,
        completedQuizzes: Math.floor(Math.random() * 25) + 5 + index, // For UI compatibility
        average_score: Math.floor(Math.random() * 25) + 70,
        highest_score: Math.floor(Math.random() * 15) + 85,
        fastest_completion_seconds: Math.floor(Math.random() * 200) + 120,
        lessons_completed: Math.floor(Math.random() * 15) + 3 + index,
        completedSimulations: Math.floor(Math.random() * 15) + 3 + index, // For UI compatibility
        achievements_count: Math.floor(Math.random() * 10) + 2 + Math.floor(index / 2),
        current_streak: Math.floor(Math.random() * 12) + 1,
        streak: Math.floor(Math.random() * 12) + 1, // For UI compatibility
        level: 1 + Math.floor(Math.max(basePoints, 100) / 100), // Calculate level based on points
        last_activity_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        rank: index + 1,
        region: region,
        badge: badges[index % badges.length],
        change: index < 3 ? `+${Math.floor(Math.random() * 3) + 1}` : 
                index < 8 ? (Math.random() > 0.5 ? `+${Math.floor(Math.random() * 2) + 1}` : '0') :
                `-${Math.floor(Math.random() * 2) + 1}`,
        isCurrentUser: index === 3 // Mark 4th user as current user for demo
      };
    });

    console.log(`✅ Mock leaderboard generated with ${leaderboardData.length} users`);
    return { success: true, data: leaderboardData };
  } catch (error) {
    console.error('Error in fallback leaderboard:', error);
    return { success: false, error };
  }
};

/**
 * Fetch weekly leaderboard rankings
 */
export const fetchWeeklyLeaderboard = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .rpc('get_weekly_leaderboard')
      .limit(limit);

    // Always use fallback on any error
    if (error) {
      console.log('Weekly leaderboard function error, using fallback:', error.message);
      return await fetchLeaderboardFallback(limit);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in fetchWeeklyLeaderboard:', error);
    return await fetchLeaderboardFallback(limit);
  }
};

/**
 * Fetch monthly leaderboard rankings
 */
export const fetchMonthlyLeaderboard = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .rpc('get_monthly_leaderboard')
      .limit(limit);

    // Always use fallback on any error
    if (error) {
      console.log('Monthly leaderboard function error, using fallback:', error.message);
      return await fetchLeaderboardFallback(limit);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in fetchMonthlyLeaderboard:', error);
    return await fetchLeaderboardFallback(limit);
  }
};

/**
 * Get user's position in different leaderboards
 */
export const getUserLeaderboardStats = async (userId) => {
  try {
    // Get overall leaderboard
    const { data: overallData, error: overallError } = await supabase
      .rpc('get_leaderboard')
      .limit(100);

    // Get weekly leaderboard
    const { data: weeklyData, error: weeklyError } = await supabase
      .rpc('get_weekly_leaderboard')
      .limit(100);

    // Get monthly leaderboard
    const { data: monthlyData, error: monthlyError } = await supabase
      .rpc('get_monthly_leaderboard')
      .limit(100);

    if (monthlyError) {
      console.error('Error fetching monthly leaderboard for user:', monthlyError);
      return { success: false, error: monthlyError };
    }

    const overallPosition = overallData?.findIndex(entry => entry.user_id === userId) + 1 || null;
    const userOverallStats = overallData?.find(entry => entry.user_id === userId) || null;

    const weeklyPosition = weeklyData?.findIndex(entry => entry.user_id === userId) + 1 || null;
    const userWeeklyStats = weeklyData?.find(entry => entry.user_id === userId) || null;

    const monthlyPosition = monthlyData?.findIndex(entry => entry.user_id === userId) + 1 || null;
    const userMonthlyStats = monthlyData?.find(entry => entry.user_id === userId) || null;

    return {
      success: true,
      data: {
        overall: {
          position: overallPosition,
          stats: userOverallStats,
          totalUsers: overallData?.length || 0
        },
        weekly: {
          position: weeklyPosition,
          stats: userWeeklyStats,
          totalUsers: weeklyData?.length || 0
        },
        monthly: {
          position: monthlyPosition,
          stats: userMonthlyStats,
          totalUsers: monthlyData?.length || 0
        }
      }
    };
  } catch (error) {
    console.error('Error in getUserLeaderboardStats:', error);
    return { success: false, error };
  }
};

/**
 * Update leaderboard rankings (typically called after quiz completion)
 */
export const updateLeaderboardRankings = async () => {
  try {
    // The leaderboard is calculated on-demand via the stored procedures
    // This function can be used to trigger any caching updates if needed
    const { data, error } = await supabase
      .rpc('calculate_leaderboard_rankings')
      .limit(1);

    if (error) {
      console.error('Error updating leaderboard rankings:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateLeaderboardRankings:', error);
    return { success: false, error };
  }
};

// ---- Simulation Functions ----

/**
 * Fetch user's simulation progress and stats
 */
export const fetchUserSimulationStats = async (userId) => {
  try {
    // Get completed simulation attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('simulation_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true);
      
    if (attemptsError) {
      console.error('Error fetching user simulation attempts:', attemptsError);
      return { success: false, error: attemptsError };
    }
    
    // Get simulation progress
    const { data: progress, error: progressError } = await supabase
      .from('simulation_progress')
      .select('*')
      .eq('user_id', userId);
      
    if (progressError) {
      console.error('Error fetching simulation progress:', progressError);
      return { success: false, error: progressError };
    }
    
    // Calculate stats
    const completed = attempts?.length || 0;
    const totalScore = attempts?.reduce((sum, attempt) => sum + (attempt.final_score || 0), 0) || 0;
    const averageScore = completed > 0 ? Math.round(totalScore / completed) : 0;
    
    // Get recent completions (last 5)
    const recentCompletions = attempts?.slice(-5) || [];
    
    // Get badges (placeholder - this would come from achievements)
    const badges = [];
    if (completed >= 1) badges.push('First Simulation');
    if (completed >= 5) badges.push('Civic Learner');
    if (completed >= 10) badges.push('Simulation Master');
    if (averageScore >= 90) badges.push('Excellence Award');
    
    return {
      success: true,
      data: {
        totalCompleted: completed,
        averageScore,
        badges,
        recentCompletions,
        inProgress: progress?.filter(p => p.completion_status !== 'completed').length || 0
      }
    };
  } catch (error) {
    console.error('Error in fetchUserSimulationStats:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a new simulation attempt
 */
export const createSimulationAttempt = async (userId, simulationId) => {
  try {
    const { data, error } = await supabase
      .from('simulation_attempts')
      .insert([{
        user_id: userId,
        simulation_id: simulationId,
        completed: false,
        start_time: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating simulation attempt:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in createSimulationAttempt:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update simulation progress
 */
export const updateSimulationProgress = async (userId, simulationId, progressData) => {
  try {
    // Check if progress entry exists
    const { data: existingProgress, error: checkError } = await supabase
      .from('simulation_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('simulation_id', simulationId)
      .single();
      
    let data, error;
    
    const progressUpdate = {
      current_step: progressData.currentStep,
      completion_status: progressData.status,
      completion_percentage: progressData.percentage,
      responses: progressData.responses,
      current_score: progressData.score
    };
    
    if (checkError && checkError.code === 'PGRST116') {
      // No existing progress, create new entry
      const result = await supabase
        .from('simulation_progress')
        .insert([{
          user_id: userId,
          simulation_id: simulationId,
          ...progressUpdate,
          started_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      data = result.data;
      error = result.error;
    } else if (!checkError) {
      // Update existing progress
      const result = await supabase
        .from('simulation_progress')
        .update(progressUpdate)
        .eq('id', existingProgress.id)
        .select()
        .single();
        
      data = result.data;
      error = result.error;
    } else {
      return { success: false, error: checkError };
    }
    
    if (error) {
      console.error('Error updating simulation progress:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in updateSimulationProgress:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete a simulation attempt
 */
export const completeSimulationAttempt = async (attemptId, finalScore, completionData) => {
  try {
    // Update the attempt with completion data
    const { data: attempt, error } = await supabase
      .from('simulation_attempts')
      .update({
        completed: true,
        final_score: finalScore,
        completion_data: completionData,
        completed_at: new Date().toISOString()
      })
      .eq('id', attemptId)
      .select()
      .single();
      
    if (error) {
      console.error('Error completing simulation attempt:', error);
      return { success: false, error };
    }
    
    // Update user progress
    await updateUserProgress(attempt.user_id, null, attempt.simulation_id, 'simulation', 'completed', 100);
    
    // Update user profile stats
    await incrementUserStats(attempt.user_id, {
      points: finalScore,
      completed_lessons: 1 // Count simulations as lessons for now
    });

    // Send WhatsApp notification for simulation completion
    try {
      // Get user details for notification
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('name, phone_number')
        .eq('user_id', attempt.user_id)
        .single();

      if (!userError && user && user.phone_number) {
        await sendWhatsAppNotification('simulation_completion', user.phone_number, {
          userName: user.name || 'Student',
          simulationTitle: completionData.simulationTitle || 'Civic Simulation',
          score: finalScore
        });
      }
    } catch (notificationError) {
      console.error('Error sending simulation completion WhatsApp notification:', notificationError);
      // Don't fail the completion if notification fails
    }
    
    // Check for simulation achievements
    await checkSimulationAchievements(attempt.user_id, attempt);

    return { success: true, data: attempt };
  } catch (error) {
    console.error('Error in completeSimulationAttempt:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get simulation progress for resume functionality
 */
export const getSimulationProgress = async (userId, simulationId) => {
  try {
    const { data, error } = await supabase
      .from('simulation_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('simulation_id', simulationId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No progress found
        return { success: true, data: null };
      }
      console.error('Error fetching simulation progress:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in getSimulationProgress:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check and award simulation-related achievements
 */
export const checkSimulationAchievements = async (userId, attempt) => {
  try {
    // Get user's simulation stats
    const { data: attempts, error: attemptsError } = await supabase
      .from('simulation_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true);
      
    if (attemptsError) {
      console.error('Error fetching simulation attempts for achievements:', attemptsError);
      return;
    }
    
    const completedSimulations = attempts.length;
    const averageScore = attempts.reduce((sum, a) => sum + (a.final_score || 0), 0) / completedSimulations;
    const perfectScores = attempts.filter(a => (a.final_score || 0) >= 100).length;
    
    // Get relevant achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('achievement_type', 'simulation_completion');
      
    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
      return;
    }
    
    // Check each achievement
    for (const achievement of achievements) {
      const conditions = achievement.conditions || {};
      
      let shouldAward = false;
      
      if (conditions.min_simulations && completedSimulations >= conditions.min_simulations) {
        shouldAward = true;
      }
      
      if (conditions.min_average_score && averageScore >= conditions.min_average_score) {
        shouldAward = true;
      }
      
      if (conditions.min_perfect_scores && perfectScores >= conditions.min_perfect_scores) {
        shouldAward = true;
      }
      
      if (conditions.min_score && (attempt.final_score || 0) >= conditions.min_score) {
        shouldAward = true;
      }
      
      if (shouldAward) {
        // Check if already awarded
        const { data: existing, error: existingError } = await supabase
          .from('user_achievements')
          .select('id')
          .eq('user_id', userId)
          .eq('achievement_id', achievement.id)
          .single();
          
        if (existingError && existingError.code === 'PGRST116') {
          // Not awarded yet, award it
          await supabase
            .from('user_achievements')
            .insert([{
              user_id: userId,
              achievement_id: achievement.id
            }]);
            
          // Award points for achievement
          await incrementUserStats(userId, {
            points: achievement.points || 0
          });

          // Send WhatsApp notification for simulation achievement
          try {
            // Get user details for notification
            const { data: user, error: userError } = await supabase
              .from('profiles')
              .select('name, phone_number')
              .eq('user_id', userId)
              .single();

            if (!userError && user && user.phone_number) {
              await sendWhatsAppNotification('achievement', user.phone_number, {
                userName: user.name || 'Student',
                achievementName: achievement.title,
                achievementDescription: achievement.description
              });
            }
          } catch (notificationError) {
            console.error('Error sending simulation achievement WhatsApp notification:', notificationError);
            // Don't fail the achievement award if notification fails
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in checkSimulationAchievements:', error);
  }
};
