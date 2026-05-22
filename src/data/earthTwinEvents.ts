import type { EventTemplate } from "./events";

export const EARTH_EVENT_TEMPLATES: EventTemplate[] = [
  {
    title: "Flash Flood",
    description: "Sudden heavy rainfall causing rapid water level rise.",
    severity: "High",
    effects: {
      power: { min: 5, max: 15 },
      health: { min: 2, max: 10 },
      communicationDuration: 10,
    },
  },
  {
    title: "Wildfire Approaching",
    description: "Rapidly spreading fire threatening the main asset perimeter.",
    severity: "Critical",
    effects: {
      health: { min: 5, max: 20 },
      oxygen: { min: 10, max: 25 },
      power: { min: 10, max: 20 },
    },
  },
  {
    title: "Medical Emergency",
    description: "Multiple personnel injured requiring immediate medevac.",
    severity: "High",
    effects: {
      health: { min: 15, max: 30 },
      missionProgress: { min: 2, max: 5 },
    },
  },
  {
    title: "Infrastructure Failure",
    description: "Primary bridge collapse severing supply lines.",
    severity: "Critical",
    effects: {
      fuel: { min: 10, max: 20 }, // Represents supply resources
      velocity: { min: 3, max: 8 }, // Represents logistics speed
    },
  },
  {
    title: "Severe Storm",
    description: "Category 5 hurricane winds detected.",
    severity: "High",
    effects: {
      power: { min: 5, max: 10 },
      communicationDuration: 15,
      missionProgress: { min: 5, max: 10 },
    },
  },
  {
    title: "Supply Drop Opportunity",
    description: "Airlift support available nearby. Proceed to secure zone.",
    severity: "Low",
    effects: {},
    isOpportunity: true,
  },
];
