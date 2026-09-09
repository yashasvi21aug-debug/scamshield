// Heuristic Scam Detection Engine for SMS and Text Content

import {
  URGENCY_PATTERNS,
  CREDENTIAL_PATTERNS,
  FINANCIAL_LURE_PATTERNS,
  IMPERSONATION_PATTERNS
} from '../utils/scamPatterns.js';
import { analyzeUrl } from './urlIntelligence.js';
import { calculateTrustScore, getRiskStatus, generateRecommendations } from '../utils/scoring.js';

export function analyzeSmsText(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      isValid: false,
      error: "Text content cannot be empty"
    };
  }

  const rawText = text.trim();
  const threats = [];
  let totalDeduction = 0;

  // 1. Check for Urgency & Coercion Patterns
  for (const item of URGENCY_PATTERNS) {
    if (item.pattern.test(rawText)) {
      threats.push({
        title: item.label,
        severity: item.weight >= 30 ? "High" : "Medium",
        icon: "Clock",
        explanation: item.explanation
      });
      totalDeduction += item.weight;
      break; // Avoid double stacking same category
    }
  }

  // 2. Check for Credential & Sensitive Harvesting
  for (const item of CREDENTIAL_PATTERNS) {
    if (item.pattern.test(rawText)) {
      threats.push({
        title: item.label,
        severity: item.weight >= 40 ? "Critical" : "High",
        icon: "KeyRound",
        explanation: item.explanation
      });
      totalDeduction += item.weight;
      break;
    }
  }

  // 3. Check for Financial Lures & Work-From-Home / Task Scams
  for (const item of FINANCIAL_LURE_PATTERNS) {
    if (item.pattern.test(rawText)) {
      threats.push({
        title: item.label,
        severity: item.weight >= 35 ? "High" : "Medium",
        icon: "BadgeDollarSign",
        explanation: item.explanation
      });
      totalDeduction += item.weight;
      break;
    }
  }

  // 4. Check for Organization / Brand Impersonation
  for (const item of IMPERSONATION_PATTERNS) {
    if (item.pattern.test(rawText)) {
      // Only penalize impersonation if paired with urgency, credentials, or suspicious links
      const hasOtherThreats = threats.length > 0;
      if (hasOtherThreats) {
        threats.push({
          title: item.label,
          severity: "High",
          icon: "ShieldAlert",
          explanation: `Message mimics official correspondence from a ${item.brand} entity, leveraging institutional trust to deceive you.`
        });
        totalDeduction += item.weight;
      }
      break;
    }
  }

  // 5. Extract and analyze embedded URLs in the text
  const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
  const matches = rawText.match(urlRegex) || [];
  const embeddedUrlResults = [];

  for (const urlMatch of matches.slice(0, 3)) {
    // Exclude common punctuation trailing matches
    const cleanUrl = urlMatch.replace(/[.,;!?)]+$/, '');
    if (cleanUrl.includes('.')) {
      const urlAnalysis = analyzeUrl(cleanUrl);
      if (urlAnalysis.isValid) {
        embeddedUrlResults.push(urlAnalysis);
        // Merge URL threats
        for (const urlThreat of urlAnalysis.threats) {
          threats.push({
            title: `Embedded Link: ${urlThreat.title}`,
            severity: urlThreat.severity,
            icon: urlThreat.icon || "ExternalLink",
            explanation: urlThreat.explanation
          });
        }
        totalDeduction += Math.min(45, urlAnalysis.totalDeduction);
      }
    }
  }

  // 6. Check for unverified sender contact numbers (e.g. mobile number sending bank alerts)
  const phoneSenderMatch = /\+?(\d{10,13})\b/.test(rawText);
  if (phoneSenderMatch && threats.some(t => t.title.includes("Banking") || t.title.includes("KYC"))) {
    threats.push({
      title: "Unofficial Contact Number in Bank Message",
      severity: "High",
      icon: "PhoneCall",
      explanation: "Banks and official services communicate through registered alphanumeric sender IDs (e.g. VK-HDFCBK), never standard personal phone numbers."
    });
    totalDeduction += 25;
  }

  // Calculate final Trust Score
  const trustScore = calculateTrustScore(totalDeduction);
  const risk = getRiskStatus(trustScore);
  const recommendations = generateRecommendations(threats, "sms");

  // Determine top threat category
  let detectedCategory = "Likely Legitimate Communication";
  if (threats.some(t => t.title.includes("KYC"))) detectedCategory = "Fake KYC Scam";
  else if (threats.some(t => t.title.includes("Banking"))) detectedCategory = "Banking Phishing";
  else if (threats.some(t => t.title.includes("Task") || t.title.includes("Job"))) detectedCategory = "Work-from-Home / Task Scam";
  else if (threats.some(t => t.title.includes("Utility") || t.title.includes("Electricity"))) detectedCategory = "Utility Disconnection Extortion";
  else if (threats.some(t => t.title.includes("Lottery") || t.title.includes("Prize"))) detectedCategory = "Lottery / Advance Fee Fraud";
  else if (threats.some(t => t.title.includes("Link") || t.title.includes("TLD") || t.title.includes("Shortening"))) detectedCategory = "Malicious Phishing Link";

  return {
    isValid: true,
    type: "sms",
    input: rawText,
    trustScore,
    risk,
    detectedCategory,
    threats,
    embeddedUrls: embeddedUrlResults,
    recommendations,
    disclaimer: "Risk assessment based on available threat indicators and behavioral pattern heuristics.",
    engine: "local-heuristic-v1",
    analyzedAt: new Date().toISOString()
  };
}
