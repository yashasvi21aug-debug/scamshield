import mongoose from 'mongoose';

export const communityReportSchemaDefinition = {
  reportId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['phone', 'url', 'sms', 'qr', 'general'], default: 'general' },
  indicator: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  threatType: { type: String, default: 'Community Flagged' },
  description: { type: String, required: true },
  evidenceMetadata: { type: mongoose.Schema.Types.Mixed },
  reportCount: { type: Number, default: 1 },
  confidence: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  region: { type: String, default: 'Unspecified' },
  status: { type: String, enum: ['Reported', 'Active Threat', 'Under Review', 'Verified Signal'], default: 'Reported' },
  campaignId: { type: String, index: true },
  isDemo: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
};

const CommunityReportSchema = new mongoose.Schema(communityReportSchemaDefinition, { timestamps: true });

export const CommunityReport = mongoose.models.CommunityReport || mongoose.model('CommunityReport', CommunityReportSchema);
export default CommunityReport;
