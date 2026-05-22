export interface Decision {
  id: string;
  eventId: string;
  eventTitle: string;
  availableActions: string[];
  selectedAction: string;
  reasoning: string;
  outcome: string;
  timestamp: string; // MET format e.g. "00:00:15"
  successImpact: number; // positive success score change
}

export interface DecisionOutcomeEffects {
  fuel?: number;
  power?: number;
  oxygen?: number;
  health?: number;
  velocityRestore?: boolean; // Set back to nominal phase velocity
  velocityDelta?: number;
  missionProgress?: number;
  communicationRestore?: boolean;
}

export interface DecisionTemplate {
  availableActions: string[];
  selectedAction: string;
  reasoning: string;
  outcome: string;
  successImpact: number;
  effects: DecisionOutcomeEffects;
}

export const DECISION_TEMPLATES: Record<string, DecisionTemplate> = {
  "Fuel Leak": {
    availableActions: ["Ignore", "Reduce Speed", "Activate Backup Tank"],
    selectedAction: "Activate Backup Tank",
    reasoning: "Minimizes fuel loss while preserving mission continuity.",
    outcome: "Fuel loss reduced by 80%. Backup fuel reserves engaged.",
    successImpact: 2,
    effects: {
      fuel: 8, // Restore 5-10 fuel
    },
  },
  "Solar Storm": {
    availableActions: ["Continue Mission", "Change Route", "Enter Safe Mode"],
    selectedAction: "Enter Safe Mode",
    reasoning: "Protects critical systems from radiation exposure.",
    outcome: "Power systems stabilized and crew protected.",
    successImpact: 2,
    effects: {
      power: 6, // Restore power slightly
      communicationRestore: true, // clear comms block
    },
  },
  "Engine Failure": {
    availableActions: ["Ignore", "Reduce Speed", "Activate Backup Engine"],
    selectedAction: "Activate Backup Engine",
    reasoning: "Restores thrust capability and secures navigation timeline.",
    outcome: "Propulsion restored. Secondary thruster systems active.",
    successImpact: 3,
    effects: {
      velocityRestore: true,
    },
  },
  "Oxygen Leak": {
    availableActions: ["Ignore", "Seal Leak", "Switch Life Support Backup"],
    selectedAction: "Switch Life Support Backup",
    reasoning: "Minimizes oxygen loss by isolating ruptured cabin sections immediately.",
    outcome: "Oxygen loss minimized. Pressure levels returning to normal.",
    successImpact: 3,
    effects: {
      oxygen: 9, // Restore oxygen
    },
  },
  "Battery Failure": {
    availableActions: ["Continue Operations", "Divert Nonessential Power", "Switch Backup Battery"],
    selectedAction: "Switch Backup Battery",
    reasoning: "Engages auxiliary power bank to maintain full system functionality.",
    outcome: "Power stability restored. Core grids operational.",
    successImpact: 2,
    effects: {
      power: 15, // Restore power
    },
  },
  "Navigation Error": {
    availableActions: ["Ignore", "Recalculate Route", "Maintain Current Path"],
    selectedAction: "Recalculate Route",
    reasoning: "Computes correction vector based on drift telemetry from star trackers.",
    outcome: "Trajectory corrected. Course coordinates updated.",
    successImpact: 2,
    effects: {
      missionProgress: 4, // Restore 3-8 progress
    },
  },
  "Radiation Spike": {
    availableActions: ["Ignore", "Shield Crew", "Enter Safe Mode"],
    selectedAction: "Shield Crew",
    reasoning: "Deploys lead-shield overlays and redirects astrophage radiation absorbing shields.",
    outcome: "Crew health protected. Radiation levels stabilized.",
    successImpact: 3,
    effects: {
      health: 8, // Restore health
    },
  },
  "Communication Loss": {
    availableActions: ["Ignore", "Restart Systems", "Use Backup Antenna"],
    selectedAction: "Use Backup Antenna",
    reasoning: "Deploys secondary high-gain phased array to restore transmission links.",
    outcome: "Communications restored. Earth telemetry signals synched.",
    successImpact: 2,
    effects: {
      communicationRestore: true,
    },
  },
  "Asteroid Field": {
    availableActions: ["Maintain Speed", "Slow Down", "Change Course"],
    selectedAction: "Change Course",
    reasoning: "Coordinates lateral evasion thruster burns to clear the debris field path.",
    outcome: "Collision risk avoided. Spacecraft steered back to course.",
    successImpact: 3,
    effects: {
      health: 6, // Restore health
      velocityRestore: true, // Restore velocity
    },
  },
  "Unknown Object Detected": {
    availableActions: ["Ignore", "Scan Object", "Investigate"],
    selectedAction: "Scan Object",
    reasoning: "Gathers remote spectroscopic and radar telemetry from a safe distance.",
    outcome: "Scientific data collected. New planetary parameters saved.",
    successImpact: 1,
    effects: {
      missionProgress: 3, // Increase progress by 2-5
    },
  },
};
