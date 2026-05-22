/**
 * Phase 8 – PerformanceHistory
 * Scrollable timeline of mission performance snapshots with before/after delta pills.
 */
import React from "react";
import { Clock, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import type { PerformanceSnapshot } from "../../scoring/types";

interface PerformanceHistoryProps {
  snapshots: PerformanceSnapshot[];
}

// ─── Severity badge ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: PerformanceSnapshot["severity"] }) {
  const styles: Record<string, string> = {
    Critical: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    High:     "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Medium:   "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Low:      "bg-sky-500/20 text-sky-400 border-sky-500/30",
  };
  return (
    <span className={`text-[7px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${styles[severity] ?? styles.Low}`}>
      {severity}
    </span>
  );
}

// ─── Delta pill ───────────────────────────────────────────────────────────────

function DeltaPill({ delta }: { delta: number }) {
  const positive = delta >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
      positive
        ? "bg-emerald-500/15 text-emerald-400"
        : "bg-rose-500/15 text-rose-400"
    }`}>
      {positive
        ? <TrendingUp className="h-2.5 w-2.5" />
        : <TrendingDown className="h-2.5 w-2.5" />}
      {positive ? "+" : ""}{delta.toFixed(1)}
    </span>
  );
}

// ─── Snapshot row ─────────────────────────────────────────────────────────────

function SnapshotRow({ snap, isFirst }: { snap: PerformanceSnapshot; isFirst: boolean }) {
  return (
    <div className={`flex flex-col gap-2 p-3 rounded-md border transition-colors ${
      isFirst
        ? "border-tau-teal/30 bg-tau-teal/5"
        : "border-slate-800/50 hover:border-slate-700/50"
    }`}>
      {/* Top: timestamp + severity */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="h-2.5 w-2.5 text-slate-600" />
          <span className="text-[8px] font-mono text-slate-500">{snap.timestamp}</span>
        </div>
        <SeverityBadge severity={snap.severity} />
      </div>

      {/* Event + action */}
      <div>
        <p className="text-[9px] font-mono text-slate-400 truncate" title={snap.eventTitle}>
          ⚡ {snap.eventTitle}
        </p>
        <p className="text-[9px] font-mono text-tau-teal/80 truncate" title={snap.actionTaken}>
          ↳ {snap.actionTaken}
        </p>
      </div>

      {/* Score before → after */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-orbitron font-bold text-slate-400">
          {snap.scoreBefore}
        </span>
        <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
        <span className="text-[11px] font-orbitron font-bold text-white">
          {snap.scoreAfter}
        </span>
        <DeltaPill delta={snap.delta} />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PerformanceHistory: React.FC<PerformanceHistoryProps> = ({ snapshots }) => {
  return (
    <div className="glass-panel rounded-lg border border-tau-teal/20 flex flex-col overflow-hidden relative h-full">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-tau-teal/50" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-tau-teal/50" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-tau-teal/10">
        <h3 className="text-xs font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-tau-teal" />
          Performance History
        </h3>
        {snapshots.length > 0 && (
          <span className="text-[8px] font-mono text-slate-500">
            {snapshots.length} event{snapshots.length !== 1 ? "s" : ""} recorded
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2.5 min-h-0">
        {snapshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Clock className="h-8 w-8 text-slate-700" />
            <p className="text-[11px] font-mono text-slate-500">
              No performance snapshots yet.
            </p>
            <p className="text-[10px] text-slate-600">
              Timeline entries appear after each mission event is resolved.
            </p>
          </div>
        ) : (
          snapshots.map((snap, idx) => (
            <SnapshotRow key={snap.id} snap={snap} isFirst={idx === 0} />
          ))
        )}
      </div>
    </div>
  );
};

export default PerformanceHistory;
