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
  ChevronRight
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-mono">
          Querying Database Telemetry...
        </p>
      </div>
    );
  }

  const hasScans = stats && stats.totalScans > 0;

  const kpis = [
    {
      title: "Total Scans Recorded",
      value: stats?.totalScans !== undefined ? stats.totalScans.toLocaleString() : "0",
      caption: stats?.dbStatus?.isDegraded ? "Stored on Disk" : "Stored in Database",
      icon: Search,
      color: "text-[#118AB2]",
      bg: "bg-[#118AB2]/10",
      border: "border-[#118AB2]/20"
    },
    {
      title: "Threats Identified",
      value: stats?.threatsBlocked !== undefined ? stats.threatsBlocked.toLocaleString() : "0",
      caption: hasScans ? `${Math.round((stats.threatsBlocked / stats.totalScans) * 100)}% of total scans` : "No threat data",
      icon: ShieldAlert,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200"
    },
    {
      title: "Safe Assessments",
      value: stats?.safeScans !== undefined ? stats.safeScans.toLocaleString() : "0",
      caption: "Clean verified inputs",
      icon: ShieldCheck,
      color: "text-[#0F766E]",
      bg: "bg-[#7CD5C7]/20",
      border: "border-[#7CD5C7]/50"
    },
    {
      title: "Community Threat Reports",
      value: stats?.communityReportsCount !== undefined ? stats.communityReportsCount.toLocaleString() : "0",
      caption: "Submitted by community",
      icon: Users,
      color: "text-[#464B71]",
      bg: "bg-[#464B71]/10",
      border: "border-[#464B71]/20"
    },
    {
      title: "Average Trust Score",
      value: stats?.averageTrustScore !== null && stats?.averageTrustScore !== undefined 
        ? `${stats.averageTrustScore}/100` 
        : "N/A",
      caption: hasScans ? "Calculated from real scans" : "No scan data yet",
      icon: Activity,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2.5 h-2.5 rounded-full ${stats?.dbStatus?.isDegraded ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500 font-mono">
              Database: {stats?.dbStatus?.activeEngine || 'Active'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#464B71] tracking-tight">
            Security Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Aggregated metrics and behavioral telemetry computed directly from actual database records.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Demo Data Filter Toggle */}
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9] text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDemo}
              onChange={(e) => setIncludeDemo(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-white border-[#E2E2D9] text-[#118AB2] focus:ring-0 cursor-pointer"
            />
            <span>Include Synthetic Demo Records</span>
          </label>

          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9] text-slate-700 hover:text-[#464B71] hover:border-[#118AB2] transition-colors text-xs flex items-center gap-1.5"
            title="Refresh Metrics"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => onNavigate('analyze')}
            className="px-4 py-2 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#118AB2]/20 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Launch Scanner</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={i} 
              className="p-5 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#464B71] font-mono tracking-tight">
                  {kpi.value}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {kpi.caption}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cybersecurity Training Section: Scam Simulator */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#118AB2]/10 border border-[#118AB2]/20 text-[#118AB2] shrink-0">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/30">
                Cybersecurity Training
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Safe Simulator
              </span>
            </div>
            <h2 className="text-xl font-black text-[#464B71] tracking-tight">
              Scam Simulator — Train Before You Get Scammed
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Sharpen your defensive instincts with realistic interactive attack scenarios. Get scored on decision safety and receive instant Gemini AI tactical feedback.
            </p>
            {stats?.trainingSummary?.recommendedChallenge && (
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600">
                <span className="text-[#118AB2] font-mono font-bold uppercase tracking-wider">Adaptive Target:</span>
                <span className="text-[#2A2E45] font-medium truncate max-w-xs">{stats.trainingSummary.recommendedChallenge}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/20 font-mono">
                  {stats.trainingSummary.recommendedDifficulty || 'Adaptive'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-[#E2E2D9]">
          <div className="flex items-center gap-5">
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Completed</div>
              <div className="text-lg font-black text-[#464B71] font-mono">
                {stats?.trainingSummary?.scenariosCompleted || 0}
              </div>
            </div>
            <div className="w-px h-8 bg-[#E2E2D9]" />
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Awareness</div>
              <div className="text-lg font-black text-[#118AB2] font-mono">
                {stats?.trainingSummary?.averageScore !== undefined ? `${stats.trainingSummary.averageScore}%` : '100%'}
              </div>
            </div>
            <div className="w-px h-8 bg-[#E2E2D9]" />
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Focus Area</div>
              <div className="text-xs font-bold text-amber-700 font-mono truncate max-w-[130px]" title={stats?.trainingSummary?.currentFocus || 'All Concepts'}>
                {stats?.trainingSummary?.currentFocus || stats?.trainingSummary?.weakestCategory || 'All Concepts'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {stats?.trainingSummary?.conceptProgress !== undefined ? `${stats.trainingSummary.conceptProgress}% Mastery` : '100% Mastery'}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('simulator')}
            className="px-4 py-2.5 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#118AB2]/20 flex items-center gap-1.5 shrink-0"
          >
            <span>Open Simulator</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* If 0 scans in database, show clear, honest Empty State */}
      {!hasScans ? (
        <div className="p-12 rounded-3xl bg-white border border-[#E2E2D9] text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="p-4 rounded-2xl bg-[#F9F9F6] border border-[#E2E2D9] w-fit mx-auto text-[#118AB2]">
            <Inbox className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#464B71]">No Scan Data Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              The database does not contain scan records yet. Perform an SMS, URL, or QR scan in the Analyze Center to populate real-time analytics.
            </p>
          </div>
          <button
            onClick={() => onNavigate('analyze')}
            className="px-6 py-2.5 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            Run Your First Scan
          </button>
        </div>
      ) : (
        <>
          {/* Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scans & Threats Timeline */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#464B71] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#118AB2]" />
                    <span>Real Activity Timeline</span>
                  </h3>
                  <p className="text-xs text-slate-500">Aggregated from daily database scan timestamps</p>
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
                          <stop offset="5%" stopColor="#118AB2" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#118AB2" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="threatsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E2D9',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                          color: '#2A2E45',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area type="monotone" dataKey="scans" stroke="#118AB2" strokeWidth={2} fillOpacity={1} fill="url(#scansGrad)" />
                      <Area type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#threatsGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    Insufficient timeline history recorded yet
                  </div>
                )}
              </div>
            </div>

            {/* Risk Distribution */}
            <div className="p-6 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#464B71] mb-1">
                  Risk Level Breakdown
                </h3>
                <p className="text-xs text-slate-500 mb-4">Actual database records by risk category</p>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                {threatDist.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={threatDist}
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {threatDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E2D9',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                          color: '#2A2E45',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
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
            <div className="p-6 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm">
              <div className="mb-6">
                <h3 className="text-base font-bold text-[#464B71]">
                  Identified Threat Categories
                </h3>
                <p className="text-xs text-slate-500">Classifications aggregated from actual scans</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryDist}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E2D9',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#2A2E45',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="count" fill="#118AB2" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Real Analyses Feed Table */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-[#464B71]">
                  Recent Scan Stream
                </h3>
                <p className="text-xs text-slate-500">Chronological telemetry of actual scans saved in database</p>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-semibold text-[#118AB2] hover:text-[#0E7490] flex items-center gap-1"
              >
                <span>View Complete History</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E2D9] text-slate-500 uppercase font-semibold">
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Analyzed Input</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Trust Score</th>
                    <th className="py-3 px-3">Risk Level</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E2D9]">
                  {(stats?.recentScans || []).map((scan) => {
                    let badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    if (scan.riskLevel === "HIGH RISK") badgeClass = "bg-red-50 text-red-700 border-red-200";
                    else if (scan.riskLevel === "SUSPICIOUS") badgeClass = "bg-orange-50 text-orange-700 border-orange-200";
                    else if (scan.riskLevel === "CAUTION") badgeClass = "bg-amber-50 text-amber-700 border-amber-200";

                    return (
                      <tr key={scan.scanId} className="hover:bg-[#F9F9F6] transition-colors">
                        <td className="py-3 px-3 uppercase font-mono font-bold text-[#118AB2]">
                          {scan.type}
                        </td>
                        <td className="py-3 px-3 text-[#2A2E45] font-medium max-w-xs truncate" title={scan.sanitizedInput}>
                          {scan.sanitizedInput}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {scan.detectedCategory}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#464B71]">
                          {scan.trustScore}/100
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                            {scan.riskLevel}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              if (onInspectScan) onInspectScan(scan);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#F9F9F6] hover:bg-[#F2F2ED] text-slate-700 hover:text-[#464B71] border border-[#E2E2D9] transition-colors text-[11px]"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
