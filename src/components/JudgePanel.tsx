import React from "react";
import { AlertTriangle, Crosshair, Wind } from "lucide-react";
import type { JudgeScenarioType } from "../utils/judgeScenarios";

interface JudgePanelProps {
  onInjectScenario: (scenario: JudgeScenarioType) => void;
  isOpen: boolean;
  onClose: () => void;
}

const JudgePanel: React.FC<JudgePanelProps> = ({ onInjectScenario, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-purple-500/50 rounded-xl w-96 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
        <div className="p-4 border-b border-purple-500/30 flex justify-between items-center bg-purple-900/20 rounded-t-xl">
          <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
            <Crosshair className="w-5 h-5" />
            Judge Challenge Mode
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <p className="text-sm text-slate-300 mb-2">
            Inject extreme scenarios directly into the simulation to observe autonomous recovery.
          </p>
          <button
            onClick={() => { onInjectScenario("Oxygen Leak"); onClose(); }}
            className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-400 rounded-lg transition-all text-left group"
          >
            <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 group-hover:bg-blue-500/40">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-200">Critical Oxygen Leak</div>
              <div className="text-xs text-slate-400">Rapid decompression event</div>
            </div>
          </button>

          <button
            onClick={() => { onInjectScenario("Asteroid Strike"); onClose(); }}
            className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-400 rounded-lg transition-all text-left group"
          >
            <div className="bg-red-500/20 p-2 rounded-lg text-red-400 group-hover:bg-red-500/40">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-200">Asteroid Strike</div>
              <div className="text-xs text-slate-400">Hull breach and health impact</div>
            </div>
          </button>

          <button
            onClick={() => { onInjectScenario("Dual Failure"); onClose(); }}
            className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-400 rounded-lg transition-all text-left group"
          >
            <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400 group-hover:bg-orange-500/40">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-200">Cascading Dual Failure</div>
              <div className="text-xs text-slate-400">Engine offline + Comms blackout</div>
            </div>
          </button>

          <button
            onClick={() => { onInjectScenario("Black Swan"); onClose(); }}
            className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-fuchsia-900/40 border border-slate-700 hover:border-fuchsia-400 rounded-lg transition-all text-left group"
          >
            <div className="bg-fuchsia-500/20 p-2 rounded-lg text-fuchsia-400 group-hover:bg-fuchsia-500/40">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="font-semibold text-slate-200">Black Swan Event</div>
              <div className="text-xs text-slate-400">Rare, catastrophic multi-failure injection</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JudgePanel;
