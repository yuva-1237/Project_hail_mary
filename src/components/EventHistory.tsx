import React from "react";
import { History, Inbox } from "lucide-react";
import SeverityBadge from "./SeverityBadge";
import type { ActiveEvent } from "../data/events";

interface EventHistoryProps {
  history: ActiveEvent[];
}

export const EventHistory: React.FC<EventHistoryProps> = ({ history }) => {
  // Take only the 10 most recent events (newest first)
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
          <History className="h-4 w-4 text-tau-teal animate-spin-slow" />
          Alert History Log
        </h3>
        <span className="text-[9px] font-mono text-tau-teal/60 border border-tau-teal/20 px-2 py-0.5 rounded">
          Max: 10 entries
        </span>
      </div>

      {/* Scrollable List Container */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1.5">
        {recentHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 py-6">
            <Inbox className="h-6 w-6 text-slate-700 mb-1.5" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600">
              No event log history
            </span>
          </div>
        ) : (
          recentHistory.map((event, idx) => (
            <div
              key={event.id}
              className="glass-panel hover:bg-slate-900/30 p-2.5 rounded border border-tau-teal/10 hover:border-tau-teal/25 flex justify-between items-center transition-all duration-200"
              style={{
                animationDelay: `${idx * 50}ms`,
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[9px] font-mono text-slate-500 shrink-0 select-text">
                  [{event.timestamp}]
                </span>
                <span className="text-xs font-mono font-bold text-white tracking-wide truncate max-w-[130px] sm:max-w-[170px]">
                  {event.title}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SeverityBadge severity={event.severity} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default EventHistory;
