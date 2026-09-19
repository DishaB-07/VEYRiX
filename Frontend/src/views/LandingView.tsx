import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  Radio,
  ArrowRight,
  Cpu,
  Lock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Building2,
  Landmark,
  Headphones,
  Users,
  ShieldCheck,
  Activity,
  Zap,
  UserCheck,
  PhoneCall,
  Check,
} from 'lucide-react';
import { WaveformVisualizer } from '../components/WaveformVisualizer';
import { ThreeDCard } from '../components/ThreeDCard';
import { SIH_METADATA } from '../data/demoData';

interface LandingViewProps {
  onAnalyzeClick?: () => void;
  onExploreArchitecture?: () => void;
  onSelectScenarioId?: (id: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onAnalyzeClick,
  onExploreArchitecture,
  onSelectScenarioId,
}) => {
  const navigate = useNavigate();

  const handleAnalyze = () => {
    if (onAnalyzeClick) onAnalyzeClick();
    else navigate('/analyze');
  };

  const handleArchitecture = () => {
    if (onExploreArchitecture) onExploreArchitecture();
    else navigate('/architecture');
  };

  const handleScenario = (id: string) => {
    if (onSelectScenarioId) onSelectScenarioId(id);
    else navigate('/analyze');
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-16 relative overflow-hidden">
      {/* Calm Fresh Ambient Glows */}
      <div className="absolute top-8 left-1/4 w-[420px] h-[420px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-36 right-1/4 w-[420px] h-[420px] bg-sky-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="relative pt-4 sm:pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Col: Hero Copy (Short, Human, Easy) */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Fresh Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0f1b26]/90 border border-teal-500/30 text-xs text-teal-300 shadow-sm shadow-teal-500/10">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="font-semibold tracking-wide">AI Voice Scam Defense</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-slate-300 hidden sm:inline">{SIH_METADATA.problemCode}</span>
              </div>

              {/* Main Punchy Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display text-white tracking-tight leading-[1.12]">
                Check any suspicious call before you{' '}
                <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  send money.
                </span>
              </h1>

              {/* Simple human explanation */}
              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
                AI can copy anyone&apos;s voice in seconds. VEYRiX helps you spot artificial voices and flags risky demands — like urgent bank transfers or secret passcodes — so you never fall for an impostor.
              </p>

              {/* Calm reassuring note */}
              <div className="flex items-center gap-2.5 text-xs text-slate-300 pt-0.5">
                <div className="w-5 h-5 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                </div>
                <span>100% Private: All voice checks run right in your browser. Audio is never stored.</span>
              </div>

              {/* Fresh 3D CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  id="hero-analyze-cta"
                  onClick={handleAnalyze}
                  className="flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[48px] rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
                >
                  <PhoneCall className="w-4 h-4 text-slate-950" />
                  <span>Check a Call Now</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>

                <button
                  id="hero-architecture-cta"
                  onClick={handleArchitecture}
                  className="flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[48px] rounded-xl bg-[#0f1b26] hover:bg-[#132332] text-slate-200 font-medium text-sm border border-teal-500/25 hover:border-teal-400/50 transition-all cursor-pointer w-full sm:w-auto"
                >
                  <Cpu className="w-4 h-4 text-teal-300" />
                  <span>How It Works</span>
                </button>
              </div>

              {/* Sample Calls to try instantly */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="text-xs text-slate-300 mb-2.5 font-medium flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Try a Quick Sample Call:</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleScenario('demo-1')}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0f1b26]/90 hover:bg-[#132332] text-slate-200 border border-emerald-500/30 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Sample 1: Routine Team Call (Safe)</span>
                  </button>

                  <button
                    onClick={() => handleScenario('demo-2')}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0f1b26]/90 hover:bg-[#132332] text-slate-200 border border-rose-500/30 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Sample 2: Fake Boss Money Request (Scam)</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Right Col: Live 3D Interactive Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="lg:col-span-5"
            >
              <ThreeDCard
                maxTilt={8}
                glareOpacity={0.16}
                glareColor="rgba(45, 212, 191, 0.25)"
                glowColor="rgba(45, 212, 191, 0.2)"
                className="rounded-2xl bg-gradient-to-b from-[#0f1b26] to-[#0a131c] border border-teal-500/30 p-5 sm:p-6 shadow-2xl"
              >
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                    <span className="text-white font-bold">Call Check Preview</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-700/60 text-[10px] font-bold tracking-wide">
                    HOLD CALL
                  </span>
                </div>

                {/* Animated Waveform Canvas with calm teal-sky tone */}
                <div className="my-4 rounded-xl overflow-hidden border border-slate-800/80 bg-[#070e15]">
                  <WaveformVisualizer isPlaying={true} height={80} initialMode="waveform" showControls={false} />
                </div>

                {/* 3D Signal Badges */}
                <div className="grid grid-cols-3 gap-2.5 my-4">
                  <div className="p-3 rounded-xl bg-[#070e15] border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      AI Voice
                    </div>
                    <div className="text-xl font-bold text-rose-400 mt-0.5 font-display">
                      88%
                    </div>
                    <div className="text-[10px] text-slate-300">Robotic Clues</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#070e15] border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Voice Match
                    </div>
                    <div className="text-xl font-bold text-amber-300 mt-0.5 font-display">
                      42%
                    </div>
                    <div className="text-[10px] text-slate-300">Mismatch</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#070e15] border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Request
                    </div>
                    <div className="text-xl font-bold text-rose-400 mt-0.5 font-display">
                      DANGER
                    </div>
                    <div className="text-[10px] text-slate-300">Urgent Wire</div>
                  </div>
                </div>

                {/* Clear Action Advice */}
                <div className="p-4 rounded-xl bg-[#070e15] border border-rose-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        Risk Level: High (89 / 100)
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Stop. Do not wire money. Call back directly.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm"
                  >
                    Try It
                  </button>
                </div>
              </ThreeDCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CORE RULE: Don't Just Trust the Voice. Check the Action. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ThreeDCard
          maxTilt={4}
          glareOpacity={0.12}
          className="rounded-3xl bg-gradient-to-br from-[#0f1b26] to-[#0a131c] border border-teal-500/25 p-6 sm:p-10 text-left shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs uppercase text-teal-300 tracking-wider font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>The Golden Safety Rule</span>
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white">
                “Never trust the voice alone. Check what they ask you to do.”
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Most tools only ask: <em>&quot;Does this voice sound real?&quot;</em> But today&apos;s AI can mimic your manager or child almost perfectly. VEYRiX asks the question that really keeps you safe:{' '}
                <strong className="text-teal-300 font-semibold">&quot;What is this caller asking for?&quot;</strong> If they demand an emergency bank wire, ask for a one-time passcode (OTP), or tell you to keep it secret, that is an immediate red flag — no matter how authentic they sound.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#091119] border border-teal-500/20 text-xs text-slate-300 space-y-3 shrink-0 w-full md:w-80 shadow-md">
              <div className="text-teal-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>3 Simple Habits:</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <span><strong>Pause:</strong> AI scammers rely on rush and panic.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <span><strong>Hold:</strong> Never share passcodes or wire money on the spot.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                <span><strong>Call back:</strong> Hang up and dial their saved phone number.</span>
              </div>
            </div>
          </div>
        </ThreeDCard>
      </section>

      {/* THREE PILLARS (Short, Clear, 3D Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs text-teal-300 uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-teal-950/60 border border-teal-800/60">
            How We Protect You
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold font-display text-white">
            Three Simple Checks on Every Call
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            VEYRiX checks the sound waves, compares known voices, and scans for risky requests in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            {
              title: '1. How the Voice Sounds',
              desc: 'Checks for unnatural robotic pitch, flat breathing, and synthetic vocal clues directly in your browser.',
              icon: Radio,
              badge: 'Acoustic Sound Check',
            },
            {
              title: '2. Known Voice Match',
              desc: 'Compares the caller against saved voice samples from your real family members or team managers.',
              icon: UserCheck,
              badge: 'Saved Voice Profiles',
            },
            {
              title: '3. What They Ask For',
              desc: 'Flags requests for money, bank account changes, one-time passwords (OTP), or demands for secrecy.',
              icon: Search,
              badge: 'Request Danger Check',
            },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <ThreeDCard
                key={idx}
                maxTilt={6}
                glareOpacity={0.12}
                className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-[#0f1b26] to-[#0a131c] border border-teal-500/20 hover:border-teal-400/40 transition-colors space-y-4 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#091119] text-teal-300 border border-teal-500/20">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold font-display text-white">
                  {feat.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {feat.desc}
                </p>
              </ThreeDCard>
            );
          })}
        </div>
      </section>

      {/* REAL DEFENSE SCENARIOS (Short, relatable words) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs text-teal-300 uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-teal-950/60 border border-teal-800/60">
            Real Scenarios
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Common Voice Scams We Stop
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Everyday situations where scammers use voice cloning to trick people.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: 'Family Distress Scams',
              desc: 'A scammer uses an AI clone to sound like your child or parent claiming they had an emergency and need fast bail or medical cash.',
              icon: Users,
            },
            {
              title: 'Boss Wire Demands',
              desc: 'An impostor calls finance sounding like the company CEO, demanding a quick and confidential money transfer.',
              icon: Building2,
            },
            {
              title: 'Bank & One-Time Passcodes',
              desc: 'Callers pretending to be your bank ask you to read out the 6-digit SMS code you just received on your phone.',
              icon: Landmark,
            },
            {
              title: 'IT Password Resets',
              desc: 'Attackers mimic a team manager to convince the IT helpdesk to reset account passwords or add a new phone.',
              icon: Headphones,
            },
          ].map((uc, i) => {
            const Icon = uc.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-gradient-to-b from-[#0f1b26] to-[#0a131c] border border-teal-500/20 hover:border-teal-400/40 space-y-3 transition-all transform hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white font-display">{uc.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{uc.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM CTA: Short, Calm, Fresh */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ThreeDCard
          maxTilt={5}
          className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0f1b26] via-[#122130] to-[#0a131c] border border-teal-500/30 shadow-2xl space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-[11px] text-teal-300">
            <Radio className="w-3.5 h-3.5 text-teal-300" />
            <span>Ready to Try It?</span>
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white">
            Check any call before you trust it
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Record a short sample through your microphone or upload an audio file. You&apos;ll get clear sound wave metrics, voice match results, and honest safety advice in seconds.
          </p>
          <div className="pt-2">
            <button
              onClick={handleAnalyze}
              className="px-8 py-3.5 min-h-[48px] rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-sm font-bold shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              Check a Call Now
            </button>
          </div>
        </ThreeDCard>
      </section>
    </div>
  );
};
