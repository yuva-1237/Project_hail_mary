/**
 * OpenAI Provider – Phase 6
 * Calls the OpenAI Chat Completions API using gpt-4o-mini.
 * Requires VITE_OPENAI_API_KEY or a key provided via AISettings.
 */
import type { AIProviderInterface, AIReasoningResponse } from "../types";
import { validateAIResponse } from "../responseValidator";

export function createOpenAIProvider(apiKey: string): AIProviderInterface {
  const key = apiKey || (typeof import.meta !== "undefined" ? (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_OPENAI_API_KEY : "") || "";

  return {
    name: "openai",
    displayName: "OpenAI GPT-4o Mini",

    async call(prompt: string): Promise<AIReasoningResponse> {
      if (!key) throw new Error("OpenAI API key not configured.");

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.25,
          max_tokens: 600,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are the Mission Intelligence System for PROJECT HAIL MARY. Always respond with valid JSON only, matching the exact schema provided.",
            },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => response.statusText);
        throw new Error(`OpenAI ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const raw: string = data.choices?.[0]?.message?.content ?? "";
      const validated = validateAIResponse(raw);
      if (!validated) throw new Error("OpenAI response failed schema validation.");
      return validated;
    },

    async testConnection(): Promise<boolean> {
      if (!key) return false;
      try {
        const resp = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${key}` },
        });
        return resp.ok;
      } catch {
        return false;
      }
    },
  };
}
