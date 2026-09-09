import mongoose from 'mongoose';

export const scanSchemaDefinition = {
  scanId: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['sms', 'url', 'qr'], required: true, index: true },
  inputHash: { type: String, index: true },
  sanitizedInput: { type: String, required: true },
  extractedUrl: { type: String },
  qrPayload: { type: mongoose.Schema.Types.Mixed },
  trustScore: { type: Number, required: true, min: 0, max: 100 },
  riskLevel: { type: String, required: true, index: true },
  detectedCategory: { type: String, index: true },
  detectedIndicators: [{
    name: { type: String, required: true },
    severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low', 'Informational'] },
    explanation: { type: String },
    source: { type: String, enum: ['local', 'threat-intel', 'ai-semantic', 'domain-dns'], default: 'local' }
  }],
  recommendations: [{
    action: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['critical', 'warning', 'info', 'emergency', 'safe'] },
    priority: { type: Number, default: 1 }
  }],
  intelligenceSources: {
    localEngine: { type: Boolean, default: true },
    aiEngine: {
      available: { type: Boolean, default: false },
      provider: { type: String },
      model: { type: String }
    },
    threatIntel: {
      googleSafeBrowsing: { available: { type: Boolean, default: false }, match: { type: Boolean, default: false } },
      virusTotal: { available: { type: Boolean, default: false }, positives: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
      urlhaus: { available: { type: Boolean, default: false }, match: { type: Boolean, default: false } },
      phishTank: { available: { type: Boolean, default: false }, match: { type: Boolean, default: false } }
    },
    domainIntel: {
      available: { type: Boolean, default: false },
      hostname: { type: String },
      registrar: { type: String },
      domainAge: { type: String },
      hasTls: { type: Boolean }
    }
  },
  urlDetails: { type: mongoose.Schema.Types.Mixed },
  breakdownMeters: {
    domainReputation: { type: Number },
    phishingIndicators: { type: Number },
    domainSimilarity: { type: Number },
    communityThreats: { type: Number }
  },
  isDemo: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
};

const ScanSchema = new mongoose.Schema(scanSchemaDefinition, { timestamps: true });

export const Scan = mongoose.models.Scan || mongoose.model('Scan', ScanSchema);
export default Scan;
