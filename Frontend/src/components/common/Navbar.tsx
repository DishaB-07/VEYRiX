import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Activity,
  Cpu,
  History,
  FileText,
  Sliders,
  Sparkles,
  Lock,
  Compass,
  Radio,
  Menu,
  X,
  PhoneCall,
  ChevronDown,
  Check,
} from 'lucide-react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { DemoScenario } from '../../types';

interface NavbarProps {
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  activeScenario: DemoScenario | null;
  onSelectScenario: (scenario: DemoScenario) => void;
  scenarios: DemoScenario[];
}

/**
 * Modern, high-trust security SaaS navigation bar for VEYRiX
 * Inspired by modern visual hierarchy, clean spacing, and high-contrast controls.
 */
export const Navbar: React.FC<NavbarProps> = ({
  isDemoMode,
  setIsDemoMode,
  activeScenario,
  onSelectScenario,
  scenarios,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scenarioDropdownOpen, setScenarioDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setScenarioDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home', icon: Sparkles, end: true },
    { to: '/analyze', label: 'Check a Call', icon: Radio },
    { to: '/dashboard', label: 'Call Overview', icon: Activity },
    { to: '/history', label: 'Saved Checks', icon: History },
    { to: '/reports', label: 'Safety Reports', icon: FileText },
    { to: '/architecture', label: 'How It Works', icon: Cpu },
    { to: '/future-scope', label: 'Roadmap', icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-teal-500/15 shadow-lg shadow-black/25">
      {/* Top Reassurance & Quick Utility Bar */}
      <div className="border-b border-slate-800/70 bg-[#060c13]/90 px-4 sm:px-6 lg:px-8 py-1.5 text-[11px] text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Security Status Badge */}
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 text-teal-300 font-semibold tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
              </span>
              <span>VEYRiX</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-400 font-medium">
              Real-Time AI Voice Impersonation &amp; Scam Defense
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              Engine Online
            </span>
          </div>

          {/* Right: Privacy Tag & Demo Scenarios Switcher */}
          <div className="flex items-center gap-3">
            <Link
              to="/privacy"
              className="flex items-center gap-1.5 text-slate-300 hover:text-teal-300 transition-colors py-0.5 text-xs focus-ring rounded"
              title="All audio is analyzed locally on-device. Nothing is uploaded to third-party clouds."
            >
              <Lock className="w-3 h-3 text-teal-400 shrink-0" />
              <span className="font-medium hidden xs:inline">100% On-Device &amp; Private</span>
            </Link>

            <div className="h-3 w-px bg-slate-800 hidden sm:block" />

            {/* Scenario Picker Dropdown Anchor */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setScenarioDropdownOpen(!scenarioDropdownOpen)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer focus-ring ${
                  isDemoMode
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/40 hover:bg-teal-500/25 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
                title="Toggle or select pre-recorded test calls"
                aria-expanded={scenarioDropdownOpen}
              >
                <Sliders className="w-3 h-3 text-teal-400" />
                <span className="hidden sm:inline">
                  {isDemoMode
                    ? `Sample: ${activeScenario?.name.replace('Scenario ', '') || 'Active'}`
                    : 'Demo Mode: OFF'}
                </span>
                <span className="sm:hidden">{isDemoMode ? 'Samples' : 'Demo OFF'}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    scenarioDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Scenario Popover Menu */}
              {scenarioDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#09131d] border border-teal-500/30 shadow-2xl p-3 text-left z-50 animate-in fade-in slide-in-from-top-2 duration-150 glass-panel">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-xs font-bold text-white">Preset Call Scenarios</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDemoMode(!isDemoMode)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                        isDemoMode
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isDemoMode ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-2.5">
                    Click any sample scenario below to load its synthetic voice characteristics and threat context into the scanner.
                  </p>

                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {scenarios.map((sc) => {
                      const isSelected = isDemoMode && activeScenario?.id === sc.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            if (!isDemoMode) setIsDemoMode(true);
                            onSelectScenario(sc);
                            setScenarioDropdownOpen(false);
                            navigate('/analyze');
                          }}
                          className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                            isSelected
                              ? sc.riskLevel === 'high'
                                ? 'bg-rose-950/50 border-rose-500/50 text-rose-200'
                                : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                              : 'bg-[#070e17] border-slate-800/80 hover:bg-slate-800/60 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold truncate text-white">
                                {sc.name}
                              </span>
                              {isSelected && <Check className="w-3 h-3 text-teal-400 shrink-0" />}
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">
                              {sc.callerType} • {sc.requestedAction}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                              sc.riskLevel === 'high'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {sc.riskLevel === 'high' ? 'Suspicious' : 'Normal'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group cursor-pointer focus-ring rounded-xl py-1 pr-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 via-emerald-500/20 to-sky-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 group-hover:scale-105 group-hover:border-teal-300 transition-all shadow-md shadow-teal-500/15">
              <ShieldCheck className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight font-display text-white group-hover:text-teal-300 transition-colors">
                  VEYRiX
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-950/90 text-teal-300 border border-teal-700/60 shadow-xs">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Voice Security. Before Trust.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold min-h-[38px] transition-all focus-ring ${
                      isActive
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/40 shadow-xs shadow-teal-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* CTA & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 min-h-[40px] rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 via-teal-300 to-sky-400 hover:from-teal-300 hover:to-sky-300 shadow-md shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all cursor-pointer focus-ring"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-950" />
              <span>Check a Call</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 min-w-[40px] min-h-[40px] rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors focus-ring"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 px-2 border-t border-slate-800/90 space-y-1.5 animate-in slide-in-from-top-2 duration-200 bg-[#070e17]/95 rounded-b-2xl mt-1 shadow-2xl">
            <div className="px-2 pb-2 mb-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white">Menu Navigation</span>
              <span className="text-[11px] text-teal-400">100% Private Scanner</span>
            </div>

            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium min-h-[44px] transition-colors ${
                      isActive
                        ? 'bg-teal-500/15 text-teal-300 font-bold border border-teal-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <div className="pt-2 border-t border-slate-800/80 px-2">
              <div className="flex items-center justify-between py-2 text-xs">
                <span className="text-slate-300 font-medium">Demo Mode</span>
                <button
                  type="button"
                  onClick={() => setIsDemoMode(!isDemoMode)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isDemoMode
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDemoMode ? 'ON' : 'OFF'}
                </button>
              </div>

              <Link
                to="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2.5 text-xs text-slate-400 hover:text-teal-300 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Privacy &amp; Local Verification Charter</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
