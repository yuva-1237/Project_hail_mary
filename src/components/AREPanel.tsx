import React from "react";
import { ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import type { AREForecast } from "../ai/adaptiveResilience";

interface AREPanelProps {
  forecasts: AREForecast[];
}

const AREPanel: React.FC<AREPanelProps> = ({ forecasts }) => {
  if (forecasts.length === 0) return null;

  return (
    <div className="glass-panel p-4 rounded-lg border border-amber-500/30 flex flex-col gap-3 relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500/50" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-500/50" />
      
      <div className="flex justify-between items-center border-b border-amber-500/10 pb-2">
        <h3 className="text-xs font-orbitron font-bold text-amber-500 tracking-widest uppercase flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 animate-pulse" />
          Adaptive Resilience Engine (ARE)
        </h3>
        <span className="text-[9px] font-mono text-amber-500/70">PREDICTIVE FORECAST</span>
      </div>

      <div className="flex flex-col gap-2">
        {forecasts.map((forecast) => (
          <div key={forecast.id} className="bg-slate-900/50 border border-slate-800 rounded p-3 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" />
                Secondary Failure Risk: {forecast.system}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                {forecast.probability}% PROB
              </span>
            </div>
            
            <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
              <span className="text-amber-500/70">EST. TIMEFRAME:</span> {forecast.timeToFailure}
            </p>
            
            <div className="mt-1 pt-2 border-t border-slate-800 flex items-start gap-1.5">
              <ArrowRight className="h-3 w-3 text-cyan-500 mt-0.5 shrink-0" />
              <p className="text-[10px] font-mono text-cyan-400">
                <span className="text-slate-500">RECOMMENDED ACTION:</span> {forecast.recommendation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AREPanel;
