import React, { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, X } from "lucide-react";
import type { ActiveEvent } from "../data/events";
import type { Decision } from "../data/decisions";

interface MissionReplayProps {
  events: ActiveEvent[];
  decisions: Decision[];
  onClose: () => void;
}

const MissionReplay: React.FC<MissionReplayProps> = ({ events, decisions, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const combinedTimeline = [...events.map(e => ({ type: 'event', data: e, time: e.timestamp })), 
                            ...decisions.map(d => ({ type: 'decision', data: d, time: d.timestamp }))]
                            .sort((a, b) => a.time.localeCompare(b.time));

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIndex(Number(e.target.value));
    setIsPlaying(false);
  };

  const currentItem = combinedTimeline[currentIndex];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.15)] z-50 w-[600px]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-cyan-400 font-bold text-sm tracking-widest uppercase">Mission Replay Timeline</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <button className="text-slate-400 hover:text-cyan-400" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}>
          <SkipBack className="w-5 h-5" />
        </button>
        <button className="text-slate-400 hover:text-cyan-400" onClick={handlePlayPause}>
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        <button className="text-slate-400 hover:text-cyan-400" onClick={() => setCurrentIndex(Math.min(combinedTimeline.length - 1, currentIndex + 1))}>
          <SkipForward className="w-5 h-5" />
        </button>
        <input 
          type="range" 
          min="0" 
          max={Math.max(0, combinedTimeline.length - 1)} 
          value={currentIndex} 
          onChange={handleScrub}
          className="flex-1 accent-cyan-500 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 min-h-[80px]">
        {currentItem ? (
          <div>
            <div className="text-xs text-slate-500 font-mono mb-1">{currentItem.time}</div>
            {currentItem.type === 'event' ? (
              <div className="text-orange-400 text-sm"><span className="font-bold">EVENT:</span> {(currentItem.data as ActiveEvent).title} - {(currentItem.data as ActiveEvent).description}</div>
            ) : (
              <div className="text-emerald-400 text-sm"><span className="font-bold">DECISION:</span> {(currentItem.data as Decision).selectedAction} - {(currentItem.data as Decision).outcome}</div>
            )}
          </div>
        ) : (
          <div className="text-slate-500 text-sm italic text-center mt-4">No events recorded in this mission yet.</div>
        )}
      </div>
    </div>
  );
};

export default MissionReplay;
