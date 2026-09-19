import React, { useState, useEffect } from 'react';
import {
  X,
  PhoneCall,
  KeyRound,
  Smartphone,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnalysisResult } from '../../types';

interface SecondaryVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult | null;
  onCompleteVerification: (newStatus: 'Verified' | 'Held & Escalated') => void;
}

export const SecondaryVerificationModal: React.FC<SecondaryVerificationModalProps> = ({
  isOpen,
  onClose,
  result,
  onCompleteVerification,
}) => {
  const [method, setMethod] = useState<'callback' | 'challenge' | 'push'>('callback');
  const [step, setStep] = useState<'select' | 'processing' | 'success' | 'fraudConfirmed'>('select');
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [loadingText, setLoadingText] = useState('');

  // Reset workflow steps whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setMethod('callback');
      setChallengeAnswer('');
      setLoadingText('');
    }
  }, [isOpen]);

  if (!isOpen || !result) return null;

  const handleStartWorkflow = () => {
    setStep('processing');
    if (method === 'callback') {
      setLoadingText('Calling registered phone number +1 (555) 019-8321...');
      setTimeout(() => {
        setLoadingText('Connecting to caller directly...');
        setTimeout(() => {
          setLoadingText('Caller answered: True identity confirmed!');
          setTimeout(() => {
            setStep('success');
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          }, 800);
        }, 1000);
      }, 900);
    } else if (method === 'push') {
      setLoadingText('Sending confirmation prompt to mobile app...');
      setTimeout(() => {
        setLoadingText('Waiting for tap on phone...');
        setTimeout(() => {
          setStep('success');
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }, 1200);
      }, 1000);
    } else {
      setLoadingText('Checking secret word...');
      setTimeout(() => {
        setStep('success');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }, 900);
    }
  };

  const handleReportFraud = () => {
    setStep('fraudConfirmed');
    onCompleteVerification('Held & Escalated');
  };

  const handleFinishVerified = () => {
    onCompleteVerification('Verified');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 text-left">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/30 p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-white">
              Confirm Caller Identity
            </h3>
            <p className="text-xs text-slate-300">
              Checking call <span className="font-mono text-teal-300">{result.id}</span>
            </p>
          </div>
        </div>

        {/* Prototype notice badge */}
        <div className="mb-5 px-3.5 py-2 rounded-xl bg-[#080e1d] border border-teal-500/20 text-xs text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            Simulated callback workflow for testing and demonstrations.
          </span>
        </div>

        {step === 'select' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              To stay safe against AI voice clones, always verify the caller on a separate channel before sending money or sharing confidential info.
            </p>

            <div className="space-y-2.5">
              {[
                {
                  id: 'callback',
                  title: 'Direct Phone Callback',
                  desc: 'Call them back on their known, saved phone number.',
                  icon: PhoneCall,
                },
                {
                  id: 'push',
                  title: 'Mobile App Push Alert',
                  desc: 'Send an approval prompt to their mobile device.',
                  icon: Smartphone,
                },
                {
                  id: 'challenge',
                  title: 'Family / Team Secret Word',
                  desc: 'Ask for your pre-arranged private passphrase.',
                  icon: KeyRound,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = method === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setMethod(item.id as typeof method)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#142346] border-teal-400 text-white shadow-md'
                        : 'bg-[#080e1d] border-slate-800 text-slate-300 hover:bg-[#0c162e]'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg mt-0.5 ${
                        isSelected ? 'bg-gradient-to-r from-teal-500 to-sky-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {method === 'challenge' && (
              <div className="pt-2">
                <label className="block text-xs text-slate-400 mb-1">
                  Secret Word / Passphrase:
                </label>
                <input
                  type="text"
                  value={challengeAnswer}
                  onChange={(e) => setChallengeAnswer(e.target.value)}
                  placeholder="e.g. Golden Meadow"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080e1d] border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={handleStartWorkflow}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-teal-500/20 cursor-pointer"
              >
                <span>Start Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleReportFraud}
                className="py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-all cursor-pointer"
              >
                Flag Scam &amp; Stop
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-2 border-teal-500/30 border-t-teal-400 animate-spin flex items-center justify-center" />
              <Loader2 className="w-6 h-6 text-teal-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Contacting Caller</h4>
              <p className="text-xs text-teal-300 mt-2 max-w-sm">
                {loadingText}
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-teal-500/20 border border-teal-500/50 flex items-center justify-center text-teal-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-display">
                Caller Verified!
              </h4>
              <p className="text-xs text-slate-300 max-w-sm mt-1">
                You confirmed the caller&apos;s identity on a separate channel.
              </p>
            </div>

            <div className="w-full p-3.5 rounded-xl bg-[#080e1d] border border-teal-500/30 text-left text-xs space-y-1 text-slate-300">
              <div>Method: Direct Phone Callback</div>
              <div>Time: {new Date().toLocaleTimeString()}</div>
            </div>

            <button
              onClick={handleFinishVerified}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md shadow-teal-500/20"
            >
              Mark as Verified &amp; Close
            </button>
          </div>
        )}

        {step === 'fraudConfirmed' && (
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-display">
                Flagged as Impersonation / Scam
              </h4>
              <p className="text-xs text-slate-300 max-w-sm mt-1">
                This call has been marked as high risk. Do not send money, wire funds, or share passwords.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
