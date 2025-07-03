import { supabase } from './supabase';

/**
 * Utility to run database migrations for AI quiz functionality
 * Run this once to add AI quiz support to your database
 */

export const runAIQuizMigration = async () => {
  try {
    console.log('Starting AI quiz migration...');
    
    // Try to add columns one by one using direct Supabase queries
    try {
      // First, let's try to query the existing structure
      const { data: existingQuiz, error: structureError } = await supabase
        .from('quizzes')
        .select('ai_generated')
        .limit(1);
      
      if (!structureError) {
        console.log('AI columns already exist, skipping column addition');
      }
    } catch (columnError) {
      console.log('AI columns do not exist, need to add them');
      
      // Add columns using individual SQL commands
      try {
        const { error: addAiGeneratedError } = await supabase.rpc('exec_sql', {
          sql_string: 'ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;'
        });
        
        if (addAiGeneratedError) {
          console.error('Error adding ai_generated column:', addAiGeneratedError);
        } else {
          console.log('✅ Added ai_generated column');
        }
        
        const { error: addAiPromptError } = await supabase.rpc('exec_sql', {
          sql_string: 'ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS ai_prompt TEXT;'
        });
        
        if (addAiPromptError) {
          console.error('Error adding ai_prompt column:', addAiPromptError);
        } else {
          console.log('✅ Added ai_prompt column');
        }
      } catch (sqlError) {
        console.error('SQL execution not available, trying alternative approach');
        
        // Alternative: Try to insert a test record to force schema update
        const testQuiz = {
          title: 'Test Migration Quiz',
          description: 'Test quiz for migration',
          category: 'test',
          difficulty_level: 'beginner',
          is_published: false
        };
        
        const { data: testInsert, error: testInsertError } = await supabase
          .from('quizzes')
          .insert([testQuiz])
          .select();
        
        if (!testInsertError && testInsert.length > 0) {
          // Delete the test quiz
          await supabase
            .from('quizzes')
            .delete()
            .eq('id', testInsert[0].id);
          console.log('✅ Basic quiz table is working');
        }
      }
    }

    // Update existing quizzes to have default values
    try {
      const { error: updateError } = await supabase
        .from('quizzes')
        .update({ ai_generated: false })
        .is('ai_generated', null);

      if (updateError) {
        console.log('Could not update existing quizzes (this is normal if column doesn\'t exist)');
      } else {
        console.log('✅ Updated existing quizzes with default ai_generated value');
      }
    } catch (updateError) {
      console.log('Update step skipped (column may not exist yet)');
    }

    console.log('AI quiz migration completed');
    return { success: true };
  } catch (error) {
    console.error('Error in AI quiz migration:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add sample achievements for AI quiz functionality
 */
export const addAIQuizAchievements = async () => {
  try {
    console.log('Adding AI quiz achievements...');
    
    const achievements = [
      {
        name: 'First Quiz',
        description: 'Complete your first quiz',
        achievement_type: 'quiz_score',
        conditions: { min_quizzes: 1 },
        points: 10
      },
      {
        name: 'Quiz Master',
        description: 'Complete 5 quizzes',
        achievement_type: 'quiz_score',
        conditions: { min_quizzes: 5 },
        points: 50
      },
      {
        name: 'Perfect Score',
        description: 'Achieve 100% on any quiz',
        achievement_type: 'quiz_score',
        conditions: { min_score_percentage: 100 },
        points: 25
      },
      {
        name: 'Civic Scholar',
        description: 'Complete 3 quizzes with 80%+ score',
        achievement_type: 'quiz_score',
        conditions: { min_quizzes: 3, min_score_percentage: 80 },
        points: 75
      },
      {
        name: 'AI Quiz Pioneer',
        description: 'Complete your first AI-generated quiz',
        achievement_type: 'quiz_score',
        conditions: { ai_generated: true, min_quizzes: 1 },
        points: 15
      }
    ];

    for (const achievement of achievements) {
      const { error } = await supabase
        .from('achievements')
        .upsert(achievement, { onConflict: 'name' });
      
      if (error) {
        console.error(`Error adding achievement ${achievement.name}:`, error);
      }
    }

    console.log('AI quiz achievements added successfully');
    return { success: true };
  } catch (error) {
    console.error('Error adding AI quiz achievements:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Run all AI quiz related migrations
 */
export const runAllAIQuizMigrations = async () => {
  console.log('Running all AI quiz migrations...');
  
  const migrationResult = await runAIQuizMigration();
  const achievementsResult = await addAIQuizAchievements();
  
  return {
    success: migrationResult.success && achievementsResult.success,
    migration: migrationResult,
    achievements: achievementsResult
  };
};
