import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, ShieldX, Info } from 'lucide-react';

export default function TrustScoreGauge({ score = 50, risk, size = 220 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.min(100, Math.max(0, score));
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Color mappings
  let color = "#dc2626"; // red
  let glowColor = "rgba(220, 38, 38, 0.25)";
  let statusText = "HIGH RISK";
  let statusBadgeClass = "bg-red-50 text-red-700 border-red-200";
  let Icon = ShieldX;

  if (score > 80) {
    color = "#0f766e"; // emerald/teal
    glowColor = "rgba(124, 213, 199, 0.35)";
    statusText = "LIKELY SAFE";
    statusBadgeClass = "bg-[#7CD5C7]/20 text-[#0f766e] border-[#7CD5C7]/50";
    Icon = ShieldCheck;
  } else if (score > 60) {
    color = "#d97706"; // yellow/amber
    glowColor = "rgba(217, 119, 6, 0.25)";
    statusText = "CAUTION";
    statusBadgeClass = "bg-amber-50 text-amber-700 border-amber-200";
    Icon = AlertTriangle;
  } else if (score > 30) {
    color = "#ea580c"; // orange
    glowColor = "rgba(234, 88, 12, 0.25)";
    statusText = "SUSPICIOUS";
    statusBadgeClass = "bg-orange-50 text-orange-700 border-orange-200";
    Icon = ShieldAlert;
  }

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270-degree arc for dashboard gauge feel
  const arcPercentage = 0.75;
  const totalLength = circumference * arcPercentage;
  const strokeDashoffset = totalLength - (totalLength * (animatedScore / 100));

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-[#E2E2D9] shadow-md relative overflow-hidden backdrop-blur-md">
      {/* Background glow radial */}
      <div 
        className="absolute w-44 h-44 rounded-full filter blur-3xl opacity-10 pointer-events-none -top-10 -right-10"
        style={{ backgroundColor: color }}
      />

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 origin-center"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E2D9"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * (animatedScore / 100))}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${glowColor})`
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Icon className="w-8 h-8 mb-1" style={{ color }} />
          <div className="flex items-baseline justify-center">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#464B71] font-mono">
              {animatedScore}
            </span>
            <span className="text-slate-500 text-lg font-medium ml-1">/100</span>
          </div>
          <span className="text-xs uppercase tracking-widest text-slate-500 mt-0.5 font-semibold">
            Trust Score
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-4 flex flex-col items-center text-center">
        <div className={`px-4 py-1.5 rounded-full border text-sm font-bold tracking-wider uppercase flex items-center gap-2 ${statusBadgeClass}`}>
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: color }} />
          <span>{statusText}</span>
        </div>

        <p className="text-xs text-slate-500 mt-2.5 max-w-xs flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#118AB2] shrink-0" />
          <span>Risk assessment based on available threat indicators and behavioral pattern heuristics.</span>
        </p>
      </div>
    </div>
  );
}
