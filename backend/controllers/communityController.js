import { storageService } from '../services/storageService.js';

export async function getCommunityReports(req, res) {
  try {
    const { category = "all", search = "", includeDemo = "false" } = req.query;
    const reports = await storageService.getCommunityReports({
      category,
      search,
      includeDemo: includeDemo === 'true'
    });
    return res.json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    return res.status(500).json({ error: "Failed to retrieve community reports", details: err.message });
  }
}

export async function createCommunityReport(req, res) {
  try {
    const { title, targetIdentifier, indicator, category, threatType, description, region, isDemo = false } = req.body;

    const actualIndicator = (indicator || targetIdentifier || '').trim();
    const actualDesc = (description || '').trim();

    if (!actualIndicator || !actualDesc) {
      return res.status(400).json({
        error: "Target indicator (phone, URL, UPI handle) and incident description are required."
      });
    }

    // Input sanitization
    const sanitizedTitle = (title || `Suspicious ${category || 'Threat'} Report`).slice(0, 120);
    const sanitizedDesc = actualDesc.slice(0, 2000);
    const sanitizedRegion = (region || 'Unspecified').slice(0, 80);

    const report = await storageService.saveCommunityReport({
      title: sanitizedTitle,
      indicator: actualIndicator,
      category: category || "Banking Fraud",
      threatType: threatType || "Community Flagged",
      description: sanitizedDesc,
      region: sanitizedRegion,
      isDemo: Boolean(isDemo)
    });

    return res.status(201).json({
      success: true,
      message: "Report recorded into the community fraud intelligence repository.",
      data: report
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to submit community report", details: err.message });
  }
}

export async function upvoteCommunityReport(req, res) {
  try {
    const { id } = req.params;
    // Extract session identifier from header or IP to prevent duplicate voting
    const userSessionId = req.headers['x-session-id'] || req.ip || req.connection.remoteAddress || 'anonymous-session';

    const updated = await storageService.upvoteReport(id, userSessionId);
    return res.json({
      success: true,
      message: "Threat confirmation recorded.",
      data: updated
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message });
  }
}
