// Safe URL Validation and SSRF Protection

import dns from 'dns/promises';
import net from 'net';

const PRIVATE_IP_RANGES = [
  // 127.0.0.0/8 (Loopback)
  { start: ipToLong('127.0.0.0'), end: ipToLong('127.255.255.255') },
  // 10.0.0.0/8 (Private Network)
  { start: ipToLong('10.0.0.0'), end: ipToLong('10.255.255.255') },
  // 172.16.0.0/12 (Private Network)
  { start: ipToLong('172.16.0.0'), end: ipToLong('172.31.255.255') },
  // 192.168.0.0/16 (Private Network)
  { start: ipToLong('192.168.0.0'), end: ipToLong('192.168.255.255') },
  // 169.254.0.0/16 (Link-Local)
  { start: ipToLong('169.254.0.0'), end: ipToLong('169.254.255.255') },
  // 0.0.0.0/8 (Broadcast)
  { start: ipToLong('0.0.0.0'), end: ipToLong('0.255.255.255') }
];

function ipToLong(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

export function isPrivateIp(ip) {
  if (!net.isIP(ip)) return false;
  if (net.isIPv6(ip)) {
    // Check IPv6 loopback (::1) or unique local (fc00::/7) or link-local (fe80::/10)
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '::' || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80')) {
      return true;
    }
    return false;
  }

  const num = ipToLong(ip);
  return PRIVATE_IP_RANGES.some(range => num >= range.start && num <= range.end);
}

export async function validateSafeUrl(urlString) {
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
      reason: "Malformed or invalid URL string format.",
      isSsrfRisk: false
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and internal names
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.corp') ||
    hostname === 'metadata.google.internal' ||
    hostname === '169.254.169.254'
  ) {
    return {
      isValid: false,
      reason: "SSRF Protection: Access to localhost, link-local, or internal hostnames is prohibited.",
      isSsrfRisk: true,
      hostname
    };
  }

  // If host is direct IP, check range
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      return {
        isValid: false,
        reason: `SSRF Protection: Target IP address (${hostname}) belongs to a private/reserved network range.`,
        isSsrfRisk: true,
        hostname
      };
    }
  } else {
    // Optionally resolve DNS to verify target IP is not pointing to private network (DNS rebinding / SSRF)
    try {
      const addresses = await dns.resolve4(hostname).catch(() => []);
      for (const addr of addresses) {
        if (isPrivateIp(addr)) {
          return {
            isValid: false,
            reason: `SSRF Protection: Hostname '${hostname}' resolves to private/internal IP address (${addr}).`,
            isSsrfRisk: true,
            hostname
          };
        }
      }
    } catch {
      // DNS resolution failure is not necessarily an SSRF risk, handled gracefully
    }
  }

  return {
    isValid: true,
    normalizedUrl: parsed.toString(),
    hostname,
    protocol: parsed.protocol.replace(':', ''),
    pathname: parsed.pathname,
    search: parsed.search
  };
}
