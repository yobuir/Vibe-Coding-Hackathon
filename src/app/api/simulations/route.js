import { NextResponse } from 'next/server';
import { simulationData, SimulationEngine, saveSimulationProgress, loadSimulationProgress, completeSimulation, getUserSimulationStats } from '@/lib/simulationEngine';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const simulationId = searchParams.get('simulationId');

    switch (action) {
      case 'list':
        // Return list of available simulations
        const simulations = Object.values(simulationData).map(sim => ({
          id: sim.id,
          title: sim.title,
          totalSteps: sim.totalSteps,
          description: sim.scenarios[0]?.description || ''
        }));
        return NextResponse.json({ success: true, data: simulations });

      case 'progress':
        if (!userId || !simulationId) {
          return NextResponse.json({ success: false, error: 'Missing userId or simulationId' }, { status: 400 });
        }
        const progressResult = await loadSimulationProgress(userId, simulationId);
        return NextResponse.json(progressResult);

      case 'stats':
        if (!userId) {
          return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
        }
        const statsResult = await getUserSimulationStats(userId);
        return NextResponse.json(statsResult);

      case 'scenario':
        if (!simulationId) {
          return NextResponse.json({ success: false, error: 'Missing simulationId' }, { status: 400 });
        }
        const step = parseInt(searchParams.get('step') || '1');
        const simulation = simulationData[simulationId];
        if (!simulation) {
          return NextResponse.json({ success: false, error: 'Simulation not found' }, { status: 404 });
        }
        const scenario = simulation.scenarios.find(s => s.step === step);
        if (!scenario) {
          return NextResponse.json({ success: false, error: 'Scenario not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: scenario });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in simulations API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, userId, simulationId, choiceId, step } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    switch (action) {
      case 'start':
        if (!simulationId) {
          return NextResponse.json({ success: false, error: 'Missing simulationId' }, { status: 400 });
        }
        
        // Create new simulation engine instance
        const engine = new SimulationEngine(simulationId, userId);
        const firstScenario = engine.getCurrentScenario();
        
        if (!firstScenario) {
          return NextResponse.json({ success: false, error: 'Simulation not found' }, { status: 404 });
        }

        // Save initial progress
        const progress = engine.getProgress();
        await saveSimulationProgress(userId, simulationId, progress);

        return NextResponse.json({
          success: true,
          data: {
            scenario: firstScenario,
            progress: progress,
            simulation: {
              id: simulationId,
              title: engine.simulation.title,
              totalSteps: engine.simulation.totalSteps
            }
          }
        });

      case 'makeChoice':
        if (!simulationId || !choiceId || !step) {
          return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
        }

        // Load existing progress
        const progressResult = await loadSimulationProgress(userId, simulationId);
        if (!progressResult.success) {
          return NextResponse.json({ success: false, error: 'Could not load progress' }, { status: 500 });
        }

        // Recreate engine with existing progress
        const existingEngine = new SimulationEngine(simulationId, userId);
        if (progressResult.data) {
          existingEngine.currentStep = progressResult.data.current_step;
          existingEngine.totalScore = progressResult.data.total_score;
          existingEngine.choices = progressResult.data.choices || [];
        }

        // Make the choice
        const result = existingEngine.makeChoice(choiceId);
        if (!result) {
          return NextResponse.json({ success: false, error: 'Invalid choice' }, { status: 400 });
        }

        // Save updated progress
        const updatedProgress = existingEngine.getProgress();
        updatedProgress.choices = existingEngine.choices;
        await saveSimulationProgress(userId, simulationId, updatedProgress);

        // If simulation is complete, save completion record
        if (result.isComplete) {
          const finalResults = existingEngine.getResults();
          await completeSimulation(userId, simulationId, finalResults);
          
          return NextResponse.json({
            success: true,
            data: {
              choice: result.choice,
              isComplete: true,
              results: finalResults
            }
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            choice: result.choice,
            nextScenario: result.nextScenario,
            progress: updatedProgress,
            isComplete: false
          }
        });

      case 'resume':
        if (!simulationId) {
          return NextResponse.json({ success: false, error: 'Missing simulationId' }, { status: 400 });
        }

        // Load existing progress
        const resumeResult = await loadSimulationProgress(userId, simulationId);
        if (!resumeResult.success || !resumeResult.data) {
          return NextResponse.json({ success: false, error: 'No progress found' }, { status: 404 });
        }

        // Recreate engine state
        const resumeEngine = new SimulationEngine(simulationId, userId);
        resumeEngine.currentStep = resumeResult.data.current_step;
        resumeEngine.totalScore = resumeResult.data.total_score;
        resumeEngine.choices = resumeResult.data.choices || [];

        const currentScenario = resumeEngine.getCurrentScenario();
        const currentProgress = resumeEngine.getProgress();

        return NextResponse.json({
          success: true,
          data: {
            scenario: currentScenario,
            progress: currentProgress,
            simulation: {
              id: simulationId,
              title: resumeEngine.simulation.title,
              totalSteps: resumeEngine.simulation.totalSteps
            },
            previousChoices: resumeEngine.choices
          }
        });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in simulations POST API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
