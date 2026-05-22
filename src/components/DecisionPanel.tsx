import React from "react";
import { Cpu, CheckCircle2, ChevronRight } from "lucide-react";
import AnalysisIndicator from "./AnalysisIndicator";
import SeverityBadge from "./SeverityBadge";
import type { ActiveEvent } from "../data/events";
import type { Decision } from "../data/decisions";

interface DecisionPanelProps {
  activeEvent: ActiveEvent | null;
  activeDecision: Decision | null;
  decisionStatus: "idle" | "analyzing" | "resolved";
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  activeEvent,
  activeDecision,
  decisionStatus,
}) => {
  // 1. Idle state: No event active
  if (decisionStatus === "idle" || !activeEvent) {
    return (
      <div className="glass-panel p-5 rounded-lg border border-tau-teal/15 flex flex-col items-center justify-center text-center h-[260px] relative overflow-hidden select-none">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tau-teal/40" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tau-teal/40" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-tau-teal/40" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-tau-teal/40" />

        <div className="p-3 bg-tau-teal/5 rounded-full border border-tau-teal/10 text-tau-teal/40 mb-3 animate-pulse">
          <Cpu className="h-6 w-6" />
        </div>
        <h4 className="text-xs font-orbitron font-bold tracking-widest text-slate-400 uppercase">
          AI Decision Engine
        </h4>
        <p className="text-[10px] font-mono text-slate-500 mt-1.5 uppercase tracking-wider">
          Standby: No decisions pending.
        </p>
      </div>
    );
  }

  // 2. Analyzing state: Event active, countdown running
  if (decisionStatus === "analyzing") {
    return (
      <div className="glass-panel p-5 rounded-lg border border-astrophage/20 h-[260px] relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-astrophage/40" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-astrophage/40" />
        
        {/* Simple details of what is being analyzed */}
        <div className="flex justify-between items-start border-b border-slate-900 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-astrophage uppercase tracking-wider animate-pulse">
              ANALYZING TARGET:
            </span>
            <span className="text-xs font-bold font-orbitron text-white tracking-wide">
              {activeEvent.title}
            </span>
          </div>
          <SeverityBadge severity={activeEvent.severity} />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <AnalysisIndicator />
        </div>
      </div>
    );
  }

  // 3. Resolved state: Decision selected
  if (!activeDecision) return null;

  const getBorderColor = () => {
    switch (activeEvent.severity) {
      case "Critical":
        return "border-cyber-red/30 hover:border-cyber-red/50 glow-red";
      case "High":
        return "border-astrophage/30 hover:border-astrophage/50";
      case "Medium":
      case "Low":
      default:
        return "border-tau-teal/20 hover:border-tau-teal/45";
    }
  };

  return (
    <div
      className={`glass-panel p-5 rounded-lg border transition-all duration-300 h-[260px] relative overflow-hidden flex flex-col justify-between ${getBorderColor()}`}
    >
      {/* Corner notches */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tau-teal/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tau-teal/40" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-tau-teal/40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-tau-teal/40" />

      {/* Header Info */}
      <div className="flex justify-between items-start border-b border-tau-teal/10 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-cyber-green uppercase tracking-wider font-bold">
            RESOLVED STATE:
          </span>
          <span className="text-xs font-bold font-orbitron text-white tracking-wide">
            {activeDecision.eventTitle}
          </span>
        </div>
        <SeverityBadge severity={activeEvent.severity} />
      </div>

      {/* Available Actions (Horizontal pills list) */}
      <div className="my-2.5">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">
          Available Responses:
        </span>
        <div className="flex flex-wrap gap-2">
          {activeDecision.availableActions.map((action, idx) => {
            const isSelected = action === activeDecision.selectedAction;
            return (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                  isSelected
                    ? "bg-cyber-green/10 text-cyber-green border-cyber-green/40 font-bold glow-green"
                    : "bg-slate-950/40 text-slate-500 border-slate-900 opacity-60"
                }`}
              >
                {isSelected && <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyber-green animate-ping mr-1" />}
                {action}
              </span>
            );
          })}
        </div>
      </div>

      {/* Decision Selection detail & Reasoning */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3.5 border-t border-tau-teal/5 pt-2.5">
        {/* Selected & Reasoning */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-cyber-green" /> AI Selected Action
          </span>
          <span className="text-[11px] font-bold font-orbitron text-white tracking-wide uppercase">
            {activeDecision.selectedAction}
          </span>
          <span className="text-[9.5px] font-mono text-slate-400 mt-1 leading-4 italic">
            "{activeDecision.reasoning}"
          </span>
        </div>

        {/* Outcome & Success Probability Impact */}
        <div className="flex flex-col border-l border-tau-teal/5 pl-3">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-tau-teal" /> Applied Outcome
          </span>
          <span className="text-[10px] font-mono text-slate-300 leading-4">
            {activeDecision.outcome}
          </span>
          <span className="text-[9.5px] font-mono text-cyber-green font-bold mt-1.5 tracking-wide">
            MISSION SAFEGUARDED: +{activeDecision.successImpact}% SUCCESS PROBABILITY
          </span>
        </div>
      </div>
    </div>
  );
};
export default DecisionPanel;
