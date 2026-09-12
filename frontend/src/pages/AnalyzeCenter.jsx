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
  Info,
  CreditCard,
  Bot,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  DollarSign,
  Binary,
  Brain
} from 'lucide-react';
import TrustScoreGauge from '../components/TrustScoreGauge';
import ThreatReasons from '../components/ThreatReasons';
import ActionChecklist from '../components/ActionChecklist';
import UrlRiskBreakdown from '../components/UrlRiskBreakdown';
import QrScannerModal from '../components/QrScannerModal';
import DemoPresetSelector, { DEMO_PRESETS } from '../components/DemoPresetSelector';
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
  const [checkedActions, setCheckedActions] = useState({});

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setInputText('');
    setAnalysisResult(null);
    setErrorMsg(null);
    setCheckedActions({});
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
    setCheckedActions({});

    try {
      let result;
      const options = { useAi, isDemo: isSyntheticDemo || isDemoMode };

      if (activeTab === 'sms') {
        result = await analyzeSms(textToAnalyze, options);
      } else if (activeTab === 'url') {
        result = await analyzeUrl(textToAnalyze, options);
      } else if (activeTab === 'qr' || activeTab === 'upi') {
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

  const toggleActionChecked = (idx) => {
    setCheckedActions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Compute 4-metric risk breakdown
  const getRiskMetrics = (result) => {
    if (!result) return null;
    const threats = result.threats || result.detectedIndicators || [];
    const threatNames = threats.map(t => (t.name || t.title || t.indicator || '').toLowerCase());
    const input = (result.sanitizedInput || result.input || '').toLowerCase();
    
    // 1. Identity Risk
    let idRisk = 12;
    if (threatNames.some(t => t.includes('kyc') || t.includes('impersonat') || t.includes('identity') || t.includes('credential') || t.includes('pan') || t.includes('aadhaar')) || input.includes('kyc') || input.includes('pan') || input.includes('aadhaar')) {
      idRisk = 92;
    } else if (result.risk?.level === 'high') {
      idRisk = 74;
    } else if (result.risk?.level === 'suspicious') {
      idRisk = 48;
    }

    // 2. Financial Risk
    let finRisk = 10;
    if (result.qrType === 'upi_payment' || threatNames.some(t => t.includes('upi') || t.includes('payment') || t.includes('refund') || t.includes('bank') || t.includes('fee')) || input.includes('upi://') || input.includes('pay') || input.includes('refund')) {
      finRisk = 95;
    } else if (result.risk?.level === 'high') {
      finRisk = 82;
    } else if (result.risk?.level === 'suspicious') {
      finRisk = 50;
    }

    // 3. Technical Risk
    let techRisk = 14;
    if (result.type === 'url' || result.embeddedUrls?.length > 0) {
      const urlInfo = result.urlDetails || result.embeddedUrls?.[0] || {};
      if (urlInfo.isShortener || !urlInfo.isHttps || urlInfo.brandSpoofed || threatNames.some(t => t.includes('url') || t.includes('domain') || t.includes('link') || t.includes('tld'))) {
        techRisk = 88;
      } else {
        techRisk = 24;
      }
    } else if (result.risk?.level === 'high') {
      techRisk = 68;
    }

    // 4. Psychological Risk
    let psychRisk = 12;
    if (threatNames.some(t => t.includes('urgency') || t.includes('fear') || t.includes('reward') || t.includes('lottery') || t.includes('pressure') || t.includes('immediate') || t.includes('deadline')) || input.includes('urgent') || input.includes('immediately') || input.includes('suspend') || input.includes('bonus')) {
      psychRisk = 96;
    } else if (result.risk?.level === 'high') {
      psychRisk = 76;
    } else if (result.risk?.level === 'suspicious') {
      psychRisk = 46;
    }

    return [
      {
        label: "Identity Risk",
        score: idRisk,
        icon: UserCheck,
        description: "Credential harvesting, KYC spoofing, and impersonation signals"
      },
      {
        label: "Financial Risk",
        score: finRisk,
        icon: DollarSign,
        description: "Direct payment extraction, inverted UPI collects, and fake refunds"
      },
      {
        label: "Technical Risk",
        score: techRisk,
        icon: Binary,
        description: "Homoglyphs, non-standard TLDs, shortened redirects, or plain HTTP"
      },
      {
        label: "Psychological Risk",
        score: psychRisk,
        icon: Brain,
        description: "Urgency manipulation, manufactured panic, and artificial deadlines"
      }
    ];
  };

  const riskMetrics = analysisResult ? getRiskMetrics(analysisResult) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#118AB2]/10 border border-[#118AB2]/25 text-[#118AB2] text-xs font-mono font-bold mb-4">
          <Cpu className="w-3.5 h-3.5" />
          <span>MULTI-TIER EVIDENCE ANALYSIS CORE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#464B71] tracking-tight">
          Analyze Before You Trust
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-2xl mx-auto">
          Check suspicious messages, links and QR codes before taking action. Every analysis calculates an explainable Trust Score (0–100) powered by real-time heuristics and Gemini AI.
        </p>
      </div>

      {/* 4 Prominent Top Tabs */}
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-1.5 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm">
          <button
            onClick={() => handleTabChange('sms')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'sms'
                ? 'bg-[#118AB2] text-white shadow-md shadow-[#118AB2]/25 scale-[1.02]'
                : 'text-[#464B71] hover:bg-[#F2F2ED] hover:text-[#118AB2]'
            }`}
          >
            <MessageSquareWarning className="w-4 h-4" />
            <span>SMS Scanner</span>
          </button>

          <button
            onClick={() => handleTabChange('url')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'url'
                ? 'bg-[#118AB2] text-white shadow-md shadow-[#118AB2]/25 scale-[1.02]'
                : 'text-[#464B71] hover:bg-[#F2F2ED] hover:text-[#118AB2]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>URL Scanner</span>
          </button>

          <button
            onClick={() => handleTabChange('qr')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'qr'
                ? 'bg-[#118AB2] text-white shadow-md shadow-[#118AB2]/25 scale-[1.02]'
                : 'text-[#464B71] hover:bg-[#F2F2ED] hover:text-[#118AB2]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code</span>
          </button>

          <button
            onClick={() => handleTabChange('upi')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'upi'
                ? 'bg-[#118AB2] text-white shadow-md shadow-[#118AB2]/25 scale-[1.02]'
                : 'text-[#464B71] hover:bg-[#F2F2ED] hover:text-[#118AB2]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>UPI QR Scan</span>
          </button>
        </div>
      </div>

      {/* Main Analyzer Workspace Card */}
      <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm space-y-6">
        {/* Synthetic Demo Test Cases */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#464B71] uppercase tracking-wider font-mono">
              Try an Example Preset
            </span>
            <span className="text-[11px] text-amber-700 font-medium">
              Demo records are isolated from real telemetry
            </span>
          </div>
          <DemoPresetSelector
            mode={activeTab === 'upi' ? 'qr' : activeTab}
            onSelectPreset={handleSelectPreset}
          />
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Dynamic Input Interface by Mode */}
        {activeTab === 'sms' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="font-bold uppercase tracking-wider text-[#464B71]">
                Paste SMS Message or Chat Text
              </label>
              <span className="font-mono text-slate-400">{inputText.length} characters</span>
            </div>
            <textarea
              rows={4}
              placeholder="Paste suspicious SMS text here to inspect for urgency manipulation, fake KYC demands, lottery prizes, or credential requests..."
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setIsDemoMode(false);
              }}
              className="w-full p-4 bg-[#F9F9F6] border border-[#E2E2D9] rounded-2xl text-sm text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white font-sans resize-none transition-all"
            />
          </div>
        )}

        {activeTab === 'url' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="font-bold uppercase tracking-wider text-[#464B71]">
                Enter Target URL / Domain to Inspect
              </label>
              <span className="text-[11px] text-[#118AB2] font-semibold">Safe static inspection (SSRF protected)</span>
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
                className="w-full pl-12 pr-4 py-3.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-2xl text-sm text-[#2A2E45] font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all"
              />
            </div>
          </div>
        )}

        {(activeTab === 'qr' || activeTab === 'upi') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="font-bold uppercase tracking-wider text-[#464B71]">
                {activeTab === 'upi' ? 'UPI QR Code / String Payload' : 'QR Payload Content or Image File'}
              </label>
              <span className="text-[11px] text-[#118AB2] font-semibold">Decodes UPI intent and URL structures safely</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="py-4 px-4 rounded-2xl bg-[#F9F9F6] hover:bg-[#F2F2ED] border border-[#E2E2D9] hover:border-[#118AB2]/50 text-[#118AB2] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all group shadow-sm"
              >
                <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Upload QR Image File</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="py-4 px-4 rounded-2xl bg-[#F9F9F6] hover:bg-[#F2F2ED] border border-[#E2E2D9] hover:border-[#118AB2]/50 text-[#118AB2] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all group shadow-sm"
              >
                <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Live Camera Scan</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                placeholder={
                  activeTab === 'upi'
                    ? "Paste raw UPI string (e.g. upi://pay?pa=recipient@okaxis&pn=Merchant&am=1500) or scan a QR..."
                    : "Decoded QR payload will appear here (e.g. upi://pay?pa=... or https://...), or enter payload manually..."
                }
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setIsDemoMode(false);
                }}
                className="w-full p-3.5 bg-[#F9F9F6] border border-[#E2E2D9] rounded-2xl text-xs font-mono text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white resize-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Action Controls & AI Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E2E2D9]">
          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              className="w-4 h-4 rounded bg-[#F9F9F6] border-[#E2E2D9] text-[#118AB2] focus:ring-0 cursor-pointer"
            />
            <span className="font-medium">Enable Server-Side AI Analysis (Gemini 3.6 Flash)</span>
          </label>

          <button
            onClick={() => handleAnalyze(undefined, false)}
            disabled={isAnalyzing || !inputText.trim()}
            className="px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#118AB2] hover:bg-[#0E7490] text-white shadow-lg shadow-[#118AB2]/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>
              {isAnalyzing
                ? 'Analyzing Threat...'
                : activeTab === 'sms'
                ? 'Analyze SMS'
                : activeTab === 'url'
                ? 'Scan URL'
                : activeTab === 'upi'
                ? 'Inspect UPI QR'
                : 'Analyze QR Code'}
            </span>
          </button>
        </div>
      </div>

      {/* Real Loading State */}
      {isAnalyzing && (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white border border-[#118AB2]/30 shadow-lg text-center space-y-4 animate-in fade-in duration-200">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-[#E2E2D9]" />
            <div className="absolute inset-0 rounded-full border-4 border-[#118AB2] border-t-transparent animate-spin" />
            <Cpu className="absolute inset-0 m-auto w-5 h-5 text-[#118AB2] animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#464B71] tracking-wide">
              Performing Real Threat Analysis...
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Evaluating multi-tier evidence, domain metadata, lexical urgency patterns, and Gemini AI heuristics.
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {analysisResult && (
        <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-300">
          {/* Results Action Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-white border border-[#E2E2D9] shadow-sm">
            <div className="flex items-center gap-2.5 flex-wrap text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-[#118AB2] animate-ping" />
              <span className="text-slate-700 font-semibold">
                Scan Dossier ID: <strong className="text-[#464B71]">{analysisResult.scanId}</strong>
              </span>
              {analysisResult.isDemo && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase">
                  Synthetic Demo Record
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="px-3.5 py-1.5 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9] hover:border-[#118AB2] text-slate-700 hover:text-[#464B71] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSummary ? "Copied" : "Copy Dossier"}</span>
              </button>

              <button
                onClick={onOpenReportModal}
                className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Submit to Community</span>
              </button>
            </div>
          </div>

          {/* Top Row: Trust Score (Dominant) + Why This Score? */}
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

          {/* 4-Metric Risk Breakdown Grid */}
          {riskMetrics && (
            <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#464B71] flex items-center gap-2">
                    <span>4-Pillar Risk Exposure Breakdown</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive multi-dimensional evaluation across human and technical risk surfaces
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Calculated from detected indicators
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {riskMetrics.map((metric, idx) => {
                  const Icon = metric.icon;
                  const isCritical = metric.score >= 70;
                  const isElevated = metric.score >= 40 && metric.score < 70;
                  const badgeColor = isCritical
                    ? "bg-red-50 text-red-700 border-red-200"
                    : isElevated
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200";
                  const barColor = isCritical
                    ? "bg-red-500"
                    : isElevated
                    ? "bg-amber-500"
                    : "bg-emerald-500";

                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-[#F9F9F6] border border-[#E2E2D9] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-white border border-[#E2E2D9] text-[#118AB2]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {isCritical ? 'CRITICAL' : isElevated ? 'ELEVATED' : 'MINIMAL'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-[#464B71]">
                          <span>{metric.label}</span>
                          <span className="font-mono">{metric.score}%</span>
                        </div>
                        <div className="w-full bg-[#E2E2D9] h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor} transition-all duration-500`}
                            style={{ width: `${metric.score}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2 leading-tight">
                          {metric.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* High-Visibility Recommended Action Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E2D9]">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl border ${
                  analysisResult.trustScore < 35
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : analysisResult.trustScore < 65
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                      Recommended Action Directive
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#464B71] tracking-tight mt-0.5">
                    {analysisResult.trustScore < 35
                      ? 'DO NOT CLICK, CALL, OR TRANSACT'
                      : analysisResult.trustScore < 65
                      ? 'PROCEED WITH EXTREME CAUTION'
                      : analysisResult.trustScore < 80
                      ? 'VERIFY SENDER INDEPENDENTLY'
                      : 'SAFE TO PROCEED — NO THREAT DETECTED'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('advisor')}
                  className="px-4 py-2 rounded-xl bg-[#F2F2ED] hover:bg-[#E2E2D9] text-[#464B71] text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Bot className="w-3.5 h-3.5 text-[#118AB2]" />
                  <span>Ask AI Advisor</span>
                </button>
                <button
                  onClick={onOpenReportModal}
                  className="px-4 py-2 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Scam</span>
                </button>
              </div>
            </div>

            {/* Action Checklist with interactive check boxes */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                Follow Safety Checklist Steps:
              </span>
              {(analysisResult.recommendations || []).map((rec, idx) => {
                const isChecked = !!checkedActions[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleActionChecked(idx)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      isChecked
                        ? 'bg-emerald-50/50 border-emerald-300 line-through opacity-70'
                        : 'bg-[#F9F9F6] hover:bg-white border-[#E2E2D9] hover:border-[#118AB2]/40'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-[#E2E2D9] text-transparent hover:border-[#118AB2]'
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#2A2E45]">
                          {rec.action}
                        </h4>
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                          rec.type === 'critical' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {rec.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment QR Warning */}
          {analysisResult.type === 'qr' && analysisResult.qrType === 'upi_payment' && (
            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-300 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-amber-950">
                    UPI Payment Destination Warning
                  </h4>
                  <p className="text-xs text-amber-800">
                    Verify the recipient name and payment details before completing any transaction. FraudLens cannot guarantee the identity of the payee solely from QR content.
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

