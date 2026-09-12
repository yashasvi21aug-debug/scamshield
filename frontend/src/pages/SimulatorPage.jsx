import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  ChevronRight, 
  Award, 
  TrendingUp, 
  Target, 
  Brain, 
  ExternalLink, 
  Zap, 
  Lock, 
  RefreshCw, 
  Play, 
  Info,
  Layers,
  Check,
  Flame,
  HelpCircle,
  X
} from 'lucide-react';
import { 
  getSimulatorScenarios, 
  getSimulatorScenario, 
  evaluateSimulatorDecision, 
  getSimulatorProgress 
} from '../services/api';

export default function SimulatorPage({ onNavigate }) {
  const [scenarios, setScenarios] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  // Active Simulation State
  const [activeScenario, setActiveScenario] = useState(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [chainHistory, setChainHistory] = useState([]); // For multi-step scenarios

  // Load scenarios and user progress
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [scenariosData, progressData] = await Promise.all([
        getSimulatorScenarios(selectedDifficulty),
        getSimulatorProgress(isDemo)
      ]);
      setScenarios(scenariosData || []);
      setProgress(progressData || null);
    } catch (err) {
      console.error('Error loading simulator data:', err);
      setError('Unable to load simulation scenarios from backend. Please ensure the server is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDifficulty, isDemo]);

  // Start a scenario
  const handleStartScenario = async (scenarioSummary) => {
    try {
      setEvaluating(true);
      const fullScenario = await getSimulatorScenario(scenarioSummary.id);
      setActiveScenario(fullScenario);
      setCurrentStage(1);
      setSelectedActionId(null);
      setEvaluationResult(null);
      setChainHistory([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error fetching scenario details:', err);
      alert('Could not start simulation: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  // Submit decision
  const handleSubmitDecision = async () => {
    if (!selectedActionId || !activeScenario) return;

    try {
      setEvaluating(true);
      const response = await evaluateSimulatorDecision({
        scenarioId: activeScenario.id,
        actionId: selectedActionId,
        stage: currentStage,
        isDemo,
        useAi: true
      });

      if (response && response.success) {
        setEvaluationResult(response.data);
        setChainHistory(prev => [
          ...prev, 
          {
            stage: currentStage,
            actionId: selectedActionId,
            result: response.data
          }
        ]);
        // Refresh progress in background
        getSimulatorProgress(isDemo).then(p => setProgress(p)).catch(() => {});
      }
    } catch (err) {
      console.error('Error submitting decision:', err);
      alert('Failed to evaluate decision: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  // Advance to next stage (for multi-step)
  const handleNextStage = async () => {
    if (!activeScenario) return;
    const nextStageNum = currentStage + 1;
    try {
      setEvaluating(true);
      const nextScenarioData = await getSimulatorScenario(`${activeScenario.id}?stage=${nextStageNum}`);
      setActiveScenario(nextScenarioData);
      setCurrentStage(nextStageNum);
      setSelectedActionId(null);
      setEvaluationResult(null);
    } catch (err) {
      console.error('Failed to load next stage:', err);
      alert('Could not advance stage: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  // Close active scenario
  const handleCloseScenario = () => {
    setActiveScenario(null);
    setSelectedActionId(null);
    setEvaluationResult(null);
    setCurrentStage(1);
    setChainHistory([]);
    loadData();
  };

  const hasNextStage = evaluationResult?.hasNextStage;

  // Find recommended scenario from adaptive training engine, weakest category, or unattempted
  const adaptiveRec = progress?.adaptiveTraining;
  const recommendedScenario = (adaptiveRec?.recommendedScenarioId && scenarios.find(s => s.id === adaptiveRec.recommendedScenarioId))
    || scenarios.find(s => {
      if (progress?.weakestCategory && progress.weakestCategory !== 'None') {
        return s.category.toLowerCase().includes(progress.weakestCategory.toLowerCase());
      }
      const attempt = progress?.attempts?.find(a => a.scenarioId === s.id);
      return !attempt;
    }) || scenarios[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* SIMULATION ACTIVE VIEW */}
      {activeScenario ? (
        <div className="space-y-6">
          {/* Prominent Non-Real-Scam Security Stripe */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-center justify-between flex-wrap gap-4 shadow-sm animate-pulse-glow">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <div className="font-black tracking-wider uppercase text-sm sm:text-base flex items-center gap-2 text-amber-950">
                  <span>SIMULATION — NOT A REAL SCAM</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 border border-amber-300 font-mono text-amber-800">
                    SAFE SANDBOX
                  </span>
                </div>
                <p className="text-xs text-amber-800/90">
                  This simulated attack is designed for cybersecurity defense training. No actual data or funds are at risk.
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseScenario}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Exit Simulation</span>
            </button>
          </div>

          {/* Scenario Header Card */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2E2D9]">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/30">
                  {activeScenario.category}
                </span>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border ${
                  activeScenario.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  activeScenario.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {activeScenario.difficulty} Difficulty
                </span>
                {activeScenario.isMultiStep && (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#464B71]/10 text-[#464B71] border border-[#464B71]/30">
                    Multi-Stage Chain ({activeScenario.currentStage || currentStage}/{activeScenario.totalStages || 2})
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Scenario ID: <span className="text-[#464B71] font-semibold">{activeScenario.id}</span>
              </div>
            </div>

            <div className="mt-4">
              <h1 className="text-2xl sm:text-3xl font-black text-[#464B71]">
                {activeScenario.title}
              </h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {activeScenario.subtitle}
              </p>
            </div>
          </div>

          {/* Main Simulation Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Realistic Simulated Notification / Attack Mockup */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-3xl bg-cyber-900/95 border border-cyber-700/80 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400 pb-2 border-b border-cyber-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="font-bold text-slate-200 font-mono uppercase">
                      Incoming Notification ({activeScenario.senderMockup?.channel || 'SMS'})
                    </span>
                  </div>
                  <span className="font-mono text-cyan-400 text-[11px]">
                    STAGE {activeScenario.currentStage || currentStage} OF {activeScenario.totalStages || 1}
                  </span>
                </div>

                {/* Simulated Device Screen Mockup */}
                <div className="p-4 rounded-2xl bg-cyber-950 border border-cyber-800 space-y-3 font-sans shadow-inner">
                  {/* Sender Pill */}
                  <div className="flex items-center justify-between bg-cyber-900/90 p-2.5 rounded-xl border border-cyber-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-xs">
                        {(activeScenario.senderMockup?.senderName || 'ALERT').substring(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono">
                          {activeScenario.senderMockup?.senderName || 'UNKNOWN'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {activeScenario.senderMockup?.timestamp || 'Just Now'} • {activeScenario.senderMockup?.channel || 'Simulated Dispatch'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Simulated</span>
                  </div>

                  {/* Message Bubble */}
                  <div className="p-4 rounded-xl bg-cyber-900 border border-cyber-700/60 text-slate-200 text-sm whitespace-pre-wrap leading-relaxed font-sans select-none">
                    {activeScenario.simulatedMessage}
                  </div>

                  {/* Context Note */}
                  {activeScenario.context && (
                    <div className="p-3 rounded-xl bg-cyber-950/80 border border-cyber-800/80 text-xs text-slate-400 flex items-start gap-2">
                      <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-300">Context: </strong>
                        {activeScenario.context}
                      </span>
                    </div>
                  )}
                </div>

                {/* Training Disclaimer Tag */}
                <div className="mt-4 p-3 rounded-xl bg-cyber-950/60 border border-cyber-800 text-xs text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cybersecurity Defense Exercise</span>
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">
                    Safe Educational Simulation
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Decision Choices or Immediate Evaluation Results */}
            <div className="lg:col-span-6 space-y-4">
              {!evaluationResult ? (
                /* Decision Choice Panel */
                <div className="p-6 rounded-3xl bg-cyber-900/95 border border-cyber-700/80 shadow-xl space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider font-mono">
                      <Zap className="w-4 h-4" />
                      <span>Immediate Decision Required</span>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-1">
                      {activeScenario.question || "How would you handle this situation?"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Select the single action that safest protects your identity, credentials, and financial accounts.
                    </p>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5">
                    {activeScenario.options?.map((option) => {
                      const isSelected = selectedActionId === option.id;
                      return (
                        <div
                          key={option.id}
                          onClick={() => setSelectedActionId(option.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/10 text-white'
                              : 'bg-cyber-950/70 border-cyber-800 hover:border-cyber-700 text-slate-300 hover:bg-cyber-950'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected 
                              ? 'bg-cyan-400 text-cyber-950' 
                              : 'bg-cyber-900 text-slate-400 border border-cyber-700'
                          }`}>
                            {option.id.toUpperCase()}
                          </div>
                          <div className="text-xs sm:text-sm leading-snug flex-1">
                            {option.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitDecision}
                    disabled={!selectedActionId || evaluating}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-cyber-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                  >
                    {evaluating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-cyber-950" />
                        <span>AI Assessing Decision Tactics...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-cyber-950" />
                        <span>Confirm & Submit Decision</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Immediate AI Decision Feedback Panel */
                <div className="p-6 rounded-3xl bg-cyber-900/95 border border-cyber-700/80 shadow-2xl space-y-6">
                  {/* Result Status Banner */}
                  <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                    evaluationResult.isSafe 
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                      : evaluationResult.score >= 40 
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' 
                      : 'bg-red-500/15 border-red-500/40 text-red-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      {evaluationResult.isSafe ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                      ) : evaluationResult.score >= 40 ? (
                        <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs uppercase font-mono font-bold tracking-wider">
                          {evaluationResult.decision}
                        </div>
                        <div className="text-lg font-black tracking-tight">
                          {evaluationResult.isSafe 
                            ? 'Excellent Safe Defense!' 
                            : evaluationResult.score >= 40 
                            ? 'Cautious, But Vulnerabilities Remain' 
                            : 'High Risk Action — Compromise Likely'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black font-mono">
                        +{evaluationResult.score}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider font-mono opacity-80">
                        Points Earned
                      </div>
                    </div>
                  </div>

                  {/* AI Explanation */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider font-mono">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini AI Tactical Evaluation</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-cyber-950 border border-cyber-800 text-slate-200 text-xs sm:text-sm leading-relaxed">
                      {evaluationResult.feedback?.explanation || evaluationResult.reason}
                    </div>
                  </div>

                  {/* Red Flags & Missed Signals */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-cyber-950 border border-cyber-800 space-y-1.5">
                      <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Signals Missed / Risky</span>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                        {(evaluationResult.feedback?.missedSignals || evaluationResult.missedSignals || []).map((signal, idx) => (
                          <li key={idx} className="leading-snug">{signal}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-cyber-950 border border-cyber-800 space-y-1.5">
                      <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Safer Action Recommended</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">
                        {evaluationResult.feedback?.recommendedAction || "Always verify independently through official apps or dialed support numbers."}
                      </p>
                    </div>
                  </div>

                  {/* Educational Takeaway Lesson */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/30 border border-cyan-500/30">
                    <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <GraduationCap className="w-4 h-4 text-cyan-400" />
                      <span>Core Cybersecurity Rule</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium">
                      "{evaluationResult.feedback?.lesson || activeScenario.lesson}"
                    </p>
                  </div>

                  {/* Adaptive Training Insight & Recommended Next Challenge */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-cyber-950 to-purple-950/20 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider font-mono">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span>Your Training Insight</span>
                      </div>
                      {evaluationResult.adaptiveTraining?.focusLabel && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                          Focus: {evaluationResult.adaptiveTraining.focusLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                      {evaluationResult.trainingInsight || evaluationResult.adaptiveTraining?.trainingInsight || "Your decision patterns are dynamically evaluated to calibrate your defense training."}
                    </p>
                    {evaluationResult.adaptiveTraining?.recommendedScenarioTitle && (
                      <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between gap-3 flex-wrap">
                        <div className="text-xs text-slate-300">
                          <span className="text-slate-400">Recommended Next Training: </span>
                          <strong className="text-white">{evaluationResult.adaptiveTraining.recommendedScenarioTitle}</strong>
                          <span className="text-purple-300 font-mono text-[11px] ml-2">
                            ({evaluationResult.adaptiveTraining.recommendedDifficulty})
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const nextScen = scenarios.find(s => s.id === evaluationResult.adaptiveTraining.recommendedScenarioId);
                            if (nextScen) handleStartScenario(nextScen);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1 shrink-0 shadow-md shadow-purple-500/20"
                        >
                          <span>Launch Challenge</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Multi-Step Chain Progression or Final Summary */}
                  {hasNextStage ? (
                    <div className="pt-2">
                      <button
                        onClick={handleNextStage}
                        className="w-full py-3.5 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-cyber-950 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                      >
                        <span>Advance to Stage {currentStage + 1} (The Escalation)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : activeScenario.multiStage && currentStage > 1 ? (
                    /* Final Multi-Step Chain Post-Mortem */
                    <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                      <div className="flex items-center gap-2 text-purple-300 font-black uppercase text-xs tracking-wider">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span>SCAM CHAIN DETECTED — POST-MORTEM</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        This attack exploited a two-step psychological sequence: 
                        <strong className="text-white"> Stage 1 </strong> established false credibility or confusion, while 
                        <strong className="text-white"> Stage 2 </strong> leveraged urgent payment authorization or credential harvesting before you had time to verify.
                      </p>
                    </div>
                  ) : null}

                  {/* Action Footer */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedActionId(null);
                        setEvaluationResult(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-cyber-950 border border-cyber-700 text-slate-300 hover:text-white hover:border-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Try This Stage Again</span>
                    </button>
                    <button
                      onClick={handleCloseScenario}
                      className="px-5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-bold transition-colors"
                    >
                      Back to Simulator Hub
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* SIMULATOR HUB VIEW */
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-md overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/30 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#118AB2]" />
                    Interactive Cybersecurity Training
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                    SAFE SANDBOX
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-[#464B71] tracking-tight">
                  Scam Simulator
                </h1>
                <p className="text-base sm:text-lg font-bold text-[#118AB2]">
                  Train Before You Get Scammed
                </p>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Experience realistic social engineering, fake KYC alerts, refund deception, and impersonation attacks. Practice your defensive responses with instant Gemini AI post-mortems and deterministic cybersecurity scoring.
                </p>
              </div>

              {/* Awareness Score Card */}
              <div className="p-5 rounded-2xl bg-[#F9F9F6] border border-[#E2E2D9] min-w-[240px] flex flex-col items-center text-center shadow-inner">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Scam Awareness Score
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className={`text-4xl font-black font-mono ${
                    (progress?.awarenessScore || 0) >= 80 ? 'text-[#0F766E]' :
                    (progress?.awarenessScore || 0) >= 50 ? 'text-[#118AB2]' :
                    'text-amber-700'
                  }`}>
                    {progress?.awarenessScore !== undefined ? progress.awarenessScore : 100}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/100</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {progress?.scenariosCompleted || 0} of {scenarios.length || 8} Scenarios Completed
                </div>
                {/* Ratio Bar */}
                <div className="w-full bg-[#E2E2D9] rounded-full h-2 mt-3 overflow-hidden">
                  <div 
                    className="bg-[#118AB2] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${progress?.awarenessScore || 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar & Personalized Training Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Safe Decision Ratio */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#7CD5C7]/20 text-[#0F766E] border border-[#7CD5C7]/50">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Safe Decision Rate</div>
                <div className="text-xl font-black text-[#464B71] font-mono mt-0.5">
                  {progress?.safeRatio !== undefined ? `${progress.safeRatio}%` : '100%'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {progress?.safeDecisions || 0} Safe / {progress?.riskyDecisions || 0} Risky
                </div>
              </div>
            </div>

            {/* Adaptive Training Focus Area */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#464B71]/10 text-[#464B71] border border-[#464B71]/20">
                <Target className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
                  <span>Current Training Focus</span>
                  {progress?.adaptiveTraining?.progress !== undefined && (
                    <span className="text-[10px] font-mono text-[#118AB2] font-bold">
                      {progress.adaptiveTraining.progress}% Mastery
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 truncate">
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold font-mono truncate">
                    {progress?.adaptiveTraining?.focusLabel || progress?.weakestCategory || 'Urgency Recognition'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 truncate">
                  Target: {progress?.adaptiveTraining?.recommendedDifficulty || 'Adaptive'} Progression
                </div>
              </div>
            </div>

            {/* Recommended Challenge */}
            {recommendedScenario && (
              <div className="p-5 rounded-2xl bg-[#7CD5C7]/15 border border-[#7CD5C7]/40 flex items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1 min-w-0">
                  <div className="text-[11px] font-bold text-[#118AB2] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Adaptive Recommendation</span>
                  </div>
                  <div className="text-sm font-bold text-[#464B71] truncate max-w-[200px]" title={recommendedScenario.title}>
                    {recommendedScenario.title}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-white text-[#118AB2] border border-[#E2E2D9] text-[10px] font-mono">
                      {progress?.adaptiveTraining?.recommendedDifficulty || recommendedScenario.difficulty}
                    </span>
                    <span>•</span>
                    <span className="truncate">{recommendedScenario.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleStartScenario(recommendedScenario)}
                  className="px-3.5 py-2 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white font-bold text-xs uppercase tracking-wider transition-all shrink-0 flex items-center gap-1 shadow-sm hover:scale-[1.02]"
                >
                  <span>Launch</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Difficulty Filter Tabs & Demo Mode Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-[#E2E2D9]">
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'beginner', 'intermediate', 'expert'].map((lvl) => {
                const isActive = selectedDifficulty === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => setSelectedDifficulty(lvl)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      isActive
                        ? 'bg-[#118AB2] text-white border-[#118AB2] shadow-sm'
                        : 'bg-white text-slate-600 border-[#E2E2D9] hover:text-[#464B71]'
                    }`}
                  >
                    {lvl === 'all' ? 'All Scenarios' : lvl}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDemo}
                  onChange={(e) => setIsDemo(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-white border-[#E2E2D9] text-[#118AB2] focus:ring-0"
                />
                <span>Demo Sandbox Mode</span>
              </label>
              <button
                onClick={loadData}
                className="p-2 rounded-xl bg-white border border-[#E2E2D9] text-slate-600 hover:text-[#464B71] transition-colors"
                title="Refresh Scenarios"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Scenario Cards Grid */}
          {loading && scenarios.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-2 border-[#118AB2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs uppercase tracking-widest text-slate-500 font-mono">
                Loading Cybersecurity Training Scenarios...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-center text-xs">
              {error}
            </div>
          ) : scenarios.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-[#E2E2D9] text-center text-slate-500 text-xs">
              No scenarios found matching the selected filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario) => {
                const userAttempt = progress?.attempts?.find(a => a.scenarioId === scenario.id);
                const isCompleted = !!userAttempt;

                return (
                  <div
                    key={scenario.id}
                    className="p-6 rounded-3xl bg-white border border-[#E2E2D9] hover:border-[#118AB2]/50 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden shadow-sm hover:shadow-md"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/20 font-mono">
                          {scenario.category}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {progress?.adaptiveTraining?.focusConcept && scenario.concepts?.includes(progress.adaptiveTraining.focusConcept) && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                              Target Focus
                            </span>
                          )}
                          {scenario.multiStage && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#464B71]/10 text-[#464B71] border border-[#464B71]/20">
                              Multi-Stage
                            </span>
                          )}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            scenario.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            scenario.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {scenario.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-bold text-[#464B71] group-hover:text-[#118AB2] transition-colors">
                        {scenario.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {scenario.description}
                      </p>

                      {/* Concept Tags */}
                      {scenario.concepts && scenario.concepts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {scenario.concepts.slice(0, 3).map((conceptKey) => (
                            <span
                              key={conceptKey}
                              className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#F9F9F6] text-slate-600 border border-[#E2E2D9]"
                            >
                              #{conceptKey.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Safe Simulation Indicator */}
                      <div className="mt-4 pt-3 border-t border-[#E2E2D9] flex items-center justify-between text-[11px] text-slate-500">
                        <span className="text-amber-700 font-mono font-bold">
                          SIMULATION SCENARIO
                        </span>
                        <span>{scenario.stagesCount > 1 ? `${scenario.stagesCount} Stages` : 'Single Stage'}</span>
                      </div>
                    </div>

                    {/* Footer / CTA */}
                    <div className="mt-6 pt-4 border-t border-[#E2E2D9] flex items-center justify-between gap-3">
                      {isCompleted ? (
                        <div className="flex items-center gap-1.5 text-xs text-[#0F766E] font-mono font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Attempted: {userAttempt.score}/100</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">Unattempted</span>
                      )}

                      <button
                        onClick={() => handleStartScenario(scenario)}
                        className="px-4 py-2 rounded-xl bg-[#118AB2]/10 hover:bg-[#118AB2] text-[#118AB2] hover:text-white font-bold text-xs uppercase tracking-wider border border-[#118AB2]/30 hover:border-[#118AB2] transition-all flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isCompleted ? 'Replay' : 'Start'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
