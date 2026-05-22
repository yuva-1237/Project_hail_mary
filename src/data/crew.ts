/**
 * Crew Data – Phase 5
 * Defines the four crew members and the event-based crew effects.
 */
import type { CrewMember, CrewEventEffects } from "../types/crew";

export const INITIAL_CREW: CrewMember[] = [
  {
    id: "crew-1",
    name: "Capt. Sarah Chen",
    role: "Commander",
    health: 100,
    morale: 100,
    specialty: "Mission Operations",
    agentDomain: "Mission Commander",
  },
  {
    id: "crew-2",
    name: "Lt. Yemi Okafor",
    role: "Pilot",
    health: 100,
    morale: 100,
    specialty: "Navigation & Propulsion",
    agentDomain: "Navigation Agent",
  },
  {
    id: "crew-3",
    name: "Eng. Priya Mehta",
    role: "Engineer",
    health: 100,
    morale: 100,
    specialty: "Systems & Power",
    agentDomain: "Resource Agent",
  },
  {
    id: "crew-4",
    name: "Dr. Mark Watney",
    role: "Science Officer",
    health: 100,
    morale: 100,
    specialty: "Astrobiology & Research",
    agentDomain: "Science Agent",
  },
];

/**
 * Event effects on crew (health and morale deltas — negative = damage).
 * Applied at the moment an event fires.
 */
export const CREW_EVENT_EFFECTS: CrewEventEffects = {
  "Fuel Leak":             { moraleDelta: -5 },
  "Solar Storm":           { healthDelta: -8,  moraleDelta: -10 },
  "Engine Failure":        { moraleDelta: -12 },
  "Oxygen Leak":           { healthDelta: -12, moraleDelta: -15 },
  "Battery Failure":       { moraleDelta: -8  },
  "Navigation Error":      { moraleDelta: -6  },
  "Radiation Spike":       { healthDelta: -10, moraleDelta: -8  },
  "Communication Loss":    { moraleDelta: -5  },
  "Asteroid Field":        { healthDelta: -7,  moraleDelta: -10 },
  "Unknown Object Detected": { moraleDelta: 8 },   // positive — excitement!
};

/**
 * Decision effects on crew — applied when a decision is resolved.
 */
export const CREW_DECISION_EFFECTS: CrewEventEffects = {
  "Fuel Leak":             { moraleDelta: 5  },
  "Solar Storm":           { healthDelta: 6,  moraleDelta: 8  },
  "Engine Failure":        { moraleDelta: 10 },
  "Oxygen Leak":           { healthDelta: 10, moraleDelta: 12 },
  "Battery Failure":       { moraleDelta: 8  },
  "Navigation Error":      { moraleDelta: 6  },
  "Radiation Spike":       { healthDelta: 8,  moraleDelta: 7  },
  "Communication Loss":    { moraleDelta: 6  },
  "Asteroid Field":        { healthDelta: 5,  moraleDelta: 8  },
  "Unknown Object Detected": { moraleDelta: 5 },
};

/**
 * Computes the crew status label from health & morale values.
 */
export function getCrewStatus(health: number, morale: number) {
  if (health < 25) return "critical";
  if (health < 50 || morale < 30) return "injured";
  if (morale < 55) return "fatigued";
  return "nominal";
}

/**
 * Applies a CrewEventEffects delta to a crew array, clamped to [0, 100].
 */
export function applyCrewEffect(
  crew: CrewMember[],
  effect: { healthDelta?: number; moraleDelta?: number }
): CrewMember[] {
  return crew.map((member) => ({
    ...member,
    health: Math.min(100, Math.max(0, member.health + (effect.healthDelta ?? 0))),
    morale: Math.min(100, Math.max(0, member.morale + (effect.moraleDelta ?? 0))),
  }));
}
