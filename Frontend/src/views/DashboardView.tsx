import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Clock,
  ExternalLink,
  Plus,
  BarChart3,
  TrendingUp,
  AlertOctagon,
  ArrowUpRight,
  Filter,
  Eye,
  CheckCircle2,
  FileText,
  History,
  Cpu,
  Compass,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { IncidentRecord } from '../types';
import { ThreeDCard } from '../components/ThreeDCard';

interface DashboardViewProps {
  incidents: IncidentRecord[];
  onSelectIncident: (inc: IncidentRecord) => void;
  onNavigateAnalyze?: () => void;
  onOpenReport?: (inc: IncidentRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  incidents,
  onSelectIncident,
}) => {
  const navigate = useNavigate();
  const [trendRange, setTrendRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [activeRiskFilter, setActiveRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // Compute metrics directly from actual call records
  const total = incidents.length;
  const highRiskCount = incidents.filter((i) => i.riskLevel === 'high').length;
  const verifyCount = incidents.filter((i) => i.riskLevel === 'medium').length;
  const safeCount = incidents.filter((i) => i.riskLevel === 'low').length;
  const avgScore = total > 0 ? Math.round(incidents.reduce((acc, i) => acc + i.riskScore, 0) / total) : 0;

  const lowPercent = total > 0 ? Math.round((safeCount / total) * 100) : 0;
  const medPercent = total > 0 ? Math.round((verifyCount / total) * 100) : 0;
  const highPercent = total > 0 ? Math.round((highRiskCount / total) * 100) : 0;

  // Distribution of low, medium, and high risk incidents
  const riskDistributionData = [
    {
      name: 'Low Risk',
      riskKey: 'low' as const,
      value: safeCount,
      percent: lowPercent,
      color: '#2dd4bf', // Teal
      strokeColor: '#0d9488',
      range: 'Score 0–30',
      tag: 'Safe',
      description: 'Natural speech acoustics & routine requests',
    },
    {
      name: 'Medium Risk',
      riskKey: 'medium' as const,
      value: verifyCount,
      percent: medPercent,
      color: '#fbbf24', // Amber
      strokeColor: '#d97706',
      range: 'Score 31–70',
      tag: 'Caution',
      description: 'Acoustic replay or biometric mismatch detected',
    },
    {
      name: 'High Risk',
      riskKey: 'high' as const,
      value: highRiskCount,
      percent: highPercent,
      color: '#fb7185', // Rose
      strokeColor: '#e11d48',
      range: 'Score 71–100',
      tag: 'Critical',
      description: 'Synthetic voice cloning & urgent financial coercion',
    },
  ];

  // Chart data reflecting calls checked
  const currentTrendData =
    incidents.length > 0
      ? incidents.map((inc) => ({
          day: inc.id,
          score: inc.riskScore,
          label: `${inc.id}: ${inc.riskScore}/100`,
        }))
      : [{ day: 'No Calls', score: 0, label: '0/100' }];

  const latestHighRisk = incidents.find((i) => i.riskLevel === 'high') || incidents[0];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2.5 rounded-xl bg-[#091119] border border-teal-500/40 shadow-xl text-xs">
          <div className="text-slate-400">{label}</div>
          <div className="text-teal-300 font-bold text-sm">
            Risk Score: {payload[0].value} / 100
          </div>
          <div className="text-[10px] text-slate-400">Call Check</div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-[#091119]/95 border border-slate-700 shadow-2xl backdrop-blur-md text-xs space-y-1.5 z-50">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: d.color }}
            />
            <span className="font-bold text-white text-sm">{d.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300">
              {d.range}
            </span>
          </div>
          <div className="text-slate-100 font-semibold text-sm">
            {d.value} {d.value === 1 ? 'call' : 'calls'} &bull; {d.percent}% of total
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed max-w-[200px]">
            {d.description}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-left">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-white">
              Call Safety Overview
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30">
              Active Protection
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Review recent voice checks, safety scores, and scam warnings.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right hidden sm:block text-xs">
            <div className="text-slate-400 text-[10px]">SYSTEM STATUS</div>
            <div className="text-teal-300 flex items-center gap-1.5 justify-end font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Ready &amp; Protecting</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/analyze')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20 transition-all cursor-pointer w-full sm:w-auto transform hover:-translate-y-0.5"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Check a Call</span>
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => navigate('/analyze')}
          className="p-4 rounded-xl bg-gradient-to-b from-[#0f1b26] to-[#0a131c] border border-teal-500/30 hover:border-teal-400 text-left transition-all group cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between">
            <Radio className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-300" />
          </div>
          <div className="text-xs font-bold text-white mt-2.5">Check a Call</div>
          <div className="text-[11px] text-slate-400">Record or upload voice</div>
        </button>

        <button
          onClick={() => navigate('/history')}
          className="p-4 rounded-xl bg-gradient-to-b from-[#0f1b26] to-[#0a131c] border border-slate-800 hover:border-teal-500/40 text-left transition-all group cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between">
            <History className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-300" />
          </div>
          <div className="text-xs font-bold text-white mt-2.5">Call History</div>
          <div className="text-[11px] text-slate-400">Saved checks &amp; alerts</div>
        </button>

        <button
          onClick={() => navigate('/architecture')}
          className="p-4 rounded-xl bg-gradient-to-b from-[#0f1b26] to-[#0a131c] border border-slate-800 hover:border-teal-500/40 text-left transition-all group cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between">
            <Cpu className="w-4 h-4 text-teal-300 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-300" />
          </div>
          <div className="text-xs font-bold text-white mt-2.5">How It Works</div>
          <div className="text-[11px] text-slate-400">Simple 4-step explanation</div>
        </button>

        <button
          onClick={() => navigate('/future-scope')}
          className="p-4 rounded-xl bg-gradient-to-b from-[#0f1b26] to-[#0a131c] border border-slate-800 hover:border-teal-500/40 text-left transition-all group cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between">
            <Compass className="w-4 h-4 text-sky-300 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-300" />
          </div>
          <div className="text-xs font-bold text-white mt-2.5">Product Roadmap</div>
          <div className="text-[11px] text-slate-400">Features coming next</div>
        </button>
      </div>

      {/* ALERT BANNER */}
      {latestHighRisk && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-200">
                Warning: Suspicious Call Flagged ({latestHighRisk.id})
              </div>
              <div className="text-[11px] text-rose-300/90 mt-0.5">
                {latestHighRisk.riskLevel === 'high'
                  ? 'Urgent money transfer demanded with robotic voice signs. Do not transfer funds. Call your contact back on their personal phone.'
                  : 'Review this call record to inspect audio metrics and recommended precautions.'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => navigate(`/analysis/${latestHighRisk.id}`)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer w-full sm:w-auto text-center shadow-sm"
            >
              Review Warning
            </button>
          </div>
        </div>
      )}

      {/* SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Calls Checked',
            value: total.toLocaleString(),
            sub: 'Voice safety checks evaluated',
            color: 'text-teal-300',
            border: 'border-teal-500/30',
            glow: 'rgba(45, 212, 191, 0.25)',
            icon: Radio,
          },
          {
            label: 'High Scam Risk',
            value: highRiskCount,
            sub: 'Score 71–100 • Critical threat',
            color: 'text-rose-400',
            border: 'border-rose-500/30',
            glow: 'rgba(251, 113, 133, 0.25)',
            icon: ShieldAlert,
          },
          {
            label: 'Needs Verification',
            value: verifyCount,
            sub: 'Score 31–70 • Caution flags',
            color: 'text-amber-300',
            border: 'border-amber-500/30',
            glow: 'rgba(251, 191, 36, 0.25)',
            icon: AlertTriangle,
          },
          {
            label: 'Average Risk Score',
            value: `${avgScore} / 100`,
            sub: '0–30 Safe • 31–70 Review • 71+ Alert',
            color: 'text-teal-400',
            border: 'border-teal-500/30',
            glow: 'rgba(45, 212, 191, 0.25)',
            icon: TrendingUp,
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <ThreeDCard
              key={i}
              maxTilt={6}
              glowColor={card.glow}
              className={`p-5 rounded-2xl bg-gradient-to-b from-[#0f1b26] to-[#0a131c] border ${card.border} hover:border-teal-400/50 shadow-xl relative overflow-hidden`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>{card.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#070e15] text-teal-300 font-semibold border border-teal-500/20">
                  Calls
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className={`text-3xl font-bold font-display ${card.color}`}>
                  {card.value}
                </span>
                <div className="p-2.5 rounded-xl bg-[#070e15] border border-slate-800 text-teal-300 shadow-inner">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-[11px] text-slate-300 mt-2 flex items-center gap-1">
                <span>{card.sub}</span>
              </div>
            </ThreeDCard>
          );
        })}
      </div>

      {/* RECHARTS ROW: RISK TREND & DETECTION DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts AreaChart: Risk Trend Over Time */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-gradient-to-b from-[#0f1b26] to-[#0a131c] border border-teal-500/20 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold font-display text-white">
                    Risk Trend Timeline
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30">
                    Recent Calls
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Risk scores across evaluated incoming voice samples
                </p>
              </div>

              <div className="flex items-center gap-1 bg-[#070e15] p-1 rounded-xl border border-slate-800 text-xs">
                {(['7d', '30d', '90d'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTrendRange(r)}
                    className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                      trendRange === r
                        ? 'bg-teal-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Responsive Recharts Container */}
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={currentTrendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="riskAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#1e293b' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={{ stroke: '#1e293b' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#2dd4bf"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#riskAreaGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Average Baseline: <strong className="text-teal-300 font-mono">{avgScore}/100</strong></span>
            <span>Trend Window: <strong className="text-white font-mono">{trendRange.toUpperCase()}</strong></span>
          </div>
        </div>

        {/* Recharts Pie: Distribution of Low, Medium, and High Risk Incidents */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-b from-[#0f1b26] to-[#0a131c] border border-teal-500/20 space-y-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-display text-white">
                  Risk Incident Distribution
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30">
                  {total} Incidents
                </span>
              </div>

              {activeRiskFilter !== 'all' ? (
                <button
                  onClick={() => setActiveRiskFilter('all')}
                  className="text-[11px] text-teal-300 hover:text-white font-semibold underline cursor-pointer transition-colors"
                >
                  Reset Filter
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">All Levels</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown by risk level — <span className="text-teal-300 font-medium">Click any slice to filter the table below</span>
            </p>
          </div>

          {total === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center justify-center mx-auto shadow-inner">
                <PieChartIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-300">No Incidents Recorded Yet</p>
                <p className="text-[11px] text-slate-500">Run a call simulation or upload an audio file to generate distribution data.</p>
              </div>
              <button
                onClick={() => navigate('/analyze')}
                className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-bold border border-teal-500/30 transition-colors cursor-pointer"
              >
                Analyze a Call
              </button>
            </div>
          ) : (
            <>
              {/* Pie Chart with Interactive Center Label */}
              <div className="relative h-48 w-full flex items-center justify-center my-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={total > 1 ? 4 : 0}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActivePieIndex(index)}
                      onMouseLeave={() => setActivePieIndex(null)}
                      onClick={(_, index) => {
                        const targetKey = riskDistributionData[index]?.riskKey;
                        if (targetKey) {
                          setActiveRiskFilter((prev) => (prev === targetKey ? 'all' : targetKey));
                        }
                      }}
                      className="cursor-pointer outline-none"
                    >
                      {riskDistributionData.map((entry, index) => {
                        const isHovered = activePieIndex === index;
                        const isFiltered = activeRiskFilter === entry.riskKey;
                        const isDimmed =
                          (activePieIndex !== null && !isHovered) ||
                          (activeRiskFilter !== 'all' && !isFiltered);

                        return (
                          <Cell
                            key={`risk-pie-cell-${index}`}
                            fill={entry.color}
                            stroke={isHovered || isFiltered ? '#ffffff' : entry.strokeColor}
                            strokeWidth={isHovered || isFiltered ? 2.5 : 1}
                            opacity={isDimmed ? 0.35 : 1}
                            className="transition-all duration-200 outline-none"
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-2xl font-bold font-display text-white transition-all">
                    {activePieIndex !== null
                      ? riskDistributionData[activePieIndex].value
                      : activeRiskFilter !== 'all'
                      ? riskDistributionData.find((d) => d.riskKey === activeRiskFilter)?.value ?? total
                      : total}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {activePieIndex !== null
                      ? riskDistributionData[activePieIndex].name.split(' ')[0]
                      : activeRiskFilter !== 'all'
                      ? `${activeRiskFilter} Risk`
                      : 'Total Calls'}
                  </span>
                </div>
              </div>

              {/* Interactive Legend & Filter Cards */}
              <div className="space-y-2 text-xs">
                {riskDistributionData.map((item, idx) => {
                  const isSelected = activeRiskFilter === item.riskKey;
                  const isHovered = activePieIndex === idx;

                  return (
                    <button
                      key={item.riskKey}
                      type="button"
                      onClick={() =>
                        setActiveRiskFilter((prev) => (prev === item.riskKey ? 'all' : item.riskKey))
                      }
                      onMouseEnter={() => setActivePieIndex(idx)}
                      onMouseLeave={() => setActivePieIndex(null)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer group ${
                        isSelected
                          ? 'bg-[#122435] border-teal-400 shadow-md ring-1 ring-teal-500/30'
                          : isHovered
                          ? 'bg-[#0e1c2a] border-slate-600'
                          : 'bg-[#070e15] border-slate-800 hover:border-slate-700'
                      }`}
                      title={`Click to filter table by ${item.name}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <span>{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({item.range})</span>
                            <span
                              className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider"
                              style={{
                                backgroundColor: `${item.color}20`,
                                color: item.color,
                              }}
                            >
                              {item.tag}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[190px] sm:max-w-[220px]">
                            {item.description}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <div className="font-bold text-sm" style={{ color: item.color }}>
                          {item.percent}%
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.value} {item.value === 1 ? 'incident' : 'incidents'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* RECENT CALL CHECKS TABLE */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0f1b26] to-[#0a131c] border border-teal-500/20 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-display text-white">
                Recent Call Checks
              </h3>
              {activeRiskFilter !== 'all' && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-950 text-teal-300 border border-teal-500/40 flex items-center gap-1">
                  <span>Filtered: {activeRiskFilter} Risk</span>
                  <button
                    onClick={() => setActiveRiskFilter('all')}
                    className="hover:text-white ml-1 cursor-pointer font-bold"
                    title="Clear filter"
                  >
                    &times;
                  </button>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any call to review full audio details and safety recommendations.
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs text-teal-300 hover:text-teal-200 font-semibold flex items-center gap-1"
          >
            <span>View All History ({incidents.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 uppercase bg-[#070e15] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5 font-bold">Call ID</th>
                <th className="py-3 px-3.5 font-bold">Audio Clip</th>
                <th className="py-3 px-3.5 font-bold">Risk Score</th>
                <th className="py-3 px-3.5 font-bold">Risk Level</th>
                <th className="py-3 px-3.5 font-bold">Recommended Action</th>
                <th className="py-3 px-3.5 font-bold">Date</th>
                <th className="py-3 px-3.5 text-right font-bold">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incidents
                .filter((inc) => (activeRiskFilter === 'all' ? true : inc.riskLevel === activeRiskFilter))
                .slice(0, 6)
                .map((inc) => {
                  let badgeClass = 'text-teal-300 bg-teal-950/60 border-teal-500/40';
                  if (inc.riskLevel === 'high') badgeClass = 'text-rose-300 bg-rose-950/60 border-rose-800/60';
                  else if (inc.riskLevel === 'medium') badgeClass = 'text-amber-300 bg-amber-950/60 border-amber-800/60';

                  return (
                    <tr
                      key={inc.id}
                      onClick={() => navigate(`/analysis/${inc.id}`)}
                      className="hover:bg-[#122130]/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-3.5 font-bold text-teal-300 group-hover:text-teal-200 font-mono">
                        {inc.id}
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-200 truncate max-w-[150px]">
                        {inc.audioSource}
                      </td>
                      <td className="py-3.5 px-3.5 font-bold text-white font-mono">
                        {inc.riskScore}
                      </td>
                      <td className="py-3.5 px-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                          {inc.riskLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 font-semibold text-slate-200">
                        {inc.recommendedAction === 'HOLD'
                          ? 'Stop & Call Back'
                          : inc.recommendedAction === 'VERIFY'
                          ? 'Confirm First'
                          : 'Routine / Cleared'}
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-400 text-[11px]">
                        {inc.timestamp.split(' ')[0]}
                      </td>
                      <td className="py-3.5 px-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/analysis/${inc.id}`);
                          }}
                          className="p-1.5 rounded-lg bg-[#070e15] hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 border border-slate-700 transition-colors cursor-pointer"
                          title="View Call Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              {incidents.filter((inc) => (activeRiskFilter === 'all' ? true : inc.riskLevel === activeRiskFilter)).length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No calls recorded under <strong className="text-white capitalize">{activeRiskFilter}</strong> risk.
                    <button
                      onClick={() => setActiveRiskFilter('all')}
                      className="ml-2 text-teal-300 underline font-semibold cursor-pointer"
                    >
                      Show all calls
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PHILOSOPHY CARD */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0f1b26] via-[#122130] to-[#0a131c] border border-teal-500/30 space-y-2 text-left shadow-lg">
        <div className="flex items-center gap-2 text-teal-300 text-xs uppercase font-semibold">
          <AlertOctagon className="w-4 h-4 text-teal-400" />
          <span>Core Security Principle</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
          A voice can easily be faked. Always verify urgent requests.
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          AI can clone anyone&apos;s voice from a 3-second social media video. VEYRiX helps you pause, look at acoustic clues, and verify the caller before wiring money or sharing sensitive security codes.
        </p>
      </div>
    </div>
  );
};
