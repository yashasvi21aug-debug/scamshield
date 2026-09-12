// Configurable Real Server-Side AI Provider Service

export class AIService {
  get provider() {
    return process.env.AI_PROVIDER || 'openai';
  }

  get apiKey() {
    return process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '';
  }

  get model() {
    if (process.env.AI_MODEL) return process.env.AI_MODEL;
    return this.provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini';
  }

  get baseUrl() {
    if (process.env.AI_BASE_URL) return process.env.AI_BASE_URL;
    return this.provider === 'gemini' 
      ? 'https://generativelanguage.googleapis.com/v1beta' 
      : 'https://api.openai.com/v1';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  getStatus() {
    return {
      configured: this.isConfigured(),
      provider: this.isConfigured() ? this.provider : 'none',
      model: this.isConfigured() ? this.model : 'none'
    };
  }

  async analyzeContent(type, content) {
    if (!this.isConfigured()) {
      return {
        available: false,
        configured: false,
        reason: "AI_API_KEY not configured in backend environment."
      };
    }

    const systemPrompt = `You are FraudLens AI, an elite cybersecurity behavioral fraud analysis engine.
Analyze the following ${type} input for:
1. Social engineering manipulation (panic, false deadlines, artificial urgency)
2. Brand or institutional impersonation (banks, postal services, police, tax agencies)
3. Credential or identity harvesting (OTP, PIN, KYC, passwords, Aadhaar, PAN)
4. Deceptive financial lures (unsolicited refunds, lottery, high-yield tasks)
5. Dangerous URL or QR contexts

Return ONLY valid JSON matching this exact structure:
{
  "riskAssessment": "<high|suspicious|caution|safe>",
  "confidence": <number between 0.0 and 1.0>,
  "indicators": [
    {
      "name": "<concise threat indicator name>",
      "severity": "<Critical|High|Medium|Low>",
      "explanation": "<1-2 sentence evidence-based reason why this indicates risk>"
    }
  ],
  "recommendations": [
    "<concise imperative safety action>"
  ]
}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 35000);

      let rawResponseText = '';
      let usedModel = this.model;

      if (this.provider === 'gemini') {
        const fetchGemini = async (modelName) => {
          const url = `${this.baseUrl}/models/${modelName}:generateContent?key=${this.apiKey}`;
          return await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nContent to analyze:\n${content}` }]
                }
              ],
              generationConfig: { response_mime_type: "application/json" }
            })
          });
        };

        let res = await fetchGemini(this.model);
        if (res.status === 503 || res.status === 429) {
          usedModel = 'gemini-3.5-flash';
          res = await fetchGemini('gemini-3.5-flash');
        }
        if (res.status === 503 || res.status === 429) {
          usedModel = 'gemini-3.1-flash-lite';
          res = await fetchGemini('gemini-3.1-flash-lite');
        }
        clearTimeout(timeout);
        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          throw new Error(`Gemini API HTTP ${res.status}: ${errBody}`);
        }
        const data = await res.json();
        rawResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      } else {
        // OpenAI or compatible format
        const endpoint = `${this.baseUrl}/chat/completions`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Input type: ${type}\nContent to inspect:\n${content}` }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
          })
        });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`AI Provider HTTP ${res.status}`);
        const data = await res.json();
        rawResponseText = data.choices?.[0]?.message?.content;
      }

      let cleaned = (rawResponseText || '').trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');

      const parsed = JSON.parse(cleaned);
      const validated = this.validateAiResponse(parsed);

      return {
        available: true,
        configured: true,
        provider: this.provider,
        model: this.provider === 'gemini' ? usedModel : this.model,
        ...validated
      };

    } catch (err) {
      console.warn(`[AI Analysis Query Notice] ${err.message}. Relying on local and threat intelligence engines.`);
      return {
        available: false,
        configured: true,
        error: err.message
      };
    }
  }

  async askAdvisor(message, history = []) {
    if (!this.isConfigured()) {
      return {
        available: false,
        configured: false,
        reason: "AI_API_KEY not configured."
      };
    }

    const systemPrompt = `You are FraudLens AI Advisor, an expert cybersecurity specialist.
Provide concise, protective, and actionable fraud prevention advice.
Never advise opening suspicious links, disclosing credentials, or paying money.
Format clearly with Markdown bullet points and bold highlights.
Direct users to official cybercrime helplines (such as 1930 in India or local authorities) if financial fraud has occurred.`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 35000);

      let reply = '';
      let usedModel = this.model;

      if (this.provider === 'gemini') {
        const contents = [];
        for (const h of history.slice(-5)) {
          const role = (h.role === 'assistant' || h.role === 'model') ? 'model' : 'user';
          contents.push({
            role,
            parts: [{ text: h.content || h.text || '' }]
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Question:\n${message}` }]
        });

        const fetchGemini = async (modelName) => {
          const url = `${this.baseUrl}/models/${modelName}:generateContent?key=${this.apiKey}`;
          return await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents,
              generationConfig: { temperature: 0.2 }
            })
          });
        };

        let res = await fetchGemini(this.model);
        if (res.status === 503 || res.status === 429) {
          usedModel = 'gemini-3.5-flash';
          res = await fetchGemini('gemini-3.5-flash');
        }
        if (res.status === 503 || res.status === 429) {
          usedModel = 'gemini-3.1-flash-lite';
          res = await fetchGemini('gemini-3.1-flash-lite');
        }
        clearTimeout(timeout);
        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          throw new Error(`Gemini API HTTP ${res.status}: ${errBody}`);
        }
        const data = await res.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      } else {
        // OpenAI or compatible format
        const endpoint = `${this.baseUrl}/chat/completions`;
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-5),
          { role: 'user', content: message }
        ];

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: this.model,
            messages,
            temperature: 0.2
          })
        });

        clearTimeout(timeout);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        reply = data.choices?.[0]?.message?.content;
      }

      return {
        available: Boolean(reply),
        configured: true,
        reply,
        provider: this.provider,
        model: this.provider === 'gemini' ? usedModel : this.model
      };
    } catch (err) {
      console.warn(`[AI Advisor Notice] ${err.message}. Relying on local safety advisor.`);
      return {
        available: false,
        configured: true,
        error: err.message
      };
    }
  }

  validateAiResponse(obj) {
    const validRisks = ['high', 'suspicious', 'caution', 'safe'];
    const riskAssessment = validRisks.includes((obj.riskAssessment || '').toLowerCase())
      ? obj.riskAssessment.toLowerCase()
      : 'suspicious';

    const confidence = typeof obj.confidence === 'number' && obj.confidence >= 0 && obj.confidence <= 1
      ? Math.round(obj.confidence * 100) / 100
      : 0.8;

    const indicators = Array.isArray(obj.indicators)
      ? obj.indicators.map(ind => ({
          name: String(ind.name || 'AI Behavioral Flag'),
          severity: ['Critical', 'High', 'Medium', 'Low'].includes(ind.severity) ? ind.severity : 'Medium',
          explanation: String(ind.explanation || 'Semantic threat anomaly detected by AI evaluation.'),
          source: 'ai-semantic'
        }))
      : [];

    const recommendations = Array.isArray(obj.recommendations)
      ? obj.recommendations.map(r => String(r))
      : [];

    return {
      riskAssessment,
      confidence,
      indicators,
      recommendations
    };
  }

  async generateSimulatorFeedback({
    scenarioTitle,
    category,
    simulatedMessage,
    chosenActionText,
    isSafe,
    score,
    redFlags = [],
    missedSignals = [],
    safeAction,
    lesson
  }) {
    const deterministicResult = {
      decision: isSafe ? "safe" : "risky",
      score,
      explanation: isSafe
        ? `Excellent decision. You safely recognized this simulated ${category} threat and avoided the trap.`
        : `Risky decision. Selecting this action would expose you to the deceptive tactics in this simulated ${category} scenario.`,
      missedSignals: missedSignals,
      lesson: lesson || "Always verify communication independently through verified official channels.",
      recommendedAction: safeAction || "Do not interact with unsolicited links or requests. Verify via official apps or portals.",
      engine: "Deterministic Rule Engine (Offline Safe)"
    };

    if (!this.isConfigured()) {
      return deterministicResult;
    }

    const systemPrompt = `You are FraudLens AI Cyber Coach, providing personalized cybersecurity training feedback.
Analyze the user's decision in this simulated training scenario.
The scenario was: "${scenarioTitle}" (${category}).
Simulated scam message: "${simulatedMessage}".
User's chosen action: "${chosenActionText}".
Authoritative correctness: ${isSafe ? 'SAFE' : 'RISKY'} (Score: ${score}/100).
Known red flags in scenario: ${JSON.stringify(redFlags)}.
Specific missed signals: ${JSON.stringify(missedSignals)}.
Target safe action: "${safeAction}".
Core lesson: "${lesson}".

Provide engaging, respectful, coaching-oriented feedback in this exact JSON structure:
{
  "decision": "${isSafe ? 'safe' : 'risky'}",
  "score": ${score},
  "explanation": "<2-3 sentence personalized evaluation of why this action was safe or risky in this specific situation>",
  "missedSignals": ${JSON.stringify(missedSignals)},
  "lesson": "<1-2 sentence memorable cybersecurity takeaway>",
  "recommendedAction": "<1 actionable defensive step for the future>"
}
Return ONLY valid JSON matching this schema.`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      let responseText = '';
      let usedModel = this.model;

      if (this.provider === 'gemini') {
        const fetchGemini = async (modelName) => {
          const url = `${this.baseUrl}/models/${modelName}:generateContent?key=${this.apiKey}`;
          return await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
              generationConfig: { response_mime_type: "application/json", temperature: 0.2 }
            })
          });
        };

        let res = await fetchGemini(this.model);
        if (res.status === 503 || res.status === 429) {
          usedModel = 'gemini-3.5-flash';
          res = await fetchGemini('gemini-3.5-flash');
        }
        if (res.status === 503 || res.status === 429) {
          usedModel = 'gemini-3.1-flash-lite';
          res = await fetchGemini('gemini-3.1-flash-lite');
        }

        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } else {
        const endpoint = `${this.baseUrl}/chat/completions`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: this.model,
            messages: [{ role: 'user', content: systemPrompt }],
            response_format: { type: "json_object" },
            temperature: 0.2
          })
        });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          responseText = data.choices?.[0]?.message?.content || '';
        }
      }

      if (responseText) {
        const parsed = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
        return {
          decision: isSafe ? "safe" : "risky",
          score,
          explanation: parsed.explanation || deterministicResult.explanation,
          missedSignals: Array.isArray(parsed.missedSignals) && parsed.missedSignals.length > 0 ? parsed.missedSignals : missedSignals,
          lesson: parsed.lesson || deterministicResult.lesson,
          recommendedAction: parsed.recommendedAction || deterministicResult.recommendedAction,
          engine: `AI Personalized Feedback: Gemini (${usedModel})`
        };
      }
    } catch (err) {
      console.warn(`[Simulator AI Feedback Notice] ${err.message}. Falling back to deterministic lesson.`);
    }

    return deterministicResult;
  }
}

export const aiService = new AIService();
