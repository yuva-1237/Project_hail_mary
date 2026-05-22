/**
 * Discussion Engine – Phase 5
 * Orchestrates the complete inter-agent discussion session:
 *   1. Generate inter-agent messages
 *   2. Calculate consensus and confidence adjustments
 *   3. Determine supporting/opposing agents vs Commander's final action
 *   4. Generate human-readable discussion summary
 *   5. Return complete DiscussionSession
 */
import type { ActiveEvent } from "../data/events";
import type { AgentRecommendation } from "../types/agents";
import type { CommanderDecision } from "../types/agents";
import type { DiscussionSession } from "../types/communication";
import { generateMessages } from "./messageGenerator";
import { calculateConsensus, getConsensusLabel } from "./consensusCalculator";

// ─── Discussion Summary Generator ────────────────────────────────────────────

function buildDiscussionSummary(
  session: Omit<DiscussionSession, "discussionSummary">,
  finalAction: string
): string {
  const { messages, consensusScore, adjustedRecommendations, supportingAgents, opposingAgents } = session;

  const escalations = messages.filter((m) => m.messageType === "ESCALATION");
  const supports    = messages.filter((m) => m.messageType === "SUPPORT" || m.messageType === "AGREEMENT");
  const challenges  = messages.filter((m) => m.messageType === "CHALLENGE");
  const questions   = messages.filter((m) => m.messageType === "QUESTION");

  let summary = "";

  // Escalation mention
  if (escalations.length > 0) {
    const escalators = [...new Set(escalations.map((m) => m.senderName.replace(" Agent", "")))];
    summary += `${escalators.join(" and ")} ${escalators.length > 1 ? "raised urgent escalations" : "raised an urgent escalation"} flagging immediate risk. `;
  }

  // Broad support
  if (supports.length >= 3) {
    summary += `Strong cross-agent support established with ${supports.length} endorsing messages. `;
  } else if (supports.length > 0) {
    summary += `${supports.length} supporting message${supports.length > 1 ? "s" : ""} contributed to alignment. `;
  }

  // Challenges
  if (challenges.length > 0) {
    summary += `${challenges.length} challenge${challenges.length > 1 ? "s were" : " was"} raised but did not alter the consensus direction. `;
  }

  // Questions
  if (questions.length > 0) {
    const questioners = [...new Set(questions.map((m) => m.senderName.replace(" Agent", "")))];
    summary += `${questioners.join(" and ")} ${questioners.length > 1 ? "raised clarifying questions" : "raised a clarifying question"} that were noted by the Commander. `;
  }

  // Supporting / opposing
  if (supportingAgents.length > 0) {
    const supportNames = supportingAgents.map((id) => id.charAt(0).toUpperCase() + id.slice(1));
    summary += `${supportNames.join(", ")} ${supportNames.length > 1 ? "agents endorsed" : "agent endorsed"} "${finalAction}". `;
  }
  if (opposingAgents.length > 0) {
    const opposeNames = opposingAgents.map((id) => id.charAt(0).toUpperCase() + id.slice(1));
    summary += `${opposeNames.join(", ")} ${opposeNames.length > 1 ? "agents recommended" : "agent recommended"} alternative actions but did not veto the Commander's selection. `;
  }

  // Confidence movement
  const topImproved = [...adjustedRecommendations].sort((a, b) => b.delta - a.delta)[0];
  if (topImproved && topImproved.delta > 0) {
    summary += `${topImproved.agentName} gained the most confidence (+${topImproved.delta} pts) following peer support. `;
  }

  // Consensus close
  summary += `Final consensus of ${consensusScore}% reflects ${getConsensusLabel(consensusScore).toLowerCase()}.`;

  return summary;
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

/**
 * Runs the full discussion engine for one mission event.
 */
export function runDiscussion(
  event: ActiveEvent,
  recommendations: AgentRecommendation[],
  commanderDecision: CommanderDecision,
  timestamp: string
): DiscussionSession {
  // Step 1 – Generate inter-agent messages
  const messages = generateMessages(event.title, recommendations, timestamp);

  // Step 2 – Calculate consensus and confidence adjustments
  const { consensusScore, consensusLabel, adjustedRecommendations } = calculateConsensus(
    recommendations,
    messages
  );

  // Step 3 – Determine supporting / opposing agents
  const finalAction = commanderDecision.finalAction;
  const supportingAgents = recommendations
    .filter((r) => r.recommendation === finalAction)
    .map((r) => r.agentId);
  const opposingAgents = recommendations
    .filter((r) => r.recommendation !== finalAction)
    .map((r) => r.agentId);

  // Step 4 – Build session skeleton (sans summary so we can reference it)
  const sessionWithoutSummary: Omit<DiscussionSession, "discussionSummary"> = {
    id: `disc-${Date.now()}-${Math.floor(Math.random() * 999)}`,
    eventId: event.id,
    eventTitle: event.title,
    messages,
    adjustedRecommendations,
    consensusScore,
    consensusLabel,
    supportingAgents,
    opposingAgents,
    timestamp,
  };

  // Step 5 – Generate discussion summary
  const discussionSummary = buildDiscussionSummary(sessionWithoutSummary, finalAction);

  return { ...sessionWithoutSummary, discussionSummary };
}
