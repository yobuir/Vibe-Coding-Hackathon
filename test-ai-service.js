// Test file to verify AI service integration
// Run this with: node test-ai-service.js

const { generateQuizWithOpenAI, generateSimulationWithOpenAI } = require('./src/lib/aiService');

async function testAIService() {
  console.log('Testing AI Service Integration...\n');

  // Test quiz generation
  console.log('1. Testing Quiz Generation:');
  try {
    const quiz = await generateQuizWithOpenAI(
      'Generate a quiz about Rwanda\'s constitution and governance',
      {
        topic: 'governance',
        difficulty: 'beginner',
        questionCount: 3
      }
    );
    
    console.log('✓ Quiz generated successfully');
    console.log('Title:', quiz.quiz_title);
    console.log('Questions:', quiz.questions?.length || 0);
    console.log('Difficulty:', quiz.difficulty_level);
    console.log('');
  } catch (error) {
    console.log('✗ Quiz generation failed:', error.message);
    console.log('');
  }

  // Test simulation generation
  console.log('2. Testing Simulation Generation:');
  try {
    const simulation = await generateSimulationWithOpenAI(
      'Create a simulation about local government budget planning',
      {
        topic: 'governance',
        difficulty: 'intermediate'
      }
    );
    
    console.log('✓ Simulation generated successfully');
    console.log('Title:', simulation.title);
    console.log('Difficulty:', simulation.difficulty_level);
    console.log('Steps:', simulation.steps?.length || 0);
    console.log('');
  } catch (error) {
    console.log('✗ Simulation generation failed:', error.message);
    console.log('');
  }
}

// Run the test
testAIService().catch(console.error);
