// Transparent Evidence-Based Trust Score Engine
// Formula: Base 100 - Sum(Weighted Deductions) adjusted by confidence bounds

/**
 * Exact deduction weights by indicator type:
 * 
 * LOCAL INDICATORS:
 * - Direct IP Address Hostname: -45
 * - Suspected Brand Impersonation / Lookalike: -50
 * - High-Risk Throwaway TLD (.top, .xyz, .click, etc.): -35
 * - URL Shortener Obfuscation: -30
 * - Sensitive Action in Unknown Path: -20
 * - Insecure Plaintext HTTP: -15
 * - Extreme Urgency Manipulation: -25
 * - Account Freeze Threat: -35
 * - Unsolicited KYC / Identity Demand: -35
 * - Sensitive Security Token Request (OTP/PIN/CVV): -40
 * - Remote Desktop App Trap (AnyDesk/TeamViewer): -45
 * - Unverified Contact in Banking Alert: -25
 * - Malicious UPI Handle / Fake Bank Payee: -35
 * - Pre-filled High Amount in UPI QR: -15
 * 
 * EXTERNAL THREAT INTELLIGENCE:
 * - Google Safe Browsing Match: -55
 * - VirusTotal Threat Engine Positives: -20 per vendor match (up to -60)
 * - URLhaus Malware Download Match: -50
 * - PhishTank Verified Phishing Match: -55
 * 
 * AI SEMANTIC EVALUATION:
 * - AI Critical Severity Indicator: -30
 * - AI High Severity Indicator: -20
 * - AI Medium Severity Indicator: -10
 */

export function calculateEvidenceBasedTrustScore(evidenceOrDeduction = [], aiConfidence = 1.0) {
  let score = 98; // Base baseline for unflagged clean inputs
  let totalDeduction = 0;

  if (typeof evidenceOrDeduction === 'number') {
    totalDeduction = evidenceOrDeduction;
  } else if (Array.isArray(evidenceOrDeduction)) {
    for (const item of evidenceOrDeduction) {
      let weight = 0;
      const severity = (item.severity || 'Medium').toLowerCase();

      if (item.source === 'threat-intel') {
        weight = severity === 'critical' ? 55 : 40;
      } else if (item.source === 'ai-semantic') {
        if (severity === 'critical') weight = 30;
        else if (severity === 'high') weight = 20;
        else if (severity === 'medium') weight = 10;
        else weight = 5;
      } else {
        // Local indicators
        if (item.weight && typeof item.weight === 'number') {
          weight = item.weight;
        } else if (severity === 'critical') {
          weight = 40;
        } else if (severity === 'high') {
          weight = 25;
        } else if (severity === 'medium') {
          weight = 15;
        } else {
          weight = 10;
        }
      }

      totalDeduction += weight;
    }
  }

  // Adjust score by deductions
  score -= totalDeduction;

  // Bound within 5 to 98
  if (score < 5) score = 5;
  if (score > 98) score = 98;

  return Math.round(score);
}

export const calculateTrustScore = calculateEvidenceBasedTrustScore;

export function getRiskStatus(score) {
  if (score <= 30) {
    return {
      level: "HIGH RISK",
      color: "red",
      badgeClass: "bg-red-500/20 text-red-400 border-red-500/30",
      description: "Critical threat indicators identified. High probability of malicious activity or financial trap."
    };
  }
  if (score <= 60) {
    return {
      level: "SUSPICIOUS",
      color: "amber",
      badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      description: "Suspicious behavioral, structural, or urgency patterns detected. Exercise extreme caution."
    };
  }
  if (score <= 80) {
    return {
      level: "CAUTION",
      color: "yellow",
      badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      description: "Anomalous or unverified indicators detected. Verify sender independently before proceeding."
    };
  }
  return {
    level: "LIKELY SAFE",
    color: "emerald",
    badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    description: "No prominent threat indicators detected. Maintain standard digital awareness."
  };
}

export function generateRecommendations(indicators = [], contextType = "sms") {
  const recommendations = [];
  const indicatorNames = indicators.map(i => (i.name || i.title || '').toLowerCase());

  const hasLinkThreat = indicatorNames.some(n => n.includes('url') || n.includes('link') || n.includes('tld') || n.includes('domain') || n.includes('threat match'));
  const hasCredential = indicatorNames.some(n => n.includes('credential') || n.includes('kyc') || n.includes('otp') || n.includes('pin') || n.includes('password'));
  const hasPayment = indicatorNames.some(n => n.includes('payment') || n.includes('upi') || n.includes('refund') || n.includes('cashback'));
  const hasRemote = indicatorNames.some(n => n.includes('remote') || n.includes('anydesk') || n.includes('teamviewer') || n.includes('apk'));
  const hasUrgency = indicatorNames.some(n => n.includes('urgency') || n.includes('freeze') || n.includes('threat') || n.includes('warning'));

  if (indicators.length === 0) {
    recommendations.push({
      action: "Safe to proceed with standard caution",
      description: "No known scam patterns or intelligence matches were detected.",
      type: "safe",
      priority: 1
    });
    recommendations.push({
      action: "Verify sender origin",
      description: "Confirm correspondence originates from the organization's official verified channel.",
      type: "info",
      priority: 2
    });
    return recommendations;
  }

  if (hasLinkThreat || contextType === 'url') {
    recommendations.push({
      action: "🛑 Do not click the link",
      description: "The link points to an unverified or high-risk destination flagged by security heuristics.",
      type: "critical",
      priority: 1
    });
  } else {
    recommendations.push({
      action: "🛑 Disengage and do not reply",
      description: "Replying confirms your contact identity to automated fraud campaigns.",
      type: "critical",
      priority: 1
    });
  }

  if (hasCredential) {
    recommendations.push({
      action: "🔒 Never share OTP, PIN, CVV, or passwords",
      description: "Legitimate institutions will never request confidential security credentials over SMS, chat, or forms.",
      type: "warning",
      priority: 2
    });
  }

  if (hasPayment || contextType === 'payment') {
    recommendations.push({
      action: "💳 Remember: You never need a PIN to RECEIVE money",
      description: "Entering your UPI PIN authorizes an outgoing debit from your account, never an incoming credit.",
      type: "warning",
      priority: 2
    });
  }

  if (hasRemote) {
    recommendations.push({
      action: "⚠️ Never install remote screen sharing software",
      description: "Apps like AnyDesk or TeamViewer allow attackers to view your screen and intercept banking sessions.",
      type: "critical",
      priority: 2
    });
  }

  if (hasUrgency) {
    recommendations.push({
      action: "⏱️ Pause: Legitimate organizations give formal advance notice",
      description: "Scammers manufacture artificial panic to force hasty decisions. Verify independently.",
      type: "info",
      priority: 3
    });
  }

  recommendations.push({
    action: "📞 Cross-verify through official channels only",
    description: "Look up contact details directly from the organization's verified website or app.",
    type: "info",
    priority: 4
  });

  return recommendations;
}
