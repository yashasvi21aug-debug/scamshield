import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AnalyzeCenter from './pages/AnalyzeCenter';
import CommunityPage from './pages/CommunityPage';
import CategoriesPage from './pages/CategoriesPage';
import HistoryPage from './pages/HistoryPage';
import AdvisorPage from './pages/AdvisorPage';
import SimulatorPage from './pages/SimulatorPage';
import StatusPage from './pages/StatusPage';
import EmergencyPage from './pages/EmergencyPage';
import ReportScamModal from './components/ReportScamModal';
import { Shield } from 'lucide-react';

export default function App() {
  const getInitialPage = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace('/', '').toLowerCase();
      if (path === 'simulator') return 'simulator';
      if (path === 'dashboard') return 'dashboard';
      if (path === 'analyze') return 'analyze';
      if (path === 'community') return 'community';
      if (path === 'categories') return 'categories';
      if (path === 'history') return 'history';
      if (path === 'advisor') return 'advisor';
      if (path === 'status') return 'status';
      if (path === 'emergency') return 'emergency';
    }
    return 'landing';
  };

  const [activePage, setActivePage] = useState(getInitialPage);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [inspectedScan, setInspectedScan] = useState(null);

  const handleNavigate = (page) => {
    setActivePage(page);
    if (typeof window !== 'undefined' && window.history) {
      const newUrl = page === 'landing' ? '/' : `/${page}`;
      if (window.location.pathname !== newUrl) {
        window.history.pushState({ page }, '', newUrl);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActivePage(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleInspectScan = (scan) => {
    setInspectedScan(scan);
    handleNavigate('history');
  };

  return (
    <div className="min-h-screen bg-[#F2F2ED] text-[#2A2E45] flex flex-col selection:bg-[#7CD5C7]/30 selection:text-[#118AB2]">
      {/* Global Navigation */}
      <Navbar
        activePage={activePage}
        setActivePage={handleNavigate}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage 
            onNavigate={handleNavigate}
            onInspectScan={handleInspectScan}
          />
        )}

        {activePage === 'analyze' && (
          <AnalyzeCenter 
            onNavigate={setActivePage} 
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {activePage === 'community' && (
          <CommunityPage onOpenReportModal={() => setIsReportModalOpen(true)} />
        )}

        {activePage === 'categories' && (
          <CategoriesPage onNavigate={handleNavigate} />
        )}

        {activePage === 'history' && (
          <HistoryPage 
            initialScan={inspectedScan} 
            onClearInitialScan={() => setInspectedScan(null)} 
          />
        )}

        {activePage === 'advisor' && (
          <AdvisorPage />
        )}

        {activePage === 'simulator' && (
          <SimulatorPage onNavigate={handleNavigate} />
        )}

        {activePage === 'status' && (
          <StatusPage />
        )}

        {activePage === 'emergency' && (
          <EmergencyPage />
        )}
      </main>

      {/* Global Report Threat Modal */}
      <ReportScamModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportSubmitted={() => {
          // Can refresh view if on community page
        }}
      />

      {/* Global Modern SaaS Footer */}
      <footer className="border-t border-[#383C5A] bg-[#464B71] text-white pt-14 pb-10 mt-16 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#383C5A]/80">
            {/* Column 1: Brand & Tagline */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 border border-[#7CD5C7]/40 text-[#7CD5C7]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-black text-base tracking-wider text-white">
                    FRAUDLENS<span className="text-[#7CD5C7] ml-1">AI</span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                See the Fraud Before You Trust It. Autonomous digital threat intelligence and proactive scam interception.
              </p>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#383C5A] text-[10px] text-[#7CD5C7] font-mono font-semibold border border-[#7CD5C7]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7CD5C7] animate-pulse" />
                <span>Multi-Tier Evidence Architecture</span>
              </div>
            </div>

            {/* Column 2: Platform Capabilities */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#7CD5C7] mb-4 font-mono">
                Analysis Core
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li>
                  <button onClick={() => handleNavigate('analyze')} className="hover:text-white transition-colors">
                    SMS Phishing Scanner
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('analyze')} className="hover:text-white transition-colors">
                    URL Threat Evaluator
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('analyze')} className="hover:text-white transition-colors">
                    QR & UPI Payment Defense
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('simulator')} className="hover:text-[#7CD5C7] text-[#7CD5C7] font-semibold transition-colors flex items-center gap-1">
                    <span>Scam Simulator</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#7CD5C7]/20 border border-[#7CD5C7]/40">NEW</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Intelligence & Triage */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#7CD5C7] mb-4 font-mono">
                Intelligence
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li>
                  <button onClick={() => handleNavigate('dashboard')} className="hover:text-white transition-colors">
                    Command Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('community')} className="hover:text-white transition-colors">
                    Community Intel Feed
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('categories')} className="hover:text-white transition-colors">
                    Threat Taxonomy Dossier
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('advisor')} className="hover:text-white transition-colors">
                    AI Cybersecurity Advisor
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('history')} className="hover:text-white transition-colors">
                    Audit Log History
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Emergency & System */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-rose-300 mb-4 font-mono">
                Safety & Emergency
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li>
                  <button onClick={() => handleNavigate('emergency')} className="text-rose-200 hover:text-white font-semibold transition-colors flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                    <span>Emergency Helpline 1930</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('emergency')} className="hover:text-white transition-colors">
                    Incident Action Checklist
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('status')} className="hover:text-white transition-colors">
                    System Architecture Status
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsReportModalOpen(true)} className="hover:text-rose-200 transition-colors">
                    Report Newly Sighted Scam
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              © {new Date().getFullYear()} FraudLens AI. The Trust Score is a probabilistic risk calculation and does not guarantee complete security.
            </p>
            <div className="text-slate-400 text-[11px] font-mono">
              Render Backend • Vercel Edge • Gemini AI
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
