/**
 * Phase 8 – DecisionAnalysis
 * Displays a scrollable log of Commander decision quality records with
 * predicted vs actual success comparisons.
 */
import React from "react";
import { Brain, CheckCircle, XCircle, Zap } from "lucide-react";
import type { DecisionQualityRecord } from "../../scoring/types";
import { rollingDecisionAccuracy } from "../../scoring/evaluateDecisionQuality";

interface DecisionAnalysisProps {
  records: DecisionQualityRecord[];
}

// ─── Accuracy colour ──────────────────────────────────────────────────────────

function accuracyStyle(acc: number) {
  if (acc >= 85) return { bar: "bg-emerald-500", text: "text-emerald-400", label: "EXCELLENT" };
  if (acc >= 70) return { bar: "bg-sky-500",     text: "text-sky-400",     label: "GOOD" };
  if (acc >= 50) return { bar: "bg-amber-400",   text: "text-amber-300",   label: "FAIR" };
  return           { bar: "bg-rose-500",          text: "text-rose-400",    label: "POOR" };
}

// ─── Verdict badge ────────────────────────────────────────────────────────────

function VerdictBadge({ verdict }: { verdict: DecisionQualityRecord["verdict"] }) {
  if (verdict === "approved") {
    return (
      <span className="flex items-center gap-0.5 text-[8px] font-mono text-emerald-400 font-bold">
        <CheckCircle className="h-2.5 w-2.5" /> APPROVED
      </span>
    );
  }
  if (verdict === "rejected") {
    return (
      <span className="flex items-center gap-0.5 text-[8px] font-mono text-rose-400 font-bold">
        <XCircle className="h-2.5 w-2.5" /> REJECTED
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-[8px] font-mono text-sky-400 font-bold">
      <Zap className="h-2.5 w-2.5" /> AUTO
    </span>
  );
}

// ─── Single record row ────────────────────────────────────────────────────────

function RecordRow({ record }: { record: DecisionQualityRecord }) {
  const { bar, text, label } = accuracyStyle(record.decisionAccuracy);
  return (
    <div className="flex flex-col gap-2 border border-slate-800/60 rounded-md p-3 hover:border-tau-teal/20 transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[9px] font-mono text-slate-500">{record.timestamp} · {record.eventTitle}</span>
          <span className="text-[11px] font-orbitron text-white font-bold truncate" title={record.selectedAction}>
            {record.selectedAction}
          </span>
        </div>
        <VerdictBadge verdict={record.verdict} />
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[7px] font-mono text-slate-600 uppercase mb-0.5">Predicted</p>
          <span className="text-[11px] font-orbitron font-bold text-sky-400">{record.predictedSuccessProbability}%</span>
        </div>
        <div>
          <p className="text-[7px] font-mono text-slate-600 uppercase mb-0.5">Actual</p>
          <span className="text-[11px] font-orbitron font-bold text-emerald-400">{record.actualSuccessProbability}%</span>
        </div>
        <div>
          <p className="text-[7px] font-mono text-slate-600 uppercase mb-0.5">Accuracy</p>
          <span className={`text-[11px] font-orbitron font-bold ${text}`}>{record.decisionAccuracy}%</span>
        </div>
      </div>

      {/* Accuracy bar */}
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${bar}`}
          style={{ width: `${record.decisionAccuracy}%` }}
        />
      </div>
      <span className={`text-[8px] font-mono font-bold ${text} self-end`}>{label}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const DecisionAnalysis: React.FC<DecisionAnalysisProps> = ({ records }) => {
  const rollingAccuracy = rollingDecisionAccuracy(records);
  const { text: raText, label: raLabel } = accuracyStyle(rollingAccuracy);
  const displayed = records.slice(0, 6);

  return (
    <div className="glass-panel rounded-lg border border-tau-teal/20 flex flex-col overflow-hidden relative h-full">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-tau-teal/50" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-tau-teal/50" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-tau-teal/10">
        <h3 className="text-xs font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-tau-teal" />
          Decision Analysis
        </h3>
        {records.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-mono text-slate-500">CMD Accuracy</span>
            <span className={`text-[11px] font-orbitron font-bold ${raText}`}>
              {rollingAccuracy}%
            </span>
            <span className={`text-[8px] font-mono ${raText}`}>· {raLabel}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 min-h-0">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Brain className="h-8 w-8 text-slate-700" />
            <p className="text-[11px] font-mono text-slate-500">
              No decisions recorded yet.
            </p>
            <p className="text-[10px] text-slate-600">
              Decision quality logs appear after the Commander resolves a mission event.
            </p>
          </div>
        ) : (
          displayed.map((rec) => (
            <RecordRow key={rec.id} record={rec} />
          ))
        )}
      </div>

      {records.length > 6 && (
        <div className="px-4 pb-3 text-center">
          <span className="text-[8px] font-mono text-slate-600">
            Showing 6 of {records.length} decisions
          </span>
        </div>
      )}
    </div>
  );
};

export default DecisionAnalysis;
