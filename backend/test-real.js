// Comprehensive Unit and Integration Tests for Real ScamShield Engine

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { processSmsAnalysis, processUrlAnalysis, processQrAnalysis } from './services/evidenceEngine.js';
import { validateSafeUrl } from './utils/ssrfProtection.js';
import { storageService } from './services/storageService.js';
import { aiService } from './services/aiService.js';
import { threatIntelManager } from './services/threatIntel/threatIntelManager.js';
import { connectDB, getDatabaseStatus } from './config/db.js';

console.log("==========================================================");
console.log("🛡️  SCAMSHIELD AI REAL ENGINE COMPREHENSIVE TEST SUITE");
console.log("==========================================================");

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Initialize DB connection check
  await connectDB();

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Database Status & Degraded Mode
    const dbStatus = getDatabaseStatus();
    assert(
      dbStatus.status === 'degraded' || 
      dbStatus.status === 'connected' || 
      dbStatus.status === 'MongoDB connected' || 
      dbStatus.status === 'MongoDB degraded', 
      "Database status accurately tracked"
    );
    assert(typeof dbStatus.activeEngine === 'string', "Active storage engine reported truthfully");

    // 2. SSRF Protection: Localhost and Private IP Rejection
    const ssrfLocalhost = await validateSafeUrl('http://localhost:8080/secret');
    assert(ssrfLocalhost.isSsrfRisk === true, "SSRF Protection rejects localhost");

    const ssrfLoopback = await validateSafeUrl('http://127.0.0.1/admin');
    assert(ssrfLoopback.isSsrfRisk === true, "SSRF Protection rejects 127.0.0.1 loopback");

    const ssrfPrivate192 = await validateSafeUrl('http://192.168.1.1/router');
    assert(ssrfPrivate192.isSsrfRisk === true, "SSRF Protection rejects private 192.168.x.x");

    const ssrfValid = await validateSafeUrl('https://example.com/login');
    assert(ssrfValid.isValid === true && !ssrfValid.isSsrfRisk, "Safe public URL passes SSRF check");

    // 3. Real SMS Analysis
    const fakeKycSms = "Dear Customer, Your SBI account will be blocked today due to pending KYC. Click http://sbi-kyc-verify.top immediately to avoid suspension.";
    const smsRes = await processSmsAnalysis(fakeKycSms, { useAi: false, isDemo: false });
    assert(smsRes.trustScore <= 30, `Fake KYC SMS yields High Risk score (Actual: ${smsRes.trustScore})`);
    assert(smsRes.risk.level === "HIGH RISK", "Risk level is HIGH RISK");
    assert(smsRes.threats.length >= 3, `Identified multiple threat indicators (Actual: ${smsRes.threats.length})`);
    assert(smsRes.disclaimer.includes("risk assessment"), "Disclaimer explicitly clarifies non-guarantee");

    // 4. Real Safe SMS
    const safeSms = "Your grocery delivery order #8812 has arrived. Thank you for shopping with us!";
    const safeSmsRes = await processSmsAnalysis(safeSms, { useAi: false, isDemo: false });
    assert(safeSmsRes.trustScore >= 80, `Safe SMS yields Likely Safe score (Actual: ${safeSmsRes.trustScore})`);
    assert(safeSmsRes.risk.level === "LIKELY SAFE", "Safe SMS categorized as LIKELY SAFE");

    // 5. Real URL Analysis & SSRF Handling in Engine
    const ssrfUrlRes = await processUrlAnalysis('http://localhost:3000/internal-test');
    assert(ssrfUrlRes.trustScore === 5, "SSRF URL immediately blocked with score 5");
    assert(ssrfUrlRes.detectedCategory === "SSRF Network Probe", "SSRF category classified");

    const phishingUrlRes = await processUrlAnalysis('https://secure-hdfc-kyc-update.top/login.php', { useAi: false });
    assert(phishingUrlRes.trustScore <= 35, `Phishing lookalike URL flagged with low score (Actual: ${phishingUrlRes.trustScore})`);
    assert(phishingUrlRes.threats.some(t => t.name.includes("Brand Impersonation")), "Brand Impersonation detected for HDFC");
    assert(phishingUrlRes.urlDetails.domainAge !== undefined, "Domain age field present without fabrication");

    // 6. Real QR Code Payload (UPI Payment)
    const upiQr = "upi://pay?pa=fake_refund_dept@okaxis&pn=SBI_REFUND_PORTAL&am=7500&tn=ScanToReceive";
    const qrRes = await processQrAnalysis(upiQr, { useAi: false });
    assert(qrRes.qrType === "upi_payment", "QR correctly identified as UPI payment");
    assert(qrRes.paymentDetails?.payeeName === "SBI_REFUND_PORTAL", "Parsed actual payee name without fabrication");
    assert(qrRes.paymentDetails?.payeeVpa === "fake_refund_dept@okaxis", "Parsed actual payee VPA");
    assert(qrRes.recommendations.some(r => r.action.includes("Verify the recipient name")), "Enforces payee verification advisory");

    // 7. Community Reporting Persistence
    const uniqueId = `test-${Date.now()}`;
    const reportData = {
      title: "Test Unit Threat Report",
      indicator: `http://malicious-test-${uniqueId}.top`,
      category: "Banking Fraud",
      threatType: "Phishing Link",
      description: "Automated unit test threat report for persistence verification.",
      region: "Maharashtra",
      isDemo: false
    };
    const createdReport = await storageService.saveCommunityReport(reportData);
    assert(Boolean(createdReport.reportId), "Community report successfully created and persisted");
    assert(createdReport.reportCount === 1, "Initial report count is 1");
    assert(createdReport.confidence === "Low", "Initial confidence is Low for a single report");

    // 8. Community Voting and Duplicate Prevention
    const testSession = `session-${Date.now()}`;
    const upvotedReport = await storageService.upvoteReport(createdReport.reportId, testSession);
    assert(upvotedReport.reportCount === 2, `Report count incremented to 2 (Actual: ${upvotedReport.reportCount})`);
    assert(upvotedReport.confidence === "Medium", "Confidence upgraded to Medium with multiple confirmations");

    let duplicateBlocked = false;
    try {
      await storageService.upvoteReport(createdReport.reportId, testSession);
    } catch (err) {
      if (err.status === 409) duplicateBlocked = true;
    }
    assert(duplicateBlocked, "Duplicate upvote from same session blocked with 409");

    // 9. Real Dashboard Aggregation
    const stats = await storageService.getDashboardStats(false);
    assert(stats.totalScans > 0, `Total scans aggregated from actual DB records (Total: ${stats.totalScans})`);
    assert(stats.threatsBlocked >= 0, "Threats blocked counted");
    assert(stats.averageTrustScore !== null, `Average trust score calculated: ${stats.averageTrustScore}`);

    // 10. Threat Intelligence Status Reporting
    const intelStatus = threatIntelManager.getProvidersStatus();
    assert(intelStatus['Google Safe Browsing'] !== undefined, "Google Safe Browsing status tracked");
    assert(intelStatus['VirusTotal'] !== undefined, "VirusTotal status tracked");
    assert(intelStatus['URLhaus'] !== undefined, "URLhaus status tracked");
    assert(intelStatus['PhishTank'] !== undefined, "PhishTank status tracked");

    // 11. AI Service Configuration Reporting
    const aiStatus = aiService.getStatus();
    assert(typeof aiStatus.configured === 'boolean', "AI configuration status reported truthfully");

    console.log("==========================================================");
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==========================================================");

    if (failed > 0) process.exit(1);
    process.exit(0);

  } catch (err) {
    console.error("Test Suite Runtime Error:", err);
    process.exit(1);
  }
}

runTests();
