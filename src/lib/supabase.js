import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jekjpegnphnnkfobnthd.supabase.co'
const supabaseKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impla2pwZWducGhubmtmb2JudGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzM5MjEsImV4cCI6MjA2NzEwOTkyMX0._6Il7zfHdyYokasfvBW3ibpeZ-DUrA3bRwbDChq-DJ8'

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase credentials. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  // Add debug mode for development
  db: {
    schema: 'public'
  },
  global: {
    headers: { 
      'x-application-name': 'civicSparkAI'
    },
  }
})

// Helper functions for auth
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// User profile functions
export const fetchUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  return { data, error };
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  return { data, error }
}

// User achievements functions
export const fetchUserAchievements = async (userId) => {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievements (
        id,
        name,
        description,
        icon_url,
        points,
        achievement_type
      )
    `)
    .eq('user_id', userId);
    
  return { data, error };
};

// Quiz data functions
export const fetchQuizzes = async () => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export const fetchQuizById = async (id) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, questions(*)')
    .eq('id', id)
    .single()
  return { data, error }
}

export const saveQuizResult = async (userId, quizId, score, totalQuestions) => {
  const { data, error } = await supabase
    .from('quiz_results')
    .insert([
      { user_id: userId, quiz_id: quizId, score, total_questions: totalQuestions }
    ])
  return { data, error }
}

// Subscription and payment related functions
export const checkSubscription = async (userId) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()
  return { data, error }
}

// Check and create the profiles table if it doesn't exist
export const ensureProfilesTable = async () => {
  try {
    // First check if the table exists by attempting to get a row
    const { error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    // If we get a 404 error, the table doesn't exist
    if (checkError && checkError.code === '404') {
      console.log('Profiles table does not exist. Creating it...');
      
      // Use Supabase's REST API to create the table
      // This is a simplified approach - typically you would use migrations
      const { error: createError } = await supabase.rpc('create_profiles_table');
      
      if (createError) {
        console.error('Failed to create profiles table:', createError);
        return { success: false, error: createError };
      }
      
      console.log('Profiles table created successfully');
      return { success: true };
    }
    
    console.log('Profiles table already exists');
    return { success: true };
  } catch (error) {
    console.error('Error checking/creating profiles table:', error);
    return { success: false, error };
  }
};

// Create a stored procedure to create the profiles table
export const createProfilesTableFunction = async () => {
  try {
    // This needs to be run as a superuser or with enough privileges
    const { error } = await supabase.rpc('create_profiles_table_function', {});
    
    if (error) {
      console.error('Failed to create function:', error);
      return { success: false, error };
    }
    
    console.log('Function created successfully');
    return { success: true };
  } catch (error) {
    console.error('Error creating function:', error);
    return { success: false, error };
  }
};