/**
 * AgentPanel – Phase 4 + Phase 5
 * Full "Agent Collaboration" section combining all four agent cards,
 * the DiscussionSummary panel (Phase 5 – replaces CommanderPanel), and
 * the Agent Disagreement Meter.
 *
 * States:
 *  - idle:       No active collaboration (shows placeholders + disabled meter).
 *  - analyzing:  Agent cards fade-in sequentially (staggered); meter visible.
 *  - resolved:   Commander decision + discussion summary shown, selected card highlighted.
 */
import React from "react";
import { Network, Cpu } from "lucide-react";
import AgentCard from "./AgentCard";
import DiscussionSummary from "./DiscussionSummary";
import DisagreementMeter from "./DisagreementMeter";
import type { AgentCollaboration } from "../types/agents";

type CollabStatus = "idle" | "analyzing" | "resolved";

interface AgentPanelProps {
  collaboration: AgentCollaboration | null;
  status: CollabStatus;
}

const AgentPanel: React.FC<AgentPanelProps> = ({ collaboration, status }) => {
  const isAnalyzing = status === "analyzing";
  const isResolved = status === "resolved";
  const isDeliberating = isAnalyzing;

  const commanderDecision =
    isResolved && collaboration ? collaboration.commanderDecision : null;

  const discussionSession =
    isResolved && collaboration ? collaboration.discussionSession ?? null : null;

  const showMeter = (isAnalyzing || isResolved) && collaboration && collaboration.recommendations.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold text-tau-teal tracking-widest uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-tau-teal rounded-full" />
          Agent Collaboration
        </h3>
        <div className="flex items-center gap-2">
          {status === "analyzing" && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 animate-pulse">
              <Cpu className="h-3 w-3" />
              Agents Analyzing...
            </span>
          )}
          {status === "resolved" && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-cyber-green">
              <Network className="h-3 w-3" />
              Consensus Reached
            </span>
          )}
          {status === "idle" && (
            <span className="text-[10px] font-mono text-slate-500">
              Awaiting event
            </span>
          )}
        </div>
      </div>

      {/* Disagreement meter — shown when agents have data */}
      {showMeter && (
        <DisagreementMeter recommendations={collaboration!.recommendations} />
      )}

      {/* Main layout: 4 agent cards (left 2/3) + DiscussionSummary panel (right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Agent cards grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          {collaboration && (isAnalyzing || isResolved)
            ? collaboration.recommendations.map((rec, i) => (
                <AgentCard
                  key={rec.agentId}
                  recommendation={rec}
                  isSelected={
                    isResolved &&
                    collaboration.commanderDecision?.finalAction === rec.recommendation &&
                    collaboration.commanderDecision?.contributingAgents.includes(rec.agentId)
                  }
                  staggerIndex={i}
                  isRevealing={isAnalyzing}
                />
              ))
            : /* Idle placeholders */
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="glass-panel rounded-lg border border-slate-700/30 p-3.5 flex flex-col gap-2 opacity-30"
                >
                  <div className="h-2 w-20 bg-slate-700 rounded animate-pulse" />
                  <div className="h-2 w-32 bg-slate-800 rounded animate-pulse" />
                  <div className="h-1.5 w-full bg-slate-800 rounded animate-pulse mt-2" />
                </div>
              ))}
        </div>

        {/* Discussion Summary panel (Phase 5) */}
        <div className="lg:col-span-1">
          <DiscussionSummary
            commanderDecision={commanderDecision}
            discussionSession={discussionSession}
            isDeliberating={isDeliberating}
          />
        </div>
      </div>
    </div>
  );
};

export default AgentPanel;
