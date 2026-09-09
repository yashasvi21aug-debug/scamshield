import React, { useEffect, useState } from 'react';
import { 
  Layers, 
  ShieldAlert, 
  AlertOctagon, 
  CheckCircle2, 
  ExternalLink, 
  Search,
  Eye
} from 'lucide-react';
import { getCategories } from '../services/api';

export default function CategoriesPage({ onNavigate }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
        if (data && data.length > 0) setSelectedCat(data[0]);
      } catch (err) {
        console.error("Categories fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-cyber-900/80 border border-cyber-700/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs uppercase font-bold tracking-wider text-cyan-400 font-mono">
              Threat Intelligence Dossier
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Scam Categories & Taxonomy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
            In-depth analysis of prevailing fraud patterns, psychological manipulation triggers, and critical red flags across contemporary threat vectors.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search category or tactic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cyber-950 border border-cyber-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Main Grid: Left Category Selector + Right Detailed Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
          {filtered.map((cat) => {
            const isSelected = selectedCat?.id === cat.id;
            let riskBadge = "bg-red-500/10 text-red-400 border-red-500/30";
            if (cat.riskLevel === 'High') riskBadge = "bg-orange-500/10 text-orange-400 border-orange-500/30";
            else if (cat.riskLevel === 'Medium-High') riskBadge = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";

            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCat(cat)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyber-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'bg-cyber-950/60 border-cyber-800 hover:border-cyber-700 hover:bg-cyber-900/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className={`text-sm font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                    {cat.name}
                  </h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${riskBadge}`}>
                    {cat.riskLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {cat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Dossier Detail View */}
        <div className="lg:col-span-7">
          {selectedCat ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-cyber-900/90 border border-cyber-700/90 shadow-2xl backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-cyber-800">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                    Dossier ID: {selectedCat.id}
                  </span>
                  <h2 className="text-2xl font-black text-white">
                    {selectedCat.name}
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
                  {selectedCat.riskLevel} Severity
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Threat Overview
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-cyber-950/60 p-4 rounded-xl border border-cyber-800">
                  {selectedCat.description}
                </p>
              </div>

              {/* Common Tactics */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                  Attack Modus Operandi & Psychological Levers
                </h4>
                <div className="space-y-2">
                  {(selectedCat.commonTactics || []).map((tactic, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-cyber-950/40 border border-cyber-800 text-xs text-slate-300">
                      <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{tactic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Flags Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                  Critical Red Flags to Identify
                </h4>
                <div className="space-y-2">
                  {(selectedCat.redFlags || []).map((flag, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-950/10 border border-red-500/20 text-xs text-red-200">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Action CTA */}
              <div className="pt-4 border-t border-cyber-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Suspicious of an active incident in this category?
                </span>
                <button
                  onClick={() => onNavigate('analyze')}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Run Deep Scan
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              Select a category to view intelligence dossier
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
