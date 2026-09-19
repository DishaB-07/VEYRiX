import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Radio,
  Clock,
  Info,
} from 'lucide-react';
import { AnalysisResult } from '../../types';
import { SIH_METADATA } from '../../data/demoData';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult | null;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [pdfNotice, setPdfNotice] = useState(false);

  if (!isOpen || !result) return null;

  const handleDownloadJSON = () => {
    const reportData = {
      system: SIH_METADATA.systemName,
      problemCode: SIH_METADATA.problemCode,
      generatedAt: new Date().toISOString(),
      assessment: result,
      complianceDisclaimer: SIH_METADATA.disclaimer,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VEYRiX-Report-${result.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintOrPdf = () => {
    try {
      window.print();
    } catch {
      setPdfNotice(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 text-left">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/30 p-6 md:p-8 shadow-2xl text-slate-200 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Report Top Branding */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-display text-white tracking-wider">
                  VEYRiX
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/40">
                  {SIH_METADATA.problemCode}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Call Safety &amp; Risk Summary
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-300">
            <div>
              Call ID: <strong className="text-teal-300 font-mono">{result.id}</strong>
            </div>
            <div>Date: {result.timestamp}</div>
            <div className="text-[11px] text-slate-400">
              Status: {result.verificationStatus}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 my-4 rounded-xl bg-[#080e1d] border border-slate-800 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <FileCheck className="w-4 h-4 text-teal-400" />
            <span>Report ready to print or export</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101c38] hover:bg-[#142346] text-teal-300 text-xs font-semibold border border-teal-500/30 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>

            <button
              onClick={handlePrintOrPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {pdfNotice && (
          <div className="mb-4 p-3 rounded-lg bg-blue-950/40 border border-blue-800 text-xs text-blue-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-400" />
              <span>
                Report export formatted for print or PDF save.
              </span>
            </span>
            <button
              onClick={() => setPdfNotice(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Section 1: Summary */}
        <div className="space-y-6 text-xs">
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-1 mb-3">
              1. Overview
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#080e1d] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">
                  Overall Risk Score
                </span>
                <div
                  className={`text-2xl font-bold font-display mt-1 ${
                    result.riskLevel === 'high'
                      ? 'text-rose-400'
                      : result.riskLevel === 'medium'
                      ? 'text-amber-400'
                      : 'text-teal-300'
                  }`}
                >
                  {result.overallRiskScore} / 100
                </div>
                <div className="text-xs font-semibold uppercase text-slate-300 mt-0.5">
                  {result.riskLevel} Risk
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080e1d] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">
                  Recommended Action
                </span>
                <div className="text-sm font-bold text-white mt-1">
                  {result.recommendedAction === 'HOLD'
                    ? 'Stop & Call Back'
                    : result.recommendedAction === 'VERIFY'
                    ? 'Confirm First'
                    : 'Routine / Safe'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Safety Guideline
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080e1d] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">
                  Audio File
                </span>
                <div className="text-xs font-semibold text-teal-300 mt-1 truncate">
                  {result.audioFileName}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Duration: {result.audioDurationSeconds}s ({result.channel})
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Call Context */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-1 mb-3">
              2. Call Details
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#080e1d] border border-slate-800">
                <div className="text-slate-400 text-[10px]">Caller Context</div>
                <div className="text-white font-semibold">{result.callerType}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#080e1d] border border-slate-800">
                <div className="text-slate-400 text-[10px]">What They Asked For</div>
                <div className="text-teal-300 font-semibold truncate">{result.requestedAction}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#080e1d] border border-slate-800">
                <div className="text-slate-400 text-[10px]">Urgency Level</div>
                <div className="text-white font-semibold">{result.urgency}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#080e1d] border border-slate-800">
                <div className="text-slate-400 text-[10px]">Voice Profile</div>
                <div className="text-white font-semibold">
                  {result.hasReferenceVoice ? 'Profile Compared' : 'No Reference Voice'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Audio & Voice Clues */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-1 mb-3">
              3. Voice &amp; Acoustic Clues
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-[#080e1d] border border-slate-800 flex items-start justify-between gap-4">
                <div>
                  <div className="font-bold text-teal-300">
                    AI Voice Clues: {result.acousticSignals.syntheticProbability}%
                  </div>
                  <p className="text-slate-300 mt-0.5">
                    {result.acousticSignals.syntheticDetails}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#080e1d] border border-slate-800 flex items-start justify-between gap-4">
                <div>
                  <div className="font-bold text-sky-300">
                    Known Speaker Match:{' '}
                    {result.acousticSignals.speakerSimilarity !== null
                      ? `${result.acousticSignals.speakerSimilarity}%`
                      : 'Not Tested'}
                  </div>
                  <p className="text-slate-300 mt-0.5">
                    {result.acousticSignals.speakerDetails}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#080e1d] border border-slate-800 flex items-start justify-between gap-4">
                <div>
                  <div className="font-bold text-amber-300">
                    Playback / Replay Check: {result.acousticSignals.replayProbability}%
                  </div>
                  <p className="text-slate-300 mt-0.5">
                    {result.acousticSignals.replayDetails}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: What Was Said */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-1 mb-3">
              4. Transcript &amp; Red Flags
            </h4>
            <div className="p-3 rounded-xl bg-[#080e1d] border border-slate-800 text-slate-300 leading-relaxed italic">
              &quot;{result.transcript}&quot;
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {result.intent.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-[11px]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-2.5 p-3 rounded-lg bg-[#080e1d] border border-slate-800 text-slate-300">
              <strong className="text-white">Why It Was Flagged: </strong>
              {result.intent.explanation}
            </div>
          </div>

          {/* Section 5: Prescribed Steps */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-1 mb-3">
              5. Recommended Safety Steps
            </h4>
            <div className="space-y-1.5">
              {result.securityRecommendation.immediateSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#080e1d] border border-slate-800 flex items-center gap-2 text-slate-300"
                >
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Notice */}
          <div className="p-3 rounded-xl bg-[#080e1d]/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 uppercase text-[11px]">
              Safety Advisory
            </div>
            <p className="leading-relaxed">
              Never transfer funds, change passwords, or send gift cards solely based on an unsolicited incoming voice call. Always independently verify using a known number.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
