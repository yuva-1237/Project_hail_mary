/**
 * Crew Member Types – Phase 5
 */

export type CrewRole = "Commander" | "Pilot" | "Engineer" | "Science Officer";
export type CrewStatus = "nominal" | "fatigued" | "injured" | "critical";

export interface CrewMember {
  id: string;
  name: string;
  role: CrewRole;
  /** 0 – 100 */
  health: number;
  /** 0 – 100 */
  morale: number;
  /** Short specialty tag shown on the card */
  specialty: string;
  /** Assigned agent domain */
  agentDomain: string;
}

/** Effects applied to a crew member by events or decisions */
export interface CrewEffect {
  healthDelta?: number;
  moraleDelta?: number;
}

/** Per-event crew effects keyed by event title */
export type CrewEventEffects = Record<string, CrewEffect>;
