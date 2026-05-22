/**
 * AgentHistory – Phase 4
 * Scrollable log of the 10 most recent agent collaborations.
 * Shows event name, each agent's recommendation, and the Commander's final decision.
 */
import React from "react";
import { History, Star, ChevronDown, ChevronRight } from "lucide-react";
import type { AgentCollaboration, AgentId } from "../types/agents";
import { useState } from "react";

interface AgentHistoryProps {
  history: AgentCollaboration[];
}

const AGENT_DOT_COLORS: Record<AgentId, string> = {
  navigation: "bg-sky-400",
  resource: "bg-amber-400",
  safety: "bg-rose-400",
  science: "bg-violet-400",
  commander: "bg-tau-teal",
};

const AgentHistory: React.FC<AgentHistoryProps> = ({ history }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="glass-panel p-4 rounded-lg border border-tau-teal/15 flex flex-col h-[280px] relative overflow-hidden">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tau-teal/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tau-teal/40" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-tau-teal/10 pb-2.5">
        <h3 className="text-xs font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <History className="h-4 w-4 text-tau-teal" />
          Agent Collaboration Log
        </h3>
        <span className="text-[10px] font-mono text-tau-teal/60">
          {history.length} / 10
        </span>
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <History className="h-7 w-7 text-slate-600" />
            <p className="text-[11px] text-slate-500 font-mono">
              No collaborations yet.
            </p>
          </div>
        ) : (
          history.map((collab) => {
            const isExpanded = expandedId === collab.id;
            const decision = collab.commanderDecision;

            return (
              <div
                key={collab.id}
                className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/30"
              >
                {/* Row header – always visible */}
                <button
                  onClick={() => toggleExpand(collab.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-tau-teal/5 transition-colors text-left"
                >
                  {/* Event name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono font-semibold text-white truncate">
                      {collab.eventTitle}
                    </p>
                    {decision && (
                      <p className="text-[10px] text-tau-teal truncate flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 shrink-0" />
                        {decision.finalAction}
                      </p>
                    )}
                  </div>

                  {/* Agent dots */}
                  <div className="flex gap-0.5 shrink-0">
                    {collab.recommendations.map((r) => (
                      <span
                        key={r.agentId}
                        className={`w-1.5 h-1.5 rounded-full ${AGENT_DOT_COLORS[r.agentId] ?? "bg-slate-500"}`}
                        title={r.agentName}
                      />
                    ))}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[9px] font-mono text-slate-500 shrink-0">
                    {collab.timestamp}
                  </span>

                  {/* Expand toggle */}
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-slate-500 shrink-0" />
                  )}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-slate-700/40 space-y-2 pt-2">
                    {/* Agent recommendations mini-list */}
                    {collab.recommendations.map((r) => {
                      const dotColor = AGENT_DOT_COLORS[r.agentId] ?? "bg-slate-500";
                      const isChosen =
                        decision?.finalAction === r.recommendation &&
                        decision?.contributingAgents.includes(r.agentId);

                      return (
                        <div
                          key={r.agentId}
                          className={`flex items-start gap-2 text-[10px] font-mono ${
                            isChosen ? "text-cyber-green" : "text-slate-400"
                          }`}
                        >
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                          <span className="text-slate-500 shrink-0 w-24 truncate">
                            {r.agentName.replace(" Agent", "")}
                          </span>
                          <ChevronRight className="h-2.5 w-2.5 shrink-0 mt-0.5 text-slate-600" />
                          <span className={`flex-1 ${isChosen ? "font-bold" : ""}`}>
                            {r.recommendation}
                          </span>
                          <span className="shrink-0 text-slate-600">{r.confidence}%</span>
                        </div>
                      );
                    })}

                    {/* Commander final */}
                    {decision && (
                      <div className="border-t border-slate-700/40 pt-2 flex items-start gap-2 text-[10px] font-mono text-tau-teal">
                        <Star className="h-3 w-3 shrink-0 mt-0.5" />
                        <span className="shrink-0 text-tau-teal/70">Commander →</span>
                        <span className="font-bold">{decision.finalAction}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AgentHistory;
