import React from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  status: "nominal" | "warning" | "critical" | "info" | "active" | "inactive";
  highlighted?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  icon,
  status,
  highlighted = false,
  className = "",
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "nominal":
        return "bg-cyber-green shadow-cyber-green/50";
      case "warning":
        return "bg-astrophage shadow-astrophage/50";
      case "critical":
        return "bg-cyber-red shadow-cyber-red/50 animate-pulse";
      case "info":
      case "active":
        return "bg-tau-teal shadow-tau-teal/50";
      case "inactive":
      default:
        return "bg-slate-500 shadow-slate-500/50";
    }
  };

  const getBorderColor = () => {
    if (highlighted) {
      return "border-cyber-red/80 shadow-[0_0_18px_rgba(239,68,68,0.45)] scale-[1.03] animate-pulse";
    }
    switch (status) {
      case "nominal":
        return "hover:border-cyber-green/45 border-tau-teal/15";
      case "warning":
        return "border-astrophage/35 hover:border-astrophage/60";
      case "critical":
        return "border-cyber-red/50 hover:border-cyber-red/80 glow-red";
      case "info":
      case "active":
        return "hover:border-tau-teal/45 border-tau-teal/15";
      case "inactive":
      default:
        return "border-slate-800 hover:border-slate-700";
    }
  };

  return (
    <div
      className={`glass-panel rounded-lg p-4 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-tau-teal/5 border relative overflow-hidden ${getBorderColor()} ${className}`}
    >
      {/* Dynamic corner markings for futuristic design */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-tau-teal/30" />
      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-tau-teal/30" />
      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-tau-teal/30" />
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-tau-teal/30" />

      {/* Card Header (Icon, Label, Indicator) */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-tau-teal/5 rounded border border-tau-teal/10 text-tau-teal">
            {icon}
          </div>
          <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest">
            {label}
          </span>
        </div>
        
        {/* LED Indicator */}
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
            {status}
          </span>
          <span className="relative flex h-2 w-2">
            {status === "critical" && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-red opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${getStatusColor()}`}></span>
          </span>
        </div>
      </div>

      {/* Card Value */}
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold font-orbitron tracking-tight text-white select-all">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-tau-teal/60 font-semibold uppercase tracking-wider">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};
export default MetricCard;
