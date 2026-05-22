import React from "react";

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  colorType?: "fuel" | "power" | "oxygen" | "health" | "progress";
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  max = 100,
  colorType = "progress",
  className = "",
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Determine color gradients based on value and colorType
  const getGradientColor = () => {
    if (colorType === "health") {
      if (percentage > 50) return "from-emerald-500 to-cyber-green shadow-cyber-green/20";
      if (percentage > 20) return "from-amber-500 to-astrophage shadow-astrophage/20";
      return "from-red-600 to-cyber-red shadow-cyber-red/30 animate-pulse";
    }

    if (colorType === "fuel") {
      if (percentage > 25) return "from-amber-500 to-astrophage shadow-astrophage/20";
      return "from-red-600 to-cyber-red shadow-cyber-red/35 animate-pulse";
    }

    if (colorType === "power") {
      if (percentage > 40) return "from-cyan-500 to-tau-teal shadow-tau-teal/20";
      if (percentage > 15) return "from-amber-500 to-astrophage shadow-astrophage/20";
      return "from-red-600 to-cyber-red shadow-cyber-red/30 animate-pulse";
    }

    if (colorType === "oxygen") {
      if (percentage > 30) return "from-sky-400 to-cyan-500 shadow-cyan-500/20";
      return "from-red-600 to-cyber-red shadow-cyber-red/30 animate-pulse";
    }

    // Default progress color
    return "from-cyan-500 to-blue-500 shadow-tau-teal/20";
  };

  return (
    <div className={`w-full flex flex-col font-mono text-xs ${className}`}>
      {/* Labels & Values */}
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-slate-400 uppercase tracking-widest text-[11px] font-medium flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${colorType === 'fuel' ? 'bg-astrophage' : colorType === 'health' ? 'bg-cyber-green' : 'bg-tau-teal'}`} />
          {label}
        </span>
        <span className="text-white font-semibold tracking-wider font-orbitron">
          {percentage.toFixed(1)}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-3.5 bg-slate-950/80 rounded border border-tau-teal/10 relative overflow-hidden p-[2px]">
        {/* Glow Layer */}
        <div 
          className={`h-full rounded-sm bg-gradient-to-r transition-all duration-300 ${getGradientColor()}`}
          style={{ width: `${percentage}%` }}
        />

        {/* Diagonal segment overlay for that sci-fi grid block look */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0, 0, 0, 0.9) 4px, rgba(0, 0, 0, 0.9) 8px)"
          }}
        />

        {/* Dynamic scan line effect across active progress */}
        {percentage > 0 && (
          <div 
            className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-scanline"
            style={{
              animationDuration: "3s",
              left: `${percentage}%`
            }}
          />
        )}
      </div>
    </div>
  );
};
export default ProgressBar;
