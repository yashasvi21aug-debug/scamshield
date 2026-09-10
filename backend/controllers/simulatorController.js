import { SIMULATOR_SCENARIOS, getPublicScenarios, getPublicScenarioById } from '../data/simulatorScenarios.js';
import { storageService } from '../services/storageService.js';
import { aiService } from '../services/aiService.js';

export function getScenarios(req, res) {
  try {
    const difficulty = req.query.difficulty || 'All';
    const scenarios = getPublicScenarios(difficulty);
    return res.json({
      success: true,
      count: scenarios.length,
      data: scenarios
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to retrieve simulation scenarios", details: err.message });
  }
}

export function getScenario(req, res) {
  try {
    const { id } = req.params;
    const stage = req.query.stage || 1;
    const scenario = getPublicScenarioById(id, stage);
    if (!scenario) {
      return res.status(404).json({ error: "Simulation scenario not found" });
    }
    return res.json({
      success: true,
      data: scenario
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load simulation scenario", details: err.message });
  }
}

export async function evaluateDecision(req, res) {
  try {
    const { scenarioId, actionId, isDemo = false } = req.body;
    const stageNum = req.body.stageNumber || req.body.stage || 1;
    const sessionId = req.headers['x-session-id'] || 'anonymous-session';

    if (!scenarioId || !actionId) {
      return res.status(400).json({ error: "scenarioId and actionId are required" });
    }

    const scenario = SIMULATOR_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: "Simulation scenario not found" });
    }

    const stage = scenario.stages.find(st => st.stageNumber === Number(stageNum)) || scenario.stages[0];
    const selectedOption = stage.options.find(opt => opt.id === String(actionId).toUpperCase());
    if (!selectedOption) {
      return res.status(400).json({ error: `Invalid option '${actionId}'. Must be one of: ${stage.options.map(o => o.id).join(', ')}` });
    }

    // 1. Authoritative Server-Side Deterministic Scoring
    const isSafe = selectedOption.isSafe;
    const deterministicScore = selectedOption.score;
    const missedSignals = selectedOption.missedSignals || [];
    const conceptsTested = stage.conceptsTested || [];
    const conceptsMissed = selectedOption.missedConcepts || [];

    // 2. Personalized AI Coaching (Gemini with offline fallback)
    const feedback = await aiService.generateSimulatorFeedback({
      scenarioTitle: scenario.title,
      category: scenario.category,
      simulatedMessage: stage.simulatedMessage,
      chosenActionText: selectedOption.text,
      isSafe,
      score: deterministicScore,
      redFlags: stage.redFlags,
      missedSignals,
      safeAction: stage.safeAction,
      lesson: stage.lesson
    });

    // 3. Persist Attempt into MongoDB Atlas (or degraded disk fallback)
    const attemptRecord = await storageService.saveSimulatorAttempt({
      sessionId,
      scenarioId: scenario.id,
      stage: stage.stageNumber,
      difficulty: scenario.difficulty,
      category: scenario.category,
      selectedAction: selectedOption.text,
      actionId: selectedOption.id,
      correct: isSafe,
      score: deterministicScore,
      missedSignals,
      conceptsTested,
      conceptsMissed,
      feedback,
      isDemo: Boolean(isDemo)
    });

    // 4. Multi-Step Progression State
    const hasNextStage = scenario.isMultiStep && (stage.stageNumber < scenario.stages.length);
    const isComplete = !hasNextStage;

    // 5. Query updated adaptive telemetry for personalized insight & recommendation
    const currentProgress = await storageService.getSimulatorProgress(sessionId, Boolean(isDemo));

    return res.json({
      success: true,
      data: {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        category: scenario.category,
        difficulty: scenario.difficulty,
        currentStage: stage.stageNumber,
        totalStages: scenario.stages.length,
        selectedOption: {
          id: selectedOption.id,
          text: selectedOption.text
        },
        decision: feedback.decision,
        isSafe,
        score: deterministicScore,
        explanation: feedback.explanation,
        missedSignals: feedback.missedSignals,
        conceptsTested,
        conceptsMissed,
        redFlags: stage.redFlags,
        safeAction: stage.safeAction,
        recommendedAction: feedback.recommendedAction,
        lesson: feedback.lesson,
        engineAttribution: feedback.engine,
        feedback,
        hasNextStage,
        nextStageNumber: hasNextStage ? stage.stageNumber + 1 : null,
        isComplete,
        scamChainSummary: isComplete && scenario.scamChainSummary ? scenario.scamChainSummary : null,
        adaptiveTraining: currentProgress.adaptiveTraining,
        trainingInsight: currentProgress.adaptiveTraining?.trainingInsight,
        attemptId: attemptRecord?._id || attemptRecord?.id || attemptRecord?.sessionId
      }
    });
  } catch (err) {
    console.error("[Simulator Decision Evaluation Error]:", err);
    return res.status(500).json({ error: "Failed to evaluate simulator decision", details: err.message });
  }
}

export async function getProgress(req, res) {
  try {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId || null;
    const includeDemo = req.query.includeDemo === 'true';

    const progress = await storageService.getSimulatorProgress(sessionId, includeDemo);

    return res.json({
      success: true,
      data: progress
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch training progress", details: err.message });
  }
}
