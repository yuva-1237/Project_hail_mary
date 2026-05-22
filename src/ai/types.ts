/**
 * AI Types – Phase 6: LLM Reasoning Layer
 * Core TypeScript interfaces for provider abstraction, request/response,
 * analysis records, and persistent configuration.
 */
import type { SpacecraftState } from "../data/spacecraft";
import type { ActiveEvent } from "../data/events";
import type { AgentRecommendation } from "../types/agents";

// ─── Enum-style literals ──────────────────────────────────────────────────────

export type AIProvider      = "mock" | "openai" | "anthropic" | "gemini";
export type AIStatus        = "offline" | "thinking" | "ready" | "fallback" | "error";
export type DecisionMode    = "auto" | "manual";
export type CommanderVerdict = "approved" | "modified" | "rejected";

// ─── Request ──────────────────────────────────────────────────────────────────

/** Everything the LLM needs to reason about a mission event. */
export interface AIReasoningRequest {
  spacecraft: SpacecraftState;
  event: ActiveEvent;
  recommendations: AgentRecommendation[];
  discussionSummary: string;
  consensusScore: number;
  successProbability: number;
}

// ─── Response (structured JSON from LLM) ─────────────────────────────────────

export interface AIReasoningResponse {
  /** One-line action string */
  selectedAction: string;
  /** Full natural-language reasoning (2-3 sentences) */
  reasoning: string;
  /** Confidence in the selected action: 0 – 100 */
  confidence: number;
  /** Up to 5 identified risks */
  risks: string[];
  /** One-sentence mission impact prediction */
  predictedImpact: string;
  /** Additive adjustment to successProbability: -10 to +10 */
  successAdjustment: number;
}

// ─── Analysis record (stored in history) ─────────────────────────────────────

export interface AIAnalysis {
  id: string;
  eventId: string;
  eventTitle: string;
  response: AIReasoningResponse;
  provider: AIProvider;
  responseTimeMs: number;
  /** null while pending commander review in manual mode */
  commanderVerdict: CommanderVerdict | null;
  isFallback: boolean;
  timestamp: string;
}

// ─── Provider interface ───────────────────────────────────────────────────────

export interface AIProviderInterface {
  readonly name: AIProvider;
  readonly displayName: string;
  call(prompt: string): Promise<AIReasoningResponse>;
  testConnection(): Promise<boolean>;
}

// ─── Persistent settings (localStorage) ──────────────────────────────────────

export interface AIConfiguration {
  provider: AIProvider;
  decisionMode: DecisionMode;
  openaiApiKey: string;
  anthropicApiKey: string;
  geminiApiKey: string;
}

export const DEFAULT_AI_CONFIG: AIConfiguration = {
  provider: "mock",
  decisionMode: "auto",
  openaiApiKey: "",
  anthropicApiKey: "",
  geminiApiKey: "",
};

export const AI_CONFIG_STORAGE_KEY = "hm_ai_config_v1";
