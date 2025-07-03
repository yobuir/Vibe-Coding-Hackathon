import { NextResponse } from 'next/server';
import { generateSimulationWithOpenAI } from '@/lib/aiService';
import { addSimulationScenario } from '@/lib/simulationEngine';

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, preferences } = body;

    // Validate required fields
    if (!prompt || !preferences) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and preferences' },
        { status: 400 }
      );
    }

    // Validate preferences
    const { topic, difficulty } = preferences;
    if (!topic || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required preference fields: topic and difficulty' },
        { status: 400 }
      );
    }

    // Generate simulation using AI
    const simulationData = await generateSimulationWithOpenAI(prompt, {
      topic,
      difficulty
    });

    // Add the generated simulation to the simulation engine
    try {
      const simulationId = await addSimulationScenario(simulationData);
      
      return NextResponse.json({
        success: true,
        simulation: {
          id: simulationId,
          ...simulationData
        },
        message: 'Simulation generated and saved successfully'
      });
    } catch (saveError) {
      console.error('Error saving simulation:', saveError);
      
      // Return the generated simulation even if save fails
      return NextResponse.json({
        success: true,
        simulation: simulationData,
        message: 'Simulation generated successfully (save failed)',
        warning: 'Simulation could not be saved to database'
      });
    }

  } catch (error) {
    console.error('Error in generate-simulation API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate simulation', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
