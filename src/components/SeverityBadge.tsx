import React from "react";
import type { SeverityLevel } from "../data/events";

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  className = "",
}) => {
  const getBadgeStyles = () => {
    switch (severity) {
      case "Low":
        return "text-cyber-blue border-cyber-blue/30 bg-cyber-blue/5";
      case "Medium":
        return "text-tau-teal border-tau-teal/30 bg-tau-teal/5";
      case "High":
        return "text-astrophage border-astrophage/30 bg-astrophage/5";
      case "Critical":
        return "text-cyber-red border-cyber-red/40 bg-cyber-red/5 glow-red animate-pulse";
      default:
        return "text-slate-400 border-slate-700 bg-slate-800/10";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border rounded text-[10px] font-mono font-bold tracking-widest uppercase ${getBadgeStyles()} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${
        severity === "Low" 
          ? "bg-cyber-blue" 
          : severity === "Medium" 
          ? "bg-tau-teal" 
          : severity === "High" 
          ? "bg-astrophage" 
          : "bg-cyber-red animate-ping"
      }`} />
      {severity}
    </span>
  );
};
export default SeverityBadge;
