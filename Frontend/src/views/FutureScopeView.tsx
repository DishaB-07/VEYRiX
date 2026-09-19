import React from 'react';
import {
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
  ArrowRight,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThreeDCard } from '../components/ThreeDCard';

export const FutureScopeView: React.FC = () => {
  const stages = [
    {
      stage: 1,
      title: 'Current Prototype',
      badge: 'Active Now',
      badgeColor: 'bg-teal-950 text-teal-300 border-teal-500/40',
      active: true,
      description:
        'Interactive web demo that lets you test voice recordings, inspect audio clues, scan for risky keywords, and view clear safety recommendations.',
      features: [
        'Upload sample audio files (WAV, MP3, M4A, OGG)',
        'Record your voice right in the browser',
        'Check acoustic pitch patterns and robotic artifacts',
        'Detect urgent money or password requests',
        'Calculate overall risk score from 0 to 100',
        'Simple action advice (Safe, Check First, or Stop)',
        'Review and delete past test records anytime',
        'Export and print clear incident summaries',
      ],
    },
    {
      stage: 2,
      title: 'Real-Time Audio',
      badge: 'Next Up',
      badgeColor: 'bg-sky-950 text-sky-300 border-sky-500/40',
      active: false,
      description:
        'Listen to ongoing calls second-by-second with rolling risk alerts whenever caller tone changes or urgent demands start.',
      features: [
        'Analyze audio in small 500ms continuous chunks',
        'Live risk score updates while the call is happening',
        'Instant on-screen popups and alert sounds for operators',
        'Super-fast response (<150ms) using optimized models',
        'Filter out background room noise and hiss',
        'Live speech transcription with automatic keyword scanning',
      ],
    },
    {
      stage: 3,
      title: 'Enterprise Integration',
      badge: 'Planned Scope',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-500/40',
      active: false,
      description:
        'Connect directly into corporate phone systems, call center software, and banking gateways to pause suspicious wire transfers automatically.',
      features: [
        'Plug into business phone lines and call center software',
        'Connect with Genesys, Cisco, Avaya, and Amazon Connect',
        'Direct VoIP and SIP line monitoring',
        'Send alert signals to banking software to hold suspicious wires',
        'One-click supervisor alerts and incident ticket creation',
        'Fast two-step verification via phone push notification',
      ],
    },
    {
      stage: 4,
      title: 'Advanced Research',
      badge: 'Future Research',
      badgeColor: 'bg-teal-950/60 text-teal-400 border-teal-800',
      active: false,
      description:
        'Expand voice scam detection across regional Indian languages, varied accents, and new deepfake generation techniques.',
      features: [
        'Support Indian regional languages (Hindi, Tamil, Telugu, Bengali, Marathi, etc.)',
        'Accurate detection across local accents and weak phone connections',
        'Spot audio played from speakerphones and recordings',
        'Run lightweight models directly on mobile devices',
        'Zero audio saved on servers for guaranteed privacy',
        'Continuous defense against newest zero-shot voice clones',
        'Self-calibrating models that adapt to new scam tactics',
      ],
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-16">
      {/* Top Header */}
      <div className="text-left space-y-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            What's Next &amp; Future Plans
          </h1>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/40">
            Roadmap
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
          Where VEYRiX is today, and how we plan to expand from an interactive web demo to real-time phone call protection and bank security.
        </p>
      </div>

      {/* PROTOTYPE NOTICE */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#101c38] via-[#0c152a] to-[#101c38] border border-teal-500/30 space-y-2 text-left shadow-md">
        <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Active Prototype vs. Future Roadmap</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          The current VEYRiX application is an interactive prototype developed for <strong>SIH26104</strong>. It processes audio uploads, browser recordings, acoustic signals, and intent markers safely within your browser. Direct telecom carrier integration and automated banking API locks are planned for subsequent phases.
        </p>
      </div>

      {/* 4 STAGES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stages.map((st) => (
          <ThreeDCard
            key={st.stage}
            maxTilt={4}
            className={`p-6 rounded-2xl border transition-all space-y-4 relative overflow-hidden flex flex-col justify-between text-left ${
              st.active
                ? 'bg-gradient-to-b from-[#101c38] to-[#0c152a] border-teal-400 shadow-xl shadow-teal-950/40'
                : 'bg-[#080e1d] border-slate-800 hover:border-slate-700'
            }`}
          >
            {st.active && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-teal-500 to-sky-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Current Active Stage
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono">
                  Stage {st.stage}
                </span>
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${st.badgeColor}`}>
                  {st.badge}
                </span>
              </div>

              <h3 className="text-lg font-bold font-display text-white">
                {st.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {st.description}
              </p>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-[11px] uppercase text-slate-400 mb-2 font-bold">
                  Key Capabilities:
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {st.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                          st.active ? 'text-teal-400' : 'text-slate-500'
                        }`}
                      />
                      <span className={st.active ? 'text-slate-200' : 'text-slate-400'}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {st.active && (
              <div className="pt-4 mt-2">
                <Link
                  to="/analyze"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20 transition-all w-full sm:w-auto cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Try the Live Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </ThreeDCard>
        ))}
      </div>

      {/* ROADMAP SUMMARY BANNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#101c38] to-[#0c152a] border border-teal-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left shadow-lg">
        <div>
          <h4 className="text-base font-bold text-white font-display">
            Want to see how VEYRiX works behind the scenes?
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
            See how our 4 safety checks evaluate audio pitch, voice match, and urgent words in plain terms.
          </p>
        </div>

        <Link
          to="/architecture"
          className="flex items-center justify-center px-4 py-2.5 min-h-[40px] rounded-xl bg-[#080e1d] hover:bg-[#142346] text-teal-300 text-xs font-semibold border border-teal-500/30 transition-colors shrink-0 w-full sm:w-auto text-center cursor-pointer shadow-sm"
        >
          See How It Works
        </Link>
      </div>
    </div>
  );
};
