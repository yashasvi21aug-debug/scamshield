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
  Inbox
} from 'lucide-react';
import { getCommunityReports, upvoteCommunityReport } from '../services/api';

export default function CommunityPage({ onOpenReportModal }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [includeDemo, setIncludeDemo] = useState(false);
  const [upvotingId, setUpvotingId] = useState(null);
  const [voteNotice, setVoteNotice] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getCommunityReports(categoryFilter, searchQuery, includeDemo);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-[#118AB2] animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#118AB2] font-mono">
              Crowdsourced Threat Verification
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#464B71] tracking-tight">
            Community Scam Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl">
            Community reports are crowdsourced incident signals. Confidence levels (Low, Medium, High) are determined strictly by confirmed multi-user reports.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-6 py-3.5 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#118AB2]/20 transition-all self-start md:self-auto"
        >
          <Flag className="w-4 h-4" />
          <span>Report Threat</span>
        </button>
      </div>

      {voteNotice && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${
          voteNotice.type === 'error' 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {voteNotice.type === 'error' ? <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          <span>{voteNotice.msg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search indicator, phone, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={includeDemo}
              onChange={(e) => setIncludeDemo(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-white border-[#E2E2D9] text-[#118AB2] focus:ring-0 cursor-pointer"
            />
            <span>Include Synthetic Demo Reports</span>
          </label>

          <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0 font-medium">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {['all', 'Banking Fraud', 'UPI / Payment Scam', 'Utility Extortion', 'Job Scam', 'Delivery Scam'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                categoryFilter === cat
                  ? 'bg-[#118AB2] text-white border-[#118AB2]'
                  : 'bg-white text-slate-600 border-[#E2E2D9] hover:text-[#464B71]'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-2 border-[#118AB2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-mono">Retrieving verified community records from database...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-[#E2E2D9] text-center max-w-md mx-auto space-y-3 shadow-sm">
          <Inbox className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-[#464B71]">No Community Reports Found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            No incident reports currently match the query. Be the first to submit a newly observed threat indicator.
          </p>
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white font-bold text-xs uppercase tracking-wider"
          >
            Submit Incident Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const isHighConfidence = report.confidence === "High" || report.confidence === "Critical";
            return (
              <div
                key={report.reportId}
                className="p-6 rounded-2xl bg-white border border-[#E2E2D9] hover:border-[#118AB2]/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F9F9F6] border border-[#E2E2D9] text-[#118AB2]">
                      {report.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isHighConfidence 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : report.confidence === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {report.confidence} Confidence
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
                      <span className="truncate">{report.region || 'Unspecified'}</span>
                    </span>
                    <span className="font-mono font-semibold text-[#464B71]">
                      {report.reportCount} confirmation{report.reportCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={(e) => handleUpvote(report.reportId, e)}
                      disabled={upvotingId === report.reportId}
                      className="px-3 py-1.5 rounded-xl bg-[#F9F9F6] hover:bg-[#F2F2ED] border border-[#E2E2D9] hover:border-[#118AB2] text-slate-700 hover:text-[#464B71] text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-[#118AB2]" />
                      <span>Confirm Incident (+1)</span>
                    </button>

                    {report.isDemo && (
                      <span className="text-[10px] text-amber-700 font-mono font-bold uppercase">
                        Demo
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
