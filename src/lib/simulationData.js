import { supabase } from './supabase';

// Create simulation-related database tables if they don't exist
export const createSimulationTables = async () => {
  try {
    // Create simulation_attempts table
    await supabase.rpc('create_simulation_attempts_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS simulation_attempts (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES profiles(user_id),
          simulation_id INTEGER NOT NULL,
          start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          completed BOOLEAN DEFAULT FALSE,
          final_score INTEGER DEFAULT 0,
          completion_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create simulation_progress table
    await supabase.rpc('create_simulation_progress_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS simulation_progress (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES profiles(user_id),
          simulation_id INTEGER NOT NULL,
          current_step INTEGER DEFAULT 0,
          completion_status VARCHAR(50) DEFAULT 'started',
          completion_percentage INTEGER DEFAULT 0,
          responses JSONB,
          current_score INTEGER DEFAULT 0,
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create indexes for better performance
    await supabase.rpc('create_simulation_indexes', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_simulation_attempts_user_id ON simulation_attempts(user_id);
        CREATE INDEX IF NOT EXISTS idx_simulation_attempts_completed ON simulation_attempts(completed);
        CREATE INDEX IF NOT EXISTS idx_simulation_progress_user_id ON simulation_progress(user_id);
        CREATE INDEX IF NOT EXISTS idx_simulation_progress_simulation_id ON simulation_progress(simulation_id);
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating simulation tables:', error);
    return { success: false, error: error.message };
  }
};

// Sample simulation data for testing
export const sampleSimulationData = {
  scenarios: [
    {
      id: 1,
      title: "Local Election Campaign",
      description: "Run for mayor and learn about democratic processes",
      category: "Elections",
      difficulty: "intermediate",
      estimatedTime: 20,
      steps: [
        {
          id: 1,
          title: "Campaign Launch",
          description: "You're running for mayor of your district. How do you launch your campaign?",
          choices: [
            { id: 'a', text: 'Hold a big rally in the town square', points: 8 },
            { id: 'b', text: 'Start with door-to-door visits', points: 10 },
            { id: 'c', text: 'Launch on social media first', points: 6 },
            { id: 'd', text: 'Meet with community leaders', points: 9 }
          ],
          correctChoice: 'b',
          explanation: 'Door-to-door visits show personal commitment and help you understand community needs directly.',
          feedback: {
            'a': 'Good visibility, but may seem disconnected from individual concerns.',
            'b': 'Excellent choice! Personal connection builds trust and understanding.',
            'c': 'Good reach, but lacks personal touch that voters value.',
            'd': 'Smart networking, but should be combined with grassroots engagement.'
          }
        },
        {
          id: 2,
          title: "Budget Priorities",
          description: "Your campaign promises require budget allocation. Which area gets priority?",
          choices: [
            { id: 'a', text: 'Education and schools', points: 9 },
            { id: 'b', text: 'Infrastructure and roads', points: 8 },
            { id: 'c', text: 'Healthcare services', points: 10 },
            { id: 'd', text: 'Economic development', points: 7 }
          ],
          correctChoice: 'c',
          explanation: 'Healthcare is a fundamental need that affects all citizens directly.',
          feedback: {
            'a': 'Important for long-term development, but not the most urgent need.',
            'b': 'Necessary infrastructure, but people need healthcare first.',
            'c': 'Excellent! Healthcare is a basic right that affects everyone.',
            'd': 'Important, but basic needs like healthcare should come first.'
          }
        }
      ]
    },
    {
      id: 2,
      title: "Community Budget Planning",
      description: "Allocate limited resources across community needs",
      category: "Budget",
      difficulty: "advanced",
      estimatedTime: 25,
      steps: [
        {
          id: 1,
          title: "Budget Analysis",
          description: "The community has 1,000,000 RWF. How do you allocate it?",
          choices: [
            { id: 'a', text: '50% Infrastructure, 30% Education, 20% Healthcare', points: 7 },
            { id: 'b', text: '40% Education, 35% Healthcare, 25% Infrastructure', points: 10 },
            { id: 'c', text: '60% Infrastructure, 25% Education, 15% Healthcare', points: 5 },
            { id: 'd', text: '33% each for all three areas', points: 8 }
          ],
          correctChoice: 'b',
          explanation: 'Balancing human development (education and healthcare) with infrastructure creates sustainable growth.',
          feedback: {
            'a': 'Infrastructure focus is good, but education and healthcare need more investment.',
            'b': 'Perfect balance! Investing in people while maintaining infrastructure.',
            'c': 'Too infrastructure-heavy at the expense of human development.',
            'd': 'Equal distribution is fair, but strategic priorities matter more.'
          }
        }
      ]
    },
    {
      id: 3,
      title: "Citizens' Rights Workshop",
      description: "Navigate scenarios involving citizen rights and advocacy",
      category: "Rights",
      difficulty: "beginner",
      estimatedTime: 15,
      steps: [
        {
          id: 1,
          title: "Right to Information",
          description: "A citizen requests government documents. What's the correct response?",
          choices: [
            { id: 'a', text: 'Provide documents immediately', points: 8 },
            { id: 'b', text: 'Check if documents are public first', points: 10 },
            { id: 'c', text: 'Refuse without explanation', points: 2 },
            { id: 'd', text: 'Ask for payment first', points: 3 }
          ],
          correctChoice: 'b',
          explanation: 'Following proper procedures protects both citizen rights and confidential information.',
          feedback: {
            'a': 'Good intention, but some documents may be confidential.',
            'b': 'Excellent! Proper procedure protects rights while maintaining security.',
            'c': 'This violates the right to information.',
            'd': 'Public information should be freely accessible.'
          }
        }
      ]
    }
  ],
  achievements: [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first simulation",
      condition: "complete_simulation",
      points: 50,
      badge: "🎯"
    },
    {
      id: 2,
      title: "Democracy Champion",
      description: "Complete 5 election simulations",
      condition: "complete_category_elections_5",
      points: 100,
      badge: "🏛️"
    },
    {
      id: 3,
      title: "Budget Master",
      description: "Score 90% or higher in budget simulations",
      condition: "score_budget_90",
      points: 150,
      badge: "💰"
    },
    {
      id: 4,
      title: "Rights Advocate",
      description: "Complete all rights simulations",
      condition: "complete_category_rights_all",
      points: 200,
      badge: "⚖️"
    }
  ]
};

export default sampleSimulationData;
