/**
 * Phase 9 – MCScores
 * Real-time performance evaluation panel with animated counters, KPI tiles, and alerts.
 */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, BarChart2 } from "lucide-react";
import type { MissionScore, ScoringAlerts, DecisionQualityRecord } from "../../scoring/types";
import { METRIC_DISPLAY_CONFIG } from "../../scoring/types";

interface MCScoresProps {
  score: MissionScore;
  alerts: ScoringAlerts;
  decisionQualityLog: DecisionQualityRecord[];
}

// Custom counter hook/component to smoothly animate score changes
const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 800; // ms
    const startTime = performance.now();

    let animationFrameId: number;

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      const current = Math.round(start + (end - start) * easeProgress);
      
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCounter);
      }
    };

    animationFrameId = requestAnimationFrame(updateCounter);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value]);

  return <>{displayValue}</>;
};

const MCScores: React.FC<MCScoresProps> = ({ score, alerts, decisionQualityLog }) => {
  const overall = score.overall;
  const grade = score.grade || "F";
  const trend = score.trend || "stable";

  // Compute color based on score value
  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-400";
    if (val >= 50) return "text-amber-400";
    return "text-rose-400";
  };



  const getMetricBarColor = (val: number) => {
    if (val >= 80) return "bg-emerald-500";
    if (val >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="glass-panel rounded-xl border border-tau-teal/20 overflow-hidden flex flex-col h-full relative">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-tau-teal/50" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-tau-teal/50" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-tau-teal/50" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-tau-teal/50" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-tau-teal/10 shrink-0">
        <h3 className="text-[10px] font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <BarChart2 className="h-3.5 w-3.5 text-tau-teal" />
          Mission Performance Scorecard
        </h3>
        <span className="text-[8px] font-mono text-slate-500">
          UPDATED MET {score.lastUpdated || "00:00:00"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-4">
        {/* Main Composite Score Area */}
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Big Score Radial/Box */}
          <div className="col-span-6 flex items-center gap-4 border border-tau-teal/15 bg-tau-teal/5 rounded-xl p-3">
            <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-slate-800"
                  strokeWidth="5"
                  fill="transparent"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-tau-teal"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 34}
                  animate={{ strokeDasharray: `${(overall / 100) * 2 * Math.PI * 34} ${2 * Math.PI * 34}` }}
                  transition={{ duration: 1 }}
                  style={{ filter: "drop-shadow(0 0 6px rgba(6,182,212,0.6))" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-orbitron font-black text-white leading-none">
                  <AnimatedCounter value={overall} />
                </span>
                <span className="text-[7px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">Overall</span>
              </div>
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] font-mono text-slate-400">Rating:</span>
                <span className="text-base font-orbitron font-extrabold text-tau-teal">{grade}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[9px] font-mono text-slate-400">
                <span>Trend:</span>
                {trend === "improving" && (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" /> UPWARD
                  </span>
                )}
                {trend === "declining" && (
                  <span className="text-rose-400 flex items-center gap-0.5">
                    <TrendingDown className="h-3 w-3" /> DECLINE
                  </span>
                )}
                {trend === "stable" && (
                  <span className="text-slate-400">STABLE</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Summary / Grade Banner */}
          <div className="col-span-6 flex flex-col justify-between h-full py-1">
            <div className="text-[9px] font-mono text-slate-400 leading-normal">
              Evaluating real-time command performance, safety metrics, scientific yields, and resource utilization.
            </div>
            <div className="flex gap-2 mt-2">
              <div className="flex-1 text-center bg-slate-900/40 border border-slate-800 rounded-lg p-1.5">
                <div className="text-[7px] font-mono text-slate-500 uppercase">Decisions Evaluated</div>
                <div className="text-[11px] font-orbitron font-bold text-white mt-0.5">
                  {decisionQualityLog.length}
                </div>
              </div>
              <div className="flex-1 text-center bg-slate-900/40 border border-slate-800 rounded-lg p-1.5">
                <div className="text-[7px] font-mono text-slate-500 uppercase">Avg Accuracy</div>
                <div className="text-[11px] font-orbitron font-bold text-white mt-0.5">
                  {decisionQualityLog.length > 0
                    ? `${Math.round(decisionQualityLog.reduce((acc, curr) => acc + curr.decisionAccuracy, 0) / decisionQualityLog.length)}%`
                    : "100%"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6 KPI Tiles in a Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {METRIC_DISPLAY_CONFIG.map((config) => {
            const val = score.metrics[config.key] ?? 0;
            return (
              <div
                key={config.key}
                className="flex flex-col justify-between p-2 rounded-lg border border-slate-800 bg-slate-950/40 hover:border-tau-teal/30 hover:bg-tau-teal/3 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="flex items-center justify-between gap-1 shrink-0">
                  <span className="text-[9px] font-orbitron font-semibold text-slate-300 truncate tracking-wide">
                    {config.shortLabel}
                  </span>
                  <span className="text-xs">{config.icon}</span>
                </div>

                <div className="mt-1 flex items-baseline justify-between shrink-0">
                  <span className={`text-base font-mono font-bold ${getScoreColor(val)}`}>
                    <AnimatedCounter value={Math.round(val)} />
                  </span>
                  <span className="text-[7px] font-mono text-slate-500">
                    wt: {config.weight}%
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden shrink-0">
                  <motion.div
                    className={`h-full ${getMetricBarColor(val)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>

                {/* Micro tooltip info on hover */}
                <div className="absolute inset-0 bg-space-black border border-tau-teal/35 rounded-lg flex flex-col justify-center px-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <span className="text-[7px] font-mono text-slate-500 uppercase">Description</span>
                  <span className="text-[8px] font-mono text-slate-300 leading-tight">{config.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical Alert Strip */}
      <AnimatePresence>
        {alerts.criticalMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-rose-500/15 border-t border-rose-500/35 px-4 py-2 flex items-center gap-2 shrink-0 animate-pulse"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            <span className="text-[9px] font-mono text-rose-300 font-bold uppercase tracking-wider">
              CRITICAL HEALTH ALERT: MULTIPLE RESOURCE RESERVES CRITICAL
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MCScores;
