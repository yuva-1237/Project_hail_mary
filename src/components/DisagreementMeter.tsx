/**
 * DisagreementMeter – Phase 5
 * Visualises how much the four agents disagree on a mission event.
 * Computes standard deviation of confidence scores and renders a
 * 5-segment tension bar with a pulsing "HIGH CONFLICT" label when needed.
 */
import React, { useEffect, useState } from "react";
import { GitFork, Minus } from "lucide-react";
import type { AgentRecommendation } from "../types/agents";

interface DisagreementMeterProps {
  recommendations: AgentRecommendation[];
}

/** Standard deviation of an array of numbers */
function stdDev(nums: number[]): number {
  if (nums.length === 0) return 0;
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((sum, n) => sum + (n - mean) ** 2, 0) / nums.length;
  return Math.sqrt(variance);
}

function getLevel(sd: number): { label: string; color: string; segments: number; pulse: boolean } {
  if (sd < 8)  return { label: "CONSENSUS",      color: "bg-cyber-green",  segments: 1, pulse: false };
  if (sd < 16) return { label: "LOW CONFLICT",   color: "bg-emerald-400",  segments: 2, pulse: false };
  if (sd < 24) return { label: "MODERATE",       color: "bg-amber-400",    segments: 3, pulse: false };
  if (sd < 32) return { label: "HIGH CONFLICT",  color: "bg-orange-500",   segments: 4, pulse: true  };
  return               { label: "CRITICAL SPLIT",color: "bg-rose-500",     segments: 5, pulse: true  };
}

const DisagreementMeter: React.FC<DisagreementMeterProps> = ({ recommendations }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, [recommendations]);

  if (recommendations.length === 0) return null;

  const confidences = recommendations.map((r) => r.confidence);
  const sd = stdDev(confidences);
  const level = getLevel(sd);

  // Find the most and least confident agents for labelling
  const sorted = [...recommendations].sort((a, b) => b.confidence - a.confidence);
  const topAgent = sorted[0];
  const botAgent = sorted[sorted.length - 1];

  return (
    <div className="glass-panel rounded-lg border border-slate-700/40 px-3 py-2.5 flex flex-col gap-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
          <GitFork className="h-3 w-3 text-tau-teal" />
          Agent Disagreement
        </span>
        <span
          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border
            ${level.pulse ? "animate-pulse" : ""}
            ${
              level.segments >= 4
                ? "text-rose-300 border-rose-500/40 bg-rose-500/10"
                : level.segments >= 3
                ? "text-amber-300 border-amber-500/40 bg-amber-500/10"
                : "text-cyber-green border-emerald-500/30 bg-emerald-500/10"
            }`}
        >
          {level.label}
        </span>
      </div>

      {/* Segment bar */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all duration-700 ease-out ${
              animated && i < level.segments ? level.color : "bg-slate-800"
            }`}
          />
        ))}
      </div>

      {/* Tension pair labels */}
      <div className="flex items-center justify-between text-[9px] font-mono">
        <span className="text-cyber-green truncate max-w-[45%]">
          ↑ {topAgent.agentName.replace(" Agent", "")} ({topAgent.confidence}%)
        </span>
        <Minus className="h-2.5 w-2.5 text-slate-600 shrink-0" />
        <span className="text-rose-400 truncate max-w-[45%] text-right">
          ↓ {botAgent.agentName.replace(" Agent", "")} ({botAgent.confidence}%)
        </span>
      </div>
    </div>
  );
};

export default DisagreementMeter;
