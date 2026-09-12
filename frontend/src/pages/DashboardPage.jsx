import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Users, 
  Activity, 
  TrendingUp, 
  AlertOctagon, 
  ArrowUpRight,
  RotateCcw,
  Database,
  Inbox,
  GraduationCap,
  ChevronRight,
  Globe,
  MessageSquareWarning,
  QrCode,
  Sparkles,
  CheckCircle2,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  getDashboardStats, 
  getDashboardTimeline, 
  getThreatDistribution, 
  getCategoryDistribution 
} from '../services/api';

export default function DashboardPage({ onNavigate, onInspectScan }) {
  const [includeDemo, setIncludeDemo] = useState(false);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [threatDist, setThreatDist] = useState([]);
  const [categoryDist, setCategoryDist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, timelineRes, threatRes, catRes] = await Promise.all([
        getDashboardStats(includeDemo),
        getDashboardTimeline(7, includeDemo),
        getThreatDistribution(includeDemo),
        getCategoryDistribution(includeDemo)
      ]);

      setStats(statsRes);
      setTimeline(timelineRes || []);
      setThreatDist(threatRes || []);
      setCategoryDist(catRes || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to retrieve real-time telemetry from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [includeDemo]);

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-3 border-[#118AB2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs uppercase tracking-widest text-[#464B71] font-mono font-bold">
          Querying Fraud Telemetry Database...
        </p>
      </div>
    );
  }

  const hasScans = stats && stats.totalScans > 0;
  const totalScansCount = stats?.totalScans || 0;
  const threatsCount = stats?.threatsBlocked || 0;
  const safeCount = stats?.safeScans || 0;
  const awarenessScore = stats?.trainingSummary?.averageScore ?? 92;

  const getAwarenessTier = (score) => {
    if (score >= 90) return { title: "Elite Defender", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (score >= 75) return { title: "Advanced Defender", badge: "bg-[#7CD5C7]/20 text-[#0F766E] border-[#7CD5C7]/50" };
    if (score >= 60) return { title: "Active Defender", badge: "bg-cyan-50 text-cyan-700 border-cyan-200" };
    return { title: "Learning Defender", badge: "bg-amber-50 text-amber-700 border-amber-200" };
  };

  const awarenessTier = getAwarenessTier(awarenessScore);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2.5 h-2.5 rounded-full ${stats?.dbStatus?.isDegraded ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500 font-mono">
              Database: {stats?.dbStatus?.activeEngine || 'Active'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#464B71] tracking-tight">
            Your Fraud Protection Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Understand your scanning activity, verify identified threats, and monitor your personalized defensive training mastery.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Demo Data Filter Toggle */}
          <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9] text-xs text-slate-700 cursor-pointer select-none hover:bg-white transition-colors">
            <input
              type="checkbox"
              checked={includeDemo}
              onChange={(e) => setIncludeDemo(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-white border-[#E2E2D9] text-[#118AB2] focus:ring-0 cursor-pointer"
            />
            <span className="font-medium">Include Synthetic Demo Records</span>
          </label>

          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9] text-slate-700 hover:text-[#464B71] hover:border-[#118AB2] transition-colors text-xs font-semibold flex items-center gap-1.5"
            title="Refresh Metrics"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => onNavigate('analyze')}
            className="px-5 py-2.5 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#118AB2]/20 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-medium flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Scans */}
        <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="w-1.5 h-full absolute left-0 top-0 bg-[#118AB2]" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Scans
            </span>
            <div className="p-2.5 rounded-2xl bg-[#118AB2]/10 text-[#118AB2]">
              <Search className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#464B71] font-mono tracking-tight">
              {totalScansCount.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#118AB2]" />
              <span>{stats?.dbStatus?.isDegraded ? "Disk Telemetry Fallback" : "Indexed in Database"}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Threats Detected */}
        <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="w-1.5 h-full absolute left-0 top-0 bg-red-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Threats Detected
            </span>
            <div className="p-2.5 rounded-2xl bg-red-50 text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-red-600 font-mono tracking-tight">
              {threatsCount.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {hasScans 
                ? `${Math.round((threatsCount / totalScansCount) * 100)}% of scanned payloads` 
                : "Awaiting scan input"}
            </div>
          </div>
        </div>

        {/* Card 3: Safe Checks */}
        <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="w-1.5 h-full absolute left-0 top-0 bg-[#0F766E]" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Safe Checks
            </span>
            <div className="p-2.5 rounded-2xl bg-[#7CD5C7]/20 text-[#0F766E]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#0F766E] font-mono tracking-tight">
              {safeCount.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {hasScans 
                ? `${Math.round((safeCount / totalScansCount) * 100)}% verified clean` 
                : "Clean verified inputs"}
            </div>
          </div>
        </div>

        {/* Card 4: Awareness Score */}
        <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="w-1.5 h-full absolute left-0 top-0 bg-[#464B71]" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Awareness Score
            </span>
            <div className="p-2.5 rounded-2xl bg-[#464B71]/10 text-[#464B71]">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#464B71] font-mono tracking-tight">
                {awarenessScore}%
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${awarenessTier.badge}`}>
                {awarenessTier.title}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Based on simulator decisions
            </div>
          </div>
        </div>
      </div>

      {/* Adaptive Training Progress Widget */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition-shadow">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-[#118AB2]/10 border border-[#118AB2]/25 text-[#118AB2] shrink-0">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/25">
                Cybersecurity Training
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Safe Simulator Sandbox
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#464B71] tracking-tight">
              Adaptive Personalized Training Engine
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Sharpen defensive instincts with interactive attack scenarios. FraudLens analyzes your mistakes and recommends targeted training to seal vulnerability gaps.
            </p>
            {stats?.trainingSummary?.recommendedChallenge && (
              <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                <span className="text-[#118AB2] font-mono font-bold uppercase tracking-wider">Adaptive Target:</span>
                <span className="text-[#2A2E45] font-semibold">{stats.trainingSummary.recommendedChallenge}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/25 font-mono font-bold">
                  {stats.trainingSummary.recommendedDifficulty || 'Adaptive'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 self-stretch lg:self-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-[#E2E2D9]">
          <div className="flex items-center gap-5">
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Completed</div>
              <div className="text-xl font-black text-[#464B71] font-mono">
                {stats?.trainingSummary?.scenariosCompleted || 0} of 8
              </div>
            </div>
            <div className="w-px h-8 bg-[#E2E2D9]" />
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Focus Area</div>
              <div className="text-xs font-bold text-amber-700 font-mono truncate max-w-[140px]" title={stats?.trainingSummary?.currentFocus || 'All Concepts'}>
                {stats?.trainingSummary?.currentFocus || stats?.trainingSummary?.weakestCategory || 'All Concepts'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {stats?.trainingSummary?.conceptProgress !== undefined ? `${stats.trainingSummary.conceptProgress}% Mastery` : 'Mastery in progress'}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('simulator')}
            className="px-5 py-3 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#118AB2]/20 flex items-center gap-2 shrink-0"
          >
            <span>Continue Training</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* If 0 scans in database, show clear Empty State */}
      {!hasScans ? (
        <div className="p-12 rounded-3xl bg-white border border-[#E2E2D9] text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="p-4 rounded-2xl bg-[#F9F9F6] border border-[#E2E2D9] w-fit mx-auto text-[#118AB2]">
            <Inbox className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#464B71]">No Scans Recorded Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              The database does not contain scan records yet. Check your first message or link in the Analyze Center to populate real-time analytics.
            </p>
          </div>
          <button
            onClick={() => onNavigate('analyze')}
            className="px-6 py-2.5 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#118AB2]/20"
          >
            Scan Something Now
          </button>
        </div>
      ) : (
        <>
          {/* Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scans & Threats Timeline */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#464B71] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#118AB2]" />
                    <span>Scan Activity Timeline</span>
                  </h3>
                  <p className="text-xs text-slate-500">Aggregated daily telemetry of real security inspections</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-[#118AB2]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#118AB2]" /> Total Scans
                  </span>
                  <span className="flex items-center gap-1.5 text-red-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Threats Identified
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                {timeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline}>
                      <defs>
                        <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#118AB2" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#118AB2" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="threatsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#464B71',
                          borderColor: '#2B304D',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                          color: '#FFFFFF',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: '#FFFFFF' }}
                      />
                      <Area type="monotone" dataKey="scans" stroke="#118AB2" strokeWidth={2.5} fillOpacity={1} fill="url(#scansGrad)" />
                      <Area type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#threatsGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    Insufficient timeline history recorded yet
                  </div>
                )}
              </div>
            </div>

            {/* Risk Distribution Pie */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#464B71] mb-1">
                  Threat Breakdown by Risk
                </h3>
                <p className="text-xs text-slate-500 mb-4">Actual database records distributed by threat severity</p>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                {threatDist.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={threatDist}
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {threatDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#464B71',
                          borderColor: '#2B304D',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                          color: '#FFFFFF',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: '#FFFFFF' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-500">No risk records</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-4 border-t border-[#E2E2D9]">
                {threatDist.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                    <span className="truncate">{item.name}: <strong>{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Threat Categories Breakdown */}
          {categoryDist.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm">
              <div className="mb-6">
                <h3 className="text-base font-bold text-[#464B71]">
                  Identified Threat Categories
                </h3>
                <p className="text-xs text-slate-500">Classifications aggregated directly from scan heuristics</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryDist}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#464B71',
                        borderColor: '#2B304D',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#FFFFFF',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ color: '#FFFFFF' }}
                    />
                    <Bar dataKey="count" fill="#118AB2" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Security Checks Feed (Card-based view) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold text-[#464B71]">
                  Recent Security Checks
                </h3>
                <p className="text-xs text-slate-500">Chronological telemetry of actual scans saved in database</p>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-bold text-[#118AB2] hover:text-[#0E7490] flex items-center gap-1 transition-colors"
              >
                <span>View Complete History</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(stats?.recentScans || []).map((scan) => {
                let badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                if (scan.riskLevel === "HIGH RISK") badgeClass = "bg-red-50 text-red-700 border-red-200";
                else if (scan.riskLevel === "SUSPICIOUS") badgeClass = "bg-orange-50 text-orange-700 border-orange-200";
                else if (scan.riskLevel === "CAUTION") badgeClass = "bg-amber-50 text-amber-700 border-amber-200";

                const TypeIcon = scan.type === 'sms' ? MessageSquareWarning : scan.type === 'url' ? Globe : QrCode;

                return (
                  <div
                    key={scan.scanId}
                    className="p-5 rounded-2xl bg-[#F9F9F6] hover:bg-white border border-[#E2E2D9] hover:border-[#118AB2] hover:-translate-y-0.5 transition-all duration-200 shadow-sm flex flex-col justify-between gap-4 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-white border border-[#E2E2D9] text-[#118AB2] shrink-0 group-hover:border-[#118AB2]/40 transition-colors">
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                            {scan.type} • {scan.detectedCategory || "General"}
                          </span>
                          <p className="text-xs font-semibold text-[#2A2E45] truncate max-w-xs mt-0.5" title={scan.sanitizedInput}>
                            {scan.sanitizedInput}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0 ${badgeClass}`}>
                        {scan.riskLevel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E2E2D9]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#464B71]">
                          Trust Score:
                        </span>
                        <span className="text-xs font-mono font-black text-[#118AB2]">
                          {scan.trustScore}/100
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (onInspectScan) onInspectScan(scan);
                        }}
                        className="text-xs font-bold text-[#118AB2] group-hover:text-[#0E7490] flex items-center gap-1 transition-colors"
                      >
                        <span>View Dossier</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

