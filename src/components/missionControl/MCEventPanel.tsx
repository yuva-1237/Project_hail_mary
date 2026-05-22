/**
 * Phase 9 – MCEventPanel
 * Active event display with severity banner, description, and twin action chips.
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";
import type { ActiveEvent } from "../../data/events";
import type { SimulationResult } from "../../digitalTwin/simulateAction";

interface MCEventPanelProps {
  activeEvent: ActiveEvent | null;
  decisionStatus: "idle" | "analyzing" | "resolved";
  digitalTwinPredictions: SimulationResult[];
  digitalTwinStatus: "idle" | "analyzing" | "resolved";
  twinCommanderDecision: { finalAction: string; reasoning: string } | null;
}

const SEVERITY_STYLES = {
  Low:      { bg: "bg-sky-950/60",    border: "border-sky-500/40",    text: "text-sky-400",    banner: "bg-sky-500/20",    icon: "text-sky-400" },
  Medium:   { bg: "bg-amber-950/40",  border: "border-amber-500/40",  text: "text-amber-400",  banner: "bg-amber-500/20",  icon: "text-amber-400" },
  High:     { bg: "bg-orange-950/40", border: "border-orange-500/40", text: "text-orange-400", banner: "bg-orange-500/20", icon: "text-orange-400" },
  Critical: { bg: "bg-rose-950/40",   border: "border-rose-600/50",   text: "text-rose-400",   banner: "bg-rose-500/20",   icon: "text-rose-400" },
};

const MCEventPanel: React.FC<MCEventPanelProps> = ({
  activeEvent, decisionStatus, digitalTwinPredictions, digitalTwinStatus, twinCommanderDecision,
}) => {
  const sev = activeEvent ? (SEVERITY_STYLES[activeEvent.severity] ?? SEVERITY_STYLES.Low) : null;
  const bestAction = twinCommanderDecision?.finalAction ?? null;

  return (
    <div className="glass-panel rounded-xl border border-tau-teal/20 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-tau-teal/10">
        <h3 className="text-[10px] font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-tau-teal" />
          Active Event
        </h3>
        <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
          decisionStatus === "analyzing" ? "text-amber-400 bg-amber-500/15 animate-pulse" :
          decisionStatus === "resolved"  ? "text-emerald-400 bg-emerald-500/15" :
          "text-slate-600 bg-slate-800/40"
        }`}>
          {decisionStatus === "analyzing" ? "Analyzing..." : decisionStatus === "resolved" ? "Resolved" : "Monitoring"}
        </span>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4">
        <AnimatePresence mode="wait">
          {!activeEvent ? (
            /* Nominal state */
            <motion.div
              key="nominal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-3"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-16 h-16 rounded-full border-2 border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center"
              >
                <ShieldCheck className="h-8 w-8 text-emerald-400" />
              </motion.div>
              <div className="text-center">
                <p className="font-orbitron text-sm font-bold text-emerald-400 tracking-widest">ALL SYSTEMS NOMINAL</p>
                <p className="text-[9px] font-mono text-slate-500 mt-1">No active mission events detected</p>
              </div>
              <div className="flex gap-1 mt-2">
                {[0,1,2,3].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            /* Event active */
            <motion.div
              key={activeEvent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col gap-3"
            >
              {/* Severity banner */}
              <div className={`rounded-lg px-4 py-3 ${sev!.banner} border ${sev!.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <AlertTriangle className={`h-5 w-5 ${sev!.icon}`} />
                    </motion.div>
                    <div>
                      <p className={`font-orbitron text-base font-black tracking-widest ${sev!.text}`}>
                        {activeEvent.title.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded border ${sev!.border} ${sev!.bg}`}>
                    <span className={`text-[9px] font-mono font-bold uppercase ${sev!.text}`}>
                      {activeEvent.severity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-800/60">
                {activeEvent.description}
              </p>

              {/* Twin action chips */}
              {digitalTwinPredictions.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5 text-tau-teal" /> Digital Twin Options
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {digitalTwinPredictions.map((p) => {
                      const isBest = p.actionName === bestAction;
                      return (
                        <div key={p.actionName} className={`flex items-center justify-between rounded-lg px-3 py-2 border transition-all ${
                          isBest
                            ? "border-tau-teal/60 bg-tau-teal/10 shadow-sm shadow-tau-teal/20"
                            : "border-slate-700/40 bg-slate-900/30"
                        }`}>
                          <div className="flex items-center gap-2">
                            {isBest && <CheckCircle2 className="h-3 w-3 text-tau-teal shrink-0" />}
                            <span className={`text-[10px] font-mono ${isBest ? "text-tau-teal font-bold" : "text-slate-400"}`}>
                              {p.actionName}
                            </span>
                            {isBest && (
                              <span className="text-[7px] font-mono font-bold text-tau-teal bg-tau-teal/20 px-1 rounded">
                                RECOMMENDED
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-700 ${
                                p.successProbability >= 70 ? "bg-emerald-500" :
                                p.successProbability >= 40 ? "bg-amber-400" : "bg-rose-500"
                              }`} style={{ width: `${p.successProbability}%` }} />
                            </div>
                            <span className={`text-[9px] font-orbitron font-bold ${
                              p.successProbability >= 70 ? "text-emerald-400" :
                              p.successProbability >= 40 ? "text-amber-400" : "text-rose-400"
                            }`}>{p.successProbability}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Analyzing state */}
              {digitalTwinStatus === "analyzing" && digitalTwinPredictions.length === 0 && (
                <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3 border border-slate-800/60">
                  <div className="w-5 h-5 rounded-full border-2 border-tau-teal/30 border-t-tau-teal animate-spin shrink-0" />
                  <span className="text-[10px] font-mono text-tau-teal/80 animate-pulse">
                    Digital Twin running simulations...
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MCEventPanel;
