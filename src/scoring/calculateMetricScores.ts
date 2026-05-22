/**
 * Phase 8 – Mission Intelligence & Scoring System
 * Derives the 10 individual metric scores from live spacecraft state.
 */
import type { SpacecraftState } from "../data/spacecraft";
import type { CrewMember } from "../types/crew";
import type { DecisionQualityRecord, MetricScores } from "./types";

/**
 * Calculates all individual metric scores (0-100) from the current mission state.
 */
export function calculateMetricScores(
  spacecraft: SpacecraftState,
  successProbability: number,
  crew: CrewMember[],
  decisionQualityLog: DecisionQualityRecord[],
  elapsedSeconds: number,
  scienceBonus: number = 0
): MetricScores {
  // ── Fuel Efficiency (0-100) ──────────────────────────────────────────────
  const fuelEfficiency = clamp(spacecraft.fuel);

  // ── Power Efficiency (0-100) ─────────────────────────────────────────────
  const powerEfficiency = clamp(spacecraft.power);

  // ── Oxygen Management (0-100) ────────────────────────────────────────────
  const oxygenManagement = clamp(spacecraft.oxygen);

  // ── Safety Score (hull × crew health composite) ──────────────────────────
  const crewAvgHealth =
    crew.length > 0
      ? crew.reduce((sum, c) => sum + c.health, 0) / crew.length
      : 100;
  const safetyScore = clamp(spacecraft.health * 0.6 + crewAvgHealth * 0.4);

  // ── Resource Utilization (average of 3 consumables) ─────────────────────
  const resourceUtilization = clamp(
    (spacecraft.fuel + spacecraft.power + spacecraft.oxygen) / 3
  );

  // ── Science Value (mission progress + investigation bonus) ───────────────
  const scienceValue = clamp(spacecraft.missionProgress + scienceBonus);

  // ── Decision Quality (rolling accuracy average) ──────────────────────────
  let decisionQuality = 85; // default before any decisions
  if (decisionQualityLog.length > 0) {
    const recent = decisionQualityLog.slice(0, 10);
    decisionQuality = clamp(
      recent.reduce((s, r) => s + r.decisionAccuracy, 0) / recent.length
    );
  }

  // ── Time Efficiency (progress vs elapsed time ratio) ────────────────────
  // Ideal: 1% progress per second. Reward faster, penalise slower.
  const ideal = Math.min(elapsedSeconds, 100);
  const progress = spacecraft.missionProgress;
  const timeEfficiency = clamp(
    ideal === 0 ? 100 : Math.min(100, (progress / ideal) * 100)
  );

  // ── Crew Survival Probability ────────────────────────────────────────────
  const crewSurvivalProbability = clamp(
    crew.length > 0
      ? crew.reduce((sum, c) => sum + (c.health > 0 ? 1 : 0), 0) / crew.length * 100
      : 100
  );

  // ── Overall Mission Success ──────────────────────────────────────────────
  const overallSuccessProbability = clamp(successProbability);

  return {
    fuelEfficiency,
    powerEfficiency,
    oxygenManagement,
    safetyScore,
    resourceUtilization,
    scienceValue,
    decisionQuality,
    timeEfficiency,
    crewSurvivalProbability,
    overallSuccessProbability,
  };
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value * 10) / 10));
}
