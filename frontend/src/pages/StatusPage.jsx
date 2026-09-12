import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Database, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  QrCode, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Server,
  Lock
} from 'lucide-react';
import { checkHealth } from '../services/api';

export default function StatusPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await checkHealth();
      setHealthData(data);
    } catch (err) {
      setError(err.message || "Failed to reach backend health check endpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-[#118AB2]" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#118AB2] font-mono">
              Live Architecture Diagnostics
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#464B71] tracking-tight">
            System & Provider Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl">
            Real-time operational connectivity status for database storage, AI providers, external threat intelligence feeds, and local defense engines.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="p-2.5 rounded-xl bg-[#F2F2ED] border border-[#E2E2D9] text-[#2A2E45] hover:bg-white hover:border-[#118AB2] text-xs flex items-center gap-2 self-start md:self-auto transition-colors font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-2 border-[#118AB2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-mono">Querying system diagnostics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Database Status */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/30">
                  <Database className="w-6 h-6" />
                </div>
                {healthData?.database === 'connected' || healthData?.database === 'MongoDB connected' ? (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : healthData?.database === 'degraded' || healthData?.database === 'MongoDB degraded' ? (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Degraded Mode
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Unavailable
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-[#464B71] mb-1">Persistent Storage</h3>
              <p className="text-xs text-slate-500 mb-1">
                Active Engine: <strong className="text-[#2A2E45]">{healthData?.databaseDetails?.engine || 'Local Persistence'}</strong>
              </p>
              {healthData?.databaseDetails?.databaseName && (
                <p className="text-xs text-slate-500 mb-4">
                  Database: <strong className="text-[#118AB2] font-mono">{healthData.databaseDetails.databaseName}</strong>
                </p>
              )}

              {healthData?.databaseDetails?.isDegraded && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                  MongoDB is unconfigured or offline. System is running in degraded mode using persistent local disk storage.
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-[#E2E2D9] text-[11px] text-slate-500">
              Scans & Community reports persist securely
            </div>
          </div>

          {/* 2. AI Semantic Engine */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
                  <Cpu className="w-6 h-6" />
                </div>
                {healthData?.ai?.configured ? (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F2F2ED] text-slate-600 border border-[#E2E2D9] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Not Configured
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-[#464B71] mb-1">Server-Side AI Engine</h3>
              <p className="text-xs text-slate-500 mb-3">
                Provider: <strong className="text-[#2A2E45]">{healthData?.ai?.provider || 'None'}</strong>
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Model: <strong className="text-[#2A2E45]">{healthData?.ai?.model || 'None'}</strong>
              </p>

              {!healthData?.ai?.configured && (
                <div className="p-3 bg-[#F2F2ED] rounded-xl border border-[#E2E2D9] text-[11px] text-slate-600">
                  AI_API_KEY not configured. Local heuristic rules and safety knowledge base active without interruption.
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-[#E2E2D9] text-[11px] text-slate-500">
              Zero frontend exposure of API keys
            </div>
          </div>

          {/* 3. Local Detection Engine */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                </span>
              </div>

              <h3 className="text-base font-bold text-[#464B71] mb-1">Local Heuristics & Static Core</h3>
              <p className="text-xs text-slate-600 mb-3">
                Zero-execution static analysis engine inspecting lexical triggers, lookalike homoglyphs, and payment parameters.
              </p>
              <div className="p-3 bg-[#F2F2ED] rounded-xl border border-[#E2E2D9] text-[11px] text-slate-600 space-y-1">
                <div>• Social Engineering Lexicon: Active</div>
                <div>• Suspicious TLD Filter: Active</div>
                <div>• Lookalike Brand Matcher: Active</div>
              </div>
            </div>
            <div className="pt-4 border-t border-[#E2E2D9] text-[11px] text-emerald-700 font-semibold">
              100% Standalone Offline Capable
            </div>
          </div>

          {/* 4. SSRF Protection & Safe Network Handling */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/30">
                  <Lock className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                </span>
              </div>

              <h3 className="text-base font-bold text-[#464B71] mb-1">Safe URL & SSRF Filter</h3>
              <p className="text-xs text-slate-600 mb-3">
                Prevents backend requests to private IP ranges, localhost, link-local addresses, or cloud metadata endpoints.
              </p>
              <div className="p-3 bg-[#F2F2ED] rounded-xl border border-[#E2E2D9] text-[11px] text-slate-600 space-y-1">
                <div>• 127.0.0.0/8 & Localhost: Blocked</div>
                <div>• 10.0.0.0/8 & 192.168.0.0/16: Blocked</div>
                <div>• Zero Code Execution on Target URL: Enforced</div>
              </div>
            </div>
            <div className="pt-4 border-t border-[#E2E2D9] text-[11px] text-slate-500">
              Safe static analysis guarantee
            </div>
          </div>

          {/* 5. QR Code Security & Decoder */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <QrCode className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                </span>
              </div>

              <h3 className="text-base font-bold text-[#464B71] mb-1">QR Decoder & UPI Parser</h3>
              <p className="text-xs text-slate-600 mb-3">
                Decodes raw QR payloads, extracts payment parameters (VPA, Payee Name, Amount), and flags reverse-charge collect traps.
              </p>
              <div className="p-3 bg-[#F2F2ED] rounded-xl border border-[#E2E2D9] text-[11px] text-slate-600 space-y-1">
                <div>• Client-Side jsQR Engine: Ready</div>
                <div>• UPI Payload Parameter Parser: Active</div>
                <div>• Receiver Identity Disclaimer: Enforced</div>
              </div>
            </div>
            <div className="pt-4 border-t border-[#E2E2D9] text-[11px] text-slate-500">
              Supports Image Upload & Webcam Stream
            </div>
          </div>

          {/* 6. External Threat Intelligence Feeds */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/30">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F2F2ED] text-[#464B71] border border-[#E2E2D9]">
                  4 Adapters
                </span>
              </div>

              <h3 className="text-base font-bold text-[#464B71] mb-1">Threat Intelligence Feeds</h3>
              <p className="text-xs text-slate-600 mb-3">
                Provider-by-provider credential configuration:
              </p>

              <div className="space-y-2 text-xs">
                {Object.entries(healthData?.threatIntelligence || {}).map(([key, val]) => {
                  const isConfigured = val === 'configured';
                  return (
                    <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-[#F2F2ED] border border-[#E2E2D9]">
                      <span className="text-[#2A2E45] capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        isConfigured 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-white text-slate-500 border border-[#E2E2D9]'
                      }`}>
                        {isConfigured ? 'Configured' : 'Not Configured'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-4 border-t border-[#E2E2D9] text-[11px] text-slate-500">
              Only configured providers are queried
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
