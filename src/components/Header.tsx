import React, { useEffect, useState } from "react";
import { Orbit, Globe, Crosshair, Mic, MicOff, Download, History, Beaker, Network, Box, BarChart, AudioLines, Sparkles } from "lucide-react";

interface HeaderProps {
  elapsedSeconds: number;
  systemStatus: "NOMINAL" | "WARNING" | "CRITICAL" | "STANDBY";
  mode?: "space" | "earth";
  onToggleMode?: () => void;
  onToggleJudgeMode?: () => void;
  isVoiceActive?: boolean;
  onToggleVoice?: () => void;
  onExportReport?: () => void;
  onToggleReplay?: () => void;
  onToggleWhatIf?: () => void;
  onToggleKnowledgeGraph?: () => void;
  onToggle3D?: () => void;
  onToggleAnalytics?: () => void;
  onToggleVoiceCenter?: () => void;
  voiceRecordingCount?: number;
  onToggleCMI?: () => void;
  isCMIOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  elapsedSeconds,
  systemStatus,
  mode = "space",
  onToggleMode,
  onToggleJudgeMode,
  isVoiceActive = false,
  onToggleVoice,
  onExportReport,
  onToggleReplay,
  onToggleWhatIf,
  onToggleKnowledgeGraph,
  onToggle3D,
  onToggleAnalytics,
  onToggleVoiceCenter,
  voiceRecordingCount = 0,
  onToggleCMI,
  isCMIOpen = false,
}) => {
  const [earthTime, setEarthTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setEarthTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format Mission Elapsed Time (MET) as HH:MM:SS
  const formatMET = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case "NOMINAL":
        return "text-cyber-green border-cyber-green/30 bg-cyber-green/5";
      case "WARNING":
        return "text-astrophage border-astrophage/30 bg-astrophage/5";
      case "CRITICAL":
        return "text-cyber-red border-cyber-red/30 bg-cyber-red/5 glow-red";
      case "STANDBY":
      default:
        return "text-tau-teal border-tau-teal/30 bg-tau-teal/5";
    }
  };

  const getStatusDot = () => {
    switch (systemStatus) {
      case "NOMINAL":
        return "bg-cyber-green animate-ping";
      case "WARNING":
        return "bg-astrophage animate-pulse";
      case "CRITICAL":
        return "bg-cyber-red animate-ping";
      case "STANDBY":
      default:
        return "bg-tau-teal";
    }
  };

  return (
    <header className="w-full glass-panel border border-tau-teal/15 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden mb-6">
      {/* Background ambient glowing gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-tau-teal/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-astrophage/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Cyberpunk scanning grid overlay on the header card */}
      <div className="absolute inset-0 bg-sci-fi-grid opacity-30 pointer-events-none" />

      {/* Title block */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left z-10">
        <div className="flex items-center gap-2 mb-1">
          {mode === "space" ? (
            <Orbit className="h-6 w-6 text-tau-teal animate-spin-slow" />
          ) : (
            <Globe className="h-6 w-6 text-emerald-400 animate-pulse" />
          )}
          <h1 className="text-2xl md:text-3xl font-bold tracking-widest text-white font-orbitron glow-text-teal m-0">
            {mode === "space" ? "PROJECT HAIL MARY" : "EARTH TWIN ASSET"}
          </h1>
        </div>
        <p className="text-xs md:text-sm font-mono text-tau-teal/70 tracking-widest uppercase">
          {mode === "space" ? "Autonomous Space Mission Simulator" : "Terrestrial Disaster Response AI"}
        </p>
      </div>

      {/* Controls Section */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 z-10">
        <div className="flex items-center gap-2 mr-4 border-r border-tau-teal/20 pr-4">
          <button 
            onClick={onToggleMode}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-2 ${mode === 'space' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400'}`}
            title="Toggle Earth Twin Mode"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-bold uppercase hidden sm:inline">Earth Twin</span>
          </button>
          <button 
            onClick={onToggleJudgeMode}
            className="p-2 rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center gap-2"
            title="Judge Challenge Mode"
          >
            <Crosshair className="w-4 h-4" />
            <span className="text-xs font-bold uppercase hidden sm:inline">Judge Mode</span>
          </button>
          <button 
            onClick={onToggleVoice}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-2 ${isVoiceActive ? 'bg-red-900/30 border-red-500/50 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
            title="Voice Mission Control"
          >
            {isVoiceActive ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
          </button>
          <button 
            onClick={onToggleReplay}
            className="p-2 rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-2"
            title="Mission Replay"
          >
            <History className="w-4 h-4" />
          </button>
          <button 
            onClick={onToggleWhatIf}
            className="p-2 rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-2"
            title="What-If Sandbox"
          >
            <Beaker className="w-4 h-4" />
          </button>
          <button 
            onClick={onToggleKnowledgeGraph}
            className="p-2 rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center gap-2"
            title="Mission Knowledge Graph"
          >
            <Network className="w-4 h-4" />
          </button>
          <button 
            onClick={onToggle3D}
            className="p-2 rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:border-fuchsia-500 hover:text-fuchsia-400 transition-colors flex items-center gap-2"
            title="3D Command Center"
          >
            <Box className="w-4 h-4" />
          </button>
          <button 
            onClick={onToggleAnalytics}
            className="p-2 rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 transition-colors flex items-center gap-2"
            title="Advanced Analytics"
          >
            <BarChart className="w-4 h-4" />
          </button>
          {/* MVIAS Voice Audit Button */}
          <button 
            onClick={onToggleVoiceCenter}
            className="relative p-2 rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-2"
            title="Mission Voice Intelligence & Audit System"
          >
            <AudioLines className="w-4 h-4" />
            {voiceRecordingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-cyan-500 text-[9px] font-bold text-black flex items-center justify-center">
                {voiceRecordingCount > 99 ? "99+" : voiceRecordingCount}
              </span>
            )}
          </button>
          {/* CMI voice assistant toggle */}
          <button 
            onClick={onToggleCMI}
            className={`relative p-2 rounded-lg border transition-colors flex items-center gap-2 ${isCMIOpen ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-400 font-bold' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-cyan-400'}`}
            title="🗣️ HAIL MARY Conversational Mission Intelligence (CMI)"
          >
            <Sparkles className={`w-4 h-4 ${isCMIOpen ? 'animate-pulse text-cyan-400' : ''}`} />
            <span className="text-[10px] font-bold uppercase hidden xl:inline">Voice Assistant</span>
          </button>
          <button 
            onClick={onExportReport}
            className="p-2 rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-2"
            title="Export Mission Report (PDF)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry Clock / Status Section */}
        <div className="flex items-center gap-4 md:gap-6 font-mono text-xs md:text-sm">
          {/* Earth Time */}
          <div className="flex flex-col items-center md:items-end border-r border-tau-teal/20 pr-4 md:pr-6 hidden sm:flex">
            <span className="text-tau-teal/50 text-[10px] tracking-wider uppercase">Earth Time UTC</span>
            <span className="text-white font-medium text-base tracking-wider">{earthTime || "00:00:00"}</span>
          </div>

          {/* MET Time */}
          <div className="flex flex-col items-center md:items-end border-r border-tau-teal/20 pr-4 md:pr-6">
            <span className="text-tau-teal/50 text-[10px] tracking-wider uppercase">Mission Elapsed Time</span>
            <span className="text-astrophage font-bold text-base tracking-wider glow-text-amber">
              MET {formatMET(elapsedSeconds)}
            </span>
          </div>

          {/* Status indicator */}
          <div className={`flex items-center gap-2.5 px-3.5 py-1.5 border rounded-md font-bold text-xs tracking-widest uppercase ${getStatusColor()}`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusDot()}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${getStatusDot().split(' ')[0]}`}></span>
            </span>
            {systemStatus}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
