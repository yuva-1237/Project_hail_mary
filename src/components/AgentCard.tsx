/**
 * AgentCard – Phase 4
 * Individual glassmorphism card for a single agent's recommendation.
 * Fades in with a staggered delay and shows a confidence bar.
 */
import React, { useEffect, useState } from "react";
import {
  Compass,
  Database,
  ShieldAlert,
  Telescope,
  Star,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import type { AgentRecommendation, AgentId } from "../types/agents";
import ConfidenceBar from "./ConfidenceBar";

interface AgentCardProps {
  recommendation: AgentRecommendation;
  /** Whether this agent's recommendation was chosen by the Commander */
  isSelected: boolean;
  /** Stagger index for the fade-in animation */
  staggerIndex: number;
  /** True while agents are still being "revealed" sequentially */
  isRevealing: boolean;
}

// Map agent IDs to their icon components
const AGENT_ICONS: Record<AgentId, React.ReactNode> = {
  navigation: <Compass className="h-4 w-4" />,
  resource: <Database className="h-4 w-4" />,
  safety: <ShieldAlert className="h-4 w-4" />,
  science: <Telescope className="h-4 w-4" />,
  commander: <Star className="h-4 w-4" />,
};

// Tailwind accent classes per agent
const AGENT_ACCENTS: Record<AgentId, { text: string; border: string; bg: string }> = {
  navigation: {
    text: "text-sky-400",
    border: "border-sky-500/40",
    bg: "bg-sky-500/10",
  },
  resource: {
    text: "text-amber-400",
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
  },
  safety: {
    text: "text-rose-400",
    border: "border-rose-500/40",
    bg: "bg-rose-500/10",
  },
  science: {
    text: "text-violet-400",
    border: "border-violet-500/40",
    bg: "bg-violet-500/10",
  },
  commander: {
    text: "text-tau-teal",
    border: "border-tau-teal/40",
    bg: "bg-tau-teal/10",
  },
};

const AgentCard: React.FC<AgentCardProps> = ({
  recommendation,
  isSelected,
  staggerIndex,
  isRevealing,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reset and re-trigger on new recommendations
    setVisible(false);
    const t = setTimeout(() => setVisible(true), staggerIndex * 220 + 80);
    return () => clearTimeout(t);
  }, [recommendation.recommendation, staggerIndex]);

  const accent = AGENT_ACCENTS[recommendation.agentId] ?? AGENT_ACCENTS.navigation;
  const icon = AGENT_ICONS[recommendation.agentId] ?? <Star className="h-4 w-4" />;

  const isNoAction =
    recommendation.recommendation === "No Action" ||
    recommendation.recommendation === "Monitor Risk" ||
    recommendation.recommendation === "Monitor Systems";

  return (
    <div
      className={`
        glass-panel rounded-lg border p-3.5 flex flex-col gap-2 relative overflow-hidden
        transition-all duration-500 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
        ${isSelected
          ? `${accent.border} ${accent.bg} ring-1 ring-inset ring-tau-teal/30`
          : "border-slate-700/50"
        }
        ${isRevealing && !visible ? "pointer-events-none" : ""}
      `}
    >
      {/* Corner decorations */}
      <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${accent.border}`} />
      <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${accent.border}`} />

      {/* Selected badge */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-cyber-green" />
        </div>
      )}

      {/* Agent header */}
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-md ${accent.bg} ${accent.text}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[11px] font-mono font-bold uppercase tracking-wider ${accent.text}`}>
            {recommendation.agentName}
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="flex items-center gap-1.5">
        <ArrowRight className={`h-3 w-3 shrink-0 ${isNoAction ? "text-slate-500" : accent.text}`} />
        <span
          className={`text-[12px] font-semibold ${
            isNoAction ? "text-slate-500 italic" : "text-white"
          }`}
        >
          {recommendation.recommendation}
        </span>
      </div>

      {/* Reasoning */}
      <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
        {recommendation.reasoning}
      </p>

      {/* Confidence bar */}
      <div className="mt-auto pt-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
            Confidence
          </span>
        </div>
        <ConfidenceBar
          confidence={recommendation.confidence}
          animationDelay={staggerIndex * 220}
        />
      </div>
    </div>
  );
};

export default AgentCard;
