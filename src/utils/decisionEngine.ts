import type { ActiveEvent } from "../data/events";
import { DECISION_TEMPLATES } from "../data/decisions";
import type { Decision } from "../data/decisions";
import type { SpacecraftState } from "../data/spacecraft";

/**
 * Creates a completed Decision object based on the triggered event.
 * @param activeEvent The current active event.
 * @param metString The current formatted Mission Elapsed Time.
 * @returns The fully constructed Decision object.
 */
export function evaluateEventDecision(
  activeEvent: ActiveEvent,
  metString: string
): Decision {
  const template = DECISION_TEMPLATES[activeEvent.title];

  if (!template) {
    // Fallback if template is not found (e.g. custom event)
    return {
      id: `dec-${Date.now()}`,
      eventId: activeEvent.id,
      eventTitle: activeEvent.title,
      availableActions: ["Analyze", "Monitor", "Ignore"],
      selectedAction: "Analyze",
      reasoning: "Running default diagnostic routine on unidentified telemetry.",
      outcome: "System stabilized. Diagnostic logs filed.",
      timestamp: metString,
      successImpact: 1,
    };
  }

  return {
    id: `dec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    eventId: activeEvent.id,
    eventTitle: activeEvent.title,
    availableActions: template.availableActions,
    selectedAction: template.selectedAction,
    reasoning: template.reasoning,
    outcome: template.outcome,
    timestamp: metString,
    successImpact: template.successImpact,
  };
}

/**
 * Calculates and applies resource changes based on the decision outcome.
 * @param decision The resolved Decision object.
 * @param state The current SpacecraftState before decision.
 * @param nominalVelocity The target velocity for the current mission progress.
 * @returns The modified SpacecraftState.
 */
export function applyDecisionOutcome(
  decision: Decision,
  state: SpacecraftState,
  nominalVelocity: number
): SpacecraftState {
  const template = DECISION_TEMPLATES[decision.eventTitle];
  if (!template) return state;

  const ef = template.effects;
  const nextState = { ...state };

  if (ef.fuel !== undefined) {
    nextState.fuel = Math.min(nextState.fuel + ef.fuel, 100);
  }
  if (ef.power !== undefined) {
    nextState.power = Math.min(nextState.power + ef.power, 100);
  }
  if (ef.oxygen !== undefined) {
    nextState.oxygen = Math.min(nextState.oxygen + ef.oxygen, 100);
  }
  if (ef.health !== undefined) {
    nextState.health = Math.min(nextState.health + ef.health, 100);
  }
  if (ef.velocityRestore) {
    nextState.velocity = nominalVelocity;
  }
  if (ef.velocityDelta !== undefined) {
    nextState.velocity = Math.max(nextState.velocity + ef.velocityDelta, 0);
  }
  if (ef.missionProgress !== undefined) {
    nextState.missionProgress = Math.min(nextState.missionProgress + ef.missionProgress, 100);
  }
  if (ef.communicationRestore) {
    nextState.communication = true;
  }

  // Format all floats to 1 decimal place to match Phase 1/2 formatting
  nextState.fuel = parseFloat(nextState.fuel.toFixed(1));
  nextState.power = parseFloat(nextState.power.toFixed(1));
  nextState.oxygen = parseFloat(nextState.oxygen.toFixed(1));
  nextState.health = parseFloat(nextState.health.toFixed(1));
  nextState.missionProgress = parseFloat(nextState.missionProgress.toFixed(1));
  nextState.velocity = parseFloat(nextState.velocity.toFixed(1));

  return nextState;
}
