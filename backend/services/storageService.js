import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Scan } from '../models/Scan.js';
import { CommunityReport } from '../models/CommunityReport.js';
import { CommunityVote } from '../models/CommunityVote.js';
import { ThreatCampaign } from '../models/ThreatCampaign.js';
import { AnalysisEvent } from '../models/AnalysisEvent.js';
import { SimulatorAttempt } from '../models/SimulatorAttempt.js';
import { getDatabaseStatus } from '../config/db.js';
import { TRAINING_CONCEPTS, SIMULATOR_SCENARIOS } from '../data/simulatorScenarios.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DISK_FILE = path.join(DATA_DIR, 'scamshield_store.json');

// Ensure disk storage directory exists for degraded mode persistence
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Low-level disk persistence helpers for degraded mode
function readDiskData() {
  try {
    if (fs.existsSync(DISK_FILE)) {
      const raw = fs.readFileSync(DISK_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (!parsed.simulatorAttempts) parsed.simulatorAttempts = [];
      return parsed;
    }
  } catch (err) {
    console.error("Failed to read degraded disk store:", err.message);
  }
  return {
    scans: [],
    reports: [],
    votes: [],
    campaigns: [],
    events: [],
    simulatorAttempts: []
  };
}

function writeDiskData(data) {
  try {
    fs.writeFileSync(DISK_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to persist to degraded disk store:", err.message);
  }
}

class StorageService {
  isMongoActive() {
    return mongoose.connection.readyState === 1;
  }

  // --- SCANS ---
  async saveScan(scanData) {
    const record = {
      scanId: scanData.scanId || `scan-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: scanData.type,
      inputHash: scanData.inputHash || '',
      sanitizedInput: scanData.sanitizedInput || scanData.input,
      extractedUrl: scanData.extractedUrl || null,
      qrPayload: scanData.qrPayload || null,
      trustScore: scanData.trustScore,
      riskLevel: scanData.risk?.level || scanData.riskLevel || 'SUSPICIOUS',
      detectedCategory: scanData.detectedCategory || 'General Threat Analysis',
      detectedIndicators: scanData.threats || scanData.detectedIndicators || [],
      recommendations: scanData.recommendations || [],
      intelligenceSources: scanData.intelligenceSources || { localEngine: true },
      urlDetails: scanData.urlDetails || null,
      breakdownMeters: scanData.breakdownMeters || null,
      isDemo: Boolean(scanData.isDemo),
      createdAt: new Date()
    };

    if (this.isMongoActive()) {
      const created = await Scan.create(record);
      return created.toObject();
    } else {
      const db = readDiskData();
      db.scans.unshift(record);
      if (db.scans.length > 5000) db.scans.pop();
      writeDiskData(db);
      return record;
    }
  }

  async getScanById(scanId) {
    if (this.isMongoActive()) {
      return await Scan.findOne({ scanId }).lean();
    } else {
      const db = readDiskData();
      return db.scans.find(s => s.scanId === scanId) || null;
    }
  }

  async getScans({ limit = 50, skip = 0, type, risk, search, includeDemo = false } = {}) {
    const query = {};
    if (!includeDemo) query.isDemo = false;
    if (type && type !== 'all') query.type = type;
    if (risk && risk !== 'all') query.riskLevel = risk.toUpperCase();

    if (this.isMongoActive()) {
      if (search) {
        query.$or = [
          { sanitizedInput: { $regex: search, $options: 'i' } },
          { detectedCategory: { $regex: search, $options: 'i' } }
        ];
      }
      const [items, total] = await Promise.all([
        Scan.find(query).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit)).lean(),
        Scan.countDocuments(query)
      ]);
      return { items, total };
    } else {
      const db = readDiskData();
      let filtered = db.scans.filter(s => {
        if (!includeDemo && s.isDemo) return false;
        if (type && type !== 'all' && s.type !== type) return false;
        if (risk && risk !== 'all' && s.riskLevel !== risk.toUpperCase()) return false;
        if (search) {
          const q = search.toLowerCase();
          const matchInput = (s.sanitizedInput || '').toLowerCase().includes(q);
          const matchCat = (s.detectedCategory || '').toLowerCase().includes(q);
          if (!matchInput && !matchCat) return false;
        }
        return true;
      });

      const total = filtered.length;
      const items = filtered.slice(Number(skip), Number(skip) + Number(limit));
      return { items, total };
    }
  }

  // --- DASHBOARD AGGREGATIONS (Strictly real data) ---
  async getDashboardStats(includeDemo = false) {
    if (this.isMongoActive()) {
      const matchStage = includeDemo ? {} : { isDemo: false };
      const [statsAgg, reportsCount] = await Promise.all([
        Scan.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: null,
              totalScans: { $sum: 1 },
              avgTrustScore: { $avg: '$trustScore' },
              threatsDetected: {
                $sum: { $cond: [{ $in: ['$riskLevel', ['HIGH RISK', 'SUSPICIOUS']] }, 1, 0] }
              },
              safeScans: {
                $sum: { $cond: [{ $eq: ['$riskLevel', 'LIKELY SAFE'] }, 1, 0] }
              },
              suspiciousScans: {
                $sum: { $cond: [{ $eq: ['$riskLevel', 'SUSPICIOUS'] }, 1, 0] }
              }
            }
          }
        ]),
        CommunityReport.countDocuments(includeDemo ? {} : { isDemo: false })
      ]);

      const agg = statsAgg[0] || {
        totalScans: 0,
        avgTrustScore: null,
        threatsDetected: 0,
        safeScans: 0,
        suspiciousScans: 0
      };

      const recentScans = await Scan.find(matchStage).sort({ createdAt: -1 }).limit(6).lean();
      const progress = await this.getSimulatorProgress(null, includeDemo);

      return {
        totalScans: agg.totalScans,
        threatsBlocked: agg.threatsDetected,
        safeScans: agg.safeScans,
        suspiciousScans: agg.suspiciousScans,
        averageTrustScore: agg.avgTrustScore !== null ? Math.round(agg.avgTrustScore * 10) / 10 : null,
        communityReportsCount: reportsCount,
        recentScans,
        trainingSummary: {
          scenariosCompleted: progress.scenariosCompleted,
          averageScore: progress.awarenessScore,
          weakestCategory: progress.weakestCategory,
          currentFocus: progress.adaptiveTraining?.focusLabel || 'Urgency Recognition',
          focusConcept: progress.adaptiveTraining?.focusConcept || 'urgency',
          conceptProgress: progress.adaptiveTraining?.progress !== undefined ? progress.adaptiveTraining.progress : 100,
          recommendedChallenge: progress.adaptiveTraining?.recommendedScenarioTitle || 'Urgency Recognition Challenge',
          recommendedDifficulty: progress.adaptiveTraining?.recommendedDifficulty || 'Beginner'
        },
        dbStatus: getDatabaseStatus()
      };
    } else {
      const db = readDiskData();
      const scans = db.scans.filter(s => includeDemo || !s.isDemo);
      const reports = db.reports.filter(r => includeDemo || !r.isDemo);
      const progress = await this.getSimulatorProgress(null, includeDemo);

      const totalScans = scans.length;
      let totalScore = 0;
      let threatsDetected = 0;
      let safeScans = 0;
      let suspiciousScans = 0;

      for (const s of scans) {
        totalScore += s.trustScore || 0;
        if (s.riskLevel === 'HIGH RISK' || s.riskLevel === 'SUSPICIOUS') {
          threatsDetected++;
        }
        if (s.riskLevel === 'LIKELY SAFE') {
          safeScans++;
        }
        if (s.riskLevel === 'SUSPICIOUS') {
          suspiciousScans++;
        }
      }

      return {
        totalScans,
        threatsBlocked: threatsDetected,
        safeScans,
        suspiciousScans,
        averageTrustScore: totalScans > 0 ? Math.round((totalScore / totalScans) * 10) / 10 : null,
        communityReportsCount: reports.length,
        recentScans: scans.slice(0, 6),
        trainingSummary: {
          scenariosCompleted: progress.scenariosCompleted,
          averageScore: progress.awarenessScore,
          weakestCategory: progress.weakestCategory,
          currentFocus: progress.adaptiveTraining?.focusLabel || 'Urgency Recognition',
          focusConcept: progress.adaptiveTraining?.focusConcept || 'urgency',
          conceptProgress: progress.adaptiveTraining?.progress !== undefined ? progress.adaptiveTraining.progress : 100,
          recommendedChallenge: progress.adaptiveTraining?.recommendedScenarioTitle || 'Urgency Recognition Challenge',
          recommendedDifficulty: progress.adaptiveTraining?.recommendedDifficulty || 'Beginner'
        },
        dbStatus: getDatabaseStatus()
      };
    }
  }

  async getDashboardTimeline(days = 7, includeDemo = false) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    if (this.isMongoActive()) {
      const matchStage = {
        createdAt: { $gte: startDate },
        ...(includeDemo ? {} : { isDemo: false })
      };

      const timeline = await Scan.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            scans: { $sum: 1 },
            threats: {
              $sum: { $cond: [{ $in: ['$riskLevel', ['HIGH RISK', 'SUSPICIOUS']] }, 1, 0] }
            },
            safe: {
              $sum: { $cond: [{ $eq: ['$riskLevel', 'LIKELY SAFE'] }, 1, 0] }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return timeline.map(t => ({ day: t._id, scans: t.scans, threats: t.threats, safe: t.safe }));
    } else {
      const db = readDiskData();
      const scans = db.scans.filter(s => {
        if (!includeDemo && s.isDemo) return false;
        return new Date(s.createdAt) >= startDate;
      });

      const dayMap = {};
      for (const s of scans) {
        const d = new Date(s.createdAt).toISOString().split('T')[0];
        if (!dayMap[d]) dayMap[d] = { day: d, scans: 0, threats: 0, safe: 0 };
        dayMap[d].scans++;
        if (s.riskLevel === 'HIGH RISK' || s.riskLevel === 'SUSPICIOUS') dayMap[d].threats++;
        if (s.riskLevel === 'LIKELY SAFE') dayMap[d].safe++;
      }

      return Object.values(dayMap).sort((a, b) => a.day.localeCompare(b.day));
    }
  }

  async getThreatDistribution(includeDemo = false) {
    if (this.isMongoActive()) {
      const matchStage = includeDemo ? {} : { isDemo: false };
      const dist = await Scan.aggregate([
        { $match: matchStage },
        { $group: { _id: "$riskLevel", count: { $sum: 1 } } }
      ]);

      const colors = {
        'HIGH RISK': '#ef4444',
        'SUSPICIOUS': '#f59e0b',
        'CAUTION': '#3b82f6',
        'LIKELY SAFE': '#10b981'
      };

      return dist.map(d => ({
        name: d._id || 'Unknown',
        value: d.count,
        fill: colors[d._id] || '#64748b'
      }));
    } else {
      const db = readDiskData();
      const scans = db.scans.filter(s => includeDemo || !s.isDemo);
      const counts = { 'HIGH RISK': 0, 'SUSPICIOUS': 0, 'CAUTION': 0, 'LIKELY SAFE': 0 };
      for (const s of scans) {
        if (counts[s.riskLevel] !== undefined) counts[s.riskLevel]++;
      }
      return [
        { name: "High Risk (0-30)", value: counts['HIGH RISK'], fill: "#ef4444" },
        { name: "Suspicious (31-60)", value: counts['SUSPICIOUS'], fill: "#f59e0b" },
        { name: "Caution (61-80)", value: counts['CAUTION'], fill: "#3b82f6" },
        { name: "Likely Safe (81-100)", value: counts['LIKELY SAFE'], fill: "#10b981" }
      ].filter(item => item.value > 0);
    }
  }

  async getCategoryDistribution(includeDemo = false) {
    if (this.isMongoActive()) {
      const matchStage = includeDemo ? {} : { isDemo: false };
      const cats = await Scan.aggregate([
        { $match: matchStage },
        { $group: { _id: "$detectedCategory", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]);
      return cats.map(c => ({ name: c._id || 'Unclassified', count: c.count }));
    } else {
      const db = readDiskData();
      const scans = db.scans.filter(s => includeDemo || !s.isDemo);
      const map = {};
      for (const s of scans) {
        const cat = s.detectedCategory || 'Unclassified';
        map[cat] = (map[cat] || 0) + 1;
      }
      return Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    }
  }

  // --- COMMUNITY REPORTS ---
  async saveCommunityReport(reportData) {
    const reportCount = 1;
    const confidence = 'Low'; // initial confidence for a single report

    const record = {
      reportId: reportData.reportId || `rep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: reportData.title || `Suspicious ${reportData.category || 'Threat'} Report`,
      type: reportData.type || 'general',
      indicator: reportData.indicator || reportData.targetIdentifier,
      category: reportData.category || 'Financial Phishing',
      threatType: reportData.threatType || 'Community Flagged',
      description: reportData.description,
      evidenceMetadata: reportData.evidenceMetadata || {},
      reportCount,
      confidence,
      region: reportData.region || 'Unspecified',
      status: 'Reported',
      isDemo: Boolean(reportData.isDemo),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (this.isMongoActive()) {
      const created = await CommunityReport.create(record);
      return created.toObject();
    } else {
      const db = readDiskData();
      db.reports.unshift(record);
      writeDiskData(db);
      return record;
    }
  }

  async getCommunityReports({ category, search, includeDemo = false } = {}) {
    const query = {};
    if (!includeDemo) query.isDemo = false;
    if (category && category !== 'all') query.category = category;

    if (this.isMongoActive()) {
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { indicator: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      return await CommunityReport.find(query).sort({ reportCount: -1, createdAt: -1 }).lean();
    } else {
      const db = readDiskData();
      return db.reports.filter(r => {
        if (!includeDemo && r.isDemo) return false;
        if (category && category !== 'all' && r.category !== category) return false;
        if (search) {
          const q = search.toLowerCase();
          const matchTitle = (r.title || '').toLowerCase().includes(q);
          const matchInd = (r.indicator || '').toLowerCase().includes(q);
          const matchDesc = (r.description || '').toLowerCase().includes(q);
          if (!matchTitle && !matchInd && !matchDesc) return false;
        }
        return true;
      }).sort((a, b) => b.reportCount - a.reportCount || new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  // --- COMMUNITY VOTING WITH DUPLICATE PREVENTION ---
  async upvoteReport(reportId, userSessionId) {
    if (!userSessionId) {
      throw new Error("Session identifier required to record verification vote.");
    }

    if (this.isMongoActive()) {
      // Check duplicate vote
      const existingVote = await CommunityVote.findOne({ reportId, userSessionId });
      if (existingVote) {
        const error = new Error("You have already confirmed this threat report from this session.");
        error.status = 409;
        throw error;
      }

      await CommunityVote.create({
        voteId: `vote-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        reportId,
        userSessionId,
        votedAt: new Date()
      });

      const report = await CommunityReport.findOne({ reportId });
      if (!report) {
        const error = new Error("Report not found.");
        error.status = 404;
        throw error;
      }

      report.reportCount += 1;
      if (report.reportCount >= 5) {
        report.confidence = 'High';
        report.status = 'Verified Signal';
      } else if (report.reportCount >= 2) {
        report.confidence = 'Medium';
      }
      report.updatedAt = new Date();
      await report.save();
      return report.toObject();
    } else {
      const db = readDiskData();
      const existingVote = db.votes.find(v => v.reportId === reportId && v.userSessionId === userSessionId);
      if (existingVote) {
        const error = new Error("You have already confirmed this threat report from this session.");
        error.status = 409;
        throw error;
      }

      db.votes.push({
        voteId: `vote-${Date.now()}`,
        reportId,
        userSessionId,
        votedAt: new Date()
      });

      const report = db.reports.find(r => r.reportId === reportId);
      if (!report) {
        const error = new Error("Report not found.");
        error.status = 404;
        throw error;
      }

      report.reportCount += 1;
      if (report.reportCount >= 5) {
        report.confidence = 'High';
        report.status = 'Verified Signal';
      } else if (report.reportCount >= 2) {
        report.confidence = 'Medium';
      }
      report.updatedAt = new Date();

      writeDiskData(db);
      return report;
    }
  }

  // --- SIMULATOR ATTEMPTS ---
  async saveSimulatorAttempt(attemptData) {
    const record = {
      sessionId: attemptData.sessionId || 'anonymous-session',
      scenarioId: attemptData.scenarioId,
      stage: Number(attemptData.stage) || 1,
      difficulty: attemptData.difficulty || 'Beginner',
      category: attemptData.category || 'General',
      selectedAction: attemptData.selectedAction || '',
      actionId: attemptData.actionId || 'A',
      correct: Boolean(attemptData.correct),
      score: Number(attemptData.score) || 0,
      missedSignals: attemptData.missedSignals || [],
      conceptsTested: attemptData.conceptsTested || [],
      conceptsMissed: attemptData.conceptsMissed || [],
      feedback: attemptData.feedback || {},
      isDemo: Boolean(attemptData.isDemo),
      completedAt: new Date()
    };

    if (this.isMongoActive()) {
      const created = await SimulatorAttempt.create(record);
      return created.toObject();
    } else {
      const db = readDiskData();
      if (!db.simulatorAttempts) db.simulatorAttempts = [];
      db.simulatorAttempts.unshift(record);
      if (db.simulatorAttempts.length > 5000) db.simulatorAttempts.pop();
      writeDiskData(db);
      return record;
    }
  }

  async getSimulatorProgress(sessionId = null, includeDemo = false) {
    let attempts = [];
    if (this.isMongoActive()) {
      const match = {};
      if (sessionId) match.sessionId = sessionId;
      if (!includeDemo) match.isDemo = false;
      attempts = await SimulatorAttempt.find(match).sort({ completedAt: -1 }).lean();
    } else {
      const db = readDiskData();
      const all = db.simulatorAttempts || [];
      attempts = all.filter(a => {
        if (sessionId && a.sessionId !== sessionId) return false;
        if (!includeDemo && a.isDemo) return false;
        return true;
      });
    }

    const totalCompleted = attempts.length;
    let totalScore = 0;
    let safeCount = 0;
    let riskyCount = 0;
    const categoryStats = {};

    // Initialize concept analytics across all 11 concepts
    const conceptStats = {};
    for (const key of Object.keys(TRAINING_CONCEPTS)) {
      conceptStats[key] = {
        concept: key,
        label: TRAINING_CONCEPTS[key].label,
        description: TRAINING_CONCEPTS[key].description,
        tested: 0,
        mistakes: 0,
        safe: 0,
        mastery: 100
      };
    }

    for (const att of attempts) {
      totalScore += (att.score || 0);
      if (att.correct) safeCount++;
      else riskyCount++;

      const cat = att.category || 'General';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { category: cat, total: 0, scoreSum: 0, safe: 0, risky: 0 };
      }
      categoryStats[cat].total++;
      categoryStats[cat].scoreSum += (att.score || 0);
      if (att.correct) categoryStats[cat].safe++;
      else categoryStats[cat].risky++;

      // Aggregate concept mastery
      const testedList = att.conceptsTested || [];
      const missedList = att.conceptsMissed || [];

      for (const c of testedList) {
        if (conceptStats[c]) {
          conceptStats[c].tested++;
          if (att.correct) {
            conceptStats[c].safe++;
          }
        }
      }
      for (const m of missedList) {
        if (conceptStats[m]) {
          conceptStats[m].mistakes++;
        }
      }
    }

    const awarenessScore = totalCompleted > 0 ? Math.round(totalScore / totalCompleted) : 0;
    const categoriesArray = Object.values(categoryStats).map(c => ({
      category: c.category,
      attempts: c.total,
      avgScore: Math.round(c.scoreSum / c.total),
      safePercentage: Math.round((c.safe / c.total) * 100)
    }));

    categoriesArray.sort((a, b) => b.avgScore - a.avgScore);
    const strongestCategory = categoriesArray.length > 0 ? categoriesArray[0].category : "None Yet";
    const weakestCategory = categoriesArray.length > 0 ? categoriesArray[categoriesArray.length - 1].category : "None Yet";

    // Format concepts array with mastery %
    const conceptsArray = Object.values(conceptStats).map(c => {
      const mastery = c.tested > 0 
        ? Math.max(0, Math.round(((c.tested - c.mistakes) / c.tested) * 100))
        : 100;
      return {
        ...c,
        mastery
      };
    });

    // --- ADAPTIVE FOCUS AREA DETECTION ---
    // Concepts with mistakes sorted by mistake count desc, then lowest mastery
    const conceptsWithMistakes = conceptsArray.filter(c => c.mistakes > 0);
    conceptsWithMistakes.sort((a, b) => {
      if (b.mistakes !== a.mistakes) return b.mistakes - a.mistakes;
      return a.mastery - b.mastery;
    });

    let focusConceptObj = conceptsWithMistakes.length > 0 ? conceptsWithMistakes[0] : null;
    if (!focusConceptObj) {
      focusConceptObj = conceptsArray.find(c => c.concept === 'urgency') || conceptsArray[0];
    }

    const focusConcept = focusConceptObj.concept;
    const focusLabel = focusConceptObj.label;
    const focusProgress = focusConceptObj.mastery;

    // --- DIFFICULTY ADAPTATION ---
    // Beginner -> Intermediate -> Expert based on consistent performance
    // Struggles -> reinforce without penalty
    let recommendedDifficulty = 'Beginner';
    const recentAttempts = attempts.slice(0, 4);
    const recentAvgScore = recentAttempts.length > 0 
      ? Math.round(recentAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / recentAttempts.length)
      : 0;

    if (totalCompleted >= 4 && (awarenessScore >= 80 || recentAvgScore >= 85) && focusConceptObj.mistakes === 0) {
      recommendedDifficulty = 'Expert';
    } else if (totalCompleted >= 2 && (awarenessScore >= 70 || recentAvgScore >= 70)) {
      recommendedDifficulty = 'Intermediate';
    } else {
      recommendedDifficulty = 'Beginner';
    }

    // --- MULTI-STEP CHALLENGE READINESS ---
    // Trigger multi-step when user is Intermediate/Expert, or weakness is multi-stage vector
    const shouldRecommendMultiStep = (recommendedDifficulty !== 'Beginner') || ['payment_safety', 'payment_pressure', 'social_pressure', 'authority_impersonation'].includes(focusConcept);

    // --- TARGETED SCENARIO RECOMMENDATION ---
    let candidateScenarios = SIMULATOR_SCENARIOS.filter(s => s.concepts && s.concepts.includes(focusConcept));
    if (candidateScenarios.length === 0) candidateScenarios = SIMULATOR_SCENARIOS;

    // Prioritize multi-step if ready, matching difficulty
    let recommendedScen = candidateScenarios.find(s => {
      if (shouldRecommendMultiStep && !s.isMultiStep) return false;
      return s.difficulty.toLowerCase() === recommendedDifficulty.toLowerCase();
    });

    if (!recommendedScen) {
      recommendedScen = candidateScenarios.find(s => s.difficulty.toLowerCase() === recommendedDifficulty.toLowerCase()) || candidateScenarios[0];
    }

    // --- PERSONALIZED TRAINING INSIGHT ---
    // Strictly grounded in simulator metrics: identify a strength vs a weakness
    const strongConcept = conceptsArray.find(c => c.tested >= 2 && c.mistakes === 0);
    let trainingInsight = '';
    if (focusConceptObj.mistakes > 0) {
      if (strongConcept) {
        trainingInsight = `You've correctly identified ${strongConcept.label.toLowerCase()} several times, but ${focusLabel.toLowerCase()}-based scams are still challenging.`;
      } else {
        trainingInsight = `Simulator decisions show that ${focusLabel.toLowerCase()} is your primary focus area. Practice recognizing psychological pressure signals.`;
      }
    } else if (totalCompleted > 0) {
      trainingInsight = `You've demonstrated solid defensive discipline across ${totalCompleted} evaluated scenario${totalCompleted > 1 ? 's' : ''}. Ready to challenge your instincts against ${recommendedDifficulty} scenarios.`;
    } else {
      trainingInsight = `Begin your cybersecurity training with foundational scenarios to calibrate your defensive baseline.`;
    }

    const adaptiveTraining = {
      focusConcept,
      focusLabel,
      progress: focusProgress,
      recommendedDifficulty,
      recommendedScenarioId: recommendedScen.id,
      recommendedScenarioTitle: recommendedScen.title,
      isMultiStep: Boolean(recommendedScen.isMultiStep),
      trainingInsight
    };

    let legacyRecommended = null;
    if (categoriesArray.length > 0 && categoriesArray[categoriesArray.length - 1].avgScore < 80) {
      const weakest = categoriesArray[categoriesArray.length - 1];
      legacyRecommended = {
        category: weakest.category,
        reason: `Your training score in ${weakest.category} is ${weakest.avgScore}%. Practice more scenarios in this category to eliminate social engineering vulnerabilities.`
      };
    }

    return {
      awarenessScore,
      scenariosCompleted: totalCompleted,
      totalAttempts: totalCompleted,
      safeDecisions: safeCount,
      riskyDecisions: riskyCount,
      safeRatio: totalCompleted > 0 ? Math.round((safeCount / totalCompleted) * 100) : 100,
      strongestCategory,
      weakestCategory,
      recommendedScenario: legacyRecommended,
      categories: categoriesArray,
      conceptMastery: conceptsArray,
      adaptiveTraining,
      attempts: attempts,
      recentAttempts: attempts.slice(0, 10)
    };
  }

  // --- SEED SAMPLE TEST RECORD (Exclusively tagged as isDemo: true) ---
  async seedDemoCases() {
    const db = readDiskData();
    const hasDemo = db.reports.some(r => r.isDemo);
    if (!hasDemo) {
      const demoReports = [
        {
          reportId: "demo-rep-1",
          title: "Synthetic Demo: Fake SBI KYC Suspension SMS",
          type: "sms",
          indicator: "http://sbi-kyc-update.top",
          category: "Banking Fraud",
          threatType: "SMS Text",
          description: "Synthetic test case demonstrating urgent KYC account suspension threats.",
          reportCount: 3,
          confidence: "Medium",
          region: "National (Test)",
          status: "Under Review",
          isDemo: true,
          createdAt: new Date()
        }
      ];
      for (const dr of demoReports) {
        await this.saveCommunityReport(dr);
      }
    }
  }
}

export const storageService = new StorageService();
