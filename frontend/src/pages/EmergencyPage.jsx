import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  PhoneCall, 
  ExternalLink, 
  FileText, 
  Copy, 
  Check, 
  RotateCcw,
  ShieldAlert,
  Clock,
  Lock,
  Building,
  PhoneForwarded,
  ArrowRight
} from 'lucide-react';
import { getEmergencyResources } from '../services/api';

const DEFAULT_RESOURCES = [
  {
    country: "India",
    jurisdiction: "Statutory / MHA",
    title: "National Cyber Crime Reporting Portal",
    identifier: "1930",
    callUrl: "tel:1930",
    description: "Citizen Financial Cyber Fraud Reporting System (CFCFRS) operated by the Indian Cyber Crime Coordination Centre (I4C). Direct hotline to freeze fraudulent inter-bank transfers.",
    portalUrl: "https://cybercrime.gov.in"
  },
  {
    country: "India",
    jurisdiction: "Reserve Bank of India",
    title: "RBI Sachet Portal",
    identifier: "sachet.rbi.org.in",
    description: "Official RBI fraud reporting portal to flag unauthorized banking apps, unregistered financial companies, and illegal lending platforms.",
    portalUrl: "https://sachet.rbi.org.in"
  },
  {
    country: "India",
    jurisdiction: "Dept of Telecom (DoT)",
    title: "Chakshu / Sanchar Saathi",
    identifier: "sancharsaathi.gov.in",
    description: "Report suspected fraudulent SMS, malicious phone calls, spoofed WhatsApp handles, or stolen handset IMEIs for statutory blacklisting.",
    portalUrl: "https://sancharsaathi.gov.in"
  }
];

export default function EmergencyPage() {
  const [resources, setResources] = useState(DEFAULT_RESOURCES);
  const [copiedLog, setCopiedLog] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    bankName: '',
    transactionId: '',
    amountLost: '',
    fraudPlatform: 'Fake SMS / Phishing Link',
    fraudsterContact: '',
    incidentSummary: ''
  });

  useEffect(() => {
    getEmergencyResources()
      .then(data => {
        if (data && data.length > 0) {
          setResources(data);
        }
      })
      .catch(() => {
        // Retain verified statutory fallbacks
      });
  }, []);

  const generateReport = () => {
    return `=== CYBER FRAUD INCIDENT REPORT ===
Generated via FraudLens AI Emergency Incident Protocol
Timestamp: ${new Date().toISOString()}

1. Threat Category: ${incidentForm.fraudPlatform}
2. Financial Entity / Bank: ${incidentForm.bankName || 'Not specified'}
3. Amount at Risk / Debited: ${incidentForm.amountLost ? `₹${incidentForm.amountLost}` : 'Not specified'}
4. Transaction UTR / Ref Number: ${incidentForm.transactionId || 'Not provided'}
5. Suspect Phone / UPI ID / Link: ${incidentForm.fraudsterContact || 'Not provided'}

Incident Chronology & Modus Operandi:
${incidentForm.incidentSummary || 'No summary text provided.'}

Immediate Defensive Actions Initiated:
- Network isolation (Wi-Fi and mobile data disconnected)
- Netbanking credentials and cards locked via mobile app
- Statutory helpline notified (National Cyber Crime Helpline 1930)`;
  };

  const handleCopyLog = () => {
    navigator.clipboard.writeText(generateReport());
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const handleResetForm = () => {
    setIncidentForm({
      bankName: '',
      transactionId: '',
      amountLost: '',
      fraudPlatform: 'Fake SMS / Phishing Link',
      fraudsterContact: '',
      incidentSummary: ''
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Emergency Header Alert Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#464B71] to-[#383C5A] text-white shadow-xl relative overflow-hidden border border-[#464B71]">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-red-500/20 text-red-400 rounded-2xl border border-red-500/30 shrink-0 shadow-inner">
              <AlertOctagon className="w-8 h-8 animate-pulse text-red-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
                <span className="text-[11px] uppercase font-bold tracking-widest text-red-300 font-mono">
                  Immediate Emergency Triage
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Think You've Been Scammed?
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-xl leading-relaxed">
                Act immediately. The first <strong className="text-white font-semibold">2 to 3 hours</strong> ("The Golden Window") are critical for disputing unauthorized transactions and requesting an inter-bank stop on transfer funds.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <a
              href="tel:1930"
              className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/30 transition-all text-center"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Helpline 1930</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#7CD5C7]" />
            </a>
          </div>
        </div>
      </div>

      {/* Immediate 4-Step Action Protocol */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#464B71] font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#118AB2]" />
            <span>Immediate 4-Step Containment Protocol</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">Follow sequentially</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm space-y-2.5 hover:border-[#118AB2]/40 transition-all">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-red-50 text-red-600 font-mono font-bold flex items-center justify-center text-xs border border-red-200 shadow-xs">
                01
              </span>
              <h3 className="text-sm font-bold text-[#464B71]">Stop All Interaction & Disconnect</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-11">
              Immediately close suspicious tabs, disconnect Wi-Fi and cellular data, and terminate active phone or video calls. Do not yield to threats of arrest or account deactivation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm space-y-2.5 hover:border-[#118AB2]/40 transition-all">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-red-50 text-red-600 font-mono font-bold flex items-center justify-center text-xs border border-red-200 shadow-xs">
                02
              </span>
              <h3 className="text-sm font-bold text-[#464B71]">Freeze Cards & Lock Netbanking</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-11">
              Open your official mobile banking app. Use in-app security controls to immediately freeze debit/credit cards, disable international transactions, and block UPI payments.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm space-y-2.5 hover:border-[#118AB2]/40 transition-all">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 font-mono font-bold flex items-center justify-center text-xs border border-amber-200 shadow-xs">
                03
              </span>
              <h3 className="text-sm font-bold text-[#464B71]">Contact Bank Emergency Desk</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-11">
              Call your bank's verified helpline (found on the reverse of your physical card). Request an immediate transaction lien / stop-payment on the suspicious transfer reference or UTR.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm space-y-2.5 hover:border-[#118AB2]/40 transition-all">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-[#118AB2]/10 text-[#118AB2] font-mono font-bold flex items-center justify-center text-xs border border-[#118AB2]/30 shadow-xs">
                04
              </span>
              <h3 className="text-sm font-bold text-[#464B71]">Secure Accounts & Scan Apps</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-11">
              From a secondary safe device, update netbanking & primary email passwords. Check device for installed remote-access tools (AnyDesk, TeamViewer, RustDesk) and uninstall them immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Official Cyber Fraud Reporting Resources */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-[#E2E2D9]">
          <div>
            <h3 className="text-lg font-bold text-[#464B71] flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-[#118AB2]" />
              <span>Verified Statutory Helplines & Portals</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official governmental and statutory agencies for financial cyber fraud reporting
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#0F766E] bg-[#7CD5C7]/20 border border-[#7CD5C7]/50 px-2.5 py-1 rounded-full">
            Direct Statutory Channels
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {resources.map((res, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#F9F9F6] border border-[#E2E2D9] flex flex-col justify-between space-y-4 hover:border-[#118AB2]/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#118AB2] font-mono">
                    {res.country} • {res.jurisdiction}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#464B71]">{res.title}</h4>
                <div className="text-2xl font-black text-[#118AB2] font-mono my-1.5">
                  {res.identifier}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {res.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E2E2D9] flex items-center justify-between gap-2">
                {res.callUrl ? (
                  <a
                    href={res.callUrl}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <PhoneForwarded className="w-3.5 h-3.5" />
                    <span>Call Directly</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">Web Portal</span>
                )}

                {res.portalUrl && (
                  <a
                    href={res.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#118AB2] hover:text-[#0e7490] flex items-center gap-1"
                  >
                    <span>Visit Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-[#F2F2ED] border border-[#E2E2D9] flex items-start gap-2.5 text-xs text-slate-600">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Disclaimer:</strong> FraudLens AI is an autonomous detection and triage platform. For recovery of debited funds or formal First Information Reports (FIR), please file directly with official statutory law enforcement authorities.
          </span>
        </div>
      </div>

      {/* Incident Log Generator */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#E2E2D9]">
          <div>
            <h3 className="text-lg font-bold text-[#464B71] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#118AB2]" />
              <span>Incident Dossier Generator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate a structured factual record ready for bank dispute forms or police complaints
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetForm}
              className="px-3 py-2 rounded-xl bg-[#F2F2ED] border border-[#E2E2D9] text-[#2A2E45] hover:bg-white text-xs font-medium transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleCopyLog}
              className="px-4 py-2 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#118AB2]/20 transition-all"
            >
              {copiedLog ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLog ? "Copied Dossier!" : "Copy Formatted Dossier"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#464B71] mb-1.5 font-mono">
              Bank / Payment Service
            </label>
            <input
              type="text"
              placeholder="e.g. State Bank of India, HDFC, Google Pay"
              value={incidentForm.bankName}
              onChange={(e) => setIncidentForm({ ...incidentForm, bankName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#464B71] mb-1.5 font-mono">
              Amount In Question (₹)
            </label>
            <input
              type="text"
              placeholder="e.g. 25000"
              value={incidentForm.amountLost}
              onChange={(e) => setIncidentForm({ ...incidentForm, amountLost: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#464B71] mb-1.5 font-mono">
              Transaction UTR / Reference ID
            </label>
            <input
              type="text"
              placeholder="e.g. 429188201948"
              value={incidentForm.transactionId}
              onChange={(e) => setIncidentForm({ ...incidentForm, transactionId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#464B71] mb-1.5 font-mono">
              Fraudster Contact (Phone / Handle / Link)
            </label>
            <input
              type="text"
              placeholder="e.g. +91 98214 09182 or refund@okaxis"
              value={incidentForm.fraudsterContact}
              onChange={(e) => setIncidentForm({ ...incidentForm, fraudsterContact: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#464B71] mb-1.5 font-mono">
            Incident Description & Timeline
          </label>
          <textarea
            rows={3}
            placeholder="Describe how contact was initiated, what instructions were given, what details you shared, and when the debits occurred."
            value={incidentForm.incidentSummary}
            onChange={(e) => setIncidentForm({ ...incidentForm, incidentSummary: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all resize-none"
          />
        </div>

        <div className="p-4 rounded-2xl bg-[#F2F2ED] border border-[#E2E2D9]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
              Live Formatted Complaint Record:
            </span>
            <span className="text-[10px] font-mono text-[#118AB2] font-semibold">
              Ready to paste
            </span>
          </div>
          <pre className="text-xs font-mono text-[#2A2E45] whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-xl border border-[#E2E2D9] overflow-x-auto">
            {generateReport()}
          </pre>
        </div>
      </div>
    </div>
  );
}

