import React from 'react';
import { ShieldCheck, AlertOctagon, Check, ArrowRight, LifeBuoy } from 'lucide-react';

export default function ActionChecklist({ recommendations = [], onOpenEmergency }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="p-6 bg-white rounded-2xl border border-[#E2E2D9] backdrop-blur-md shadow-md">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#7CD5C7]/20 text-[#0F766E] rounded-xl border border-[#7CD5C7]/50">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#464B71]">Recommended Safety Actions</h3>
            <p className="text-xs text-slate-500">Immediate protective measures based on identified threat indicators</p>
          </div>
        </div>

        {onOpenEmergency && (
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Emergency Protocol</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, idx) => {
          let badgeBorder = "border-[#E2E2D9] bg-[#F9F9F6]";
          let iconBg = "bg-white text-[#118AB2] border-[#E2E2D9]";

          if (rec.type === 'critical') {
            badgeBorder = "border-red-200 bg-red-50/60";
            iconBg = "bg-white text-red-600 border-red-200";
          } else if (rec.type === 'warning') {
            badgeBorder = "border-amber-200 bg-amber-50/60";
            iconBg = "bg-white text-amber-600 border-amber-200";
          } else if (rec.type === 'emergency') {
            badgeBorder = "border-rose-200 bg-rose-50/60";
            iconBg = "bg-white text-rose-600 border-rose-200";
          } else if (rec.type === 'safe') {
            badgeBorder = "border-emerald-200 bg-emerald-50/60";
            iconBg = "bg-white text-emerald-600 border-emerald-200";
          }

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${badgeBorder} flex items-start gap-3.5 transition-all`}
            >
              <div className={`p-1.5 rounded-lg border shrink-0 ${iconBg} mt-0.5 shadow-sm`}>
                {rec.type === 'critical' ? (
                  <AlertOctagon className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#2A2E45] mb-1">
                  {rec.action}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
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
