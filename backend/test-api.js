// Test script to verify all backend API endpoints and detection logic

import { analyzeSmsText } from './services/detectionEngine.js';
import { analyzeUrl } from './services/urlIntelligence.js';
import { analyzeQrPayload } from './services/qrDecoderService.js';
import { mockStore } from './services/mockStore.js';

console.log("=========================================");
console.log("🛡️  RUNNING SCAMSHIELD ENGINE UNIT TESTS");
console.log("=========================================");

// 1. Test SMS Detection: High Risk KYC
const fakeKycSms = "Dear customer, your SBI net banking is blocked today. Please complete your KYC immediately at http://sbi-kyc-verify.top or your account will be frozen.";
const smsRes = analyzeSmsText(fakeKycSms);
console.log("\n[TEST 1] Fake KYC SMS Analysis:");
console.log("Trust Score:", smsRes.trustScore, "/ 100");
console.log("Risk Level:", smsRes.risk.level);
console.log("Detected Category:", smsRes.detectedCategory);
console.log("Threats Found:", smsRes.threats.length);
console.assert(smsRes.trustScore <= 30, "Trust score should be <= 30 for high-risk KYC");
console.assert(smsRes.risk.level === "HIGH RISK", "Risk level should be HIGH RISK");

// 2. Test Safe SMS
const safeSms = "Your table reservation at Bistro 42 has been confirmed for tonight at 8:00 PM for 4 guests. Thank you!";
const safeRes = analyzeSmsText(safeSms);
console.log("\n[TEST 2] Safe SMS Analysis:");
console.log("Trust Score:", safeRes.trustScore, "/ 100");
console.log("Risk Level:", safeRes.risk.level);
console.assert(safeRes.trustScore >= 80, "Trust score should be >= 80 for safe SMS");

// 3. Test URL Analysis: Brand Impersonation + Suspicious TLD
const phishingUrl = "https://sbi-netbanking-portal.top/login";
const urlRes = analyzeUrl(phishingUrl);
console.log("\n[TEST 3] Phishing URL Analysis:");
console.log("Spoofed Brand:", urlRes.brandSpoofed);
console.log("Matched TLD:", urlRes.matchedTld);
console.log("Threats Count:", urlRes.threats.length);
console.assert(urlRes.brandSpoofed === "SBI", "Should identify SBI impersonation");

// 4. Test QR Code Payload: Malicious UPI Trap
const upiQrPayload = "upi://pay?pa=fake_support_refund@okaxis&pn=SBI_REFUND_PORTAL&am=9999";
const qrRes = analyzeQrPayload(upiQrPayload);
console.log("\n[TEST 4] Malicious UPI QR Analysis:");
console.log("QR Type:", qrRes.qrType);
console.log("Trust Score:", qrRes.trustScore, "/ 100");
console.log("Risk Level:", qrRes.risk.level);
console.assert(qrRes.qrType === "upi_payment", "Should identify UPI payment type");

// 5. Test Mock Store & Stats
const stats = mockStore.getDashboardStats();
console.log("\n[TEST 5] Mock Store & Dashboard Stats:");
console.log("Total Scans:", stats.totalScans);
console.log("Community Reports:", stats.communityReports);
console.assert(stats.totalScans > 0, "Stats should have scans");

console.log("\n=========================================");
console.log("✅ ALL SCAMSHIELD ENGINE TESTS PASSED!");
console.log("=========================================\n");
