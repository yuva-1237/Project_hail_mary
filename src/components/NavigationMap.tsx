import React from "react";
import { Compass, Globe, Milestone, Radio } from "lucide-react";

interface NavigationMapProps {
  progress: number;
  position: string;
  communicationDelay: string;
}

export const NavigationMap: React.FC<NavigationMapProps> = ({
  progress,
  position,
  communicationDelay,
}) => {
  // Calculated stats based on progress
  const totalDistance = 12.0; // Tau Ceti is 12 light-years away
  const distanceTraveled = (progress / 100) * totalDistance;
  const distanceRemaining = totalDistance - distanceTraveled;

  // SVG dimensions & path calculations
  // Path is a quadratic bezier curve from (50, 100) to (550, 100) with control point (300, 20)
  const startX = 60;
  const startY = 100;
  const endX = 540;
  const endY = 100;
  const controlX = 300;
  const controlY = 30;

  // Math to get point along Bezier curve (t goes from 0 to 1)
  const getBezierPoint = (t: number) => {
    const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;
    return { x, y };
  };

  // Math to get tangent angle along Bezier curve
  const getBezierTangentAngle = (t: number) => {
    // Derivative: P'(t) = 2*(1-t)*(Q-P) + 2*t*(R-Q)
    const dx = 2 * (1 - t) * (controlX - startX) + 2 * t * (endX - controlX);
    const dy = 2 * (1 - t) * (controlY - startY) + 2 * t * (endY - controlY);
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const t = progress / 100;
  const shipPos = getBezierPoint(t);
  const shipAngle = getBezierTangentAngle(t);

  return (
    <div className="glass-panel p-5 rounded-lg border border-tau-teal/15 flex flex-col relative overflow-hidden h-full">
      {/* Sci-fi tech corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tau-teal/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tau-teal/40" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-tau-teal/40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-tau-teal/40" />

      <div className="flex justify-between items-center mb-4 border-b border-tau-teal/10 pb-3">
        <h3 className="text-sm font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <Compass className="h-4 w-4 text-tau-teal animate-pulse" />
          Navigation & Orbital Trajectory
        </h3>
        <span className="text-[10px] font-mono text-tau-teal/70 border border-tau-teal/20 px-2 py-0.5 rounded uppercase">
          Sector: Deep Space
        </span>
      </div>

      {/* Trajectory Map Visualizer */}
      <div className="w-full bg-slate-950/60 rounded border border-tau-teal/5 relative py-4 mb-4 flex items-center justify-center">
        {/* Background grid indicators */}
        <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-600">GRID: SOL_TC_12</div>
        <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-600">UNITS: LIGHT_YEARS</div>

        <svg viewBox="0 0 600 180" className="w-full h-auto max-w-full">
          {/* Constellation lines */}
          <line x1="100" y1="40" x2="160" y2="20" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="1" />
          <line x1="160" y1="20" x2="220" y2="50" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="1" />
          <line x1="420" y1="140" x2="480" y2="120" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="1" />
          
          {/* Star dots */}
          <circle cx="100" cy="40" r="1" fill="#fff" opacity="0.3" />
          <circle cx="160" cy="20" r="1.5" fill="#fff" opacity="0.4" />
          <circle cx="220" cy="50" r="1" fill="#fff" opacity="0.2" />
          <circle cx="420" cy="140" r="1" fill="#fff" opacity="0.3" />
          <circle cx="480" cy="120" r="2" fill="#fff" opacity="0.5" />
          <circle cx="340" cy="150" r="1" fill="#fff" opacity="0.2" />
          
          {/* Trajectory path - Bezier curve */}
          <path
            d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
            fill="none"
            stroke="rgba(6, 182, 212, 0.15)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* Active trajectory path (how much has been traversed) */}
          {progress > 0 && (
            <path
              d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeDasharray={`${t * 500} 500`}
            />
          )}

          {/* Start Node: Sol System */}
          <g className="cursor-pointer">
            <circle cx={startX} cy={startY} r="8" fill="rgba(6, 182, 212, 0.2)" />
            <circle cx={startX} cy={startY} r="4" fill="#06b6d4" />
            {progress < 20 && (
              <circle cx={startX} cy={startY} r="12" fill="none" stroke="#06b6d4" strokeWidth="1" className="animate-ping" />
            )}
            <text x={startX - 15} y={startY + 22} fill="rgba(6, 182, 212, 0.7)" className="font-mono text-[9px] font-bold">SOL (0 LY)</text>
          </g>

          {/* Midpoint marker: Relativistic turnover */}
          <g>
            <circle cx="300" cy="65" r="3" fill="#f59e0b" opacity="0.4" />
            <line x1="300" y1="65" x2="300" y2="85" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1" strokeDasharray="2 2" />
            <text x="300" y="55" textAnchor="middle" fill="rgba(245, 158, 11, 0.6)" className="font-mono text-[8px]">TURNOVER (6.0 LY)</text>
          </g>

          {/* End Node: Tau Ceti */}
          <g className="cursor-pointer">
            <circle cx={endX} cy={endY} r="10" fill="rgba(245, 158, 11, 0.2)" className="animate-pulse" />
            <circle cx={endX} cy={endY} r="5" fill="#f59e0b" />
            {progress > 80 && (
              <circle cx={endX} cy={endY} r="16" fill="none" stroke="#f59e0b" strokeWidth="1" className="animate-ping" />
            )}
            <text x={endX - 35} y={endY + 22} fill="rgba(245, 158, 11, 0.8)" className="font-mono text-[9px] font-bold">TAU CETI (12 LY)</text>
          </g>

          {/* Spacecraft icon */}
          <g transform={`translate(${shipPos.x}, ${shipPos.y}) rotate(${shipAngle})`}>
            {/* Pulsing engine glow */}
            {progress > 0 && progress < 100 && (
              <path
                d="M -12 -3 L -18 0 L -12 3 Z"
                fill={progress > 50 ? "#ef4444" : "#f59e0b"}
                className="animate-pulse"
              />
            )}
            {/* Spacecraft hull */}
            <polygon
              points="10,0 -8,-6 -5,0 -8,6"
              fill="#ffffff"
              stroke="#06b6d4"
              strokeWidth="1"
            />
            <circle cx="0" cy="0" r="2" fill="#06b6d4" />
          </g>
        </svg>
      </div>

      {/* Trajectory Data Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto">
        {/* Distance Traveled */}
        <div className="p-3 bg-slate-950/40 rounded border border-tau-teal/5 flex flex-col">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Globe className="h-3 w-3 text-tau-teal" /> Distance Traveled
          </span>
          <span className="text-sm font-bold font-orbitron text-white">
            {distanceTraveled.toFixed(2)} <span className="text-[10px] text-tau-teal/60 font-mono">LY</span>
          </span>
        </div>

        {/* Distance Remaining */}
        <div className="p-3 bg-slate-950/40 rounded border border-tau-teal/5 flex flex-col">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Milestone className="h-3 w-3 text-astrophage" /> Remainder
          </span>
          <span className="text-sm font-bold font-orbitron text-white">
            {distanceRemaining.toFixed(2)} <span className="text-[10px] text-astrophage/60 font-mono">LY</span>
          </span>
        </div>

        {/* Current Position */}
        <div className="p-3 bg-slate-950/40 rounded border border-tau-teal/5 flex flex-col col-span-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Position Status</span>
          <span className="text-xs font-semibold text-slate-300 truncate" title={position}>
            {position}
          </span>
        </div>

        {/* Comms Delay */}
        <div className="p-3 bg-slate-950/40 rounded border border-tau-teal/5 flex flex-col col-span-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Radio className="h-3 w-3 text-tau-teal" /> Comms Latency
          </span>
          <span className="text-xs font-semibold text-slate-300">
            {communicationDelay}
          </span>
        </div>
      </div>
    </div>
  );
};
export default NavigationMap;
