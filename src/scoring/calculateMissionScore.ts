/**
 * Phase 8 – Mission Intelligence & Scoring System
 * Calculates the weighted composite Mission Score from individual metrics.
 */
import type { MetricScores, MissionScore } from "./types";
import { METRIC_WEIGHTS } from "./types";

/**
 * Computes the overall weighted mission score and assigns a grade + trend.
 */
export function calculateMissionScore(
  metrics: MetricScores,
  previousOverall: number,
  metTimestamp: string
): MissionScore {
  // Weighted composite using the 6 primary metrics
  const overall = Math.round(
    metrics.safetyScore              * METRIC_WEIGHTS.safetyScore +
    metrics.decisionQuality          * METRIC_WEIGHTS.decisionQuality +
    metrics.scienceValue             * METRIC_WEIGHTS.scienceValue +
    metrics.fuelEfficiency           * METRIC_WEIGHTS.fuelEfficiency +
    metrics.resourceUtilization      * METRIC_WEIGHTS.resourceUtilization +
    metrics.overallSuccessProbability * METRIC_WEIGHTS.overallSuccessProbability
  );

  const grade = scoreToGrade(overall);
  const trend = getTrend(overall, previousOverall);

  return {
    overall,
    metrics,
    grade,
    trend,
    previousOverall,
    lastUpdated: metTimestamp,
  };
}

function scoreToGrade(score: number): MissionScore["grade"] {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

function getTrend(
  current: number,
  previous: number
): MissionScore["trend"] {
  const delta = current - previous;
  if (delta > 1) return "improving";
  if (delta < -1) return "declining";
  return "stable";
}
