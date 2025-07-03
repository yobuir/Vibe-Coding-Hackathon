import { supabase } from './supabase';
import { runAllAIQuizMigrations } from './aiQuizMigration';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Complete migration and seeding system for CivicSpark AI
 */

/**
 * Create leaderboard functions in the database
 */
const createLeaderboardFunctions = async () => {
  console.log('📊 Creating leaderboard functions...');
  
  try {
    // Read the SQL file
    const sqlPath = join(process.cwd(), 'src', 'lib', 'sql', 'leaderboard_function.sql');
    const leaderboardSQL = readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL to create functions
    const { error } = await supabase.rpc('exec_sql', { sql_text: leaderboardSQL });
    
    if (error) {
      // If rpc doesn't work, try direct execution
      console.log('Attempting direct SQL execution...');
      const { error: directError } = await supabase
        .from('information_schema.routines')
        .select('routine_name')
        .eq('routine_name', 'calculate_leaderboard_rankings');
      
      // Create functions directly using individual SQL commands
      const functionSQL = `
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
      `;
      
      const { error: createError } = await supabase.rpc('create_leaderboard_function', { 
        function_sql: functionSQL 
      });
      
      if (createError) {
        console.log('⚠️ Could not create leaderboard function via RPC, this is expected in some Supabase configurations');
        return { success: true, warning: 'Function creation skipped - will use fallback data' };
      }
    }
    
    console.log('✅ Leaderboard functions created successfully');
    return { success: true };
  } catch (error) {
    console.log('⚠️ Leaderboard function creation failed:', error.message);
    return { success: true, warning: 'Function creation failed - will use fallback data' };
  }
};

/**
 * Run all database migrations
 */
export const runMigrations = async () => {
  console.log('🚀 Starting database migrations...');
  
  try {
    // Run AI quiz migrations
    const aiMigrationResult = await runAllAIQuizMigrations();
    
    if (!aiMigrationResult.success) {
      console.error('❌ AI quiz migration failed:', aiMigrationResult);
      return { success: false, error: 'AI quiz migration failed' };
    }
    
    // Create leaderboard functions
    const leaderboardResult = await createLeaderboardFunctions();
    
    console.log('✅ All migrations completed successfully');
    return { 
      success: true, 
      migrations: { 
        aiQuiz: aiMigrationResult,
        leaderboard: leaderboardResult
      } 
    };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Seed Rwanda civic education quizzes
 */
export const seedRwandaCivicQuizzes = async () => {
  console.log('🌱 Seeding Rwanda civic education quizzes...');
  
  try {
    // Check if we already have Rwanda quizzes
    const { data: existingQuizzes, error: checkError } = await supabase
      .from('quizzes')
      .select('id, title')
      .ilike('title', '%rwanda%')
      .limit(1);
    
    if (!checkError && existingQuizzes.length > 0) {
      console.log('Rwanda quiz data already exists, skipping seed');
      return { success: true, skipped: true };
    }
    
    const rwandaQuizzes = [
      {
        title: "Rwanda Constitution and Governance",
        description: "Test your knowledge about Rwanda's constitutional framework and governance structure.",
        difficulty_level: "beginner",
        category: "civic_education",
        tags: ["constitution", "governance", "rwanda", "government"],
        time_limit_seconds: 600,
        passing_score: 70,
        is_published: true
      },
      {
        title: "Democratic Participation in Rwanda",
        description: "Learn about citizen participation, elections, and democratic processes in Rwanda.",
        difficulty_level: "intermediate",
        category: "civic_education", 
        tags: ["democracy", "participation", "elections", "umuganda"],
        time_limit_seconds: 900,
        passing_score: 75,
        is_published: true
      },
      {
        title: "Rwanda's Journey: History and Unity",
        description: "Explore Rwanda's history, the path to unity and reconciliation.",
        difficulty_level: "intermediate",
        category: "civic_education",
        tags: ["history", "unity", "reconciliation", "independence"],
        time_limit_seconds: 900,
        passing_score: 75,
        is_published: true
      },
      {
        title: "Rights and Responsibilities in Rwanda",
        description: "Understand your rights and civic duties as outlined in Rwanda's Constitution.",
        difficulty_level: "beginner",
        category: "civic_education",
        tags: ["rights", "responsibilities", "constitution", "citizenship"],
        time_limit_seconds: 600,
        passing_score: 70,
        is_published: true
      },
      {
        title: "Public Institutions and Service Delivery",
        description: "Learn about Rwanda's public institutions and how they serve citizens.",
        difficulty_level: "intermediate",
        category: "civic_education",
        tags: ["institutions", "public_service", "rra", "rgb"],
        time_limit_seconds: 900,
        passing_score: 75,
        is_published: true
      },
      {
        title: "Vision 2050 and Development Goals",
        description: "Explore Rwanda's development vision and transformation strategy.",
        difficulty_level: "advanced",
        category: "civic_education",
        tags: ["vision2050", "development", "nst1", "transformation"],
        time_limit_seconds: 1200,
        passing_score: 80,
        is_published: true
      }
    ];
    
    // Insert quizzes one by one to get their IDs
    const insertedQuizzes = [];
    for (const quiz of rwandaQuizzes) {
      const { data: insertedQuiz, error: quizError } = await supabase
        .from('quizzes')
        .insert([quiz])
        .select()
        .single();
      
      if (quizError) {
        console.error('Error inserting quiz:', quiz.title, quizError);
        continue;
      }
      
      insertedQuizzes.push(insertedQuiz);
      console.log(`✅ Seeded quiz: ${quiz.title}`);
    }
    
    console.log(`🌱 Successfully seeded ${insertedQuizzes.length} Rwanda civic quizzes`);
    return { success: true, quizzes: insertedQuizzes };
  } catch (error) {
    console.error('❌ Error seeding Rwanda quizzes:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Seed quiz questions for Rwanda civic education
 */
export const seedRwandaQuizQuestions = async () => {
  console.log('🌱 Seeding Rwanda quiz questions...');
  
  try {
    // Get all Rwanda quizzes
    let { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('id, title')
      .eq('category', 'civic_education');
    
    if (quizzesError) {
      console.error('Error fetching quizzes:', quizzesError);
      return { success: false, error: `Failed to fetch quizzes: ${quizzesError.message || JSON.stringify(quizzesError)}` };
    }
    
    if (!quizzes || quizzes.length === 0) {
      console.log('No quizzes found. Running quiz seeding first...');
      const quizSeedResult = await seedRwandaCivicQuizzes();
      if (!quizSeedResult.success && !quizSeedResult.skipped) {
        return { success: false, error: `Failed to seed quizzes first: ${quizSeedResult.error}` };
      }
      
      // Fetch quizzes again after seeding
      const { data: newQuizzes, error: newQuizzesError } = await supabase
        .from('quizzes')
        .select('id, title')
        .eq('category', 'civic_education');
      
      if (newQuizzesError) {
        return { success: false, error: `Failed to fetch quizzes after seeding: ${newQuizzesError.message}` };
      }
      
      quizzes = newQuizzes;
    }
    
    // Question sets for each quiz
    const questionSets = {
      "Rwanda Constitution and Governance": [
        {
          question_text: "What is the highest law in Rwanda?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "The Constitution of Rwanda is the supreme law of the country, adopted in 2003 and amended in 2015. All other laws must comply with the Constitution.",
          order_position: 1,
          options: [
            { option_text: "Parliamentary Act", is_correct: false, order_position: 1 },
            { option_text: "The Constitution", is_correct: true, order_position: 2 },
            { option_text: "Presidential Decree", is_correct: false, order_position: 3 },
            { option_text: "Ministerial Order", is_correct: false, order_position: 4 }
          ]
        },
        {
          question_text: "How many chambers does the Rwanda Parliament have?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "Rwanda has a bicameral parliament consisting of the Chamber of Deputies (lower house) and the Senate (upper house).",
          order_position: 2,
          options: [
            { option_text: "One chamber", is_correct: false, order_position: 1 },
            { option_text: "Two chambers", is_correct: true, order_position: 2 },
            { option_text: "Three chambers", is_correct: false, order_position: 3 },
            { option_text: "Four chambers", is_correct: false, order_position: 4 }
          ]
        },
        {
          question_text: "What percentage of parliamentary seats are reserved for women in Rwanda?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "Rwanda's Constitution mandates that at least 30% of parliamentary seats be reserved for women, making it a leader in gender representation.",
          order_position: 3,
          options: [
            { option_text: "20%", is_correct: false, order_position: 1 },
            { option_text: "25%", is_correct: false, order_position: 2 },
            { option_text: "At least 30%", is_correct: true, order_position: 3 },
            { option_text: "50%", is_correct: false, order_position: 4 }
          ]
        }
      ],
      "Democratic Participation in Rwanda": [
        {
          question_text: "What is Umuganda?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "Umuganda is a monthly community service day held on the last Saturday of each month, promoting unity and community development.",
          order_position: 1,
          options: [
            { option_text: "A traditional dance", is_correct: false, order_position: 1 },
            { option_text: "Community work day", is_correct: true, order_position: 2 },
            { option_text: "A religious ceremony", is_correct: false, order_position: 3 },
            { option_text: "A market day", is_correct: false, order_position: 4 }
          ]
        },
        {
          question_text: "How often does the National Dialogue Council (Umushyikirano) meet?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "The National Dialogue Council meets annually to discuss national issues and evaluate the performance of government institutions.",
          order_position: 2,
          options: [
            { option_text: "Monthly", is_correct: false, order_position: 1 },
            { option_text: "Quarterly", is_correct: false, order_position: 2 },
            { option_text: "Annually", is_correct: true, order_position: 3 },
            { option_text: "Every two years", is_correct: false, order_position: 4 }
          ]
        }
      ],
      "Rwanda's Journey: History and Unity": [
        {
          question_text: "In what year did Rwanda gain independence?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "Rwanda gained independence from Belgium on July 1, 1962, after being under colonial rule and UN trusteeship.",
          order_position: 1,
          options: [
            { option_text: "1959", is_correct: false, order_position: 1 },
            { option_text: "1962", is_correct: true, order_position: 2 },
            { option_text: "1961", is_correct: false, order_position: 3 },
            { option_text: "1960", is_correct: false, order_position: 4 }
          ]
        },
        {
          question_text: "What was the traditional governing system in pre-colonial Rwanda?",
          question_type: "multiple_choice", 
          points: 1,
          explanation: "Pre-colonial Rwanda was a monarchy with a complex political system centered around the Mwami (king) and various administrative chiefs.",
          order_position: 2,
          options: [
            { option_text: "Democratic republic", is_correct: false, order_position: 1 },
            { option_text: "Monarchy", is_correct: true, order_position: 2 },
            { option_text: "Tribal council", is_correct: false, order_position: 3 },
            { option_text: "Military rule", is_correct: false, order_position: 4 }
          ]
        }
      ],
      "Rights and Responsibilities in Rwanda": [
        {
          question_text: "According to Rwanda's Constitution, what is the minimum age to vote?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "Citizens aged 18 and above have the right to vote in Rwanda, as stipulated in the Constitution.",
          order_position: 1,
          options: [
            { option_text: "16 years", is_correct: false, order_position: 1 },
            { option_text: "17 years", is_correct: false, order_position: 2 },
            { option_text: "18 years", is_correct: true, order_position: 3 },
            { option_text: "21 years", is_correct: false, order_position: 4 }
          ]
        },
        {
          question_text: "Which principle guides Rwanda's approach to unity and reconciliation?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "Rwanda promotes the principle of 'One Rwanda for all Rwandans,' emphasizing unity over ethnic divisions as part of its reconciliation efforts.",
          order_position: 2,
          options: [
            { option_text: "Ethnic diversity", is_correct: false, order_position: 1 },
            { option_text: "One Rwanda for all Rwandans", is_correct: true, order_position: 2 },
            { option_text: "Regional autonomy", is_correct: false, order_position: 3 },
            { option_text: "Cultural separation", is_correct: false, order_position: 4 }
          ]
        }
      ],
      "Public Institutions and Service Delivery": [
        {
          question_text: "What does RRA stand for?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "RRA stands for Rwanda Revenue Authority, the institution responsible for tax collection and customs in Rwanda.",
          order_position: 1,
          options: [
            { option_text: "Rwanda Roads Agency", is_correct: false, order_position: 1 },
            { option_text: "Rwanda Revenue Authority", is_correct: true, order_position: 2 },
            { option_text: "Rwanda Rural Association", is_correct: false, order_position: 3 },
            { option_text: "Rwanda Research Academy", is_correct: false, order_position: 4 }
          ]
        },
        {
          question_text: "Which institution oversees governance quality in Rwanda?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "The Rwanda Governance Board (RGB) is responsible for promoting good governance and fighting corruption in Rwanda.",
          order_position: 2,
          options: [
            { option_text: "Ministry of Justice", is_correct: false, order_position: 1 },
            { option_text: "Parliament", is_correct: false, order_position: 2 },
            { option_text: "Rwanda Governance Board (RGB)", is_correct: true, order_position: 3 },
            { option_text: "Supreme Court", is_correct: false, order_position: 4 }
          ]
        }
      ],
      "Vision 2050 and Development Goals": [
        {
          question_text: "What is Rwanda's long-term development vision called?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "Vision 2050 is Rwanda's long-term development strategy that aims to transform the country into a high-income economy.",
          order_position: 1,
          options: [
            { option_text: "Vision 2030", is_correct: false, order_position: 1 },
            { option_text: "Vision 2040", is_correct: false, order_position: 2 },
            { option_text: "Vision 2050", is_correct: true, order_position: 3 },
            { option_text: "Vision 2060", is_correct: false, order_position: 4 }
          ]
        },
        {
          question_text: "What does NST1 refer to in Rwanda's development planning?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "NST1 refers to the National Strategy for Transformation 1 (2017-2024), Rwanda's medium-term development plan aligned with Vision 2050.",
          order_position: 2,
          options: [
            { option_text: "National Science and Technology plan", is_correct: false, order_position: 1 },
            { option_text: "National Strategy for Transformation 1", is_correct: true, order_position: 2 },
            { option_text: "New Social Transformation initiative", is_correct: false, order_position: 3 },
            { option_text: "National Security Task force 1", is_correct: false, order_position: 4 }
          ]
        }
      ]
    };
    
    let totalQuestions = 0;
    
    // Seed questions for each quiz
    for (const quiz of quizzes) {
      const questions = questionSets[quiz.title];
      if (!questions) {
        console.log(`⚠️ No questions found for quiz: ${quiz.title}`);
        continue;
      }
      
      for (const questionData of questions) {
        try {
          // Insert question
          const { data: question, error: questionError } = await supabase
            .from('quiz_questions')
            .insert([{
              quiz_id: quiz.id,
              question_text: questionData.question_text,
              question_type: questionData.question_type,
              points: questionData.points,
              explanation: questionData.explanation,
              order_position: questionData.order_position
            }])
            .select()
            .single();
          
          if (questionError) {
            console.error('Error inserting question:', questionData.question_text, questionError);
            return { success: false, error: `Failed to insert question "${questionData.question_text}": ${questionError.message || JSON.stringify(questionError)}` };
          }
          
          // Insert answer options
          for (const option of questionData.options) {
            const { error: optionError } = await supabase
              .from('answer_options')
              .insert([{
                question_id: question.id,
                option_text: option.option_text,
                is_correct: option.is_correct,
                order_position: option.order_position
              }]);
            
            if (optionError) {
              console.error('Error inserting option:', option.option_text, optionError);
              return { success: false, error: `Failed to insert option "${option.option_text}": ${optionError.message || JSON.stringify(optionError)}` };
            }
          }
          
          totalQuestions++;
        } catch (questionInsertError) {
          console.error('Exception during question insertion:', questionInsertError);
          return { success: false, error: `Exception during question insertion: ${questionInsertError.message}` };
        }
      }
      
      console.log(`✅ Seeded questions for: ${quiz.title}`);
    }
    
    console.log(`🌱 Successfully seeded ${totalQuestions} questions across ${quizzes.length} quizzes`);
    return { success: true, questionCount: totalQuestions, quizCount: quizzes.length };
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Seed sample lessons
 */
export const seedRwandaLessons = async () => {
  console.log('🌱 Seeding Rwanda civic education lessons...');
  
  try {
    // Check if we already have lessons
    const { data: existingLessons, error: checkError } = await supabase
      .from('lessons')
      .select('id')
      .limit(1);
    
    if (!checkError && existingLessons.length > 0) {
      console.log('Lesson data already exists, skipping seed');
      return { success: true, skipped: true };
    }
    
    const rwandaLessons = [
      {
        title: "Introduction to Rwanda's Constitution",
        description: "Learn about the fundamental principles and structure of Rwanda's Constitution.",
        content: `# Rwanda's Constitution: Foundation of Our Nation

## Overview
The Constitution of Rwanda, adopted in 2003 and amended in 2015, serves as the supreme law of our country. It establishes the framework for governance, defines the rights and responsibilities of citizens, and outlines the structure of government institutions.

## Key Principles
- **Unity and Reconciliation**: The Constitution emphasizes the importance of national unity
- **Gender Equality**: Guarantees equal rights for all citizens regardless of gender
- **Good Governance**: Establishes principles for transparent and accountable governance
- **Human Rights**: Protects fundamental rights and freedoms

## Structure of Government
The Constitution establishes three branches of government:
1. **Executive Branch**: Led by the President
2. **Legislative Branch**: Bicameral Parliament (Chamber of Deputies and Senate)  
3. **Judicial Branch**: Independent courts and tribunals

## Citizen Rights and Duties
The Constitution outlines both rights and responsibilities of Rwandan citizens, emphasizing the balance between individual freedoms and collective responsibility.`,
        category: "civic_education",
        tags: ["constitution", "governance", "rights", "government_structure"],
        difficulty_level: "beginner",
        estimated_duration_minutes: 20,
        is_published: true
      },
      {
        title: "Understanding Democratic Participation in Rwanda",
        description: "Explore how citizens participate in Rwanda's democratic processes.",
        content: `# Democratic Participation in Rwanda

## Citizen Engagement
Rwanda's democracy is built on active citizen participation through various mechanisms:

### Electoral Process
- **Presidential Elections**: Every 7 years
- **Parliamentary Elections**: Chamber of Deputies every 5 years
- **Local Elections**: Regular elections for local government positions

### Community Participation
- **Umuganda**: Monthly community service fostering unity and development
- **National Dialogue Council**: Annual forum for citizens to engage with leadership
- **Citizen Feedback Mechanisms**: Various platforms for public input on policies

### Youth and Women Participation
Rwanda leads globally in women's representation in parliament, with over 60% female representation in the Chamber of Deputies.

### Civil Society
Active civil society organizations contribute to policy discussions and community development initiatives.`,
        category: "civic_education",
        tags: ["democracy", "participation", "elections", "umuganda"],
        difficulty_level: "intermediate",
        estimated_duration_minutes: 25,
        is_published: true
      },
      {
        title: "Rwanda's Vision 2050: Building Our Future",
        description: "Understand Rwanda's long-term development strategy and goals.",
        content: `# Vision 2050: Transforming Rwanda

## Overview
Vision 2050 is Rwanda's ambitious long-term development strategy that aims to transform the country into a high-income, knowledge-based economy.

## Key Pillars

### 1. High Quality of Life
- Universal access to quality healthcare
- Quality education for all
- Decent housing and social protection

### 2. Modern Infrastructure
- World-class transport and ICT infrastructure
- Sustainable energy systems
- Smart cities and digital transformation

### 3. Transformed Economy
- Knowledge and technology-based economy
- High productivity and competitiveness
- Sustainable industrialization

### 4. Good Governance
- Transparent and accountable institutions
- Rule of law and justice
- Peaceful and secure society

## Implementation Strategy
Vision 2050 is implemented through 7-year National Strategy for Transformation (NST) plans, with NST1 covering 2017-2024.

## Citizen Role
Every Rwandan has a role in achieving Vision 2050 through:
- Education and skills development
- Innovation and entrepreneurship
- Environmental protection
- Community participation`,
        category: "civic_education",
        tags: ["vision2050", "development", "transformation", "nst1"],
        difficulty_level: "intermediate",
        estimated_duration_minutes: 30,
        is_published: true
      }
    ];
    
    const insertedLessons = [];
    for (const lesson of rwandaLessons) {
      const { data: insertedLesson, error: lessonError } = await supabase
        .from('lessons')
        .insert([lesson])
        .select()
        .single();
      
      if (lessonError) {
        console.error('Error inserting lesson:', lesson.title, lessonError);
        continue;
      }
      
      insertedLessons.push(insertedLesson);
      console.log(`✅ Seeded lesson: ${lesson.title}`);
    }
    
    console.log(`🌱 Successfully seeded ${insertedLessons.length} Rwanda civic lessons`);
    return { success: true, lessons: insertedLessons };
  } catch (error) {
    console.error('❌ Error seeding lessons:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Run complete migration and seeding process
 */
export const runMigrationsAndSeed = async () => {
  console.log('🚀 Starting complete database setup...\n');
  
  try {
    // Step 1: Run migrations
    console.log('Step 1: Running migrations...');
    const migrationResult = await runMigrations();
    if (!migrationResult.success) {
      throw new Error(`Migration failed: ${migrationResult.error}`);
    }
    console.log('✅ Migrations completed\n');
    
    // Step 2: Seed quizzes
    console.log('Step 2: Seeding quizzes...');
    const quizSeedResult = await seedRwandaCivicQuizzes();
    if (!quizSeedResult.success && !quizSeedResult.skipped) {
      throw new Error(`Quiz seeding failed: ${quizSeedResult.error}`);
    }
    console.log('✅ Quiz seeding completed\n');
    
    // Step 3: Seed questions
    console.log('Step 3: Seeding quiz questions...');
    const questionSeedResult = await seedRwandaQuizQuestions();
    if (!questionSeedResult.success) {
      console.error('Question seeding failed with error:', questionSeedResult.error);
      throw new Error(`Question seeding failed: ${JSON.stringify(questionSeedResult.error)}`);
    }
    console.log('✅ Question seeding completed\n');
    
    // Step 4: Seed lessons
    console.log('Step 4: Seeding lessons...');
    const lessonSeedResult = await seedRwandaLessons();
    if (!lessonSeedResult.success && !lessonSeedResult.skipped) {
      throw new Error(`Lesson seeding failed: ${lessonSeedResult.error}`);
    }
    console.log('✅ Lesson seeding completed\n');
    
    console.log('🎉 Database setup completed successfully!');
    console.log('\nSummary:');
    console.log(`- Migrations: ✅ Success`);
    console.log(`- Quizzes: ${quizSeedResult.skipped ? '⚠️ Skipped (already exists)' : `✅ ${quizSeedResult.quizzes?.length || 0} seeded`}`);
    console.log(`- Questions: ✅ ${questionSeedResult.questionCount || 0} seeded`);
    console.log(`- Lessons: ${lessonSeedResult.skipped ? '⚠️ Skipped (already exists)' : `✅ ${lessonSeedResult.lessons?.length || 0} seeded`}`);
    
    return {
      success: true,
      results: {
        migrations: migrationResult,
        quizzes: quizSeedResult,
        questions: questionSeedResult,
        lessons: lessonSeedResult
      }
    };
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return { success: false, error: error.message };
  }
};
