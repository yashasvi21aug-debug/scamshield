import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  PhoneCall, 
  ExternalLink, 
  FileText, 
  Copy, 
  Check, 
  RotateCcw
} from 'lucide-react';
import { getEmergencyResources } from '../services/api';

export default function EmergencyPage() {
  const [resources, setResources] = useState([]);
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
      .then(data => setResources(data || []))
      .catch(() => {
        // Leave empty or fallback to static verified if backend unreachable
      });
  }, []);

  const generateReport = () => {
    return `=== CYBER FRAUD INCIDENT REPORT ===
Generated via FraudLens AI Emergency Protocol
Timestamp: ${new Date().toISOString()}

1. Incident Classification: ${incidentForm.fraudPlatform}
2. Financial Entity: ${incidentForm.bankName || 'Not specified'}
3. Amount at Risk / Debited: ${incidentForm.amountLost ? `₹${incidentForm.amountLost}` : 'Not specified'}
4. Transaction UTR / Reference: ${incidentForm.transactionId || 'Not provided'}
5. Suspect Phone / Handle / Link: ${incidentForm.fraudsterContact || 'Not provided'}

User Chronology of Event:
${incidentForm.incidentSummary || 'No summary text provided.'}

Defensive Actions Completed:
- Immediate device network disconnection
- Banking cards and netbanking access locked
- Official reporting via statutory helpline (1930 / cybercrime.gov.in)`;
  };

  const handleCopyLog = () => {
    navigator.clipboard.writeText(generateReport());
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Emergency Header Alert Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-red-50 border border-red-200 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl border border-red-200 shrink-0">
            <AlertOctagon className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs uppercase font-bold tracking-widest text-red-700 font-mono">
                Immediate Incident Triage
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-red-950 tracking-tight">
              Think You've Been Scammed?
            </h1>
            <p className="text-xs sm:text-sm text-red-900/90 mt-2 max-w-2xl leading-relaxed">
              Act immediately. The first <strong>2 to 3 hours</strong> are critical for disputing unauthorized transactions and requesting an inter-bank stop on transfer funds.
            </p>
          </div>
        </div>
      </div>

      {/* Immediate 5-Step Action Protocol */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#464B71] mb-4 font-mono">
          Immediate 4-Step Action Protocol
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-mono font-bold flex items-center justify-center text-xs border border-red-200">
                01
              </span>
              <h3 className="text-sm font-bold text-[#464B71]">Stop All Interaction</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-10">
              Immediately close suspicious tabs, disconnect Wi-Fi or mobile data, and terminate active phone or video calls. Do not reply to threats of arrest or account deactivation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-mono font-bold flex items-center justify-center text-xs border border-red-200">
                02
              </span>
              <h3 className="text-sm font-bold text-[#464B71]">Freeze Cards & Block UPI</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-10">
              Open your official mobile banking app. Use security controls to temporarily lock debit & credit cards and disable online/UPI transactions immediately.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 font-mono font-bold flex items-center justify-center text-xs border border-amber-200">
                03
              </span>
              <h3 className="text-sm font-bold text-[#464B71]">Contact Bank Fraud Desk</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-10">
              Call your bank's verified emergency helpline (printed on your card or official website). Request an immediate lien or hold on the suspicious transaction reference.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-[#118AB2]/10 text-[#118AB2] font-mono font-bold flex items-center justify-center text-xs border border-[#118AB2]/30">
                04
              </span>
              <h3 className="text-sm font-bold text-[#464B71]">Secure Compromised Accounts</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-10">
              Using an uncompromised secondary device, reset passwords for your email and netbanking. Check installed apps for AnyDesk, TeamViewer, or unfamiliar APKs.
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
            <p className="text-xs text-slate-600">
              Official governmental and statutory agencies for financial cyber fraud reporting
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resources.map((res, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#F9F9F6] border border-[#E2E2D9] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#118AB2] font-mono">
                    {res.country} ({res.jurisdiction})
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#464B71]">{res.title}</h4>
                <div className="text-2xl font-black text-[#118AB2] font-mono my-1">
                  {res.identifier}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {res.description}
                </p>
              </div>

              {res.portalUrl && (
                <a
                  href={res.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#118AB2] hover:text-[#0e7490] flex items-center gap-1 pt-2 border-t border-[#E2E2D9]"
                >
                  <span>Visit Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-600 bg-[#F2F2ED] p-3 rounded-xl border border-[#E2E2D9]">
          ⚠️ <em>Disclaimer: FraudLens AI is a proactive analysis tool. For active fund recovery or statutory police complaints, please report directly to official statutory portals.</em>
        </p>
      </div>

      {/* Incident Log Generator */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-[#E2E2D9]">
          <div>
            <h3 className="text-lg font-bold text-[#464B71] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#118AB2]" />
              <span>Incident Log Generator</span>
            </h3>
            <p className="text-xs text-slate-600">
              Prepare an structured factual record for your bank grievance or police station complaint
            </p>
          </div>

          <button
            onClick={handleCopyLog}
            className="px-4 py-2 rounded-xl bg-[#118AB2] hover:bg-[#0e7490] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
          >
            {copiedLog ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLog ? "Copied to Clipboard" : "Copy Formatted Log"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#464B71] mb-1">
              Bank / Payment Service Name
            </label>
            <input
              type="text"
              placeholder="e.g. State Bank of India, HDFC Bank, Google Pay"
              value={incidentForm.bankName}
              onChange={(e) => setIncidentForm({ ...incidentForm, bankName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#464B71] mb-1">
              Amount In Question (₹)
            </label>
            <input
              type="text"
              placeholder="e.g. 15000"
              value={incidentForm.amountLost}
              onChange={(e) => setIncidentForm({ ...incidentForm, amountLost: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#464B71] mb-1">
              Transaction ID / UTR
            </label>
            <input
              type="text"
              placeholder="e.g. 429188201948"
              value={incidentForm.transactionId}
              onChange={(e) => setIncidentForm({ ...incidentForm, transactionId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#464B71] mb-1">
              Fraudster Identifier (Phone / Handle / Link)
            </label>
            <input
              type="text"
              placeholder="e.g. +91 98214 09182, refund@okaxis, or http://..."
              value={incidentForm.fraudsterContact}
              onChange={(e) => setIncidentForm({ ...incidentForm, fraudsterContact: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#464B71] mb-1">
            Factual Summary of Event
          </label>
          <textarea
            rows={3}
            placeholder="Describe what occurred, what instructions were given by the fraudster, and when funds or credentials were submitted."
            value={incidentForm.incidentSummary}
            onChange={(e) => setIncidentForm({ ...incidentForm, incidentSummary: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] resize-none"
          />
        </div>

        <div className="p-4 rounded-xl bg-[#F2F2ED] border border-[#E2E2D9]">
          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2 font-bold">
            Live Formatted Complaint Record:
          </span>
          <pre className="text-xs font-mono text-[#2A2E45] whitespace-pre-wrap leading-relaxed">
            {generateReport()}
          </pre>
        </div>
      </div>
    </div>
  );
}
