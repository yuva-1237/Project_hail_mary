/**
 * MissionIntelligence – Phase 6
 * Main AI reasoning panel. Shows AI status, streaming reasoning text,
 * confidence gauge, risks, predicted impact, and Commander approval section.
 */
import React, { useState, useEffect } from "react";
import { Brain, Zap, AlertTriangle, Target, Clock, Cpu, Loader2 } from "lucide-react";
import type { AIAnalysis, AIStatus, DecisionMode } from "../ai/types";
import AIStatusBadge from "./AIStatusBadge";
import CommanderApproval from "./CommanderApproval";

interface MissionIntelligenceProps {
  aiStatus: AIStatus;
  currentAnalysis: AIAnalysis | null;
  pendingAnalysis: AIAnalysis | null;
  decisionMode: DecisionMode;
  onApprove: () => void;
  onReject: () => void;
  onOpenSettings: () => void;
}

// ─── Streaming text animation ─────────────────────────────────────────────────

function useStreamingText(fullText: string, active: boolean): string {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!active || !fullText) {
      setDisplayed(fullText);
      return;
    }
    setDisplayed("");
    let idx = 0;
    const id = setInterval(() => {
      idx += 3;
      setDisplayed(fullText.slice(0, idx));
      if (idx >= fullText.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [fullText, active]);

  return displayed;
}

// ─── Confidence bar ───────────────────────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 85 ? "bg-emerald-500" :
    value >= 65 ? "bg-sky-400" :
    value >= 45 ? "bg-amber-400" :
    "bg-rose-500";

  const textColor =
    value >= 85 ? "text-emerald-400" :
    value >= 65 ? "text-sky-400" :
    value >= 45 ? "text-amber-400" :
    "text-rose-400";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`text-[11px] font-mono font-bold shrink-0 w-8 text-right ${textColor}`}>
        {value}%
      </span>
    </div>
  );
}

// ─── Thinking skeleton ────────────────────────────────────────────────────────

function ThinkingSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="flex items-center gap-3 justify-center py-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-tau-teal/30 border-t-tau-teal animate-spin" />
          <Brain className="h-4 w-4 text-tau-teal absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-mono text-tau-teal animate-pulse">
            Mission Intelligence analysing...
          </span>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-tau-teal/60 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-2 px-2">
        <div className="h-2 bg-slate-700/50 rounded w-full" />
        <div className="h-2 bg-slate-700/50 rounded w-4/5" />
        <div className="h-2 bg-slate-700/50 rounded w-3/5" />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const MissionIntelligence: React.FC<MissionIntelligenceProps> = ({
  aiStatus,
  currentAnalysis,
  pendingAnalysis,
  decisionMode,
  onApprove,
  onReject,
  onOpenSettings,
}) => {
  const analysis = currentAnalysis ?? pendingAnalysis;
  const reasoningText = analysis?.response.reasoning ?? "";
  const isNewAnalysis = aiStatus === "ready" && !!analysis;
  const streamedReasoning = useStreamingText(reasoningText, isNewAnalysis);

  const isThinking = aiStatus === "thinking";
  const hasData    = !!analysis;

  return (
    <div className="glass-panel rounded-lg border border-tau-teal/20 flex flex-col relative overflow-hidden">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-tau-teal/50" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-tau-teal/50" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-tau-teal/10">
        <h3 className="text-xs font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <Brain className="h-4 w-4 text-tau-teal" />
          Mission Intelligence
        </h3>
        <div className="flex items-center gap-2">
          <AIStatusBadge status={aiStatus} isFallback={analysis?.isFallback} />
          <button
            onClick={onOpenSettings}
            className="text-[9px] font-mono text-slate-500 hover:text-tau-teal transition-colors px-1.5 py-0.5 rounded border border-slate-700/50 hover:border-tau-teal/30"
            title="AI Settings"
          >
            ⚙ CONFIG
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 flex flex-col gap-3">

        {/* Thinking state */}
        {isThinking && <ThinkingSkeleton />}

        {/* Idle / offline */}
        {!isThinking && !hasData && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <Brain className="h-8 w-8 text-slate-700" />
            <p className="text-[11px] font-mono text-slate-500">Awaiting mission analysis.</p>
            <p className="text-[10px] text-slate-600">
              AI reasoning activates automatically when a mission event is detected.
            </p>
          </div>
        )}

        {/* Analysis revealed */}
        {!isThinking && hasData && analysis && (
          <>
            {/* Selected action */}
            <div className="rounded-md bg-tau-teal/10 border border-tau-teal/25 p-3">
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Zap className="h-3 w-3 text-tau-teal" /> Selected Command
              </p>
              <p className="text-[15px] font-orbitron font-bold text-white tracking-wide leading-tight">
                {analysis.response.selectedAction}
              </p>
            </div>

            {/* Streaming reasoning */}
            <div className="flex flex-col gap-1">
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Cpu className="h-3 w-3 text-tau-teal" /> AI Reasoning
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed font-mono bg-slate-950/40 border border-slate-900 rounded p-2 min-h-[52px]">
                {streamedReasoning}
                {streamedReasoning.length < reasoningText.length && (
                  <span className="inline-block w-1.5 h-3.5 bg-tau-teal ml-0.5 animate-pulse align-middle" />
                )}
              </p>
            </div>

            {/* Confidence */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                Confidence Score
              </p>
              <ConfidenceBar value={analysis.response.confidence} />
            </div>

            {/* Risks */}
            {analysis.response.risks.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-amber-400" /> Identified Risks
                </p>
                <ul className="space-y-1">
                  {analysis.response.risks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[10px] font-mono text-slate-400">
                      <span className="text-amber-500 shrink-0 mt-0.5">▸</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Predicted impact */}
            <div className="flex flex-col gap-1">
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Target className="h-3 w-3 text-sky-400" /> Predicted Mission Impact
              </p>
              <p className="text-[11px] text-sky-300 font-mono leading-relaxed bg-sky-500/5 border border-sky-500/15 rounded p-2">
                {analysis.response.predictedImpact}
              </p>
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-600 border-t border-slate-900 pt-2">
              <div className="flex items-center gap-1">
                <Loader2 className="h-3 w-3" />
                <span>
                  Provider: <span className="text-tau-teal/60">{analysis.provider}</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{analysis.responseTimeMs}ms</span>
                {analysis.isFallback && (
                  <span className="text-orange-400 ml-1">[fallback]</span>
                )}
              </div>
            </div>

            {/* Commander approval section */}
            <CommanderApproval
              pendingAnalysis={pendingAnalysis}
              currentAnalysis={currentAnalysis}
              decisionMode={decisionMode}
              onApprove={onApprove}
              onReject={onReject}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MissionIntelligence;
