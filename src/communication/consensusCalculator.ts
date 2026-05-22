/**
 * Consensus Calculator – Phase 5
 * Computes consensus score and adjusts per-agent confidence values
 * based on the inter-agent discussion messages.
 */
import type { AgentMessage, AdjustedRecommendation, MessageType } from "../types/communication";
import type { AgentRecommendation } from "../types/agents";

// ─── Confidence deltas per message type received ────────────────────────────

const CONFIDENCE_DELTA: Record<MessageType, number> = {
  SUPPORT:    +5,
  AGREEMENT:  +3,
  QUESTION:    0,
  SUGGESTION:  0,
  CHALLENGE:  -5,
  ESCALATION: +7, // Escalating agent gains authority weight
};

// ─── Standard deviation helper ───────────────────────────────────────────────

function stdDev(nums: number[]): number {
  if (nums.length === 0) return 0;
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((sum, n) => sum + (n - mean) ** 2, 0) / nums.length;
  return Math.sqrt(variance);
}

// ─── Consensus label ─────────────────────────────────────────────────────────

export function getConsensusLabel(score: number): string {
  if (score >= 90) return "Strong Agreement";
  if (score >= 75) return "Moderate Agreement";
  if (score >= 50) return "Partial Agreement";
  return "High Conflict";
}

// ─── Main calculation ────────────────────────────────────────────────────────

export interface ConsensusResult {
  consensusScore: number;
  consensusLabel: string;
  adjustedRecommendations: AdjustedRecommendation[];
}

/**
 * Calculates consensus and adjusted per-agent confidence values.
 *
 * @param recommendations  Original agent recommendations
 * @param messages         Inter-agent messages generated during discussion
 * @returns                Consensus result with adjusted recommendations
 */
export function calculateConsensus(
  recommendations: AgentRecommendation[],
  messages: AgentMessage[]
): ConsensusResult {
  // Step 1 – Compute confidence delta per agent based on messages they received
  const deltaMap: Record<string, number> = {};

  for (const rec of recommendations) {
    deltaMap[rec.agentId] = 0;
  }

  for (const msg of messages) {
    const delta = CONFIDENCE_DELTA[msg.messageType];
    if (delta === 0) continue;

    if (msg.messageType === "ESCALATION") {
      // The escalating agent itself gains the +7 weight
      if (deltaMap[msg.sender] !== undefined) {
        deltaMap[msg.sender] += delta;
      }
    } else if (msg.receiver === "ALL") {
      // Broadcast messages benefit the sender
      if (deltaMap[msg.sender] !== undefined) {
        deltaMap[msg.sender] += Math.floor(delta / 2);
      }
    } else {
      // Directed message: affects the RECEIVER's confidence
      if (deltaMap[msg.receiver] !== undefined) {
        deltaMap[msg.receiver] += delta;
      }
    }
  }

  // Step 2 – Build adjusted recommendations (clamp [0,100])
  const adjustedRecommendations: AdjustedRecommendation[] = recommendations.map((rec) => {
    const delta = deltaMap[rec.agentId] ?? 0;
    const adjusted = Math.min(100, Math.max(0, rec.confidence + delta));
    return {
      agentId: rec.agentId,
      agentName: rec.agentName,
      recommendation: rec.recommendation,
      originalConfidence: rec.confidence,
      adjustedConfidence: adjusted,
      delta,
    };
  });

  // Step 3 – Compute consensus score
  const adjustedConfidences = adjustedRecommendations.map((r) => r.adjustedConfidence);
  const sd = stdDev(adjustedConfidences);
  const mean = adjustedConfidences.reduce((a, b) => a + b, 0) / adjustedConfidences.length;

  // Base score: high mean + low deviation = high consensus
  const baseScore = mean - sd * 1.2;

  // Message sentiment bonus
  const supportMsgs = messages.filter((m) =>
    m.messageType === "SUPPORT" || m.messageType === "AGREEMENT"
  ).length;
  const challengeMsgs = messages.filter((m) => m.messageType === "CHALLENGE").length;
  const sentimentBonus = (supportMsgs - challengeMsgs) * 4;

  // Shared top recommendation bonus
  const topRec = [...recommendations].sort((a, b) => b.confidence - a.confidence)[0];
  const agreeingCount = recommendations.filter(
    (r) => r.recommendation === topRec?.recommendation
  ).length;
  const agreementBonus = agreeingCount >= 3 ? 8 : agreeingCount >= 2 ? 4 : 0;

  const rawScore = baseScore + sentimentBonus + agreementBonus;
  const consensusScore = Math.round(Math.min(99, Math.max(10, rawScore)));
  const consensusLabel = getConsensusLabel(consensusScore);

  return { consensusScore, consensusLabel, adjustedRecommendations };
}
