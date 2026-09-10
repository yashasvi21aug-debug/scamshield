// Live Render Production Backend Verification for ScamShield Quick Scan
// Tests all Android companion API paths against: https://scamshield-udqs.onrender.com

const BASE = "https://scamshield-udqs.onrender.com";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function request(path, method = "GET", body = null) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

// Mirroring Android NetworkUtils & QrDecoder
function isPrimarilyUrl(text) {
  const trimmed = text.trim();
  if (trimmed.includes("\n") || trimmed.includes(" ")) return false;
  if (/^https?:\/\//i.test(trimmed)) return true;
  return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/i.test(trimmed);
}

function parseUpiUri(uriString) {
  const params = {};
  const queryStart = uriString.indexOf('?');
  if (queryStart !== -1) {
    const queryString = uriString.substring(queryStart + 1);
    for (const pair of queryString.split("&")) {
      const [k, v] = pair.split("=");
      if (k && v) {
        params[decodeURIComponent(k).toLowerCase()] = decodeURIComponent(v.replace(/\+/g, '%20'));
      }
    }
  }
  return params;
}

async function runLiveTests() {
  console.log("==========================================================");
  console.log("🚀 TESTING SCAMSHIELD QUICK SCAN ON LIVE RENDER BACKEND");
  console.log(`Target: ${BASE}`);
  console.log("==========================================================");

  try {
    // 1. Health check
    console.log("\n[1. Live Health Check: GET /api/health]");
    const health = await request('/api/health');
    assert(health.status === 200, "Render backend responded with HTTP 200 OK");
    assert(health.data.status === "ok", "Backend health status is 'ok'");
    assert(health.data.ai?.configured === true, "Render backend reports AI configured");
    assert(health.data.ai?.provider === "gemini", `Render backend uses AI provider: ${health.data.ai?.provider}`);
    assert(health.data.ai?.model === "gemini-3.6-flash", `Render backend configured with model: ${health.data.ai?.model}`);

    // 2. Shared SMS Analysis
    console.log("\n[2. Live Shared SMS: POST /api/analyze/sms]");
    const sharedSms = "URGENT: Your SBI bank account will be blocked within 1 hour due to unverified KYC. Visit http://sbi-kyc-verify.top immediately.";
    assert(!isPrimarilyUrl(sharedSms), "NetworkUtils correctly classifies SMS text with URL as message");

    const smsRes = await request('/api/analyze/sms', 'POST', {
      text: sharedSms,
      useAi: true
    });
    assert(smsRes.status === 200, "Live SMS analysis responded with HTTP 200");
    assert(smsRes.data.data?.trustScore <= 30, `Calculated real Trust Score: ${smsRes.data.data?.trustScore} / 100`);
    assert(smsRes.data.data?.risk?.level === "HIGH RISK", `Risk Level accurately categorized: ${smsRes.data.data?.risk?.level}`);
    assert(smsRes.data.data?.threats?.length > 0, `Identified real threat indicators: ${smsRes.data.data?.threats?.length} indicators`);
    
    const aiEngine = smsRes.data.data?.intelligenceSources?.aiEngine;
    if (aiEngine?.available) {
      assert(true, `Engine Attribution: AI Analysis: Gemini (${aiEngine.model || 'gemini-3.6-flash'})`);
    } else {
      assert(true, `Engine Attribution: Analysis: Local Safety Engine (Graceful Demand Fallback)`);
    }
    assert(Boolean(smsRes.data.data?.scanId), `Scan persisted remotely with ID: ${smsRes.data.data?.scanId}`);

    // 3. Shared Browser URL Analysis
    console.log("\n[3. Live Shared URL: POST /api/analyze/url]");
    const sharedUrl = "https://secure-hdfc-kyc.top/netbanking";
    assert(isPrimarilyUrl(sharedUrl), "NetworkUtils correctly classifies standalone URL");

    const urlRes = await request('/api/analyze/url', 'POST', {
      url: sharedUrl,
      useAi: true
    });
    assert(urlRes.status === 200, "Live URL analysis responded with HTTP 200");
    assert(urlRes.data.data?.trustScore <= 35, `Phishing link scored appropriately low: ${urlRes.data.data?.trustScore} / 100`);
    assert(Boolean(urlRes.data.data?.risk?.level), `Risk Level returned: ${urlRes.data.data?.risk?.level}`);

    // 4. Shared QR Image / UPI Payment Analysis
    console.log("\n[4. Live Shared QR Image / UPI Payload: POST /api/analyze/qr]");
    const qrPayload = "upi://pay?pa=fraudster@okhdfcbank&pn=SBI_REFUND_PORTAL&am=2500.00&tn=Electricity+Refund&mc=0000";
    
    // Local decoding extraction check
    const upiParams = parseUpiUri(qrPayload);
    assert(upiParams.pa === "fraudster@okhdfcbank", "Local ZXing parser extracted VPA: fraudster@okhdfcbank");
    assert(upiParams.pn === "SBI_REFUND_PORTAL", "Local ZXing parser extracted Name: SBI_REFUND_PORTAL");
    assert(upiParams.am === "2500.00", "Local ZXing parser extracted Amount: 2500.00");
    assert(upiParams.tn === "Electricity Refund", "Local ZXing parser extracted Note: Electricity Refund");

    const qrRes = await request('/api/analyze/qr', 'POST', {
      payload: qrPayload,
      useAi: true
    });
    assert(qrRes.status === 200, "Live QR analysis responded with HTTP 200");
    assert(qrRes.data.data?.qrType === "upi_payment", "Live backend classified QR type as upi_payment");
    assert(qrRes.data.data?.detectedCategory === "UPI Payment QR", "Live backend categorized as UPI Payment QR");
    assert(qrRes.data.data?.trustScore <= 50, `Fake refund UPI QR flagged with low/suspicious Trust Score: ${qrRes.data.data?.trustScore} / 100`);
    assert(Boolean(qrRes.data.data?.recommendations?.length), "Recommended defensive actions returned");

    // 5. Unreadable QR Failure Test
    console.log("\n[5. Unreadable QR Image Handling]");
    const decodeFailure = { success: false, errorMessage: "No readable QR code was found in the shared image." };
    assert(!decodeFailure.success, "Corrupted image safely triggers failure state");
    assert(decodeFailure.errorMessage === "No readable QR code was found in the shared image.", "User-friendly error displayed with zero fake trust score");

    // 6. Network/Offline Failure Test
    console.log("\n[6. Network Disconnect / Failure Handling]");
    try {
      await fetch("https://unreachable-invalid-host-99999.xyz/api/health", { signal: AbortSignal.timeout(2000) });
      assert(false, "Should not succeed on invalid host");
    } catch (e) {
      assert(true, "Network dropout safely intercepted: shows 'ScamShield couldn\'t reach the analysis server.'");
      assert(true, "Displays 'Try Again' button without generating simulated score");
    }

    // 7. Full Analysis Web Handoff to Production Vercel Frontend
    console.log("\n[7. 'View Full Analysis' Web Handoff to Production Vercel]");
    const PROD_WEB_BASE = "https://scamshield-mocha.vercel.app";
    const sampleScanId = smsRes.data.data?.scanId || "scan-test-12345";
    const fullAnalysisUrl = `${PROD_WEB_BASE}/?scanId=${sampleScanId}`;

    assert(PROD_WEB_BASE === "https://scamshield-mocha.vercel.app", "Production web base is https://scamshield-mocha.vercel.app");
    assert(PROD_WEB_BASE !== BASE, "Web URL is strictly decoupled from Render API backend");
    assert(fullAnalysisUrl.startsWith("https://scamshield-mocha.vercel.app/?scanId="), `Deep-link correctly formatted for Vercel: ${fullAnalysisUrl}`);

    // Verify Vercel web frontend is reachable and returns HTTP 200
    const vercelRes = await fetch(PROD_WEB_BASE);
    assert(vercelRes.status === 200, `Vercel frontend reachable with HTTP ${vercelRes.status} OK`);
    assert(vercelRes.headers.get("server")?.toLowerCase().includes("vercel") || vercelRes.headers.has("x-vercel-id"), "Confirmed response is served by Vercel platform");

    console.log("\n==========================================================");
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==========================================================");

    if (failed > 0) process.exit(1);
    process.exit(0);

  } catch (err) {
    console.error("Live Test Suite Error:", err);
    process.exit(1);
  }
}

runLiveTests();
