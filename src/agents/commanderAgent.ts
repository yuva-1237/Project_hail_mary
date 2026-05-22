/**
 * Commander Agent – Phase 4 + Phase 5 (Enhanced Reasoning)
 * Synthesises agent recommendations into the final mission decision.
 * Phase 5: reasoning now references contributing agent details and live telemetry context.
 *
 * Selection Rules (in priority order):
 *  1. Safety Agent wins during Critical events or explicit safety-priority events
 *  2. Resource Agent wins during resource-failure events
 *  3. Navigation Agent wins during trajectory-related events
 *  4. Science Agent wins for discovery/opportunity events
 *  5. Fallback: Highest raw confidence score across all agents
 */
import type { ActiveEvent } from "../data/events";
import type { AgentRecommendation, CommanderDecision, AgentId } from "../types/agents";
import type { SimulationResult } from "../digitalTwin/simulateAction";

const RESOURCE_EVENTS = new Set(["Fuel Leak", "Battery Failure", "Oxygen Leak"]);
const NAVIGATION_EVENTS = new Set(["Navigation Error", "Asteroid Field", "Engine Failure"]);
const SCIENCE_EVENTS = new Set(["Unknown Object Detected"]);
const SAFETY_PRIORITY_EVENTS = new Set(["Solar Storm", "Radiation Spike", "Oxygen Leak"]);

export function commanderAgent(
  event: ActiveEvent,
  recommendations: AgentRecommendation[],
  timestamp: string,
  twinPredictions?: SimulationResult[]
): CommanderDecision {
  if (twinPredictions && twinPredictions.length > 0) {
    const sorted = [...twinPredictions].sort((a, b) => b.successProbability - a.successProbability);
    const bestSim = sorted[0];

    // Find matching recommendations to see which agents recommended this action
    const matchingRecommenders = recommendations
      .filter((r) => r.recommendation.toLowerCase() === bestSim.actionName.toLowerCase())
      .map((r) => r.agentName);

    const recommenderText = matchingRecommenders.length > 0
      ? `Supported by: ${matchingRecommenders.join(", ")}.`
      : "Selected via autonomous optimization.";

    const alternativeNotes = sorted.slice(1).map((sim) =>
      `${sim.actionName} (${sim.successProbability}%)`
    ).join(", ");

    const commanderReasoning = `DIGITAL TWIN PROJECTION: Action "${bestSim.actionName}" identified as optimal with ${bestSim.successProbability}% success probability. Risks: ${bestSim.risks}. ${recommenderText} Alternatives: ${alternativeNotes}.`;

    const contributing: AgentId[] = recommendations
      .filter((r) => r.recommendation.toLowerCase() === bestSim.actionName.toLowerCase())
      .map((r) => r.agentId);
    contributing.push("commander");

    return {
      eventId: event.id,
      eventTitle: event.title,
      finalAction: bestSim.actionName,
      reasoning: commanderReasoning,
      contributingAgents: [...new Set(contributing)] as AgentId[],
      timestamp,
    };
  }

  const isCritical = event.severity === "Critical";
  const isOpportunity = event.isOpportunity === true;
  const isSafetyPriority = SAFETY_PRIORITY_EVENTS.has(event.title);
  const isResourcePriority = RESOURCE_EVENTS.has(event.title);
  const isNavPriority = NAVIGATION_EVENTS.has(event.title);
  const isSciencePriority = SCIENCE_EVENTS.has(event.title) || isOpportunity;

  const byId = (id: AgentId): AgentRecommendation | undefined =>
    recommendations.find((r) => r.agentId === id);

  let winner: AgentRecommendation | undefined;
  let contributingAgents: AgentId[] = [];
  let commanderReasoning = "";

  // ── Priority 1: Safety during critical/explicit safety-priority events ──
  if (isCritical || isSafetyPriority) {
    winner = byId("safety");
    if (winner) {
      const safetyConf = winner.confidence;
      contributingAgents = ["safety", "commander"];
      commanderReasoning = `⚠ CRITICAL OVERRIDE — Safety Agent recommendation accepted at ${safetyConf}% confidence. Threat assessment: "${event.title}" is classified ${event.severity}. All competing protocols deferred. Mission survival takes absolute priority. Executing: ${winner.recommendation}.`;
    }
  }

  // ── Priority 2: Resource Agent for resource-failure events ──
  if (!winner && isResourcePriority) {
    winner = byId("resource");
    if (winner) {
      contributingAgents = ["resource", "commander"];
      commanderReasoning = `Resource failure event "${event.title}" logged. Resource Agent submits highest domain confidence at ${winner.confidence}%. Cross-check with Safety Agent (${byId("safety")?.confidence ?? "N/A"}%) confirms no immediate life-threat. Commander authorises: ${winner.recommendation}.`;
    }
  }

  // ── Priority 3: Navigation Agent for trajectory issues ──
  if (!winner && isNavPriority) {
    winner = byId("navigation");
    if (winner) {
      contributingAgents = ["navigation", "commander"];
      commanderReasoning = `Trajectory anomaly confirmed — "${event.title}". Navigation Agent holds primary domain authority (${winner.confidence}% confidence). Resource Agent standing by. Commander confirms: ${winner.recommendation}.`;
    }
  }

  // ── Priority 4: Science Agent for discovery events ──
  if (!winner && isSciencePriority) {
    winner = byId("science");
    if (winner) {
      contributingAgents = ["science", "commander"];
      commanderReasoning = `Scientific opportunity confirmed — "${event.title}". Science Agent confidence at ${winner.confidence}% is the highest in this domain. Safety Agent (${byId("safety")?.confidence ?? "N/A"}%) concurs with safe observation posture. Commander authorises: ${winner.recommendation}.`;
    }
  }

  // ── Priority 5: Highest confidence fallback ──
  if (!winner) {
    const sorted = [...recommendations].sort((a, b) => b.confidence - a.confidence);
    winner = sorted[0];

    if (winner) {
      const topTwo = sorted.slice(0, 2);
      contributingAgents = [...topTwo.map((r) => r.agentId), "commander"] as AgentId[];
      const secondAgent = sorted[1];
      commanderReasoning = `No single-domain priority applies to "${event.title}". Selecting highest-confidence input from ${winner.agentName} (${winner.confidence}%). Cross-validated against ${secondAgent?.agentName ?? "secondary agent"} (${secondAgent?.confidence ?? "N/A"}%). Consensus confidence gap: ${winner.confidence - (secondAgent?.confidence ?? 0)} points. Proceeding with: ${winner.recommendation}.`;
    }
  }

  // Final fallback guard
  if (!winner) {
    return {
      eventId: event.id,
      eventTitle: event.title,
      finalAction: "Analyze",
      reasoning: "Insufficient agent telemetry. Running default diagnostic protocol on all channels.",
      contributingAgents: ["commander"],
      timestamp,
    };
  }

  return {
    eventId: event.id,
    eventTitle: event.title,
    finalAction: winner.recommendation,
    reasoning: commanderReasoning,
    contributingAgents: [...new Set(contributingAgents)] as AgentId[],
    timestamp,
  };
}
