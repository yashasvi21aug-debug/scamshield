// QR Payload Security Analyzer

import { analyzeUrl } from './urlIntelligence.js';
import { calculateTrustScore, getRiskStatus, generateRecommendations } from '../utils/scoring.js';

export function analyzeQrPayload(payload) {
  if (!payload || typeof payload !== 'string' || payload.trim().length === 0) {
    return {
      isValid: false,
      error: "QR code payload is empty or could not be decoded"
    };
  }

  const rawPayload = payload.trim();
  const threats = [];
  let totalDeduction = 0;
  let qrType = "generic_text";
  let paymentDetails = null;

  // 1. UPI Payment QR Detection (e.g. upi://pay?pa=merchant@bank&pn=Name...)
  if (/^upi:\/\/pay/i.test(rawPayload)) {
    qrType = "upi_payment";
    try {
      const urlObj = new URL(rawPayload);
      const params = urlObj.searchParams;
      const pa = params.get('pa') || '';
      const pn = params.get('pn') || '';
      const am = params.get('am') || '';
      const tn = params.get('tn') || '';

      paymentDetails = {
        payeeVpa: pa,
        payeeName: pn || "Unspecified / Generic",
        amount: am ? `₹${am}` : "Dynamic / User-entered",
        transactionNote: tn || "None"
      };

      // Heuristic checks on UPI payload
      if (!pa) {
        threats.push({
          title: "Missing Payee VPA",
          severity: "High",
          icon: "AlertOctagon",
          explanation: "The UPI QR does not specify a valid Virtual Payment Address."
        });
        totalDeduction += 30;
      }

      // Check if payee name looks like an impersonation or suspicious individual
      const isBankImpersonation = /(sbi|hdfc|icici|axis|bank|refund|cashback|lottery|reward)/i.test(pn) && !/@(okaxis|okhdfcbank|oksbi|icici|ybl|paytm)$/i.test(pa);
      if (isBankImpersonation) {
        threats.push({
          title: "Suspicious Payee Name / Bank Keyword In Individual VPA",
          severity: "High",
          icon: "ShieldAlert",
          explanation: `Payee name '${pn}' uses institutional keywords but points to a personal or non-verified UPI handle.`
        });
        totalDeduction += 35;
      }

      // Check for predatory pre-filled amounts
      if (am && parseFloat(am) > 5000) {
        threats.push({
          title: `Pre-set High Payment Amount (₹${am})`,
          severity: "Medium",
          icon: "BadgeDollarSign",
          explanation: "The QR code has an enforced high transaction amount pre-filled."
        });
        totalDeduction += 15;
      }

      // Base deduction for caution on unverified physical payment QRs
      totalDeduction += 20;

    } catch (err) {
      threats.push({
        title: "Malformed UPI String",
        severity: "Medium",
        icon: "AlertTriangle",
        explanation: "The UPI QR structure is irregular or contains non-standard parameters."
      });
      totalDeduction += 25;
    }
  }
  // 2. URL Payload
  else if (/^https?:\/\//i.test(rawPayload) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(rawPayload)) {
    qrType = "url_destination";
    const urlAnalysis = analyzeUrl(rawPayload);
    if (urlAnalysis.isValid) {
      for (const t of urlAnalysis.threats) {
        threats.push({
          title: `QR Destination: ${t.title}`,
          severity: t.severity,
          icon: t.icon,
          explanation: t.explanation
        });
      }
      totalDeduction += urlAnalysis.totalDeduction;
    }
  }
  // 3. Generic Text / Deep-link
  else {
    qrType = "plain_text";
    if (rawPayload.length > 300) {
      totalDeduction += 10;
    }
  }

  const trustScore = calculateTrustScore(totalDeduction);
  const risk = getRiskStatus(trustScore);
  const recommendations = generateRecommendations(threats, qrType === "upi_payment" ? "payment" : "url");

  // Add QR specific warnings
  if (qrType === "upi_payment") {
    recommendations.unshift({
      action: "⚠️ Verify Payee Name and Details Before Authorizing",
      description: "FraudLens cannot guarantee the identity of the payment recipient solely from QR content. Always verify the recipient name and payment details in your UPI app before confirming a transaction.",
      type: "warning",
      priority: 0
    });
  }

  return {
    isValid: true,
    type: "qr",
    qrType,
    extractedContent: rawPayload,
    paymentDetails,
    trustScore,
    risk,
    threats,
    recommendations,
    disclaimer: "Risk assessment based on available indicators. For payment QR codes, always verify recipient identity independently.",
    analyzedAt: new Date().toISOString()
  };
}
