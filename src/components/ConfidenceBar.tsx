/**
 * ConfidenceBar – Phase 4
 * Animated horizontal progress bar for agent confidence scores (0–100).
 */
import React, { useEffect, useRef, useState } from "react";

interface ConfidenceBarProps {
  confidence: number;
  /** Delay before animation starts (ms) – used for staggered reveal */
  animationDelay?: number;
}

function getBarColor(confidence: number): string {
  if (confidence >= 80) return "from-emerald-500 to-cyber-green";
  if (confidence >= 55) return "from-amber-500 to-yellow-400";
  return "from-rose-600 to-rose-400";
}

const ConfidenceBar: React.FC<ConfidenceBarProps> = ({
  confidence,
  animationDelay = 0,
}) => {
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset then animate to actual value
    setWidth(0);
    timerRef.current = setTimeout(() => {
      setWidth(confidence);
    }, animationDelay + 60);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [confidence, animationDelay]);

  const colorClass = getBarColor(confidence);

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Track */}
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
      {/* Numeric label */}
      <span
        className={`text-[10px] font-mono font-bold w-8 text-right shrink-0 ${
          confidence >= 80
            ? "text-cyber-green"
            : confidence >= 55
            ? "text-amber-400"
            : "text-rose-400"
        }`}
      >
        {confidence}%
      </span>
    </div>
  );
};

export default ConfidenceBar;
