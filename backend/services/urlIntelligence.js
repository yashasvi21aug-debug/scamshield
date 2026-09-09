// Safe static URL intelligence analyzer - NEVER executes or browses targets

import { SUSPICIOUS_TLDS, SHORTENER_DOMAINS, KNOWN_BRAND_DOMAINS } from '../utils/scamPatterns.js';

export function analyzeUrl(urlString) {
  const threats = [];
  let totalDeduction = 0;

  // Clean and parse URL
  let parsed;
  let normalized = urlString.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'http://' + normalized;
  }

  try {
    parsed = new URL(normalized);
  } catch (err) {
    return {
      isValid: false,
      error: "Malformed or unparseable URL string",
      trustScore: 20,
      risk: { level: "HIGH RISK", color: "red" },
      threats: [{
        title: "Malformed URL Structure",
        severity: "High",
        explanation: "The provided string cannot be parsed as a valid web resource URL."
      }],
      recommendations: []
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const protocol = parsed.protocol.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();
  const search = parsed.search.toLowerCase();
  const isHttps = protocol === 'https:';

  // 1. Insecure HTTP check
  if (!isHttps) {
    threats.push({
      title: "Insecure Plaintext Protocol (HTTP)",
      severity: "Medium",
      icon: "ShieldAlert",
      explanation: "Traffic is unencrypted, exposing login credentials and data to network eavesdropping or man-in-the-middle tampering."
    });
    totalDeduction += 15;
  }

  // 2. IP Address as Hostname check
  const isIpv4 = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
  if (isIpv4) {
    threats.push({
      title: "Direct IP Address Hostname",
      severity: "Critical",
      icon: "Binary",
      explanation: "Legitimate institutions and brands use registered domain names. Direct IP addresses are overwhelmingly used in phishing relays and command-and-control drops."
    });
    totalDeduction += 45;
  }

  // 3. URL Shortener detection
  const isShortener = SHORTENER_DOMAINS.some(shortener => hostname === shortener || hostname.endsWith('.' + shortener));
  if (isShortener) {
    threats.push({
      title: "URL Shortening Obfuscation",
      severity: "High",
      icon: "ExternalLink",
      explanation: "Shortened links intentionally mask the actual final destination, domain identity, and security profile of the target page."
    });
    totalDeduction += 30;
  }

  // 4. Suspicious TLD detection
  const matchedTld = SUSPICIOUS_TLDS.find(tld => hostname.endsWith(tld));
  if (matchedTld) {
    threats.push({
      title: `High-Risk TLD Extension (${matchedTld})`,
      severity: "High",
      icon: "AlertTriangle",
      explanation: `Top-level domains such as ${matchedTld} have a statistically disproportionate rate of abuse in throwaway phishing campaigns due to minimal registrar scrutiny.`
    });
    totalDeduction += 35;
  }

  // 5. Brand Lookalike / Typosquatting / Homoglyph check
  let brandSpoofed = null;
  for (const [brand, legitimateDomains] of Object.entries(KNOWN_BRAND_DOMAINS)) {
    const brandRegex = new RegExp(`(^|[-._])${brand}([-._]|$)`, 'i');
    const isBrandMentioned = brandRegex.test(hostname) || hostname.includes(brand);
    const isOfficial = legitimateDomains.some(legit => hostname === legit || hostname.endsWith('.' + legit));

    if (isBrandMentioned && !isOfficial) {
      brandSpoofed = brand.toUpperCase();
      threats.push({
        title: `Suspected Brand Impersonation (${brandSpoofed})`,
        severity: "Critical",
        icon: "UserX",
        explanation: `The domain references '${brandSpoofed}' but does NOT belong to official verified infrastructure (${legitimateDomains.join(', ')}). This is a classic credential-stealing clone tactic.`
      });
      totalDeduction += 50;
      break;
    }
  }

  // 6. Excessive subdomains check
  const hostParts = hostname.split('.');
  if (hostParts.length > 4) {
    threats.push({
      title: "Deeply Nested Subdomain Chain",
      severity: "Medium",
      icon: "Layers",
      explanation: `Contains ${hostParts.length} domain levels. Phishers frequently stack subdomains (e.g. secure.bank.auth.scamdomain.com) to visually deceive mobile browser address bars.`
    });
    totalDeduction += 20;
  }

  // 7. Suspicious sensitive keywords in path/search
  const sensitivePathKeywords = ['login', 'signin', 'verify', 'update', 'kyc', 'secure', 'bank', 'account', 'wallet', 'pan-card', 'aadhaar', 'auth', 'claim', 'refund'];
  const fullPathAndQuery = pathname + search;
  const matchedKeywords = sensitivePathKeywords.filter(kw => fullPathAndQuery.includes(kw));

  if (matchedKeywords.length > 0 && !threats.some(t => t.title.includes("Brand Impersonation"))) {
    threats.push({
      title: "Sensitive Action Indicators in Path",
      severity: "Medium",
      icon: "KeyRound",
      explanation: `Target path requests sensitive credential actions (${matchedKeywords.slice(0, 3).join(', ')}) on an unvetted third-party domain.`
    });
    totalDeduction += 20;
  }

  // Calculate URL Intelligence breakdown meters
  let domainReputation = Math.max(10, 95 - totalDeduction);
  let phishingIndicators = Math.min(95, (threats.length * 28));
  let domainSimilarityRisk = brandSpoofed ? 92 : (matchedTld ? 65 : (isShortener ? 45 : 12));
  let communityReportRisk = threats.length > 2 ? 88 : (threats.length > 0 ? 55 : 15);

  return {
    isValid: true,
    url: normalized,
    protocol: parsed.protocol.replace(':', ''),
    hostname,
    pathname: parsed.pathname,
    isHttps,
    isIpv4,
    isShortener,
    matchedTld: matchedTld || "standard",
    brandSpoofed,
    totalDeduction,
    threats,
    breakdownMeters: {
      domainReputation: Math.round(domainReputation),
      phishingIndicators: Math.round(phishingIndicators),
      domainSimilarity: Math.round(domainSimilarityRisk),
      communityThreats: Math.round(communityReportRisk)
    }
  };
}
