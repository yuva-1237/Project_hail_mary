import React from "react";
import { Cpu, CheckCircle2, AlertOctagon } from "lucide-react";
import type { Decision } from "../data/decisions";

interface DecisionHistoryProps {
  history: Decision[];
}

export const DecisionHistory: React.FC<DecisionHistoryProps> = ({ history }) => {
  // Cap history at 10 items
  const recentHistory = history.slice(0, 10);

  return (
    <div className="glass-panel p-5 rounded-lg border border-tau-teal/15 flex flex-col h-[280px] relative overflow-hidden select-none">
      {/* Sci-fi tech corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tau-teal/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tau-teal/40" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-tau-teal/40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-tau-teal/40" />

      {/* Header */}
      <div className="flex justify-between items-center mb-3.5 border-b border-tau-teal/10 pb-2.5">
        <h3 className="text-xs font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <Cpu className="h-4 w-4 text-tau-teal animate-spin-slow" />
          AI Decision History Log
        </h3>
        <span className="text-[9px] font-mono text-tau-teal/60 border border-tau-teal/20 px-2 py-0.5 rounded">
          Max: 10 entries
        </span>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1.5">
        {recentHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 py-6">
            <Cpu className="h-6 w-6 text-slate-700 mb-1.5 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600">
              No decisions recorded
            </span>
          </div>
        ) : (
          recentHistory.map((decision) => (
            <div
              key={decision.id}
              className="glass-panel hover:bg-slate-900/30 p-3 rounded border border-tau-teal/10 hover:border-tau-teal/20 flex flex-col gap-1.5 transition-all duration-200"
            >
              {/* Event Name & Timestamp */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 min-w-0">
                  <AlertOctagon className="h-3 w-3 text-astrophage shrink-0" />
                  <span className="text-xs font-mono font-bold text-white tracking-wide truncate">
                    {decision.eventTitle}
                  </span>
                </div>
                <span className="text-[8.5px] font-mono text-slate-500 shrink-0">
                  MET {decision.timestamp}
                </span>
              </div>

              {/* Action Selected */}
              <div className="flex items-center gap-1.5 pl-4.5">
                <CheckCircle2 className="h-3 w-3 text-cyber-green shrink-0" />
                <span className="text-[10px] font-mono font-semibold text-cyber-green uppercase tracking-wide">
                  {decision.selectedAction}
                </span>
              </div>

              {/* Outcome */}
              <p className="text-[10px] font-mono text-slate-400 pl-4.5 leading-4">
                {decision.outcome}
              </p>
              
              {/* Success Probability Adjustment */}
              <div className="text-[8.5px] font-mono text-cyber-green font-bold text-right">
                STATUS BOOST: +{decision.successImpact}% SUCCESS PROBABILITY
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default DecisionHistory;
