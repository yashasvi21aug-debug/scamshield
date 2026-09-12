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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-[#118AB2]" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#118AB2] font-mono">
              Threat Intelligence Dossier
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#464B71] tracking-tight">
            Scam Categories & Taxonomy
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl">
            In-depth analysis of prevailing fraud patterns, psychological manipulation triggers, and critical red flags across contemporary threat vectors.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search category or tactic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2]"
          />
        </div>
      </div>

      {/* Main Grid: Left Category Selector + Right Detailed Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
          {filtered.map((cat) => {
            const isSelected = selectedCat?.id === cat.id;
            let riskBadge = "bg-red-50 text-red-700 border-red-200";
            if (cat.riskLevel === 'High') riskBadge = "bg-orange-50 text-orange-700 border-orange-200";
            else if (cat.riskLevel === 'Medium-High') riskBadge = "bg-amber-50 text-amber-700 border-amber-200";

            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCat(cat)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#118AB2] shadow-md'
                    : 'bg-[#F9F9F6] border-[#E2E2D9] hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className={`text-sm font-bold ${isSelected ? 'text-[#118AB2]' : 'text-[#464B71]'}`}>
                    {cat.name}
                  </h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${riskBadge}`}>
                    {cat.riskLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {cat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Dossier Detail View */}
        <div className="lg:col-span-7">
          {selectedCat ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-md space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-[#E2E2D9]">
                <div>
                  <span className="text-xs font-mono font-bold text-[#118AB2] uppercase tracking-widest block mb-1">
                    Dossier ID: {selectedCat.id}
                  </span>
                  <h2 className="text-2xl font-black text-[#464B71]">
                    {selectedCat.name}
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                  {selectedCat.riskLevel} Severity
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#464B71] mb-2">
                  Threat Overview
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-[#F9F9F6] p-4 rounded-xl border border-[#E2E2D9]">
                  {selectedCat.description}
                </p>
              </div>

              {/* Common Tactics */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#464B71] mb-2.5">
                  Attack Modus Operandi & Psychological Levers
                </h4>
                <div className="space-y-2">
                  {(selectedCat.commonTactics || []).map((tactic, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9] text-xs text-slate-700">
                      <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{tactic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Flags Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#464B71] mb-2.5">
                  Critical Red Flags to Identify
                </h4>
                <div className="space-y-2">
                  {(selectedCat.redFlags || []).map((flag, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-50/60 border border-red-200 text-xs text-red-900">
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Action CTA */}
              <div className="pt-4 border-t border-[#E2E2D9] flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Suspicious of an active incident in this category?
                </span>
                <button
                  onClick={() => onNavigate('analyze')}
                  className="px-4 py-2 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
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
