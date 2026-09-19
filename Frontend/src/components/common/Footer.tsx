import React from 'react';
import { ShieldCheck, Lock, HeartHandshake, Radio, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SIH_METADATA } from '../../data/demoData';

/**
 * Humanized, reassuring Footer
 * Clear explanation of privacy ethics and human protection.
 */
export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-teal-900/30 bg-[#070e15] text-slate-400 text-xs py-10 mt-16 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-sky-600 p-0.5">
                <div className="w-full h-full bg-[#0a131c] rounded-[6px] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                </div>
              </div>
              <span className="text-lg font-bold font-display text-white tracking-wider">
                {SIH_METADATA.systemName}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-800/60">
                Voice Trust &amp; Defense
              </span>
            </div>
            
            <p className="text-slate-300 font-medium text-xs leading-relaxed">
              Helping people recognize suspicious voices and requests before they make an important decision.
            </p>
            
            <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
              Voice cloning is becoming harder to recognize. When a call feels urgent or unusual, pause, hang up, and call back using a trusted number.{' '}
              <span className="text-teal-300 font-semibold">
                Always hang up and call back on a trusted number.
              </span>
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f1b26] border border-teal-900/40 text-[11px] text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Your audio stays private and is not permanently stored or sold.</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="text-white text-xs font-semibold tracking-wider uppercase">
              Explore
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/analyze" className="hover:text-teal-300 transition-colors">
                  Check a Call
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-teal-300 transition-colors">
                  Call Safety Overview
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-teal-300 transition-colors">
                  Saved Checks
                </Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-teal-300 transition-colors">
                  Safety Reports
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-teal-300 transition-colors">
                  How the Voice Analysis Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Protection & Safety */}
          <div className="space-y-2.5">
            <h4 className="text-white text-xs font-semibold tracking-wider uppercase">
              Safety &amp; Ethics
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/privacy" className="hover:text-teal-300 transition-colors">
                  Privacy &amp; Data Ethics
                </Link>
              </li>
              <li>
                <Link to="/future-scope" className="hover:text-teal-300 transition-colors">
                  Protection Roadmap
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Zero Cloud Audio Retention</span>
              </li>
              <li>
                <span className="text-slate-500">Family Scam Prevention Tips</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & calm reassurance */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} VEYRiX. Built to help people pause, verify, and stay safe from voice-based scams.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-teal-300 transition-colors">
              Privacy Promise
            </Link>
            <span>&bull;</span>
            <span className="text-teal-400/80">Audio Stays on Your Device</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
