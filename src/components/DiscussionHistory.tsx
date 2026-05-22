/**
 * DiscussionHistory – Phase 5
 * Scrollable log of the 10 most recent inter-agent discussion sessions.
 * Shows event name, consensus score badge, message count, final decision, and MET timestamp.
 */
import React, { useState } from "react";
import { Radio, ChevronDown, ChevronRight, MessageSquare } from "lucide-react";
import type { DiscussionSession } from "../types/communication";

interface DiscussionHistoryProps {
  history: DiscussionSession[];
}

function consensusColor(score: number): { badge: string; bar: string } {
  if (score >= 90) return { badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", bar: "bg-emerald-500" };
  if (score >= 75) return { badge: "bg-sky-500/20 text-sky-300 border-sky-500/30",             bar: "bg-sky-400" };
  if (score >= 50) return { badge: "bg-orange-500/20 text-orange-300 border-orange-500/30",    bar: "bg-orange-400" };
  return              { badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",               bar: "bg-rose-500" };
}

const DiscussionHistory: React.FC<DiscussionHistoryProps> = ({ history }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="glass-panel p-4 rounded-lg border border-tau-teal/15 flex flex-col h-[280px] relative overflow-hidden">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tau-teal/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tau-teal/40" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-tau-teal/10 pb-2.5">
        <h3 className="text-xs font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <Radio className="h-4 w-4 text-tau-teal" />
          Discussion Log
        </h3>
        <span className="text-[10px] font-mono text-tau-teal/60">
          {history.length} / 10
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <MessageSquare className="h-7 w-7 text-slate-600" />
            <p className="text-[11px] text-slate-500 font-mono">
              No discussions yet.
            </p>
          </div>
        ) : (
          history.map((session) => {
            const isExpanded = expandedId === session.id;
            const colors = consensusColor(session.consensusScore);

            return (
              <div
                key={session.id}
                className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/30"
              >
                {/* Collapsed row – always visible */}
                <button
                  onClick={() => toggle(session.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-tau-teal/5 transition-colors text-left"
                >
                  {/* Event name + final decision */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono font-semibold text-white truncate">
                      {session.eventTitle}
                    </p>
                    <p className="text-[9px] font-mono text-slate-400 truncate">
                      {session.opposingAgents.length > 0
                        ? `⚡ ${session.opposingAgents.length} opposing`
                        : "✓ unanimous"}
                    </p>
                  </div>

                  {/* Consensus score badge */}
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${colors.badge}`}
                  >
                    {session.consensusScore}
                  </span>

                  {/* Message count */}
                  <span className="text-[9px] font-mono text-slate-500 shrink-0">
                    {session.messages.length}msg
                  </span>

                  {/* Timestamp */}
                  <span className="text-[9px] font-mono text-slate-600 shrink-0">
                    {session.timestamp}
                  </span>

                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-slate-500 shrink-0" />
                  )}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-2 border-t border-slate-700/40 space-y-2">
                    {/* Consensus bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-slate-500 w-16 shrink-0">
                        Consensus
                      </span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                          style={{ width: `${session.consensusScore}%` }}
                        />
                      </div>
                      <span className={`text-[9px] font-mono font-bold shrink-0 ${colors.badge.split(" ")[1]}`}>
                        {session.consensusLabel}
                      </span>
                    </div>

                    {/* Discussion summary */}
                    <p className="text-[10px] text-slate-400 font-mono leading-relaxed line-clamp-3">
                      {session.discussionSummary}
                    </p>

                    {/* Supporting / Opposing */}
                    <div className="flex gap-3 text-[9px] font-mono">
                      <span className="text-emerald-400">
                        ✓ {session.supportingAgents.length} support
                      </span>
                      <span className="text-amber-400">
                        ⚡ {session.opposingAgents.length} opposing
                      </span>
                    </div>
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

export default DiscussionHistory;
