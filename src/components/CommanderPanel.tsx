/**
 * CommanderPanel – Phase 4
 * Displays the Mission Commander's synthesised final decision.
 * Shows an animated "deliberating" state while agents are still analysing.
 */
import React from "react";
import { Star, Cpu, Clock, Users2 } from "lucide-react";
import type { CommanderDecision, AgentId } from "../types/agents";
import { AGENT_META } from "../types/agents";

interface CommanderPanelProps {
  commanderDecision: CommanderDecision | null;
  /** true = agents still running / commander deliberating */
  isDeliberating: boolean;
}

const AGENT_COLORS: Record<AgentId, string> = {
  navigation: "text-sky-400 bg-sky-500/15 border-sky-500/30",
  resource: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  safety: "text-rose-400 bg-rose-500/15 border-rose-500/30",
  science: "text-violet-400 bg-violet-500/15 border-violet-500/30",
  commander: "text-tau-teal bg-tau-teal/15 border-tau-teal/30",
};

const CommanderPanel: React.FC<CommanderPanelProps> = ({
  commanderDecision,
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
            Mission Commander
          </h4>
          <p className="text-[9px] text-slate-500 font-mono">Final Authority</p>
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
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-tau-teal/30 border-t-tau-teal animate-spin" />
            <Star className="h-4 w-4 text-tau-teal absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <p className="text-[11px] font-mono text-tau-teal/80 uppercase tracking-widest">
              Reviewing recommendations...
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Cross-referencing agent inputs
            </p>
          </div>
        </div>
      ) : commanderDecision ? (
        /* Decision revealed state */
        <div className="flex-1 flex flex-col gap-3">
          {/* Final Action */}
          <div className="rounded-md bg-tau-teal/10 border border-tau-teal/25 p-3">
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1">
              Final Decision
            </p>
            <p className="text-base font-orbitron font-bold text-white tracking-wide">
              {commanderDecision.finalAction}
            </p>
          </div>

          {/* Reasoning */}
          <div>
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Cpu className="h-3 w-3" /> Commander Reasoning
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {commanderDecision.reasoning}
            </p>
          </div>

          {/* Contributing agents */}
          <div>
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Users2 className="h-3 w-3" /> Based on Input From
            </p>
            <div className="flex flex-wrap gap-1.5">
              {commanderDecision.contributingAgents.map((agentId) => {
                const meta = AGENT_META[agentId];
                const colorCls = AGENT_COLORS[agentId] ?? "text-slate-300 bg-slate-700/30 border-slate-600/30";
                return (
                  <span
                    key={agentId}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${colorCls}`}
                  >
                    {meta?.name ?? agentId}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Timestamp */}
          <div className="mt-auto flex items-center gap-1 text-[9px] font-mono text-slate-600">
            <Clock className="h-3 w-3" />
            <span>MET {commanderDecision.timestamp}</span>
          </div>
        </div>
      ) : (
        /* Idle state */
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4 text-center">
          <Star className="h-8 w-8 text-slate-600" />
          <p className="text-[11px] font-mono text-slate-500">
            Awaiting mission events.
          </p>
          <p className="text-[10px] text-slate-600">
            Commander will activate when an event is detected.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommanderPanel;
