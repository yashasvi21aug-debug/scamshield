import mongoose from 'mongoose';

export const analysisEventSchemaDefinition = {
  eventId: { type: String, required: true, unique: true, index: true },
  scanId: { type: String, index: true },
  type: { type: String },
  engineMode: { type: String },
  executionTimeMs: { type: Number },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
};

const AnalysisEventSchema = new mongoose.Schema(analysisEventSchemaDefinition, { timestamps: true });

export const AnalysisEvent = mongoose.models.AnalysisEvent || mongoose.model('AnalysisEvent', AnalysisEventSchema);
export default AnalysisEvent;
