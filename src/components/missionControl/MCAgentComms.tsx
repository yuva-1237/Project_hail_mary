/**
 * Phase 9 – MCAgentComms
 * Chat-style agent communication panel with framer-motion message stream.
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Database, ShieldAlert, Telescope, Star, MessageSquare } from "lucide-react";
import type { AgentCollaboration } from "../../types/agents";
import type { AgentMessage } from "../../types/communication";
import { AGENT_META } from "../../types/agents";

interface MCAgentCommsProps {
  activeCollaboration: AgentCollaboration | null;
  collaborationStatus: "idle" | "analyzing" | "resolved";
}

// ─── Agent avatar config ──────────────────────────────────────────────────────

const AGENT_ICONS: Record<string, React.ReactNode> = {
  navigation: <Compass className="h-3.5 w-3.5" />,
  resource:   <Database className="h-3.5 w-3.5" />,
  safety:     <ShieldAlert className="h-3.5 w-3.5" />,
  science:    <Telescope className="h-3.5 w-3.5" />,
  commander:  <Star className="h-3.5 w-3.5" />,
};

const AGENT_COLORS: Record<string, string> = {
  navigation: "bg-sky-500/20 border-sky-500/50 text-sky-400",
  resource:   "bg-amber-500/20 border-amber-500/50 text-amber-400",
  safety:     "bg-rose-500/20 border-rose-500/50 text-rose-400",
  science:    "bg-violet-500/20 border-violet-500/50 text-violet-400",
  commander:  "bg-tau-teal/20 border-tau-teal/60 text-tau-teal",
};

const MSG_TYPE_BADGE: Record<string, string> = {
  SUPPORT:    "text-emerald-400 bg-emerald-500/15",
  CHALLENGE:  "text-rose-400 bg-rose-500/15",
  QUESTION:   "text-amber-400 bg-amber-500/15",
  SUGGESTION: "text-sky-400 bg-sky-500/15",
  ESCALATION: "text-orange-400 bg-orange-500/15",
  AGREEMENT:  "text-violet-400 bg-violet-500/15",
};

// ─── Agent seat avatar ────────────────────────────────────────────────────────

function AgentSeat({ agentId, active }: { agentId: string; active: boolean }) {
  const meta = AGENT_META[agentId as keyof typeof AGENT_META];
  const colorClass = AGENT_COLORS[agentId] ?? "bg-slate-700 border-slate-600 text-slate-400";
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        animate={active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={{ duration: 1.5, repeat: active ? Infinity : 0 }}
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${colorClass} ${
          active ? "shadow-md" : "opacity-50"
        }`}
      >
        {AGENT_ICONS[agentId]}
      </motion.div>
      <span className="text-[7px] font-mono text-slate-500 text-center leading-tight max-w-[44px] truncate">
        {meta?.name.split(" ")[0]}
      </span>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: AgentMessage }) {
  const isCommander = msg.sender === "commander";
  const colorClass = AGENT_COLORS[msg.sender] ?? "bg-slate-800/50 border-slate-700/50 text-slate-400";
  const badgeClass = MSG_TYPE_BADGE[msg.messageType] ?? "text-slate-500 bg-slate-800";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12, y: 4 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`flex gap-2 ${isCommander ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center ${colorClass}`}>
        {AGENT_ICONS[msg.sender]}
      </div>
      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[78%] ${isCommander ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-mono text-slate-500">{msg.senderName}</span>
          <span className={`text-[7px] font-mono px-1 py-0.5 rounded ${badgeClass}`}>
            {msg.messageType}
          </span>
        </div>
        <div className={`rounded-xl px-3 py-2 border text-[10px] font-mono leading-relaxed ${
          isCommander
            ? "bg-tau-teal/10 border-tau-teal/30 text-tau-teal"
            : "bg-slate-800/60 border-slate-700/40 text-slate-300"
        }`}>
          {msg.content}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const MCAgentComms: React.FC<MCAgentCommsProps> = ({ activeCollaboration, collaborationStatus }) => {
  const messages = activeCollaboration?.discussionSession?.messages ?? [];
  const agentIds = ["navigation", "resource", "safety", "science", "commander"];
  const activeAgents = messages.map(m => m.sender);
  const isAnalyzing = collaborationStatus === "analyzing";

  return (
    <div className="glass-panel rounded-xl border border-tau-teal/20 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-tau-teal/10 shrink-0">
        <h3 className="text-[10px] font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-tau-teal" />
          Agent Communications
        </h3>
        <span className={`text-[8px] font-mono font-bold ${
          isAnalyzing ? "text-amber-400 animate-pulse" :
          collaborationStatus === "resolved" ? "text-emerald-400" : "text-slate-600"
        }`}>
          {isAnalyzing ? "DELIBERATING..." : collaborationStatus === "resolved" ? "CONSENSUS REACHED" : "STANDBY"}
        </span>
      </div>

      {/* Agent seats */}
      <div className="flex items-center justify-around px-4 py-3 border-b border-tau-teal/10 shrink-0 bg-slate-900/30">
        {agentIds.map(id => (
          <AgentSeat key={id} agentId={id} active={activeAgents.includes(id)} />
        ))}
      </div>

      {/* Message feed */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center gap-2 py-8 text-center"
            >
              <MessageSquare className="h-8 w-8 text-slate-700" />
              <p className="text-[10px] font-mono text-slate-500">Agents awaiting mission event.</p>
              <p className="text-[9px] text-slate-600">Communication feed activates when an event is detected.</p>
            </motion.div>
          ) : (
            messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)
          )}
        </AnimatePresence>

        {/* Typing indicator */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-full border border-tau-teal/30 bg-tau-teal/10 flex items-center justify-center">
              <Star className="h-3 w-3 text-tau-teal" />
            </div>
            <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2 flex gap-1">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-tau-teal/60"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Consensus score strip */}
      {activeCollaboration?.discussionSession && (
        <div className="px-4 py-2 border-t border-tau-teal/10 flex items-center justify-between shrink-0 bg-slate-900/30">
          <span className="text-[8px] font-mono text-slate-600 uppercase">Consensus</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-tau-teal rounded-full transition-all duration-700"
                style={{ width: `${activeCollaboration.discussionSession.consensusScore}%` }}
              />
            </div>
            <span className="text-[9px] font-orbitron font-bold text-tau-teal">
              {activeCollaboration.discussionSession.consensusScore}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCAgentComms;
