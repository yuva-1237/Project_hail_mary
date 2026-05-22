/**
 * Navigation Agent – Phase 4 + Phase 5 (Enhanced Reasoning)
 * Analyses route safety, velocity, and mission progress.
 * Phase 5: reasoning strings dynamically reference spacecraft telemetry.
 */
import type { ActiveEvent } from "../data/events";
import type { SpacecraftState } from "../data/spacecraft";
import type { AgentRecommendation } from "../types/agents";

interface NavTemplate {
  recommendation: string;
  reasoning: (state: SpacecraftState) => string;
  confidence: number;
}

const NAV_RESPONSES: Record<string, NavTemplate> = {
  "Fuel Leak": {
    recommendation: "Reduce Speed",
    reasoning: (s) =>
      `Current velocity ${s.velocity.toFixed(1)} km/s generates thrust demand exceeding safe limits during leak. Throttling down will cut consumption by an estimated 18% until reserves stabilise.`,
    confidence: 70,
  },
  "Solar Storm": {
    recommendation: "Change Route",
    reasoning: (s) =>
      `At ${s.missionProgress.toFixed(0)}% mission progress, a 2.1° lateral burn avoids the storm's particle corridor with minimal Δv penalty. Recommend immediate course correction.`,
    confidence: 75,
  },
  "Engine Failure": {
    recommendation: "Recalculate Route",
    reasoning: (s) =>
      `Loss of primary propulsion reduces max velocity from ${s.velocity.toFixed(1)} km/s. A revised burn schedule on backup thrusters is needed to preserve ETA to Tau Ceti.`,
    confidence: 85,
  },
  "Oxygen Leak": {
    recommendation: "Maintain Trajectory",
    reasoning: () =>
      `Navigation systems are unaffected. Crew O₂ systems require immediate isolation — maintain heading and defer any trajectory adjustments until leak is contained.`,
    confidence: 50,
  },
  "Battery Failure": {
    recommendation: "Maintain Trajectory",
    reasoning: () =>
      `No navigational anomaly detected. Course is nominal. Power routing is an Engineering domain issue; Navigation holds steady.`,
    confidence: 45,
  },
  "Navigation Error": {
    recommendation: "Recalculate Route",
    reasoning: (s) =>
      `Star-tracker array detects a ${(Math.random() * 0.5 + 0.1).toFixed(2)}° heading deviation at MET position ${s.missionProgress.toFixed(1)}%. Correction burn calculated — executing now will cost < 0.4% fuel.`,
    confidence: 95,
  },
  "Radiation Spike": {
    recommendation: "Change Route",
    reasoning: (s) =>
      `Radiation sensor array shows flux ${(Math.random() * 200 + 300).toFixed(0)} mSv/hr along current bearing. A ${(Math.random() * 3 + 1).toFixed(1)}° starboard deviation clears the hotzone within ${s.velocity > 10 ? "4" : "8"} minutes.`,
    confidence: 65,
  },
  "Communication Loss": {
    recommendation: "Maintain Trajectory",
    reasoning: () =>
      `Comms blackout does not affect autopilot or star-tracker navigation. Mission path is clear — no course change warranted.`,
    confidence: 40,
  },
  "Asteroid Field": {
    recommendation: "Change Course",
    reasoning: (s) =>
      `Debris field detected at bearing 047° at current heading. At ${s.velocity.toFixed(1)} km/s, impact avoidance window is ~90 seconds. Evasive burn vector pre-loaded.`,
    confidence: 92,
  },
  "Unknown Object Detected": {
    recommendation: "Maintain Course",
    reasoning: (s) =>
      `Object is ${(Math.random() * 800 + 200).toFixed(0)} km off our port bow — well outside collision radius. Safe observation is possible from current heading at ${s.velocity.toFixed(1)} km/s.`,
    confidence: 60,
  },
};

const DEFAULT_NAV: NavTemplate = {
  recommendation: "Maintain Trajectory",
  reasoning: () => `No navigational anomalies detected. Holding current course and speed.`,
  confidence: 50,
};

export function navigationAgent(
  event: ActiveEvent,
  state: SpacecraftState
): AgentRecommendation {
  const resp = NAV_RESPONSES[event.title] ?? DEFAULT_NAV;

  let adjustedConfidence = resp.confidence;
  if (state.velocity < 5 && resp.recommendation !== "Maintain Trajectory") {
    adjustedConfidence = Math.min(adjustedConfidence + 10, 100);
  }

  return {
    agentId: "navigation",
    agentName: "Navigation Agent",
    recommendation: resp.recommendation,
    reasoning: resp.reasoning(state),
    confidence: adjustedConfidence,
  };
}
