import { NextResponse } from 'next/server';
import { saveAIGeneratedQuiz } from '@/lib/dataAccess';
import { generateQuizWithOpenAI } from '@/lib/aiService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, preferences } = body;

    // Validate required fields
    if (!prompt || !preferences) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and preferences' },
        { status: 400 }
      );
    }

    // Validate preferences
    const { topic, difficulty, questionCount } = preferences;
    if (!topic || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required preference fields: topic and difficulty' },
        { status: 400 }
      );
    }

    // Generate quiz using AI
    const quizData = await generateQuizWithOpenAI(prompt, {
      topic,
      difficulty,
      questionCount: questionCount || 5
    });

    // Save the generated quiz to the database
    try {
      const savedQuiz = await saveAIGeneratedQuiz(quizData);
      
      return NextResponse.json({
        success: true,
        quiz: savedQuiz,
        message: 'Quiz generated and saved successfully'
      });
    } catch (saveError) {
      console.error('Error saving quiz:', saveError);
      
      // Return the generated quiz even if save fails
      return NextResponse.json({
        success: true,
        quiz: quizData,
        message: 'Quiz generated successfully (save failed)',
        warning: 'Quiz could not be saved to database'
      });
    }

  } catch (error) {
    console.error('Error in generate-quiz API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate quiz', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
