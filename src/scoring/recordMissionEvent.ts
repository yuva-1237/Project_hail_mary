/**
 * Phase 8 – Mission Intelligence & Scoring System
 * Records a performance timeline snapshot before and after a decision resolves.
 */
import type { PerformanceSnapshot } from "./types";
import type { ActiveEvent } from "../data/events";

/**
 * Creates a PerformanceSnapshot capturing the mission score before and after
 * a decision is applied. Stored in the performance history timeline.
 *
 * @param event        - The active event that triggered the decision
 * @param actionTaken  - The action that was applied
 * @param scoreBefore  - Overall mission score before the action
 * @param scoreAfter   - Overall mission score after the action
 * @param metTimestamp - Current MET string
 */
export function recordMissionEvent(
  event: ActiveEvent,
  actionTaken: string,
  scoreBefore: number,
  scoreAfter: number,
  metTimestamp: string
): PerformanceSnapshot {
  const delta = Math.round((scoreAfter - scoreBefore) * 10) / 10;

  return {
    id: `snap-${Date.now()}`,
    timestamp: metTimestamp,
    eventTitle: event.title,
    actionTaken,
    scoreBefore: Math.round(scoreBefore),
    scoreAfter: Math.round(scoreAfter),
    delta,
    severity: event.severity,
  };
}
