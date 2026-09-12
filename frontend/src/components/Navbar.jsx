import React, { useState } from 'react';
import { 
  Shield, 
  Activity, 
  Search, 
  Users, 
  History, 
  Layers, 
  Bot, 
  LifeBuoy, 
  Menu, 
  X, 
  Flag,
  Server,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenReportModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Primary Center Navigation items
  const primaryNavItems = [
    { id: 'landing', label: 'Home' },
    { id: 'analyze', label: 'Analyze' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'simulator', label: 'Simulator' },
    { id: 'community', label: 'Community' },
  ];

  // Secondary/Support Links for Desktop Right
  const rightNavItems = [
    { id: 'advisor', label: 'AI Advisor', icon: Bot },
    { id: 'emergency', label: 'Emergency', icon: LifeBuoy, isEmergency: true }
  ];

  // Full Navigation List for Mobile Menu & Drawer
  const allNavItems = [
    { id: 'landing', label: 'Home', icon: Shield },
    { id: 'analyze', label: 'Analyze Center', icon: Search },
    { id: 'dashboard', label: 'Command Center', icon: Activity },
    { id: 'simulator', label: 'Scam Simulator', icon: GraduationCap },
    { id: 'community', label: 'Community Intel', icon: Users },
    { id: 'categories', label: 'Threat Categories', icon: Layers },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'advisor', label: 'AI Advisor', icon: Bot },
    { id: 'status', label: 'System Status', icon: Server },
    { id: 'emergency', label: 'Emergency Help', icon: LifeBuoy, isEmergency: true }
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#464B71] text-white shadow-md border-b border-[#383C5A]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Brand Logo & Title */}
          <div 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative p-2 rounded-xl bg-white/10 border border-[#7CD5C7]/40 text-[#7CD5C7] group-hover:border-[#7CD5C7] transition-all shadow-inner">
              <Shield className="w-5 h-5 transition-transform group-hover:scale-105" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#7CD5C7] animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#7CD5C7]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-wider text-white">
                  FRAUDLENS<span className="text-[#7CD5C7] ml-1">AI</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#7CD5C7]/20 text-[#7CD5C7] border border-[#7CD5C7]/40 hidden sm:inline font-mono">
                  SECURITY
                </span>
              </div>
              <p className="text-[10px] text-slate-300 tracking-wider uppercase font-medium hidden lg:block">
                See the Fraud Before You Trust It
              </p>
            </div>
          </div>

          {/* Center: Main Primary Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#3A3F61]/70 p-1.5 rounded-2xl border border-white/10">
            {primaryNavItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#118AB2] text-white shadow-sm shadow-[#118AB2]/40 font-bold'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#7CD5C7] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Advisor, Emergency, Report & Analyze Now CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Right Secondary Links */}
            <div className="hidden lg:flex items-center gap-1">
              {rightNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      item.isEmergency
                        ? isActive
                          ? 'bg-rose-900/70 text-rose-200 border border-rose-400/40'
                          : 'text-rose-200 hover:text-white hover:bg-rose-900/30'
                        : isActive
                        ? 'bg-[#118AB2] text-white font-bold'
                        : 'text-slate-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Report Threat Action */}
            <button
              onClick={onOpenReportModal}
              title="Report newly observed scam activity"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Flag className="w-3.5 h-3.5 text-rose-300" />
              <span className="hidden xl:inline">Report Threat</span>
            </button>

            {/* Primary Action: Analyze Now CTA */}
            <button
              onClick={() => handleNavClick('analyze')}
              className="px-4 sm:px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#118AB2] hover:bg-[#0E7490] text-white shadow-md shadow-[#118AB2]/30 flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Analyze Now</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#383C5A] bg-[#3B4063] px-4 pt-3 pb-6 space-y-1 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 pb-3 mb-2 border-b border-white/10">
            <button
              onClick={() => handleNavClick('analyze')}
              className="w-full py-2 px-3 rounded-xl bg-[#118AB2] text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Analyze Now</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReportModal();
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-500/20 border border-rose-300/30 text-rose-100 text-xs font-bold text-center flex items-center justify-center gap-1.5"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report Scam</span>
            </button>
          </div>

          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  isActive 
                    ? 'text-white bg-[#118AB2] shadow-sm font-bold' 
                    : item.isEmergency 
                    ? 'text-rose-200 hover:bg-rose-900/30'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <ArrowRight className="w-3 h-3 opacity-60" />
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
