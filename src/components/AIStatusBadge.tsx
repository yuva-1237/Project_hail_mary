/**
 * AIStatusBadge – Phase 6
 * Small inline badge displaying the current AI pipeline status.
 */
import React from "react";
import { Brain, Loader2, CheckCircle2, AlertTriangle, WifiOff } from "lucide-react";
import type { AIStatus } from "../ai/types";

interface AIStatusBadgeProps {
  status: AIStatus;
  isFallback?: boolean;
  compact?: boolean;
}

const STATUS_CONFIG: Record<
  AIStatus,
  { label: string; icon: React.ReactNode; cls: string }
> = {
  offline:  { label: "Offline",       icon: <WifiOff className="h-3 w-3" />,                                  cls: "text-slate-500 border-slate-700/50 bg-slate-800/30" },
  thinking: { label: "Thinking...",   icon: <Loader2 className="h-3 w-3 animate-spin" />,                     cls: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  ready:    { label: "Ready",         icon: <CheckCircle2 className="h-3 w-3" />,                             cls: "text-cyber-green border-cyber-green/30 bg-cyber-green/10" },
  fallback: { label: "Fallback Mode", icon: <AlertTriangle className="h-3 w-3" />,                            cls: "text-orange-400 border-orange-500/30 bg-orange-500/10" },
  error:    { label: "Error",         icon: <AlertTriangle className="h-3 w-3" />,                            cls: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
};

const AIStatusBadge: React.FC<AIStatusBadgeProps> = ({ status, isFallback, compact = false }) => {
  const resolved = isFallback ? "fallback" : status;
  const cfg = STATUS_CONFIG[resolved] ?? STATUS_CONFIG.offline;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold ${cfg.cls}`}>
        {cfg.icon}
        {cfg.label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      <Brain className="h-3 w-3 shrink-0" />
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

export default AIStatusBadge;
