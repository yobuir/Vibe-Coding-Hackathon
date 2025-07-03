import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET user progress for lessons
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const lessonId = searchParams.get('lessonId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let query = supabase
      .from('user_progress')
      .select(`
        *,
        lessons!inner(id, title, description, estimated_duration_minutes, difficulty_level, category)
      `)
      .eq('user_id', userId)
      .eq('content_type', 'lesson');

    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: lessonId ? (data[0] || null) : data
    });

  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson progress' },
      { status: 500 }
    );
  }
}

// POST to update lesson progress
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      lessonId, 
      status, 
      percentage = 0, 
      position = null,
      timeSpent = 0 
    } = body;

    if (!userId || !lessonId || !status) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, lessonId, status' 
      }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['not_started', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      }, { status: 400 });
    }

    // Check if progress entry exists
    const { data: existingProgress, error: checkError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .eq('content_type', 'lesson')
      .single();

    let result;
    const now = new Date().toISOString();
    
    const updateData = {
      completion_status: status,
      completion_percentage: Math.min(Math.max(percentage, 0), 100), // Ensure 0-100 range
      last_position: position,
      updated_at: now
    };

    // Add time spent if provided
    if (timeSpent > 0) {
      updateData.time_spent_minutes = (existingProgress?.time_spent_minutes || 0) + timeSpent;
    }

    // Set completed_at when completed
    if (status === 'completed') {
      updateData.completed_at = now;
      updateData.completion_percentage = 100;
    }

    if (checkError && checkError.code === 'PGRST116') {
      // No existing progress, create new entry
      const insertData = {
        user_id: userId,
        lesson_id: lessonId,
        content_type: 'lesson',
        started_at: now,
        ...updateData
      };

      result = await supabase
        .from('user_progress')
        .insert([insertData])
        .select(`
          *,
          lessons!inner(id, title, description, estimated_duration_minutes, difficulty_level, category)
        `)
        .single();
    } else if (!checkError) {
      // Update existing progress
      result = await supabase
        .from('user_progress')
        .update(updateData)
        .eq('id', existingProgress.id)
        .select(`
          *,
          lessons!inner(id, title, description, estimated_duration_minutes, difficulty_level, category)
        `)
        .single();
    } else {
      throw checkError;
    }

    if (result.error) {
      throw result.error;
    }

    // Handle completion rewards and achievements
    if (status === 'completed') {
      try {
        // Update user stats
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('points, completed_lessons, level, streak')
          .eq('user_id', userId)
          .single();

        if (!profileError && profile) {
          const pointsAwarded = 10; // Base points for lesson completion
          const newPoints = (profile.points || 0) + pointsAwarded;
          const newCompletedLessons = (profile.completed_lessons || 0) + 1;
          
          // Level calculation: Level = 1 + floor(points / 100)
          const newLevel = 1 + Math.floor(newPoints / 100);
          
          // Update streak (simple daily streak logic)
          const today = new Date().toDateString();
          const lastActivity = await supabase
            .from('user_activity')
            .select('created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          let newStreak = profile.streak || 0;
          if (!lastActivity.error && lastActivity.data) {
            const lastActivityDate = new Date(lastActivity.data.created_at).toDateString();
            if (lastActivityDate !== today) {
              newStreak += 1;
            }
          } else {
            newStreak = 1;
          }

          // Update profile
          await supabase
            .from('user_profiles')
            .update({
              points: newPoints,
              completed_lessons: newCompletedLessons,
              level: Math.max(newLevel, profile.level),
              streak: newStreak,
              updated_at: now
            })
            .eq('user_id', userId);

          // Log activity
          await supabase
            .from('user_activity')
            .insert([{
              user_id: userId,
              activity_type: 'lesson',
              title: `Completed lesson: ${result.data.lessons.title}`,
              details: `Earned ${pointsAwarded} points`,
              points_earned: pointsAwarded,
              created_at: now
            }]);

          // Check for lesson completion achievements
          await checkLessonAchievements(userId, newCompletedLessons);
        }
      } catch (rewardError) {
        console.error('Error processing lesson completion rewards:', rewardError);
        // Don't fail the progress update if rewards fail
      }
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: status === 'completed' ? 'Lesson completed! Points awarded.' : 'Progress updated successfully.'
    });

  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson progress' },
      { status: 500 }
    );
  }
}

// Helper function to check lesson achievements
async function checkLessonAchievements(userId, completedLessons) {
  try {
    // Get lesson completion achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('achievement_type', 'lesson_completion');

    if (achievementsError || !achievements) {
      return;
    }

    for (const achievement of achievements) {
      const conditions = achievement.conditions || {};
      
      // Check if this achievement should be awarded
      if (conditions.min_lessons && completedLessons >= conditions.min_lessons) {
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
              achievement_id: achievement.id,
              earned_at: new Date().toISOString()
            }]);

          // Award points for achievement
          if (achievement.points > 0) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('points')
              .eq('user_id', userId)
              .single();

            if (profile) {
              await supabase
                .from('user_profiles')
                .update({
                  points: (profile.points || 0) + achievement.points
                })
                .eq('user_id', userId);
            }
          }

          // Log achievement activity
          await supabase
            .from('user_activity')
            .insert([{
              user_id: userId,
              activity_type: 'achievement',
              title: `Achievement unlocked: ${achievement.title}`,
              details: achievement.description,
              points_earned: achievement.points || 0,
              created_at: new Date().toISOString()
            }]);
        }
      }
    }
  } catch (error) {
    console.error('Error checking lesson achievements:', error);
  }
}
