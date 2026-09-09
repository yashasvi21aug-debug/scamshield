import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB, getDatabaseStatus } from './config/db.js';
import { handleSmsAnalysis, handleUrlAnalysis, handleQrAnalysis } from './controllers/analyzerController.js';
import { getCommunityReports, createCommunityReport, upvoteCommunityReport } from './controllers/communityController.js';
import { 
  getStats, 
  getTimeline, 
  getThreatDistribution, 
  getCategoryDistribution, 
  getHistory, 
  getCategories, 
  getEmergencyResources 
} from './controllers/dashboardController.js';
import { handleAdvisorChat } from './controllers/advisorController.js';
import { threatIntelManager } from './services/threatIntel/threatIntelManager.js';
import { aiService } from './services/aiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configurable CORS: allows deployed frontend via FRONTEND_URL or defaults to * if not set
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim()) 
  : null;

app.use(cors({
  origin: (origin, callback) => {
    // Allow mobile apps (like ScamShield Quick Scan), curl, or requests without Origin header
    if (!origin) return callback(null, true);
    // Allow all if FRONTEND_URL is not set or set to wildcard
    if (!allowedOrigins || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow local development ports if in non-production
    if (process.env.NODE_ENV !== 'production' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by ScamShield CORS policy`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
}));

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP. Please try again later." }
});
app.use('/api/', apiLimiter);

// Strict body payload limit to protect against oversized attacks
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Connect to Database
await connectDB();

// Health Check & System Status Endpoint (Truthful representation, no secrets exposed)
app.get('/api/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  const aiStatus = aiService.getStatus();
  const intelStatus = threatIntelManager.getProvidersStatus();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus.status,
    databaseDetails: {
      status: dbStatus.status,
      engine: dbStatus.activeEngine,
      databaseName: dbStatus.databaseName,
      isDegraded: dbStatus.isDegraded
    },
    ai: {
      configured: aiStatus.configured,
      provider: aiStatus.provider,
      model: aiStatus.model
    },
    threatIntelligence: {
      googleSafeBrowsing: intelStatus['Google Safe Browsing']?.configured ? 'configured' : 'not_configured',
      virusTotal: intelStatus['VirusTotal']?.configured ? 'configured' : 'not_configured',
      urlhaus: intelStatus['URLhaus']?.configured ? 'configured' : 'not_configured',
      phishTank: intelStatus['PhishTank']?.configured ? 'configured' : 'not_configured'
    },
    localEngine: 'operational',
    ssrfProtection: 'operational'
  });
});

// Threat Analysis Endpoints
app.post('/api/analyze/sms', handleSmsAnalysis);
app.post('/api/analyze/url', handleUrlAnalysis);
app.post('/api/analyze/qr', handleQrAnalysis);

// Dashboard Aggregation Endpoints
app.get('/api/dashboard/stats', getStats);
app.get('/api/dashboard/timeline', getTimeline);
app.get('/api/dashboard/threat-distribution', getThreatDistribution);
app.get('/api/dashboard/categories', getCategoryDistribution);

// Scan Audit History
app.get('/api/history', getHistory);

// Threat Intelligence Catalog & Verified Emergency Resources
app.get('/api/threat-categories', getCategories);
app.get('/api/emergency/resources', getEmergencyResources);

// Community Intelligence Endpoints
app.get('/api/community/reports', getCommunityReports);
app.post('/api/community/report', createCommunityReport);
app.post('/api/community/reports/:id/upvote', upvoteCommunityReport);

// AI / Local Cybersecurity Advisor
app.post('/api/advisor/chat', handleAdvisorChat);

// Global Error Handler (Sanitizes stack traces from client exposure)
app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);
  res.status(err.status || 500).json({
    error: err.message || "An unexpected error occurred in the security engine."
  });
});

// Start Server
app.listen(PORT, () => {
  const dbStatus = getDatabaseStatus();
  console.log(`====================================================`);
  console.log(`🛡️  ScamShield AI Core Server running on port ${PORT}`);
  console.log(`🛡️  Database: ${dbStatus.status} (${dbStatus.activeEngine})`);
  console.log(`🛡️  AI Provider: ${aiService.isConfigured() ? aiService.provider : 'Not configured (Local Safety Engine active)'}`);
  console.log(`====================================================`);
});

export default app;
