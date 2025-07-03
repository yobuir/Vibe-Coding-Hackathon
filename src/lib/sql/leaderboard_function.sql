-- Function to calculate leaderboard rankings with user profiles
create or replace function calculate_leaderboard_rankings()
returns table (
  user_id uuid,
  username text,
  full_name text,
  avatar_url text,
  total_points bigint,
  quizzes_completed bigint,
  average_score numeric,
  highest_score numeric,
  fastest_completion_seconds integer,
  lessons_completed bigint,
  achievements_count bigint,
  current_streak integer,
  last_activity_date timestamp with time zone,
  rank integer
) 
language plpgsql
as $$
begin
  return query
  with user_stats as (
    select 
      up.id as user_id,
      up.username,
      up.full_name,
      up.avatar_url,
      coalesce(sum(qa.score), 0)::bigint as total_points,
      count(distinct qa.quiz_id)::bigint as quizzes_completed,
      coalesce(round(avg(qa.score)::numeric, 2), 0) as average_score,
      coalesce(max(qa.score), 0)::numeric as highest_score,
      coalesce(min(qa.time_taken_seconds), 0)::integer as fastest_completion_seconds,
      coalesce(count(distinct uprog.lesson_id), 0)::bigint as lessons_completed,
      coalesce(count(distinct ua.achievement_id), 0)::bigint as achievements_count,
      coalesce(up.current_streak, 0)::integer as current_streak,
      greatest(
        coalesce(max(qa.completed_at), '1970-01-01'::timestamp),
        coalesce(max(uprog.completed_at), '1970-01-01'::timestamp),
        up.last_login_at
      ) as last_activity_date
    from user_profiles up
    left join quiz_attempts qa on up.id = qa.user_id
    left join user_progress uprog on up.id = uprog.user_id and uprog.completed_at is not null
    left join user_achievements ua on up.id = ua.user_id
    group by up.id, up.username, up.full_name, up.avatar_url, up.current_streak, up.last_login_at
  )
  select 
    us.user_id,
    us.username,
    us.full_name,
    us.avatar_url,
    us.total_points,
    us.quizzes_completed,
    us.average_score,
    us.highest_score,
    us.fastest_completion_seconds,
    us.lessons_completed,
    us.achievements_count,
    us.current_streak,
    us.last_activity_date,
    row_number() over (
      order by 
        us.total_points desc, 
        us.average_score desc, 
        us.quizzes_completed desc,
        us.lessons_completed desc,
        us.achievements_count desc
    )::integer as rank
  from user_stats us
  where us.total_points > 0 or us.lessons_completed > 0
  order by rank;
end;
$$;

-- Function to get weekly leaderboard
create or replace function get_weekly_leaderboard()
returns table (
  user_id uuid,
  username text,
  full_name text,
  avatar_url text,
  weekly_points bigint,
  weekly_quizzes bigint,
  weekly_lessons bigint,
  rank integer
) 
language plpgsql
as $$
begin
  return query
  with weekly_stats as (
    select 
      up.id as user_id,
      up.username,
      up.full_name,
      up.avatar_url,
      coalesce(sum(case when qa.completed_at >= current_date - interval '7 days' then qa.score else 0 end), 0)::bigint as weekly_points,
      count(distinct case when qa.completed_at >= current_date - interval '7 days' then qa.quiz_id end)::bigint as weekly_quizzes,
      count(distinct case when uprog.completed_at >= current_date - interval '7 days' then uprog.lesson_id end)::bigint as weekly_lessons
    from user_profiles up
    left join quiz_attempts qa on up.id = qa.user_id
    left join user_progress uprog on up.id = uprog.user_id and uprog.completed_at is not null
    group by up.id, up.username, up.full_name, up.avatar_url
  )
  select 
    ws.user_id,
    ws.username,
    ws.full_name,
    ws.avatar_url,
    ws.weekly_points,
    ws.weekly_quizzes,
    ws.weekly_lessons,
    row_number() over (
      order by 
        ws.weekly_points desc, 
        ws.weekly_quizzes desc,
        ws.weekly_lessons desc
    )::integer as rank
  from weekly_stats ws
  where ws.weekly_points > 0 or ws.weekly_quizzes > 0 or ws.weekly_lessons > 0
  order by rank;
end;
$$;

-- Function to get monthly leaderboard
create or replace function get_monthly_leaderboard()
returns table (
  user_id uuid,
  username text,
  full_name text,
  avatar_url text,
  monthly_points bigint,
  monthly_quizzes bigint,
  monthly_lessons bigint,
  rank integer
) 
language plpgsql
as $$
begin
  return query
  with monthly_stats as (
    select 
      up.id as user_id,
      up.username,
      up.full_name,
      up.avatar_url,
      coalesce(sum(case when qa.completed_at >= current_date - interval '30 days' then qa.score else 0 end), 0)::bigint as monthly_points,
      count(distinct case when qa.completed_at >= current_date - interval '30 days' then qa.quiz_id end)::bigint as monthly_quizzes,
      count(distinct case when uprog.completed_at >= current_date - interval '30 days' then uprog.lesson_id end)::bigint as monthly_lessons
    from user_profiles up
    left join quiz_attempts qa on up.id = qa.user_id
    left join user_progress uprog on up.id = uprog.user_id and uprog.completed_at is not null
    group by up.id, up.username, up.full_name, up.avatar_url
  )
  select 
    ms.user_id,
    ms.username,
    ms.full_name,
    ms.avatar_url,
    ms.monthly_points,
    ms.monthly_quizzes,
    ms.monthly_lessons,
    row_number() over (
      order by 
        ms.monthly_points desc, 
        ms.monthly_quizzes desc,
        ms.monthly_lessons desc
    )::integer as rank
  from monthly_stats ms
  where ms.monthly_points > 0 or ms.monthly_quizzes > 0 or ms.monthly_lessons > 0
  order by rank;
end;
$$;
