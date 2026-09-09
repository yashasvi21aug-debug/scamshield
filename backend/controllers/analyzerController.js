import { processSmsAnalysis, processUrlAnalysis, processQrAnalysis } from '../services/evidenceEngine.js';

export async function handleSmsAnalysis(req, res) {
  try {
    const { text, useAi = true, isDemo = false } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: "Please provide an SMS message or text string to analyze." });
    }

    const result = await processSmsAnalysis(text, { useAi, isDemo });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("SMS Analysis Error:", err);
    return res.status(500).json({
      error: "An error occurred during SMS analysis.",
      details: err.message
    });
  }
}

export async function handleUrlAnalysis(req, res) {
  try {
    const { url, useAi = true, isDemo = false } = req.body;
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({ error: "Please provide a valid URL string to inspect." });
    }

    const result = await processUrlAnalysis(url, { useAi, isDemo });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("URL Analysis Error:", err);
    return res.status(500).json({
      error: "An error occurred during URL analysis.",
      details: err.message
    });
  }
}

export async function handleQrAnalysis(req, res) {
  try {
    const { payload, useAi = true, isDemo = false } = req.body;
    if (!payload || typeof payload !== 'string' || payload.trim().length === 0) {
      return res.status(400).json({ error: "Decoded QR payload string is required." });
    }

    const result = await processQrAnalysis(payload, { useAi, isDemo });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("QR Analysis Error:", err);
    return res.status(500).json({
      error: "An error occurred during QR payload analysis.",
      details: err.message
    });
  }
}
