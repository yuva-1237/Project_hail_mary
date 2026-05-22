/**
 * Phase 8 – Mission Intelligence & Scoring System
 * Checks metric thresholds and returns alert flags.
 */
import type { MetricScores, ScoringAlerts } from "./types";

const THRESHOLDS = {
  lowSafety: 50,
  lowFuel: 30,
  lowSuccess: 40,
} as const;

/**
 * Evaluates the current metric scores against defined alert thresholds.
 * Returns a ScoringAlerts object with boolean flags.
 */
export function checkAlerts(metrics: MetricScores): ScoringAlerts {
  const lowSafety  = metrics.safetyScore              < THRESHOLDS.lowSafety;
  const lowFuel    = metrics.fuelEfficiency            < THRESHOLDS.lowFuel;
  const lowSuccess = metrics.overallSuccessProbability < THRESHOLDS.lowSuccess;

  // Critical mode: two or more alerts firing simultaneously
  const alertCount = [lowSafety, lowFuel, lowSuccess].filter(Boolean).length;
  const criticalMode = alertCount >= 2;

  return { lowSafety, lowFuel, lowSuccess, criticalMode };
}
