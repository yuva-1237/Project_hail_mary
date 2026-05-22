import type { SpacecraftState } from "../data/spacecraft";
import { getMissionPhase } from "../data/spacecraft";
import type { CrewMember } from "../types/crew";
import { cloneSpacecraftState, cloneCrew } from "./cloneState";
import { SIMULATION_MODELS } from "./simulationModel";
import { calculateSuccessProbability } from "./calculateSuccessProbability";

export interface SimulationResult {
  actionName: string;
  benefits: string;
  risks: string;
  successProbability: number;
  resultingState: SpacecraftState;
  resultingCrew: CrewMember[];
  fuelDelta: number;
  powerDelta: number;
  oxygenDelta: number;
  healthDelta: number;
  progressDelta: number;
  crewHealthDelta: number;
  crewMoraleDelta: number;
  // Phase 13 - Monte Carlo metrics
  monteCarloIterations?: number;
  riskDistribution?: {
    criticalRisk: number; // < 40% success
    moderateRisk: number; // 40-75% success
    safe: number;         // > 75% success
  };
}

/**
 * Runs a Digital Twin sandbox simulation for a single action under a given event.
 */
export function simulateAction(
  state: SpacecraftState,
  crew: CrewMember[],
  eventTitle: string,
  actionName: string,
  currentSuccessProbability: number
): SimulationResult | null {
  const eventModel = SIMULATION_MODELS[eventTitle];
  if (!eventModel) return null;

  const effects = eventModel[actionName];
  if (!effects) return null;

  // Clone telemetry inputs
  const nextState = cloneSpacecraftState(state);
  const nextCrew = cloneCrew(crew);

  // Apply changes to spacecraft resources
  nextState.fuel = Math.max(0, Math.min(100, nextState.fuel + effects.fuelDelta));
  nextState.power = Math.max(0, Math.min(100, nextState.power + effects.powerDelta));
  nextState.oxygen = Math.max(0, Math.min(100, nextState.oxygen + effects.oxygenDelta));
  nextState.health = Math.max(0, Math.min(100, nextState.health + effects.healthDelta));
  nextState.missionProgress = Math.max(0, Math.min(100, nextState.missionProgress + effects.progressDelta));

  // Handle velocity changes
  const phase = getMissionPhase(nextState.missionProgress);
  if (effects.velocityRestore) {
    nextState.velocity = phase.velocity;
  } else if (effects.velocityDelta !== undefined) {
    nextState.velocity = Math.max(0, nextState.velocity + effects.velocityDelta);
  }

  // Handle communication restore
  if (effects.communicationRestore) {
    nextState.communication = true;
  }

  // Handle crew changes
  for (const member of nextCrew) {
    if (effects.crewHealthDelta !== 0) {
      member.health = Math.max(0, Math.min(100, member.health + effects.crewHealthDelta));
    }
    if (effects.crewMoraleDelta !== 0) {
      member.morale = Math.max(0, Math.min(100, member.morale + effects.crewMoraleDelta));
    }
  }

  // Phase 13: Monte Carlo Engine Simulation (1000 iterations)
  const iterations = 1000;
  let criticalRiskCount = 0;
  let moderateRiskCount = 0;
  let safeCount = 0;
  let cumulativeSuccess = 0;

  for (let i = 0; i < iterations; i++) {
    // Inject +/- 15% noise into the effects
    const noiseMultiplier = 0.85 + Math.random() * 0.3;
    const noisyState = cloneSpacecraftState(state);
    
    noisyState.fuel = Math.max(0, Math.min(100, noisyState.fuel + effects.fuelDelta * noiseMultiplier));
    noisyState.power = Math.max(0, Math.min(100, noisyState.power + effects.powerDelta * noiseMultiplier));
    noisyState.oxygen = Math.max(0, Math.min(100, noisyState.oxygen + effects.oxygenDelta * noiseMultiplier));
    noisyState.health = Math.max(0, Math.min(100, noisyState.health + effects.healthDelta * noiseMultiplier));
    
    const iterSuccess = calculateSuccessProbability(currentSuccessProbability, effects, noisyState);
    cumulativeSuccess += iterSuccess;

    if (iterSuccess < 40) criticalRiskCount++;
    else if (iterSuccess < 75) moderateRiskCount++;
    else safeCount++;
  }

  // Compute final average success from Monte Carlo
  const finalSuccess = cumulativeSuccess / iterations;

  // Format numbers to match standard 1 decimal place format
  nextState.fuel = parseFloat(nextState.fuel.toFixed(1));
  nextState.power = parseFloat(nextState.power.toFixed(1));
  nextState.oxygen = parseFloat(nextState.oxygen.toFixed(1));
  nextState.health = parseFloat(nextState.health.toFixed(1));
  nextState.missionProgress = parseFloat(nextState.missionProgress.toFixed(1));
  nextState.velocity = parseFloat(nextState.velocity.toFixed(1));

  return {
    actionName,
    benefits: effects.benefits,
    risks: effects.risks,
    successProbability: finalSuccess,
    resultingState: nextState,
    resultingCrew: nextCrew,
    fuelDelta: effects.fuelDelta,
    powerDelta: effects.powerDelta,
    oxygenDelta: effects.oxygenDelta,
    healthDelta: effects.healthDelta,
    progressDelta: effects.progressDelta,
    crewHealthDelta: effects.crewHealthDelta,
    crewMoraleDelta: effects.crewMoraleDelta,
    monteCarloIterations: iterations,
    riskDistribution: {
      criticalRisk: parseFloat(((criticalRiskCount / iterations) * 100).toFixed(1)),
      moderateRisk: parseFloat(((moderateRiskCount / iterations) * 100).toFixed(1)),
      safe: parseFloat(((safeCount / iterations) * 100).toFixed(1)),
    }
  };
}
