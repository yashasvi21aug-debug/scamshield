import mongoose from 'mongoose';

export const threatCampaignSchemaDefinition = {
  campaignId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true, index: true },
  indicatorPattern: { type: String },
  reportsCount: { type: Number, default: 1 },
  confidence: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
};

const ThreatCampaignSchema = new mongoose.Schema(threatCampaignSchemaDefinition, { timestamps: true });

export const ThreatCampaign = mongoose.models.ThreatCampaign || mongoose.model('ThreatCampaign', ThreatCampaignSchema);
export default ThreatCampaign;
