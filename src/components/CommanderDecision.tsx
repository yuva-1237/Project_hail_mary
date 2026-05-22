import React from "react";
import { Star, CheckCircle2, XCircle } from "lucide-react";
import type { CommanderDecision as CommDecisionType } from "../types/agents";

interface CommanderDecisionProps {
  decision: CommDecisionType | null;
  predictedSuccess: number | null;
  decisionMode: "auto" | "manual";
  status: "idle" | "analyzing" | "resolved";
  onApprove?: () => void;
  onReject?: () => void;
  commanderVerdict?: "approved" | "rejected" | null;
}

export const CommanderDecision: React.FC<CommanderDecisionProps> = ({
  decision,
  predictedSuccess,
  decisionMode,
  status,
  onApprove,
  onReject,
  commanderVerdict,
}) => {
  if (status === "idle" || !decision) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center border border-tau-teal/10 rounded-lg bg-slate-950/20 min-h-[140px]">
        <Star className="h-6 w-6 text-slate-700 mb-2" />
        <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Awaiting Digital Twin Input</p>
        <p className="text-[9px] text-slate-600 mt-1">Commander decision resolves automatically when twin outcomes are computed.</p>
      </div>
    );
  }

  if (status === "analyzing") {
    return (
      <div className="flex items-center gap-3 p-6 border border-tau-teal/15 rounded-lg bg-slate-950/20 animate-pulse min-h-[140px]">
        <div className="w-6 h-6 rounded-full border-2 border-t-tau-teal border-tau-teal/30 animate-spin shrink-0" />
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-tau-teal uppercase tracking-widest font-bold">Commander Synthesizing twin telemetry...</span>
          <span className="text-[9px] text-slate-500 mt-0.5">Evaluating action paths in virtual sandbox.</span>
        </div>
      </div>
    );
  }

  const successColor =
    predictedSuccess !== null && predictedSuccess >= 85
      ? "text-cyber-green"
      : predictedSuccess !== null && predictedSuccess >= 60
      ? "text-astrophage"
      : "text-cyber-red animate-pulse";

  return (
    <div className="glass-panel p-4 rounded-lg border border-tau-teal/20 relative overflow-hidden flex flex-col gap-3 min-h-[140px]">
      {/* Decors */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tau-teal/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tau-teal/40" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-tau-teal/10 pb-2">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 text-tau-teal animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">
            Commander Recommendation
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500 uppercase">
          <span>Mode:</span>
          <span className={decisionMode === "auto" ? "text-cyber-green font-bold" : "text-astrophage font-bold"}>
            {decisionMode === "auto" ? "AUTO COMMAND" : "MANUAL VERIFY"}
          </span>
        </div>
      </div>

      {/* Choice Card */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Recommended Command</span>
            <span className="text-[15px] font-orbitron font-extrabold text-white tracking-wide block mt-0.5">
              {decision.finalAction}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Est. Success</span>
            <span className={`text-[18px] font-orbitron font-extrabold ${successColor} block`}>
              {predictedSuccess !== null ? `${predictedSuccess}%` : "---"}
            </span>
          </div>
        </div>

        {/* Explanation */}
        <div className="rounded bg-slate-900/40 border border-slate-900 p-2.5">
          <span className="text-[8px] font-mono text-tau-teal/60 uppercase tracking-wider block mb-1">Commander Reasoning</span>
          <p className="text-[10.5px] font-mono text-slate-300 leading-relaxed">
            {decision.reasoning}
          </p>
        </div>

        {/* Interactive Manual Mode controls */}
        {decisionMode === "manual" && !commanderVerdict && (
          <div className="flex gap-2 pt-1 border-t border-slate-900">
            <button
              onClick={onApprove}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-cyber-green/30 bg-cyber-green/10 text-cyber-green text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-cyber-green/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Execute
            </button>
            <button
              onClick={onReject}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-cyber-red/30 bg-cyber-red/10 text-cyber-red text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-cyber-red/20 transition-all cursor-pointer"
            >
              <XCircle className="h-3.5 w-3.5" /> Reject / Abort
            </button>
          </div>
        )}

        {/* Action result display when manual verdict is given */}
        {commanderVerdict && (
          <div className={`flex items-center gap-2 rounded border p-2 text-[10px] font-mono uppercase tracking-wider ${
            commanderVerdict === "approved"
              ? "text-cyber-green border-cyber-green/30 bg-cyber-green/10"
              : "text-cyber-red border-cyber-red/30 bg-cyber-red/10"
          }`}>
            {commanderVerdict === "approved" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <span>Commander Verdict: {commanderVerdict} & Committed</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default CommanderDecision;
