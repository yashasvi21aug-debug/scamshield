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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-cyber-900/80 border border-cyber-700/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-wider text-cyan-400 font-mono">
              Crowdsourced Threat Verification
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Community Scam Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
            Community reports are crowdsourced incident signals. Confidence levels (Low, Medium, High) are determined strictly by confirmed multi-user reports.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-400 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-500/20 transition-all self-start md:self-auto"
        >
          <Flag className="w-4 h-4" />
          <span>Report Threat</span>
        </button>
      </div>

      {voteNotice && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${
          voteNotice.type === 'error' 
            ? 'bg-red-500/10 border-red-500/30 text-red-300' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          {voteNotice.type === 'error' ? <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          <span>{voteNotice.msg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search indicator, phone, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cyber-900 border border-cyber-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={includeDemo}
              onChange={(e) => setIncludeDemo(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-cyber-900 border-cyber-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span>Include Synthetic Demo Reports</span>
          </label>

          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 font-medium">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {['all', 'Banking Fraud', 'UPI / Payment Scam', 'Utility Extortion', 'Job Scam', 'Delivery Scam'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                categoryFilter === cat
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40'
                  : 'bg-cyber-900 text-slate-400 border-cyber-800 hover:text-slate-200'
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
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-mono">Retrieving verified community records from database...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 rounded-3xl bg-cyber-900/40 border border-cyber-800 text-center max-w-md mx-auto space-y-3">
          <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Community Reports Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No incident reports currently match the query. Be the first to submit a newly observed threat indicator.
          </p>
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
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
                className="p-6 rounded-2xl bg-cyber-900/80 border border-cyber-700/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between group glass-card-hover"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyber-950 border border-cyber-700 text-cyan-300">
                      {report.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isHighConfidence 
                        ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                        : report.confidence === 'Medium'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }`}>
                      {report.confidence} Confidence
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                    {report.title}
                  </h3>

                  <div className="p-2.5 rounded-xl bg-cyber-950/80 border border-cyber-800 text-xs font-mono text-amber-300 break-all mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{report.indicator}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">
                    {report.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-cyber-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{report.region || 'Unspecified'}</span>
                    </span>
                    <span className="font-mono font-semibold text-slate-200">
                      {report.reportCount} confirmation{report.reportCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={(e) => handleUpvote(report.reportId, e)}
                      disabled={upvotingId === report.reportId}
                      className="px-3 py-1.5 rounded-xl bg-cyber-950 hover:bg-cyber-800 border border-cyber-700 hover:border-cyan-400 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Confirm Incident (+1)</span>
                    </button>

                    {report.isDemo && (
                      <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">
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
