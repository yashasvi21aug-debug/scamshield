import React from 'react';
import { ShieldCheck, AlertOctagon, Check, ArrowRight, LifeBuoy } from 'lucide-react';

export default function ActionChecklist({ recommendations = [], onOpenEmergency }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="p-6 bg-cyber-900/80 rounded-2xl border border-cyan-500/20 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Recommended Safety Actions</h3>
            <p className="text-xs text-slate-400">Immediate protective measures based on identified threat indicators</p>
          </div>
        </div>

        {onOpenEmergency && (
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Emergency Protocol</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, idx) => {
          let badgeBorder = "border-cyber-800 bg-cyber-950/60";
          let iconColor = "text-cyan-400";

          if (rec.type === 'critical') {
            badgeBorder = "border-red-500/30 bg-red-950/20";
            iconColor = "text-red-400";
          } else if (rec.type === 'warning') {
            badgeBorder = "border-amber-500/30 bg-amber-950/20";
            iconColor = "text-amber-400";
          } else if (rec.type === 'emergency') {
            badgeBorder = "border-pink-500/30 bg-pink-950/20";
            iconColor = "text-pink-400";
          } else if (rec.type === 'safe') {
            badgeBorder = "border-emerald-500/30 bg-emerald-950/20";
            iconColor = "text-emerald-400";
          }

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${badgeBorder} flex items-start gap-3.5 transition-all`}
            >
              <div className={`p-1.5 rounded-lg bg-cyber-900 border border-cyber-700 shrink-0 ${iconColor} mt-0.5`}>
                {rec.type === 'critical' ? (
                  <AlertOctagon className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-100 mb-1">
                  {rec.action}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {rec.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
