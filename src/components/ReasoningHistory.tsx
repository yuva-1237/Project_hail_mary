/**
 * ReasoningHistory – Phase 6
 * Scrollable log of the 10 most recent AI analyses (newest first).
 * Shows event name, selected action, confidence, provider, verdict, response time.
 */
import React, { useState } from "react";
import { Brain, ChevronDown, ChevronRight, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import type { AIAnalysis, CommanderVerdict } from "../ai/types";

interface ReasoningHistoryProps {
  history: AIAnalysis[];
}

const VERDICT_STYLES: Record<CommanderVerdict, string> = {
  approved: "text-cyber-green bg-cyber-green/10 border-cyber-green/30",
  modified: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  rejected: "text-rose-400 bg-rose-500/10 border-rose-500/30",
};

const VERDICT_ICONS: Record<CommanderVerdict, React.ReactNode> = {
  approved: <CheckCircle2 className="h-2.5 w-2.5" />,
  modified: <ShieldCheck className="h-2.5 w-2.5" />,
  rejected: <XCircle className="h-2.5 w-2.5" />,
};

function confidenceColor(c: number): string {
  if (c >= 85) return "text-emerald-400";
  if (c >= 65) return "text-sky-400";
  if (c >= 45) return "text-amber-400";
  return "text-rose-400";
}

const ReasoningHistory: React.FC<ReasoningHistoryProps> = ({ history }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="glass-panel p-4 rounded-lg border border-tau-teal/15 flex flex-col h-[280px] relative overflow-hidden">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tau-teal/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tau-teal/40" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-tau-teal/10 pb-2.5">
        <h3 className="text-xs font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <Brain className="h-4 w-4 text-tau-teal" />
          AI Reasoning Log
        </h3>
        <span className="text-[10px] font-mono text-tau-teal/60">{history.length} / 10</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <Brain className="h-7 w-7 text-slate-600" />
            <p className="text-[11px] text-slate-500 font-mono">No AI analyses yet.</p>
          </div>
        ) : (
          history.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const vStyle = entry.commanderVerdict ? VERDICT_STYLES[entry.commanderVerdict] : "text-slate-500 bg-slate-800/30 border-slate-700/30";

            return (
              <div key={entry.id} className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/30">
                {/* Collapsed row */}
                <button
                  onClick={() => toggle(entry.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-tau-teal/5 transition-colors text-left"
                >
                  {/* Event + action */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono font-semibold text-white truncate">
                      {entry.eventTitle}
                    </p>
                    <p className="text-[9px] font-mono text-tau-teal/70 truncate">
                      ↳ {entry.response.selectedAction}
                    </p>
                  </div>

                  {/* Confidence */}
                  <span className={`text-[9px] font-mono font-bold shrink-0 ${confidenceColor(entry.response.confidence)}`}>
                    {entry.response.confidence}%
                  </span>

                  {/* Provider */}
                  <span className="text-[8px] font-mono text-slate-600 shrink-0 hidden sm:block">
                    {entry.provider}
                  </span>

                  {/* Verdict badge */}
                  {entry.commanderVerdict && (
                    <span className={`flex items-center gap-0.5 text-[8px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${vStyle}`}>
                      {VERDICT_ICONS[entry.commanderVerdict]}
                      {entry.commanderVerdict.toUpperCase()}
                    </span>
                  )}

                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-slate-500 shrink-0" />
                  )}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-2 border-t border-slate-700/40 space-y-2">
                    {/* Reasoning snippet */}
                    <p className="text-[10px] text-slate-400 font-mono leading-relaxed line-clamp-3">
                      {entry.response.reasoning}
                    </p>

                    {/* Risks */}
                    {entry.response.risks.slice(0, 2).map((r, i) => (
                      <p key={i} className="text-[9px] font-mono text-amber-400/80">
                        ▸ {r}
                      </p>
                    ))}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-600 border-t border-slate-800 pt-1.5">
                      <span>{entry.responseTimeMs}ms · {entry.provider}{entry.isFallback ? " (fallback)" : ""}</span>
                      <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
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

export default ReasoningHistory;
