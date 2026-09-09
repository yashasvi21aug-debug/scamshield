// Unified Multi-Tier Evidence & Detection Engine
// Architecture: Normalization -> Local Analysis + External Threat Intel + Real AI -> Evidence Aggregation -> Trust Score -> Persistence

import crypto from 'crypto';
import { analyzeSmsText } from './detectionEngine.js';
import { analyzeUrl } from './urlIntelligence.js';
import { analyzeQrPayload } from './qrDecoderService.js';
import { validateSafeUrl } from '../utils/ssrfProtection.js';
import { threatIntelManager } from './threatIntel/threatIntelManager.js';
import { getDomainIntelligence } from './domainIntelligence.js';
import { aiService } from './aiService.js';
import { calculateEvidenceBasedTrustScore, getRiskStatus, generateRecommendations } from '../utils/scoring.js';
import { storageService } from './storageService.js';

function hashInput(str) {
  return crypto.createHash('sha256').update(str || '').digest('hex');
}

export async function processSmsAnalysis(rawText, { useAi = true, isDemo = false } = {}) {
  const sanitized = (rawText || '').trim();
  if (!sanitized) {
    throw new Error("SMS text content cannot be empty.");
  }

  const allIndicators = [];
  const intelligenceSources = {
    localEngine: true,
    aiEngine: { available: false },
    threatIntel: threatIntelManager.getProvidersStatus()
  };

  // 1. Local Pattern Heuristics
  const localRes = analyzeSmsText(sanitized);
  for (const t of localRes.threats || []) {
    allIndicators.push({
      name: t.title || t.name,
      severity: t.severity || 'Medium',
      explanation: t.explanation,
      source: 'local'
    });
  }

  // 2. Embedded URL Inspection (with SSRF check and optional external threat intel)
  const embeddedUrls = [];
  const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
  const matches = sanitized.match(urlRegex) || [];

  for (const m of matches.slice(0, 2)) {
    const clean = m.replace(/[.,;!?)]+$/, '');
    const ssrfCheck = await validateSafeUrl(clean);
    if (!ssrfCheck.isValid && ssrfCheck.isSsrfRisk) {
      allIndicators.push({
        name: "Embedded SSRF / Internal Network Target",
        severity: "Critical",
        explanation: ssrfCheck.reason,
        source: "local"
      });
      continue;
    }

    const localUrlRes = analyzeUrl(clean);
    if (localUrlRes.isValid) {
      embeddedUrls.push(localUrlRes);
      for (const ut of localUrlRes.threats || []) {
        allIndicators.push({
          name: `Link Indicator: ${ut.title}`,
          severity: ut.severity,
          explanation: ut.explanation,
          source: 'local'
        });
      }

      // Query real threat intel providers if configured
      const intelRes = await threatIntelManager.queryAll(localUrlRes.url);
      for (const ef of intelRes.externalFindings) {
        allIndicators.push(ef);
      }
    }
  }

  // 3. Real Server-Side AI Analysis (if enabled and configured)
  let aiRecommendations = [];
  if (useAi && aiService.isConfigured()) {
    const aiRes = await aiService.analyzeContent('sms', sanitized);
    if (aiRes.available) {
      intelligenceSources.aiEngine = {
        available: true,
        provider: aiRes.provider,
        model: aiRes.model
      };
      for (const ind of aiRes.indicators || []) {
        allIndicators.push(ind);
      }
      aiRecommendations = aiRes.recommendations || [];
    }
  }

  // 4. Evidence Aggregation & Trust Score Calculation
  const trustScore = calculateEvidenceBasedTrustScore(allIndicators);
  const risk = getRiskStatus(trustScore);
  const recommendations = [
    ...generateRecommendations(allIndicators, 'sms'),
    ...aiRecommendations.map(r => ({ action: r, description: "AI Recommended Action", type: "warning", priority: 2 }))
  ].slice(0, 6);

  const result = {
    scanId: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: 'sms',
    inputHash: hashInput(sanitized),
    sanitizedInput: sanitized,
    input: sanitized,
    trustScore,
    risk,
    detectedCategory: localRes.detectedCategory || 'Suspicious SMS Communication',
    threats: allIndicators,
    detectedIndicators: allIndicators,
    embeddedUrls,
    recommendations,
    intelligenceSources,
    disclaimer: "This is a risk assessment based on analyzed indicators, not a guarantee of safety.",
    isDemo: Boolean(isDemo),
    analyzedAt: new Date().toISOString()
  };

  // 5. Persist to Real Database
  await storageService.saveScan(result);

  return result;
}

export async function processUrlAnalysis(urlString, { useAi = true, isDemo = false } = {}) {
  const sanitized = (urlString || '').trim();
  if (!sanitized) {
    throw new Error("URL string cannot be empty.");
  }

  // 1. Safe URL Validation & SSRF Protection
  const ssrfCheck = await validateSafeUrl(sanitized);
  if (!ssrfCheck.isValid && ssrfCheck.isSsrfRisk) {
    const criticalIndicator = {
      name: "SSRF Attack / Private Address Target",
      severity: "Critical",
      explanation: ssrfCheck.reason,
      source: "local"
    };

    const result = {
      scanId: `scan-${Date.now()}`,
      type: 'url',
      inputHash: hashInput(sanitized),
      sanitizedInput: sanitized,
      input: sanitized,
      trustScore: 5,
      risk: { level: "HIGH RISK", color: "red", description: "Target points to internal/private infrastructure. Request blocked." },
      detectedCategory: "SSRF Network Probe",
      threats: [criticalIndicator],
      detectedIndicators: [criticalIndicator],
      recommendations: [
        { action: "🛑 Block access to internal hostnames", description: "The destination attempts to address non-public network space.", type: "critical" }
      ],
      intelligenceSources: { localEngine: true, ssrfProtection: true },
      disclaimer: "This is a risk assessment, not a guarantee of safety.",
      isDemo: Boolean(isDemo),
      analyzedAt: new Date().toISOString()
    };

    await storageService.saveScan(result);
    return result;
  }

  const allIndicators = [];

  // 2. Local Structural & Domain Analysis
  const localUrl = analyzeUrl(sanitized);
  for (const t of localUrl.threats || []) {
    allIndicators.push({
      name: t.title,
      severity: t.severity,
      explanation: t.explanation,
      source: 'local'
    });
  }

  // 3. Real Domain Intelligence (DNS, TLS Cert on port 443 with SNI, RDAP)
  const domainIntel = await getDomainIntelligence(localUrl.hostname);
  if (domainIntel.rdapQueried && domainIntel.domainAge.includes('Newly Registered')) {
    allIndicators.push({
      name: `Newly Registered Domain (${domainIntel.domainAge})`,
      severity: "High",
      explanation: `Domain was created very recently according to RDAP records. Disposable phishing domains rarely survive past 30 days.`,
      source: 'domain-dns'
    });
  }

  // 4. Real External Threat Intelligence Providers (Google Safe Browsing, VirusTotal, etc.)
  const intelRes = await threatIntelManager.queryAll(localUrl.url);
  for (const ef of intelRes.externalFindings) {
    allIndicators.push(ef);
  }

  // 5. Real Server-Side AI Analysis (if enabled and configured)
  let aiRecommendations = [];
  const intelligenceSources = {
    localEngine: true,
    domainIntel: {
      available: domainIntel.dnsResolved,
      hostname: domainIntel.hostname,
      registrar: domainIntel.registrar,
      domainAge: domainIntel.domainAge,
      hasTls: domainIntel.hasTls
    },
    threatIntel: intelRes.providerStatus,
    aiEngine: { available: false }
  };

  if (useAi && aiService.isConfigured()) {
    const aiRes = await aiService.analyzeContent('url', localUrl.url);
    if (aiRes.available) {
      intelligenceSources.aiEngine = {
        available: true,
        provider: aiRes.provider,
        model: aiRes.model
      };
      for (const ind of aiRes.indicators || []) {
        allIndicators.push(ind);
      }
      aiRecommendations = aiRes.recommendations || [];
    }
  }

  // 6. Evidence-Based Trust Score
  const trustScore = calculateEvidenceBasedTrustScore(allIndicators);
  const risk = getRiskStatus(trustScore);
  const recommendations = [
    ...generateRecommendations(allIndicators, 'url'),
    ...aiRecommendations.map(r => ({ action: r, description: "AI Recommended Action", type: "warning", priority: 2 }))
  ].slice(0, 6);

  const result = {
    scanId: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: 'url',
    inputHash: hashInput(localUrl.url),
    sanitizedInput: localUrl.url,
    input: localUrl.url,
    trustScore,
    risk,
    detectedCategory: localUrl.brandSpoofed ? `Suspected ${localUrl.brandSpoofed} Phishing` : (allIndicators.length > 0 ? "Malicious / Suspicious URL" : "Legitimate Domain"),
    threats: allIndicators,
    detectedIndicators: allIndicators,
    urlDetails: {
      ...localUrl,
      domainAge: domainIntel.domainAge,
      registrar: domainIntel.registrar,
      hasTls: domainIntel.hasTls,
      tlsIssuer: domainIntel.tlsIssuer
    },
    breakdownMeters: localUrl.breakdownMeters,
    recommendations,
    intelligenceSources,
    disclaimer: "This is a risk assessment, not a guarantee of safety.",
    isDemo: Boolean(isDemo),
    analyzedAt: new Date().toISOString()
  };

  // 7. Persist to Real Database
  await storageService.saveScan(result);

  return result;
}

export async function processQrAnalysis(payload, { useAi = true, isDemo = false } = {}) {
  const sanitized = (payload || '').trim();
  if (!sanitized) {
    throw new Error("QR code payload is empty.");
  }

  const allIndicators = [];
  const localQr = analyzeQrPayload(sanitized);

  for (const t of localQr.threats || []) {
    allIndicators.push({
      name: t.title,
      severity: t.severity,
      explanation: t.explanation,
      source: 'local'
    });
  }

  // If payload is a URL, run URL intelligence
  let urlDetails = null;
  if (localQr.qrType === 'url_destination') {
    const localUrl = analyzeUrl(sanitized);
    urlDetails = localUrl;
    const intelRes = await threatIntelManager.queryAll(sanitized);
    for (const ef of intelRes.externalFindings) {
      allIndicators.push(ef);
    }
  }

  // Real Server-Side AI Analysis (if configured)
  const intelligenceSources = {
    localEngine: true,
    threatIntel: threatIntelManager.getProvidersStatus(),
    aiEngine: { available: false }
  };

  if (useAi && aiService.isConfigured()) {
    const aiRes = await aiService.analyzeContent('qr', sanitized);
    if (aiRes.available) {
      intelligenceSources.aiEngine = {
        available: true,
        provider: aiRes.provider,
        model: aiRes.model
      };
      for (const ind of aiRes.indicators || []) {
        allIndicators.push(ind);
      }
    }
  }

  const trustScore = calculateEvidenceBasedTrustScore(allIndicators);
  const risk = getRiskStatus(trustScore);
  const recommendations = generateRecommendations(allIndicators, localQr.qrType === 'upi_payment' ? 'payment' : 'url');

  if (localQr.qrType === 'upi_payment') {
    recommendations.unshift({
      action: "⚠️ Verify the recipient name and payment details before completing a payment",
      description: "ScamShield cannot guarantee the identity of the payment recipient solely from QR content. Never enter your UPI PIN to receive money.",
      type: "warning",
      priority: 0
    });
  }

  const result = {
    scanId: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: 'qr',
    qrType: localQr.qrType,
    inputHash: hashInput(sanitized),
    sanitizedInput: sanitized,
    extractedContent: sanitized,
    paymentDetails: localQr.paymentDetails,
    trustScore,
    risk,
    detectedCategory: localQr.qrType === 'upi_payment' ? 'UPI Payment QR' : (localQr.qrType === 'url_destination' ? 'QR URL Destination' : 'Plain Text QR'),
    threats: allIndicators,
    detectedIndicators: allIndicators,
    urlDetails,
    recommendations,
    intelligenceSources,
    disclaimer: "This is a risk assessment, not a guarantee of safety.",
    isDemo: Boolean(isDemo),
    analyzedAt: new Date().toISOString()
  };

  // Persist to Real Database
  await storageService.saveScan(result);

  return result;
}
