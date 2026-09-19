import React from 'react';
import {
  Milestone,
  CheckCircle2,
  Clock,
  Radio,
  Server,
  Building,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Network,
  Cpu,
} from 'lucide-react';
import { ROADMAP_PHASES, SIH_METADATA } from '../data/demoData';

export const RoadmapView: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="text-left space-y-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold font-display text-white">
            Project Roadmap
          </h1>
          <span className="text-[10px] font-mono-cyber font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
            TIMELINE
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-3xl">
          From an interactive demo prototype to enterprise phone protection and bank security integrations.
        </p>
      </div>

      {/* REALITY CHECK / DEPLOYMENT HONESTY BANNER */}
      <div className="p-6 rounded-2xl bg-[#0e1628] border border-cyan-800/70 space-y-3 text-left">
        <div className="flex items-center gap-2 text-cyan-300 font-mono-cyber text-xs font-bold uppercase">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Clear &amp; Honest Scope</span>
        </div>
        <h2 className="text-base sm:text-lg font-bold font-display text-white">
          What works right now vs what comes in future phases
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          VEYRiX is currently an interactive test prototype for <strong>SIH26104</strong>. It processes audio uploads, microphone audio, acoustic clues, and urgent requests safely inside your browser. Live telephone line interception and bank database updates are strictly reserved for later stages once telecom licenses and bank partnerships are in place.
        </p>
      </div>

      {/* 4 ROADMAP PHASES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ROADMAP_PHASES.map((phase) => {
          const isCurrent = phase.status === 'Current Prototype';
          return (
            <div
              key={phase.phase}
              className={`p-6 rounded-2xl border transition-all space-y-4 relative overflow-hidden ${
                isCurrent
                  ? 'bg-gradient-to-b from-[#0e1b30] to-[#080d19] border-cyan-500 shadow-xl shadow-cyan-950/40'
                  : 'bg-[#080d1a] border-slate-800'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[9px] font-mono-cyber font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Active Demo Phase
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono-cyber font-bold text-cyan-400 uppercase">
                    Phase 0{phase.phase}
                  </span>
                  <h3 className="text-base font-bold font-display text-white mt-0.5">
                    {phase.title}
                  </h3>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-[11px] font-mono-cyber text-slate-300">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Timeline: {phase.timeline}</span>
                <span className="text-slate-500">•</span>
                <span className={isCurrent ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {phase.status}
                </span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                {phase.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        isCurrent ? 'text-cyan-400' : 'text-slate-600'
                      }`}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* TELECOM & ENTERPRISE INTEGRATION REQUIREMENTS */}
      <div className="p-6 rounded-2xl bg-[#080d1a] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <h3 className="text-base font-bold font-display text-white">
            Enterprise &amp; Carrier Integration Prerequisites (Phase 3 &amp; 4)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono-cyber">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="text-cyan-300 font-bold">1. Telecom Edge Ingress</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              SIP trunking proxy or Session Border Controller (SBC) mirroring for in-line RTP audio analysis with &lt;150ms round-trip latency.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="text-cyan-300 font-bold">2. Banking Workflow Gateways</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Open Banking / ISO 20022 webhooks to hold pending transfers pending secondary authentication completion.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="text-cyan-300 font-bold">3. Privacy Vault Encryption</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Zero-knowledge speaker embedding storage with HSM key isolation complying with DPDP (India) and GDPR.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
