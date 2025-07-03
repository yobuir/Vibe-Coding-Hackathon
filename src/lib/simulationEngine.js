// Simulation utilities for managing interactive civic scenarios
import { supabase } from './supabase';

// Sample simulation data with interactive scenarios
export const simulationData = {
  1: { // Local Election Campaign
    id: 1,
    title: "Local Election Campaign",
    totalSteps: 5,
    scenarios: [
      {
        step: 1,
        title: "Campaign Launch",
        description: "You're running for district mayor. Choose your campaign platform:",
        image: "🏛️",
        choices: [
          {
            id: "A",
            text: "Focus on economic development and job creation",
            points: 20,
            feedback: "Great choice! Economic issues resonate with many voters.",
            consequences: "Business community shows support"
          },
          {
            id: "B", 
            text: "Prioritize education and youth programs",
            points: 25,
            feedback: "Excellent! Education is a key concern for families.",
            consequences: "Teachers union endorses your campaign"
          },
          {
            id: "C",
            text: "Focus on infrastructure and public services",
            points: 15,
            feedback: "Good approach, though voters want more specific plans.",
            consequences: "Mixed response from community leaders"
          }
        ]
      },
      {
        step: 2,
        title: "Campaign Funding",
        description: "You need to raise funds for your campaign. What's your strategy?",
        image: "💰",
        choices: [
          {
            id: "A",
            text: "Organize community fundraising events",
            points: 30,
            feedback: "Perfect! Grassroots funding builds strong community support.",
            consequences: "High community engagement and trust"
          },
          {
            id: "B",
            text: "Seek corporate sponsorships",
            points: 10,
            feedback: "This may raise questions about your independence.",
            consequences: "Some voters question your loyalties"
          },
          {
            id: "C",
            text: "Use personal savings and family support",
            points: 20,
            feedback: "Shows commitment, but limits your campaign reach.",
            consequences: "Limited campaign activities"
          }
        ]
      },
      {
        step: 3,
        title: "Voter Outreach",
        description: "How will you connect with voters in your district?",
        image: "🗳️",
        choices: [
          {
            id: "A",
            text: "Door-to-door campaigning in all neighborhoods",
            points: 35,
            feedback: "Excellent! Personal connection is very effective.",
            consequences: "Strong rapport with diverse communities"
          },
          {
            id: "B",
            text: "Focus on social media and digital campaigns",
            points: 15,
            feedback: "Good for young voters, but may miss older demographics.",
            consequences: "Strong youth support, weaker with elderly"
          },
          {
            id: "C",
            text: "Organize town hall meetings",
            points: 25,
            feedback: "Great for detailed discussions, but limited reach.",
            consequences: "Deep engagement with interested voters"
          }
        ]
      },
      {
        step: 4,
        title: "Debate Preparation",
        description: "The candidate debate is tomorrow. How do you prepare?",
        image: "🎤",
        choices: [
          {
            id: "A",
            text: "Study all local issues and prepare detailed policy responses",
            points: 30,
            feedback: "Excellent preparation shows competence and dedication.",
            consequences: "Strong debate performance"
          },
          {
            id: "B",
            text: "Focus on memorable sound bites and catchphrases",
            points: 10,
            feedback: "Style over substance may backfire with informed voters.",
            consequences: "Mixed debate reception"
          },
          {
            id: "C",
            text: "Practice answering tough questions with honesty",
            points: 25,
            feedback: "Honesty is valued, but you need specific solutions too.",
            consequences: "Voters appreciate authenticity"
          }
        ]
      },
      {
        step: 5,
        title: "Election Day Strategy",
        description: "It's election day! What's your final push strategy?",
        image: "📊",
        choices: [
          {
            id: "A",
            text: "Coordinate volunteers to help voters get to polling stations",
            points: 35,
            feedback: "Perfect! Helping voters participate strengthens democracy.",
            consequences: "High voter turnout in your favor"
          },
          {
            id: "B",
            text: "Focus on last-minute advertising blitz",
            points: 15,
            feedback: "Some impact, but voters have mostly decided by now.",
            consequences: "Modest increase in name recognition"
          },
          {
            id: "C",
            text: "Visit polling stations to thank voters",
            points: 20,
            feedback: "Nice gesture, but be careful not to influence voters at polls.",
            consequences: "Some voters appreciate the personal touch"
          }
        ]
      }
    ]
  },
  2: { // Community Budget Planning
    id: 2,
    title: "Community Budget Planning",
    totalSteps: 4,
    scenarios: [
      {
        step: 1,
        title: "Budget Assessment",
        description: "The district has 100 million RWF. Review these priority areas needing funding:",
        image: "📊",
        choices: [
          {
            id: "A",
            text: "Conduct community surveys to understand priorities",
            points: 30,
            feedback: "Excellent! Community input ensures democratic budgeting.",
            consequences: "Clear understanding of community needs"
          },
          {
            id: "B",
            text: "Review last year's budget and make incremental changes",
            points: 15,
            feedback: "Safe approach, but may not address changing needs.",
            consequences: "Some outdated allocations remain"
          },
          {
            id: "C",
            text: "Focus on infrastructure as the top priority",
            points: 20,
            feedback: "Infrastructure is important, but balance is key.",
            consequences: "Strong infrastructure focus, other areas may suffer"
          }
        ]
      },
      {
        step: 2,
        title: "Education vs Healthcare",
        description: "Both education and healthcare need 40 million RWF, but you only have 60 million left. How do you decide?",
        image: "⚖️",
        choices: [
          {
            id: "A",
            text: "Split equally: 30M each, find creative solutions for the gap",
            points: 25,
            feedback: "Balanced approach, but both sectors may be underfunded.",
            consequences: "Both sectors receive partial funding"
          },
          {
            id: "B",
            text: "Prioritize education (40M) and seek donor funding for healthcare",
            points: 30,
            feedback: "Good strategy! Education investment pays long-term dividends.",
            consequences: "Strong education investment, healthcare partnership developed"
          },
          {
            id: "C",
            text: "Prioritize healthcare (40M) as it's an immediate need",
            points: 25,
            feedback: "Healthcare is crucial, but education drives long-term development.",
            consequences: "Immediate health improvements, education gaps persist"
          }
        ]
      },
      {
        step: 3,
        title: "Infrastructure Investment",
        description: "Roads need repair (25M), clean water project needs 20M, and electricity expansion needs 15M. You have 40M left.",
        image: "🏗️",
        choices: [
          {
            id: "A",
            text: "Water (20M) + Electricity (15M) - most impact on daily life",
            points: 35,
            feedback: "Excellent! Clean water and electricity improve quality of life most.",
            consequences: "Significant improvement in living standards"
          },
          {
            id: "B",
            text: "Roads (25M) + partial electricity (15M) - economic focus",
            points: 25,
            feedback: "Good for economic development, but water remains an issue.",
            consequences: "Economic activity increases, water challenges remain"
          },
          {
            id: "C",
            text: "Spread funds evenly across all three projects",
            points: 15,
            feedback: "Fair but may result in incomplete projects.",
            consequences: "All projects started but none fully completed"
          }
        ]
      },
      {
        step: 4,
        title: "Budget Presentation",
        description: "Time to present your budget to the community. How do you approach this?",
        image: "📋",
        choices: [
          {
            id: "A",
            text: "Present detailed data with clear explanations and take questions",
            points: 35,
            feedback: "Perfect! Transparency and engagement build trust.",
            consequences: "Community fully supports the budget"
          },
          {
            id: "B",
            text: "Focus on major highlights and benefits",
            points: 20,
            feedback: "Good overview, but people may want more details.",
            consequences: "General approval but some unanswered questions"
          },
          {
            id: "C",
            text: "Present quickly and ask for quick approval",
            points: 10,
            feedback: "This approach may seem rushed and non-transparent.",
            consequences: "Community questions the process"
          }
        ]
      }
    ]
  },
  3: { // Citizens' Rights Workshop
    id: 3,
    title: "Citizens' Rights Workshop",
    totalSteps: 4,
    scenarios: [
      {
        step: 1,
        title: "Freedom of Expression",
        description: "You witness someone being silenced for expressing their opinion. What do you do?",
        image: "🗣️",
        choices: [
          {
            id: "A",
            text: "Speak up and cite their constitutional right to free expression",
            points: 30,
            feedback: "Brave! Defending rights in the moment is crucial.",
            consequences: "Others are encouraged to speak up too"
          },
          {
            id: "B",
            text: "Document the incident and report it to authorities later",
            points: 25,
            feedback: "Good documentation helps with accountability.",
            consequences: "Official investigation is launched"
          },
          {
            id: "C",
            text: "Do nothing to avoid conflict",
            points: 5,
            feedback: "Understandable but rights are protected when citizens act.",
            consequences: "Rights violations continue unchallenged"
          }
        ]
      },
      {
        step: 2,
        title: "Access to Information",
        description: "You need government documents for a community project but officials are being evasive. What's your approach?",
        image: "📄",
        choices: [
          {
            id: "A",
            text: "Submit formal request citing the Access to Information Law",
            points: 35,
            feedback: "Perfect! Using legal frameworks is the proper approach.",
            consequences: "Documents are provided within legal timeframe"
          },
          {
            id: "B",
            text: "Try to build personal relationships to get the information",
            points: 15,
            feedback: "May work but doesn't establish proper procedures.",
            consequences: "Inconsistent access, depends on relationships"
          },
          {
            id: "C",
            text: "Give up and look for alternative sources",
            points: 10,
            feedback: "You have the right to this information - don't give up!",
            consequences: "Important information remains inaccessible"
          }
        ]
      },
      {
        step: 3,
        title: "Equal Treatment",
        description: "You notice certain community members are being excluded from public services. How do you advocate for them?",
        image: "⚖️",
        choices: [
          {
            id: "A",
            text: "Organize community meetings to address discrimination",
            points: 30,
            feedback: "Great! Community action is powerful for change.",
            consequences: "Broader awareness and support for equal treatment"
          },
          {
            id: "B",
            text: "Report discrimination to human rights organizations",
            points: 25,
            feedback: "Good approach for systemic issues.",
            consequences: "Official investigation and policy changes"
          },
          {
            id: "C",
            text: "Help individuals access services without addressing the systemic issue",
            points: 15,
            feedback: "Helpful but doesn't solve the root problem.",
            consequences: "Temporary help but discrimination continues"
          }
        ]
      },
      {
        step: 4,
        title: "Civic Education",
        description: "Many people in your community don't know their rights. How do you help?",
        image: "📚",
        choices: [
          {
            id: "A",
            text: "Organize regular community workshops on rights and responsibilities",
            points: 35,
            feedback: "Excellent! Education empowers communities.",
            consequences: "Community becomes more informed and active"
          },
          {
            id: "B",
            text: "Share information through social media and local networks",
            points: 25,
            feedback: "Good reach, but may miss those without digital access.",
            consequences: "Younger demographics become more aware"
          },
          {
            id: "C",
            text: "Focus on helping people individually as issues arise",
            points: 20,
            feedback: "Helpful but reactive rather than proactive.",
            consequences: "Some individuals helped but overall awareness remains low"
          }
        ]
      }
    ]
  }
};

// Simulation state management
export class SimulationEngine {
  constructor(simulationId, userId) {
    this.simulationId = simulationId;
    this.userId = userId;
    this.currentStep = 1;
    this.totalScore = 0;
    this.choices = [];
    this.startTime = new Date();
    this.simulation = simulationData[simulationId];
  }

  getCurrentScenario() {
    if (!this.simulation) return null;
    return this.simulation.scenarios.find(s => s.step === this.currentStep);
  }

  makeChoice(choiceId) {
    const scenario = this.getCurrentScenario();
    if (!scenario) return null;

    const choice = scenario.choices.find(c => c.id === choiceId);
    if (!choice) return null;

    // Record the choice
    this.choices.push({
      step: this.currentStep,
      choiceId: choiceId,
      points: choice.points,
      text: choice.text,
      feedback: choice.feedback,
      consequences: choice.consequences
    });

    // Add points to total score
    this.totalScore += choice.points;

    // Move to next step
    this.currentStep += 1;

    return {
      choice: choice,
      totalScore: this.totalScore,
      isComplete: this.currentStep > this.simulation.totalSteps,
      nextScenario: this.getCurrentScenario()
    };
  }

  getProgress() {
    return {
      currentStep: this.currentStep,
      totalSteps: this.simulation?.totalSteps || 0,
      percentage: Math.round((this.currentStep - 1) / (this.simulation?.totalSteps || 1) * 100),
      score: this.totalScore
    };
  }

  getResults() {
    const maxPossibleScore = this.simulation.scenarios.reduce((total, scenario) => {
      const maxPoints = Math.max(...scenario.choices.map(c => c.points));
      return total + maxPoints;
    }, 0);

    const percentage = Math.round((this.totalScore / maxPossibleScore) * 100);
    const duration = Math.round((new Date() - this.startTime) / 1000 / 60); // minutes

    let performanceLevel = "Needs Improvement";
    let badge = "Participant";
    
    if (percentage >= 85) {
      performanceLevel = "Excellent";
      badge = "Civic Champion";
    } else if (percentage >= 70) {
      performanceLevel = "Good";
      badge = "Active Citizen";
    } else if (percentage >= 55) {
      performanceLevel = "Fair";
      badge = "Learning Citizen";
    }

    return {
      totalScore: this.totalScore,
      maxPossibleScore,
      percentage,
      performanceLevel,
      badge,
      duration,
      choices: this.choices,
      simulation: this.simulation
    };
  }
}

// Progress tracking functions
export const saveSimulationProgress = async (userId, simulationId, progress) => {
  try {
    const { data, error } = await supabase
      .from('simulation_progress')
      .upsert({
        user_id: userId,
        simulation_id: simulationId,
        current_step: progress.currentStep,
        total_score: progress.score,
        choices: progress.choices,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.warn('Database save failed, using memory storage:', error);
      // For now, just log and continue without database
      return { success: true, data: null };
    }
    return { success: true, data };
  } catch (error) {
    console.warn('Error saving simulation progress, continuing without database:', error);
    return { success: true, data: null };
  }
};

export const loadSimulationProgress = async (userId, simulationId) => {
  try {
    const { data, error } = await supabase
      .from('simulation_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('simulation_id', simulationId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      console.warn('Database load failed, starting fresh simulation:', error);
      return { success: true, data: null };
    }
    return { success: true, data: data[0] || null };
  } catch (error) {
    console.warn('Error loading simulation progress, starting fresh:', error);
    return { success: true, data: null };
  }
};

export const completeSimulation = async (userId, simulationId, results) => {
  try {
    // Save completion record
    const { data: completion, error: completionError } = await supabase
      .from('simulation_completions')
      .insert({
        user_id: userId,
        simulation_id: simulationId,
        total_score: results.totalScore,
        max_possible_score: results.maxPossibleScore,
        percentage_score: results.percentage,
        duration_minutes: results.duration,
        performance_level: results.performanceLevel,
        badge_earned: results.badge,
        choices: results.choices,
        completed_at: new Date().toISOString()
      })
      .select();

    if (completionError) throw completionError;

    // Award points to user profile
    const points = Math.round(results.percentage / 10); // 1-10 points based on performance
    await supabase.rpc('increment_user_points', {
      user_id: userId,
      points_to_add: points
    });

    // Clean up progress record
    await supabase
      .from('simulation_progress')
      .delete()
      .eq('user_id', userId)
      .eq('simulation_id', simulationId);

    return { success: true, data: completion[0] };
  } catch (error) {
    console.error('Error completing simulation:', error);
    return { success: false, error };
  }
};

export const getUserSimulationStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('simulation_completions')
      .select('simulation_id, percentage_score, performance_level, badge_earned, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.warn('Database stats failed, returning mock data:', error);
      // Return mock stats for demo
      return {
        success: true,
        data: {
          totalCompleted: 0,
          averageScore: 0,
          badges: [],
          recentCompletions: []
        }
      };
    }

    const stats = {
      totalCompleted: data.length,
      averageScore: data.length > 0 ? Math.round(data.reduce((sum, s) => sum + s.percentage_score, 0) / data.length) : 0,
      badges: [...new Set(data.map(s => s.badge_earned))],
      recentCompletions: data.slice(0, 5)
    };

    return { success: true, data: stats };
  } catch (error) {
    console.warn('Error fetching user simulation stats, returning mock data:', error);
    return {
      success: true,
      data: {
        totalCompleted: 0,
        averageScore: 0,
        badges: [],
        recentCompletions: []
      }
    };
  }
};

/**
 * Add a new simulation scenario (from AI generation)
 * 
 * @param {object} simulationData - The simulation data to add
 * @returns {string} The ID of the added simulation
 */
export const addSimulationScenario = async (simulationData) => {
  try {
    // Generate a unique ID for the simulation
    const simulationId = `ai_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Format the simulation data to match our engine structure
    const formattedSimulation = {
      id: simulationId,
      title: simulationData.title,
      description: simulationData.description,
      difficulty_level: simulationData.difficulty_level,
      category: simulationData.category,
      estimated_time: simulationData.estimated_time,
      learning_objectives: simulationData.learning_objectives,
      totalSteps: simulationData.steps.length,
      scenarios: simulationData.steps.map((step, index) => ({
        step: index + 1,
        title: step.title,
        description: step.description,
        image: getImageForCategory(simulationData.category),
        choices: step.choices.map(choice => ({
          id: choice.id,
          text: choice.text,
          points: choice.points,
          feedback: choice.feedback,
          consequences: choice.feedback // Use feedback as consequences for now
        }))
      })),
      scenario_context: simulationData.scenario,
      conclusion: simulationData.conclusion
    };

    // Add to in-memory simulation data
    simulationData[simulationId] = formattedSimulation;

    // Try to save to database if available
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('simulations')
          .insert([{
            id: simulationId,
            title: formattedSimulation.title,
            description: formattedSimulation.description,
            difficulty_level: formattedSimulation.difficulty_level,
            category: formattedSimulation.category,
            estimated_time: formattedSimulation.estimated_time,
            learning_objectives: formattedSimulation.learning_objectives,
            scenario_data: formattedSimulation,
            created_at: new Date().toISOString(),
            is_ai_generated: true
          }])
          .select()
          .single();

        if (error && error.code !== 'PGRST116') { // Ignore if table doesn't exist
          console.warn('Could not save simulation to database:', error);
        }
      } catch (dbError) {
        console.warn('Database operation failed:', dbError);
      }
    }

    return simulationId;
  } catch (error) {
    console.error('Error adding simulation scenario:', error);
    throw error;
  }
};

/**
 * Get image emoji for simulation category
 */
const getImageForCategory = (category) => {
  const categoryImages = {
    governance: "🏛️",
    citizenship: "🗳️",
    community: "🏘️",
    economic: "💼",
    education: "🎓",
    healthcare: "🏥",
    environment: "🌍",
    default: "📋"
  };
  
  return categoryImages[category] || categoryImages.default;
};
