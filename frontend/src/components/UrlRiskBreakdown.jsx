import React from 'react';
import { Globe, Lock, Unlock, AlertCircle, ShieldAlert, CheckCircle2, Binary, ExternalLink, Activity } from 'lucide-react';

export default function UrlRiskBreakdown({ urlDetails = {}, breakdownMeters = {} }) {
  const {
    hostname = "N/A",
    protocol = "https",
    isHttps = true,
    isIpv4 = false,
    isShortener = false,
    matchedTld = ".com",
    brandSpoofed = null
  } = urlDetails;

  const meters = [
    {
      label: "Domain Reputation",
      score: breakdownMeters.domainReputation ?? 85,
      invertColor: false, // higher is better
      description: "Baseline trust score and historical domain cleanliness"
    },
    {
      label: "Phishing Indicators",
      score: breakdownMeters.phishingIndicators ?? 15,
      invertColor: true, // higher is worse
      description: "Matches against known credential theft forms & homoglyphs"
    },
    {
      label: "Domain Similarity / Typo Risk",
      score: breakdownMeters.domainSimilarity ?? 10,
      invertColor: true, // higher is worse
      description: "Closeness to official banking or corporate domain structures"
    },
    {
      label: "Community Threat Reports",
      score: breakdownMeters.communityThreats ?? 20,
      invertColor: true, // higher is worse
      description: "Incidents reported across the decentralized FraudLens network"
    }
  ];

  const getMeterColor = (score, invertColor) => {
    const effectiveRisk = invertColor ? score : 100 - score;
    if (effectiveRisk >= 70) return "bg-red-500";
    if (effectiveRisk >= 40) return "bg-amber-500";
    if (effectiveRisk >= 20) return "bg-yellow-400";
    return "bg-emerald-500";
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-[#E2E2D9] backdrop-blur-md shadow-md space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#E2E2D9]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#118AB2]/10 text-[#118AB2] rounded-xl border border-[#118AB2]/30">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#464B71]">URL Intelligence Dossier</h3>
            <p className="text-xs text-slate-500">Static structural domain analysis and protocol verification</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isHttps ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Lock className="w-3.5 h-3.5" />
              <span>TLS / HTTPS Active</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 animate-pulse">
              <Unlock className="w-3.5 h-3.5" />
              <span>Insecure HTTP</span>
            </span>
          )}
        </div>
      </div>

      {/* Target Domain Metadata Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-[#F9F9F6] rounded-xl border border-[#E2E2D9]">
          <span className="text-[11px] text-slate-500 font-medium block uppercase tracking-wider">Host Domain</span>
          <span className="text-sm font-semibold text-[#2A2E45] truncate block mt-0.5" title={hostname}>
            {hostname}
          </span>
        </div>

        <div className="p-3 bg-[#F9F9F6] rounded-xl border border-[#E2E2D9]">
          <span className="text-[11px] text-slate-500 font-medium block uppercase tracking-wider">TLD Category</span>
          <span className="text-sm font-semibold text-[#118AB2] block mt-0.5">
            {matchedTld}
          </span>
        </div>

        <div className="p-3 bg-[#F9F9F6] rounded-xl border border-[#E2E2D9]">
          <span className="text-[11px] text-slate-500 font-medium block uppercase tracking-wider">IP Hostname</span>
          <span className={`text-sm font-semibold block mt-0.5 ${isIpv4 ? 'text-red-700' : 'text-slate-700'}`}>
            {isIpv4 ? "Direct IP (High Risk)" : "Standard DNS"}
          </span>
        </div>

        <div className="p-3 bg-[#F9F9F6] rounded-xl border border-[#E2E2D9]">
          <span className="text-[11px] text-slate-500 font-medium block uppercase tracking-wider">Shortener / Mask</span>
          <span className={`text-sm font-semibold block mt-0.5 ${isShortener ? 'text-amber-700' : 'text-slate-700'}`}>
            {isShortener ? "Shortener Detected" : "Direct Link"}
          </span>
        </div>
      </div>

      {brandSpoofed && (
        <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-red-800">Brand Impersonation Alert: </span>
            <span className="text-slate-700">
              This domain closely mimics official <strong>{brandSpoofed}</strong> services but does not belong to authorized brand infrastructure.
            </span>
          </div>
        </div>
      )}

      {/* Visual Risk Breakdown Bars */}
      <div>
        <h4 className="text-xs uppercase tracking-wider font-semibold text-[#464B71] mb-3.5 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#118AB2]" />
          <span>URL Risk Breakdown</span>
        </h4>

        <div className="space-y-3.5">
          {meters.map((meter, i) => (
            <div key={i} className="p-3 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9]">
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <span className="font-medium text-[#2A2E45]">{meter.label}</span>
                <span className="font-mono font-bold text-[#464B71]">{meter.score}%</span>
              </div>
              <div className="w-full bg-[#E2E2D9] rounded-full h-2.5 overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${getMeterColor(meter.score, meter.invertColor)}`}
                  style={{ width: `${meter.score}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{meter.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
