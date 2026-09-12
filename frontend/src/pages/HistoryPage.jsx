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
  Inbox
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
        type: typeFilter,
        risk: riskFilter,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-[#118AB2]" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#118AB2] font-mono">
              Database Audit Trail
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#464B71] tracking-tight">
            Threat Analysis History
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl">
            Real scans stored persistently in database storage. Every record includes the full explainable evidence breakdown.
          </p>
        </div>

        <button
          onClick={fetchHistoryData}
          className="p-2.5 rounded-xl bg-[#F2F2ED] border border-[#E2E2D9] text-[#2A2E45] hover:bg-white hover:border-[#118AB2] transition-colors text-xs flex items-center gap-2 self-start md:self-auto font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search input, category, or scan ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <label className="flex items-center gap-2 text-xs text-[#2A2E45] cursor-pointer select-none whitespace-nowrap font-medium">
            <input
              type="checkbox"
              checked={includeDemo}
              onChange={(e) => setIncludeDemo(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-white border-[#E2E2D9] text-[#118AB2] focus:ring-[#118AB2] cursor-pointer"
            />
            <span>Include Synthetic Demo Records</span>
          </label>

          <span className="text-xs text-slate-600 font-medium whitespace-nowrap">Type:</span>
          {['all', 'sms', 'url', 'qr'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors border ${
                typeFilter === t
                  ? 'bg-[#118AB2] text-white border-[#118AB2]'
                  : 'bg-white text-slate-600 border-[#E2E2D9] hover:text-[#464B71]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-2 border-[#118AB2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-mono">Querying database scan logs...</p>
          </div>
        ) : historyList.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs space-y-2">
            <Inbox className="w-8 h-8 mx-auto text-slate-400" />
            <p className="font-semibold text-[#464B71]">No matching scan records found in database.</p>
            <p className="text-slate-500">Run a scan in Analyze Center to populate real audit records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E2D9] text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Analyzed Input</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Trust Score</th>
                  <th className="py-3 px-3">Risk Level</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2D9]">
                {historyList.map((item) => {
                  let badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  if (item.riskLevel === "HIGH RISK") badgeClass = "bg-red-50 text-red-700 border-red-200";
                  else if (item.riskLevel === "SUSPICIOUS") badgeClass = "bg-orange-50 text-orange-700 border-orange-200";
                  else if (item.riskLevel === "CAUTION") badgeClass = "bg-amber-50 text-amber-700 border-amber-200";

                  const formattedDate = new Date(item.createdAt || item.date).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={item.scanId} className="hover:bg-[#F2F2ED]/60 transition-colors">
                      <td className="py-3 px-3 uppercase font-mono font-bold text-[#118AB2]">
                        {item.type}
                        {item.isDemo && (
                          <span className="ml-1 text-[9px] text-amber-700 font-normal bg-amber-50 px-1 py-0.5 rounded border border-amber-200">[DEMO]</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[#2A2E45] font-medium max-w-xs truncate" title={item.sanitizedInput}>
                        {item.sanitizedInput}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.detectedCategory}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#464B71]">
                        {item.trustScore}/100
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                          {item.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedScan(item)}
                          className="px-3 py-1 rounded-lg bg-[#F2F2ED] hover:bg-[#118AB2] hover:text-white text-[#464B71] border border-[#E2E2D9] transition-all text-xs font-semibold flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Breakdown</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Inspection Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E2E2D9] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-[#E2E2D9] bg-[#F2F2ED]/60">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono uppercase font-bold text-[#118AB2] px-2 py-0.5 rounded bg-[#118AB2]/10 border border-[#118AB2]/30">
                  {selectedScan.type}
                </span>
                <h3 className="text-base font-bold text-[#464B71]">
                  Historical Scan Dossier: {selectedScan.scanId}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedScan(null);
                  if (onClearInitialScan) onClearInitialScan();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#464B71] hover:bg-[#E2E2D9]/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Input snippet */}
              <div className="p-4 rounded-xl bg-[#F2F2ED] border border-[#E2E2D9] text-xs">
                <span className="text-slate-500 uppercase font-bold text-[10px] block mb-1">
                  Target Analyzed:
                </span>
                <span className="text-[#2A2E45] font-mono break-all leading-relaxed">
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

              {/* Safe action checklist */}
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
