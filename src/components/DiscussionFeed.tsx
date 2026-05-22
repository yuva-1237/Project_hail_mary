/**
 * DiscussionFeed – Phase 5
 * Scrollable live feed of inter-agent messages for the current discussion session.
 * Messages slide in sequentially. Auto-scrolls to the latest message.
 */
import React, { useRef, useEffect } from "react";
import { MessageSquare, Radio } from "lucide-react";
import MessageCard from "./MessageCard";
import ConsensusMonitor from "./ConsensusMonitor";
import type { DiscussionSession } from "../types/communication";

interface DiscussionFeedProps {
  session: DiscussionSession | null;
  /** "idle" | "analyzing" | "resolved" */
  status: string;
}

const DiscussionFeed: React.FC<DiscussionFeedProps> = ({ session, status }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom only when a real discussion session with messages appears
  useEffect(() => {
    if (scrollRef.current && session && session.messages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session]);

  const isIdle = status === "idle";
  const isAnalyzing = status === "analyzing";
  const isResolved = status === "resolved";

  return (
    <div className="glass-panel rounded-lg border border-tau-teal/15 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tau-teal/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tau-teal/40" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-tau-teal/10">
        <h3 className="text-xs font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-tau-teal" />
          Mission Discussion Feed
        </h3>

        <div className="flex items-center gap-3">
          {/* Status badge */}
          {isAnalyzing && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 animate-pulse">
              <Radio className="h-3 w-3" />
              Agents communicating...
            </span>
          )}
          {isResolved && session && (
            <ConsensusMonitor score={session.consensusScore} compact />
          )}
          {isIdle && (
            <span className="text-[10px] font-mono text-slate-500">No active session</span>
          )}
        </div>
      </div>

      {/* Feed body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4"
        style={{ maxHeight: "380px", minHeight: "200px" }}
      >
        {isIdle && (
          <div className="flex flex-col items-center justify-center h-32 gap-3 opacity-30">
            <MessageSquare className="h-8 w-8 text-slate-600" />
            <p className="text-[11px] font-mono text-slate-600 text-center">
              Discussion feed will populate when a mission event triggers agent collaboration.
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-tau-teal/60 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
            <p className="text-[11px] font-mono text-tau-teal/60 animate-pulse">
              Agents analysing and composing messages...
            </p>
          </div>
        )}

        {isResolved && session && session.messages.length > 0 && (
          <div className="flex flex-col gap-3">
            {/* Event label */}
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px flex-1 bg-tau-teal/10" />
              <span className="text-[9px] font-mono text-tau-teal/50 px-2">
                DISCUSSION SESSION — {session.eventTitle.toUpperCase()}
              </span>
              <div className="h-px flex-1 bg-tau-teal/10" />
            </div>

            {/* Messages */}
            {session.messages.map((msg, i) => (
              <MessageCard key={msg.id} message={msg} index={i} />
            ))}

            {/* Confidence adjustments summary */}
            {session.adjustedRecommendations.length > 0 && (
              <div className="glass-panel rounded-lg border border-tau-teal/10 p-3 mt-1">
                <p className="text-[9px] font-mono text-tau-teal/70 uppercase tracking-widest mb-2">
                  Post-Discussion Confidence Adjustments
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {session.adjustedRecommendations.map((adj) => (
                    <div key={adj.agentId} className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-mono text-slate-500 truncate">
                        {adj.agentName.replace(" Agent", "")}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[9px] font-mono text-slate-600 line-through">
                          {adj.originalConfidence}%
                        </span>
                        <span className="text-[9px] font-mono text-white font-bold">
                          {adj.adjustedConfidence}%
                        </span>
                        <span
                          className={`text-[8px] font-mono ${
                            adj.delta > 0
                              ? "text-cyber-green"
                              : adj.delta < 0
                              ? "text-rose-400"
                              : "text-slate-600"
                          }`}
                        >
                          {adj.delta > 0 ? `+${adj.delta}` : adj.delta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionFeed;
