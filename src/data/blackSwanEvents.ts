import type { EventTemplate } from "./events";

export const BLACK_SWAN_EVENTS: EventTemplate[] = [
  {
    title: "Solar Storm + Fuel Leak + Comm Failure",
    description: "Catastrophic cascading failure. An X-class solar flare has irradiated the hull, compromising fuel seals and destroying the primary antenna.",
    severity: "Critical",
    effects: {
      fuel: { min: 20, max: 35 },
      health: { min: 15, max: 25 },
      power: { min: 10, max: 20 },
      communicationDuration: 6
    },
    isOpportunity: false
  },
  {
    title: "Engine Failure + Asteroid Field",
    description: "Main thrusters have shut down while traversing a dense micro-meteoroid cloud. Hull integrity is dropping rapidly without evasive capability.",
    severity: "Critical",
    effects: {
      health: { min: 25, max: 40 },
      velocity: { min: 300, max: 500 },
      missionProgress: { min: 1, max: 3 }
    },
    isOpportunity: false
  },
  {
    title: "Radiation Spike + Oxygen Leak",
    description: "A cosmic ray burst has pierced the life support containment, causing an immediate drop in cabin pressure and dangerous radiation levels.",
    severity: "Critical",
    effects: {
      oxygen: { min: 25, max: 40 },
      health: { min: 10, max: 20 }
    },
    isOpportunity: false
  }
];
