// test-adaptive-simulator.js - Comprehensive Verification for Adaptive Personalized Training Engine
import http from 'http';

const BASE_URL = 'http://localhost:5000';
const ADAPTIVE_SESSION_ID = `adaptive-test-session-${Date.now()}`;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': ADAPTIVE_SESSION_ID,
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

async function runAdaptiveTests() {
  console.log('================================================================');
  console.log(' SCAM SIMULATOR: ADAPTIVE PERSONALIZED TRAINING ENGINE VERIFIER');
  console.log('================================================================');

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
    // 1. Taxonomy & Public Scenario Scrubbing
    console.log('\n[1] Verifying 11-Concept Taxonomy & Client-Side Scrubbing...');
    const scensRes = await request('/api/simulator/scenarios');
    assert(scensRes.status === 200, 'GET /api/simulator/scenarios returns 200');
    assert(Array.isArray(scensRes.body.data), 'Scenarios returned as array');

    const expectedConcepts = [
      'urgency',
      'authority_impersonation',
      'suspicious_link',
      'payment_pressure',
      'credential_request',
      'reward_manipulation',
      'fear',
      'social_pressure',
      'identity_verification',
      'independent_verification',
      'payment_safety'
    ];

    const allConceptsInScenarios = new Set();
    scensRes.body.data.forEach(s => {
      if (Array.isArray(s.concepts)) {
        s.concepts.forEach(c => allConceptsInScenarios.add(c));
      }
    });

    assert(allConceptsInScenarios.size >= 8, `Scenarios cover diverse taxonomy concepts (${allConceptsInScenarios.size} unique concepts found)`);

    // Ensure security scrubbing: no correct answers, scores, or missed concepts exposed
    let leakedSecrets = false;
    for (const scen of scensRes.body.data) {
      if (scen.options) {
        for (const opt of scen.options) {
          if (opt.score !== undefined || opt.isCorrect !== undefined || opt.missedConcepts !== undefined) {
            leakedSecrets = true;
          }
        }
      }
    }
    assert(!leakedSecrets, 'Scenarios endpoint strictly scrubs answer scores, isCorrect flags, and missedConcepts');

    // 2. Identify Weak Concept From Mistake
    console.log('\n[2] Triggering Weak Concept Identification via Risky Decision...');
    // In fake-bank-kyc, Action A clicks link due to urgency and authority impersonation
    const mistakeRes = await request('/api/simulator/evaluate', {
      method: 'POST',
      body: {
        scenarioId: 'fake-bank-kyc',
        actionId: 'A',
        stage: 1,
        isDemo: false,
        useAi: true
      }
    });

    assert(mistakeRes.status === 200, 'Risky decision evaluated with 200');
    assert(mistakeRes.body.data.isSafe === false, 'Decision evaluated as unsafe');
    assert(Array.isArray(mistakeRes.body.data.conceptsMissed), 'Evaluation returns conceptsMissed array');
    assert(mistakeRes.body.data.conceptsMissed.includes('urgency') || mistakeRes.body.data.conceptsMissed.includes('authority_impersonation'), 'Identified missed concepts from decision');
    assert(mistakeRes.body.data.adaptiveTraining !== undefined, 'Response includes adaptiveTraining telemetry');
    assert(mistakeRes.body.data.trainingInsight !== undefined, 'Response includes personalized training insight');
    console.log(`      Insight: "${mistakeRes.body.data.trainingInsight}"`);

    // 3. Verify Adaptive Recommendation Targets Weak Concept
    console.log('\n[3] Verifying Adaptive Recommendation Targets Demonstrated Weakness...');
    const progressRes1 = await request('/api/simulator/progress');
    assert(progressRes1.status === 200, 'GET /api/simulator/progress returns 200');
    const adaptive1 = progressRes1.body.data.adaptiveTraining;
    assert(adaptive1 !== undefined, 'Progress contains adaptiveTraining telemetry');
    assert(adaptive1.focusConcept === 'urgency' || adaptive1.focusConcept === 'authority_impersonation' || adaptive1.focusConcept === 'suspicious_link', `Focus concept correctly identified: ${adaptive1.focusConcept} (${adaptive1.focusLabel})`);
    assert(typeof adaptive1.recommendedScenarioId === 'string', `Targeted scenario recommended: ${adaptive1.recommendedScenarioId} ("${adaptive1.recommendedScenarioTitle}")`);
    assert(adaptive1.recommendedDifficulty === 'Beginner', 'Recommended difficulty maintains Beginner while struggling');

    // 4. Verify Concept Mastery Improvement on Safe Decision
    console.log('\n[4] Reinforcing Weak Concept with Safe Decision...');
    const safeRes1 = await request('/api/simulator/evaluate', {
      method: 'POST',
      body: {
        scenarioId: 'fake-bank-kyc',
        actionId: 'D', // Safe: log into verified app
        stage: 1,
        isDemo: false,
        useAi: true
      }
    });

    assert(safeRes1.status === 200, 'Safe decision evaluated with 200');
    assert(safeRes1.body.data.isSafe === true, 'Decision evaluated as safe');

    const progressRes2 = await request('/api/simulator/progress');
    const conceptUrgency = progressRes2.body.data.conceptMastery.find(c => c.concept === 'urgency');
    assert(conceptUrgency !== undefined, 'Urgency concept exists in conceptMastery');
    assert(conceptUrgency.tested >= 2, `Urgency concept tested count incremented (${conceptUrgency.tested})`);
    assert(conceptUrgency.safe >= 1, `Safe decisions recorded for urgency (${conceptUrgency.safe})`);
    assert(conceptUrgency.mastery > 0, `Concept mastery improved to ${conceptUrgency.mastery}%`);

    // 5. Verify Non-Punitive Difficulty Progression
    console.log('\n[5] Testing Non-Punitive Difficulty Progression (Beginner -> Intermediate)...');
    // Complete 2 more safe decisions across scenarios to reach >= 70% average and 4 attempts
    const rElectricity = await request('/api/simulator/evaluate', {
      method: 'POST',
      body: {
        scenarioId: 'fake-electricity-bill',
        actionId: 'B', // Safe: check physical bill or official portal
        stage: 1,
        isDemo: false,
        useAi: true
      }
    });
    assert(rElectricity.status === 200 && rElectricity.body.data.isSafe === true, 'Electricity scenario safe decision evaluated');

    const rPrize = await request('/api/simulator/evaluate', {
      method: 'POST',
      body: {
        scenarioId: 'fake-prize-reward',
        actionId: 'B', // Safe: check official lottery rules & reject tax upfront
        stage: 1,
        isDemo: false,
        useAi: true
      }
    });
    assert(rPrize.status === 200 && rPrize.body.data.isSafe === true, 'Prize scenario safe decision evaluated');

    const progressRes3 = await request('/api/simulator/progress');
    const adaptive3 = progressRes3.body.data.adaptiveTraining;
    assert(progressRes3.body.data.totalAttempts >= 4, `Recorded ${progressRes3.body.data.totalAttempts} total attempts`);
    assert(progressRes3.body.data.awarenessScore >= 70, `Awareness score improved to ${progressRes3.body.data.awarenessScore}%`);
    assert(adaptive3.recommendedDifficulty === 'Intermediate', `Difficulty progressed safely to: ${adaptive3.recommendedDifficulty}`);

    // 6. Complete 3-Stage Attack Chain (UPI Refund)
    console.log('\n[6] Testing Full 3-Stage Attack Chain Defense...');
    const s1 = await request('/api/simulator/evaluate', {
      method: 'POST',
      body: {
        scenarioId: 'fake-refund-upi',
        actionId: 'B', // Stage 1 Safe
        stage: 1,
        isDemo: false,
        useAi: true
      }
    });
    assert(s1.body.data.isSafe === true && s1.body.data.hasNextStage === true, 'Stage 1 (Initial Hook): Successfully defended, advances to Stage 2');

    const s2 = await request('/api/simulator/evaluate', {
      method: 'POST',
      body: {
        scenarioId: 'fake-refund-upi',
        actionId: 'B', // Stage 2 Safe: Decline UPI collect
        stage: 2,
        isDemo: false,
        useAi: true
      }
    });
    assert(s2.body.data.isSafe === true && s2.body.data.hasNextStage === true, 'Stage 2 (Reverse PIN Collect Trap): Successfully defended, advances to Stage 3');

    const s3 = await request('/api/simulator/evaluate', {
      method: 'POST',
      body: {
        scenarioId: 'fake-refund-upi',
        actionId: 'B', // Stage 3 Safe: Disconnect & report official cyber cell
        stage: 3,
        isDemo: false,
        useAi: true
      }
    });
    assert(s3.body.data.isSafe === true && s3.body.data.hasNextStage === false, 'Stage 3 (Cyber Police Secondary Recovery Threat): Successfully defended, attack chain eliminated');

    // 7. Demo Mode Isolation
    console.log('\n[7] Testing Demo Mode Isolation...');
    const beforeDemo = await request('/api/simulator/progress?includeDemo=false');
    const nonDemoCountBefore = beforeDemo.body.data.totalAttempts;

    const demoEvalRes = await request('/api/simulator/evaluate', {
      method: 'POST',
      body: {
        scenarioId: 'fake-courier-customs',
        actionId: 'B',
        stage: 1,
        isDemo: true,
        useAi: false
      }
    });
    assert(demoEvalRes.status === 200, 'Demo evaluation processed successfully');

    const afterDemoNormal = await request('/api/simulator/progress?includeDemo=false');
    const afterDemoInclude = await request('/api/simulator/progress?includeDemo=true');

    assert(afterDemoNormal.body.data.totalAttempts === nonDemoCountBefore, 'Normal progress completely ignores isDemo: true attempts');
    assert(afterDemoInclude.body.data.totalAttempts > nonDemoCountBefore, 'includeDemo=true includes sandbox attempts');

    // 8. Dashboard Telemetry & Isolation
    console.log('\n[8] Verifying Dashboard Telemetry & Metric Isolation...');
    const dashRes = await request('/api/dashboard/stats');
    assert(dashRes.status === 200, 'GET /api/dashboard/stats returns 200');
    const tSummary = dashRes.body.data.trainingSummary;
    assert(tSummary !== undefined, 'Dashboard stats includes trainingSummary');
    assert(typeof tSummary.currentFocus === 'string', `Dashboard displays currentFocus: "${tSummary.currentFocus}"`);
    assert(typeof tSummary.conceptProgress === 'number', `Dashboard displays conceptProgress: ${tSummary.conceptProgress}%`);
    assert(typeof tSummary.recommendedChallenge === 'string', `Dashboard displays recommendedChallenge: "${tSummary.recommendedChallenge}"`);
    assert(dashRes.body.data.totalScans !== undefined, 'Real scan metrics remain intact');

  } catch (err) {
    console.error('Adaptive test error:', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(` ADAPTIVE ENGINE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runAdaptiveTests();
