// test-simulator.js - Comprehensive Test Suite for Scam Simulator Feature
import http from 'http';

const BASE_URL = 'http://localhost:5000';
const TEST_SESSION_ID = `sim-test-session-${Date.now()}`;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': TEST_SESSION_ID,
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log(' SCAM SIMULATOR COMPREHENSIVE VERIFICATION SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    console.log('\n[1] Checking Backend Health...');
    const healthRes = await request('/api/health');
    assert(healthRes.status === 200, 'Backend is alive and responding with 200');
    assert(healthRes.body.status === 'ok', 'Health status is ok');

    // 2. GET /api/simulator/scenarios
    console.log('\n[2] Testing Scenario Retrieval...');
    const scenariosRes = await request('/api/simulator/scenarios');
    assert(scenariosRes.status === 200, 'GET /api/simulator/scenarios returns 200');
    assert(scenariosRes.body.success === true, 'Response indicates success: true');
    assert(Array.isArray(scenariosRes.body.data), 'Returns an array of scenarios');
    assert(scenariosRes.body.data.length >= 8, `Returned ${scenariosRes.body.data.length} scenarios (expected at least 8)`);

    // Verify scrubbing - answers/scores must not leak to client
    const firstScen = scenariosRes.body.data[0];
    assert(!firstScen.options || !firstScen.options.some(o => o.score !== undefined), 'Scenarios list does NOT leak scoring/answers');

    // Test difficulty filter
    const beginnerRes = await request('/api/simulator/scenarios?difficulty=beginner');
    assert(beginnerRes.status === 200, 'Difficulty filter returns 200');
    assert(beginnerRes.body.data.every(s => s.difficulty === 'Beginner'), 'All returned scenarios are Beginner');

    // 3. GET /api/simulator/scenarios/:id
    console.log('\n[3] Testing Single Scenario Retrieval...');
    const singleRes = await request(`/api/simulator/scenarios/${firstScen.id}`);
    assert(singleRes.status === 200, `GET /api/simulator/scenarios/${firstScen.id} returns 200`);
    assert(singleRes.body.data.id === firstScen.id, 'Scenario ID matches requested ID');
    assert(singleRes.body.data.simulatedMessage, 'Contains simulated alert message');

    // 4. POST /api/simulator/evaluate (Safe Decision)
    console.log('\n[4] Testing Decision Evaluation - Safe Action...');
    const safeEvalRes = await request('/api/simulator/evaluate', {
      method: 'POST',
      body: {
        scenarioId: 'fake-bank-kyc',
        actionId: 'D', // "Do NOT click the link. Log into your bank's verified mobile app..."
        stage: 1,
        isDemo: false,
        useAi: true
      }
    });

    assert(safeEvalRes.status === 200, 'POST /api/simulator/evaluate returns 200');
    assert(safeEvalRes.body.data.isSafe === true, 'Decision correctly evaluated as SAFE');
    assert(safeEvalRes.body.data.score === 100, 'Awarded 100 points for safe decision');
    assert(safeEvalRes.body.data.feedback, 'Contains feedback object');
    assert(typeof safeEvalRes.body.data.feedback.explanation === 'string', 'Contains educational explanation');
    assert(typeof safeEvalRes.body.data.feedback.lesson === 'string', 'Contains key lesson');

    // 5. POST /api/simulator/evaluate (Risky Decision)
    console.log('\n[5] Testing Decision Evaluation - Risky Action...');
    const riskyEvalRes = await request('/api/simulator/evaluate', {
      method: 'POST',
      body: {
        scenarioId: 'fake-bank-kyc',
        actionId: 'A', // "Click the link immediately..."
        stage: 1,
        isDemo: false,
        useAi: true
      }
    });

    assert(riskyEvalRes.status === 200, 'POST /api/simulator/evaluate returns 200');
    assert(riskyEvalRes.body.data.isSafe === false, 'Decision correctly evaluated as RISKY');
    assert(riskyEvalRes.body.data.score === 0, 'Awarded 0 points for high risk action');
    assert(riskyEvalRes.body.data.missedSignals && riskyEvalRes.body.data.missedSignals.length > 0, 'Lists missed warning signals');

    // 6. Multi-Step Chain Progression
    console.log('\n[6] Testing Multi-Step Chain Scenario (UPI Refund)...');
    const stage1Res = await request('/api/simulator/evaluate', {
      method: 'POST',
      body: {
        scenarioId: 'fake-refund-upi',
        actionId: 'B',
        stage: 1,
        isDemo: false,
        useAi: true
      }
    });
    assert(stage1Res.status === 200, 'Multi-stage Stage 1 evaluated successfully');
    assert(stage1Res.body.data.isSafe === true, 'Stage 1 safe action recognized');

    const stage2Res = await request('/api/simulator/evaluate', {
      method: 'POST',
      body: {
        scenarioId: 'fake-refund-upi',
        actionId: 'B', // "Decline and block the request immediately..."
        stage: 2,
        isDemo: false,
        useAi: true
      }
    });
    assert(stage2Res.status === 200, 'Multi-stage Stage 2 evaluated successfully');
    assert(stage2Res.body.data.isSafe === true, 'Stage 2 safe action recognized');

    // 7. GET /api/simulator/progress
    console.log('\n[7] Testing Progress Tracking & Awareness Score...');
    const progressRes = await request('/api/simulator/progress');
    assert(progressRes.status === 200, 'GET /api/simulator/progress returns 200');
    assert(progressRes.body.data.awarenessScore !== undefined, `Awareness Score computed: ${progressRes.body.data.awarenessScore}/100`);
    assert(progressRes.body.data.totalAttempts >= 3, `Recorded ${progressRes.body.data.totalAttempts} attempts`);
    assert(progressRes.body.data.safeDecisions !== undefined, 'Tracks safe decisions count');
    assert(progressRes.body.data.riskyDecisions !== undefined, 'Tracks risky decisions count');

    // 8. Demo Mode Isolation
    console.log('\n[8] Testing Demo Mode Isolation...');
    await request('/api/simulator/evaluate', {
      method: 'POST',
      body: {
        scenarioId: 'fake-electricity-bill',
        actionId: 'B',
        stage: 1,
        isDemo: true,
        useAi: false
      }
    });

    const demoProgress = await request('/api/simulator/progress?includeDemo=true');
    assert(demoProgress.status === 200, 'Fetched demo progress');
    assert(demoProgress.body.data.totalAttempts >= 1, 'Demo attempt recorded under demo filter');

    // 9. Dashboard Integration
    console.log('\n[9] Checking Dashboard Stats Integration...');
    const dashRes = await request('/api/dashboard/stats');
    assert(dashRes.status === 200, 'GET /api/dashboard/stats returns 200');
    assert(dashRes.body.data.trainingSummary !== undefined, 'Dashboard stats includes trainingSummary');
    assert(typeof dashRes.body.data.trainingSummary.scenariosCompleted === 'number', 'trainingSummary has scenariosCompleted');
    assert(typeof dashRes.body.data.trainingSummary.averageScore === 'number', 'trainingSummary has averageScore');

  } catch (err) {
    console.error('Test execution exception:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
