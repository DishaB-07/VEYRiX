import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import { RiskLevel, RecommendedAction } from '../../types';

interface RiskMeterProps {
  score: number; // 0 to 100
  riskLevel: RiskLevel;
  recommendedAction: RecommendedAction;
  size?: 'md' | 'lg';
}

/**
 * RiskMeter
 * Clear, calm gauge with warm humanized status callouts.
 */
export const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  riskLevel,
  recommendedAction,
  size = 'lg',
}) => {
  const radius = size === 'lg' ? 92 : 72;
  const stroke = size === 'lg' ? 14 : 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  let colorClass = 'text-teal-300';
  let strokeColor = '#2dd4bf';
  let glowColor = 'rgba(45, 212, 191, 0.35)';
  let bgTint = 'bg-teal-950/40 border-teal-500/40 text-teal-300';
  let Icon = ShieldCheck;
  let actionText = 'ROUTINE CALL';

  if (riskLevel === 'high') {
    colorClass = 'text-rose-300';
    strokeColor = '#fb7185';
    glowColor = 'rgba(251, 113, 133, 0.35)';
    bgTint = 'bg-rose-950/40 border-rose-800/50 text-rose-300';
    Icon = ShieldAlert;
    actionText = 'SUSPICIOUS (CALL BACK)';
  } else if (riskLevel === 'medium') {
    colorClass = 'text-amber-300';
    strokeColor = '#fbbf24';
    glowColor = 'rgba(251, 191, 36, 0.35)';
    bgTint = 'bg-amber-950/40 border-amber-800/50 text-amber-300';
    Icon = AlertTriangle;
    actionText = 'DOUBLE-CHECK FIRST';
  }

  const dimension = size === 'lg' ? 220 : 180;

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative flex items-center justify-center" style={{ width: dimension, height: dimension }}>
        {/* Fresh Ambient Glow */}
        <div
          className="absolute inset-4 rounded-full blur-2xl opacity-25 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: strokeColor }}
        />

        {/* SVG Arc Meter */}
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          className="transform -rotate-[135deg]"
        >
          {/* Background Track */}
          <circle
            stroke="rgba(30, 41, 59, 0.6)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={dimension / 2}
            cy={dimension / 2}
          />
          {/* Colored Animated Value Arc */}
          <circle
            stroke={strokeColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.6s ease',
              filter: `drop-shadow(0 0 8px ${glowColor})`,
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={dimension / 2}
            cy={dimension / 2}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline justify-center">
            <span
              className={`font-display font-bold tracking-tight ${colorClass} ${
                size === 'lg' ? 'text-5xl' : 'text-4xl'
              }`}
            >
              {score}
            </span>
            <span className="text-slate-400 text-sm font-semibold ml-1">/100</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 mt-0.5">
            Risk Score
          </span>
        </div>
      </div>

      {/* Safety Assessment Badge */}
      <div
        className={`mt-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${bgTint}`}
      >
        <Icon className="w-4 h-4" />
        <span>{actionText}</span>
      </div>

      <p className="text-[11px] text-slate-300 text-center mt-2 max-w-[200px] leading-relaxed">
        {riskLevel === 'high'
          ? 'High signs of synthetic voice or dangerous financial demand.'
          : riskLevel === 'medium'
          ? 'Voice patterns shifted or requested action has elevated risk.'
          : 'Natural vocal resonance detected with standard conversation.'}
      </p>
    </div>
  );
};
