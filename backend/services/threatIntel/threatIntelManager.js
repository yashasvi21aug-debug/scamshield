import { GoogleSafeBrowsingProvider } from './GoogleSafeBrowsingProvider.js';
import { VirusTotalProvider } from './VirusTotalProvider.js';
import { UrlhausProvider, PhishTankProvider } from './UrlhausProvider.js';

export class ThreatIntelManager {
  constructor() {
    this.providers = [
      new GoogleSafeBrowsingProvider(),
      new VirusTotalProvider(),
      new UrlhausProvider(),
      new PhishTankProvider()
    ];
  }

  getProvidersStatus() {
    const status = {};
    for (const p of this.providers) {
      status[p.name] = {
        configured: p.isConfigured(),
        available: p.isConfigured()
      };
    }
    return status;
  }

  async queryAll(urlString) {
    const providerStatus = {};
    const externalFindings = [];
    const providerSources = [];

    // Query in parallel only configured providers
    const promises = this.providers.map(async (provider) => {
      if (!provider.isConfigured()) {
        providerStatus[provider.name] = {
          configured: false,
          available: false,
          status: "unconfigured"
        };
        return null;
      }

      try {
        const result = await provider.checkUrl(urlString);
        providerStatus[provider.name] = {
          configured: true,
          available: result.available,
          status: result.status,
          match: result.match,
          details: result.details || null
        };
        providerSources.push(provider.name);

        if (result.match) {
          externalFindings.push({
            name: `Threat Match: ${provider.name}`,
            severity: "Critical",
            explanation: result.details || `Flagged as malicious by ${provider.name} threat intelligence feed.`,
            source: "threat-intel"
          });
        }
        return result;
      } catch (err) {
        providerStatus[provider.name] = {
          configured: true,
          available: false,
          status: "error",
          error: err.message
        };
        return null;
      }
    });

    await Promise.all(promises);

    return {
      externalFindings,
      providerStatus,
      providerSources
    };
  }
}

export const threatIntelManager = new ThreatIntelManager();
