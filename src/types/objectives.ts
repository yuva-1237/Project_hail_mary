/**
 * Mission Objective Types – Phase 5
 */

export type ObjectiveStatus = "locked" | "active" | "complete" | "failed";
export type ObjectiveCategory = "navigation" | "resource" | "safety" | "science" | "mission";

export interface MissionObjective {
  id: string;
  title: string;
  description: string;
  category: ObjectiveCategory;
  status: ObjectiveStatus;
  /** 0 – 100 completion percentage */
  progress: number;
  /** Optional: the event title that triggers this objective when resolved */
  triggerEvent?: string;
  /** Optional: the decision action that completes this objective */
  triggerAction?: string;
  /** Optional: spacecraft metric threshold to complete */
  progressThreshold?: number;
  /** Bonus to success probability on completion */
  successBonus: number;
}
