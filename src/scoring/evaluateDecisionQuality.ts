/**
 * Phase 8 – Mission Intelligence & Scoring System
 * Evaluates the quality of a Commander agent decision by comparing
 * predicted vs actual success probability.
 */
import type { DecisionQualityRecord } from "./types";

/**
 * Creates a DecisionQualityRecord after a Digital Twin decision resolves.
 *
 * @param eventTitle       - Title of the triggering event
 * @param selectedAction   - The action the Commander chose
 * @param predicted        - The success probability predicted by the Digital Twin
 * @param actual           - The actual mission success probability after applying the action
 * @param verdict          - Whether the decision was auto-applied, approved, or rejected
 * @param metTimestamp     - Current MET string
 */
export function evaluateDecisionQuality(
  eventTitle: string,
  selectedAction: string,
  predicted: number,
  actual: number,
  verdict: DecisionQualityRecord["verdict"],
  metTimestamp: string
): DecisionQualityRecord {
  // Accuracy = how close the prediction was (100 = perfect, 0 = 100% off)
  const rawAccuracy = 100 - Math.abs(predicted - actual);
  const decisionAccuracy = Math.max(0, Math.min(100, Math.round(rawAccuracy)));

  return {
    id: `dq-${Date.now()}`,
    timestamp: metTimestamp,
    eventTitle,
    selectedAction,
    predictedSuccessProbability: Math.round(predicted),
    actualSuccessProbability: Math.round(actual),
    decisionAccuracy,
    verdict,
  };
}

/**
 * Computes the rolling average decision accuracy from a log (most recent first).
 */
export function rollingDecisionAccuracy(
  log: DecisionQualityRecord[],
  windowSize = 10
): number {
  if (log.length === 0) return 85;
  const recent = log.slice(0, windowSize);
  return Math.round(
    recent.reduce((sum, r) => sum + r.decisionAccuracy, 0) / recent.length
  );
}
