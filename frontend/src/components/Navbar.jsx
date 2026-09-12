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
  GraduationCap
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenReportModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Shield },
    { id: 'dashboard', label: 'Command Center', icon: Activity },
    { id: 'analyze', label: 'Analyze Center', icon: Search, highlight: true },
    { id: 'simulator', label: 'Scam Simulator', icon: GraduationCap },
    { id: 'community', label: 'Community Intel', icon: Users },
    { id: 'categories', label: 'Threat Dossier', icon: Layers },
    { id: 'history', label: 'History', icon: History },
    { id: 'advisor', label: 'AI Advisor', icon: Bot },
    { id: 'status', label: 'System Status', icon: Server },
    { id: 'emergency', label: 'Emergency Help', icon: LifeBuoy, emergency: true }
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#464B71] text-white shadow-md border-b border-[#383C5A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative p-2 rounded-xl bg-white/10 border border-[#7CD5C7]/50 text-[#7CD5C7] group-hover:border-[#7CD5C7] transition-all">
              <Shield className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#7CD5C7] animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#7CD5C7]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-wider text-white">
                  FRAUDLENS<span className="text-[#7CD5C7] ml-1">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#7CD5C7]/20 text-[#7CD5C7] border border-[#7CD5C7]/40 hidden sm:inline">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-200 tracking-wider uppercase font-medium hidden md:block">
                Digital Fraud Defense & Prevention
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              let btnClass = "text-slate-200 hover:text-white hover:bg-white/10";
              if (isActive) {
                btnClass = "text-[#7CD5C7] bg-[#383C5A] border border-[#7CD5C7]/30 shadow-inner";
              }
              if (item.highlight && !isActive) {
                btnClass = "text-white bg-[#118AB2] hover:bg-[#0E7490] shadow-sm";
              }
              if (item.emergency) {
                btnClass = isActive 
                  ? "text-rose-200 bg-rose-900/60 border border-rose-400/40" 
                  : "text-rose-200 hover:text-white hover:bg-rose-900/30";
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${btnClass}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Report Threat CTA */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 border border-rose-300/30 transition-all shadow-sm"
            >
              <Flag className="w-3.5 h-3.5 text-rose-200" />
              <span className="hidden sm:inline">Report Threat</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#383C5A] bg-[#464B71] px-4 pt-3 pb-5 space-y-1 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
                  isActive 
                    ? 'text-[#7CD5C7] bg-[#383C5A] border border-[#7CD5C7]/30' 
                    : item.emergency 
                    ? 'text-rose-200 hover:bg-rose-900/30'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
