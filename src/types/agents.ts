/**
 * Phase 4 + Phase 5 – Multi-Agent Architecture Type Definitions
 * All shared interfaces for agent recommendations, coordinator payloads,
 * Mission Commander decisions, and Phase 5 discussion sessions.
 */

// ---------------------------------------------------------------------------
// Agent identity constants
// ---------------------------------------------------------------------------
export type AgentId =
  | "navigation"
  | "resource"
  | "safety"
  | "science"
  | "commander";

export interface AgentMeta {
  id: AgentId;
  name: string;
  /** Short subtitle shown in the UI */
  subtitle: string;
  /** Lucide icon name used by the UI layer */
  icon: string;
  /** Tailwind accent colour class used in cards */
  accentColor: string;
}

export const AGENT_META: Record<AgentId, AgentMeta> = {
  navigation: {
    id: "navigation",
    name: "Navigation Agent",
    subtitle: "Route & Trajectory",
    icon: "Compass",
    accentColor: "text-sky-400",
  },
  resource: {
    id: "resource",
    name: "Resource Agent",
    subtitle: "Fuel · Power · O₂",
    icon: "Database",
    accentColor: "text-amber-400",
  },
  safety: {
    id: "safety",
    name: "Safety Agent",
    subtitle: "Crew & Emergency",
    icon: "ShieldAlert",
    accentColor: "text-rose-400",
  },
  science: {
    id: "science",
    name: "Science Agent",
    subtitle: "Discovery & Research",
    icon: "Telescope",
    accentColor: "text-violet-400",
  },
  commander: {
    id: "commander",
    name: "Mission Commander",
    subtitle: "Final Authority",
    icon: "Star",
    accentColor: "text-tau-teal",
  },
};

// ---------------------------------------------------------------------------
// Per-agent recommendation (output of each specialist agent)
// ---------------------------------------------------------------------------
export interface AgentRecommendation {
  agentId: AgentId;
  agentName: string;
  recommendation: string;
  reasoning: string;
  /** 0 – 100 (original, before discussion adjustments) */
  confidence: number;
}

// ---------------------------------------------------------------------------
// Full collaboration payload produced by agentCoordinator
// ---------------------------------------------------------------------------
export interface AgentCollaboration {
  id: string;
  eventId: string;
  eventTitle: string;
  recommendations: AgentRecommendation[];
  /** Populated once the Commander resolves */
  commanderDecision: CommanderDecision | null;
  /** Phase 5 – full inter-agent discussion session (null until resolved) */
  discussionSession: import("./communication").DiscussionSession | null;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Final Mission Commander decision
// ---------------------------------------------------------------------------
export interface CommanderDecision {
  eventId: string;
  eventTitle: string;
  finalAction: string;
  reasoning: string;
  /** IDs of agents whose recommendations influenced this decision */
  contributingAgents: AgentId[];
  timestamp: string;
}
