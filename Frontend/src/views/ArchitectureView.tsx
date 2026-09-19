import React from 'react';
import {
  Cpu,
  Layers,
  GitBranch,
  ShieldAlert,
  Radio,
  Sparkles,
  ArrowDown,
  Lock,
  Search,
  CheckCircle2,
  Workflow,
  Terminal,
  Database,
  Server,
  Zap,
} from 'lucide-react';
import { ThreeDCard } from '../components/ThreeDCard';
import { TECH_STACK_COMPONENTS } from '../data/demoData';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="text-left space-y-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            How VEYRiX Works
          </h1>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/40">
            Step-by-Step
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
          See how VEYRiX checks the voice, compares speakers, and looks for suspicious requests such as money transfers, OTPs, or passwords.
        </p>
      </div>

      {/* PROMINENT INNOVATION CALLOUT IN 3D */}
      <ThreeDCard
        maxTilt={4}
        glareOpacity={0.12}
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#101c38] via-[#0c152a] to-[#122244] border border-teal-500/30 shadow-2xl text-left"
      >
        <div className="flex items-start gap-5">
          <div className="p-3.5 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0 shadow-md">
            <Zap className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-teal-300 uppercase font-bold tracking-wider">
              Core Protection Rule
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              &ldquo;Check what they ask you to do &mdash; not just how the voice sounds.&rdquo;
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              A cloned voice can sound convincing. That&rsquo;s why VEYRiX looks at more than the voice itself. It also checks the speaker, the recording, and what the caller is asking you to do.
              <br /><br />
              Even when a voice sounds familiar, an urgent request for money, an OTP, or secrecy is a reason to pause and verify.
            </p>
          </div>
        </div>
      </ThreeDCard>

      {/* DETAILED ARCHITECTURE FLOW */}
      <div className="space-y-8 text-left">
        <div className="text-center space-y-1.5">
          <span className="text-xs uppercase text-teal-300 font-bold px-3 py-1 rounded-full bg-teal-950 border border-teal-500/40">
            System Pipeline
          </span>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
            How Every Call Is Checked
          </h3>
        </div>

        {/* Pipeline Step 1 & 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ThreeDCard
            maxTilt={5}
            className="p-6 rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/20 space-y-2.5 shadow-lg"
          >
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase">
              <Radio className="w-4 h-4 text-teal-400" />
              <span>Step 1 &mdash; Audio Ingestion</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Record a voice sample using your microphone or upload an existing audio file.
            </p>
          </ThreeDCard>

          <ThreeDCard
            maxTilt={5}
            className="p-6 rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-sky-500/20 space-y-2.5 shadow-lg"
          >
            <div className="flex items-center gap-2 text-sky-300 text-xs font-bold uppercase">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Step 2 &mdash; Noise Clean-Up</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The audio is prepared for analysis by reducing unwanted noise, adjusting volume, and identifying useful parts of the recording.
            </p>
          </ThreeDCard>
        </div>

        {/* Connecting Arrow */}
        <div className="flex justify-center text-teal-400">
          <ArrowDown className="w-6 h-6 animate-bounce" />
        </div>

        {/* 4 SIMULTANEOUS SAFETY CHECKS */}
        <div>
          <div className="text-center mb-5 text-xs uppercase text-teal-300 font-bold">
            Step 3 &mdash; 4 Safety Checks Run Together
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Branch 1 */}
            <ThreeDCard
              maxTilt={6}
              className="p-5 rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/20 space-y-3.5 shadow-xl"
            >
              <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase">
                <Radio className="w-4 h-4" />
                <span>Check 1: Voice Signals</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Looks for unusual pitch patterns</li>
                <li>Checks for synthetic-sounding artifacts</li>
                <li>Examines the audio for irregularities</li>
                <li>Produces the available voice-analysis score</li>
              </ul>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Looks for signs that the voice may be synthetic
              </div>
            </ThreeDCard>

            {/* Branch 2 */}
            <ThreeDCard
              maxTilt={6}
              className="p-5 rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-sky-500/20 space-y-3.5 shadow-xl"
            >
              <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase">
                <Cpu className="w-4 h-4" />
                <span>Check 2: Voice Match</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Compares the recording with a known voice</li>
                <li>Looks at voice characteristics</li>
                <li>Checks for differences between the speakers</li>
                <li>Produces the available match score</li>
              </ul>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Helps verify whether the caller sounds like the expected person
              </div>
            </ThreeDCard>

            {/* Branch 3 */}
            <ThreeDCard
              maxTilt={6}
              className="p-5 rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-amber-500/20 space-y-3.5 shadow-xl"
            >
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Check 3: Recording Check</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Looks for signs of replayed audio</li>
                <li>Checks for unusual recording characteristics</li>
                <li>Looks for possible speaker or room effects</li>
                <li>Evaluates whether the recording appears consistent with a live voice sample</li>
              </ul>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Helps identify possible replayed or recorded audio
              </div>
            </ThreeDCard>

            {/* Branch 4 */}
            <ThreeDCard
              maxTilt={6}
              className="p-5 rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-rose-500/20 space-y-3.5 shadow-xl"
            >
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase">
                <Search className="w-4 h-4" />
                <span>Check 4: Request Check</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Looks for requests involving sensitive actions</li>
                <li>Detects urgent language</li>
                <li>Flags requests to keep things secret</li>
                <li>Checks for OTP, password, or money-related requests</li>
              </ul>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Looks for common social-engineering warning signs
              </div>
            </ThreeDCard>
          </div>
        </div>

        {/* Connecting Arrow */}
        <div className="flex justify-center text-teal-400">
          <ArrowDown className="w-6 h-6 animate-bounce" />
        </div>

        {/* Step 4: Action-Bound Risk Engine */}
        <ThreeDCard
          maxTilt={4}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/30 space-y-4 shadow-xl"
        >
          <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase">
            <Workflow className="w-4 h-4 text-teal-400" />
            <span>Step 4 &mdash; Combining the Signals</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            VEYRiX combines the available signals into a simple risk score from 0 to 100. A higher score means the call contains more warning signs and should be checked more carefully.
          </p>

          <div className="p-4 rounded-xl bg-[#080e1d] border border-teal-500/20 text-xs text-teal-300 font-mono shadow-inner">
            Total Score = (Request Check &times; 40%) + (Voice Signals &times; 35%) + (Voice Mismatch &times; 15%) + (Recording Check &times; 10%)
          </div>
        </ThreeDCard>

        {/* Connecting Arrow */}
        <div className="flex justify-center text-teal-400">
          <ArrowDown className="w-6 h-6 animate-bounce" />
        </div>

        {/* Step 5: Decision Output */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ThreeDCard
            maxTilt={6}
            className="p-5 rounded-2xl bg-gradient-to-b from-[#0c2222] to-[#080e1d] border border-teal-500/40 space-y-2.5 shadow-lg"
          >
            <div className="text-xs font-bold text-teal-300 uppercase">
              Safe (0&ndash;30) &rarr; Routine Call
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              No major warning signs were detected. Still, avoid sharing sensitive information unless you are sure who you are speaking with.
            </p>
          </ThreeDCard>

          <ThreeDCard
            maxTilt={6}
            className="p-5 rounded-2xl bg-gradient-to-b from-[#241a0b] to-[#080e1d] border border-amber-500/40 space-y-2.5 shadow-lg"
          >
            <div className="text-xs font-bold text-amber-300 uppercase">
              Caution (31&ndash;70) &rarr; Double-Check
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Some warning signs were detected. Pause and contact the person through a trusted number before taking action.
            </p>
          </ThreeDCard>

          <ThreeDCard
            maxTilt={6}
            className="p-5 rounded-2xl bg-gradient-to-b from-[#240c15] to-[#080e1d] border border-rose-500/40 space-y-2.5 shadow-lg"
          >
            <div className="text-xs font-bold text-rose-300 uppercase">
              Danger (71&ndash;100) &rarr; Stop &amp; Hang Up
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Several warning signs were detected. Don&rsquo;t send money or share passwords or OTPs. Hang up and contact the person using a trusted number.
            </p>
          </ThreeDCard>
        </div>
      </div>

      {/* TECH STACK */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/30 space-y-6 text-left shadow-2xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold font-display text-white">
              Technology Stack
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30">
              Modern Web &amp; Audio
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Built with modern web technologies for recording, processing, and visualizing voice data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TECH_STACK_COMPONENTS.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#080e1d] border border-slate-800 space-y-2 hover:border-teal-500/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300 font-mono">
                  {item.layer}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#101c38] text-slate-300 border border-slate-700">
                  {item.status}
                </span>
              </div>
              <div className="text-xs font-semibold text-white">
                {item.tech}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.purpose}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
