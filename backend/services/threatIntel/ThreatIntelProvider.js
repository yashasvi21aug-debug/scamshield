// Abstract Base Class for Threat Intelligence Providers

export class ThreatIntelProvider {
  constructor(name) {
    this.name = name;
  }

  isConfigured() {
    return false;
  }

  async checkUrl(urlString) {
    return {
      source: this.name,
      available: false,
      status: "unconfigured",
      match: false,
      reason: "API credentials not configured in environment."
    };
  }
}
