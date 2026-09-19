import React from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  UserCheck,
  Radio,
  Clock,
  Sparkles,
  PhoneCall,
} from 'lucide-react';
import { IncidentRecord } from '../../types';
import { RiskMeter } from '../common/RiskMeter';

interface IncidentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  incident: IncidentRecord | null;
  onOpenVerification: () => void;
  onViewReport: (incident: IncidentRecord) => void;
}

export const IncidentDrawer: React.FC<IncidentDrawerProps> = ({
  isOpen,
  onClose,
  incident,
  onOpenVerification,
  onViewReport,
}) => {
  if (!isOpen || !incident) return null;

  const result = incident.details;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl h-full bg-[#0a131c] border-l border-teal-500/20 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between text-slate-200">
        <div>
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30">
                <Radio className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-semibold text-teal-300">
                  {incident.id}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{incident.timestamp}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  incident.verificationStatus === 'Verified'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    : incident.verificationStatus === 'Held & Escalated'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                }`}
              >
                {incident.verificationStatus}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close call record drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Risk Overview Box */}
          <div className="mt-4 p-4 rounded-2xl bg-[#0f1b26] border border-teal-500/25 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Call Risk Assessment
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-2xl font-bold font-display ${
                    incident.riskLevel === 'high'
                      ? 'text-rose-400'
                      : incident.riskLevel === 'medium'
                      ? 'text-amber-400'
                      : 'text-teal-300'
                  }`}
                >
                  {incident.riskScore} / 100
                </span>
                <span className="text-xs uppercase font-semibold text-slate-300">
                  ({incident.riskLevel} Risk)
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Recommended Action:{' '}
                <strong className="text-white font-semibold">{incident.recommendedAction}</strong>
              </div>
            </div>

            <div className="w-24 h-24">
              <RiskMeter
                score={incident.riskScore}
                riskLevel={incident.riskLevel}
                recommendedAction={incident.recommendedAction}
                size="md"
              />
            </div>
          </div>

          {/* Primary Signal Summary */}
          <div className="mt-4 p-4 rounded-xl bg-teal-950/30 border border-teal-500/30 text-xs">
            <span className="text-teal-300 font-semibold uppercase text-[10px] tracking-wider block mb-1">
              Key Finding
            </span>
            <p className="text-slate-200 leading-relaxed">{incident.mainSignal}</p>
          </div>

          {/* Detailed Acoustic Signals */}
          {result && (
            <div className="mt-4 space-y-3 text-xs">
              <h4 className="font-semibold text-white uppercase text-xs tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Audio &amp; Voice Clues</span>
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#0f1b26] border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">
                    Synthetic Probability
                  </div>
                  <div className="text-base font-bold text-teal-300 mt-0.5">
                    {result.acousticSignals.syntheticProbability}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    {result.acousticSignals.syntheticDetails}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0f1b26] border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">
                    Speaker Similarity
                  </div>
                  <div className="text-base font-bold text-sky-300 mt-0.5">
                    {result.acousticSignals.speakerSimilarity !== null
                      ? `${result.acousticSignals.speakerSimilarity}%`
                      : 'N/A'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    {result.acousticSignals.speakerDetails}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0f1b26] border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">
                    Replay / Liveness
                  </div>
                  <div className="text-base font-bold text-amber-300 mt-0.5">
                    {result.acousticSignals.replayProbability}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    {result.acousticSignals.replayDetails}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0f1b26] border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">
                    Caller Context
                  </div>
                  <div className="text-base font-bold text-slate-200 mt-0.5">
                    {incident.callerType}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    Source: {incident.audioSource}
                  </div>
                </div>
              </div>

              {/* Transcript */}
              <div className="mt-3 p-3.5 rounded-xl bg-[#0f1b26] border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Call Transcript</span>
                  <span className="text-teal-300 font-semibold">Decoded Audio</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px]">
                  &quot;{result.transcript}&quot;
                </p>
              </div>

              {/* Detected Intent Tags */}
              <div className="mt-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                  Detected Red Flags
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.intent.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/60 text-[10px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reason Box */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs">
                <div className="text-amber-400 font-semibold mb-0.5">Why this interaction is risky:</div>
                <p className="text-slate-300 leading-relaxed">{result.intent.explanation}</p>
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="mt-4 p-3 rounded-xl bg-[#0f1b26]/70 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              Only security indicators are saved. Raw audio is never stored on servers.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-800 space-y-2 mt-6">
          {incident.verificationStatus !== 'Verified' && (
            <button
              type="button"
              onClick={onOpenVerification}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-teal-500/20 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Start Callback Verification</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onViewReport(incident)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>View Full Report</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-[#0f1b26] hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium border border-slate-800 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
