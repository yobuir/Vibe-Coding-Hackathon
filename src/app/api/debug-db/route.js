import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    console.log('🔍 Debugging database structure...');
    
    // Check if quizzes table exists and what columns it has
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*')
      .limit(1);
    
    if (quizzesError) {
      return NextResponse.json({
        success: false,
        error: 'Quizzes table error',
        details: quizzesError
      });
    }
    
    // Check quiz_questions table
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .limit(1);
    
    // Check answer_options table
    const { data: options, error: optionsError } = await supabase
      .from('answer_options')
      .select('*')
      .limit(1);
    
    // Check achievements table
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .limit(1);
    
    return NextResponse.json({
      success: true,
      tables: {
        quizzes: {
          accessible: !quizzesError,
          error: quizzesError,
          sampleData: quizzes?.[0] || null,
          count: quizzes?.length || 0
        },
        quiz_questions: {
          accessible: !questionsError,
          error: questionsError,
          sampleData: questions?.[0] || null
        },
        answer_options: {
          accessible: !optionsError,
          error: optionsError,
          sampleData: options?.[0] || null
        },
        achievements: {
          accessible: !achievementsError,
          error: achievementsError,
          sampleData: achievements?.[0] || null
        }
      }
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('🧪 Testing simple quiz insertion...');
    
    // Try to insert a simple quiz first
    const testQuiz = {
      title: 'Test Quiz - ' + new Date().toISOString(),
      description: 'Simple test quiz',
      category: 'civic_education',
      difficulty_level: 'beginner',
      is_published: true
    };
    
    const { data: insertedQuiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([testQuiz])
      .select()
      .single();
    
    if (quizError) {
      return NextResponse.json({
        success: false,
        step: 'quiz_insertion',
        error: quizError
      }, { status: 500 });
    }
    
    // Try to insert a simple question
    const testQuestion = {
      quiz_id: insertedQuiz.id,
      question_text: 'What is the capital of Rwanda?',
      question_type: 'multiple_choice',
      points: 1,
      explanation: 'Kigali is the capital city of Rwanda.',
      order_position: 1
    };
    
    const { data: insertedQuestion, error: questionError } = await supabase
      .from('quiz_questions')
      .insert([testQuestion])
      .select()
      .single();
    
    if (questionError) {
      return NextResponse.json({
        success: false,
        step: 'question_insertion',
        error: questionError,
        quiz: insertedQuiz
      }, { status: 500 });
    }
    
    // Try to insert simple options
    const testOptions = [
      {
        question_id: insertedQuestion.id,
        option_text: 'Kigali',
        is_correct: true,
        order_position: 1
      },
      {
        question_id: insertedQuestion.id,
        option_text: 'Butare',
        is_correct: false,
        order_position: 2
      }
    ];
    
    const { data: insertedOptions, error: optionsError } = await supabase
      .from('answer_options')
      .insert(testOptions)
      .select();
    
    if (optionsError) {
      return NextResponse.json({
        success: false,
        step: 'options_insertion',
        error: optionsError,
        quiz: insertedQuiz,
        question: insertedQuestion
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test insertion successful',
      data: {
        quiz: insertedQuiz,
        question: insertedQuestion,
        options: insertedOptions
      }
    });
    
  } catch (error) {
    console.error('❌ Test insertion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test insertion failed',
      details: error.message
    }, { status: 500 });
  }
}
