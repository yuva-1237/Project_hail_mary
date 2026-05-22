/**
 * Agent Coordinator – Phase 4 + Phase 5
 * Orchestrates all four specialist agents, the Mission Commander,
 * and the Phase 5 inter-agent discussion session.
 *
 * Full pipeline:
 *  1. Each specialist agent analyses the event → recommendations
 *  2. Commander synthesises recommendations → final decision
 *  3. Discussion engine runs inter-agent debate → discussion session
 *  4. Returns a complete AgentCollaboration object
 */
import type { ActiveEvent } from "../data/events";
import type { SpacecraftState } from "../data/spacecraft";
import type { AgentCollaboration } from "../types/agents";

import { navigationAgent } from "../agents/navigationAgent";
import { resourceAgent }   from "../agents/resourceAgent";
import { safetyAgent }     from "../agents/safetyAgent";
import { scienceAgent }    from "../agents/scienceAgent";
import { commanderAgent }  from "../agents/commanderAgent";
import { runDiscussion }   from "../communication/discussionEngine";

/**
 * Runs the complete multi-agent collaboration pipeline for one mission event.
 *
 * @param event     The active mission event
 * @param state     Current spacecraft telemetry state
 * @param timestamp MET string e.g. "00:02:35"
 * @returns         A complete AgentCollaboration object including discussion session
 */
export function runAgentCollaboration(
  event: ActiveEvent,
  state: SpacecraftState,
  timestamp: string
): AgentCollaboration {
  // Step 1 – Gather all agent recommendations
  const recommendations = [
    navigationAgent(event, state),
    resourceAgent(event, state),
    safetyAgent(event, state),
    scienceAgent(event, state),
  ];

  // Step 2 – Commander synthesises into a final decision
  const commanderDecision = commanderAgent(event, recommendations, timestamp);

  // Step 3 – Run Phase 5 inter-agent discussion session
  const discussionSession = runDiscussion(event, recommendations, commanderDecision, timestamp);

  return {
    id: `collab-${Date.now()}-${Math.floor(Math.random() * 999)}`,
    eventId: event.id,
    eventTitle: event.title,
    recommendations,
    commanderDecision,
    discussionSession,
    timestamp,
  };
}
