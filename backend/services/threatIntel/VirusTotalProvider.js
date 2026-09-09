import { ThreatIntelProvider } from './ThreatIntelProvider.js';

export class VirusTotalProvider extends ThreatIntelProvider {
  constructor() {
    super('VirusTotal');
    this.apiKey = process.env.VIRUSTOTAL_API_KEY || '';
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
        reason: "VIRUSTOTAL_API_KEY not set in backend environment."
      };
    }

    try {
      // VirusTotal v3 URL ID is base64 without padding
      const urlId = Buffer.from(urlString).toString('base64').replace(/=/g, '');
      const endpoint = `https://www.virustotal.com/api/v3/urls/${urlId}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'x-apikey': this.apiKey,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!res.ok) {
        if (res.status === 404) {
          return {
            source: this.name,
            available: true,
            status: "unseen",
            match: false,
            positives: 0,
            total: 0,
            details: "URL not previously scanned in VirusTotal database."
          };
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const stats = data?.data?.attributes?.last_analysis_stats || {};
      const malicious = stats.malicious || 0;
      const suspicious = stats.suspicious || 0;
      const total = Object.values(stats).reduce((a, b) => a + b, 0);

      const isThreat = (malicious + suspicious) > 0;

      return {
        source: this.name,
        available: true,
        status: isThreat ? "malicious" : "clean",
        match: isThreat,
        positives: malicious + suspicious,
        maliciousCount: malicious,
        suspiciousCount: suspicious,
        total,
        details: isThreat
          ? `Flagged by ${malicious + suspicious} of ${total} security vendors on VirusTotal.`
          : `Clean across ${total} security engines on VirusTotal.`
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
