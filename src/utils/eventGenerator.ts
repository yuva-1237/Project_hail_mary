import { EVENT_TEMPLATES } from "../data/events";
import { EARTH_EVENT_TEMPLATES } from "../data/earthTwinEvents";
import type { ActiveEvent } from "../data/events";

// Helper to generate a random value between min and max (inclusive)
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Picks a random event template and rolls random integers for any associated resource drains.
 * @param metString The current formatted MET timestamp.
 * @param spaceWeatherStatus The current space weather status.
 * @returns The fully constructed ActiveEvent object.
 */
export function generateRandomEvent(metString: string, spaceWeatherStatus: "nominal" | "elevated" | "storm" = "nominal"): ActiveEvent {
  // Phase 12 - Space Weather influence
  if (spaceWeatherStatus === "storm" && Math.random() > 0.3) {
    // 70% chance to force a radiation/solar event during a storm
    const solarEventTemplate = EVENT_TEMPLATES.find(t => t.title.includes("Radiation") || t.title.includes("Solar"));
    if (solarEventTemplate) {
      return buildEventFromTemplate(solarEventTemplate, metString);
    }
  } else if (spaceWeatherStatus === "elevated" && Math.random() > 0.6) {
    // 40% chance during elevated
    const solarEventTemplate = EVENT_TEMPLATES.find(t => t.title.includes("Radiation") || t.title.includes("Solar"));
    if (solarEventTemplate) {
      return buildEventFromTemplate(solarEventTemplate, metString);
    }
  }

  const randomIndex = Math.floor(Math.random() * EVENT_TEMPLATES.length);
  const template = EVENT_TEMPLATES[randomIndex];

  return buildEventFromTemplate(template, metString);
}

function buildEventFromTemplate(template: any, metString: string): ActiveEvent {
  const appliedEffects: ActiveEvent["appliedEffects"] = {};

  if (template.effects.fuel) {
    appliedEffects.fuel = getRandomInt(template.effects.fuel.min, template.effects.fuel.max);
  }
  if (template.effects.power) {
    appliedEffects.power = getRandomInt(template.effects.power.min, template.effects.power.max);
  }
  if (template.effects.oxygen) {
    appliedEffects.oxygen = getRandomInt(template.effects.oxygen.min, template.effects.oxygen.max);
  }
  if (template.effects.health) {
    appliedEffects.health = getRandomInt(template.effects.health.min, template.effects.health.max);
  }
  if (template.effects.velocity) {
    appliedEffects.velocity = getRandomInt(template.effects.velocity.min, template.effects.velocity.max);
  }
  if (template.effects.missionProgress) {
    appliedEffects.missionProgress = getRandomInt(template.effects.missionProgress.min, template.effects.missionProgress.max);
  }
  if (template.effects.communicationDuration) {
    appliedEffects.communicationDuration = template.effects.communicationDuration;
  }

  return {
    id: `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: template.title,
    description: template.description,
    severity: template.severity,
    timestamp: metString,
    appliedEffects,
    isOpportunity: template.isOpportunity,
  };
}
/**
 * Picks a random EARTH event template and rolls random integers for any associated resource drains.
 */
export function generateEarthEvent(metString: string): ActiveEvent {
  const randomIndex = Math.floor(Math.random() * EARTH_EVENT_TEMPLATES.length);
  const template = EARTH_EVENT_TEMPLATES[randomIndex];

  const appliedEffects: ActiveEvent["appliedEffects"] = {};

  if (template.effects.fuel) {
    appliedEffects.fuel = getRandomInt(template.effects.fuel.min, template.effects.fuel.max);
  }
  if (template.effects.power) {
    appliedEffects.power = getRandomInt(template.effects.power.min, template.effects.power.max);
  }
  if (template.effects.oxygen) {
    appliedEffects.oxygen = getRandomInt(template.effects.oxygen.min, template.effects.oxygen.max);
  }
  if (template.effects.health) {
    appliedEffects.health = getRandomInt(template.effects.health.min, template.effects.health.max);
  }
  if (template.effects.velocity) {
    appliedEffects.velocity = getRandomInt(template.effects.velocity.min, template.effects.velocity.max);
  }
  if (template.effects.missionProgress) {
    appliedEffects.missionProgress = getRandomInt(template.effects.missionProgress.min, template.effects.missionProgress.max);
  }
  if (template.effects.communicationDuration) {
    appliedEffects.communicationDuration = template.effects.communicationDuration;
  }

  return {
    id: `earth-event-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: template.title,
    description: template.description,
    severity: template.severity,
    timestamp: metString,
    appliedEffects,
    isOpportunity: template.isOpportunity,
  };
}

