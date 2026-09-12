import React, { useState } from 'react';
import { 
  MessageSquareWarning, 
  Globe, 
  QrCode, 
  Search, 
  Sparkles, 
  Camera, 
  Upload, 
  AlertTriangle, 
  RotateCcw, 
  Flag, 
  LifeBuoy, 
  Copy, 
  Check,
  CheckCircle2,
  Cpu,
  Info
} from 'lucide-react';
import TrustScoreGauge from '../components/TrustScoreGauge';
import ThreatReasons from '../components/ThreatReasons';
import ActionChecklist from '../components/ActionChecklist';
import UrlRiskBreakdown from '../components/UrlRiskBreakdown';
import QrScannerModal from '../components/QrScannerModal';
import DemoPresetSelector from '../components/DemoPresetSelector';
import { analyzeSms, analyzeUrl, analyzeQr } from '../services/api';

export default function AnalyzeCenter({ onNavigate, onOpenReportModal }) {
  const [activeTab, setActiveTab] = useState('sms');
  const [inputText, setInputText] = useState('');
  const [useAi, setUseAi] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setInputText('');
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  const handleAnalyze = async (overrideInput, isSyntheticDemo = false) => {
    const textToAnalyze = overrideInput !== undefined ? overrideInput : inputText;
    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      setErrorMsg(`Please provide a valid ${activeTab.toUpperCase()} input to analyze.`);
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let result;
      const options = { useAi, isDemo: isSyntheticDemo || isDemoMode };

      if (activeTab === 'sms') {
        result = await analyzeSms(textToAnalyze, options);
      } else if (activeTab === 'url') {
        result = await analyzeUrl(textToAnalyze, options);
      } else if (activeTab === 'qr') {
        result = await analyzeQr(textToAnalyze, options);
      }
      setAnalysisResult(result);
    } catch (err) {
      setErrorMsg(err.message || "Threat analysis failed. Please verify input and connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (presetContent) => {
    setInputText(presetContent);
    setIsDemoMode(true);
    handleAnalyze(presetContent, true);
  };

  const handleQrPayloadDecoded = (payload) => {
    setInputText(payload);
    setIsDemoMode(false);
    handleAnalyze(payload, false);
  };

  const handleCopySummary = () => {
    if (!analysisResult) return;
    const summary = `🛡️ FraudLens AI Analysis Dossier:
Target: ${analysisResult.sanitizedInput || analysisResult.input}
Type: ${analysisResult.type?.toUpperCase()}
Trust Score: ${analysisResult.trustScore}/100 (${analysisResult.risk?.level})
Category: ${analysisResult.detectedCategory}
Threats: ${(analysisResult.threats || []).map(t => t.name || t.title).join('; ') || 'None identified'}
Top Action: ${analysisResult.recommendations?.[0]?.action || 'Standard digital awareness'}`;
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#118AB2]/10 border border-[#118AB2]/30 text-[#118AB2] text-xs font-mono font-bold mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>MULTI-TIER EVIDENCE ANALYSIS CORE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#464B71] tracking-tight">
          Digital Fraud Analyze Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Real-time threat evaluation for SMS text, web URLs, and QR code destinations. All analyses calculate an explainable Trust Score (0–100) based on actual detected indicators.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm">
          <button
            onClick={() => handleTabChange('sms')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'sms'
                ? 'bg-[#118AB2] text-white shadow-md shadow-[#118AB2]/20'
                : 'text-slate-600 hover:text-[#464B71]'
            }`}
          >
            <MessageSquareWarning className="w-4 h-4" />
            <span>SMS Scanner</span>
          </button>

          <button
            onClick={() => handleTabChange('url')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'url'
                ? 'bg-[#118AB2] text-white shadow-md shadow-[#118AB2]/20'
                : 'text-slate-600 hover:text-[#464B71]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>URL Scanner</span>
          </button>

          <button
            onClick={() => handleTabChange('qr')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'qr'
                ? 'bg-[#118AB2] text-white shadow-md shadow-[#118AB2]/20'
                : 'text-slate-600 hover:text-[#464B71]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Scanner</span>
          </button>
        </div>
      </div>

      {/* Main Analyzer Input Card */}
      <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-md space-y-6">
        {/* Hackathon Demo Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#464B71] uppercase tracking-wider font-mono">
              Synthetic Demo Test Cases
            </span>
            <span className="text-[11px] text-amber-700 font-medium">
              Tagged as Demo records (Kept separate from production telemetry)
            </span>
          </div>
          <DemoPresetSelector
            mode={activeTab}
            onSelectPreset={handleSelectPreset}
          />
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dynamic Input Interface by Mode */}
        {activeTab === 'sms' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="font-semibold uppercase tracking-wider text-[#464B71]">
                Paste SMS Message or Chat Text
              </label>
              <span className="font-mono">{inputText.length} characters</span>
            </div>
            <textarea
              rows={4}
              placeholder="Paste suspicious SMS text here to inspect for urgency manipulation, fake KYC demands, or credential requests..."
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setIsDemoMode(false);
              }}
              className="w-full p-4 bg-[#F9F9F6] border border-[#E2E2D9] rounded-2xl text-sm text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] font-sans resize-none transition-colors"
            />
          </div>
        )}

        {activeTab === 'url' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="font-semibold uppercase tracking-wider text-[#464B71]">
                Enter Target URL / Domain to Inspect
              </label>
              <span className="text-[11px] text-[#118AB2] font-medium">Safe static inspection (SSRF protected)</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="https://example-domain.top/verify or bit.ly/update"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setIsDemoMode(false);
                }}
                className="w-full pl-12 pr-4 py-3.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-2xl text-sm text-[#2A2E45] font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] transition-colors"
              />
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="font-semibold uppercase tracking-wider text-[#464B71]">
                QR Payload Content (or Upload Image / Camera Scan)
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="flex-1 py-4 px-4 rounded-2xl bg-[#F9F9F6] hover:bg-[#F2F2ED] border border-[#E2E2D9] hover:border-[#118AB2]/50 text-[#118AB2] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all group"
              >
                <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Upload QR Image File</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="flex-1 py-4 px-4 rounded-2xl bg-[#F9F9F6] hover:bg-[#F2F2ED] border border-[#E2E2D9] hover:border-[#118AB2]/50 text-[#118AB2] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all group"
              >
                <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Live Camera Scan</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                placeholder="Decoded QR payload will appear here (e.g. upi://pay?pa=... or https://...), or paste manual payload string..."
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setIsDemoMode(false);
                }}
                className="w-full p-3.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-2xl text-xs font-mono text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] resize-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Action Controls & AI Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#E2E2D9]">
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              className="w-4 h-4 rounded bg-[#F9F9F6] border-[#E2E2D9] text-[#118AB2] focus:ring-0 cursor-pointer"
            />
            <span>Enable Server-Side AI Analysis (When API Key is Configured)</span>
          </label>

          <button
            onClick={() => handleAnalyze(undefined, false)}
            disabled={isAnalyzing || !inputText.trim()}
            className="px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#118AB2] hover:bg-[#0E7490] text-white shadow-lg shadow-[#118AB2]/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>
              {isAnalyzing ? 'Analyzing...' : activeTab === 'sms' ? 'Analyze SMS' : activeTab === 'url' ? 'Scan URL' : 'Analyze QR'}
            </span>
          </button>
        </div>
      </div>

      {/* Real Loading State (Active during network request) */}
      {isAnalyzing && (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white/95 border border-[#118AB2]/30 shadow-xl text-center space-y-4">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-[#E2E2D9]" />
            <div className="absolute inset-0 rounded-full border-4 border-[#118AB2] border-t-transparent animate-spin" />
            <Cpu className="absolute inset-0 m-auto w-5 h-5 text-[#118AB2] animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#464B71] tracking-wide">
              Performing Real Threat Analysis...
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Executing lexical heuristics, domain verification, and threat intelligence checks
            </p>
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-3 duration-300">
          {/* Results Action Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm">
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-[#118AB2]" />
              <span className="text-slate-700">
                Scan ID: <strong>{analysisResult.scanId}</strong>
              </span>
              {analysisResult.isDemo && (
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase">
                  Synthetic Demo Record
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="px-3 py-1.5 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9] hover:border-[#118AB2] text-slate-700 hover:text-[#464B71] text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSummary ? "Copied" : "Copy Dossier"}</span>
              </button>

              <button
                onClick={onOpenReportModal}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs flex items-center gap-1.5 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Submit to Community</span>
              </button>
            </div>
          </div>

          {/* Top Row: Trust Score + Explainable Reasons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <TrustScoreGauge
                score={analysisResult.trustScore}
                risk={analysisResult.risk}
              />
            </div>

            <div className="lg:col-span-2">
              <ThreatReasons
                threats={analysisResult.threats || analysisResult.detectedIndicators || []}
                detectedCategory={analysisResult.detectedCategory}
              />
            </div>
          </div>

          {/* Payment QR Warning */}
          {analysisResult.type === 'qr' && analysisResult.qrType === 'upi_payment' && (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-amber-950">
                    UPI Payment Destination Warning
                  </h4>
                  <p className="text-xs text-amber-800">
                    Verify the recipient name and payment details before completing a payment. FraudLens cannot guarantee the identity of the payment recipient solely from QR content.
                  </p>
                </div>
              </div>

              {analysisResult.paymentDetails && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-amber-200 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-amber-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Payee Name</span>
                    <span className="text-slate-900 font-semibold truncate block mt-0.5">
                      {analysisResult.paymentDetails.payeeName}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Payee VPA</span>
                    <span className="text-[#118AB2] font-mono font-semibold truncate block mt-0.5">
                      {analysisResult.paymentDetails.payeeVpa}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Amount Specified</span>
                    <span className="text-amber-700 font-semibold block mt-0.5">
                      {analysisResult.paymentDetails.amount}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Transaction Note</span>
                    <span className="text-slate-800 truncate block mt-0.5">
                      {analysisResult.paymentDetails.transactionNote}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* URL Intelligence Dossier */}
          {(analysisResult.type === 'url' || (analysisResult.embeddedUrls && analysisResult.embeddedUrls.length > 0)) && (
            <UrlRiskBreakdown
              urlDetails={analysisResult.urlDetails || analysisResult.embeddedUrls?.[0]}
              breakdownMeters={analysisResult.breakdownMeters || analysisResult.embeddedUrls?.[0]?.breakdownMeters}
            />
          )}

          {/* Safety Action Checklist */}
          <ActionChecklist
            recommendations={analysisResult.recommendations}
            onOpenEmergency={() => onNavigate('emergency')}
          />
        </div>
      )}

      {/* QR Scanner Upload / Camera Modal */}
      <QrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onPayloadDecoded={handleQrPayloadDecoded}
      />
    </div>
  );
}
