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
      setSuccessMsg("Scam report successfully submitted to the ScamShield intelligence network!");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-cyber-900 border border-cyber-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cyber-800 bg-cyber-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Report Suspicious Threat</h3>
              <p className="text-xs text-slate-400">Contribute to the decentralized community scam shield</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-cyber-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Campaign / Threat Title
            </label>
            <input
              type="text"
              placeholder="e.g. Fake Electricity Bill Disconnection SMS"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-cyber-950 border border-cyber-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Threat Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-cyber-950 border border-cyber-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Threat Vector
              </label>
              <select
                value={formData.threatType}
                onChange={(e) => setFormData({ ...formData, threatType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-cyber-950 border border-cyber-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Target Identifier (Phone / Link / UPI ID / Handle) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. +91 98214 09182, http://sbi-kyc.top, or refund@okaxis"
              value={formData.targetIdentifier}
              onChange={(e) => setFormData({ ...formData, targetIdentifier: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-cyber-950 border border-cyber-700 rounded-xl text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Geographic Region / City (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Maharashtra, Delhi NCR, Pan-India"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-cyber-950 border border-cyber-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Incident Details & Modus Operandi *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe how the fraudster contacted you, what urgency or lure was used, and any specific demands."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-cyber-950 border border-cyber-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {/* Privacy statement */}
          <p className="text-[11px] text-slate-400 bg-cyber-950/60 p-2.5 rounded-lg border border-cyber-800">
            🔒 <strong>Privacy Assurance:</strong> ScamShield does not collect or publish personal contact credentials. Submissions are anonymized and aggregated into threat indicators.
          </p>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-cyber-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-400 hover:to-amber-500 text-white shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center gap-2 transition-all"
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
