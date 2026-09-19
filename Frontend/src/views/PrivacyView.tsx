import React from 'react';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  Mic,
  Cpu,
  EyeOff,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThreeDCard } from '../components/ThreeDCard';

export const PrivacyView: React.FC = () => {
  const principles = [
    {
      title: 'No External Audio Upload',
      desc: 'All audio files uploaded and microphone recordings captured in this demo are processed directly inside your browser memory using the Web Audio API. Raw audio is never transmitted to external cloud servers or third-party storage.',
      icon: EyeOff,
      color: 'text-teal-400',
    },
    {
      title: 'Local Browser Demo Processing',
      desc: 'Speech features, waveform visualizations, and simulated acoustic checks execute entirely on the client side. No hidden network telemetry or cloud-hosted voice cloning pipelines are used.',
      icon: Cpu,
      color: 'text-sky-400',
    },
    {
      title: 'Zero Raw-Audio Retention',
      desc: 'VEYRiX adheres to a strict feature-extraction paradigm. In production designs, audio is converted into short-lived mathematical embeddings and raw acoustic buffers are immediately discarded from memory.',
      icon: ShieldCheck,
      color: 'text-emerald-400',
    },
    {
      title: 'User-Controlled Deletion',
      desc: 'You maintain full control over all stored demo incident records. Any analysis entry saved to your browser localStorage can be individually deleted or completely purged at any time from the History page.',
      icon: Trash2,
      color: 'text-rose-400',
    },
    {
      title: 'Explicit Consent Before Microphone Recording',
      desc: 'The application explicitly prompts for device audio permissions before initializing any hardware microphone stream. If microphone access is declined, safe in-browser audio simulation is provided without blocking evaluation.',
      icon: Mic,
      color: 'text-amber-400',
    },
    {
      title: 'Feature-Level Logging Where Possible',
      desc: 'Forensic audits record mathematical anomaly scores, timestamps, and recognized intent tags rather than conversational verbatim voiceprints, mitigating unauthorized surveillance or privacy leakage.',
      icon: FileText,
      color: 'text-sky-400',
    },
    {
      title: 'No Automatic Transaction Interception',
      desc: 'VEYRiX is strictly an advisory defense system. It never initiates, halts, or intercepts real-world banking transactions, wire transfers, or telephony switches without human operator verification.',
      icon: UserCheck,
      color: 'text-teal-300',
    },
    {
      title: 'Probabilistic Advisory Transparency',
      desc: 'AI-assisted acoustic classification is inherently probabilistic. False positives and false negatives are possible due to room acoustics, audio compression, or microphone differences. Final decisions must always include independent human verification.',
      icon: AlertTriangle,
      color: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-16 text-left">
      {/* Top Header */}
      <div className="space-y-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Privacy &amp; Safety Promise
          </h1>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30">
            Privacy First
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
          How we keep your voice data private, store records only on your own device, and ensure you remain in complete control.
        </p>
      </div>

      {/* CORE PHILOSOPHICAL COMMITMENT BANNER */}
      <ThreeDCard
        maxTilt={4}
        glareOpacity={0.1}
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#101c38] via-[#0c152a] to-[#101c38] border border-teal-500/30 shadow-2xl space-y-3"
      >
        <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
          <Lock className="w-4 h-4" />
          <span>Our Commitment to You</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
          &ldquo;We help you spot scams without ever saving your voice or deciding for you.&rdquo;
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Voice security should protect people, not spy on them. Your recordings never leave your browser, your audio is not kept on servers, and AI suggestions are meant to help you pause and verify &mdash; never to lock you out or take over your decisions.
        </p>
      </ThreeDCard>

      {/* 8 PRINCIPLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {principles.map((pr, idx) => {
          const Icon = pr.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#0f1b26] border border-slate-800/90 hover:border-teal-500/30 transition-all space-y-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0a131c] border border-slate-800 flex items-center justify-center shrink-0">
                  <Icon className={`w-5 h-5 ${pr.color}`} />
                </div>
                <h3 className="text-sm font-bold font-display text-white">
                  {pr.title}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {pr.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* DISCLAIMER BOX */}
      <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>Important Security Disclaimer</span>
        </div>
        <p className="text-xs text-amber-200/90 leading-relaxed">
          VEYRiX provides AI-assisted risk indicators. False positives and false negatives are possible. Independently verify sensitive requests. Never execute high-value wire transfers, provide OTP credentials, or alter critical account parameters based solely on automated acoustic signals.
        </p>
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0f1b26] border border-slate-800">
        <span className="text-xs sm:text-sm text-slate-300">
          Want to see where your call records are kept or delete them?
        </span>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Link
            to="/history"
            className="flex items-center justify-center px-4 py-2.5 min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors w-full sm:w-auto text-center"
          >
            Review Saved Calls
          </Link>
          <Link
            to="/analyze"
            className="flex items-center justify-center px-4 py-2.5 min-h-[40px] rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20 transition-all w-full sm:w-auto text-center"
          >
            Test a Call
          </Link>
        </div>
      </div>
    </div>
  );
};
