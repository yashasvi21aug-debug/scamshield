import dns from 'dns/promises';
import tls from 'tls';
import { isPrivateIp } from '../utils/ssrfProtection.js';

export async function getDomainIntelligence(hostname) {
  const result = {
    hostname,
    dnsResolved: false,
    ipAddresses: [],
    nameservers: [],
    mailServers: [],
    hasTls: false,
    tlsIssuer: null,
    tlsExpires: null,
    registrationDate: null,
    domainAge: "Information unavailable",
    registrar: "Information unavailable",
    rdapQueried: false
  };

  if (!hostname || typeof hostname !== 'string' || hostname.includes('..') || hostname.startsWith('.')) {
    return result;
  }

  // 1. Real DNS Resolution
  try {
    const aRecords = await dns.resolve4(hostname).catch(() => []);
    result.ipAddresses = aRecords.filter(ip => !isPrivateIp(ip));
    result.dnsResolved = aRecords.length > 0;

    const nsRecords = await dns.resolveNs(hostname).catch(() => []);
    result.nameservers = nsRecords.slice(0, 4);

    const mxRecords = await dns.resolveMx(hostname).catch(() => []);
    result.mailServers = mxRecords.map(m => m.exchange).slice(0, 3);
  } catch {
    // DNS resolution failure handled gracefully
  }

  // 2. Safe TLS Certificate Inspection (Port 443 SNI connection without HTTP request body)
  if (result.dnsResolved && result.ipAddresses.length > 0) {
    try {
      const certInfo = await checkTlsCertificate(hostname, result.ipAddresses[0]);
      if (certInfo) {
        result.hasTls = true;
        result.tlsIssuer = certInfo.issuer;
        result.tlsExpires = certInfo.valid_to;
      }
    } catch {
      result.hasTls = false;
    }
  }

  // 3. Real RDAP Domain Registration Lookup (Standard ICANN RDAP)
  try {
    const rdapData = await queryRdap(hostname);
    result.rdapQueried = true;
    if (rdapData) {
      if (rdapData.registrationDate) {
        result.registrationDate = rdapData.registrationDate;
        result.domainAge = calculateAge(rdapData.registrationDate);
      }
      if (rdapData.registrar) {
        result.registrar = rdapData.registrar;
      }
    }
  } catch {
    // Leave as "Information unavailable"
  }

  return result;
}

function checkTlsCertificate(hostname, ip) {
  return new Promise((resolve) => {
    const socket = tls.connect({
      host: ip,
      servername: hostname,
      port: 443,
      timeout: 2500,
      rejectUnauthorized: false
    }, () => {
      try {
        const cert = socket.getPeerCertificate();
        socket.destroy();
        if (cert && cert.subject) {
          resolve({
            issuer: cert.issuer?.O || cert.issuer?.CN || 'Standard CA',
            valid_to: cert.valid_to || null
          });
        } else {
          resolve(null);
        }
      } catch {
        socket.destroy();
        resolve(null);
      }
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(null);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(null);
    });
  });
}

async function queryRdap(hostname) {
  try {
    const parts = hostname.split('.');
    if (parts.length < 2) return null;
    const baseDomain = parts.slice(-2).join('.');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`https://rdap.org/domain/${baseDomain}`, {
      headers: { 'Accept': 'application/rdap+json' },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();

    let registrationDate = null;
    if (Array.isArray(data.events)) {
      const regEvent = data.events.find(e => e.eventAction === 'registration');
      if (regEvent && regEvent.eventDate) {
        registrationDate = regEvent.eventDate;
      }
    }

    let registrar = null;
    if (Array.isArray(data.entities)) {
      const registrarEntity = data.entities.find(e => Array.isArray(e.roles) && e.roles.includes('registrar'));
      if (registrarEntity && registrarEntity.vcardArray) {
        const fn = registrarEntity.vcardArray?.[1]?.find(item => item[0] === 'fn');
        if (fn && fn[3]) registrar = fn[3];
      }
    }

    return { registrationDate, registrar };
  } catch {
    return null;
  }
}

function calculateAge(dateString) {
  try {
    const reg = new Date(dateString);
    if (isNaN(reg.getTime())) return "Information unavailable";

    const diffDays = Math.floor((Date.now() - reg.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `${diffDays} days (Newly Registered)`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''}`;
  } catch {
    return "Information unavailable";
  }
}
