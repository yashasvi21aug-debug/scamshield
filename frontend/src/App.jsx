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
    <div className="min-h-screen bg-cyber-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
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

      {/* Footer */}
      <footer className="border-t border-cyber-800 bg-cyber-950/90 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-cyber-900">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-base tracking-wider text-white">
                  FRAUDLENS<span className="text-cyan-400 ml-1">AI</span>
                </span>
                <p className="text-xs text-slate-400">
                  See the Fraud Before You Trust It.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400 font-medium">
              <button onClick={() => handleNavigate('dashboard')} className="hover:text-cyan-400 transition-colors">
                Command Center
              </button>
              <button onClick={() => handleNavigate('analyze')} className="hover:text-cyan-400 transition-colors">
                Analyze Center
              </button>
              <button onClick={() => handleNavigate('simulator')} className="hover:text-cyan-400 text-cyan-300 font-semibold transition-colors">
                Scam Simulator
              </button>
              <button onClick={() => handleNavigate('community')} className="hover:text-cyan-400 transition-colors">
                Community Intel
              </button>
              <button onClick={() => handleNavigate('categories')} className="hover:text-cyan-400 transition-colors">
                Threat Dossier
              </button>
              <button onClick={() => handleNavigate('advisor')} className="hover:text-cyan-400 transition-colors">
                AI Advisor
              </button>
              <button onClick={() => handleNavigate('status')} className="hover:text-cyan-400 transition-colors">
                System Status
              </button>
              <button onClick={() => handleNavigate('emergency')} className="text-red-400 hover:text-red-300 transition-colors">
                Emergency 1930
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} FraudLens AI. The Trust Score is a risk assessment and does not guarantee safety.
            </p>
            <div className="text-slate-400 text-[11px]">
              Multi-Tier Evidence Architecture • Standalone Ready
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
