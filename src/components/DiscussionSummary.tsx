/**
 * DiscussionSummary – Phase 5
 * Displays the Mission Commander's synthesised final decision
 * along with inter-agent debate consensus telemetry, supporting/opposing agent tags,
 * and a summary of the deliberation narrative.
 */
import React from "react";
import { Star, Cpu, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import type { CommanderDecision, AgentId } from "../types/agents";
import type { DiscussionSession } from "../types/communication";
import { AGENT_META } from "../types/agents";
import ConsensusMonitor from "./ConsensusMonitor";

interface DiscussionSummaryProps {
  commanderDecision: CommanderDecision | null;
  discussionSession: DiscussionSession | null;
  isDeliberating: boolean;
}

const AGENT_COLORS: Record<AgentId, string> = {
  navigation: "text-sky-400 bg-sky-500/15 border-sky-500/30",
  resource: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  safety: "text-rose-400 bg-rose-500/15 border-rose-500/30",
  science: "text-violet-400 bg-violet-500/15 border-violet-500/30",
  commander: "text-tau-teal bg-tau-teal/15 border-tau-teal/30",
};

const DiscussionSummary: React.FC<DiscussionSummaryProps> = ({
  commanderDecision,
  discussionSession,
  isDeliberating,
}) => {
  return (
    <div className="glass-panel rounded-lg border border-tau-teal/25 p-4 flex flex-col gap-3 relative overflow-hidden h-full">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-tau-teal/50" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-tau-teal/50" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-tau-teal/20" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-tau-teal/20" />

      {/* Header */}
      <div className="flex items-center gap-2 border-b border-tau-teal/15 pb-2.5">
        <div className="p-1.5 rounded-md bg-tau-teal/15">
          <Star className="h-4 w-4 text-tau-teal" />
        </div>
        <div>
          <h4 className="text-[11px] font-mono font-bold text-tau-teal uppercase tracking-widest">
            Deliberation Outcome
          </h4>
          <p className="text-[9px] text-slate-500 font-mono">Commander synthesised results</p>
        </div>
        <div className="ml-auto">
          {isDeliberating ? (
            <span className="flex items-center gap-1 text-[9px] font-mono text-amber-400 animate-pulse">
              <Cpu className="h-3 w-3" /> DELIBERATING
            </span>
          ) : commanderDecision ? (
            <span className="flex items-center gap-1 text-[9px] font-mono text-cyber-green">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
              RESOLVED
            </span>
          ) : (
            <span className="text-[9px] font-mono text-slate-500">STANDBY</span>
          )}
        </div>
      </div>

      {/* Body */}
      {isDeliberating ? (
        /* Deliberating state */
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-tau-teal/30 border-t-tau-teal animate-spin" />
            <Star className="h-4 w-4 text-tau-teal absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <p className="text-[11px] font-mono text-tau-teal/80 uppercase tracking-widest">
              Reviewing debate...
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Synchronizing consensus vectors
            </p>
          </div>
        </div>
      ) : commanderDecision && discussionSession ? (
        /* Decision revealed state */
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[420px] pr-1">
          {/* Final Action */}
          <div className="rounded-md bg-tau-teal/10 border border-tau-teal/25 p-3 shrink-0">
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1">
              Selected Command Protocol
            </p>
            <p className="text-base font-orbitron font-bold text-white tracking-wide">
              {commanderDecision.finalAction}
            </p>
          </div>

          {/* Consensus score (compact variant) */}
          <div className="rounded-md bg-slate-900/30 border border-slate-800/40 p-2.5 shrink-0 flex items-center justify-between">
            <ConsensusMonitor score={discussionSession.consensusScore} compact={true} />
            <span className="text-[10px] text-slate-500 font-mono">
              Confidence adjustments applied
            </span>
          </div>

          {/* Commander Reasoning & Discussion Summary */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Cpu className="h-3 w-3 text-tau-teal" /> Commander rationale
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-900/60 rounded p-2 font-mono">
                {commanderDecision.reasoning}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                <FileText className="h-3 w-3 text-sky-400" /> debate summary
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-900/60 rounded p-2 font-mono">
                {discussionSession.discussionSummary}
              </p>
            </div>
          </div>

          {/* Supporting & Opposing Agents */}
          <div className="grid grid-cols-2 gap-2 mt-1 shrink-0">
            {/* Supporting */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Supporting ({discussionSession.supportingAgents.length})
              </span>
              <div className="flex flex-col gap-1">
                {discussionSession.supportingAgents.length > 0 ? (
                  discussionSession.supportingAgents.map((id) => {
                    const agentId = id as AgentId;
                    const meta = AGENT_META[agentId];
                    const colorCls = AGENT_COLORS[agentId] ?? "text-slate-300 bg-slate-700/30 border-slate-600/30";
                    return (
                      <span
                        key={id}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border ${colorCls} text-center truncate`}
                      >
                        {meta?.name ?? id}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-[9px] font-mono text-slate-600 italic">None</span>
                )}
              </div>
            </div>

            {/* Opposing */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <XCircle className="h-3 w-3" /> Opposing ({discussionSession.opposingAgents.length})
              </span>
              <div className="flex flex-col gap-1">
                {discussionSession.opposingAgents.length > 0 ? (
                  discussionSession.opposingAgents.map((id) => {
                    const agentId = id as AgentId;
                    const meta = AGENT_META[agentId];
                    const colorCls = AGENT_COLORS[agentId] ?? "text-slate-300 bg-slate-700/30 border-slate-600/30";
                    return (
                      <span
                        key={id}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border ${colorCls} text-center truncate`}
                      >
                        {meta?.name ?? id}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-[9px] font-mono text-slate-600 italic">None</span>
                )}
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="mt-auto pt-2 border-t border-slate-900 flex items-center gap-1 text-[9px] font-mono text-slate-600 shrink-0">
            <Clock className="h-3 w-3" />
            <span>MET {commanderDecision.timestamp}</span>
          </div>
        </div>
      ) : (
        /* Idle state */
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6 text-center">
          <Star className="h-8 w-8 text-slate-600" />
          <p className="text-[11px] font-mono text-slate-500">
            Awaiting mission events.
          </p>
          <p className="text-[10px] text-slate-600">
            Commander outcome and consensus telemetry will activate when an event is processed.
          </p>
        </div>
      )}
    </div>
  );
};

export default DiscussionSummary;
