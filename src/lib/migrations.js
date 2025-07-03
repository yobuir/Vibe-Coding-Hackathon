import { supabase } from './supabase';

/**
 * Run AI quiz support migration
 */
export const runAIQuizMigration = async () => {
  try {
    console.log('Running AI quiz support migration...');
    
    const { error } = await supabase.rpc('exec_sql', {
      sql_string: `
        -- Add ai_generated and ai_prompt columns to quizzes table
        ALTER TABLE quizzes 
        ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS ai_prompt TEXT;

        -- Update existing quizzes to have default values
        UPDATE quizzes 
        SET ai_generated = FALSE 
        WHERE ai_generated IS NULL;

        -- Create index for better performance when filtering AI-generated quizzes
        CREATE INDEX IF NOT EXISTS idx_quizzes_ai_generated ON quizzes(ai_generated);
        CREATE INDEX IF NOT EXISTS idx_quizzes_category ON quizzes(category);
        CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON quizzes(difficulty_level);

        -- Add some sample achievements for quiz completion
        INSERT INTO achievements (name, description, achievement_type, conditions, points) VALUES
        ('First Quiz', 'Complete your first quiz', 'quiz_score', '{"min_quizzes": 1}', 10),
        ('Quiz Master', 'Complete 5 quizzes', 'quiz_score', '{"min_quizzes": 5}', 50),
        ('Perfect Score', 'Achieve 100% on any quiz', 'quiz_score', '{"min_score_percentage": 100}', 25),
        ('Civic Scholar', 'Complete 3 quizzes with 80%+ score', 'quiz_score', '{"min_quizzes": 3, "min_score_percentage": 80}', 75),
        ('AI Quiz Pioneer', 'Complete your first AI-generated quiz', 'quiz_score', '{"ai_generated": true, "min_quizzes": 1}', 15)
        ON CONFLICT (name) DO NOTHING;
      `
    });

    if (error) {
      console.error('Error running AI quiz migration:', error);
      return { success: false, error };
    }

    console.log('AI quiz support migration completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in runAIQuizMigration:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Creates the user_profiles table in Supabase if it doesn't exist
 */
export const createUserProfilesTable = async () => {
  try {
    // Check if the table exists first
    const { error: checkError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .limit(1);
    
    // If there's a 404 error, the table doesn't exist
    if (checkError && (checkError.code === '404' || checkError.message?.includes('does not exist'))) {
      console.log('user_profiles table does not exist, creating it...');
      
      // Create the user_profiles table using SQL
      // Note: This requires postgres permissions and may not work with default anon key
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS user_profiles (
            user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name TEXT,
            email TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            points INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            streak INTEGER DEFAULT 0,
            completed_lessons INTEGER DEFAULT 0
          );
          
          -- Set up RLS policies
          ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Users can view own profile"
            ON user_profiles FOR SELECT
            USING (auth.uid() = user_id);
            
          CREATE POLICY "Users can update own profile"
            ON user_profiles FOR UPDATE
            USING (auth.uid() = user_id);
            
          CREATE POLICY "Users can insert own profile"
            ON user_profiles FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        `
      });
      
      if (createError) {
        console.error('Failed to create user_profiles table:', createError);
        return { success: false, error: createError };
      }
      
      console.log('user_profiles table created successfully');
      return { success: true };
    }
    
    console.log('user_profiles table already exists');
    return { success: true };
  } catch (error) {
    console.error('Error checking/creating user_profiles table:', error);
    return { success: false, error };
  }
};

/**
 * Creates the quizzes table for storing quiz content
 */
export const createQuizzesTable = async () => {
  try {
    // Check if the table exists first
    const { error: checkError } = await supabase
      .from('quizzes')
      .select('id')
      .limit(1);
    
    // If there's a 404 error, the table doesn't exist
    if (checkError && (checkError.code === '404' || checkError.message?.includes('does not exist'))) {
      console.log('quizzes table does not exist, creating it...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS quizzes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
            category TEXT NOT NULL,
            tags TEXT[],
            time_limit_seconds INTEGER,
            passing_score INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES auth.users(id),
            is_published BOOLEAN DEFAULT FALSE
          );
          
          -- Set up RLS policies
          ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Anyone can view published quizzes"
            ON quizzes FOR SELECT
            USING (is_published = TRUE);
            
          CREATE POLICY "Authors can manage own quizzes"
            ON quizzes FOR ALL
            USING (auth.uid() = created_by);
        `
      });
      
      if (createError) {
        console.error('Failed to create quizzes table:', createError);
        return { success: false, error: createError };
      }
      
      console.log('quizzes table created successfully');
      return { success: true };
    }
    
    console.log('quizzes table already exists');
    return { success: true };
  } catch (error) {
    console.error('Error checking/creating quizzes table:', error);
    return { success: false, error };
  }
};

/**
 * Creates the quiz_questions table for storing individual quiz questions
 */
export const createQuizQuestionsTable = async () => {
  try {
    // Check if the table exists first
    const { error: checkError } = await supabase
      .from('quiz_questions')
      .select('id')
      .limit(1);
    
    // If there's a 404 error, the table doesn't exist
    if (checkError && (checkError.code === '404' || checkError.message?.includes('does not exist'))) {
      console.log('quiz_questions table does not exist, creating it...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS quiz_questions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
            question_text TEXT NOT NULL,
            question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'essay')),
            points INTEGER DEFAULT 1,
            explanation TEXT,
            order_position INTEGER,
            media_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Set up RLS policies
          ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Anyone can view questions of published quizzes"
            ON quiz_questions FOR SELECT
            USING (EXISTS (
              SELECT 1 FROM quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.is_published = TRUE
            ));
            
          CREATE POLICY "Authors can manage questions of own quizzes"
            ON quiz_questions FOR ALL
            USING (EXISTS (
              SELECT 1 FROM quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.created_by = auth.uid()
            ));
        `
      });
      
      if (createError) {
        console.error('Failed to create quiz_questions table:', createError);
        return { success: false, error: createError };
      }
      
      console.log('quiz_questions table created successfully');
      return { success: true };
    }
    
    console.log('quiz_questions table already exists');
    return { success: true };
  } catch (error) {
    console.error('Error checking/creating quiz_questions table:', error);
    return { success: false, error };
  }
};

/**
 * Creates the answer_options table for multiple choice questions
 */
export const createAnswerOptionsTable = async () => {
  try {
    // Check if the table exists first
    const { error: checkError } = await supabase
      .from('answer_options')
      .select('id')
      .limit(1);
    
    // If there's a 404 error, the table doesn't exist
    if (checkError && (checkError.code === '404' || checkError.message?.includes('does not exist'))) {
      console.log('answer_options table does not exist, creating it...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS answer_options (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
            option_text TEXT NOT NULL,
            is_correct BOOLEAN NOT NULL DEFAULT FALSE,
            order_position INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Set up RLS policies
          ALTER TABLE answer_options ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Anyone can view answers for published quizzes"
            ON answer_options FOR SELECT
            USING (EXISTS (
              SELECT 1 FROM quiz_questions 
              JOIN quizzes ON quiz_questions.quiz_id = quizzes.id 
              WHERE quiz_questions.id = answer_options.question_id AND quizzes.is_published = TRUE
            ));
            
          CREATE POLICY "Authors can manage answers for own quizzes"
            ON answer_options FOR ALL
            USING (EXISTS (
              SELECT 1 FROM quiz_questions 
              JOIN quizzes ON quiz_questions.quiz_id = quizzes.id 
              WHERE quiz_questions.id = answer_options.question_id AND quizzes.created_by = auth.uid()
            ));
        `
      });
      
      if (createError) {
        console.error('Failed to create answer_options table:', createError);
        return { success: false, error: createError };
      }
      
      console.log('answer_options table created successfully');
      return { success: true };
    }
    
    console.log('answer_options table already exists');
    return { success: true };
  } catch (error) {
    console.error('Error checking/creating answer_options table:', error);
    return { success: false, error };
  }
};

/**
 * Creates the quiz_attempts table to track user attempts at quizzes
 */
export const createQuizAttemptsTable = async () => {
  try {
    // Check if the table exists first
    const { error: checkError } = await supabase
      .from('quiz_attempts')
      .select('id')
      .limit(1);
    
    // If there's a 404 error, the table doesn't exist
    if (checkError && (checkError.code === '404' || checkError.message?.includes('does not exist'))) {
      console.log('quiz_attempts table does not exist, creating it...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS quiz_attempts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
            score INTEGER,
            max_possible_score INTEGER,
            percentage_score DECIMAL,
            passed BOOLEAN,
            time_spent_seconds INTEGER,
            completed BOOLEAN DEFAULT FALSE,
            started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            -- Create a composite unique constraint to track multiple attempts
            UNIQUE(user_id, quiz_id, started_at)
          );
          
          -- Set up RLS policies
          ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Users can view their own attempts"
            ON quiz_attempts FOR SELECT
            USING (auth.uid() = user_id);
            
          CREATE POLICY "Users can insert their own attempts"
            ON quiz_attempts FOR INSERT
            WITH CHECK (auth.uid() = user_id);
            
          CREATE POLICY "Users can update their own attempts"
            ON quiz_attempts FOR UPDATE
            USING (auth.uid() = user_id);
        `
      });
      
      if (createError) {
        console.error('Failed to create quiz_attempts table:', createError);
        return { success: false, error: createError };
      }
      
      console.log('quiz_attempts table created successfully');
      return { success: true };
    }
    
    console.log('quiz_attempts table already exists');
    return { success: true };
  } catch (error) {
    console.error('Error checking/creating quiz_attempts table:', error);
    return { success: false, error };
  }
};

/**
 * Creates the user_answers table to track user responses to questions
 */
export const createUserAnswersTable = async () => {
  try {
    // Check if the table exists first
    const { error: checkError } = await supabase
      .from('user_answers')
      .select('id')
      .limit(1);
    
    // If there's a 404 error, the table doesn't exist
    if (checkError && (checkError.code === '404' || checkError.message?.includes('does not exist'))) {
      console.log('user_answers table does not exist, creating it...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS user_answers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
            question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
            selected_option_id UUID REFERENCES answer_options(id) ON DELETE SET NULL,
            text_answer TEXT,
            is_correct BOOLEAN,
            points_earned INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            -- Create a composite unique constraint to prevent duplicate answers
            UNIQUE(attempt_id, question_id)
          );
          
          -- Set up RLS policies
          ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Users can view their own answers"
            ON user_answers FOR SELECT
            USING (EXISTS (
              SELECT 1 FROM quiz_attempts 
              WHERE quiz_attempts.id = user_answers.attempt_id 
              AND quiz_attempts.user_id = auth.uid()
            ));
            
          CREATE POLICY "Users can insert their own answers"
            ON user_answers FOR INSERT
            WITH CHECK (EXISTS (
              SELECT 1 FROM quiz_attempts 
              WHERE quiz_attempts.id = user_answers.attempt_id 
              AND quiz_attempts.user_id = auth.uid()
            ));
            
          CREATE POLICY "Users can update their own answers"
            ON user_answers FOR UPDATE
            USING (EXISTS (
              SELECT 1 FROM quiz_attempts 
              WHERE quiz_attempts.id = user_answers.attempt_id 
              AND quiz_attempts.user_id = auth.uid()
            ));
        `
      });
      
      if (createError) {
        console.error('Failed to create user_answers table:', createError);
        return { success: false, error: createError };
      }
      
      console.log('user_answers table created successfully');
      return { success: true };
    }
    
    console.log('user_answers table already exists');
    return { success: true };
  } catch (error) {
    console.error('Error checking/creating user_answers table:', error);
    return { success: false, error };
  }
};

/**
 * Creates the lessons table for storing educational content
 */
export const createLessonsTable = async () => {
  try {
    // Check if the table exists first
    const { error: checkError } = await supabase
      .from('lessons')
      .select('id')
      .limit(1);
    
    // If there's a 404 error, the table doesn't exist
    if (checkError && (checkError.code === '404' || checkError.message?.includes('does not exist'))) {
      console.log('lessons table does not exist, creating it...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS lessons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            content TEXT,
            category TEXT NOT NULL,
            tags TEXT[],
            difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
            estimated_duration_minutes INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES auth.users(id),
            is_published BOOLEAN DEFAULT FALSE
          );
          
          -- Set up RLS policies
          ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Anyone can view published lessons"
            ON lessons FOR SELECT
            USING (is_published = TRUE);
            
          CREATE POLICY "Authors can manage own lessons"
            ON lessons FOR ALL
            USING (auth.uid() = created_by);
        `
      });
      
      if (createError) {
        console.error('Failed to create lessons table:', createError);
        return { success: false, error: createError };
      }
      
      console.log('lessons table created successfully');
      return { success: true };
    }
    
    console.log('lessons table already exists');
    return { success: true };
  } catch (error) {
    console.error('Error checking/creating lessons table:', error);
    return { success: false, error };
  }
};

/**
 * Creates the user_progress table to track user lesson completion
 */
export const createUserProgressTable = async () => {
  try {
    // Check if the table exists first
    const { error: checkError } = await supabase
      .from('user_progress')
      .select('id')
      .limit(1);
    
    // If there's a 404 error, the table doesn't exist
    if (checkError && (checkError.code === '404' || checkError.message?.includes('does not exist'))) {
      console.log('user_progress table does not exist, creating it...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS user_progress (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
            quiz_id UUID REFERENCES quizzes(id) ON DELETE SET NULL,
            content_type TEXT NOT NULL CHECK (content_type IN ('lesson', 'quiz')),
            completion_status TEXT NOT NULL CHECK (completion_status IN ('not_started', 'in_progress', 'completed')),
            completion_percentage INTEGER DEFAULT 0,
            last_position TEXT,
            started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE,
            
            -- Ensure at least one of lesson_id or quiz_id is set
            CHECK ((lesson_id IS NOT NULL AND content_type = 'lesson') OR 
                  (quiz_id IS NOT NULL AND content_type = 'quiz')),
            
            -- Create a composite unique constraint
            UNIQUE(user_id, lesson_id, quiz_id)
          );
          
          -- Set up RLS policies
          ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Users can view their own progress"
            ON user_progress FOR SELECT
            USING (auth.uid() = user_id);
            
          CREATE POLICY "Users can insert their own progress"
            ON user_progress FOR INSERT
            WITH CHECK (auth.uid() = user_id);
            
          CREATE POLICY "Users can update their own progress"
            ON user_progress FOR UPDATE
            USING (auth.uid() = user_id);
        `
      });
      
      if (createError) {
        console.error('Failed to create user_progress table:', JSON.stringify(createError, null, 2));
        return { success: false, error: createError };
      }
      
      console.log('user_progress table created successfully');
      return { success: true };
    }
    
    console.log('user_progress table already exists');
    return { success: true };
  } catch (error) {
    console.error('Error checking/creating user_progress table:', error);
    return { success: false, error };
  }
};

/**
 * Creates the achievements table for gamification
 */
export const createAchievementsTable = async () => {
  try {
    // Check if the table exists first
    const { error: checkError } = await supabase
      .from('achievements')
      .select('id')
      .limit(1);
    
    // If there's a 404 error, the table doesn't exist
    if (checkError && (checkError.code === '404' || checkError.message?.includes('does not exist'))) {
      console.log('achievements table does not exist, creating it...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS achievements (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            icon_url TEXT,
            points INTEGER DEFAULT 0,
            achievement_type TEXT NOT NULL CHECK (achievement_type IN ('lesson_completion', 'quiz_score', 'streak', 'participation', 'special')),
            conditions JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Set up RLS policies
          ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Anyone can view achievements"
            ON achievements FOR SELECT
            USING (TRUE);
        `
      });
      
      if (createError) {
        console.error('Failed to create achievements table:', createError);
        return { success: false, error: createError };
      }
      
      console.log('achievements table created successfully');
      return { success: true };
    }
    
    console.log('achievements table already exists');
    return { success: true };
  } catch (error) {
    console.error('Error checking/creating achievements table:', error);
    return { success: false, error };
  }
};

/**
 * Creates the user_achievements table to track earned achievements
 */
export const createUserAchievementsTable = async () => {
  try {
    // Check if the table exists first
    const { error: checkError } = await supabase
      .from('user_achievements')
      .select('id')
      .limit(1);
    
    // If there's a 404 error, the table doesn't exist
    if (checkError && (checkError.code === '404' || checkError.message?.includes('does not exist'))) {
      console.log('user_achievements table does not exist, creating it...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS user_achievements (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
            earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            -- Create a composite unique constraint
            UNIQUE(user_id, achievement_id)
          );
          
          -- Set up RLS policies
          ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Users can view their own achievements"
            ON user_achievements FOR SELECT
            USING (auth.uid() = user_id);
            
          CREATE POLICY "Users can insert their own achievements"
            ON user_achievements FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        `
      });
      
      if (createError) {
        console.error('Failed to create user_achievements table:', createError);
        return { success: false, error: createError };
      }
      
      console.log('user_achievements table created successfully');
      return { success: true };
    }
    
    console.log('user_achievements table already exists');
    return { success: true };
  } catch (error) {
    console.error('Error checking/creating user_achievements table:', error);
    return { success: false, error };
  }
};

/**
 * Initialize all required database tables and structures
 */
export const initializeDatabase = async () => {
  const results = await Promise.all([
    createUserProfilesTable(),
    createQuizzesTable(),
    createQuizQuestionsTable(),
    createAnswerOptionsTable(),
    createQuizAttemptsTable(),
    createUserAnswersTable(),
    createLessonsTable(),
    createUserProgressTable(),
    createAchievementsTable(),
    createUserAchievementsTable()
  ]);
  
  return {
    success: results.every(result => result.success),
    results
  };
};

/**
 * Manual creation of user profile
 */
export const createUserProfile = async (userId, userData) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: userId,
        ...userData,
        created_at: new Date().toISOString()
      }])
      .select();
      
    if (error) {
      console.error('Error creating user profile manually:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Exception creating user profile manually:', error);
    return { success: false, error };
  }
};
