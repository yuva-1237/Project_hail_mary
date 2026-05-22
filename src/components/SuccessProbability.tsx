import React from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface SuccessProbabilityProps {
  score: number;
}

export const SuccessProbability: React.FC<SuccessProbabilityProps> = ({ score }) => {
  const clampedScore = Math.min(Math.max(score, 0), 100);

  // SVG parameters
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Determine color themes based on score
  const getThemeColor = () => {
    if (clampedScore > 70) return "text-cyber-green stroke-cyber-green";
    if (clampedScore > 40) return "text-astrophage stroke-astrophage";
    return "text-cyber-red stroke-cyber-red animate-pulse";
  };

  const getStatusText = () => {
    if (clampedScore > 70) return { label: "NOMINAL", class: "text-cyber-green" };
    if (clampedScore > 40) return { label: "DEGRADED", class: "text-astrophage" };
    return { label: "CRITICAL", class: "text-cyber-red glow-red animate-pulse" };
  };

  const status = getStatusText();

  return (
    <div className="glass-panel p-4 rounded-lg border border-tau-teal/15 flex items-center justify-between gap-5 relative overflow-hidden select-none h-full min-h-[120px]">
      {/* Decors */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-tau-teal/30" />
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-tau-teal/30" />

      {/* Description Info */}
      <div className="flex flex-col flex-1">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
          Mission Integrity Score
        </span>
        <h4 className="text-sm font-orbitron font-bold text-white tracking-wider uppercase mb-1 flex items-center gap-1.5">
          {clampedScore > 40 ? (
            <ShieldCheck className={`h-4.5 w-4.5 ${status.class}`} />
          ) : (
            <ShieldAlert className={`h-4.5 w-4.5 ${status.class}`} />
          )}
          SUCCESS PROBABILITY
        </h4>
        <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
          STATUS: <span className={`font-bold tracking-widest ${status.class}`}>{status.label}</span>
        </p>
      </div>

      {/* Circular Dial Visual */}
      <div className="relative flex items-center justify-center shrink-0 w-20 h-20">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background track circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-slate-900/90 fill-none"
            strokeWidth="5"
          />
          {/* Active progress circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            className={`fill-none transition-all duration-500 ease-out ${getThemeColor().split(" ")[1]}`}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Percentage label */}
        <div className="absolute flex flex-col items-center">
          <span className="text-base font-bold font-orbitron text-white leading-none">
            {clampedScore.toFixed(0)}
          </span>
          <span className="text-[8px] font-mono text-tau-teal/60 font-bold">%</span>
        </div>
      </div>
    </div>
  );
};
export default SuccessProbability;
