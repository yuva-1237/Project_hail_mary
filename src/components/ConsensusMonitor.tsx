/**
 * ConsensusMonitor – Phase 5
 * Animated circular progress gauge showing consensus score (0–100)
 * with colour-coded status label and smooth SVG arc transition.
 */
import React, { useEffect, useState } from "react";
import { getConsensusLabel } from "../communication/consensusCalculator";

interface ConsensusMonitorProps {
  score: number;
  /** If true, renders a compact inline version */
  compact?: boolean;
}

// ─── SVG circle math ──────────────────────────────────────────────────────────

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function scoreToOffset(score: number): number {
  return CIRCUMFERENCE * (1 - score / 100);
}

// ─── Colour based on label ────────────────────────────────────────────────────

function scoreColor(score: number): { stroke: string; text: string; label: string } {
  if (score >= 90) return { stroke: "#34d399", text: "text-emerald-400",  label: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" };
  if (score >= 75) return { stroke: "#38bdf8", text: "text-sky-400",      label: "bg-sky-500/15 text-sky-300 border-sky-500/30" };
  if (score >= 50) return { stroke: "#fb923c", text: "text-orange-400",   label: "bg-orange-500/15 text-orange-300 border-orange-500/30" };
  return              { stroke: "#f87171", text: "text-rose-400",         label: "bg-rose-500/15 text-rose-300 border-rose-500/30" };
}

const ConsensusMonitor: React.FC<ConsensusMonitorProps> = ({ score, compact = false }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    setDisplayScore(0);
    const timer = setTimeout(() => setDisplayScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const colors = scoreColor(displayScore);
  const label  = getConsensusLabel(displayScore);
  const offset = scoreToOffset(displayScore);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* Mini SVG gauge */}
        <svg width="44" height="44" viewBox="0 0 88 88" className="shrink-0">
          <circle cx="44" cy="44" r={RADIUS} fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="44" cy="44" r={RADIUS}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 44 44)"
            style={{ transition: "stroke-dashoffset 1s ease-out, stroke 0.5s ease" }}
          />
          <text
            x="44" y="50"
            textAnchor="middle"
            fill={colors.stroke}
            fontSize="18"
            fontWeight="700"
            fontFamily="monospace"
          >
            {displayScore}
          </text>
        </svg>

        {/* Labels */}
        <div className="flex flex-col">
          <span className={`text-[9px] font-mono font-bold ${colors.text}`}>
            CONSENSUS
          </span>
          <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full border mt-0.5 ${colors.label}`}>
            {label}
          </span>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className="glass-panel rounded-lg border border-tau-teal/15 p-4 flex flex-col items-center gap-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tau-teal/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tau-teal/40" />

      <h4 className="text-[10px] font-mono font-bold text-tau-teal tracking-widest uppercase">
        Consensus Monitor
      </h4>

      {/* Large circular gauge */}
      <svg width="120" height="120" viewBox="0 0 88 88">
        {/* Track */}
        <circle cx="44" cy="44" r={RADIUS} fill="none" stroke="#1e293b" strokeWidth="8" />
        {/* Progress arc */}
        <circle
          cx="44" cy="44" r={RADIUS}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
          style={{ transition: "stroke-dashoffset 1.2s ease-out, stroke 0.6s ease" }}
          filter={displayScore >= 90 ? "url(#glow)" : undefined}
        />
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Score text */}
        <text
          x="44" y="40"
          textAnchor="middle"
          fill={colors.stroke}
          fontSize="20"
          fontWeight="700"
          fontFamily="monospace"
        >
          {displayScore}%
        </text>
        <text
          x="44" y="55"
          textAnchor="middle"
          fill="#64748b"
          fontSize="9"
          fontFamily="monospace"
        >
          CONSENSUS
        </text>
      </svg>

      {/* Status label */}
      <span
        className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${colors.label}`}
      >
        {label}
      </span>
    </div>
  );
};

export default ConsensusMonitor;
