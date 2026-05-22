/**
 * Phase 9 – MCDigitalTwin
 * Three action prediction cards with resource delta bars and success rings.
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, TrendingUp, TrendingDown, Star } from "lucide-react";
import type { SimulationResult } from "../../digitalTwin/simulateAction";

interface MCDigitalTwinProps {
  predictions: SimulationResult[];
  status: "idle" | "analyzing" | "resolved";
  commanderDecision: { finalAction: string; reasoning: string } | null;
  commanderVerdict: "approved" | "rejected" | null;
  decisionMode: string;
  onApprove: () => void;
  onReject: () => void;
}

// ─── Mini success ring ────────────────────────────────────────────────────────

function SuccessRing({ value }: { value: number }) {
  const r = 24; const cx = 30; const cy = 30;
  const circ = 2 * Math.PI * r;
  const filled = (value / 100) * circ;
  const color = value >= 70 ? "#10b981" : value >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={60} height={60}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeLinecap="round" strokeDasharray={`${filled} ${circ}`}
        transform={`rotate(-90 ${cx} ${cy})`}
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${filled} ${circ}` }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
      />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={10} fontFamily="Orbitron,monospace" fontWeight="bold">
        {value}%
      </text>
    </svg>
  );
}

// ─── Delta bar ────────────────────────────────────────────────────────────────

function DeltaBar({ label, delta }: { label: string; delta: number }) {
  const positive = delta >= 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[7px] font-mono text-slate-600 w-10 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${positive ? "bg-emerald-500" : "bg-rose-500"} ml-auto`}
          style={{ width: `${Math.min(Math.abs(delta) * 5, 100)}%`, marginLeft: positive ? "0" : "auto" }}
        />
      </div>
      <div className={`flex items-center gap-0.5 text-[8px] font-mono font-bold shrink-0 w-8 ${positive ? "text-emerald-400" : "text-rose-400"}`}>
        {positive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
        {positive ? "+" : ""}{delta}
      </div>
    </div>
  );
}

// ─── Prediction card ──────────────────────────────────────────────────────────

function PredictionCard({ p, isBest, rank }: { p: SimulationResult; isBest: boolean; rank: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`relative flex flex-col gap-3 p-4 rounded-xl border transition-all duration-500 ${
        isBest
          ? "border-tau-teal/60 bg-tau-teal/8 shadow-lg shadow-tau-teal/15"
          : "border-slate-700/40 bg-slate-900/30"
      }`}
    >
      {isBest && (
        <div className="absolute -top-2 left-4 flex items-center gap-1 bg-tau-teal text-space-black px-2 py-0.5 rounded text-[7px] font-orbitron font-black tracking-widest">
          <Star className="h-2.5 w-2.5" /> RECOMMENDED
        </div>
      )}

      {/* Top: name + ring */}
      <div className="flex items-start justify-between gap-2 mt-1">
        <div className="flex flex-col gap-1">
          <span className={`text-[11px] font-orbitron font-bold leading-tight ${isBest ? "text-tau-teal" : "text-white"}`}>
            {p.actionName}
          </span>
          <p className="text-[9px] font-mono text-slate-400 leading-relaxed line-clamp-2">
            {p.benefits}
          </p>
        </div>
        <div className="shrink-0"><SuccessRing value={p.successProbability} /></div>
      </div>

      {/* Resource deltas */}
      <div className="flex flex-col gap-1.5 border-t border-slate-800/60 pt-2">
        <DeltaBar label="Fuel" delta={p.fuelDelta} />
        <DeltaBar label="Power" delta={p.powerDelta} />
        <DeltaBar label="O₂" delta={p.oxygenDelta} />
        <DeltaBar label="Health" delta={p.healthDelta} />
      </div>

      {/* Risk */}
      {p.risks && (
        <p className="text-[8px] font-mono text-rose-400/70 leading-relaxed border-t border-slate-800/60 pt-2">
          ⚠ {p.risks}
        </p>
      )}
    </motion.div>
  );
}

// ─── Simulating skeleton ──────────────────────────────────────────────────────

function SimulatingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0,1,2].map(i => (
        <div key={i} className="border border-slate-800/60 rounded-xl p-4 animate-pulse flex flex-col gap-3">
          <div className="flex justify-between">
            <div className="h-3 bg-slate-800 rounded w-28" />
            <div className="w-12 h-12 bg-slate-800 rounded-full" />
          </div>
          <div className="space-y-2">
            {[0,1,2].map(j => <div key={j} className="h-1.5 bg-slate-800 rounded" />)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const MCDigitalTwin: React.FC<MCDigitalTwinProps> = ({
  predictions, status, commanderDecision, commanderVerdict, decisionMode, onApprove, onReject,
}) => {
  const bestAction = commanderDecision?.finalAction ?? null;
  const sorted = [...predictions].sort((a, b) => b.successProbability - a.successProbability);
  const isManualPending = decisionMode === "manual" && status === "resolved" && !commanderVerdict;

  return (
    <div className="glass-panel rounded-xl border border-tau-teal/20 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-tau-teal/10 shrink-0">
        <h3 className="text-[10px] font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-tau-teal" />
          Digital Twin Engine
        </h3>
        <span className={`text-[8px] font-mono font-bold ${
          status === "analyzing" ? "text-amber-400 animate-pulse" :
          status === "resolved" ? "text-emerald-400" : "text-slate-600"
        }`}>
          {status === "analyzing" ? "SIMULATING..." : status === "resolved" ? `${predictions.length} PATHS SIMULATED` : "STANDBY"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <AnimatePresence mode="wait">
          {status === "idle" && predictions.length === 0 && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Cpu className="h-10 w-10 text-slate-700" />
              <p className="text-[11px] font-mono text-slate-500">Digital Twin awaiting mission event.</p>
            </motion.div>
          )}
          {status === "analyzing" && <motion.div key="sim" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><SimulatingSkeleton /></motion.div>}
          {predictions.length > 0 && status !== "analyzing" && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
              {sorted.map((p, i) => (
                <PredictionCard key={p.actionName} p={p} isBest={p.actionName === bestAction} rank={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Manual approval strip */}
      <AnimatePresence>
        {isManualPending && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-tau-teal/20 px-4 py-3 flex items-center justify-between gap-3 bg-tau-teal/5 shrink-0"
          >
            <div className="flex flex-col min-w-0">
              <span className="text-[8px] font-mono text-slate-500 uppercase">Commander Recommends</span>
              <span className="text-[10px] font-orbitron font-bold text-tau-teal truncate">{bestAction}</span>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={onApprove} className="px-3 py-1.5 text-[9px] font-mono font-bold text-emerald-400 border border-emerald-500/40 rounded-lg hover:bg-emerald-500/10 transition-colors">
                ✓ Approve
              </button>
              <button onClick={onReject} className="px-3 py-1.5 text-[9px] font-mono font-bold text-rose-400 border border-rose-500/40 rounded-lg hover:bg-rose-500/10 transition-colors">
                ✗ Reject
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MCDigitalTwin;
