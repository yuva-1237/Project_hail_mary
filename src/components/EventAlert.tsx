import React from "react";
import { AlertOctagon, BellOff, X, ArrowDownRight, Compass } from "lucide-react";
import SeverityBadge from "./SeverityBadge";
import type { ActiveEvent } from "../data/events";

interface EventAlertProps {
  activeEvent: ActiveEvent | null;
  onDismiss: () => void;
}

export const EventAlert: React.FC<EventAlertProps> = ({
  activeEvent,
  onDismiss,
}) => {
  if (!activeEvent) {
    return (
      <div className="glass-panel p-5 rounded-lg border border-tau-teal/10 flex flex-col items-center justify-center text-center h-[160px] relative overflow-hidden select-none">
        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-tau-teal/30" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-tau-teal/30" />
        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-tau-teal/30" />
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-tau-teal/30" />

        <div className="p-3 bg-tau-teal/5 rounded-full border border-tau-teal/15 text-tau-teal/50 mb-3 animate-pulse">
          <BellOff className="h-5 w-5" />
        </div>
        <h4 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
          Mission System Secure
        </h4>
        <p className="text-[10px] font-mono text-slate-600 mt-1 uppercase tracking-wider">
          No active mission alerts.
        </p>
      </div>
    );
  }

  // Helper to determine panel border styling by severity
  const getPanelBorder = () => {
    switch (activeEvent.severity) {
      case "Critical":
        return "border-cyber-red/50 hover:border-cyber-red/70 shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-border-glow glow-red";
      case "High":
        return "border-astrophage/40 hover:border-astrophage/60 shadow-[0_0_12px_rgba(245,158,11,0.15)]";
      case "Medium":
        return "border-tau-teal/30 hover:border-tau-teal/50";
      case "Low":
      default:
        return "border-cyber-blue/30 hover:border-cyber-blue/50";
    }
  };

  // Convert appliedEffects keys to human-readable strings
  const getEffectsList = () => {
    const list = [];
    const ef = activeEvent.appliedEffects;

    if (ef.fuel !== undefined) list.push({ label: "Fuel", val: `-${ef.fuel}%`, type: "danger" });
    if (ef.power !== undefined) list.push({ label: "Power", val: `-${ef.power}%`, type: "danger" });
    if (ef.oxygen !== undefined) list.push({ label: "Oxygen", val: `-${ef.oxygen}%`, type: "danger" });
    if (ef.health !== undefined) list.push({ label: "Hull Integrity", val: `-${ef.health}%`, type: "danger" });
    if (ef.velocity !== undefined) list.push({ label: "Velocity", val: `-${ef.velocity} km/s`, type: "danger" });
    if (ef.missionProgress !== undefined) list.push({ label: "Course Progress", val: `-${ef.missionProgress}%`, type: "danger" });
    if (ef.communicationDuration !== undefined) {
      list.push({ label: "Telemetry Link", val: `OFFLINE (${ef.communicationDuration}s)`, type: "warning" });
    }

    if (list.length === 0) {
      list.push({ label: "Science Scans", val: "ACTIVE (+0 DATA)", type: "success" });
    }
    return list;
  };

  return (
    <div
      key={activeEvent.id}
      className={`glass-panel p-5 rounded-lg border transition-all duration-300 relative overflow-hidden h-[160px] flex flex-col justify-between animate-fade-in ${getPanelBorder()}`}
    >
      {/* Corner notches */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyber-red/30" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyber-red/30" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyber-red/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyber-red/30" />

      {/* Header Area */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className={`p-1.5 rounded border ${
            activeEvent.severity === "Critical"
              ? "bg-red-500/10 text-cyber-red border-cyber-red/30 animate-pulse"
              : activeEvent.severity === "High"
              ? "bg-amber-500/10 text-astrophage border-astrophage/30"
              : "bg-tau-teal/10 text-tau-teal border-tau-teal/30"
          }`}>
            <AlertOctagon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-sm font-orbitron font-bold text-white tracking-wider truncate max-w-[150px] sm:max-w-none">
                {activeEvent.title}
              </h4>
              <SeverityBadge severity={activeEvent.severity} />
            </div>
            <p className="text-[10px] font-mono text-slate-400 truncate max-w-[200px] sm:max-w-[280px]">
              {activeEvent.description}
            </p>
          </div>
        </div>

        {/* Clear/Dismiss Action */}
        <button
          onClick={onDismiss}
          title="Dismiss Alert"
          className="text-slate-500 hover:text-white p-1 hover:bg-slate-800/40 rounded transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Details & Effects Row */}
      <div className="flex justify-between items-end mt-4">
        {/* Resource Draw Breakdown */}
        <div className="flex flex-wrap gap-2">
          {getEffectsList().map((item, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono border ${
                item.type === "danger"
                  ? "bg-red-950/20 text-cyber-red border-cyber-red/25"
                  : item.type === "warning"
                  ? "bg-amber-950/20 text-astrophage border-astrophage/25"
                  : "bg-emerald-950/20 text-cyber-green border-cyber-green/25"
              }`}
            >
              {item.type === "danger" && <ArrowDownRight className="h-2.5 w-2.5" />}
              {item.type === "success" && <Compass className="h-2.5 w-2.5" />}
              <span className="opacity-70">{item.label}:</span>
              <span className="font-bold">{item.val}</span>
            </span>
          ))}
        </div>

        {/* MET Occurred indicator */}
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
          LOGGED AT MET {activeEvent.timestamp}
        </span>
      </div>
    </div>
  );
};
export default EventAlert;
