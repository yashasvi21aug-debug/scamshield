import React, { useEffect, useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Eye, 
  X, 
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Inbox,
  MessageSquareWarning,
  Globe,
  QrCode,
  CreditCard,
  Download,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { getHistory } from '../services/api';
import TrustScoreGauge from '../components/TrustScoreGauge';
import ThreatReasons from '../components/ThreatReasons';
import ActionChecklist from '../components/ActionChecklist';
import UrlRiskBreakdown from '../components/UrlRiskBreakdown';

export default function HistoryPage({ initialScan, onClearInitialScan }) {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [includeDemo, setIncludeDemo] = useState(false);
  const [selectedScan, setSelectedScan] = useState(initialScan || null);

  useEffect(() => {
    if (initialScan) {
      setSelectedScan(initialScan);
    }
  }, [initialScan]);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      const res = await getHistory({
        limit: 50,
        type: typeFilter === 'all' ? undefined : typeFilter,
        risk: riskFilter === 'all' ? undefined : riskFilter,
        search: searchQuery,
        includeDemo
      });
      setHistoryList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch scan history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, [typeFilter, riskFilter, searchQuery, includeDemo]);

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historyList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fraudlens_audit_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-[#118AB2]" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#118AB2] font-mono">
              Database Audit Trail & Incident Logs
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#464B71] tracking-tight">
            Security Activity Log
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Complete chronological audit trail of all messages, links, and QR codes analyzed. Every record includes verified indicators and explainable score breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportJson}
            disabled={historyList.length === 0}
            className="px-4 py-2.5 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9] hover:border-[#118AB2] text-[#464B71] text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-[#118AB2]" />
            <span>Export Log</span>
          </button>

          <button
            onClick={fetchHistoryData}
            className="px-4 py-2.5 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#118AB2]/20 flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Records</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search input, category, or scan ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-2xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all"
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none self-end md:self-auto">
            <input
              type="checkbox"
              checked={includeDemo}
              onChange={(e) => setIncludeDemo(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-[#F9F9F6] border-[#E2E2D9] text-[#118AB2] focus:ring-0 cursor-pointer"
            />
            <span className="font-medium">Include Synthetic Demo Records</span>
          </label>
        </div>

        {/* Type & Risk Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#E2E2D9]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-bold mr-1">Type:</span>
            {['all', 'sms', 'url', 'qr'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  typeFilter === t
                    ? 'bg-[#118AB2] text-white border-[#118AB2] shadow-sm'
                    : 'bg-[#F9F9F6] text-slate-600 border-[#E2E2D9] hover:text-[#464B71] hover:bg-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-bold mr-1">Risk:</span>
            {['all', 'HIGH RISK', 'SUSPICIOUS', 'CAUTION', 'SAFE'].map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  riskFilter === r
                    ? 'bg-[#464B71] text-white border-[#464B71] shadow-sm'
                    : 'bg-[#F9F9F6] text-slate-600 border-[#E2E2D9] hover:text-[#464B71] hover:bg-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Feed List / Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-[#118AB2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-mono font-bold">Querying database scan logs...</p>
          </div>
        ) : historyList.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white border border-[#E2E2D9] text-center max-w-md mx-auto space-y-4 shadow-sm">
            <Inbox className="w-12 h-12 mx-auto text-slate-400" />
            <div>
              <h3 className="text-base font-bold text-[#464B71]">No Scan Records Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                No activity logs match your query. Inspect a message or link in the Analyze Center to record an audit entry.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {historyList.map((item) => {
              let badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
              if (item.riskLevel === "HIGH RISK") badgeClass = "bg-red-50 text-red-700 border-red-200";
              else if (item.riskLevel === "SUSPICIOUS") badgeClass = "bg-orange-50 text-orange-700 border-orange-200";
              else if (item.riskLevel === "CAUTION") badgeClass = "bg-amber-50 text-amber-700 border-amber-200";

              const TypeIcon = item.type === 'sms' ? MessageSquareWarning : item.type === 'url' ? Globe : QrCode;

              const formattedDate = new Date(item.createdAt || item.date).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={item.scanId}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E2E2D9] hover:border-[#118AB2] hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <div className="p-3 rounded-2xl bg-[#F9F9F6] border border-[#E2E2D9] text-[#118AB2] shrink-0 group-hover:border-[#118AB2]/40 transition-colors">
                      <TypeIcon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#118AB2] px-2 py-0.5 rounded bg-[#118AB2]/10 border border-[#118AB2]/20">
                          {item.type}
                        </span>
                        <span className="text-xs font-semibold text-[#464B71]">
                          {item.detectedCategory || "General Inspection"}
                        </span>
                        {item.isDemo && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-mono">
                            DEMO
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formattedDate}</span>
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-medium text-[#2A2E45] truncate max-w-xl" title={item.sanitizedInput}>
                        {item.sanitizedInput}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E2E2D9]">
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Trust Score</span>
                        <span className="text-sm font-black text-[#464B71] font-mono">
                          {item.trustScore}/100
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                        {item.riskLevel}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedScan(item)}
                      className="px-4 py-2 rounded-xl bg-[#F9F9F6] hover:bg-[#118AB2] hover:text-white text-[#464B71] border border-[#E2E2D9] hover:border-[#118AB2] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Inspection Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E2E2D9] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-[#E2E2D9] bg-[#F9F9F6]">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono uppercase font-bold text-[#118AB2] px-2.5 py-1 rounded-full bg-[#118AB2]/10 border border-[#118AB2]/20">
                  {selectedScan.type}
                </span>
                <h3 className="text-base font-bold text-[#464B71]">
                  Historical Dossier: {selectedScan.scanId}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedScan(null);
                  if (onClearInitialScan) onClearInitialScan();
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-[#464B71] hover:bg-[#E2E2D9]/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Target analyzed */}
              <div className="p-4 rounded-2xl bg-[#F9F9F6] border border-[#E2E2D9] text-xs">
                <span className="text-slate-500 uppercase font-bold text-[10px] block mb-1">
                  Target Analyzed:
                </span>
                <span className="text-[#2A2E45] font-mono break-all leading-relaxed font-semibold">
                  {selectedScan.sanitizedInput}
                </span>
              </div>

              {/* Grid: Trust Score + Reasons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <TrustScoreGauge
                    score={selectedScan.trustScore}
                    risk={{ level: selectedScan.riskLevel }}
                  />
                </div>
                <div className="md:col-span-2">
                  <ThreatReasons
                    threats={selectedScan.detectedIndicators || selectedScan.threats || []}
                    detectedCategory={selectedScan.detectedCategory}
                  />
                </div>
              </div>

              {/* URL breakdown if applicable */}
              {(selectedScan.type === 'url' || selectedScan.urlDetails) && (
                <UrlRiskBreakdown
                  urlDetails={selectedScan.urlDetails}
                  breakdownMeters={selectedScan.breakdownMeters}
                />
              )}

              {/* Action checklist */}
              <ActionChecklist
                recommendations={selectedScan.recommendations || []}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

