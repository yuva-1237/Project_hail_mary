import type { ActiveEvent } from "../data/events";
import { generateRandomEvent } from "./eventGenerator";
import { BLACK_SWAN_EVENTS } from "../data/blackSwanEvents";

export type JudgeScenarioType = "Oxygen Leak" | "Asteroid Strike" | "Dual Failure" | "Black Swan";

export const injectJudgeScenario = (scenario: JudgeScenarioType, metString: string): ActiveEvent => {
  if (scenario === "Oxygen Leak") {
    return {
      id: `judge-oxy-${Date.now()}`,
      title: "Oxygen Leak",
      description: "JUDGE INJECTION: Critical life support system failure. Rapid decompression imminent.",
      severity: "Critical",
      timestamp: `MET ${metString}`,
      appliedEffects: {
        oxygen: 25,
        health: 5,
      },
    };
  }

  if (scenario === "Asteroid Strike") {
    return {
      id: `judge-ast-${Date.now()}`,
      title: "Asteroid Field",
      description: "JUDGE INJECTION: Unexpected micrometeoroid swarm impact detected on the hull.",
      severity: "Critical",
      timestamp: `MET ${metString}`,
      appliedEffects: {
        health: 15,
        velocity: 5,
      },
    };
  }

  if (scenario === "Dual Failure") {
    return {
      id: `judge-dual-${Date.now()}`,
      title: "Engine Failure",
      description: "JUDGE INJECTION: Cascading failure. Primary propulsion and comms offline simultaneously.",
      severity: "Critical",
      timestamp: `MET ${metString}`,
      appliedEffects: {
        velocity: 8,
        communicationDuration: 30,
        power: 20,
      },
    };
  }

  if (scenario === "Black Swan") {
    const bsIndex = Math.floor(Math.random() * BLACK_SWAN_EVENTS.length);
    const bsTemplate = BLACK_SWAN_EVENTS[bsIndex];
    return {
      id: `judge-bs-${Date.now()}`,
      title: bsTemplate.title,
      description: `BLACK SWAN INJECTION: ${bsTemplate.description}`,
      severity: "Critical",
      timestamp: `MET ${metString}`,
      appliedEffects: {
        fuel: bsTemplate.effects.fuel?.max,
        health: bsTemplate.effects.health?.max,
        power: bsTemplate.effects.power?.max,
        oxygen: bsTemplate.effects.oxygen?.max,
        velocity: bsTemplate.effects.velocity?.max,
        missionProgress: bsTemplate.effects.missionProgress?.max,
        communicationDuration: bsTemplate.effects.communicationDuration,
      },
    };
  }

  // Fallback
  return generateRandomEvent(metString);
};
