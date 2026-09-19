import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Clock,
  FileAudio,
  User,
  Users,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Share2,
  FileText,
  Volume2,
  ChevronRight,
  ExternalLink,
  ShieldX,
  Bookmark,
  Check,
} from 'lucide-react';
import { AnalysisResult, IncidentRecord } from '../types';
import { getIncidentById, saveIncidentsToStorage, loadIncidentsFromStorage } from '../utils/storage';
import { RiskMeter } from '../components/RiskMeter';
import { SecondaryVerificationModal } from '../components/SecondaryVerificationModal';
import { ReportPreviewModal } from '../components/ReportPreviewModal';
import { ThreeDCard } from '../components/ThreeDCard';

interface AnalysisDetailViewProps {
  onOpenVerification?: (res: AnalysisResult) => void;
  onOpenReport?: (res: AnalysisResult) => void;
}

export const AnalysisDetailView: React.FC<AnalysisDetailViewProps> = ({
  onOpenVerification,
  onOpenReport,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSavedToast, setIsSavedToast] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = getIncidentById(id);
    if (found) {
      setIncident(found);
      setResult(found.details || null);
    }
  }, [id]);

  if (!id || (!incident && !result)) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#101c38] border border-teal-500/30 flex items-center justify-center mx-auto text-teal-300">
          <FileAudio className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-display text-white">
          Call Record Not Found
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          The requested call (<code className="text-teal-300 font-mono">{id}</code>) could not be found.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/analyze"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 text-slate-950 font-bold text-xs"
          >
            Check a New Call
          </Link>
          <Link
            to="/history"
            className="px-4 py-2 rounded-xl bg-[#101c38] hover:bg-[#142346] text-white text-xs font-semibold"
          >
            View History
          </Link>
        </div>
      </div>
    );
  }

  const res = result!;
  const isHigh = res.riskLevel === 'high';
  const isMed = res.riskLevel === 'medium';
  const isLow = res.riskLevel === 'low';

  const riskLabel = isHigh ? 'High Risk' : isMed ? 'Caution' : 'Safe';
  const recommendedActionText = isHigh
    ? 'Stop & Call Back'
    : isMed
    ? 'Confirm Before Proceeding'
    : 'Routine / Safe';

  const handleCompleteVerification = (newStatus: 'Verified' | 'Held & Escalated') => {
    if (!incident || !res) return;
    const updatedDetails: AnalysisResult = {
      ...res,
      verificationStatus: newStatus,
    };
    const updatedInc: IncidentRecord = {
      ...incident,
      verificationStatus: newStatus,
      details: updatedDetails,
    };
    setIncident(updatedInc);
    setResult(updatedDetails);

    const all = loadIncidentsFromStorage();
    const updatedAll = all.map((i) => (i.id === incident.id ? updatedInc : i));
    saveIncidentsToStorage(updatedAll);
  };

  const handleSaveToHistory = () => {
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 text-left">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Link
            to="/history"
            className="p-2.5 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-[#101c38] hover:bg-[#142346] border border-teal-500/30 text-teal-300 transition-colors cursor-pointer"
            title="Back to History"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-display text-white">
                Call Details: {res.id}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30 font-mono">
                Saved Check
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Date: {res.timestamp}</span>
              <span>•</span>
              <span>File: {res.audioFileName}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleSaveToHistory}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-[#101c38] hover:bg-[#142346] text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            {isSavedToast ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isSavedToast ? 'Saved' : 'Bookmark'}</span>
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-[#101c38] hover:bg-[#142346] text-teal-300 text-xs font-semibold border border-teal-500/30 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Summary Report</span>
          </button>

          <Link
            to="/analyze"
            className="flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20 transition-all cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Check Another Call</span>
          </Link>
        </div>
      </div>

      {/* PROTOTYPE NOTICE */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#101c38] to-[#0c152a] border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wide">
              Call Safety Overview
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Review acoustic metrics and call requests. Always confirm urgent money demands directly on a trusted phone line.
            </div>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#080e1d] text-teal-300 text-[10px] font-mono shrink-0 border border-teal-500/20">
          Client Audio Check
        </span>
      </div>

      {/* MAIN RISK CARD */}
      <ThreeDCard
        maxTilt={4}
        glareOpacity={0.1}
        className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
          isHigh
            ? 'bg-gradient-to-b from-[#180a0e] via-[#0d070b] to-[#080e1d] border-rose-600/60 shadow-rose-950/30'
            : isMed
            ? 'bg-gradient-to-b from-[#1c1306] via-[#100b04] to-[#080e1d] border-amber-500/60 shadow-amber-950/30'
            : 'bg-gradient-to-b from-[#0c1c2e] via-[#081424] to-[#080e1d] border-teal-500/40 shadow-teal-950/30'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Risk Meter */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-[#080e1d]/80 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase tracking-wide mb-2 font-semibold">
              Risk Score
            </span>
            <RiskMeter
              score={res.overallRiskScore}
              riskLevel={res.riskLevel}
              recommendedAction={res.recommendedAction}
              size="lg"
            />
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-400">Level:</span>
              <span
                className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  isHigh
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : isMed
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-teal-950 text-teal-300 border border-teal-500/40'
                }`}
              >
                {riskLabel} ({res.overallRiskScore}/100)
              </span>
            </div>
          </div>

          {/* Right Column: Key Decision Parameters */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Recommended Action
                </span>
                <h2
                  className={`text-2xl sm:text-3xl font-bold font-display ${
                    isHigh ? 'text-rose-400' : isMed ? 'text-amber-300' : 'text-teal-300'
                  }`}
                >
                  {recommendedActionText}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status:</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    res.verificationStatus === 'Verified'
                      ? 'bg-teal-950 text-teal-300 border-teal-500/40'
                      : res.verificationStatus === 'Held & Escalated'
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}
                >
                  {res.verificationStatus}
                </span>
              </div>
            </div>

            {/* Contextual Parameters Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-[#080e1d] border border-slate-800">
                <div className="text-[11px] text-slate-400">Demand / Request</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">
                  {res.requestedAction}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#080e1d] border border-slate-800">
                <div className="text-[11px] text-slate-400">Urgency Level</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">
                  {res.urgency}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#080e1d] border border-slate-800">
                <div className="text-[11px] text-slate-400">Caller Role</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">
                  {res.callerType}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#080e1d] border border-slate-800">
                <div className="text-[11px] text-slate-400">Source Type</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">
                  {res.channel}
                </div>
              </div>
            </div>

            {/* Defense Analysis Statuses */}
            {(res.speakerVerificationStatus || res.voiceAuthenticityStatus || res.requestDangerStatus) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-[#080e1d] border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Speaker Match</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{res.speakerVerificationStatus || 'Unknown'}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#080e1d] border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">AI Voice Clues</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{res.voiceAuthenticityStatus || 'Audited'}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#080e1d] border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Replay Check</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{res.replayRiskStatus || 'Audited'}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#080e1d] border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Request Danger</div>
                  <div className="font-semibold text-rose-300 mt-0.5">{res.requestDangerStatus || 'Audited'}</div>
                </div>
              </div>
            )}

            {/* Risk Explanation Block */}
            <div className="p-4 rounded-xl bg-[#080e1d] border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-teal-300 uppercase">
                Why It Was Flagged
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {res.intent.explanation ||
                  'The caller asked for money urgently and pressured you not to verify. These high-pressure tactics indicate a potential scam.'}
              </p>
            </div>
          </div>
        </div>
      </ThreeDCard>

      {/* 4 SIGNAL CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Signal 1: Synthetic Voice Indicator */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/20 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Voice Clues</span>
            <Radio className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {res.acousticSignals.syntheticProbability}%
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {res.acousticSignals.syntheticDetails}
          </p>
          <div className="text-[10px] text-teal-400/90 pt-1 border-t border-slate-800">
            Probability voice was synthesized by an AI model
          </div>
        </div>

        {/* Signal 2: Speaker Consistency */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/20 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Known Voice Match</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {res.hasReferenceVoice && res.acousticSignals.speakerSimilarity !== null
              ? `${res.acousticSignals.speakerSimilarity}%`
              : 'N/A'}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {res.acousticSignals.speakerDetails}
          </p>
          <div className="text-[10px] text-sky-400/90 pt-1 border-t border-slate-800">
            Pitch and frequency similarity to enrolled contact
          </div>
        </div>

        {/* Signal 3: Replay / Hardware Artifacts */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/20 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Speaker / Playback Check</span>
            <Volume2 className="w-4 h-4 text-teal-300" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {res.replayRiskStatus}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {res.acousticSignals.replayDetails}
          </p>
          <div className="text-[10px] text-teal-300/90 pt-1 border-t border-slate-800">
            Detects recorded sound replayed via speakers
          </div>
        </div>

        {/* Signal 4: Intent & Action Danger */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/20 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Request Danger</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-display text-rose-400">
            {res.requestDangerStatus}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Demanded: {res.requestedAction} with {res.urgency} urgency.
          </p>
          <div className="text-[10px] text-rose-300/90 pt-1 border-t border-slate-800">
            Checks urgency tactics, money demands, or secret OTPs
          </div>
        </div>
      </div>

      {/* RECOMMENDED ACTION PROTOCOL CARD */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-xl ${
          isHigh
            ? 'bg-[#12080d] border-rose-800/80'
            : isMed
            ? 'bg-[#140e06] border-amber-800/80'
            : 'bg-[#0a1626] border-teal-500/40'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
              Immediate Safety Steps
            </span>
            <h3 className="text-xl font-bold font-display text-white mt-0.5">
              {res.securityRecommendation.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {res.securityRecommendation.description}
            </p>
          </div>

          {res.securityRecommendation.secondaryVerificationSuggested && (
            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="px-5 py-2.5 min-h-[40px] rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-teal-500/20 transition-all cursor-pointer shrink-0"
            >
              Start Callback Check
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {res.securityRecommendation.immediateSteps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#080e1d] border border-slate-800 text-xs text-slate-200"
            >
              <CheckCircle2
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  isHigh ? 'text-rose-400' : isMed ? 'text-amber-300' : 'text-teal-300'
                }`}
              />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECONDARY VERIFICATION MODAL */}
      <SecondaryVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        result={res}
        onCompleteVerification={handleCompleteVerification}
      />

      {/* FORENSIC REPORT MODAL */}
      <ReportPreviewModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        result={res}
      />
    </div>
  );
};
