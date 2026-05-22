import React from "react";
import type { SimulationResult } from "../digitalTwin/simulateAction";
import { AlertTriangle, Battery, Droplet, Wind, Heart, TrendingUp, CheckCircle } from "lucide-react";

interface DecisionComparisonProps {
  predictions: SimulationResult[];
  selectedActionName: string | null;
  onSelectAction?: (actionName: string) => void;
  interactive?: boolean;
}

export const DecisionComparison: React.FC<DecisionComparisonProps> = ({
  predictions,
  selectedActionName,
  onSelectAction,
  interactive = false,
}) => {
  const formatDelta = (delta: number) => {
    if (delta > 0) return `+${delta}%`;
    if (delta < 0) return `${delta}%`;
    return "0%";
  };

  const getDeltaClass = (delta: number) => {
    if (delta > 0) return "text-cyber-green font-bold";
    if (delta < 0) return "text-cyber-red font-bold";
    return "text-slate-400";
  };

  const getSuccessClass = (prob: number) => {
    if (prob >= 85) return "text-cyber-green font-semibold";
    if (prob >= 60) return "text-astrophage font-semibold";
    return "text-cyber-red glow-red font-bold animate-pulse";
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-tau-teal/15 bg-slate-950/40">
      <table className="w-full text-left border-collapse text-[11px] font-mono">
        <thead>
          <tr className="border-b border-tau-teal/10 bg-tau-teal/5 text-tau-teal uppercase tracking-wider text-[9px]">
            <th className="py-2.5 px-3">Action Name</th>
            <th className="py-2.5 px-3">Resource Impact</th>
            <th className="py-2.5 px-3">Predicted Benefits</th>
            <th className="py-2.5 px-3">Predicted Risks</th>
            <th className="py-2.5 px-3 text-right">Success Prob</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900">
          {predictions.map((sim) => {
            const isCommanderSelected = selectedActionName === sim.actionName;
            return (
              <tr
                key={sim.actionName}
                onClick={() => interactive && onSelectAction && onSelectAction(sim.actionName)}
                className={`transition-all ${
                  isCommanderSelected
                    ? "bg-tau-teal/10 border-l-2 border-l-tau-teal font-semibold animate-pulse-slow"
                    : interactive
                    ? "hover:bg-slate-900/40 cursor-pointer"
                    : ""
                }`}
              >
                {/* Action Name */}
                <td className="py-3 px-3 align-top min-w-[120px]">
                  <div className="flex items-center gap-1.5">
                    {isCommanderSelected && <CheckCircle className="h-3.5 w-3.5 text-tau-teal shrink-0" />}
                    <span className={isCommanderSelected ? "text-white" : "text-slate-400"}>
                      {sim.actionName}
                    </span>
                  </div>
                </td>

                {/* Resource Impact */}
                <td className="py-3 px-3 align-top min-w-[210px]">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <div className="flex items-center gap-1">
                      <Droplet className="h-3 w-3 text-sky-400 shrink-0" />
                      <span className="text-slate-500">Fuel:</span>
                      <span className={getDeltaClass(sim.fuelDelta)}>{formatDelta(sim.fuelDelta)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Battery className="h-3 w-3 text-amber-400 shrink-0" />
                      <span className="text-slate-500">Power:</span>
                      <span className={getDeltaClass(sim.powerDelta)}>{formatDelta(sim.powerDelta)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wind className="h-3 w-3 text-teal-400 shrink-0" />
                      <span className="text-slate-500">Oxygen:</span>
                      <span className={getDeltaClass(sim.oxygenDelta)}>{formatDelta(sim.oxygenDelta)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-rose-400 shrink-0" />
                      <span className="text-slate-500">Hull:</span>
                      <span className={getDeltaClass(sim.healthDelta)}>{formatDelta(sim.healthDelta)}</span>
                    </div>
                  </div>
                </td>

                {/* Benefits */}
                <td className="py-3 px-3 align-top text-slate-300 leading-normal max-w-[180px]">
                  <div className="flex items-start gap-1">
                    <TrendingUp className="h-3 w-3 text-cyber-green shrink-0 mt-0.5" />
                    <span>{sim.benefits}</span>
                  </div>
                </td>

                {/* Risks */}
                <td className="py-3 px-3 align-top text-slate-400 leading-normal max-w-[180px]">
                  <div className="flex items-start gap-1">
                    <AlertTriangle className="h-3 w-3 text-astrophage shrink-0 mt-0.5" />
                    <span>{sim.risks}</span>
                  </div>
                </td>

                {/* Success Prob */}
                <td className="py-3 px-3 align-top text-right min-w-[90px]">
                  <div className="flex flex-col items-end">
                    <span className={`text-[13px] ${getSuccessClass(sim.successProbability)}`}>
                      {sim.successProbability}%
                    </span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">Projected</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
export default DecisionComparison;
