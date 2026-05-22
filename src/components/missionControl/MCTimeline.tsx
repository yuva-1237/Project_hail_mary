/**
 * Phase 9 – MCTimeline
 * Vertical, scrollable, animated log of mission events and decision history.
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckSquare } from "lucide-react";
import type { PerformanceSnapshot } from "../../scoring/types";

interface MCTimelineProps {
  performanceHistory: PerformanceSnapshot[];
}

const MCTimeline: React.FC<MCTimelineProps> = ({ performanceHistory }) => {
  // Most recent first
  const sortedHistory = [...performanceHistory].sort((a, b) => {
    // Basic fallback sort by comparing timestamp strings (most recent first)
    return b.timestamp.localeCompare(a.timestamp);
  });

  const getSeverityColor = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case "critical":
        return "bg-rose-500 shadow-rose-500/50";
      case "high":
        return "bg-orange-500 shadow-orange-500/50";
      case "medium":
        return "bg-amber-500 shadow-amber-500/50";
      case "low":
        return "bg-sky-500 shadow-sky-500/50";
      default:
        return "bg-slate-500 shadow-slate-500/50";
    }
  };

  const getSeverityBorder = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case "critical":
        return "border-rose-500/30 bg-rose-500/3";
      case "high":
        return "border-orange-500/30 bg-orange-500/3";
      case "medium":
        return "border-amber-500/30 bg-amber-500/3";
      case "low":
        return "border-sky-500/30 bg-sky-500/3";
      default:
        return "border-slate-800 bg-slate-900/10";
    }
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
          <Clock className="h-3.5 w-3.5 text-tau-teal" />
          Mission Event &amp; Decision Log
        </h3>
        <span className="text-[8px] font-mono text-slate-500 font-bold uppercase">
          {sortedHistory.length} EVENTS RECORDED
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0 relative">
        <AnimatePresence mode="popLayout">
          {sortedHistory.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-2 h-full py-12 text-center"
            >
              <CheckSquare className="h-8 w-8 text-slate-700" />
              <p className="text-[11px] font-mono text-slate-500">Awaiting first mission event.</p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3 relative pl-6 border-l border-slate-800/80">
              {sortedHistory.map((item, idx) => {
                const isPositive = item.delta >= 0;
                return (
                  <motion.div
                    key={item.id || idx}
                    layout
                    initial={{ opacity: 0, x: -16, y: -8 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`relative p-3 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-3 ${getSeverityBorder(
                      item.severity
                    )}`}
                  >
                    {/* Event Timeline Node Point */}
                    <div
                      className={`absolute -left-[31px] top-4 w-2.5 h-2.5 rounded-full border border-space-black ${getSeverityColor(
                        item.severity
                      )}`}
                      style={{ boxShadow: "0 0 8px currentColor" }}
                    />

                    {/* Left Details */}
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          MET {item.timestamp}
                        </span>
                        <span className="text-[11px] font-orbitron font-bold text-white tracking-wide truncate">
                          {item.eventTitle}
                        </span>
                        <span
                          className={`text-[8px] font-mono font-bold uppercase px-1 py-0.2 rounded-sm border ${
                            item.severity === "Critical"
                              ? "text-rose-400 border-rose-500/25 bg-rose-500/5"
                              : item.severity === "High"
                              ? "text-orange-400 border-orange-500/25 bg-orange-500/5"
                              : item.severity === "Medium"
                              ? "text-amber-400 border-amber-500/25 bg-amber-500/5"
                              : "text-sky-400 border-sky-500/25 bg-sky-500/5"
                          }`}
                        >
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 leading-normal mt-0.5">
                        <span className="text-slate-500 uppercase text-[8px] font-mono mr-1">Action:</span>
                        {item.actionTaken || "Analyzing best response..."}
                      </p>
                    </div>

                    {/* Score Delta Badge */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <div className="flex flex-col items-end">
                        <span className="text-[7px] font-mono text-slate-500 uppercase">Score Delta</span>
                        <span
                          className={`text-xs font-mono font-bold ${
                            isPositive ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {item.delta}
                        </span>
                      </div>
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center border text-[10px] font-mono font-bold ${
                          isPositive
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {item.scoreAfter}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MCTimeline;
