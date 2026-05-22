import type { SpacecraftState } from "../data/spacecraft";
import type { SimulatedActionEffects } from "./simulationModel";

/**
 * Calculates a dynamic mission success probability based on the base success rate,
 * the action success impact, and post-action spacecraft resource parameters.
 */
export function calculateSuccessProbability(
  currentSuccess: number,
  effects: SimulatedActionEffects,
  resultingState: SpacecraftState
): number {
  // Base update from the action's standard impact
  let simulatedScore = currentSuccess + effects.successImpact;

  // Dynamic Resource Warnings (Digital Twin state awareness)
  if (resultingState.fuel <= 20) {
    simulatedScore -= 10; // Low fuel penalty
  }
  if (resultingState.power <= 20) {
    simulatedScore -= 10; // Low reactor battery penalty
  }
  if (resultingState.oxygen <= 20) {
    simulatedScore -= 15; // Low air levels penalty
  }
  if (resultingState.health <= 30) {
    simulatedScore -= 15; // Critical hull integrity warning
  }

  // Fatal state penalty (zero resources)
  if (resultingState.fuel === 0 || resultingState.power === 0 || resultingState.oxygen === 0 || resultingState.health === 0) {
    simulatedScore -= 25;
  }

  return Math.max(0, Math.min(100, simulatedScore));
}
