/**
 * Resource Agent – Phase 4 + Phase 5 (Enhanced Reasoning)
 * Monitors fuel, power, and oxygen. Reasoning strings reference live telemetry.
 */
import type { ActiveEvent } from "../data/events";
import type { SpacecraftState } from "../data/spacecraft";
import type { AgentRecommendation } from "../types/agents";

interface ResourceTemplate {
  recommendation: string;
  reasoning: (state: SpacecraftState) => string;
  confidence: number;
}

const RESOURCE_RESPONSES: Record<string, ResourceTemplate> = {
  "Fuel Leak": {
    recommendation: "Activate Backup Tank",
    reasoning: (s) =>
      `Primary fuel at ${s.fuel.toFixed(1)}% and dropping. Backup reservoir holds 15% capacity — activating now bridges the gap while primary seals. Estimated fuel recovery: +8–12%.`,
    confidence: 95,
  },
  "Solar Storm": {
    recommendation: "Reduce Power Usage",
    reasoning: (s) =>
      `Storm-induced electromagnetic surges risk capacitor damage. Current power draw at ${s.power.toFixed(1)}%. Load-shedding non-critical systems protects reactor core from cascading failure.`,
    confidence: 80,
  },
  "Engine Failure": {
    recommendation: "Divert Power",
    reasoning: (s) =>
      `Propulsion offline — redirecting ${Math.min(s.power, 20).toFixed(0)}% power from propulsion bus to life-support and avionics to sustain crew and navigation systems.`,
    confidence: 72,
  },
  "Oxygen Leak": {
    recommendation: "Switch Life Support Backup",
    reasoning: (s) =>
      `Cabin O₂ at ${s.oxygen.toFixed(1)}% and falling. Emergency backup canisters can deliver +9% O₂ and buy 12 minutes for primary system repair. Activating immediately.`,
    confidence: 96,
  },
  "Battery Failure": {
    recommendation: "Switch Backup Battery",
    reasoning: (s) =>
      `Primary battery bank failing — power at ${s.power.toFixed(1)}%. Auxiliary battery module has full charge. Switching now maintains 100% grid integrity without interruption.`,
    confidence: 98,
  },
  "Navigation Error": {
    recommendation: "No Action",
    reasoning: (s) =>
      `Resources nominal: Fuel ${s.fuel.toFixed(1)}%, Power ${s.power.toFixed(1)}%, O₂ ${s.oxygen.toFixed(1)}%. No conservation action required for this navigational event.`,
    confidence: 30,
  },
  "Radiation Spike": {
    recommendation: "Divert Power",
    reasoning: (s) =>
      `Diverting ${Math.min(s.power, 15).toFixed(0)}% power to electromagnetic shielding arrays will reduce crew radiation exposure by an estimated 60% at current flux levels.`,
    confidence: 78,
  },
  "Communication Loss": {
    recommendation: "Divert Power",
    reasoning: (s) =>
      `Boosting antenna array from ${s.power.toFixed(1)}% available power can restore signal lock. High-gain mode requires +8% draw but should re-establish the Earth link within 30s.`,
    confidence: 70,
  },
  "Asteroid Field": {
    recommendation: "Activate Backup Tank",
    reasoning: (s) =>
      `Evasive burns require burst thrust. Fuel at ${s.fuel.toFixed(1)}% — pre-arming backup tank ensures we have reserves for both evasion and subsequent course correction.`,
    confidence: 75,
  },
  "Unknown Object Detected": {
    recommendation: "No Action",
    reasoning: (s) =>
      `All resources within parameters: Fuel ${s.fuel.toFixed(1)}%, Power ${s.power.toFixed(1)}%, O₂ ${s.oxygen.toFixed(1)}%. Observation mode requires no resource diversion.`,
    confidence: 40,
  },
};

const DEFAULT_RESOURCE: ResourceTemplate = {
  recommendation: "Monitor Systems",
  reasoning: (s) =>
    `Resources stable: Fuel ${s.fuel.toFixed(1)}%, Power ${s.power.toFixed(1)}%, O₂ ${s.oxygen.toFixed(1)}%. Continuing standard telemetry watch.`,
  confidence: 50,
};

export function resourceAgent(
  event: ActiveEvent,
  state: SpacecraftState
): AgentRecommendation {
  const resp = RESOURCE_RESPONSES[event.title] ?? DEFAULT_RESOURCE;

  let adjustedConfidence = resp.confidence;
  if (event.title === "Fuel Leak" && state.fuel < 25) adjustedConfidence = Math.min(adjustedConfidence + 5, 100);
  if (event.title === "Battery Failure" && state.power < 20) adjustedConfidence = Math.min(adjustedConfidence + 5, 100);
  if (event.title === "Oxygen Leak" && state.oxygen < 20) adjustedConfidence = Math.min(adjustedConfidence + 5, 100);

  return {
    agentId: "resource",
    agentName: "Resource Agent",
    recommendation: resp.recommendation,
    reasoning: resp.reasoning(state),
    confidence: adjustedConfidence,
  };
}
