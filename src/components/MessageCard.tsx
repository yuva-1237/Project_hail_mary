/**
 * MessageCard – Phase 5
 * A single inter-agent message rendered as a glassmorphism card
 * with sender/receiver info, message-type badge, and slide-in animation.
 */
import React from "react";
import {
  ThumbsUp, AlertTriangle, HelpCircle, Lightbulb, Siren, CheckCheck,
  Compass, Database, ShieldAlert, Telescope,
} from "lucide-react";
import type { AgentMessage, MessageType } from "../types/communication";

interface MessageCardProps {
  message: AgentMessage;
  index: number;
}

// ─── Message type visual config ───────────────────────────────────────────────

const MSG_STYLES: Record<
  MessageType,
  { label: string; icon: React.ReactNode; border: string; badge: string; text: string }
> = {
  SUPPORT: {
    label: "SUPPORT",
    icon: <ThumbsUp className="h-3 w-3" />,
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    text: "text-emerald-300",
  },
  AGREEMENT: {
    label: "AGREEMENT",
    icon: <CheckCheck className="h-3 w-3" />,
    border: "border-sky-500/30",
    badge: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
    text: "text-sky-300",
  },
  QUESTION: {
    label: "QUESTION",
    icon: <HelpCircle className="h-3 w-3" />,
    border: "border-amber-500/30",
    badge: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    text: "text-amber-300",
  },
  SUGGESTION: {
    label: "SUGGESTION",
    icon: <Lightbulb className="h-3 w-3" />,
    border: "border-violet-500/30",
    badge: "bg-violet-500/15 text-violet-300 border border-violet-500/30",
    text: "text-violet-300",
  },
  CHALLENGE: {
    label: "CHALLENGE",
    icon: <AlertTriangle className="h-3 w-3" />,
    border: "border-orange-500/30",
    badge: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
    text: "text-orange-300",
  },
  ESCALATION: {
    label: "ESCALATION",
    icon: <Siren className="h-3 w-3" />,
    border: "border-rose-500/40",
    badge: "bg-rose-500/20 text-rose-300 border border-rose-500/40",
    text: "text-rose-300",
  },
};

// ─── Agent icon map ───────────────────────────────────────────────────────────

function AgentIcon({ agentId }: { agentId: string }) {
  const cls = "h-3.5 w-3.5 shrink-0";
  switch (agentId) {
    case "navigation": return <Compass    className={`${cls} text-sky-400`}    />;
    case "resource":   return <Database   className={`${cls} text-amber-400`}  />;
    case "safety":     return <ShieldAlert className={`${cls} text-rose-400`}  />;
    case "science":    return <Telescope  className={`${cls} text-violet-400`} />;
    default:           return <CheckCheck className={`${cls} text-tau-teal`}   />;
  }
}

const MessageCard: React.FC<MessageCardProps> = ({ message, index }) => {
  const style = MSG_STYLES[message.messageType];
  const isEscalation = message.messageType === "ESCALATION";

  return (
    <div
      className={`
        glass-panel rounded-lg border p-3 flex flex-col gap-2 relative overflow-hidden
        ${style.border}
        ${isEscalation ? "shadow-[0_0_12px_rgba(239,68,68,0.12)]" : ""}
        animate-[slideInUp_0.35s_ease-out_both]
      `}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Escalation pulse stripe */}
      {isEscalation && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-rose-500 animate-pulse" />
      )}

      {/* Header row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Sender */}
        <div className="flex items-center gap-1.5 shrink-0">
          <AgentIcon agentId={message.sender} />
          <span className="text-[10px] font-mono font-bold text-white">
            {message.senderName}
          </span>
        </div>

        {/* Arrow */}
        <span className="text-[9px] text-slate-600 font-mono shrink-0">→</span>

        {/* Receiver */}
        <span className="text-[10px] font-mono text-slate-400 shrink-0">
          {message.receiverName}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Message type badge */}
        <span
          className={`flex items-center gap-1 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full ${style.badge}`}
        >
          {style.icon}
          {style.label}
        </span>
      </div>

      {/* Message content */}
      <p className="text-[11px] text-slate-300 leading-relaxed font-mono pl-0.5">
        "{message.content}"
      </p>

      {/* Timestamp */}
      <span className="text-[9px] text-slate-600 font-mono self-end">
        MET {message.timestamp}
      </span>
    </div>
  );
};

export default MessageCard;
