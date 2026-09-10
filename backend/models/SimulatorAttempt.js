import mongoose from 'mongoose';

export const simulatorAttemptSchemaDefinition = {
  sessionId: { type: String, required: true, index: true },
  scenarioId: { type: String, required: true, index: true },
  stage: { type: Number, default: 1 },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], required: true },
  category: { type: String, required: true, index: true },
  selectedAction: { type: String, required: true },
  actionId: { type: String, required: true },
  correct: { type: Boolean, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  missedSignals: [{ type: String }],
  conceptsTested: [{ type: String }],
  conceptsMissed: [{ type: String }],
  feedback: {
    decision: { type: String },
    score: { type: Number },
    explanation: { type: String },
    lesson: { type: String },
    recommendedAction: { type: String },
    engine: { type: String }
  },
  isDemo: { type: Boolean, default: false, index: true },
  completedAt: { type: Date, default: Date.now, index: true }
};

const SimulatorAttemptSchema = new mongoose.Schema(simulatorAttemptSchemaDefinition, { timestamps: true });

export const SimulatorAttempt = mongoose.models.SimulatorAttempt || mongoose.model('SimulatorAttempt', SimulatorAttemptSchema);
export default SimulatorAttempt;
