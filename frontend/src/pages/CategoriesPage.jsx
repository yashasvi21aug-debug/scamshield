import React, { useEffect, useState } from 'react';
import { 
  Layers, 
  ShieldAlert, 
  AlertOctagon, 
  CheckCircle2, 
  ExternalLink, 
  Search,
  Eye,
  Zap,
  ArrowRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { getCategories } from '../services/api';

const DEFAULT_CATEGORIES = [
  {
    id: "cat-banking",
    name: "Banking & Netbanking Impersonation",
    riskLevel: "Critical",
    description: "Fraudulent SMS or WhatsApp messages masquerading as authorized banking institutions (SBI, HDFC, ICICI, Axis). Attackers claim your account or debit card has been blocked, urging immediate login at a deceptive phishing clone.",
    commonTactics: [
      "Simulated system alerts alleging PAN card de-linking or non-compliance",
      "Deceptive domain typosquatting mimicking official netbanking portals",
      "High urgency time limits ('account suspended within 2 hours')"
    ],
    redFlags: [
      "Sender header is a 10-digit personal mobile number rather than a registered 6-character bank sender ID",
      "URL uses non-standard TLDs (.top, .xyz, .cc) or raw IP addresses",
      "Website requests OTP, ATM PIN, or password for 'verification'"
    ]
  },
  {
    id: "cat-upi",
    name: "UPI Reverse-Charge & QR Collect Traps",
    riskLevel: "High",
    description: "Social engineering traps deployed on classifieds (OLX, Quikr) or fake customer service pages where fraudsters send a QR code or UPI collect request while deceitfully promising that scanning will deposit money into the victim's account.",
    commonTactics: [
      "Flipping the transaction direction: disguising a debit collect request as an incoming deposit",
      "Instructing the victim to enter their UPI PIN 'to receive cashback or refund'",
      "Fake OLX buyer stating they work in the armed forces or government service"
    ],
    redFlags: [
      "Any request claiming you need to enter your UPI PIN to receive incoming money (PIN is strictly for debits)",
      "QR codes labeled 'Scan to Receive Refund' or 'Scan to Accept Payment'",
      "Payment note containing reversed parameters or personal UPI handles"
    ]
  },
  {
    id: "cat-delivery",
    name: "Courier & Delivery Rescheduling Phishing",
    riskLevel: "Medium-High",
    description: "Deceptive notifications imitating India Post, BlueDart, DTDC, or FedEx claiming a parcel is stuck at a logistics facility due to an incomplete address or unpaid ₹5 re-delivery fee.",
    commonTactics: [
      "Requiring an insignificant nominal payment (₹5 or ₹10) to harvest full credit/debit card numbers and CVV",
      "Shortened Bitly or TinyURL links concealing malicious landing pages",
      "Automated SMS dispatched at odd hours when victims are distracted"
    ],
    redFlags: [
      "Demands online credit card payment for a parcel you never ordered",
      "Link directs to a spoofed logistics page instead of indiapost.gov.in",
      "SMS contains a fake tracking number that does not exist in official systems"
    ]
  },
  {
    id: "cat-utility",
    name: "Electricity & Utility Disconnection Extortion",
    riskLevel: "High",
    description: "Urgent threats alleging your electricity, water, or gas connection will be severed at 9:30 PM due to an unpaid previous bill, providing an unofficial personal contact number of a 'disconnection officer'.",
    commonTactics: [
      "Manufactured deadline timed right before evening to induce panic",
      "Directing the victim to call an unofficial mobile number",
      "Coercing the victim into installing remote desktop software (AnyDesk, TeamViewer)"
    ],
    redFlags: [
      "Electricity disconnections are never conducted via unsolicited personal WhatsApp or SMS threats",
      "Fraudster instructs you to install an unknown APK or remote support tool",
      "Demand for immediate UPI transfer to a personal handle rather than official discom portal"
    ]
  },
  {
    id: "cat-kyc",
    name: "SIM Card & Telecom KYC Expiry Traps",
    riskLevel: "Critical",
    description: "Fraudsters impersonate telecom operators (Jio, Airtel, Vi) asserting that your SIM card will be deactivated within 24 hours unless you complete mandatory physical KYC or document verification.",
    commonTactics: [
      "Threatening phone loss and SIM disconnection",
      "Requesting identity documents (Aadhaar, PAN) via unverified web forms",
      "Instructing a ₹10 recharge via an attacker-controlled gateway to capture card data"
    ],
    redFlags: [
      "Telecom regulations require verification via authorized operator retail stores or official apps",
      "SMS originates from personal numbers rather than registered corporate sender alphanumeric IDs",
      "Links contain suspicious subdomains attempting to look like telecom names"
    ]
  },
  {
    id: "cat-job",
    name: "Part-Time Task & Telegram Investment Schemes",
    riskLevel: "High",
    description: "Offers of high-yield daily income for liking YouTube videos, rating Google Maps locations, or completing hotel reviews, transitioning into high-stakes crypto or trading account freezes.",
    commonTactics: [
      "Initial small real payouts (₹150 - ₹500) to establish false credibility",
      "Migration from WhatsApp to private Telegram groups with fake testimonials",
      "Demanding 'pre-paid task deposits' of increasingly large amounts that can never be withdrawn"
    ],
    redFlags: [
      "Legitimate corporations do not recruit employees via random WhatsApp messages",
      "Requirement to deposit personal money in order to unlock supposed earnings",
      "Communication exclusively managed via anonymous Telegram accounts"
    ]
  }
];

export default function CategoriesPage({ onNavigate }) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(DEFAULT_CATEGORIES[0]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        if (data && data.length > 0) {
          setCategories(data);
          setSelectedCat(data[0]);
        }
      } catch (err) {
        console.error("Categories fetch error, using robust defaults:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase()) ||
    (c.commonTactics && c.commonTactics.some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
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

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search category, keyword, tactic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-2xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Main Grid: Left Category Selector + Right Detailed Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-3 max-h-[780px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-400">
              Taxonomy Indices ({filtered.length})
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Click to inspect</span>
          </div>

          {filtered.map((cat) => {
            const isSelected = selectedCat?.id === cat.id;
            let riskBadge = "bg-red-50 text-red-700 border-red-200";
            if (cat.riskLevel === 'High') riskBadge = "bg-orange-50 text-orange-700 border-orange-200";
            else if (cat.riskLevel === 'Medium-High' || cat.riskLevel === 'Medium') riskBadge = "bg-amber-50 text-amber-700 border-amber-200";

            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCat(cat)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#118AB2] shadow-md ring-1 ring-[#118AB2]/30'
                    : 'bg-[#F9F9F6] border-[#E2E2D9] hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#118AB2] shrink-0" />
                    )}
                    <h3 className={`text-sm font-bold truncate ${isSelected ? 'text-[#118AB2]' : 'text-[#464B71]'}`}>
                      {cat.name}
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 font-mono ${riskBadge}`}>
                    {cat.riskLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E2E2D9] text-xs text-slate-500">
              No scam categories matching "{search}".
            </div>
          )}
        </div>

        {/* Right Dossier Detail View */}
        <div className="lg:col-span-7">
          {selectedCat ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-[#E2E2D9]">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#118AB2] uppercase tracking-widest block mb-1">
                    TAXONOMY RECORD • {selectedCat.id}
                  </span>
                  <h2 className="text-2xl font-black text-[#464B71] tracking-tight">
                    {selectedCat.name}
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 font-mono">
                  {selectedCat.riskLevel} Severity
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#464B71] mb-2 font-mono flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#118AB2]" />
                  <span>Threat Mechanism Overview</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-[#F9F9F6] p-4 rounded-2xl border border-[#E2E2D9]">
                  {selectedCat.description}
                </p>
              </div>

              {/* Common Tactics */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#464B71] mb-2.5 font-mono flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>Attack Modus Operandi & Psychological Levers</span>
                </h4>
                <div className="space-y-2">
                  {(selectedCat.commonTactics || []).map((tactic, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9] text-xs text-slate-700">
                      <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{tactic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Flags Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#464B71] mb-2.5 font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  <span>Critical Red Flags to Identify</span>
                </h4>
                <div className="space-y-2">
                  {(selectedCat.redFlags || []).map((flag, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50/70 border border-red-200 text-xs text-red-950">
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Action CTA */}
              <div className="pt-5 border-t border-[#E2E2D9] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Suspicious of an active communication in this category?
                </span>
                <button
                  onClick={() => onNavigate && onNavigate('analyze')}
                  className="px-5 py-2.5 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#118AB2]/20 flex items-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Run Deep Scan Now</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-[#E2E2D9]">
              Select a threat category to view intelligence dossier
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

