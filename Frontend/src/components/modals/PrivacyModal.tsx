import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, UserCheck, AlertTriangle, Cpu, FileCheck } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Human-centered Privacy & Security Charter
 * Reassures users that their personal voice recordings remain strictly private.
 */
export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0a131c] border border-teal-500/30 p-6 shadow-2xl text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white">
              Privacy, Ethics &amp; Voice Safety Charter
            </h3>
            <p className="text-xs text-slate-400">
              Designed to protect human dignity, family privacy, and digital trust
            </p>
          </div>
        </div>

        {/* Highlight Core Privacy Message */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-teal-950/40 to-emerald-950/30 border border-teal-800/40 mb-6">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white">
                Human-Centered, On-Device Voice Protection
              </h4>
              <p className="text-xs text-teal-200/90 mt-1 leading-relaxed">
                <strong>“Your voice is your personal identity.”</strong> VEYRiX processes acoustic features locally inside your web browser. Audio is never harvested, saved to remote databases, or used for AI training.
              </p>
            </div>
          </div>
        </div>

        {/* Core Ethics Grid */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0f1b26] border border-teal-900/40 space-y-1.5">
              <div className="flex items-center gap-2 text-teal-300 font-semibold">
                <EyeOff className="w-4 h-4" />
                <span>Zero Audio Storage</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Audio memory buffers are cleared immediately after the safety check completes. No sound files are permanently retained on servers.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0f1b26] border border-teal-900/40 space-y-1.5">
              <div className="flex items-center gap-2 text-sky-300 font-semibold">
                <Cpu className="w-4 h-4" />
                <span>Advisory, Never Autonomous</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                AI is an advisor to help you make informed decisions. We encourage human conversation, personal callbacks, and verification before any money moves.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0f1b26] border border-teal-900/40 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <UserCheck className="w-4 h-4" />
                <span>Clear Consent</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Microphone capture requires your explicit browser click. You have full control to clear past check records anytime with one click.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0f1b26] border border-teal-900/40 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-300 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Honest Transparency</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Poor cellular signals or heavy background noise can sometimes cause unusual scores. Direct personal phone callbacks remain the ultimate ground truth.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0f1b26] border border-slate-800 space-y-2">
            <h5 className="font-semibold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Compliance with Data Privacy Principles
            </h5>
            <p className="text-slate-400 leading-relaxed">
              Designed in alignment with global data protection standards (DPDP and GDPR privacy principles). Voice recordings are treated as deeply sensitive personal information.
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 via-teal-300 to-sky-400 hover:from-teal-300 hover:to-sky-300 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20 cursor-pointer transition-all"
          >
            I Understand &amp; Agree
          </button>
        </div>
      </div>
    </div>
  );
};
