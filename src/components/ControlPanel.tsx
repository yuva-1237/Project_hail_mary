import React from "react";
import { Play, Pause, RotateCcw, Rocket } from "lucide-react";

interface ControlPanelProps {
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  isPaused,
  isCompleted,
  onStart,
  onPause,
  onReset,
}) => {
  return (
    <div className="glass-panel p-5 rounded-lg border border-tau-teal/15 relative overflow-hidden flex flex-col justify-between h-full">
      {/* Sci-fi tech corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tau-teal/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tau-teal/40" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-tau-teal/40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-tau-teal/40" />
      
      <div>
        <h3 className="text-sm font-orbitron font-bold text-white tracking-widest uppercase mb-1 flex items-center gap-2">
          <Rocket className="h-4 w-4 text-tau-teal" />
          Simulation Controls
        </h3>
        <p className="text-[11px] font-mono text-slate-400 mb-6 uppercase tracking-wider">
          Hail Mary mission sequencer interface
        </p>
      </div>

      <div className="flex flex-col gap-3.5 mt-auto">
        {/* Start / Resume Button */}
        <button
          id="btn-start-mission"
          onClick={onStart}
          disabled={(isRunning && !isPaused) || isCompleted}
          className={`w-full py-3 px-4 rounded font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border transition-all duration-300 ${
            (isRunning && !isPaused) || isCompleted
              ? "bg-slate-950/40 text-slate-500 border-slate-900 cursor-not-allowed"
              : "bg-tau-teal/10 hover:bg-tau-teal/20 text-tau-teal border-tau-teal/40 hover:border-tau-teal/70 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
          }`}
        >
          <Play className="h-4 w-4 fill-current" />
          {isPaused ? "Resume Mission" : "Start Mission"}
        </button>

        {/* Pause Button */}
        <button
          id="btn-pause-mission"
          onClick={onPause}
          disabled={!isRunning || isPaused || isCompleted}
          className={`w-full py-3 px-4 rounded font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border transition-all duration-300 ${
            !isRunning || isPaused || isCompleted
              ? "bg-slate-950/40 text-slate-500 border-slate-900 cursor-not-allowed"
              : "bg-amber-500/10 hover:bg-amber-500/20 text-astrophage border-amber-500/40 hover:border-amber-500/70 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
          }`}
        >
          <Pause className="h-4 w-4 fill-current" />
          Pause Simulation
        </button>

        {/* Reset Button */}
        <button
          id="btn-reset-mission"
          onClick={onReset}
          className="w-full py-3 px-4 rounded font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border transition-all duration-300 bg-red-500/10 hover:bg-red-500/20 text-cyber-red border-red-500/40 hover:border-red-500/70 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Mission
        </button>
      </div>

      {/* Mini status indicator footer */}
      <div className="mt-5 border-t border-tau-teal/10 pt-3 flex justify-between items-center text-[10px] font-mono text-slate-500">
        <span>SEQUENCER STATUS:</span>
        <span className={isRunning && !isPaused ? "text-cyber-green" : isPaused ? "text-astrophage" : "text-tau-teal"}>
          {isRunning && !isPaused ? "EXECUTING" : isPaused ? "PAUSED" : "READY_"}
        </span>
      </div>
    </div>
  );
};
export default ControlPanel;
