import React from 'react';
import { 
  Shield, 
  Search, 
  Zap, 
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
  Activity
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Glow backdrop circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyber-900/90 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 mb-8 animate-in fade-in duration-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-300 font-mono">
              Next-Gen AI Fraud Interceptor
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight mb-6">
            See the Fraud Before You Trust <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">It.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto">
            FraudLens AI inspects suspicious SMS messages, QR codes, and URLs before you click, pay, or share credentials. Powered by an <strong>explainable Trust Score (0–100)</strong> that tells you exactly why a threat is dangerous.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('analyze')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 group transition-all transform hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4" />
              <span>Analyze Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider bg-cyber-900/80 hover:bg-cyber-800 text-slate-200 border border-cyber-700/80 hover:border-cyan-500/40 flex items-center justify-center gap-2 transition-all"
            >
              <span>How It Works</span>
            </button>
          </div>

          {/* Key Value Micro-Badges */}
          <div className="mt-12 pt-8 border-t border-cyber-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-black text-white font-mono">0–100</div>
              <div className="text-xs text-slate-400 mt-1">Explainable Score</div>
            </div>
            <div>
              <div className="text-2xl font-black text-cyan-400 font-mono">&lt; 350ms</div>
              <div className="text-xs text-slate-400 mt-1">Real-time Latency</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">100%</div>
              <div className="text-xs text-slate-400 mt-1">Zero-Click Safety</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400 font-mono">Dual Engine</div>
              <div className="text-xs text-slate-400 mt-1">AI + Heuristic Shield</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Grid / Core Scanners */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 font-mono">
            Full-Spectrum Digital Fraud Coverage
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            Three Core Vectors of Modern Cybercrime
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: SMS Scanner */}
          <div 
            onClick={() => onNavigate('analyze')}
            className="p-6 rounded-2xl bg-cyber-900/60 border border-cyber-800 hover:border-cyan-500/40 transition-all cursor-pointer group glass-card-hover"
          >
            <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-cyan-400 border border-cyan-500/30 mb-5 group-hover:scale-110 transition-transform">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
              SMS Phishing & KYC Traps
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Detects coercive account block panics, fake bank messages, lottery lures, and unverified personal contact numbers.
            </p>
            <div className="flex items-center text-xs text-cyan-400 font-semibold gap-1 group-hover:translate-x-1 transition-transform">
              <span>Scan SMS Message</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: URL Scanner */}
          <div 
            onClick={() => onNavigate('analyze')}
            className="p-6 rounded-2xl bg-cyber-900/60 border border-cyber-800 hover:border-cyan-500/40 transition-all cursor-pointer group glass-card-hover"
          >
            <div className="p-3 w-fit rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-5 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
              URL & Lookalike Phishing
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Safely analyzes domain homoglyphs, high-risk throwaway TLDs, IP-based hosts, and shortened redirect chains without visiting the site.
            </p>
            <div className="flex items-center text-xs text-cyan-400 font-semibold gap-1 group-hover:translate-x-1 transition-transform">
              <span>Scan Suspicious URL</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: QR Scanner */}
          <div 
            onClick={() => onNavigate('analyze')}
            className="p-6 rounded-2xl bg-cyber-900/60 border border-cyber-800 hover:border-cyan-500/40 transition-all cursor-pointer group glass-card-hover"
          >
            <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 mb-5 group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
              Malicious QR & UPI Fraud
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Decodes QR codes via file upload or camera to expose hidden destinations and unmask reverse-charge UPI traps before you authorize payments.
            </p>
            <div className="flex items-center text-xs text-purple-400 font-semibold gap-1 group-hover:translate-x-1 transition-transform">
              <span>Scan QR Code</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-cyber-800/80">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 font-mono">
            Simple 4-Step Defensive Protocol
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            Paste → Analyze → Understand → Act Safely
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-cyber-900/40 border border-cyber-800 relative">
            <div className="w-8 h-8 rounded-lg bg-cyber-800 text-cyan-400 font-mono font-bold flex items-center justify-center mb-4 text-sm border border-cyber-700">
              01
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5">Paste or Upload</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drop suspicious SMS text, paste unvetted URLs, or upload QR screenshots from your phone.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cyber-900/40 border border-cyber-800 relative">
            <div className="w-8 h-8 rounded-lg bg-cyber-800 text-cyan-400 font-mono font-bold flex items-center justify-center mb-4 text-sm border border-cyber-700">
              02
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5">Static AI Inspection</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our zero-execution engine scans social engineering patterns, TLD reputation, and brand homoglyphs safely.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cyber-900/40 border border-cyber-800 relative">
            <div className="w-8 h-8 rounded-lg bg-cyber-800 text-cyan-400 font-mono font-bold flex items-center justify-center mb-4 text-sm border border-cyber-700">
              03
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5">Explainable Trust Score</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive a calculated 0–100 Trust Score with severity-ranked reasons explaining why it's a threat.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cyber-900/40 border border-cyber-800 relative">
            <div className="w-8 h-8 rounded-lg bg-cyber-800 text-emerald-400 font-mono font-bold flex items-center justify-center mb-4 text-sm border border-emerald-500/30">
              04
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5">Take Safe Action</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Follow context-tailored action checklists or trigger emergency incident protocols if already compromised.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-cyber-900 via-cyber-850 to-blue-950/40 border border-cyan-500/30 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Shield className="w-48 h-48 text-cyan-400" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
            Protect Yourself Against Digital Fraud Today
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mb-8">
            Experience the real-time detection engine right in your browser with our preloaded hackathon demo presets.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('analyze')}
              className="px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all"
            >
              Start Free Live Scan
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-cyber-900 hover:bg-cyber-800 text-white border border-cyber-700 transition-all"
            >
              View Command Center
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
