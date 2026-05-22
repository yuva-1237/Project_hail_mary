/**
 * Phase 9 – MCSpacecraftStatus
 * 8 animated SVG radial gauge cards showing live spacecraft telemetry.
 */
import React from "react";
import { motion } from "framer-motion";
import { Droplet, Zap, Wind, Thermometer, Activity, Radio, Gauge, Milestone } from "lucide-react";
import type { SpacecraftState } from "../../data/spacecraft";

interface MCSpacecraftStatusProps {
  spacecraft: SpacecraftState;
  highlighted: Record<string, boolean>;
}

// ─── SVG Radial Arc Gauge ────────────────────────────────────────────────────

function RadialGauge({ value, max = 100, color, size = 72 }: {
  value: number; max?: number; color: string; size?: number;
}) {
  const pct = Math.min(Math.max(value / max, 0), 1);
  const r = (size - 10) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = -220;
  const sweepAngle = 260;
  const circumference = 2 * Math.PI * r;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcPath = (start: number, sweep: number) => {
    const s = toRad(start);
    const e = toRad(start + sweep);
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const large = sweep > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <svg width={size} height={size} className="block">
      {/* Track */}
      <path d={arcPath(startAngle, sweepAngle)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} strokeLinecap="round" />
      {/* Filled arc */}
      <motion.path
        d={arcPath(startAngle, sweepAngle)}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={`${(pct * sweepAngle / 360) * circumference} ${circumference}`}
        initial={{ strokeDasharray: `0 ${circumference}` }}
        animate={{ strokeDasharray: `${(pct * sweepAngle / 360) * circumference} ${circumference}` }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
      />
    </svg>
  );
}

// ─── Metric definition ────────────────────────────────────────────────────────

interface MetricDef {
  key: keyof SpacecraftState;
  label: string;
  icon: React.ReactNode;
  unit: string;
  max: number;
  getColor: (v: number) => string;
  format: (v: number | boolean | string) => string;
}

const METRICS: MetricDef[] = [
  {
    key: "fuel", label: "Fuel Reserve", icon: <Droplet className="h-3 w-3" />, unit: "%", max: 100,
    getColor: (v) => v > 40 ? "#06b6d4" : v > 20 ? "#f59e0b" : "#ef4444",
    format: (v) => `${v}`,
  },
  {
    key: "power", label: "Core Power", icon: <Zap className="h-3 w-3" />, unit: "%", max: 100,
    getColor: (v) => v > 40 ? "#60a5fa" : v > 20 ? "#f59e0b" : "#ef4444",
    format: (v) => `${v}`,
  },
  {
    key: "oxygen", label: "Cabin O₂", icon: <Wind className="h-3 w-3" />, unit: "%", max: 100,
    getColor: (v) => v > 40 ? "#34d399" : v > 20 ? "#f59e0b" : "#ef4444",
    format: (v) => `${v}`,
  },
  {
    key: "health", label: "Hull Integrity", icon: <Activity className="h-3 w-3" />, unit: "%", max: 100,
    getColor: (v) => v > 60 ? "#a78bfa" : v > 30 ? "#f59e0b" : "#ef4444",
    format: (v) => `${v}`,
  },
  {
    key: "temperature", label: "Cabin Temp", icon: <Thermometer className="h-3 w-3" />, unit: "°C", max: 40,
    getColor: () => "#06b6d4",
    format: (v) => `${v}`,
  },
  {
    key: "velocity", label: "Velocity", icon: <Gauge className="h-3 w-3" />, unit: "km/s", max: 300000,
    getColor: () => "#f59e0b",
    format: (v) => {
      const n = v as number;
      return n >= 1000 ? `${(n / 1000).toFixed(0)}k` : `${n}`;
    },
  },
  {
    key: "communication", label: "Comms Link", icon: <Radio className="h-3 w-3" />, unit: "", max: 1,
    getColor: (v) => v ? "#10b981" : "#ef4444",
    format: (v) => v ? "ONLINE" : "LOST",
  },
  {
    key: "missionProgress", label: "Progress", icon: <Milestone className="h-3 w-3" />, unit: "%", max: 100,
    getColor: (v) => v === 100 ? "#10b981" : "#06b6d4",
    format: (v) => `${Math.round(v as number)}`,
  },
];

// ─── Single metric card ───────────────────────────────────────────────────────

function MetricCard({ def, value, highlighted }: {
  def: MetricDef; value: number | boolean | string; highlighted: boolean;
}) {
  const numVal = typeof value === "number" ? value : (value ? 1 : 0);
  const color = def.getColor(numVal);
  const displayStr = def.format(value);
  const isBool = typeof value === "boolean";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-500 ${
        highlighted
          ? "border-tau-teal/60 bg-tau-teal/10 shadow-lg shadow-tau-teal/20"
          : "border-slate-700/40 bg-slate-900/40 hover:border-tau-teal/30"
      }`}
    >
      {/* Gauge */}
      <div className="relative flex items-center justify-center">
        <RadialGauge value={numVal} max={def.max} color={color} size={68} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ color }} className="text-[9px] mb-0.5">{def.icon}</span>
          <span className="font-orbitron font-black text-white text-[13px] leading-none tabular-nums">
            {displayStr}
          </span>
          {def.unit && !isBool && (
            <span className="text-[7px] font-mono text-slate-500 mt-0.5">{def.unit}</span>
          )}
        </div>
      </div>
      {/* Label */}
      <p className="text-[8px] font-mono text-slate-500 uppercase tracking-wider text-center leading-tight">
        {def.label}
      </p>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const MCSpacecraftStatus: React.FC<MCSpacecraftStatusProps> = ({ spacecraft, highlighted }) => {
  return (
    <div className="glass-panel rounded-xl border border-tau-teal/20 overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-tau-teal/10">
        <h3 className="text-[10px] font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-tau-teal animate-pulse" />
          Spacecraft Telemetry
        </h3>
        <span className="text-[8px] font-mono text-slate-600">LIVE · 1Hz</span>
      </div>
      {/* 4×2 grid */}
      <div className="p-3 grid grid-cols-4 gap-2">
        {METRICS.map((def) => (
          <MetricCard
            key={def.key}
            def={def}
            value={spacecraft[def.key]}
            highlighted={!!highlighted[def.key]}
          />
        ))}
      </div>
      {/* Position strip */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <span className="text-[8px] font-mono text-slate-600 uppercase">Position:</span>
        <span className="text-[9px] font-mono text-tau-teal/80 truncate">{spacecraft.position}</span>
      </div>
    </div>
  );
};

export default MCSpacecraftStatus;
