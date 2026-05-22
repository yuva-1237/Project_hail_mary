/**
 * useMissionAI – Phase 6
 * React hook that manages the full AI reasoning lifecycle:
 *  – Triggers analyses asynchronously after agent collaboration resolves
 *  – Handles AUTO (instant approve) and MANUAL (commander review) decision modes
 *  – Maintains a 10-entry analysis history (newest first)
 */
import { useState, useRef, useCallback } from "react";
import type {
  AIAnalysis,
  AIConfiguration,
  AIReasoningRequest,
  AIStatus,
  CommanderVerdict,
} from "../ai/types";
import { runAIReasoning } from "../ai/aiManager";

// ─── Hook return type ─────────────────────────────────────────────────────────

export interface UseMissionAIReturn {
  /** Current AI pipeline status */
  aiStatus: AIStatus;
  /**
   * The latest fully-resolved analysis (auto-approved, or approved/rejected
   * by commander in manual mode).
   */
  currentAnalysis: AIAnalysis | null;
  /**
   * In MANUAL mode: analysis produced by AI but awaiting commander decision.
   * null in AUTO mode (auto-approved before exposing).
   */
  pendingAnalysis: AIAnalysis | null;
  /** Chronological log of up to 10 analyses, newest first */
  analysisHistory: AIAnalysis[];
  /** Trigger an asynchronous AI analysis for the given request and config */
  triggerAnalysis: (request: AIReasoningRequest, config: AIConfiguration) => void;
  /** Commander approves the pending analysis (manual mode) */
  approveAnalysis: () => AIAnalysis | null;
  /** Commander rejects the pending analysis (manual mode) */
  rejectAnalysis: () => AIAnalysis | null;
  /** Reset all AI state (called on mission reset) */
  resetAI: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMissionAI(): UseMissionAIReturn {
  const [aiStatus, setAiStatus]               = useState<AIStatus>("offline");
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AIAnalysis[]>([]);

  // Prevent state updates after reset / unmount
  const runIdRef = useRef(0);

  const pushHistory = useCallback((analysis: AIAnalysis) => {
    setAnalysisHistory((prev) => [analysis, ...prev].slice(0, 10));
  }, []);

  // ── Trigger ──────────────────────────────────────────────────────────────────
  const triggerAnalysis = useCallback(
    (request: AIReasoningRequest, config: AIConfiguration) => {
      const runId = ++runIdRef.current;

      setAiStatus("thinking");
      setCurrentAnalysis(null);
      setPendingAnalysis(null);

      const analysisId = `ai-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

      runAIReasoning(request, config)
        .then((result) => {
          if (runIdRef.current !== runId) return; // stale run — ignore

          const analysis: AIAnalysis = {
            id: analysisId,
            eventId: request.event.id,
            eventTitle: request.event.title,
            response: result.response,
            provider: result.provider,
            responseTimeMs: result.responseTimeMs,
            commanderVerdict: null,
            isFallback: result.isFallback,
            timestamp: new Date().toISOString(),
          };

          if (config.decisionMode === "auto") {
            // Auto-approve immediately
            const approved: AIAnalysis = { ...analysis, commanderVerdict: "approved" as CommanderVerdict };
            setCurrentAnalysis(approved);
            pushHistory(approved);
            setAiStatus("ready");
          } else {
            // Wait for commander review
            setPendingAnalysis(analysis);
            setAiStatus("ready");
          }
        })
        .catch((err) => {
          if (runIdRef.current !== runId) return;
          console.error("[useMissionAI] Analysis failed:", err);
          setAiStatus("error");
        });
    },
    [pushHistory]
  );

  // ── Commander approves ────────────────────────────────────────────────────────
  const approveAnalysis = useCallback((): AIAnalysis | null => {
    if (!pendingAnalysis) return null;
    const approved: AIAnalysis = { ...pendingAnalysis, commanderVerdict: "approved" };
    setCurrentAnalysis(approved);
    setPendingAnalysis(null);
    pushHistory(approved);
    return approved;
  }, [pendingAnalysis, pushHistory]);

  // ── Commander rejects ─────────────────────────────────────────────────────────
  const rejectAnalysis = useCallback((): AIAnalysis | null => {
    if (!pendingAnalysis) return null;
    const rejected: AIAnalysis = { ...pendingAnalysis, commanderVerdict: "rejected" };
    setCurrentAnalysis(rejected);
    setPendingAnalysis(null);
    pushHistory(rejected);
    return rejected;
  }, [pendingAnalysis, pushHistory]);

  // ── Reset (called when mission resets) ───────────────────────────────────────
  const resetAI = useCallback(() => {
    runIdRef.current++; // invalidate in-flight requests
    setAiStatus("offline");
    setCurrentAnalysis(null);
    setPendingAnalysis(null);
  }, []);

  return {
    aiStatus,
    currentAnalysis,
    pendingAnalysis,
    analysisHistory,
    triggerAnalysis,
    approveAnalysis,
    rejectAnalysis,
    resetAI,
  };
}
