export type SeverityLevel = "Low" | "Medium" | "High" | "Critical";

export interface EventEffects {
  fuel?: { min: number; max: number };
  power?: { min: number; max: number };
  oxygen?: { min: number; max: number };
  health?: { min: number; max: number };
  velocity?: { min: number; max: number };
  missionProgress?: { min: number; max: number };
  communicationDuration?: number; // duration in seconds
}

export interface EventTemplate {
  title: string;
  description: string;
  severity: SeverityLevel;
  effects: EventEffects;
  isOpportunity?: boolean;
}

export interface ActiveEvent {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  timestamp: string; // MET formatted e.g. "00:00:15"
  appliedEffects: {
    fuel?: number;
    power?: number;
    oxygen?: number;
    health?: number;
    velocity?: number;
    missionProgress?: number;
    communicationDuration?: number;
  };
  isOpportunity?: boolean;
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    title: "Fuel Leak",
    description: "Fuel reserves are dropping unexpectedly.",
    severity: "High",
    effects: {
      fuel: { min: 5, max: 15 },
    },
  },
  {
    title: "Solar Storm",
    description: "High radiation detected near the spacecraft.",
    severity: "High",
    effects: {
      power: { min: 5, max: 10 },
      communicationDuration: 5,
    },
  },
  {
    title: "Engine Failure",
    description: "Primary propulsion system malfunction.",
    severity: "Critical",
    effects: {
      velocity: { min: 1, max: 3 },
    },
  },
  {
    title: "Oxygen Leak",
    description: "Life support system integrity compromised.",
    severity: "Critical",
    effects: {
      oxygen: { min: 5, max: 12 },
    },
  },
  {
    title: "Battery Failure",
    description: "Power storage unit instability detected.",
    severity: "High",
    effects: {
      power: { min: 10, max: 20 },
    },
  },
  {
    title: "Navigation Error",
    description: "Spacecraft trajectory deviation detected.",
    severity: "Medium",
    effects: {
      missionProgress: { min: 3, max: 8 },
    },
  },
  {
    title: "Radiation Spike",
    description: "Dangerous radiation levels affecting crew systems.",
    severity: "High",
    effects: {
      health: { min: 5, max: 15 },
    },
  },
  {
    title: "Communication Loss",
    description: "Unable to establish external communications.",
    severity: "Medium",
    effects: {
      communicationDuration: 10,
    },
  },
  {
    title: "Asteroid Field",
    description: "Obstacle detected along the current route.",
    severity: "Critical",
    effects: {
      health: { min: 3, max: 10 },
      velocity: { min: 1, max: 2 },
    },
  },
  {
    title: "Unknown Object Detected",
    description: "Unidentified object discovered nearby. Scientific investigation opportunity detected.",
    severity: "Low",
    effects: {},
    isOpportunity: true,
  },
];
