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
  Server
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenReportModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Shield },
    { id: 'dashboard', label: 'Command Center', icon: Activity },
    { id: 'analyze', label: 'Analyze Center', icon: Search, highlight: true },
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
    <header className="sticky top-0 z-40 bg-cyber-950/80 backdrop-blur-xl border-b border-cyber-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 group-hover:border-cyan-400 transition-all">
              <Shield className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-wider text-white">
                  SCAMSHIELD<span className="text-cyan-400 ml-1">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hidden sm:inline">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium hidden md:block">
                Digital Fraud Defense & Prevention
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              let btnClass = "text-slate-400 hover:text-slate-200 hover:bg-cyber-900/60";
              if (isActive) {
                btnClass = "text-cyan-400 bg-cyber-900 border-cyber-700/80 shadow-inner";
              }
              if (item.highlight && !isActive) {
                btnClass = "text-cyan-300 hover:bg-cyan-950/40";
              }
              if (item.emergency) {
                btnClass = isActive 
                  ? "text-red-400 bg-red-950/40 border-red-500/40" 
                  : "text-red-400/90 hover:text-red-300 hover:bg-red-950/20";
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-transparent transition-all ${btnClass}`}
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all shadow-sm shadow-red-500/10 hover:border-red-500/50"
            >
              <Flag className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Report Threat</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-cyber-900 border border-cyber-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-cyber-800 bg-cyber-950/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
                  isActive 
                    ? 'text-cyan-400 bg-cyber-900 border border-cyan-500/30' 
                    : item.emergency 
                    ? 'text-red-400 hover:bg-red-950/20'
                    : 'text-slate-300 hover:text-white hover:bg-cyber-900'
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
