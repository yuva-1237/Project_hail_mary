/**
 * CommanderApproval – Phase 6
 * Displays the Commander approval UI for MANUAL decision mode.
 * Shows the pending AI recommendation and Approve / Reject buttons.
 */
import React from "react";
import { Star, CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";
import type { AIAnalysis, CommanderVerdict, DecisionMode } from "../ai/types";

interface CommanderApprovalProps {
  pendingAnalysis: AIAnalysis | null;
  currentAnalysis: AIAnalysis | null;
  decisionMode: DecisionMode;
  onApprove: () => void;
  onReject: () => void;
}

const VERDICT_STYLES: Record<CommanderVerdict, string> = {
  approved: "text-cyber-green bg-cyber-green/10 border-cyber-green/30",
  modified: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  rejected: "text-rose-400 bg-rose-500/10 border-rose-500/30",
};

const CommanderApproval: React.FC<CommanderApprovalProps> = ({
  pendingAnalysis,
  currentAnalysis,
  decisionMode,
  onApprove,
  onReject,
}) => {
  // Auto mode — just show current verdict if resolved
  if (decisionMode === "auto") {
    if (!currentAnalysis?.commanderVerdict) return null;
    return (
      <div className="flex items-center justify-between rounded-md bg-cyber-green/5 border border-cyber-green/20 px-3 py-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-cyber-green" />
          <span className="text-[10px] font-mono font-bold text-cyber-green">
            COMMANDER · AUTO-APPROVED
          </span>
        </div>
        <span className="text-[9px] font-mono text-slate-500">
          {new Date(currentAnalysis.timestamp).toLocaleTimeString()}
        </span>
      </div>
    );
  }

  // Manual mode — verdict already given
  if (currentAnalysis?.commanderVerdict && !pendingAnalysis) {
    const vStyle = VERDICT_STYLES[currentAnalysis.commanderVerdict];
    return (
      <div className={`flex items-center justify-between rounded-md border px-3 py-2 ${vStyle}`}>
        <div className="flex items-center gap-2">
          <Star className="h-3.5 w-3.5" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            Commander · {currentAnalysis.commanderVerdict}
          </span>
        </div>
        <span className="text-[9px] font-mono opacity-60">
          {new Date(currentAnalysis.timestamp).toLocaleTimeString()}
        </span>
      </div>
    );
  }

  // Manual mode — pending commander review
  if (pendingAnalysis) {
    return (
      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 flex flex-col gap-2.5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Star className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
            Awaiting Commander Decision
          </span>
        </div>

        {/* Recommendation summary */}
        <div className="rounded bg-slate-900/50 border border-slate-800 p-2">
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">
            AI Recommends
          </p>
          <p className="text-[12px] font-orbitron font-bold text-white">
            {pendingAnalysis.response.selectedAction}
          </p>
          <p className="text-[9px] font-mono text-amber-300 mt-0.5">
            Confidence: {pendingAnalysis.response.confidence}% · Adj: {pendingAnalysis.response.successAdjustment > 0 ? "+" : ""}{pendingAnalysis.response.successAdjustment}%
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onApprove}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-cyber-green/15 border border-cyber-green/30 text-cyber-green text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-cyber-green/25 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approve
          </button>
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-rose-500/20 transition-colors"
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </button>
        </div>

        <div className="flex items-center gap-1 text-[9px] font-mono text-slate-600">
          <Clock className="h-3 w-3" />
          <span>Response time: {pendingAnalysis.responseTimeMs}ms · Provider: {pendingAnalysis.provider}</span>
        </div>
      </div>
    );
  }

  return null;
};

export default CommanderApproval;
