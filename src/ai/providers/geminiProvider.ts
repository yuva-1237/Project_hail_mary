/**
 * Gemini Provider – Phase 6
 * Calls the Google Gemini API using gemini-1.5-flash.
 * Requires VITE_GEMINI_API_KEY or a key provided via AISettings.
 * Gemini supports browser CORS for the public generativelanguage API.
 */
import type { AIProviderInterface, AIReasoningResponse } from "../types";
import { validateAIResponse } from "../responseValidator";

export function createGeminiProvider(apiKey: string): AIProviderInterface {
  const key = apiKey || (typeof import.meta !== "undefined" ? (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY : "") || "";

  return {
    name: "gemini",
    displayName: "Google Gemini Flash",

    async call(prompt: string): Promise<AIReasoningResponse> {
      if (!key) throw new Error("Gemini API key not configured.");

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: "You are the Mission Intelligence System for PROJECT HAIL MARY. Always respond with valid JSON only, matching the exact schema provided.",
              },
            ],
          },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 600,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => response.statusText);
        throw new Error(`Gemini ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const validated = validateAIResponse(raw);
      if (!validated) throw new Error("Gemini response failed schema validation.");
      return validated;
    },

    async testConnection(): Promise<boolean> {
      if (!key) return false;
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
        );
        return resp.ok;
      } catch {
        return false;
      }
    },
  };
}
