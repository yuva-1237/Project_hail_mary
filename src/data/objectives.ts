/**
 * Mission Objectives Data – Phase 5
 * Six objectives covering all agent domains.
 */
import type { MissionObjective, ObjectiveStatus } from "../types/objectives";

export const INITIAL_OBJECTIVES: MissionObjective[] = [
  {
    id: "obj-boot",
    title: "System Boot Sequence",
    description: "Initialize all spacecraft systems and confirm operational readiness.",
    category: "mission",
    status: "active",
    progress: 0,
    successBonus: 2,
  },
  {
    id: "obj-survive-critical",
    title: "Survive Critical Event",
    description: "Successfully navigate any critical-severity mission event.",
    category: "safety",
    status: "active",
    progress: 0,
    successBonus: 3,
  },
  {
    id: "obj-scan-object",
    title: "Scan Unknown Object",
    description: "Detect an unknown object and dispatch a spectroscopic scan for analysis.",
    category: "science",
    status: "active",
    progress: 0,
    triggerEvent: "Unknown Object Detected",
    triggerAction: "Scan Object",
    successBonus: 4,
  },
  {
    id: "obj-halfway",
    title: "50% Mission Threshold",
    description: "Reach the halfway point of the journey to Tau Ceti.",
    category: "navigation",
    status: "active",
    progress: 0,
    progressThreshold: 50,
    successBonus: 3,
  },
  {
    id: "obj-restore-comms",
    title: "Restore Communications",
    description: "Re-establish a lost communication link with mission control.",
    category: "resource",
    status: "active",
    progress: 0,
    triggerEvent: "Communication Loss",
    triggerAction: "Use Backup Antenna",
    successBonus: 2,
  },
  {
    id: "obj-tau-ceti",
    title: "Tau Ceti Approach",
    description: "Reach the Tau Ceti system approach corridor at 85% mission progress.",
    category: "navigation",
    status: "active",
    progress: 0,
    progressThreshold: 85,
    successBonus: 5,
  },
];

/**
 * Evaluates and updates all objectives based on current mission state.
 * Returns new objectives array and total success bonus earned this tick.
 */
export function evaluateObjectives(
  objectives: MissionObjective[],
  missionProgress: number,
  lastDecisionAction: string | null,
  lastEventTitle: string | null,
  lastEventSeverity: string | null,
  bootComplete: boolean
): { objectives: MissionObjective[]; bonusEarned: number } {
  let bonusEarned = 0;

  const updated = objectives.map((obj) => {
    if (obj.status === "complete" || obj.status === "failed") return obj;

    let newStatus: ObjectiveStatus = obj.status;
    let newProgress = obj.progress;

    // Boot sequence — complete once simulation starts
    if (obj.id === "obj-boot" && bootComplete && obj.progress < 100) {
      newProgress = 100;
      newStatus = "complete";
      bonusEarned += obj.successBonus;
    }

    // Progress threshold objectives
    if (obj.progressThreshold !== undefined && missionProgress >= obj.progressThreshold) {
      newProgress = 100;
      newStatus = "complete";
      bonusEarned += obj.successBonus;
    }

    // Event + action trigger objectives
    if (
      obj.triggerEvent &&
      obj.triggerAction &&
      lastEventTitle === obj.triggerEvent &&
      lastDecisionAction === obj.triggerAction
    ) {
      newProgress = 100;
      newStatus = "complete";
      bonusEarned += obj.successBonus;
    }

    // Survive critical event — any critical event with a resolved decision
    if (
      obj.id === "obj-survive-critical" &&
      lastEventSeverity === "Critical" &&
      lastDecisionAction !== null
    ) {
      newProgress = 100;
      newStatus = "complete";
      bonusEarned += obj.successBonus;
    }

    // Update progress bar for threshold-based ones
    if (obj.progressThreshold !== undefined && newStatus !== "complete") {
      newProgress = Math.min(99, Math.round((missionProgress / obj.progressThreshold) * 100));
    }

    return { ...obj, status: newStatus, progress: newProgress };
  });

  return { objectives: updated, bonusEarned };
}
