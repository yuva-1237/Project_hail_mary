/**
 * AISettings – Phase 6
 * Modal panel for configuring the AI provider, decision mode, and API keys.
 * Persists settings to localStorage. Supports "Test Connection" per provider.
 */
import React, { useState, useEffect } from "react";
import {
  X, Brain, Key, Zap, CheckCircle2, XCircle, Loader2,
  ToggleLeft, Radio,
} from "lucide-react";
import type { AIConfiguration, AIProvider } from "../ai/types";
import { DEFAULT_AI_CONFIG, AI_CONFIG_STORAGE_KEY } from "../ai/types";
import { testProviderConnection } from "../ai/aiManager";

interface AISettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AIConfiguration) => void;
  currentConfig: AIConfiguration;
}

type TestStatus = "idle" | "testing" | "ok" | "fail";

const PROVIDER_INFO: Record<AIProvider, { label: string; note: string }> = {
  mock:      { label: "Mission AI (Offline)",   note: "No API key required. Works fully offline with event-aware simulated reasoning." },
  openai:    { label: "OpenAI GPT-4o Mini",     note: "Requires an OpenAI API key. Supports browser CORS. Fast and cost-effective." },
  anthropic: { label: "Anthropic Claude Haiku", note: "Requires an Anthropic API key. Note: Anthropic blocks browser CORS — a server proxy may be needed." },
  gemini:    { label: "Google Gemini Flash",    note: "Requires a Google Gemini API key. Supports browser CORS natively." },
};

const AISettings: React.FC<AISettingsProps> = ({ isOpen, onClose, onSave, currentConfig }) => {
  const [draft, setDraft] = useState<AIConfiguration>({ ...currentConfig, decisionMode: "manual" });
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [saved, setSaved] = useState(false);

  // Sync draft with external config changes
  useEffect(() => {
    setDraft({ ...currentConfig, decisionMode: "manual" });
    setTestStatus("idle");
    setSaved(false);
  }, [currentConfig, isOpen]);

  if (!isOpen) return null;

  const handleProviderChange = (p: AIProvider) => {
    setDraft((d) => ({ ...d, provider: p }));
    setTestStatus("idle");
  };

  const handleTestConnection = async () => {
    setTestStatus("testing");
    const ok = await testProviderConnection(draft);
    setTestStatus(ok ? "ok" : "fail");
  };

  const handleSave = () => {
    try {
      localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore storage errors
    }
    onSave(draft);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_AI_CONFIG, decisionMode: "manual" });
    setTestStatus("idle");
  };

  const providerInfo = PROVIDER_INFO[draft.provider];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md glass-panel rounded-xl border border-tau-teal/25 p-0 overflow-hidden shadow-2xl">
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-tau-teal/60" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-tau-teal/60" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-tau-teal/15">
          <h2 className="text-sm font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
            <Brain className="h-4 w-4 text-tau-teal" />
            AI Configuration
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* ── Provider Selection ───────────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-mono text-tau-teal uppercase tracking-widest mb-2 flex items-center gap-1">
              <Radio className="h-3 w-3" /> AI Provider
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["mock", "openai", "anthropic", "gemini"] as AIProvider[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handleProviderChange(p)}
                  className={`text-left px-3 py-2 rounded-lg border text-[10px] font-mono transition-all ${
                    draft.provider === p
                      ? "border-tau-teal/60 bg-tau-teal/10 text-tau-teal"
                      : "border-slate-700/50 bg-slate-900/30 text-slate-400 hover:border-tau-teal/30 hover:text-slate-200"
                  }`}
                >
                  <span className="font-bold block">{PROVIDER_INFO[p].label}</span>
                </button>
              ))}
            </div>
            <p className="text-[9px] font-mono text-slate-500 mt-2 leading-relaxed">
              {providerInfo.note}
            </p>
          </div>

          {/* ── API Keys (only for non-mock) ─────────────────────────────── */}
          {draft.provider !== "mock" && (
            <div>
              <p className="text-[10px] font-mono text-tau-teal uppercase tracking-widest mb-2 flex items-center gap-1">
                <Key className="h-3 w-3" /> API Key
              </p>
              {draft.provider === "openai" && (
                <input
                  type="password"
                  placeholder="sk-..."
                  value={draft.openaiApiKey}
                  onChange={(e) => setDraft((d) => ({ ...d, openaiApiKey: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-[11px] font-mono text-white placeholder-slate-600 focus:outline-none focus:border-tau-teal/50"
                />
              )}
              {draft.provider === "anthropic" && (
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  value={draft.anthropicApiKey}
                  onChange={(e) => setDraft((d) => ({ ...d, anthropicApiKey: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-[11px] font-mono text-white placeholder-slate-600 focus:outline-none focus:border-tau-teal/50"
                />
              )}
              {draft.provider === "gemini" && (
                <input
                  type="password"
                  placeholder="AIza..."
                  value={draft.geminiApiKey}
                  onChange={(e) => setDraft((d) => ({ ...d, geminiApiKey: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-[11px] font-mono text-white placeholder-slate-600 focus:outline-none focus:border-tau-teal/50"
                />
              )}

              {/* Test connection */}
              <button
                onClick={handleTestConnection}
                disabled={testStatus === "testing"}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/50 text-[10px] font-mono text-slate-400 hover:text-tau-teal hover:border-tau-teal/30 transition-all disabled:opacity-50"
              >
                {testStatus === "testing" && <Loader2 className="h-3 w-3 animate-spin" />}
                {testStatus === "ok"      && <CheckCircle2 className="h-3 w-3 text-cyber-green" />}
                {testStatus === "fail"    && <XCircle className="h-3 w-3 text-rose-400" />}
                {testStatus === "idle"    && <Zap className="h-3 w-3" />}
                {testStatus === "testing" ? "Testing..." : testStatus === "ok" ? "Connected" : testStatus === "fail" ? "Failed" : "Test Connection"}
              </button>
            </div>
          )}

          {/* ── Decision Mode ─────────────────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-mono text-tau-teal uppercase tracking-widest mb-2 flex items-center gap-1">
              <Zap className="h-3 w-3" /> Decision Mode
            </p>
            <div
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-red-500/25 bg-red-950/10 cursor-not-allowed opacity-80"
              title="Locked by HGACS Mission Rules"
            >
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-mono font-bold text-red-400 flex items-center gap-1.5">
                  🛡️ HGACS ENFORCED: MANUAL MODE
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  ALL anomalies require human authorization. Automatic execution is locked.
                </span>
              </div>
              <ToggleLeft className="h-6 w-6 text-red-400 shrink-0" />
            </div>
          </div>

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div className="flex gap-2 pt-1 border-t border-slate-800">
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-lg border border-slate-700/50 text-[10px] font-mono text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all"
            >
              Reset Defaults
            </button>
            <button
              onClick={handleSave}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[11px] font-mono font-bold uppercase tracking-wider transition-all ${
                saved
                  ? "border-cyber-green/40 bg-cyber-green/15 text-cyber-green"
                  : "border-tau-teal/40 bg-tau-teal/10 text-tau-teal hover:bg-tau-teal/20"
              }`}
            >
              {saved ? <><CheckCircle2 className="h-3.5 w-3.5" /> Saved</> : "Save Configuration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettings;
