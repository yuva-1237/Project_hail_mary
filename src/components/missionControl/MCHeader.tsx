/**
 * Phase 9 – MCHeader
 * NASA-inspired full-width mission header with live clock, MET, phase, status.
 */
import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, Radio, Satellite } from "lucide-react";
import { motion } from "framer-motion";
import { getMissionPhase } from "../../data/spacecraft";

interface MCHeaderProps {
  elapsedSeconds: number;
  systemStatus: string;
  isRunning: boolean;
  isPaused: boolean;
  missionProgress: number;
  successProbability: number;
  communication: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  viewMode: "technical" | "control";
  onToggleView: () => void;
}

function useLiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function formatMET(s: number) {
  const h = Math.floor(s / 3600).toString().padStart(2, "0");
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

const STATUS_STYLES: Record<string, { border: string; text: string; dot: string; bg: string }> = {
  NOMINAL:   { border: "border-emerald-500/50", text: "text-emerald-400", dot: "bg-emerald-400", bg: "bg-emerald-500/10" },
  WARNING:   { border: "border-amber-500/50",   text: "text-amber-400",   dot: "bg-amber-400",   bg: "bg-amber-500/10" },
  CRITICAL:  { border: "border-rose-500/60",    text: "text-rose-400",    dot: "bg-rose-400",    bg: "bg-rose-500/15" },
  STANDBY:   { border: "border-slate-600/50",   text: "text-slate-400",   dot: "bg-slate-400",   bg: "bg-slate-700/20" },
};

const MCHeader: React.FC<MCHeaderProps> = ({
  elapsedSeconds, systemStatus, isRunning, isPaused, missionProgress,
  communication, onStart, onPause, onReset, onToggleView,
}) => {
  const clock = useLiveClock();
  const phase = getMissionPhase(missionProgress);
  const ss = STATUS_STYLES[systemStatus] ?? STATUS_STYLES.STANDBY;

  const btnState = !isRunning || isPaused ? "start" : "pause";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full overflow-hidden rounded-xl border border-tau-teal/20 bg-[rgba(5,5,12,0.96)] backdrop-blur-xl shadow-2xl"
    >
      {/* Animated top edge glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tau-teal to-transparent opacity-60" />

      {/* Subtle grid bg */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(6,182,212,1) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,1) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 px-6 py-4">
        {/* ── Three-column layout ── */}
        <div className="flex items-center justify-between gap-4">

          {/* LEFT: Brand */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg border border-tau-teal/40 bg-tau-teal/10">
                <Satellite className="h-5 w-5 text-tau-teal" />
              </div>
              <div>
                <h1 className="font-orbitron text-xl sm:text-2xl font-black text-white tracking-[0.2em] glow-text-teal leading-none">
                  PROJECT HAIL MARY
                </h1>
                <p className="text-[8px] font-mono text-tau-teal/60 tracking-[0.15em] uppercase mt-0.5 hidden lg:block">
                  Heuristic Autonomous Intelligence for Learning, Adaptation, Mission Analysis, Recovery &amp; Yield
                </p>
              </div>
            </div>
          </div>

          {/* CENTER: Live telemetry */}
          <div className="flex flex-col items-center gap-1 flex-1">
            {/* Live UTC clock */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">UTC</p>
                <p className="font-orbitron text-sm font-bold text-tau-teal/80 tabular-nums">
                  {clock.toUTCString().slice(17, 25)}
                </p>
              </div>
              <div className="w-px h-8 bg-tau-teal/20" />
              <div className="text-center">
                <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Mission Elapsed</p>
                <p className="font-orbitron text-lg font-black text-white tabular-nums tracking-widest">
                  {formatMET(elapsedSeconds)}
                </p>
              </div>
              <div className="w-px h-8 bg-tau-teal/20" />
              <div className="text-center hidden md:block">
                <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Phase</p>
                <p className="font-orbitron text-[11px] font-bold text-astrophage max-w-[140px] leading-tight">
                  {phase.name}
                </p>
              </div>
            </div>

            {/* Mission progress bar */}
            <div className="w-full max-w-xs mt-1">
              <div className="flex justify-between text-[7px] font-mono text-slate-600 mb-0.5">
                <span>MISSION PROGRESS</span>
                <span className="text-tau-teal">{missionProgress.toFixed(0)}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-tau-teal/60 to-tau-teal rounded-full"
                  animate={{ width: `${missionProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Status + controls */}
          <div className="flex flex-col items-end gap-2">
            {/* Status badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${ss.border} ${ss.bg}`}>
              <motion.div
                className={`w-2 h-2 rounded-full ${ss.dot}`}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className={`text-[10px] font-orbitron font-bold tracking-widest ${ss.text}`}>
                {systemStatus}
              </span>
            </div>

            {/* Connection */}
            <div className="flex items-center gap-2">
              {communication
                ? <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                : <WifiOff className="h-3.5 w-3.5 text-rose-400 animate-pulse" />}
              <span className={`text-[9px] font-mono ${communication ? "text-emerald-400" : "text-rose-400"}`}>
                {communication ? "LINK NOMINAL" : "SIGNAL LOST"}
              </span>
              <Radio className="h-3 w-3 text-tau-teal/40 animate-pulse" />
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-1.5 mt-1">
              <button
                onClick={onToggleView}
                className="px-2.5 py-1 text-[8px] font-mono font-bold text-tau-teal border border-tau-teal/40 rounded hover:bg-tau-teal/10 transition-colors uppercase tracking-wider"
              >
                ⇄ Technical View
              </button>
              {btnState === "start"
                ? <button onClick={onStart} className="px-2.5 py-1 text-[8px] font-mono font-bold text-emerald-400 border border-emerald-500/40 rounded hover:bg-emerald-500/10 transition-colors uppercase tracking-wider">▶ Start</button>
                : <button onClick={onPause} className="px-2.5 py-1 text-[8px] font-mono font-bold text-amber-400 border border-amber-500/40 rounded hover:bg-amber-500/10 transition-colors uppercase tracking-wider">⏸ Pause</button>
              }
              <button onClick={onReset} className="px-2.5 py-1 text-[8px] font-mono font-bold text-rose-400 border border-rose-500/40 rounded hover:bg-rose-500/10 transition-colors uppercase tracking-wider">↺ Reset</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom animated scan line */}
      <motion.div
        className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-tau-teal/60 to-transparent"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ width: "50%" }}
      />
    </motion.header>
  );
};

export default MCHeader;
