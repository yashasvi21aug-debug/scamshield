// ScamShield Frontend API Client - Connected to Real Backend Endpoints

const BASE_URL = import.meta.env.VITE_API_URL || '';

function getSessionId() {
  let sessionId = localStorage.getItem('scamshield_session_id');
  if (!sessionId) {
    sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('scamshield_session_id', sessionId);
  }
  return sessionId;
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-session-id': getSessionId()
  };
}

export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/api/health`);
  if (!res.ok) throw new Error("Health check failed");
  return await res.json();
}

export async function analyzeSms(text, { useAi = true, isDemo = false } = {}) {
  const res = await fetch(`${BASE_URL}/api/analyze/sms`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ text, useAi, isDemo })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Analysis failed with status ${res.status}`);
  }
  const data = await res.json();
  return data.data;
}

export async function analyzeUrl(url, { useAi = true, isDemo = false } = {}) {
  const res = await fetch(`${BASE_URL}/api/analyze/url`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ url, useAi, isDemo })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `URL analysis failed with status ${res.status}`);
  }
  const data = await res.json();
  return data.data;
}

export async function analyzeQr(payload, { useAi = true, isDemo = false } = {}) {
  const res = await fetch(`${BASE_URL}/api/analyze/qr`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ payload, useAi, isDemo })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `QR analysis failed with status ${res.status}`);
  }
  const data = await res.json();
  return data.data;
}

export async function getDashboardStats(includeDemo = false) {
  const res = await fetch(`${BASE_URL}/api/dashboard/stats?includeDemo=${includeDemo}`);
  if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
  const data = await res.json();
  return data.data;
}

export async function getDashboardTimeline(days = 7, includeDemo = false) {
  const res = await fetch(`${BASE_URL}/api/dashboard/timeline?days=${days}&includeDemo=${includeDemo}`);
  if (!res.ok) throw new Error("Failed to fetch activity timeline");
  const data = await res.json();
  return data.data;
}

export async function getThreatDistribution(includeDemo = false) {
  const res = await fetch(`${BASE_URL}/api/dashboard/threat-distribution?includeDemo=${includeDemo}`);
  if (!res.ok) throw new Error("Failed to fetch threat distribution");
  const data = await res.json();
  return data.data;
}

export async function getCategoryDistribution(includeDemo = false) {
  const res = await fetch(`${BASE_URL}/api/dashboard/categories?includeDemo=${includeDemo}`);
  if (!res.ok) throw new Error("Failed to fetch category distribution");
  const data = await res.json();
  return data.data;
}

export async function getHistory({ limit = 50, skip = 0, type = 'all', risk = 'all', search = '', includeDemo = false } = {}) {
  const params = new URLSearchParams({ limit, skip, type, risk, search, includeDemo });
  const res = await fetch(`${BASE_URL}/api/history?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch scan history");
  const data = await res.json();
  return data;
}

export async function getCategories() {
  const res = await fetch(`${BASE_URL}/api/threat-categories`);
  if (!res.ok) throw new Error("Failed to fetch scam categories");
  const data = await res.json();
  return data.data;
}

export async function getEmergencyResources() {
  const res = await fetch(`${BASE_URL}/api/emergency/resources`);
  if (!res.ok) throw new Error("Failed to fetch emergency resources");
  const data = await res.json();
  return data.data;
}

export async function getCommunityReports(category = 'all', search = '', includeDemo = false) {
  const params = new URLSearchParams({ category, search, includeDemo });
  const res = await fetch(`${BASE_URL}/api/community/reports?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch community reports");
  const data = await res.json();
  return data.data;
}

export async function createCommunityReport(reportData) {
  const res = await fetch(`${BASE_URL}/api/community/report`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(reportData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to submit report");
  }
  const data = await res.json();
  return data.data;
}

export async function upvoteCommunityReport(id) {
  const res = await fetch(`${BASE_URL}/api/community/reports/${id}/upvote`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 409) {
      throw new Error("You have already confirmed this threat report from this session.");
    }
    throw new Error(err.error || "Failed to confirm report");
  }
  const data = await res.json();
  return data.data;
}

export async function askAdvisor(message, history = []) {
  const res = await fetch(`${BASE_URL}/api/advisor/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ message, history })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to get advice");
  }
  return await res.json();
}
