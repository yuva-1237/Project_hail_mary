import React, { useState } from "react";
import { Beaker, ShieldAlert, Activity, ArrowRight, X } from "lucide-react";
import type { SpacecraftState } from "../data/spacecraft";
import { generateAREForecast } from "../ai/adaptiveResilience";

interface WhatIfExplorerProps {
  currentState: SpacecraftState;
  onClose: () => void;
}

const WhatIfExplorer: React.FC<WhatIfExplorerProps> = ({ currentState, onClose }) => {
  const [hypotheticalState, setHypotheticalState] = useState<SpacecraftState>({ ...currentState });

  const forecasts = generateAREForecast(hypotheticalState);

  const calculateHypotheticalSuccess = () => {
    // Rough heuristic for demonstration based on the current success probability metric behavior
    let penalty = 0;
    if (hypotheticalState.health < 40) penalty += 15;
    if (hypotheticalState.fuel < 30) penalty += 10;
    if (hypotheticalState.power < 30) penalty += 10;
    if (hypotheticalState.oxygen < 30) penalty += 10;
    if (!hypotheticalState.communication) penalty += 15;
    
    // Simulate cascading penalties
    penalty += forecasts.length * 5;

    return Math.max(0, 95 - penalty); // Assuming optimal base is 95
  };

  const hypotheticalSuccess = calculateHypotheticalSuccess();

  const handleSliderChange = (key: keyof SpacecraftState, value: number) => {
    setHypotheticalState(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl shadow-cyan-500/20 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/30 flex justify-between items-center bg-cyan-900/20">
          <h3 className="text-xl font-orbitron font-bold text-cyan-400 flex items-center gap-2">
            <Beaker className="w-5 h-5" />
            What-If Scenario Sandbox
          </h3>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
          
          {/* Left: Controls */}
          <div className="p-6 border-r border-slate-800 overflow-y-auto flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-mono font-bold text-slate-300 uppercase">System Parameters</h4>
              <p className="text-xs text-slate-500">Modify the current spacecraft state to simulate outcomes.</p>
            </div>

            <div className="flex flex-col gap-4">
              {['fuel', 'power', 'oxygen', 'health'].map((metric) => (
                <div key={metric} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase">{metric}</label>
                    <span className="text-xs font-mono text-cyan-400">{hypotheticalState[metric as keyof SpacecraftState]}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={hypotheticalState[metric as keyof SpacecraftState] as number}
                    onChange={(e) => handleSliderChange(metric as keyof SpacecraftState, parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 rounded-lg appearance-none h-2 cursor-pointer"
                  />
                </div>
              ))}
              
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">Communication Relay</span>
                <button 
                  onClick={() => handleSliderChange('communication', hypotheticalState.communication ? 0 : 1)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${hypotheticalState.communication ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30' : 'bg-cyber-red/20 text-cyber-red border border-cyber-red/30'}`}
                >
                  {hypotheticalState.communication ? 'ONLINE' : 'OFFLINE'}
                </button>
              </div>
            </div>

            <button 
              onClick={() => setHypotheticalState({ ...currentState })}
              className="mt-auto px-4 py-2 border border-slate-700 text-slate-400 rounded-lg font-mono text-xs hover:bg-slate-800 transition-colors"
            >
              Reset to Current Mission State
            </button>
          </div>

          {/* Right: Outcomes */}
          <div className="p-6 bg-slate-900/50 overflow-y-auto flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-mono font-bold text-cyan-400 uppercase flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Simulated Outcome
              </h4>
            </div>

            <div className="p-4 border border-slate-800 bg-slate-900 rounded-lg flex items-center justify-between">
              <span className="font-mono text-sm text-slate-400">Hypothetical Success Prob:</span>
              <span className={`text-2xl font-orbitron font-bold ${hypotheticalSuccess > 70 ? 'text-cyber-green' : hypotheticalSuccess > 40 ? 'text-amber-500' : 'text-cyber-red'}`}>
                {hypotheticalSuccess}%
              </span>
            </div>

            {forecasts.length > 0 ? (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-mono font-bold text-amber-500 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Cascading Failures Predicted (ARE)
                </h4>
                {forecasts.map(f => (
                  <div key={f.id} className="p-3 border border-amber-500/20 bg-amber-500/5 rounded flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-500">{f.system}</span>
                      <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 px-1.5 rounded">{f.probability}% RISK</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Time to failure: {f.timeToFailure}</span>
                    <div className="mt-1 flex gap-2 items-start border-t border-amber-500/10 pt-2">
                      <ArrowRight className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                      <span className="text-[10px] text-cyan-300 font-mono leading-tight">{f.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border border-slate-800 border-dashed rounded-lg flex items-center justify-center text-center">
                <span className="text-slate-500 font-mono text-xs">No cascading failures predicted under these conditions.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfExplorer;
