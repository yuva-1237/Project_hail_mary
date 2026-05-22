/**
 * Communication Types – Phase 5: Agent Communication & Collaborative Deliberation
 * All shared interfaces for inter-agent messaging and discussion sessions.
 */

// ─── Message Types ──────────────────────────────────────────────────────────

export type MessageType =
  | "SUPPORT"
  | "CHALLENGE"
  | "QUESTION"
  | "SUGGESTION"
  | "ESCALATION"
  | "AGREEMENT";

// ─── Agent Message ───────────────────────────────────────────────────────────

export interface AgentMessage {
  id: string;
  /** AgentId of the sending agent */
  sender: string;
  senderName: string;
  /** AgentId of the target agent, or "ALL" for broadcast */
  receiver: string | "ALL";
  receiverName: string;
  messageType: MessageType;
  content: string;
  /** MET timestamp e.g. "00:04:22" */
  timestamp: string;
}

// ─── Confidence Adjustment (post-discussion) ─────────────────────────────────

export interface AdjustedRecommendation {
  agentId: string;
  agentName: string;
  recommendation: string;
  originalConfidence: number;
  adjustedConfidence: number;
  /** Net delta applied during discussion */
  delta: number;
}

// ─── Discussion Session ──────────────────────────────────────────────────────

export interface DiscussionSession {
  id: string;
  eventId: string;
  eventTitle: string;
  messages: AgentMessage[];
  /** Adjusted per-agent recommendations after discussion */
  adjustedRecommendations: AdjustedRecommendation[];
  /** 0 – 100 */
  consensusScore: number;
  /** Label derived from consensus score */
  consensusLabel: string;
  /** Auto-generated human-readable summary of discussion */
  discussionSummary: string;
  /** Agent IDs whose recommendation matches the Commander's final action */
  supportingAgents: string[];
  /** Agent IDs whose recommendation does NOT match Commander's final action */
  opposingAgents: string[];
  /** MET timestamp of the session */
  timestamp: string;
}
