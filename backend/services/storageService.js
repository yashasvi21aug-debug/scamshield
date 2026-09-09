import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Scan } from '../models/Scan.js';
import { CommunityReport } from '../models/CommunityReport.js';
import { CommunityVote } from '../models/CommunityVote.js';
import { ThreatCampaign } from '../models/ThreatCampaign.js';
import { AnalysisEvent } from '../models/AnalysisEvent.js';
import { getDatabaseStatus } from '../config/db.js';

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
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read degraded disk store:", err.message);
  }
  return {
    scans: [],
    reports: [],
    votes: [],
    campaigns: [],
    events: []
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

      return {
        totalScans: agg.totalScans,
        threatsBlocked: agg.threatsDetected,
        safeScans: agg.safeScans,
        suspiciousScans: agg.suspiciousScans,
        averageTrustScore: agg.avgTrustScore !== null ? Math.round(agg.avgTrustScore * 10) / 10 : null,
        communityReportsCount: reportsCount,
        recentScans,
        dbStatus: getDatabaseStatus()
      };
    } else {
      const db = readDiskData();
      const scans = db.scans.filter(s => includeDemo || !s.isDemo);
      const reports = db.reports.filter(r => includeDemo || !r.isDemo);

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
