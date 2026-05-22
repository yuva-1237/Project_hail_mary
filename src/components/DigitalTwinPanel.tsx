import React, { useState } from "react";
import { Cpu, Server, Database } from "lucide-react";
import type { SimulationResult } from "../digitalTwin/simulateAction";
import DecisionComparison from "./DecisionComparison";
import CommanderDecision from "./CommanderDecision";
import type { CommanderDecision as CommDecisionType } from "../types/agents";

interface DigitalTwinPanelProps {
  predictions: SimulationResult[];
  status: "idle" | "analyzing" | "resolved";
  commanderDecision: CommDecisionType | null;
  decisionMode: "auto" | "manual";
  onApprove: () => void;
  onReject: () => void;
  commanderVerdict: "approved" | "rejected" | null;
}

export const DigitalTwinPanel: React.FC<DigitalTwinPanelProps> = ({
  predictions,
  status,
  commanderDecision,
  decisionMode,
  onApprove,
  onReject,
  commanderVerdict,
}) => {
  const [selectedActionIndex, setSelectedActionIndex] = useState<number>(0);

  const hasData = predictions.length > 0;
  const currentSim = hasData ? predictions[selectedActionIndex] : null;

  // Sync selected index with commander's recommendation initially
  React.useEffect(() => {
    if (commanderDecision && hasData) {
      const idx = predictions.findIndex(
        (p) => p.actionName.toLowerCase() === commanderDecision.finalAction.toLowerCase()
      );
      if (idx !== -1) {
        setSelectedActionIndex(idx);
      }
    }
  }, [commanderDecision, hasData, predictions]);

  const getMetricColor = (val: number) => {
    if (val > 60) return "text-cyber-green";
    if (val > 25) return "text-astrophage";
    return "text-cyber-red animate-pulse";
  };

  return (
    <div className="glass-panel p-4 rounded-lg border border-tau-teal/20 relative overflow-hidden flex flex-col gap-4">
      {/* Laser scanner animation */}
      {status === "analyzing" && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-tau-teal/60 blur-xs animate-laser-scan z-10" />
      )}

      {/* Corners */}
      <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-tau-teal/50" />
      <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-tau-teal/50" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-tau-teal/15 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Server className="h-4.5 w-4.5 text-tau-teal animate-pulse" />
            {status === "analyzing" && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tau-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tau-teal"></span>
              </span>
            )}
          </div>
          <div>
            <h3 className="text-xs font-orbitron font-bold text-white tracking-widest uppercase">
              Digital Twin Simulation Engine
            </h3>
            <p className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">
              Virtual Sandboxed Decoupled Telemetry Sandbox
            </p>
          </div>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono text-slate-500 uppercase">Twin Link:</span>
          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
            status === "resolved"
              ? "text-cyber-green border-cyber-green/30 bg-cyber-green/5"
              : status === "analyzing"
              ? "text-tau-teal border-tau-teal/30 bg-tau-teal/5 animate-pulse"
              : "text-slate-500 border-slate-700/30 bg-slate-900/10"
          }`}>
            {status === "resolved" ? "● OUTCOMES READY" : status === "analyzing" ? "⟳ RUNNING SIMULATIONS" : "○ OFFLINE STANDBY"}
          </span>
        </div>
      </div>

      {/* Idle state */}
      {status === "idle" && !hasData && (
        <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-lg bg-slate-950/10 gap-2 min-h-[220px]">
          <Database className="h-8 w-8 text-slate-700" />
          <p className="text-[11px] font-mono text-slate-500">Decoupled Simulation Sandbox Empty</p>
          <p className="text-[9px] text-slate-600 max-w-sm">
            Digital Twin automatically clones and replicates telemetry when alerts trigger, running predictive simulations of all available courses of action.
          </p>
        </div>
      )}

      {/* Simulator Revealed */}
      {(status === "analyzing" || hasData) && (
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left 60%: Comparison grid */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                Predicted Courses of Action
              </span>
              {currentSim && (
                <span className="text-[9px] font-mono text-tau-teal/70 uppercase">
                  Showing Clone projection: <span className="font-bold text-white">{currentSim.actionName}</span>
                </span>
              )}
            </div>

            {/* Comparison table */}
            <DecisionComparison
              predictions={predictions}
              selectedActionName={currentSim ? currentSim.actionName : null}
              onSelectAction={(name) => {
                const idx = predictions.findIndex((p) => p.actionName === name);
                if (idx !== -1) setSelectedActionIndex(idx);
              }}
              interactive={status === "resolved"}
            />

            {/* Monte Carlo Risk Distribution */}
            {currentSim?.riskDistribution && (
              <div className="flex flex-col gap-2 p-3 rounded-lg border border-fuchsia-500/20 bg-slate-950/40 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Database className="h-3 w-3 text-fuchsia-400" /> Monte Carlo Risk Distribution ({currentSim.monteCarloIterations} iterations)
                  </span>
                </div>
                <div className="flex h-4 w-full rounded overflow-hidden mt-1">
                  <div style={{ width: `${currentSim.riskDistribution.safe}%` }} className="bg-cyber-green/80 flex items-center justify-center text-[8px] font-bold text-white">
                    {currentSim.riskDistribution.safe > 10 ? `${currentSim.riskDistribution.safe}% SAFE` : ''}
                  </div>
                  <div style={{ width: `${currentSim.riskDistribution.moderateRisk}%` }} className="bg-amber-500/80 flex items-center justify-center text-[8px] font-bold text-white">
                    {currentSim.riskDistribution.moderateRisk > 10 ? `${currentSim.riskDistribution.moderateRisk}% MODERATE` : ''}
                  </div>
                  <div style={{ width: `${currentSim.riskDistribution.criticalRisk}%` }} className="bg-cyber-red/80 flex items-center justify-center text-[8px] font-bold text-white">
                    {currentSim.riskDistribution.criticalRisk > 10 ? `${currentSim.riskDistribution.criticalRisk}% CRITICAL` : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Cloned Post-Action Spacecraft Preview */}
            {currentSim && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3 rounded-lg border border-tau-teal/10 bg-slate-950/20 animate-fade-in">
                <div className="col-span-2 sm:col-span-5 border-b border-slate-900 pb-1 flex items-center justify-between">
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Cpu className="h-3 w-3 text-tau-teal" /> Projected Spacecraft State (Cloned)
                  </span>
                  <span className="text-[8px] font-mono text-cyber-green font-bold uppercase">
                    Sandbox Isolated
                  </span>
                </div>
                <div className="p-2 bg-slate-950/45 rounded border border-slate-900 flex flex-col">
                  <span className="text-[8px] font-mono text-slate-500 uppercase">Sim Fuel</span>
                  <span className={`text-xs font-orbitron font-bold mt-1 ${getMetricColor(currentSim.resultingState.fuel)}`}>
                    {currentSim.resultingState.fuel}%
                  </span>
                </div>
                <div className="p-2 bg-slate-950/45 rounded border border-slate-900 flex flex-col">
                  <span className="text-[8px] font-mono text-slate-500 uppercase">Sim Power</span>
                  <span className={`text-xs font-orbitron font-bold mt-1 ${getMetricColor(currentSim.resultingState.power)}`}>
                    {currentSim.resultingState.power}%
                  </span>
                </div>
                <div className="p-2 bg-slate-950/45 rounded border border-slate-900 flex flex-col">
                  <span className="text-[8px] font-mono text-slate-500 uppercase">Sim Oxygen</span>
                  <span className={`text-xs font-orbitron font-bold mt-1 ${getMetricColor(currentSim.resultingState.oxygen)}`}>
                    {currentSim.resultingState.oxygen}%
                  </span>
                </div>
                <div className="p-2 bg-slate-950/45 rounded border border-slate-900 flex flex-col">
                  <span className="text-[8px] font-mono text-slate-500 uppercase">Sim Hull</span>
                  <span className={`text-xs font-orbitron font-bold mt-1 ${getMetricColor(currentSim.resultingState.health)}`}>
                    {currentSim.resultingState.health}%
                  </span>
                </div>
                <div className="p-2 bg-slate-950/45 rounded border border-slate-900 flex flex-col">
                  <span className="text-[8px] font-mono text-slate-500 uppercase">Sim Progress</span>
                  <span className="text-xs font-orbitron font-bold text-white mt-1">
                    {currentSim.resultingState.missionProgress}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right 40%: Commander Selection & Approval */}
          <div className="lg:w-[320px] shrink-0 flex flex-col gap-3">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Autonomous Commander Output
            </span>
            <CommanderDecision
              decision={commanderDecision}
              predictedSuccess={currentSim ? currentSim.successProbability : null}
              decisionMode={decisionMode}
              status={status}
              onApprove={onApprove}
              onReject={onReject}
              commanderVerdict={commanderVerdict}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default DigitalTwinPanel;
