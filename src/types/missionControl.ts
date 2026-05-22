/**
 * Phase 9 – Mission Control Dashboard
 * Shared prop interface for all MC sub-panels.
 * Phase 10 – HGACS: Human-Governed Anomaly Command System types added.
 */
import type { SpacecraftState } from "../data/spacecraft";
import type { ActiveEvent } from "../data/events";
import type { Decision } from "../data/decisions";
import type { AgentCollaboration, CommanderDecision } from "./agents";
import type { CrewMember } from "./crew";
import type { MissionObjective } from "./objectives";
import type { DiscussionSession } from "./communication";
import type { SimulationResult } from "../digitalTwin/simulateAction";
import type { MissionScore, DecisionQualityRecord, PerformanceSnapshot, ScoringAlerts } from "../scoring/types";

// ─── HGACS Types ────────────────────────────────────────────────────────────

/** Authority levels that govern which actions are available in HGACS */
export type HGACSAuthorityLevel =
  | "Observer"       // Read-only – can view but not authorize
  | "Flight Director"  // Standard – can approve/reject
  | "Mission Commander"; // Elevated – can override and force-execute

/** Workflow steps in the HGACS 5-phase pipeline */
export type HGACSWorkflowStep =
  | "detection"    // Step 1: Anomaly detected & classified
  | "deliberation" // Step 2: Multi-agent analysis
  | "simulation"   // Step 3: Digital Twin / Monte Carlo
  | "xai"          // Step 4: Explainable AI recommendation
  | "governance";  // Step 5: Human authorization

/** A tamper-resistant audit trail entry */
export interface HGACSAuditEntry {
  timestamp: string;
  actor: string;              // "System" | operator name
  action: string;             // "Anomaly detected" | "Approved" | "Rejected" | etc.
  detail: string;
  authorityLevel?: HGACSAuthorityLevel;
}

// ─── Core Anomaly Queue ──────────────────────────────────────────────────────

export interface AnomalyQueueItem {
  id: string;
  timestamp: string;
  event: ActiveEvent;
  recommendation: CommanderDecision | null;
  digitalTwinPredictions: SimulationResult[];
  /** Stored agent collaboration snapshot for this anomaly */
  collaboration?: AgentCollaboration | null;
  status: "Pending" | "Approved" | "Rejected" | "Executed";
  userDecision?: "approved" | "rejected" | "alternative" | "override";
  selectedAction?: string;
  justification?: string;
  finalOutcome?: string;
  /** HGACS audit trail (append-only) */
  auditLog?: HGACSAuditEntry[];
  /** Current HGACS workflow step */
  workflowStep?: HGACSWorkflowStep;
  /** Number of Monte Carlo simulations run */
  runsSimulated?: number;
}

export interface HumanOverrideRecord {
  timestamp: string;
  anomalyId: string;
  anomalyTitle: string;
  userDecision: string;
  selectedAction: string;
  justification: string;
  finalOutcome: string;
  /** Authority level of the authorizing operator */
  authorityLevel?: HGACSAuthorityLevel;
}

export interface MissionControlProps {
  // Core state
  spacecraft: SpacecraftState;
  activeEvent: ActiveEvent | null;
  eventHistory: ActiveEvent[];
  activeDecision: Decision | null;
  decisionHistory: Decision[];
  decisionStatus: "idle" | "analyzing" | "resolved";
  successProbability: number;
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  systemStatus: string;

  // Phase 4 – Agent collaboration
  activeCollaboration: AgentCollaboration | null;
  collaborationStatus: "idle" | "analyzing" | "resolved";

  // Phase 5 – Crew + objectives + discussion
  crew: CrewMember[];
  objectives: MissionObjective[];
  discussionHistory: DiscussionSession[];

  // Phase 7 – Digital Twin
  digitalTwinPredictions: SimulationResult[];
  digitalTwinStatus: "idle" | "analyzing" | "resolved";
  twinCommanderDecision: CommanderDecision | null;
  twinCommanderVerdict: "approved" | "rejected" | null;

  // Phase 8 – Scoring
  missionScore: MissionScore;
  decisionQualityLog: DecisionQualityRecord[];
  performanceHistory: PerformanceSnapshot[];
  scoringAlerts: ScoringAlerts;

  // MARM / HGACS states
  anomalyQueue?: AnomalyQueueItem[];
  humanOverrideLog?: HumanOverrideRecord[];
  safetyWindow?: string;
  timerFallback?: "wait" | "auto";
  timeLeft?: number | null;

  // Handlers
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onApproveTwin: () => void;
  onRejectTwin: () => void;
  onResolveAnomaly?: (
    actionName: string,
    userDecision: "approved" | "rejected" | "alternative" | "override",
    justification: string
  ) => void;
}
