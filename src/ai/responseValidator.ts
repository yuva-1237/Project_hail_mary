/**
 * Response Validator – Phase 6
 * Parses, validates, and sanitises raw LLM JSON output into AIReasoningResponse.
 * Returns null if the response is missing required fields or is unparseable.
 */
import type { AIReasoningResponse } from "./types";

export function validateAIResponse(raw: string): AIReasoningResponse | null {
  try {
    // Strip markdown code fences that some models add
    const cleaned = raw
      .replace(/^```json\s*/im, "")
      .replace(/^```\s*/im, "")
      .replace(/```\s*$/im, "")
      .trim();

    if (!cleaned) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed: any = JSON.parse(cleaned);

    // Validate each required field
    if (typeof parsed.selectedAction !== "string" || !parsed.selectedAction.trim()) return null;
    if (typeof parsed.reasoning !== "string" || !parsed.reasoning.trim()) return null;
    if (typeof parsed.confidence !== "number") return null;
    if (!Array.isArray(parsed.risks)) return null;
    if (typeof parsed.predictedImpact !== "string") return null;
    if (typeof parsed.successAdjustment !== "number") return null;

    return {
      selectedAction: String(parsed.selectedAction).trim(),
      reasoning: String(parsed.reasoning).trim(),
      confidence: Math.max(0, Math.min(100, Math.round(Number(parsed.confidence)))),
      risks: (parsed.risks as unknown[]).map((r) => String(r).trim()).filter(Boolean).slice(0, 5),
      predictedImpact: String(parsed.predictedImpact).trim(),
      successAdjustment: Math.max(-10, Math.min(10, Math.round(Number(parsed.successAdjustment)))),
    };
  } catch {
    return null;
  }
}
