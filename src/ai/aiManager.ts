/**
 * AI Manager – Phase 6
 * Selects the configured AI provider, calls it with the built prompt,
 * and falls back to the mock provider on failure.
 */
import type {
  AIConfiguration,
  AIProvider,
  AIProviderInterface,
  AIReasoningRequest,
  AIReasoningResponse,
} from "./types";
import { buildPrompt } from "./promptBuilder";
import { mockProvider } from "./providers/mockProvider";
import { createOpenAIProvider } from "./providers/openaiProvider";
import { createAnthropicProvider } from "./providers/anthropicProvider";
import { createGeminiProvider } from "./providers/geminiProvider";

// ─── Result type ──────────────────────────────────────────────────────────────

export interface AIRunResult {
  response: AIReasoningResponse;
  provider: AIProvider;
  responseTimeMs: number;
  isFallback: boolean;
}

// ─── Provider factory ─────────────────────────────────────────────────────────

function buildProvider(config: AIConfiguration): AIProviderInterface {
  switch (config.provider) {
    case "openai":    return createOpenAIProvider(config.openaiApiKey);
    case "anthropic": return createAnthropicProvider(config.anthropicApiKey);
    case "gemini":    return createGeminiProvider(config.geminiApiKey);
    default:          return mockProvider;
  }
}

// ─── Main reasoning call ──────────────────────────────────────────────────────

/**
 * Runs AI reasoning for a mission event.
 * Falls back to the mock provider automatically if the configured provider fails.
 */
export async function runAIReasoning(
  request: AIReasoningRequest,
  config: AIConfiguration
): Promise<AIRunResult> {
  const prompt = buildPrompt(request);
  const provider = buildProvider(config);
  const t0 = Date.now();

  try {
    const response = await provider.call(prompt);
    return {
      response,
      provider: config.provider,
      responseTimeMs: Date.now() - t0,
      isFallback: false,
    };
  } catch (primaryErr) {
    console.warn(`[AI Manager] "${config.provider}" provider failed:`, primaryErr);

    // If not already mock, attempt mock fallback
    if (config.provider !== "mock") {
      const t1 = Date.now();
      try {
        const fallbackResponse = await mockProvider.call(prompt);
        return {
          response: fallbackResponse,
          provider: "mock",
          responseTimeMs: Date.now() - t1,
          isFallback: true,
        };
      } catch (fallbackErr) {
        console.error("[AI Manager] Mock fallback also failed:", fallbackErr);
      }
    }

    throw new Error(`All AI providers failed for event: ${request.event.title}`, { cause: primaryErr });
  }
}

// ─── Connection tester ────────────────────────────────────────────────────────

export async function testProviderConnection(config: AIConfiguration): Promise<boolean> {
  const provider = buildProvider(config);
  try {
    return await provider.testConnection();
  } catch {
    return false;
  }
}
