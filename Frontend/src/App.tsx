import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';

// Views
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { AnalyzeView } from './views/AnalyzeView';
import { AnalysisDetailView } from './views/AnalysisDetailView';
import { HistoryView } from './views/HistoryView';
import { ReportsView } from './views/ReportsView';
import { ArchitectureView } from './views/ArchitectureView';
import { FutureScopeView } from './views/FutureScopeView';
import { PrivacyView } from './views/PrivacyView';

// Modals and Drawers
import { IncidentDrawer } from './components/IncidentDrawer';
import { SecondaryVerificationModal } from './components/SecondaryVerificationModal';
import { ReportPreviewModal } from './components/ReportPreviewModal';
import { PrivacyModal } from './components/PrivacyModal';

import { DEMO_SCENARIOS } from './data/demoData';
import { IncidentRecord, AnalysisResult, DemoScenario } from './types';
import {
  getStoredIncidents,
  saveIncidents,
  saveSingleIncident,
  deleteStoredIncident,
  clearStoredIncidents,
  reseedStoredIncidents,
} from './utils/storage';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Incidents state backed by localStorage
  const [incidents, setIncidents] = useState<IncidentRecord[]>(() => getStoredIncidents());
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [activeScenario, setActiveScenario] = useState<DemoScenario | null>(DEMO_SCENARIOS[0]);

  // Modals and Drawers
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [verificationResult, setVerificationResult] = useState<AnalysisResult | null>(null);
  const [reportResult, setReportResult] = useState<AnalysisResult | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);

  // Smooth scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Sync to localStorage if state is updated
  useEffect(() => {
    saveIncidents(incidents);
  }, [incidents]);

  // When a new analysis finishes in AnalyzeView
  const handleAnalysisFinished = (result: AnalysisResult) => {
    const newInc: IncidentRecord = {
      id: result.id,
      timestamp: new Date().toLocaleString(),
      audioSource: result.audioFileName,
      callerType: result.callerType || 'Executive / Manager',
      riskScore: result.overallRiskScore,
      riskLevel: result.riskLevel,
      mainSignal: `${result.acousticSignals.syntheticProbability}% Synthetic probability (${result.requestedAction})`,
      recommendedAction: result.recommendedAction,
      verificationStatus: result.verificationStatus,
      detectionType:
        result.riskLevel === 'high'
          ? 'Synthetic Voice & Action Impersonation'
          : result.riskLevel === 'medium'
          ? 'Replay & Biometric Drift Anomaly'
          : 'Natural Voice Integrity Cleared',
      details: result,
    };

    saveSingleIncident(newInc);
    setIncidents((prev) => [newInc, ...prev.filter((i) => i.id !== result.id)]);
  };

  // When secondary verification completes
  const handleVerificationComplete = (
    resultId: string,
    status: 'Verified' | 'Held & Escalated'
  ) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === resultId) {
          return {
            ...inc,
            verificationStatus: status,
            details: inc.details ? { ...inc.details, verificationStatus: status } : undefined,
          };
        }
        return inc;
      })
    );

    if (verificationResult && verificationResult.id === resultId) {
      setVerificationResult((prev) => (prev ? { ...prev, verificationStatus: status } : null));
    }
  };

  // Delete single incident
  const handleDeleteIncident = (id: string) => {
    deleteStoredIncident(id);
    setIncidents((prev) => prev.filter((i) => i.id !== id));
  };

  // Clear all demo history
  const handleClearHistory = () => {
    clearStoredIncidents();
    setIncidents([]);
  };

  // Re-seed demo incidents
  const handleReseedDemoData = () => {
    const fresh = reseedStoredIncidents();
    setIncidents(fresh);
  };

  // Quick scenario selector from landing or navbar
  const handleSelectScenarioId = (id: string) => {
    const sc = DEMO_SCENARIOS.find((s) => s.id === id) || null;
    setActiveScenario(sc);
    navigate('/analyze');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a131c] text-slate-100 selection:bg-teal-500/30 selection:text-teal-200 relative">
      <div className="calm-glow fixed inset-0 pointer-events-none -z-10" />
      {/* Top Navigation */}
      <Navbar
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        activeScenario={activeScenario}
        onSelectScenario={(sc) => {
          setActiveScenario(sc);
          navigate('/analyze');
        }}
        scenarios={DEMO_SCENARIOS}
      />

      {/* Main Page Content with React Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route
            path="/"
            element={
              <LandingView
                onAnalyzeClick={() => navigate('/analyze')}
                onExploreArchitecture={() => navigate('/architecture')}
                onSelectScenarioId={handleSelectScenarioId}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <DashboardView
                incidents={incidents}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                onNavigateAnalyze={() => navigate('/analyze')}
                onOpenReport={(inc) => {
                  if (inc.details) setReportResult(inc.details);
                }}
              />
            }
          />
          <Route
            path="/analyze"
            element={
              <AnalyzeView
                onAnalysisFinished={handleAnalysisFinished}
                activeScenario={isDemoMode ? activeScenario : null}
                onOpenVerificationModal={(res) => setVerificationResult(res)}
                onOpenReportModal={(res) => setReportResult(res)}
              />
            }
          />
          <Route
            path="/analysis/:id"
            element={
              <AnalysisDetailView
                onOpenVerification={(res) => setVerificationResult(res)}
                onOpenReport={(res) => setReportResult(res)}
              />
            }
          />
          <Route
            path="/history"
            element={
              <HistoryView
                incidents={incidents}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                onOpenReport={(inc) => {
                  if (inc.details) setReportResult(inc.details);
                }}
                onDeleteIncident={handleDeleteIncident}
                onClearHistory={handleClearHistory}
                onReseedDemoData={handleReseedDemoData}
              />
            }
          />
          <Route
            path="/reports"
            element={
              <ReportsView
                incidents={incidents}
                onPreviewReport={(res) => setReportResult(res)}
              />
            }
          />
          <Route path="/architecture" element={<ArchitectureView />} />
          <Route path="/future-scope" element={<FutureScopeView />} />
          <Route path="/roadmap" element={<Navigate to="/future-scope" replace />} />
          <Route path="/privacy" element={<PrivacyView />} />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Incident Detail Drawer */}
      <IncidentDrawer
        isOpen={Boolean(selectedIncident)}
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onOpenVerification={() => {
          if (selectedIncident?.details) {
            setVerificationResult(selectedIncident.details);
          }
          setSelectedIncident(null);
        }}
        onViewReport={(inc: IncidentRecord) => {
          if (inc.details) {
            setReportResult(inc.details);
          }
          setSelectedIncident(null);
        }}
      />

      {/* Secondary Verification Modal */}
      <SecondaryVerificationModal
        isOpen={Boolean(verificationResult)}
        onClose={() => setVerificationResult(null)}
        result={verificationResult}
        onCompleteVerification={(newStatus: 'Verified' | 'Held & Escalated') => {
          if (verificationResult) {
            handleVerificationComplete(verificationResult.id, newStatus);
          }
        }}
      />

      {/* Forensic Report Preview Modal */}
      <ReportPreviewModal
        isOpen={Boolean(reportResult)}
        onClose={() => setReportResult(null)}
        result={reportResult}
      />

      {/* Privacy & Ethics Charter Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Floating Smooth Scroll-To-Top Button with Progress Ring */}
      <ScrollToTop />
    </div>
  );
}
