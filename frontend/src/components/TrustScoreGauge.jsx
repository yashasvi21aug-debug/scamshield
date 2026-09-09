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
  let color = "#ef4444"; // red
  let glowColor = "rgba(239, 68, 68, 0.4)";
  let statusText = "HIGH RISK";
  let statusBadgeClass = "bg-red-500/20 text-red-400 border-red-500/40";
  let Icon = ShieldX;

  if (score > 80) {
    color = "#10b981"; // emerald
    glowColor = "rgba(16, 185, 129, 0.4)";
    statusText = "LIKELY SAFE";
    statusBadgeClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    Icon = ShieldCheck;
  } else if (score > 60) {
    color = "#eab308"; // yellow
    glowColor = "rgba(234, 179, 8, 0.4)";
    statusText = "CAUTION";
    statusBadgeClass = "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
    Icon = AlertTriangle;
  } else if (score > 30) {
    color = "#f97316"; // orange/amber
    glowColor = "rgba(249, 115, 22, 0.4)";
    statusText = "SUSPICIOUS";
    statusBadgeClass = "bg-orange-500/20 text-orange-400 border-orange-500/40";
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
    <div className="flex flex-col items-center justify-center p-6 bg-cyber-900/80 rounded-2xl border border-cyber-700/60 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Background glow radial */}
      <div 
        className="absolute w-44 h-44 rounded-full filter blur-3xl opacity-20 pointer-events-none -top-10 -right-10"
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
            stroke="#1b2a4e"
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
              filter: `drop-shadow(0 0 10px ${glowColor})`
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Icon className="w-8 h-8 mb-1" style={{ color }} />
          <div className="flex items-baseline justify-center">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
              {animatedScore}
            </span>
            <span className="text-slate-400 text-lg font-medium ml-1">/100</span>
          </div>
          <span className="text-xs uppercase tracking-widest text-slate-400 mt-0.5 font-semibold">
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

        <p className="text-xs text-slate-400 mt-2.5 max-w-xs flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Risk assessment based on available threat indicators and behavioral pattern heuristics.</span>
        </p>
      </div>
    </div>
  );
}
