-- Migration to add AI-generated quiz support
-- Run this migration on your existing database

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
