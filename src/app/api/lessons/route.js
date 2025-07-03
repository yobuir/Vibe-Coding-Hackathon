import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's completed lessons to recommend next ones
    const { data: userProgress, error: progressError } = await supabase
      .from('user_progress')
      .select('lesson_id, completion_status')
      .eq('user_id', userId)
      .eq('content_type', 'lesson');

    if (progressError) {
      console.error('Error fetching user progress:', progressError);
    }

    const completedLessonIds = userProgress
      ? userProgress
          .filter(p => p.completion_status === 'completed')
          .map(p => p.lesson_id)
      : [];

    const inProgressLessonIds = userProgress
      ? userProgress
          .filter(p => p.completion_status === 'in_progress')
          .map(p => p.lesson_id)
      : [];

    // Fetch recommended lessons (not completed, prioritize in-progress)
    let recommendedLessons = [];

    // First, get in-progress lessons
    if (inProgressLessonIds.length > 0) {
      const { data: inProgressLessons, error: inProgressError } = await supabase
        .from('lessons')
        .select('id, title, description, difficulty_level, estimated_duration_minutes, category')
        .in('id', inProgressLessonIds)
        .eq('is_published', true)
        .limit(Math.min(limit, inProgressLessonIds.length));

      if (!inProgressError && inProgressLessons) {
        recommendedLessons = [...inProgressLessons.map(lesson => ({
          ...lesson,
          type: 'lesson',
          status: 'in_progress',
          duration: `${lesson.estimated_duration_minutes || 0} min`,
          difficulty: lesson.difficulty_level || 'beginner'
        }))];
      }
    }

    // Then get new lessons (not completed or in-progress)
    const excludeIds = [...completedLessonIds, ...inProgressLessonIds];
    const remainingLimit = limit - recommendedLessons.length;

    if (remainingLimit > 0) {
      let newLessonsQuery = supabase
        .from('lessons')
        .select('id, title, description, difficulty_level, estimated_duration_minutes, category')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(remainingLimit);

      if (excludeIds.length > 0) {
        newLessonsQuery = newLessonsQuery.not('id', 'in', `(${excludeIds.map(id => `'${id}'`).join(',')})`);
      }

      const { data: newLessons, error: newLessonsError } = await newLessonsQuery;

      if (!newLessonsError && newLessons) {
        recommendedLessons = [...recommendedLessons, ...newLessons.map(lesson => ({
          ...lesson,
          type: 'lesson',
          status: 'not_started',
          duration: `${lesson.estimated_duration_minutes || 0} min`,
          difficulty: lesson.difficulty_level || 'beginner'
        }))];
      }
    }

    return NextResponse.json({
      success: true,
      data: recommendedLessons,
      meta: {
        total: recommendedLessons.length,
        completedCount: completedLessonIds.length,
        inProgressCount: inProgressLessonIds.length
      }
    });

  } catch (error) {
    console.error('Error in lessons API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint for lesson progress updates
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, lessonId, status, percentage, position } = body;

    if (!userId || !lessonId || !status) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, lessonId, status' 
      }, { status: 400 });
    }

    // Check if progress entry exists
    const { data: existingProgress, error: checkError } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .eq('content_type', 'lesson')
      .single();

    let result;
    const now = new Date().toISOString();
    const updateData = {
      completion_status: status,
      completion_percentage: percentage || 0,
      last_position: position || null
    };

    if (status === 'completed') {
      updateData.completed_at = now;
    }

    if (checkError && checkError.code === 'PGRST116') {
      // No existing progress, create new entry
      const insertData = {
        user_id: userId,
        lesson_id: lessonId,
        content_type: 'lesson',
        ...updateData,
        started_at: now
      };

      result = await supabase
        .from('user_progress')
        .insert([insertData])
        .select()
        .single();
    } else if (!checkError) {
      // Update existing progress
      result = await supabase
        .from('user_progress')
        .update(updateData)
        .eq('id', existingProgress.id)
        .select()
        .single();
    } else {
      throw checkError;
    }

    if (result.error) {
      throw result.error;
    }

    // If lesson completed, award points and check achievements
    if (status === 'completed') {
      // Update user stats
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('points, completed_lessons, level')
        .eq('user_id', userId)
        .single();

      if (!profileError && profile) {
        const newPoints = (profile.points || 0) + 10;
        const newCompletedLessons = (profile.completed_lessons || 0) + 1;
        const newLevel = 1 + Math.floor(newPoints / 100);

        await supabase
          .from('user_profiles')
          .update({
            points: newPoints,
            completed_lessons: newCompletedLessons,
            level: newLevel > profile.level ? newLevel : profile.level
          })
          .eq('user_id', userId);
      }
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson progress' },
      { status: 500 }
    );
  }
}
