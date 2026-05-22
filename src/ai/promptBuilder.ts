/**
 * Prompt Builder – Phase 6
 * Constructs the structured LLM prompt string from an AIReasoningRequest.
 * Uses the mission-specific template described in the Phase 6 specification.
 */
import type { AIReasoningRequest } from "./types";

export function buildPrompt(req: AIReasoningRequest): string {
  const { spacecraft, event, recommendations, discussionSummary, consensusScore, successProbability } = req;

  const velocityStr = spacecraft.velocity >= 1000
    ? `${(spacecraft.velocity / 1000).toFixed(1)}k km/s`
    : `${spacecraft.velocity} km/s`;

  const recLines = recommendations
    .map((r) => `  • ${r.agentName}: "${r.recommendation}" (Confidence: ${r.confidence}%)`)
    .join("\n");

  return `You are the Mission Intelligence System for PROJECT HAIL MARY, an autonomous spacecraft en route to Tau Ceti (12.0 light years). Your role is to analyze critical mission events and provide expert reasoning to support the Mission Commander.

CURRENT SPACECRAFT STATE:
  Fuel Reserve:        ${spacecraft.fuel.toFixed(1)}%
  Core Power:          ${spacecraft.power.toFixed(1)}%
  Cabin Oxygen:        ${spacecraft.oxygen.toFixed(1)}%
  Hull Integrity:      ${spacecraft.health.toFixed(1)}%
  Cabin Temperature:   ${spacecraft.temperature}°C
  Velocity:            ${velocityStr}
  Position:            ${spacecraft.position}
  Mission Progress:    ${spacecraft.missionProgress.toFixed(1)}%

ACTIVE MISSION EVENT:
  Title:       ${event.title}
  Severity:    ${event.severity}
  Type:        ${event.isOpportunity ? "Scientific Opportunity" : "Emergency / Risk"}
  Description: ${event.description}

MULTI-AGENT RECOMMENDATIONS:
${recLines}

AGENT DISCUSSION SUMMARY:
  ${discussionSummary}

CONSENSUS SCORE: ${consensusScore}/100

MISSION SUCCESS PROBABILITY: ${successProbability}%

YOUR TASKS:
1. Analyze the situation holistically, considering all telemetry data.
2. Identify the major risks if no action is taken.
3. Evaluate the trade-offs among the available agent-recommended actions.
4. Select the single optimal action for mission survival and success.
5. Explain your reasoning clearly and concisely.
6. Estimate your confidence in the selected action (0–100).
7. Predict the mission impact in one sentence.
8. Estimate the success probability adjustment this decision will produce (-10 to +10).

RESPOND WITH VALID JSON ONLY — no markdown, no text outside the JSON object:

{
  "selectedAction": "<one-line action string matching an agent recommendation or derived action>",
  "reasoning": "<2-3 sentence expert explanation referencing specific telemetry and agent inputs>",
  "confidence": <integer 0-100>,
  "risks": ["<specific risk 1>", "<specific risk 2>", "<specific risk 3>"],
  "predictedImpact": "<one sentence describing the predicted mission outcome>",
  "successAdjustment": <integer -10 to 10>
}`;
}
