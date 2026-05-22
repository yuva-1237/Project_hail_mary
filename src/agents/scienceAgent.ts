/**
 * Science Agent – Phase 4 + Phase 5 (Enhanced Reasoning)
 * Evaluates discoveries and maximises scientific value. References mission progress in reasoning.
 */
import type { ActiveEvent } from "../data/events";
import type { SpacecraftState } from "../data/spacecraft";
import type { AgentRecommendation } from "../types/agents";

interface ScienceTemplate {
  recommendation: string;
  reasoning: (state: SpacecraftState) => string;
  confidence: number;
}

const SCIENCE_RESPONSES: Record<string, ScienceTemplate> = {
  "Fuel Leak": {
    recommendation: "No Action",
    reasoning: () =>
      `Engineering emergency takes precedence. All science instruments powered down to support resource conservation. No scientific action is appropriate at this time.`,
    confidence: 20,
  },
  "Solar Storm": {
    recommendation: "Collect Data",
    reasoning: (s) =>
      `Solar particle flux sensors remain safe behind radiation baffles. At ${s.missionProgress.toFixed(0)}% mission progress, this storm offers rare magnetosphere interaction data worth capturing.`,
    confidence: 35,
  },
  "Engine Failure": {
    recommendation: "No Action",
    reasoning: () =>
      `Science operations suspended during propulsion emergencies. Instruments powered to standby — crew safety and propulsion restoration take full priority.`,
    confidence: 15,
  },
  "Oxygen Leak": {
    recommendation: "No Action",
    reasoning: () =>
      `Life-support emergency supersedes all scientific objectives. Science team assisting with emergency isolation procedures. No instrument time available.`,
    confidence: 5,
  },
  "Battery Failure": {
    recommendation: "No Action",
    reasoning: (s) =>
      `Power at ${s.power.toFixed(1)}% — conservation mode requires halting all non-essential science instruments. Experiment logs saved to cold storage.`,
    confidence: 10,
  },
  "Navigation Error": {
    recommendation: "Collect Data",
    reasoning: (s) =>
      `The off-nominal trajectory at ${s.missionProgress.toFixed(0)}% may expose previously unscheduled observation targets. Passive sensor array activated for opportunistic data collection.`,
    confidence: 42,
  },
  "Radiation Spike": {
    recommendation: "Collect Data",
    reasoning: () =>
      `Radiation flux sensors can safely capture unique solar wind interaction spectra from behind shielding. This event has archival scientific value — passive logging engaged.`,
    confidence: 38,
  },
  "Communication Loss": {
    recommendation: "No Action",
    reasoning: () =>
      `Science data requires downlink to Earth for processing. With comms offline, data collection is buffered but transmission suspended until link is restored.`,
    confidence: 20,
  },
  "Asteroid Field": {
    recommendation: "Scan Object",
    reasoning: (s) =>
      `Asteroid composition data during evasion at ${s.missionProgress.toFixed(0)}% mission progress provides geological survey value. Side-mounted LIDAR can scan during burn manoeuvre.`,
    confidence: 55,
  },
  "Unknown Object Detected": {
    recommendation: "Scan Object",
    reasoning: (s) =>
      `First-contact protocol initiated. At ${s.missionProgress.toFixed(0)}% mission progress, spectroscopic and radar scans from safe distance could confirm or rule out extraterrestrial origin — highest scientific priority in mission history.`,
    confidence: 96,
  },
};

const DEFAULT_SCIENCE: ScienceTemplate = {
  recommendation: "No Action",
  reasoning: () => `No scientific opportunity identified during this event. Instruments on standby.`,
  confidence: 20,
};

export function scienceAgent(
  event: ActiveEvent,
  state: SpacecraftState
): AgentRecommendation {
  const resp = SCIENCE_RESPONSES[event.title] ?? DEFAULT_SCIENCE;

  const adjustedConfidence = event.isOpportunity
    ? Math.min(resp.confidence + 15, 100)
    : resp.confidence;

  return {
    agentId: "science",
    agentName: "Science Agent",
    recommendation: resp.recommendation,
    reasoning: resp.reasoning(state),
    confidence: adjustedConfidence,
  };
}
