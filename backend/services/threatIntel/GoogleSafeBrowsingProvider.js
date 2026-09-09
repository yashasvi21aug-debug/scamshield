import { ThreatIntelProvider } from './ThreatIntelProvider.js';

export class GoogleSafeBrowsingProvider extends ThreatIntelProvider {
  constructor() {
    super('Google Safe Browsing');
    this.apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY || '';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async checkUrl(urlString) {
    if (!this.isConfigured()) {
      return {
        source: this.name,
        available: false,
        status: "unconfigured",
        match: false,
        reason: "GOOGLE_SAFE_BROWSING_API_KEY not set in backend environment."
      };
    }

    try {
      const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${this.apiKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          client: { clientId: "scamshield-ai", clientVersion: "1.0.0" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: urlString }]
          }
        })
      });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const matches = data.matches || [];
      const hasMatch = matches.length > 0;

      return {
        source: this.name,
        available: true,
        status: hasMatch ? "malicious" : "clean",
        match: hasMatch,
        threatTypes: matches.map(m => m.threatType),
        details: hasMatch ? `Flagged as ${matches[0].threatType} by Google Safe Browsing.` : "No active threats listed in Google Safe Browsing database."
      };
    } catch (err) {
      return {
        source: this.name,
        available: false,
        status: "error",
        match: false,
        error: err.message
      };
    }
  }
}
