import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  KeyRound, 
  BadgeDollarSign, 
  ExternalLink, 
  Binary, 
  Layers, 
  UserX, 
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';

const ICON_MAP = {
  AlertTriangle,
  ShieldAlert,
  Clock,
  KeyRound,
  BadgeDollarSign,
  ExternalLink,
  Binary,
  Layers,
  UserX,
  CheckCircle2
};

export default function ThreatReasons({ threats = [], detectedCategory }) {
  if (!threats || threats.length === 0) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-emerald-300 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#464B71] flex items-center gap-2">
              Explainable AI Analysis
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">Clean</span>
            </h3>
            <p className="text-xs text-slate-500">No active threat patterns or deceptive mechanisms detected</p>
          </div>
        </div>
        <p className="text-sm text-slate-700 bg-[#F9F9F6] p-4 rounded-xl border border-[#E2E2D9]">
          The content does not exhibit coercion tactics, brand spoofing, shortened redirection links, or credential-harvesting keywords. Still exercise standard digital caution.
        </p>
      </div>
    );
  }

  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-[#E2E2D9] backdrop-blur-md shadow-md">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#118AB2]/10 text-[#118AB2] rounded-xl border border-[#118AB2]/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#464B71]">Why This Looks Suspicious</h3>
            <p className="text-xs text-slate-500">Explainable AI breakdown of identified threat vectors</p>
          </div>
        </div>
        {detectedCategory && (
          <span className="text-xs px-3 py-1 rounded-full bg-[#F2F2ED] text-[#118AB2] border border-[#118AB2]/30 font-semibold">
            Category: {detectedCategory}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {threats.map((threat, idx) => {
          const IconComponent = (threat.icon && ICON_MAP[threat.icon]) || AlertTriangle;
          return (
            <div 
              key={idx}
              className="p-4 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9] hover:border-[#118AB2]/40 transition-colors flex items-start gap-3.5 group"
            >
              <div className="p-2 rounded-lg bg-white text-amber-600 border border-amber-200 shrink-0 group-hover:border-amber-400 transition-colors mt-0.5 shadow-sm">
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <h4 className="text-sm font-semibold text-[#2A2E45]">
                    {threat.title}
                  </h4>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getSeverityStyle(threat.severity)}`}>
                    {threat.severity || "Risk Factor"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {threat.explanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
