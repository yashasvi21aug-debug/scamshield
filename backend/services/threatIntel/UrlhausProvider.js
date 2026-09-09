import { ThreatIntelProvider } from './ThreatIntelProvider.js';

export class UrlhausProvider extends ThreatIntelProvider {
  constructor() {
    super('URLhaus');
    this.apiKey = process.env.URLHAUS_API_KEY || '';
  }

  isConfigured() {
    // URLhaus supports public queries even without key, but key gives higher rate limits
    return Boolean(this.apiKey || process.env.ENABLE_PUBLIC_THREAT_INTEL === 'true');
  }

  async checkUrl(urlString) {
    if (!this.isConfigured()) {
      return {
        source: this.name,
        available: false,
        status: "unconfigured",
        match: false,
        reason: "URLHAUS_API_KEY not configured."
      };
    }

    try {
      const endpoint = 'https://urlhaus-api.abuse.ch/v1/url/';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const params = new URLSearchParams();
      params.append('url', urlString);

      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      if (this.apiKey) {
        headers['Auth-Key'] = this.apiKey;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: params,
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const isMalicious = data.query_status === 'ok';

      return {
        source: this.name,
        available: true,
        status: isMalicious ? "malicious" : "clean",
        match: isMalicious,
        threat: data.threat || null,
        urlStatus: data.url_status || null,
        details: isMalicious 
          ? `Identified as active malware distribution site by abuse.ch (${data.threat || 'Malware'}).`
          : "No malicious malware distribution reports on URLhaus."
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

export class PhishTankProvider extends ThreatIntelProvider {
  constructor() {
    super('PhishTank');
    this.apiKey = process.env.PHISHTANK_API_KEY || '';
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
        reason: "PHISHTANK_API_KEY not set in backend environment."
      };
    }

    try {
      const endpoint = 'https://checkurl.phishtank.com/checkurl/';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const params = new URLSearchParams();
      params.append('url', urlString);
      params.append('format', 'json');
      params.append('app_key', this.apiKey);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const inDatabase = data.results?.in_database;
      const isPhish = data.results?.valid;

      return {
        source: this.name,
        available: true,
        status: isPhish ? "malicious" : (inDatabase ? "suspicious" : "clean"),
        match: Boolean(isPhish),
        details: isPhish ? "Verified phishing site on PhishTank." : "Not flagged in PhishTank registry."
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
