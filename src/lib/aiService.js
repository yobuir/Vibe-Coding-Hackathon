/**
 * AI Service for Rwanda Civic Education Platform
 * 
 * This service provides AI-powered quiz and simulation generation using OpenAI.
 */

import OpenAI from 'openai';

// OpenAI Configuration
export const openAIConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini', // Cost-effective model for educational content
  maxTokens: 3000,
  temperature: 0.7
};

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: openAIConfig.apiKey,
}) : null;

/**
 * Generate quiz using OpenAI
 * 
 * @param {string} prompt - The AI prompt for quiz generation
 * @param {object} preferences - User preferences for the quiz
 * @returns {Promise<object>} Generated quiz data
 */
export const generateQuizWithOpenAI = async (prompt, preferences) => {
  if (!openai) {
    console.warn('OpenAI API key not configured, using fallback');
    return generateFallbackQuiz(preferences);
  }

  try {
    const systemPrompt = `You are an expert in Rwanda civic education and governance. Generate educational quiz questions in JSON format about Rwanda's civic and governance systems. Focus on accuracy, educational value, and cultural sensitivity.

Response format must be valid JSON with this structure:
{
  "quiz_title": "Title of the quiz",
  "difficulty_level": "beginner|intermediate|advanced",
  "estimated_time": "X-Y minutes",
  "questions": [
    {
      "question": "Question text",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correct_answer": "A",
      "explanation": "Detailed explanation of why this is correct",
      "topic": "governance|citizenship|history|culture",
      "difficulty": "beginner|intermediate|advanced"
    }
  ],
  "learning_objectives": ["Objective 1", "Objective 2"],
  "additional_resources": ["Resource 1", "Resource 2"]
}`;

    const userPrompt = `Generate a ${preferences.difficulty} level quiz about ${preferences.topic} in Rwanda with ${preferences.questionCount || 5} questions. 
    
    Context: ${prompt}
    
    Additional requirements:
    - Focus on practical civic knowledge
    - Include real Rwanda institutions and processes
    - Ensure cultural sensitivity and accuracy
    - Make questions engaging and educational
    - Include clear explanations for each answer`;

    const completion = await openai.chat.completions.create({
      model: openAIConfig.model,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: openAIConfig.maxTokens,
      temperature: openAIConfig.temperature,
    });

    const response = completion.choices[0].message.content;
    
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const quizData = JSON.parse(jsonMatch[0]);
    
    // Validate and sanitize the generated quiz
    if (!validateQuizStructure(quizData)) {
      throw new Error('Generated quiz does not match expected structure');
    }

    return sanitizeQuizContent(quizData);
  } catch (error) {
    console.error('OpenAI API error:', error);
    console.log('Falling back to sample quiz');
    return generateFallbackQuiz(preferences);
  }
};

/**
 * Generate simulation scenario using OpenAI
 * 
 * @param {string} prompt - The AI prompt for simulation generation
 * @param {object} preferences - User preferences for the simulation
 * @returns {Promise<object>} Generated simulation data
 */
export const generateSimulationWithOpenAI = async (prompt, preferences) => {
  if (!openai) {
    console.warn('OpenAI API key not configured, using fallback');
    return generateFallbackSimulation(preferences);
  }

  try {
    const systemPrompt = `You are an expert in Rwanda civic education and governance. Generate interactive simulation scenarios in JSON format about Rwanda's civic and governance systems. Focus on realistic scenarios that teach civic responsibility and decision-making.

Response format must be valid JSON with this structure:
{
  "title": "Simulation title",
  "description": "Brief description of the scenario",
  "difficulty_level": "beginner|intermediate|advanced",
  "category": "governance|citizenship|community|economic",
  "estimated_time": "X-Y minutes",
  "learning_objectives": ["Objective 1", "Objective 2"],
  "scenario": {
    "context": "Background story and setting",
    "role": "What role the user plays",
    "challenge": "The main challenge or problem to solve"
  },
  "steps": [
    {
      "id": "step_1",
      "title": "Step title",
      "description": "What happens in this step",
      "choices": [
        {
          "id": "choice_1",
          "text": "Choice description",
          "points": 10,
          "feedback": "Explanation of this choice's impact",
          "next_step": "step_2"
        }
      ]
    }
  ],
  "conclusion": {
    "success_message": "Message for good outcomes",
    "failure_message": "Message for poor outcomes",
    "key_learnings": ["Learning 1", "Learning 2"]
  }
}`;

    const userPrompt = `Generate a ${preferences.difficulty} level simulation about ${preferences.topic} in Rwanda. 
    
    Context: ${prompt}
    
    Additional requirements:
    - Create a realistic scenario with 3-5 decision points
    - Include meaningful consequences for choices
    - Focus on civic responsibility and ethical decision-making
    - Include real Rwanda institutions and processes
    - Make the scenario engaging and educational
    - Ensure cultural sensitivity and accuracy`;

    const completion = await openai.chat.completions.create({
      model: openAIConfig.model,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: openAIConfig.maxTokens,
      temperature: openAIConfig.temperature,
    });

    const response = completion.choices[0].message.content;
    
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const simulationData = JSON.parse(jsonMatch[0]);
    
    // Validate and sanitize the generated simulation
    if (!validateSimulationStructure(simulationData)) {
      throw new Error('Generated simulation does not match expected structure');
    }

    return sanitizeSimulationContent(simulationData);
  } catch (error) {
    console.error('OpenAI API error:', error);
    console.log('Falling back to sample simulation');
    return generateFallbackSimulation(preferences);
  }
};

/**
 * Generate fallback quiz when AI is unavailable
 */
export const generateFallbackQuiz = (preferences) => {
  const fallbackQuizzes = {
    governance: {
      quiz_title: "Rwanda Governance Basics",
      difficulty_level: preferences.difficulty || "beginner",
      estimated_time: "5-10 minutes",
      questions: [
        {
          question: "What is the highest law in Rwanda?",
          options: {
            A: "Parliamentary Act",
            B: "The Constitution",
            C: "Presidential Decree",
            D: "Ministerial Order"
          },
          correct_answer: "B",
          explanation: "The Constitution of Rwanda is the supreme law of the country, adopted in 2003 and amended in 2015.",
          topic: "governance",
          difficulty: "beginner"
        },
        {
          question: "How many chambers does the Rwanda Parliament have?",
          options: {
            A: "One chamber",
            B: "Two chambers",
            C: "Three chambers",
            D: "Four chambers"
          },
          correct_answer: "B",
          explanation: "Rwanda has a bicameral parliament with the Chamber of Deputies and the Senate.",
          topic: "governance",
          difficulty: "beginner"
        }
      ],
      learning_objectives: [
        "Understand Rwanda's constitutional framework",
        "Learn about parliamentary structure"
      ],
      additional_resources: [
        "Rwanda Constitution 2003 (amended 2015)",
        "Rwanda Governance Board resources"
      ]
    },
    citizenship: {
      quiz_title: "Rwanda Citizenship and Rights",
      difficulty_level: preferences.difficulty || "beginner",
      estimated_time: "5-10 minutes",
      questions: [
        {
          question: "What is required to become a Rwandan citizen by naturalization?",
          options: {
            A: "5 years of residence",
            B: "10 years of residence",
            C: "15 years of residence",
            D: "20 years of residence"
          },
          correct_answer: "A",
          explanation: "The Rwanda nationality law requires 5 years of legal residence for naturalization.",
          topic: "citizenship",
          difficulty: "intermediate"
        }
      ],
      learning_objectives: [
        "Understand citizenship requirements",
        "Learn about civic rights and responsibilities"
      ],
      additional_resources: [
        "Rwanda Nationality Law",
        "National Identity Card procedures"
      ]
    }
  };

  return fallbackQuizzes[preferences.topic] || fallbackQuizzes.governance;
};

/**
 * Generate fallback simulation when AI is unavailable
 */
export const generateFallbackSimulation = (preferences) => {
  const fallbackSimulations = {
    governance: {
      title: "Local Government Decision Making",
      description: "You are a local government official making decisions about community development.",
      difficulty_level: preferences.difficulty || "beginner",
      category: "governance",
      estimated_time: "10-15 minutes",
      learning_objectives: [
        "Understand local governance processes",
        "Learn about community engagement"
      ],
      scenario: {
        context: "Your district has received funding for infrastructure development.",
        role: "District Development Officer",
        challenge: "Decide how to allocate limited resources for maximum community benefit."
      },
      steps: [
        {
          id: "step_1",
          title: "Community Consultation",
          description: "The community has different priorities for development.",
          choices: [
            {
              id: "choice_1",
              text: "Hold public meetings to gather input",
              points: 15,
              feedback: "Excellent! Community participation is essential for good governance.",
              next_step: "step_2"
            },
            {
              id: "choice_2",
              text: "Make decisions based on technical assessments only",
              points: 5,
              feedback: "While technical input is important, community voices are crucial.",
              next_step: "step_2"
            }
          ]
        }
      ],
      conclusion: {
        success_message: "Great job! You've shown good governance principles.",
        failure_message: "Consider how better community engagement could improve outcomes.",
        key_learnings: [
          "Community participation improves decision quality",
          "Transparency builds trust in government"
        ]
      }
    }
  };

  return fallbackSimulations[preferences.topic] || fallbackSimulations.governance;
};

/**
 * Validate AI-generated quiz structure
 * 
 * @param {object} quizData - The AI-generated quiz data
 * @returns {boolean} Whether the quiz data is valid
 */
export const validateQuizStructure = (quizData) => {
  if (!quizData || typeof quizData !== 'object') {
    return false;
  }

  // Check required fields
  const requiredFields = ['quiz_title', 'questions'];
  for (const field of requiredFields) {
    if (!quizData[field]) {
      return false;
    }
  }

  // Validate questions structure
  if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
    return false;
  }

  // Validate each question
  for (const question of quizData.questions) {
    if (!question.question || !question.options || !question.correct_answer || !question.explanation) {
      return false;
    }

    // Validate options structure
    if (typeof question.options !== 'object' || Object.keys(question.options).length < 2) {
      return false;
    }

    // Validate correct answer exists in options
    if (!question.options[question.correct_answer]) {
      return false;
    }
  }

  return true;
};

/**
 * Validate simulation structure
 * 
 * @param {object} simulationData - The AI-generated simulation data
 * @returns {boolean} Whether the simulation data is valid
 */
export const validateSimulationStructure = (simulationData) => {
  if (!simulationData || typeof simulationData !== 'object') {
    return false;
  }

  // Check required fields
  const requiredFields = ['title', 'description', 'scenario', 'steps'];
  for (const field of requiredFields) {
    if (!simulationData[field]) {
      return false;
    }
  }

  // Validate scenario structure
  if (!simulationData.scenario.context || !simulationData.scenario.role) {
    return false;
  }

  // Validate steps structure
  if (!Array.isArray(simulationData.steps) || simulationData.steps.length === 0) {
    return false;
  }

  // Validate each step
  for (const step of simulationData.steps) {
    if (!step.id || !step.title || !step.description || !step.choices) {
      return false;
    }

    // Validate choices structure
    if (!Array.isArray(step.choices) || step.choices.length === 0) {
      return false;
    }

    // Validate each choice
    for (const choice of step.choices) {
      if (!choice.id || !choice.text || typeof choice.points !== 'number') {
        return false;
      }
    }
  }

  return true;
};

/**
 * Sanitize simulation content
 * 
 * @param {object} simulationData - The AI-generated simulation data
 * @returns {object} Sanitized simulation data
 */
export const sanitizeSimulationContent = (simulationData) => {
  // Basic content sanitization
  const sanitizeText = (text) => {
    if (typeof text !== 'string') return text;
    
    // Remove potentially harmful content
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  };

  // Sanitize basic fields
  simulationData.title = sanitizeText(simulationData.title);
  simulationData.description = sanitizeText(simulationData.description);
  
  // Sanitize scenario
  simulationData.scenario.context = sanitizeText(simulationData.scenario.context);
  simulationData.scenario.role = sanitizeText(simulationData.scenario.role);
  if (simulationData.scenario.challenge) {
    simulationData.scenario.challenge = sanitizeText(simulationData.scenario.challenge);
  }

  // Sanitize steps
  simulationData.steps = simulationData.steps.map(step => ({
    ...step,
    title: sanitizeText(step.title),
    description: sanitizeText(step.description),
    choices: step.choices.map(choice => ({
      ...choice,
      text: sanitizeText(choice.text),
      feedback: sanitizeText(choice.feedback)
    }))
  }));

  // Sanitize conclusion if present
  if (simulationData.conclusion) {
    simulationData.conclusion.success_message = sanitizeText(simulationData.conclusion.success_message);
    simulationData.conclusion.failure_message = sanitizeText(simulationData.conclusion.failure_message);
  }

  return simulationData;
};

/**
 * Sanitize AI-generated quiz content to ensure it's safe and appropriate
 * 
 * @param {object} quizData - The AI-generated quiz data
 * @returns {object} Sanitized quiz data
 */
export const sanitizeQuizContent = (quizData) => {
  // Basic content sanitization
  const sanitizeText = (text) => {
    if (typeof text !== 'string') return text;
    
    // Remove potentially harmful content
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  };

  // Sanitize quiz title and description
  quizData.quiz_title = sanitizeText(quizData.quiz_title);
  if (quizData.description) {
    quizData.description = sanitizeText(quizData.description);
  }

  // Sanitize questions
  quizData.questions = quizData.questions.map(question => ({
    ...question,
    question: sanitizeText(question.question),
    explanation: sanitizeText(question.explanation),
    options: Object.fromEntries(
      Object.entries(question.options).map(([key, value]) => [key, sanitizeText(value)])
    )
  }));

  return quizData;
};
