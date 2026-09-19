import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Eye,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Radio,
  Clock,
  UserCheck,
  Trash2,
  RotateCcw,
  ArrowUpDown,
  FileAudio,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { IncidentRecord } from '../types';

interface HistoryViewProps {
  incidents: IncidentRecord[];
  onSelectIncident: (inc: IncidentRecord) => void;
  onOpenReport?: (inc: IncidentRecord) => void;
  onDeleteIncident: (id: string) => void;
  onClearHistory: () => void;
  onReseedDemoData: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  incidents,
  onSelectIncident,
  onDeleteIncident,
  onClearHistory,
  onReseedDemoData,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [callerFilter, setCallerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'score-desc' | 'score-asc'>('date-desc');

  // Filter and sort logic
  const filtered = incidents
    .filter((inc) => {
      // Risk filter
      if (riskFilter !== 'all' && inc.riskLevel !== riskFilter) return false;

      // Caller filter
      if (callerFilter !== 'all' && inc.callerType !== callerFilter) return false;

      // Search by ID or audio source
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          inc.id.toLowerCase().includes(q) ||
          inc.audioSource.toLowerCase().includes(q) ||
          inc.detectionType.toLowerCase().includes(q) ||
          inc.callerType.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score-desc') return b.riskScore - a.riskScore;
      if (sortBy === 'score-asc') return a.riskScore - b.riskScore;
      if (sortBy === 'date-asc') return a.timestamp.localeCompare(b.timestamp);
      return b.timestamp.localeCompare(a.timestamp);
    });

  const handleExportAuditLogs = () => {
    const dataStr = JSON.stringify(incidents, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VEYRiX-Call-History-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-white">
              Past Call Checks
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30">
              Saved in Browser
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Review past voice checks, risk scores, and recommendations. You can search or export anytime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onReseedDemoData}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-[#101c38] hover:bg-[#15254b] text-teal-300 text-xs font-semibold border border-teal-500/30 transition-all cursor-pointer shadow-sm"
            title="Reset sample calls"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Sample Calls</span>
          </button>

          <button
            onClick={onClearHistory}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/60 transition-colors cursor-pointer"
            title="Clear all calls"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>

          <button
            onClick={handleExportAuditLogs}
            className="flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/20 space-y-3 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search by ID or Audio Source */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by call ID, name, or file..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080e1d] border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-400"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="md:col-span-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#080e1d] border border-slate-700/80 text-white text-xs focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk Only</option>
              <option value="medium">Caution Only</option>
              <option value="low">Safe Calls</option>
            </select>
          </div>

          {/* Caller Type Filter */}
          <div className="md:col-span-3">
            <select
              value={callerFilter}
              onChange={(e) => setCallerFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#080e1d] border border-slate-700/80 text-white text-xs focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              <option value="all">All Callers</option>
              <option value="Executive / Manager">Boss / Manager</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Known Contact">Known Contact</option>
              <option value="Bank Representative">Bank Representative</option>
              <option value="Family Member">Family Member</option>
              <option value="Unknown Caller">Unknown Number</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#080e1d] border border-slate-700/80 text-white text-xs focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="score-desc">Highest Risk First</option>
              <option value="score-asc">Lowest Risk First</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Showing {filtered.length} of {incidents.length} recorded calls</span>
          {(riskFilter !== 'all' || callerFilter !== 'all' || searchQuery !== '') && (
            <button
              onClick={() => {
                setRiskFilter('all');
                setCallerFilter('all');
                setSearchQuery('');
              }}
              className="text-teal-300 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* INCIDENTS TABLE OR EMPTY STATE */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl bg-gradient-to-b from-[#101c38] to-[#0c152a] border border-teal-500/20 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-[#080e1d] border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <History className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold font-display text-white">
              No Calls Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No calls match your search, or your call history is currently empty.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={onReseedDemoData}
              className="px-4 py-2 rounded-xl bg-[#080e1d] hover:bg-[#142346] text-white text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
            >
              Load Sample Calls
            </button>
            <Link
              to="/analyze"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
            >
              Check a Call
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-teal-500/20 bg-gradient-to-b from-[#101c38] to-[#0c152a] shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080e1d] border-b border-slate-800 text-slate-400 text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4 font-bold">Call ID</th>
                <th className="py-3 px-4 font-bold">Audio Clip</th>
                <th className="py-3 px-4 font-bold">Caller Type</th>
                <th className="py-3 px-4 font-bold">Risk Score</th>
                <th className="py-3 px-4 font-bold">Risk Level</th>
                <th className="py-3 px-4 font-bold">Recommended Action</th>
                <th className="py-3 px-4 font-bold">Verification</th>
                <th className="py-3 px-4 font-bold">Date</th>
                <th className="py-3 px-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((inc) => {
                let badgeClass = 'text-teal-300 bg-teal-950/60 border-teal-500/40';
                if (inc.riskLevel === 'high') badgeClass = 'text-rose-300 bg-rose-950/60 border-rose-800/60';
                else if (inc.riskLevel === 'medium') badgeClass = 'text-amber-300 bg-amber-950/60 border-amber-800/60';

                return (
                  <tr
                    key={inc.id}
                    onClick={() => navigate(`/analysis/${inc.id}`)}
                    className="hover:bg-[#142346]/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-bold text-teal-300 group-hover:text-teal-200 font-mono">
                      {inc.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 truncate max-w-[140px]">
                      {inc.audioSource}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {inc.callerType}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white font-mono">
                      {inc.riskScore}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                        {inc.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {inc.recommendedAction === 'HOLD'
                        ? 'Stop & Call Back'
                        : inc.recommendedAction === 'VERIFY'
                        ? 'Confirm First'
                        : 'Routine / Cleared'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          inc.verificationStatus === 'Verified'
                            ? 'text-teal-300 bg-teal-950/50 border border-teal-500/30'
                            : inc.verificationStatus === 'Held & Escalated'
                            ? 'text-rose-300 bg-rose-950/50 border border-rose-800/50'
                            : 'text-amber-300 bg-amber-950/50 border border-amber-800/50'
                        }`}
                      >
                        {inc.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {inc.timestamp.split(' ')[0]}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/analysis/${inc.id}`)}
                          className="p-1.5 rounded-lg bg-[#080e1d] hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 border border-slate-700 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteIncident(inc.id)}
                          className="p-1.5 rounded-lg bg-[#080e1d] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors cursor-pointer"
                          title="Delete Call"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
