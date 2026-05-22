/**
 * Safety Agent – Phase 4 + Phase 5 (Enhanced Reasoning)
 * Monitors crew health, assesses emergency risks. Reasoning references live crew/health data.
 */
import type { ActiveEvent } from "../data/events";
import type { SpacecraftState } from "../data/spacecraft";
import type { AgentRecommendation } from "../types/agents";

interface SafetyTemplate {
  recommendation: string;
  reasoning: (state: SpacecraftState) => string;
  confidence: number;
}

const SAFETY_RESPONSES: Record<string, SafetyTemplate> = {
  "Fuel Leak": {
    recommendation: "Monitor Risk",
    reasoning: (s) =>
      `Crew health at ${s.health.toFixed(1)}% — no immediate biohazard from fuel leak. Safety watch posture activated while Resource team manages the primary threat.`,
    confidence: 60,
  },
  "Solar Storm": {
    recommendation: "Enter Safe Mode",
    reasoning: (s) =>
      `High-energy solar particles detected. At hull integrity ${s.health.toFixed(1)}%, unshielded crew exposure exceeds 450 mSv/hr — above the 250 mSv/hr emergency threshold. Safe mode is mandatory.`,
    confidence: 98,
  },
  "Engine Failure": {
    recommendation: "Emergency Protocol Activation",
    reasoning: (s) =>
      `Primary propulsion failure at ${s.missionProgress.toFixed(0)}% into mission is mission-critical. Crew health ${s.health.toFixed(1)}% — contingency survival protocols must be primed now.`,
    confidence: 82,
  },
  "Oxygen Leak": {
    recommendation: "Emergency Protocol Activation",
    reasoning: (s) =>
      `Cabin O₂ at ${s.oxygen.toFixed(1)}% — crew hypoxia risk in under 8 minutes at current leak rate. Emergency depressurisation isolation protocol is mandatory and immediate.`,
    confidence: 99,
  },
  "Battery Failure": {
    recommendation: "Enter Safe Mode",
    reasoning: (s) =>
      `Power grid instability at ${s.power.toFixed(1)}% can cascade to life-support failure. Entering safe mode isolates non-critical loads and protects crew deck systems.`,
    confidence: 80,
  },
  "Navigation Error": {
    recommendation: "Monitor Risk",
    reasoning: (s) =>
      `Trajectory deviation poses low direct crew risk. Hull integrity ${s.health.toFixed(1)}%, vitals nominal. Standard safety watch maintained while Navigation corrects course.`,
    confidence: 45,
  },
  "Radiation Spike": {
    recommendation: "Shield Crew",
    reasoning: (s) =>
      `Radiation flux at dangerous levels. Hull integrity ${s.health.toFixed(1)}%. Deploying astrophage-absorbing lead shields reduces crew dose to < 50 mSv/hr — within acceptable range.`,
    confidence: 96,
  },
  "Communication Loss": {
    recommendation: "Monitor Risk",
    reasoning: (s) =>
      `Comms blackout does not threaten crew vitals. Health ${s.health.toFixed(1)}%, O₂ ${s.oxygen.toFixed(1)}% — both nominal. Standard safety watchkeeping is sufficient.`,
    confidence: 35,
  },
  "Asteroid Field": {
    recommendation: "Shield Crew",
    reasoning: (s) =>
      `Impact probability elevated. At hull integrity ${s.health.toFixed(1)}%, crew must brace and impact shields must deploy before debris contact. Time-critical action required.`,
    confidence: 88,
  },
  "Unknown Object Detected": {
    recommendation: "Proceed Carefully",
    reasoning: () =>
      `Unknown origin object presents unquantified biological and physical risk. Maintain safe observation distance — no crew EVA or direct contact until full scan confirms safety.`,
    confidence: 65,
  },
};

const DEFAULT_SAFETY: SafetyTemplate = {
  recommendation: "Monitor Risk",
  reasoning: (s) =>
    `No immediate safety threat. Crew health ${s.health.toFixed(1)}%, O₂ ${s.oxygen.toFixed(1)}%. Maintaining standard watchkeeping posture.`,
  confidence: 40,
};

export function safetyAgent(
  event: ActiveEvent,
  state: SpacecraftState
): AgentRecommendation {
  const resp = SAFETY_RESPONSES[event.title] ?? DEFAULT_SAFETY;

  let adjustedConfidence = resp.confidence;
  if (state.health < 40) adjustedConfidence = Math.min(adjustedConfidence + 10, 100);
  if (state.oxygen < 20) adjustedConfidence = Math.min(adjustedConfidence + 8, 100);

  return {
    agentId: "safety",
    agentName: "Safety Agent",
    recommendation: resp.recommendation,
    reasoning: resp.reasoning(state),
    confidence: adjustedConfidence,
  };
}
