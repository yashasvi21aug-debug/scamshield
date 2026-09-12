import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2, Send, Globe, Phone, FileText, QrCode } from 'lucide-react';
import { createCommunityReport } from '../services/api';

export default function ReportScamModal({ isOpen, onClose, onReportSubmitted }) {
  const [formData, setFormData] = useState({
    title: '',
    targetIdentifier: '',
    category: 'Banking Fraud',
    threatType: 'SMS Text',
    description: '',
    region: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.targetIdentifier || !formData.description) {
      setErrorMsg("Target identifier (e.g. phone/link/UPI) and description are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const newReport = await createCommunityReport(formData);
      setSuccessMsg("Scam report successfully submitted to the FraudLens intelligence network!");
      setTimeout(() => {
        if (onReportSubmitted) onReportSubmitted(newReport);
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E2D9] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-[#464B71] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-[#7CD5C7] border border-white/10">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Report Suspicious Threat</h3>
              <p className="text-xs text-slate-300">Contribute to the decentralized community fraud defense network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#464B71] mb-1.5 font-mono">
              Campaign / Threat Title
            </label>
            <input
              type="text"
              placeholder="e.g. Fake Electricity Bill Disconnection SMS"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#464B71] mb-1.5 font-mono">
                Threat Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all"
              >
                <option value="Banking Fraud">Banking Fraud</option>
                <option value="UPI / Payment Scam">UPI / Payment Scam</option>
                <option value="Fake KYC">Fake KYC</option>
                <option value="Job Scam">Job Scam</option>
                <option value="Government Impersonation">Government Impersonation</option>
                <option value="Delivery Scam">Delivery Scam</option>
                <option value="Investment Scam">Investment Scam</option>
                <option value="Utility Extortion">Utility Extortion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#464B71] mb-1.5 font-mono">
                Threat Vector
              </label>
              <select
                value={formData.threatType}
                onChange={(e) => setFormData({ ...formData, threatType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all"
              >
                <option value="SMS Text">SMS Text</option>
                <option value="Phishing URL">Phishing URL</option>
                <option value="Malicious QR">Malicious QR</option>
                <option value="Phone Call / WhatsApp">Phone Call / WhatsApp</option>
                <option value="Telegram Group">Telegram Group</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#464B71] mb-1.5 font-mono">
              Target Identifier (Phone / Link / UPI ID / Handle) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. +91 98214 09182, http://sbi-kyc.top, or refund@okaxis"
              value={formData.targetIdentifier}
              onChange={(e) => setFormData({ ...formData, targetIdentifier: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#464B71] mb-1.5 font-mono">
              Geographic Region / City (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Maharashtra, Delhi NCR, Pan-India"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#464B71] mb-1.5 font-mono">
              Incident Details & Modus Operandi *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe how the fraudster contacted you, what urgency or lure was used, and any specific demands."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Privacy statement */}
          <p className="text-[11px] text-slate-600 bg-[#F2F2ED] p-3 rounded-xl border border-[#E2E2D9]">
            🔒 <strong>Privacy Assurance:</strong> FraudLens does not collect or publish personal contact credentials. Submissions are anonymized and aggregated into threat indicators.
          </p>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#118AB2] hover:bg-[#0E7490] text-white shadow-md shadow-[#118AB2]/20 disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publishing...' : 'Submit Threat Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

