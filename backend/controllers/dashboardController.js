import { storageService } from '../services/storageService.js';
import { COMMON_SCAM_CATEGORIES } from '../utils/scamPatterns.js';
import { OFFICIAL_EMERGENCY_RESOURCES } from '../utils/emergencyResources.js';

export async function getStats(req, res) {
  try {
    const includeDemo = req.query.includeDemo === 'true';
    const stats = await storageService.getDashboardStats(includeDemo);
    return res.json({ success: true, data: stats });
  } catch (err) {
    return res.status(500).json({ error: "Failed to retrieve dashboard metrics", details: err.message });
  }
}

export async function getTimeline(req, res) {
  try {
    const days = Number(req.query.days) || 7;
    const includeDemo = req.query.includeDemo === 'true';
    const timeline = await storageService.getDashboardTimeline(days, includeDemo);
    return res.json({ success: true, data: timeline });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch activity timeline", details: err.message });
  }
}

export async function getThreatDistribution(req, res) {
  try {
    const includeDemo = req.query.includeDemo === 'true';
    const dist = await storageService.getThreatDistribution(includeDemo);
    return res.json({ success: true, data: dist });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch threat distribution", details: err.message });
  }
}

export async function getCategoryDistribution(req, res) {
  try {
    const includeDemo = req.query.includeDemo === 'true';
    const cats = await storageService.getCategoryDistribution(includeDemo);
    return res.json({ success: true, data: cats });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch category distribution", details: err.message });
  }
}

export async function getHistory(req, res) {
  try {
    const { limit = 50, skip = 0, type = "all", risk = "all", search = "", includeDemo = "false" } = req.query;
    const { items, total } = await storageService.getScans({
      limit: Number(limit),
      skip: Number(skip),
      type,
      risk,
      search,
      includeDemo: includeDemo === 'true'
    });
    return res.json({ success: true, count: items.length, total, data: items });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch scan history", details: err.message });
  }
}

export function getCategories(req, res) {
  try {
    return res.json({ success: true, data: COMMON_SCAM_CATEGORIES });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch scam categories", details: err.message });
  }
}

export function getEmergencyResources(req, res) {
  try {
    return res.json({ success: true, data: OFFICIAL_EMERGENCY_RESOURCES });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch emergency resources", details: err.message });
  }
}
