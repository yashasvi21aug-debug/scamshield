import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Flag, 
  ThumbsUp, 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  Calendar, 
  Filter, 
  CheckCircle2,
  Radio,
  Inbox,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';
import { getCommunityReports, upvoteCommunityReport } from '../services/api';

export default function CommunityPage({ onOpenReportModal }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [includeDemo, setIncludeDemo] = useState(false);
  const [upvotingId, setUpvotingId] = useState(null);
  const [voteNotice, setVoteNotice] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getCommunityReports(categoryFilter === 'all' ? undefined : categoryFilter, searchQuery, includeDemo);
      setReports(data || []);
    } catch (err) {
      console.error("Failed to load community reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [categoryFilter, searchQuery, includeDemo]);

  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    try {
      setUpvotingId(id);
      setVoteNotice(null);
      const updated = await upvoteCommunityReport(id);
      setReports(prev => prev.map(r => r.reportId === id ? { ...r, reportCount: updated.reportCount, confidence: updated.confidence } : r));
      setVoteNotice({ type: 'success', msg: "Threat confirmation recorded into database." });
    } catch (err) {
      setVoteNotice({ type: 'error', msg: err.message || "Failed to confirm threat report." });
    } finally {
      setUpvotingId(null);
      setTimeout(() => setVoteNotice(null), 4000);
    }
  };

  // Filter by status if requested
  const filteredReports = reports.filter(r => {
    if (statusFilter === 'all') return true;
    const isConfirmed = r.confidence === 'High' || r.confidence === 'Critical' || (r.reportCount && r.reportCount >= 2);
    if (statusFilter === 'confirmed') return isConfirmed;
    if (statusFilter === 'investigating') return !isConfirmed;
    return true;
  });

  // Calculate live stats
  const totalReportsCount = reports.length;
  const confirmedCount = reports.filter(r => r.confidence === 'High' || r.confidence === 'Critical' || (r.reportCount && r.reportCount >= 2)).length;
  const underReviewCount = totalReportsCount - confirmedCount;
  const topThreatCategory = reports.length > 0 
    ? (reports.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {}))
    : null;
  const topThreatName = topThreatCategory 
    ? Object.keys(topThreatCategory).sort((a, b) => topThreatCategory[b] - topThreatCategory[a])[0] 
    : "Electricity Bill SMS";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-[#118AB2] animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#118AB2] font-mono">
              Crowdsourced Threat Verification Network
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#464B71] tracking-tight">
            Community-Powered Fraud Intelligence
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Real reports from real users. Verified by AI heuristics. Protecting everyone in the decentralized FraudLens ecosystem.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-6 py-3.5 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#118AB2]/20 transition-all self-start md:self-auto shrink-0"
        >
          <Flag className="w-4 h-4" />
          <span>Report a Scam</span>
        </button>
      </div>

      {voteNotice && (
        <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200 ${
          voteNotice.type === 'error' 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {voteNotice.type === 'error' ? <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          <span>{voteNotice.msg}</span>
        </div>
      )}

      {/* Top 4 Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="w-1.5 h-full absolute left-0 top-0 bg-[#118AB2]" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Reports
            </span>
            <div className="p-2 rounded-xl bg-[#118AB2]/10 text-[#118AB2]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#464B71] font-mono">
              {totalReportsCount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Submitted by community</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="w-1.5 h-full absolute left-0 top-0 bg-red-500" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Confirmed Scams
            </span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-red-600 font-mono">
              {confirmedCount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Multi-user confirmed</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="w-1.5 h-full absolute left-0 top-0 bg-amber-500" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Under Review
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-700 font-mono">
              {underReviewCount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Active verification cycle</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="w-1.5 h-full absolute left-0 top-0 bg-[#464B71]" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Top Emerging Vector
            </span>
            <div className="p-2 rounded-xl bg-[#464B71]/10 text-[#464B71]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-base font-bold text-[#464B71] truncate" title={topThreatName}>
              {topThreatName}
            </div>
            <div className="text-[11px] text-[#118AB2] font-semibold mt-1">Highest frequency this week</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by keyword, phone number, or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-2xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeDemo}
                onChange={(e) => setIncludeDemo(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-[#F9F9F6] border-[#E2E2D9] text-[#118AB2] focus:ring-0 cursor-pointer"
              />
              <span className="font-medium">Include Synthetic Demo Reports</span>
            </label>
          </div>
        </div>

        {/* Category Pills & Status Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2E2D9]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-bold mr-1">Category:</span>
            {['all', 'SMS', 'URL', 'QR', 'UPI', 'Call'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat.toLowerCase())}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  categoryFilter === cat.toLowerCase()
                    ? 'bg-[#118AB2] text-white border-[#118AB2] shadow-sm'
                    : 'bg-[#F9F9F6] text-slate-600 border-[#E2E2D9] hover:text-[#464B71] hover:bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold mr-1">Status:</span>
            {['all', 'confirmed', 'investigating'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  statusFilter === st
                    ? 'bg-[#464B71] text-white border-[#464B71] shadow-sm'
                    : 'bg-[#F9F9F6] text-slate-600 border-[#E2E2D9] hover:text-[#464B71] hover:bg-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-3 border-[#118AB2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-mono font-bold">Querying verified threat database records...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-[#E2E2D9] text-center max-w-md mx-auto space-y-4 shadow-sm">
          <Inbox className="w-12 h-12 text-slate-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-[#464B71]">No Reports Found</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              No community incident reports match your active search and filters. Be the first to report this threat.
            </p>
          </div>
          <button
            onClick={onOpenReportModal}
            className="px-5 py-2.5 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            Be the First to Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const isHighConfidence = report.confidence === "High" || report.confidence === "Critical";
            return (
              <div
                key={report.reportId}
                className="p-6 rounded-3xl bg-white border border-[#E2E2D9] hover:border-[#118AB2] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/20 font-mono">
                      {report.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isHighConfidence 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : report.confidence === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {isHighConfidence ? 'CONFIRMED' : 'INVESTIGATING'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#464B71] group-hover:text-[#118AB2] transition-colors mb-2">
                    {report.title}
                  </h3>

                  <div className="p-2.5 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9] text-xs font-mono text-amber-800 break-all mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{report.indicator}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                    {report.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E2E2D9] space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#118AB2] shrink-0" />
                      <span className="truncate">{report.region || 'National Detection'}</span>
                    </span>
                    <span className="font-mono font-semibold text-[#464B71]">
                      {report.reportCount} verification{report.reportCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={(e) => handleUpvote(report.reportId, e)}
                      disabled={upvotingId === report.reportId}
                      className="px-3 py-1.5 rounded-xl bg-[#F9F9F6] hover:bg-[#F2F2ED] border border-[#E2E2D9] hover:border-[#118AB2] text-slate-700 hover:text-[#464B71] text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-[#118AB2]" />
                      <span>Verify This (+1)</span>
                    </button>

                    {report.isDemo && (
                      <span className="text-[10px] text-amber-700 font-mono font-bold uppercase">
                        Demo Record
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

