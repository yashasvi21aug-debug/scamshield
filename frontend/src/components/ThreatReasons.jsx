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
      <div className="p-6 bg-cyber-900/60 rounded-2xl border border-emerald-500/30 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Explainable AI Analysis
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Clean</span>
            </h3>
            <p className="text-xs text-slate-400">No active threat patterns or deceptive mechanisms detected</p>
          </div>
        </div>
        <p className="text-sm text-slate-300 bg-cyber-950/60 p-4 rounded-xl border border-cyber-800">
          The content does not exhibit coercion tactics, brand spoofing, shortened redirection links, or credential-harvesting keywords. Still exercise standard digital caution.
        </p>
      </div>
    );
  }

  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <div className="p-6 bg-cyber-900/80 rounded-2xl border border-cyber-700/70 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Why This Looks Suspicious</h3>
            <p className="text-xs text-slate-400">Explainable AI breakdown of identified threat vectors</p>
          </div>
        </div>
        {detectedCategory && (
          <span className="text-xs px-3 py-1 rounded-full bg-cyber-800 text-cyan-300 border border-cyan-500/30 font-medium">
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
              className="p-4 rounded-xl bg-cyber-950/70 border border-cyber-800 hover:border-cyber-600 transition-colors flex items-start gap-3.5 group"
            >
              <div className="p-2 rounded-lg bg-cyber-900 text-amber-400 border border-cyber-700 shrink-0 group-hover:border-amber-500/40 transition-colors mt-0.5">
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <h4 className="text-sm font-semibold text-slate-200">
                    {threat.title}
                  </h4>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getSeverityStyle(threat.severity)}`}>
                    {threat.severity || "Risk Factor"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
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
