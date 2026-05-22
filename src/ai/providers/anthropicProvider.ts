/**
 * Anthropic Provider – Phase 6
 * Calls the Anthropic Messages API using claude-3-5-haiku.
 * Requires VITE_ANTHROPIC_API_KEY or a key provided via AISettings.
 *
 * NOTE: Anthropic's API blocks direct browser CORS requests.
 * A server-side proxy is required for production deployments.
 * The provider gracefully falls back to the mock provider if CORS blocks the call.
 */
import type { AIProviderInterface, AIReasoningResponse } from "../types";
import { validateAIResponse } from "../responseValidator";

export function createAnthropicProvider(apiKey: string): AIProviderInterface {
  const key = apiKey || (typeof import.meta !== "undefined" ? (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ANTHROPIC_API_KEY : "") || "";

  return {
    name: "anthropic",
    displayName: "Anthropic Claude Haiku",

    async call(prompt: string): Promise<AIReasoningResponse> {
      if (!key) throw new Error("Anthropic API key not configured.");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 600,
          system:
            "You are the Mission Intelligence System for PROJECT HAIL MARY. Always respond with valid JSON only, matching the exact schema provided.",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => response.statusText);
        throw new Error(`Anthropic ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const raw: string = data.content?.[0]?.text ?? "";
      const validated = validateAIResponse(raw);
      if (!validated) throw new Error("Anthropic response failed schema validation.");
      return validated;
    },

    async testConnection(): Promise<boolean> {
      if (!key) return false;
      // Anthropic has no lightweight ping endpoint; validate key format only
      return key.startsWith("sk-ant-");
    },
  };
}
