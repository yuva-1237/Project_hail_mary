import type { DecisionTemplate } from "./decisions";

export const EARTH_DECISION_TEMPLATES: Record<string, DecisionTemplate> = {
  "Flash Flood": {
    availableActions: ["Evacuate Lower Levels", "Deploy Sandbags", "Ignore"],
    selectedAction: "Evacuate Lower Levels",
    reasoning: "Prioritizes human safety and minimizes equipment damage by moving assets to higher ground.",
    outcome: "Personnel secured. Equipment relocated successfully.",
    successImpact: 3,
    effects: {
      health: 8,
      power: 10,
      communicationRestore: true,
    },
  },
  "Wildfire Approaching": {
    availableActions: ["Deploy Retardant", "Evacuate Facility", "Maintain Position"],
    selectedAction: "Deploy Retardant",
    reasoning: "Creates a firebreak to protect critical infrastructure while maintaining operational status.",
    outcome: "Firebreak established. Facility secured from immediate threat.",
    successImpact: 4,
    effects: {
      health: 15,
      oxygen: 20,
      power: 15,
    },
  },
  "Medical Emergency": {
    availableActions: ["Call Medevac", "Treat Locally", "Ignore"],
    selectedAction: "Call Medevac",
    reasoning: "Injuries exceed local medical capabilities. Aerial transport is the safest option.",
    outcome: "Personnel evacuated safely. Local resources conserved.",
    successImpact: 2,
    effects: {
      health: 25,
      missionProgress: 3,
    },
  },
  "Infrastructure Failure": {
    availableActions: ["Reroute Supplies", "Halt Operations", "Attempt Repair"],
    selectedAction: "Reroute Supplies",
    reasoning: "Maintains logistics flow via secondary routes despite increased transit time.",
    outcome: "Supply lines re-established via secondary routes.",
    successImpact: 2,
    effects: {
      fuel: 15,
      velocityRestore: true,
    },
  },
  "Severe Storm": {
    availableActions: ["Lockdown Facility", "Continue Operations", "Evacuate"],
    selectedAction: "Lockdown Facility",
    reasoning: "Secures the perimeter and protects against high winds and debris.",
    outcome: "Facility locked down. Minor external damage reported.",
    successImpact: 3,
    effects: {
      power: 8,
      communicationRestore: true,
      missionProgress: 8,
    },
  },
  "Supply Drop Opportunity": {
    availableActions: ["Secure Drop Zone", "Ignore", "Send Scout"],
    selectedAction: "Secure Drop Zone",
    reasoning: "Critical supplies needed for ongoing operations. Area is relatively safe.",
    outcome: "Supplies secured and integrated into inventory.",
    successImpact: 2,
    effects: {
      missionProgress: 5,
    },
  },
};
