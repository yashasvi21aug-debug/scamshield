// Complete End-to-End Real Service Integration Test Suite

import http from 'http';

async function runTests() {
  console.log("==========================================================");
  console.log("🧪 RUNNING SCAMSHIELD AI FULL-STACK END-TO-END VERIFICATION");
  console.log("==========================================================");

  const BASE = "http://localhost:5000";

  const request = (path, method = "GET", body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const url = new URL(path, BASE);
      const req = http.request(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(body ? { 'Content-Length': Buffer.byteLength(JSON.stringify(body)) } : {}),
          ...headers
        }
      }, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, body: raw });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Health check & real diagnostic status
    const health = await request('/api/health');
    console.log("1. /api/health -> Status:", health.status, "| DB:", health.body.database, "| Engine:", health.body.databaseDetails?.engine);
    if (health.status !== 200) throw new Error("Health check failed");

    // 2. Real SMS Analysis
    const sms = await request('/api/analyze/sms', 'POST', {
      text: "URGENT: Your SBI net banking is blocked today. Verify KYC immediately at http://sbi-kyc-verify.top or account will be frozen.",
      useAi: false,
      isDemo: false
    });
    console.log("2. /api/analyze/sms -> Trust Score:", sms.body.data.trustScore, "| Risk:", sms.body.data.risk.level, "| Threats:", sms.body.data.threats.length);
    if (sms.body.data.trustScore > 30) throw new Error("High risk KYC SMS must yield Trust Score <= 30");

    // 3. Real URL Analysis & SSRF Protection
    const ssrf = await request('/api/analyze/url', 'POST', {
      url: "http://127.0.0.1/admin"
    });
    console.log("3a. /api/analyze/url (SSRF Target) -> Blocked Trust Score:", ssrf.body.data.trustScore, "| Category:", ssrf.body.data.detectedCategory);
    if (ssrf.body.data.trustScore !== 5) throw new Error("SSRF target must be blocked with Trust Score 5");

    const url = await request('/api/analyze/url', 'POST', {
      url: "https://secure-hdfc-kyc.top/login"
    });
    console.log("3b. /api/analyze/url (Phishing) -> Host:", url.body.data.urlDetails.hostname, "| Impersonation:", url.body.data.urlDetails.brandSpoofed);
    if (!url.body.data.urlDetails.brandSpoofed) throw new Error("Brand impersonation failed to detect HDFC");

    // 4. Real QR Analysis (UPI Payment)
    const qr = await request('/api/analyze/qr', 'POST', {
      payload: "upi://pay?pa=fake_support@okaxis&pn=SBI_REFUND_PORTAL&am=8500&tn=ScanToReceiveRefund"
    });
    console.log("4. /api/analyze/qr -> Type:", qr.body.data.qrType, "| Payee:", qr.body.data.paymentDetails?.payeeName, "| Score:", qr.body.data.trustScore);
    if (qr.body.data.qrType !== "upi_payment") throw new Error("QR payment type mismatch");

    // 5. Community Report Creation
    const testSession = `test-session-${Date.now()}`;
    const newRep = await request('/api/community/report', 'POST', {
      title: "Active Digital Arrest Extortion",
      targetIdentifier: "+91 98214 09182",
      category: "Government Impersonation",
      threatType: "WhatsApp Video Call",
      description: "Callers impersonating cyber police officers demanding RTGS transfer.",
      region: "Delhi NCR",
      isDemo: false
    }, { 'x-session-id': testSession });
    console.log("5. /api/community/report -> Created Report ID:", newRep.body.data.reportId, "| Confidence:", newRep.body.data.confidence);

    // 6. Community Report Upvoting
    const upvoted = await request(`/api/community/reports/${newRep.body.data.reportId}/upvote`, 'POST', null, { 'x-session-id': testSession });
    console.log("6a. /api/community/reports/:id/upvote -> Upvoted Count:", upvoted.body.data.reportCount);
    if (upvoted.body.data.reportCount !== 2) throw new Error("Upvote count should increment to 2");

    // 6b. Duplicate Upvote Blocked (409)
    const duplicate = await request(`/api/community/reports/${newRep.body.data.reportId}/upvote`, 'POST', null, { 'x-session-id': testSession });
    console.log("6b. Duplicate upvote check -> HTTP Status:", duplicate.status, "| Error:", duplicate.body.error);
    if (duplicate.status !== 409) throw new Error("Duplicate upvote from same session must return 409 Conflict");

    // 7. Dashboard Endpoints
    const stats = await request('/api/dashboard/stats');
    console.log("7a. /api/dashboard/stats -> Total Scans:", stats.body.data.totalScans, "| Threats:", stats.body.data.threatsBlocked, "| Avg Score:", stats.body.data.averageTrustScore);

    const timeline = await request('/api/dashboard/timeline?days=7');
    console.log("7b. /api/dashboard/timeline -> Data points:", timeline.body.data.length);

    const threatDist = await request('/api/dashboard/threat-distribution');
    console.log("7c. /api/dashboard/threat-distribution -> Segments:", threatDist.body.data.length);

    const categories = await request('/api/dashboard/categories');
    console.log("7d. /api/dashboard/categories -> Categories:", categories.body.data.length);

    // 8. Emergency Official Resources
    const emergency = await request('/api/emergency/resources');
    console.log("8. /api/emergency/resources -> Resources count:", emergency.body.data.length);
    if (emergency.body.data.length === 0) throw new Error("Emergency resources should return official helplines");

    // 9. Advisor Chat
    const advisor = await request('/api/advisor/chat', 'POST', {
      message: "What should I do if I clicked a phishing link?"
    });
    console.log("9. /api/advisor/chat -> Mode:", advisor.body.advisorMode, "| Response length:", advisor.body.reply?.length);

    console.log("==========================================================");
    console.log("🎉 ALL REAL END-TO-END SCAMSHIELD INTEGRATION TESTS PASSED!");
    console.log("==========================================================");
    process.exit(0);

  } catch (err) {
    console.error("❌ E2E Test Failure:", err.message);
    process.exit(1);
  }
}

runTests();
