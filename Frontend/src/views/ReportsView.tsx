import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Printer,
  ShieldCheck,
  Radio,
  FileCheck,
  AlertTriangle,
  Filter,
  CheckCircle2,
  Users,
  Search,
  Activity,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { IncidentRecord, AnalysisResult } from '../types';
import { SIH_METADATA } from '../data/demoData';

interface ReportsViewProps {
  incidents: IncidentRecord[];
  onPreviewReport: (result: AnalysisResult) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  incidents,
  onPreviewReport,
}) => {
  const navigate = useNavigate();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    incidents[0]?.id || 'VX-101'
  );
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending Verification' | 'Verified' | 'Held & Escalated'>('all');

  const filteredIncidents = incidents.filter((inc) => {
    if (riskFilter !== 'all' && inc.riskLevel !== riskFilter) return false;
    if (statusFilter !== 'all' && inc.verificationStatus !== statusFilter) return false;
    return true;
  });

  const activeInc =
    filteredIncidents.find((i) => i.id === selectedIncidentId) ||
    filteredIncidents[0] ||
    incidents[0];
  const res = activeInc?.details;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = (inc: IncidentRecord) => {
    const data = {
      system: SIH_METADATA.systemName,
      problemCode: SIH_METADATA.problemCode,
      generatedAt: new Date().toISOString(),
      report: inc.details || inc,
      disclaimer: 'Demonstration Analysis — ' + SIH_METADATA.disclaimer,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VEYRiX-Report-${inc.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Metrics
  const totalReports = incidents.length;
  const highRiskReports = incidents.filter((i) => i.riskLevel === 'high').length;
  const pendingReports = incidents.filter((i) => i.verificationStatus === 'Pending Verification').length;
  const verifiedReports = incidents.filter((i) => i.verificationStatus === 'Verified').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-left pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-white">
              Call Safety Reports
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30">
              Audit Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Print or download summary reports of suspicious calls to share with your team.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {activeInc && (
            <>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-xl bg-[#101c38] hover:bg-[#142346] text-white text-xs font-semibold border border-teal-500/30 transition-all cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 text-teal-300" />
                <span>Print / Save PDF</span>
              </button>

              <button
                onClick={() => handleDownloadJSON(activeInc)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* SUMMARY CARDS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div className="p-4 rounded-xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/20 shadow-sm">
          <div className="text-[11px] text-slate-400 uppercase font-bold">
            Total Reports
          </div>
          <div className="text-2xl font-bold font-display text-white mt-1">
            {totalReports}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Recorded calls</div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-rose-800/30 shadow-sm">
          <div className="text-[11px] text-rose-300 uppercase font-bold">
            High Scam Risk
          </div>
          <div className="text-2xl font-bold font-display text-rose-400 mt-1">
            {highRiskReports}
          </div>
          <div className="text-[11px] text-rose-300/80 mt-0.5">Do not send money</div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-amber-800/30 shadow-sm">
          <div className="text-[11px] text-amber-300 uppercase font-bold">
            Needs Confirmation
          </div>
          <div className="text-2xl font-bold font-display text-amber-300 mt-1">
            {pendingReports}
          </div>
          <div className="text-[11px] text-amber-300/80 mt-0.5">Call back to check</div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/20 shadow-sm">
          <div className="text-[11px] text-teal-300 uppercase font-bold">
            Verified Safe
          </div>
          <div className="text-2xl font-bold font-display text-teal-300 mt-1">
            {verifiedReports}
          </div>
          <div className="text-[11px] text-teal-300/80 mt-0.5">Confirmed legitimate</div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/20 text-xs print:hidden shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <span>Risk:</span>
          </div>
          <div className="flex items-center gap-1">
            {(['all', 'high', 'medium', 'low'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  riskFilter === lvl
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-[#080e1d] text-slate-400 hover:text-white'
                }`}
              >
                {lvl.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span>Status:</span>
          </div>
          <div className="flex items-center gap-1">
            {(['all', 'Pending Verification', 'Verified', 'Held & Escalated'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-[#080e1d] text-slate-400 hover:text-white'
                }`}
              >
                {st === 'Pending Verification' ? 'Pending' : st === 'Held & Escalated' ? 'Escalated' : st}
              </button>
            ))}
          </div>
        </div>

        <div className="text-slate-400 text-xs">
          Showing {filteredIncidents.length} of {incidents.length}
        </div>
      </div>

      {/* MAIN GRID: Report List + Detail Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Report List */}
        <div className="lg:col-span-4 space-y-2 print:hidden">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Available Reports
          </div>

          {filteredIncidents.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#0c152a] border border-slate-800 text-center text-xs text-slate-400">
              No reports match the selected filters.
            </div>
          ) : (
            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {filteredIncidents.map((inc) => {
                const isSelected = inc.id === activeInc?.id;
                return (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#101c38] border-teal-400 text-white shadow-md'
                        : 'bg-[#091022] border-slate-800 text-slate-300 hover:bg-[#0d162d]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-teal-300">{inc.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          inc.riskLevel === 'high'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : inc.riskLevel === 'medium'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-teal-950 text-teal-300 border border-teal-500/40'
                        }`}
                      >
                        {inc.riskScore} / 100
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-100 mt-1 truncate">
                      {inc.detectionType}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1.5">
                      <span>{inc.timestamp.split(' ')[0]}</span>
                      <span>{inc.verificationStatus}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Report Detailed Dossier */}
        {activeInc && (
          <div className="lg:col-span-8 p-6 rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/20 space-y-6 print:border-none print:p-0 shadow-xl">
            {/* Header of Active Dossier */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-teal-300 uppercase font-mono">
                  Report: {activeInc.id}
                </span>
                <h2 className="text-xl font-bold font-display text-white mt-0.5">
                  {activeInc.detectionType}
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  Recorded: {activeInc.timestamp} • File: {activeInc.audioSource}
                </div>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <Link
                  to={`/analysis/${activeInc.id}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-xs font-bold transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </Link>
              </div>
            </div>

            {/* Dossier Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#080e1d] border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-medium">Risk Score</span>
                <div className="text-2xl font-bold text-white mt-0.5 font-display">
                  {activeInc.riskScore} / 100
                </div>
                <div className="text-[11px] text-slate-400 uppercase mt-0.5">
                  {activeInc.riskLevel} Risk
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080e1d] border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-medium">AI Sound Clues</span>
                <div className="text-2xl font-bold text-rose-400 mt-0.5 font-display">
                  {res ? res.acousticSignals.syntheticProbability : 88}%
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Synthetic Clues</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080e1d] border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-medium">Known Voice Match</span>
                <div className="text-2xl font-bold text-teal-300 mt-0.5 font-display">
                  {res && res.hasReferenceVoice && res.acousticSignals.speakerSimilarity !== null
                    ? `${res.acousticSignals.speakerSimilarity}%`
                    : 'Not Tested'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {res?.hasReferenceVoice ? 'Profile Compared' : 'No Reference Voice'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080e1d] border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-medium">Recommended Action</span>
                <div className="text-xs font-bold text-teal-300 mt-1">
                  {activeInc.recommendedAction === 'HOLD'
                    ? 'Stop & Call Back'
                    : activeInc.recommendedAction === 'VERIFY'
                    ? 'Confirm First'
                    : 'Routine / Cleared'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080e1d] border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-medium">Verification Status</span>
                <div className="text-xs font-bold text-amber-300 mt-1">
                  {activeInc.verificationStatus}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080e1d] border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-medium">Caller Claim</span>
                <div className="text-xs font-bold text-slate-200 mt-1 truncate">
                  {activeInc.callerType}
                </div>
              </div>
            </div>

            {/* Red Flags & Requests */}
            <div className="p-4 rounded-xl bg-[#080e1d] border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white uppercase">
                Red Flags in This Call
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {(res ? res.intent.tags : ['Money Transfer', 'Urgency', 'Secrecy']).map(
                  (tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg text-xs bg-[#101c38] text-teal-300 border border-teal-500/30"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Transcript */}
            {res && (
              <div className="p-4 rounded-xl bg-[#080e1d] border border-slate-800 space-y-2">
                <div className="text-[11px] text-slate-400 uppercase font-medium">
                  What Was Said
                </div>
                <p className="text-xs text-slate-200 leading-relaxed italic">
                  &quot;{res.transcript}&quot;
                </p>
              </div>
            )}

            {/* Voice Clues */}
            <div className="p-4 rounded-xl bg-[#080e1d] border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white uppercase">
                Acoustic Analysis Notes
              </span>
              <div className="space-y-2 text-xs text-slate-300">
                <div>
                  <strong className="text-teal-300">AI Sound Clues:</strong>{' '}
                  {res?.acousticSignals.syntheticDetails ||
                    'High frequency phase jumps characteristic of AI voice generator.'}
                </div>
                <div>
                  <strong className="text-sky-300">Speaker Match:</strong>{' '}
                  {res?.acousticSignals.speakerDetails ||
                    'Comparison against known voice sample.'}
                </div>
                <div>
                  <strong className="text-amber-300">Playback / Recording:</strong>{' '}
                  {res?.acousticSignals.replayDetails ||
                    'Direct microphone capture without secondary acoustic room echo.'}
                </div>
              </div>
            </div>

            {/* Safety Notice */}
            <div className="p-4 rounded-xl bg-[#080e1d]/80 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 uppercase text-[11px]">
                Safety Recommendation
              </div>
              <p className="leading-relaxed">
                If a caller demands money, passwords, or immediate wire transfers, always hang up and call them back on their known, personal phone number.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
