import React from "react";
import { BarChart, Activity, Shield, BrainCircuit, X } from "lucide-react";

interface AdvancedAnalyticsProps {
  onClose: () => void;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl shadow-indigo-500/20 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-indigo-500/30 flex justify-between items-center bg-indigo-900/20">
          <div className="flex flex-col">
            <h3 className="text-xl font-orbitron font-bold text-indigo-400 flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Advanced Mission Analytics
            </h3>
            <span className="text-xs font-mono text-slate-400">Post-Mortem & Real-Time Intelligence Evaluation</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-[#0a0f18]">
          
          {/* Agent Performance Rankings */}
          <div>
            <h4 className="text-sm font-mono font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-400" /> Agent Performance & Prediction Accuracy
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { name: "Commander AI", score: 98, accuracy: "99.2%", color: "text-amber-400", border: "border-amber-400/30", bg: "bg-amber-400/10" },
                { name: "Safety AI", score: 95, accuracy: "97.5%", color: "text-cyber-green", border: "border-cyber-green/30", bg: "bg-cyber-green/10" },
                { name: "Resource AI", score: 92, accuracy: "94.8%", color: "text-blue-400", border: "border-blue-400/30", bg: "bg-blue-400/10" },
                { name: "Navigation AI", score: 88, accuracy: "91.0%", color: "text-purple-400", border: "border-purple-400/30", bg: "bg-purple-400/10" }
              ].map(agent => (
                <div key={agent.name} className={`p-4 rounded-lg border ${agent.border} ${agent.bg} flex flex-col gap-2`}>
                  <span className={`font-orbitron font-bold ${agent.color}`}>{agent.name}</span>
                  <div className="flex justify-between items-end mt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Approval Rating</span>
                      <span className="text-xl font-bold text-slate-200">{agent.score}%</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Predictive Acc.</span>
                      <span className="text-sm font-mono text-slate-300">{agent.accuracy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Resource Burn-down Heatmap (Mocked) */}
            <div className="border border-slate-800 rounded-xl p-5 bg-slate-900/50">
              <h4 className="text-sm font-mono font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Resource Burn-down Matrix
              </h4>
              <div className="flex flex-col gap-3">
                {[
                  { phase: "Launch & Ascent", fuel: 80, power: 30, oxygen: 10 },
                  { phase: "Orbital Insertion", fuel: 40, power: 60, oxygen: 20 },
                  { phase: "Deep Space Cruise", fuel: 10, power: 20, oxygen: 40 },
                  { phase: "Anomaly Encounter", fuel: 90, power: 95, oxygen: 85 },
                ].map(row => (
                  <div key={row.phase} className="flex items-center gap-4">
                    <span className="w-32 text-xs font-mono text-slate-400 truncate">{row.phase}</span>
                    <div className="flex-1 flex gap-1 h-6">
                      <div style={{ width: '33%', opacity: row.fuel / 100 }} className="bg-amber-500 h-full rounded-sm" title={`Fuel: ${row.fuel}% burn`} />
                      <div style={{ width: '33%', opacity: row.power / 100 }} className="bg-cyan-500 h-full rounded-sm" title={`Power: ${row.power}% burn`} />
                      <div style={{ width: '33%', opacity: row.oxygen / 100 }} className="bg-blue-500 h-full rounded-sm" title={`Oxygen: ${row.oxygen}% burn`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-4 text-[10px] font-mono text-slate-500 justify-center">
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-sm" /> Fuel</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-cyan-500 rounded-sm" /> Power</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-sm" /> Oxygen</span>
              </div>
            </div>

            {/* Monte Carlo Failure Distribution (Mocked) */}
            <div className="border border-slate-800 rounded-xl p-5 bg-slate-900/50">
              <h4 className="text-sm font-mono font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-fuchsia-400" /> Systemic Failure Distribution
              </h4>
              <div className="relative h-40 w-full flex items-end gap-2 px-4">
                {/* Mock Histogram */}
                {[5, 12, 25, 45, 80, 100, 60, 30, 15, 8].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[8px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
                    <div 
                      style={{ height: `${val}%` }} 
                      className={`w-full rounded-t-sm transition-all ${val > 60 ? 'bg-cyber-green' : val > 20 ? 'bg-amber-500' : 'bg-cyber-red'}`} 
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 border-t border-slate-800 pt-2 flex justify-between text-[10px] font-mono text-slate-500">
                <span>Catastrophic Failure</span>
                <span>Marginal Success</span>
                <span>Optimal Success</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
