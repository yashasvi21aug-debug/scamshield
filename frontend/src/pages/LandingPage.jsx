import React from 'react';
import { 
  Shield, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  Globe, 
  MessageSquareWarning, 
  ArrowRight, 
  Cpu, 
  Users, 
  Lock, 
  ChevronRight,
  ShieldCheck,
  Eye,
  GraduationCap,
  Sparkles,
  Flame,
  Radio,
  FileText
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="relative overflow-hidden bg-[#F2F2ED]">
      {/* ==================================================
          1. DARK PREMIUM HERO SECTION
      ================================================== */}
      <section className="relative bg-gradient-to-b from-[#2B304D] via-[#383D61] to-[#464B71] text-white pt-14 pb-20 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 border-b border-[#383C5A]">
        {/* Ambient atmospheric glow accents */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#118AB2]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#7CD5C7]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left Column: Value Prop & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#7CD5C7]/40 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#7CD5C7] animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#7CD5C7]">
                AI-POWERED FRAUD PROTECTION
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              See the Fraud <br />
              <span className="bg-gradient-to-r from-white via-[#7CD5C7] to-[#118AB2] bg-clip-text text-transparent">
                Before You Trust It.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Analyze suspicious messages, links and QR codes before you click, pay, or share sensitive information.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => onNavigate('analyze')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider bg-[#118AB2] hover:bg-[#0E7490] text-white shadow-xl shadow-[#118AB2]/40 flex items-center justify-center gap-2 group transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Search className="w-4 h-4" />
                <span>Analyze Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('simulator')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-sm flex items-center justify-center gap-2 transition-all backdrop-blur-sm"
              >
                <GraduationCap className="w-4 h-4 text-[#7CD5C7]" />
                <span>Explore Simulator</span>
              </button>
            </div>

            {/* Micro value badges */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center lg:text-left">
              <div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono">0–100</div>
                <div className="text-[11px] text-slate-300 mt-0.5 font-medium">Explainable Score</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#7CD5C7] font-mono">&lt; 350ms</div>
                <div className="text-[11px] text-slate-300 mt-0.5 font-medium">Real-Time Latency</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono">100%</div>
                <div className="text-[11px] text-slate-300 mt-0.5 font-medium">Zero-Click Safety</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#7CD5C7] font-mono">Dual Engine</div>
                <div className="text-[11px] text-slate-300 mt-0.5 font-medium">AI + Heuristic Shield</div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Dashboard Mockup */}
          <div className="lg:col-span-5 relative">
            {/* Subtle floating badges */}
            <div className="absolute -top-4 -left-2 z-20 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-[#464B71] text-xs font-bold shadow-xl border border-[#E2E2D9]">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Analysis (Gemini)</span>
            </div>

            <div className="absolute -bottom-4 -right-2 z-20 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-[#464B71] text-xs font-bold shadow-xl border border-[#E2E2D9]">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Threat Detected</span>
            </div>

            {/* Mockup Card Container */}
            <div className="relative rounded-3xl bg-white text-[#2A2E45] p-6 sm:p-7 shadow-2xl border border-[#E2E2D9] space-y-5 backdrop-blur-lg">
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E2D9]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#464B71]/10 text-[#464B71]">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#464B71] tracking-wide">
                      FraudLens AI
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Real-Time Diagnostic Dossier
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  Suspicious SMS Detected
                </span>
              </div>

              {/* Trust Score & Risk Level Visual */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F2F2ED]/70 border border-[#E2E2D9]">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Calculated Trust Score
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-black text-rose-600 font-mono">
                      28
                    </span>
                    <span className="text-sm font-bold text-slate-400 font-mono">
                      / 100
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                    HIGH RISK
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Confidence: 96%
                  </span>
                </div>
              </div>

              {/* Indicators Checklist */}
              <div>
                <span className="text-xs font-bold text-[#464B71] uppercase tracking-wider block mb-2.5">
                  Detected Threat Indicators:
                </span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9] text-xs">
                    <div className="flex items-center gap-2 text-rose-700 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Urgency detected</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Critical</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9] text-xs">
                    <div className="flex items-center gap-2 text-rose-700 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Suspicious domain</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Lookalike TLD</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9] text-xs">
                    <div className="flex items-center gap-2 text-amber-700 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Payment request</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Unverified UPI</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F9F9F6] border border-[#E2E2D9] text-xs">
                    <div className="flex items-center gap-2 text-amber-700 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Impersonation pattern</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Bank Lure</span>
                  </div>
                </div>
              </div>

              {/* Recommended Action Card */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-800 tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  Recommended Action:
                </span>
                <p className="text-xs font-bold text-amber-950 leading-relaxed">
                  Do not click or make the requested payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. CORE FEATURES / 3 VECTOR SCANNERS
      ================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#118AB2] mb-3 font-mono">
            Full-Spectrum Digital Fraud Coverage
          </h2>
          <p className="text-3xl sm:text-4xl font-black text-[#464B71] tracking-tight">
            Stop Scams Across Every Modern Attack Surface
          </p>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Fraudsters pivot between text messages, disguised links, and malicious QR codes. FraudLens unifies all three into one real-time defense hub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: SMS Scanner */}
          <div 
            onClick={() => onNavigate('analyze')}
            className="p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm hover:shadow-xl hover:border-[#118AB2] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="p-3.5 w-fit rounded-2xl bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/20 mb-6 group-hover:scale-105 transition-transform">
                <MessageSquareWarning className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#464B71] mb-2.5 group-hover:text-[#118AB2] transition-colors">
                SMS Phishing & KYC Traps
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Detect coercive account suspension panics, electricity bill cutoffs, fake parcel deliveries, and unknown personal number originators before you respond.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-[#118AB2] uppercase tracking-wider gap-1.5 group-hover:translate-x-1 transition-transform pt-4 border-t border-[#E2E2D9]">
              <span>Scan SMS Message</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: URL Scanner */}
          <div 
            onClick={() => onNavigate('analyze')}
            className="p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm hover:shadow-xl hover:border-[#118AB2] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="p-3.5 w-fit rounded-2xl bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20 mb-6 group-hover:scale-105 transition-transform">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#464B71] mb-2.5 group-hover:text-[#118AB2] transition-colors">
                URL & Lookalike Domains
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Safely inspect deceptive homoglyphs, disposable TLDs, IP hosts, and stealth redirect hops with zero execution risk on your local machine.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-[#0F766E] uppercase tracking-wider gap-1.5 group-hover:translate-x-1 transition-transform pt-4 border-t border-[#E2E2D9]">
              <span>Scan Suspicious URL</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: QR Scanner */}
          <div 
            onClick={() => onNavigate('analyze')}
            className="p-8 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm hover:shadow-xl hover:border-[#118AB2] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="p-3.5 w-fit rounded-2xl bg-amber-500/10 text-amber-700 border border-amber-500/20 mb-6 group-hover:scale-105 transition-transform">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#464B71] mb-2.5 group-hover:text-[#118AB2] transition-colors">
                QR Codes & UPI Traps
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Decode QR codes locally to expose hidden destination URLs and unmask reverse-charge UPI collect traps before you enter your UPI PIN.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-700 uppercase tracking-wider gap-1.5 group-hover:translate-x-1 transition-transform pt-4 border-t border-[#E2E2D9]">
              <span>Scan QR Code</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. HOW IT WORKS (Defensive Pipeline)
      ================================================== */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E2E2D9]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#118AB2] mb-3 font-mono">
            Deterministic Security Protocol
          </h2>
          <p className="text-3xl sm:text-4xl font-black text-[#464B71] tracking-tight">
            How FraudLens Protects You
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-7 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm relative">
            <div className="w-9 h-9 rounded-xl bg-[#F2F2ED] text-[#118AB2] font-mono font-bold flex items-center justify-center mb-5 text-sm border border-[#E2E2D9]">
              01
            </div>
            <h4 className="text-base font-bold text-[#464B71] mb-2">Input Target</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Paste suspicious SMS text, unvetted URLs, or upload a screenshot of a payment QR code.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm relative">
            <div className="w-9 h-9 rounded-xl bg-[#F2F2ED] text-[#118AB2] font-mono font-bold flex items-center justify-center mb-5 text-sm border border-[#E2E2D9]">
              02
            </div>
            <h4 className="text-base font-bold text-[#464B71] mb-2">Multi-Tier Analysis</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dual-engine evaluation tests social engineering psychology, SSRF boundaries, and Gemini AI semantics.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm relative">
            <div className="w-9 h-9 rounded-xl bg-[#F2F2ED] text-[#118AB2] font-mono font-bold flex items-center justify-center mb-5 text-sm border border-[#E2E2D9]">
              03
            </div>
            <h4 className="text-base font-bold text-[#464B71] mb-2">Explainable Trust Score</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive a calculated 0–100 Trust Score with severity-ranked evidence reasons explaining the threat.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm relative">
            <div className="w-9 h-9 rounded-xl bg-[#0F766E]/10 text-[#0F766E] font-mono font-bold flex items-center justify-center mb-5 text-sm border border-[#0F766E]/30">
              04
            </div>
            <h4 className="text-base font-bold text-[#464B71] mb-2">Defensive Action</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Follow context-tailored action checklists or trigger emergency statutory helplines (1930) if compromised.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          4. TRUST SCORE & EXPLAINABILITY BREAKDOWN
      ================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E2E2D9]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#118AB2]/10 border border-[#118AB2]/30 text-[#118AB2] text-xs font-mono font-bold">
              <Eye className="w-3.5 h-3.5" />
              <span>TRANSPARENT AI EXPLAINABILITY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#464B71] tracking-tight">
              A Trust Score That Explains Exactly Why
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Black-box cybersecurity tools give a binary pass/fail without context. FraudLens AI generates a calibrated <strong>0 to 100 Trust Score</strong> with clear, evidence-based reasoning so you know why an alert was triggered.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#E2E2D9] shadow-xs">
                <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-mono font-bold border border-red-200">
                  0–34
                </span>
                <div>
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider">High Risk</h4>
                  <p className="text-xs text-slate-600">Active deceptive patterns, coercive payment traps, or known malicious domains.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#E2E2D9] shadow-xs">
                <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-mono font-bold border border-orange-200">
                  35–64
                </span>
                <div>
                  <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider">Suspicious</h4>
                  <p className="text-xs text-slate-600">Elevated urgency, unverified sender origin, or mismatching transaction handles.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#E2E2D9] shadow-xs">
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-mono font-bold border border-amber-200">
                  65–79
                </span>
                <div>
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Caution</h4>
                  <p className="text-xs text-slate-600">Anomalous parameters or unverified organizational identity requiring extra care.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#E2E2D9] shadow-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200">
                  80–100
                </span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Safe & Authentic</h4>
                  <p className="text-xs text-slate-600">Authentic digital signatures, verified organizational handles, zero red flags.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right visual card */}
          <div className="lg:col-span-6 p-8 sm:p-10 rounded-3xl bg-white border border-[#E2E2D9] shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E2D9]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#118AB2]" />
                <span className="text-sm font-bold text-[#464B71]">Explainable AI Architecture</span>
              </div>
              <span className="text-xs font-mono text-slate-500 font-bold">GEMINI 3.6 FLASH</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#F2F2ED] border border-[#E2E2D9] text-xs text-slate-700 space-y-3 font-mono leading-relaxed">
              <p className="text-[#464B71] font-bold">
                Target: "SBI ALERT: Electricity will be disconnected tonight at 9:30 PM. Pay via link http://sbi-bill-update.xyz"
              </p>
              <div className="space-y-1.5 pt-2 border-t border-[#E2E2D9] text-[11px]">
                <div className="text-rose-700 font-semibold">• Heuristic trigger: Artificial cutoff deadline (Urgency)</div>
                <div className="text-rose-700 font-semibold">• Domain flag: '.xyz' throwaway TLD mimicking State Bank of India</div>
                <div className="text-rose-700 font-semibold">• Security rule: Statutory utilities never demand immediate SMS payment</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Score Output: <strong className="text-rose-600 font-mono text-base">14/100</strong>
              </div>
              <button
                onClick={() => onNavigate('analyze')}
                className="px-4 py-2 rounded-xl bg-[#118AB2] hover:bg-[#0E7490] text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Try Live Analyzer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. SCAM SIMULATOR SPOTLIGHT
      ================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E2E2D9]">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#464B71] to-[#363A58] text-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#7CD5C7] text-xs font-mono font-bold border border-[#7CD5C7]/30">
              <GraduationCap className="w-4 h-4" />
              <span>ADAPTIVE PERSONALIZED TRAINING</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Train Before You Get Scammed
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
              Knowledge is the ultimate fraud defense. Step into safe, real-world simulations. Our adaptive engine identifies your psychological vulnerabilities (urgency, authority, greed) and adjusts training difficulty automatically.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-mono text-slate-200 border border-white/15">Beginner</span>
              <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-mono text-slate-200 border border-white/15">Intermediate</span>
              <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-mono text-slate-200 border border-white/15">Expert</span>
              <span className="px-3 py-1 rounded-lg bg-[#7CD5C7]/20 text-xs font-mono text-[#7CD5C7] border border-[#7CD5C7]/40">Adaptive AI Coaching</span>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <button
              onClick={() => onNavigate('simulator')}
              className="px-8 py-4 rounded-2xl bg-[#7CD5C7] hover:bg-[#68C5B6] text-[#2A2E45] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#7CD5C7]/20 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-100"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Launch Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================
          6. COMMUNITY INTELLIGENCE SPOTLIGHT
      ================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E2E2D9]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#118AB2] mb-3 font-mono">
            Collective Cybersecurity Network
          </h2>
          <p className="text-3xl sm:text-4xl font-black text-[#464B71] tracking-tight">
            Crowdsourced Threat Intelligence
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Every newly reported scam helps protect thousands of other citizens in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm">
            <div className="p-3 w-fit rounded-2xl bg-[#118AB2]/10 text-[#118AB2] mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-[#464B71] font-mono">Real-Time</div>
            <div className="text-xs text-slate-500 mt-1">Crowd Verification</div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm">
            <div className="p-3 w-fit rounded-2xl bg-rose-500/10 text-rose-600 mx-auto mb-3">
              <Flame className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-rose-600 font-mono">Trending</div>
            <div className="text-xs text-slate-500 mt-1">Emerging Campaigns</div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm">
            <div className="p-3 w-fit rounded-2xl bg-[#0F766E]/10 text-[#0F766E] mx-auto mb-3">
              <Radio className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-[#0F766E] font-mono">Shared Feed</div>
            <div className="text-xs text-slate-500 mt-1">Community Protection</div>
          </div>
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => onNavigate('community')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-[#F2F2ED] text-[#464B71] border border-[#E2E2D9] text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            <span>Explore Community Threat Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ==================================================
          7. FINAL HIGH-IMPACT CALL TO ACTION
      ================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-[#464B71] via-[#383D61] to-[#2B304D] text-white shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Shield className="w-64 h-64 text-white" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            See the Fraud Before You Trust It
          </h2>
          <p className="text-xs sm:text-base text-slate-200 max-w-xl mx-auto mb-9 leading-relaxed">
            Free, fast, and completely private. Test messages, links, and QR codes before they compromise your device or finances.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('analyze')}
              className="w-full sm:w-auto px-9 py-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#7CD5C7] hover:bg-[#68C5B6] text-[#2A2E45] shadow-xl shadow-[#7CD5C7]/20 transition-all font-bold"
            >
              Analyze Your First Threat
            </button>
            <button
              onClick={() => onNavigate('simulator')}
              className="w-full sm:w-auto px-9 py-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            >
              Try Scam Simulator
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
