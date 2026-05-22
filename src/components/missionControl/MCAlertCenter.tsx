/**
 * Phase 9 – MCAlertCenter
 * Horizontal scrollable row of active system warnings and safety notices.
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldAlert, CheckCircle, Fuel, Heart, Shield } from "lucide-react";
import type { ScoringAlerts } from "../../scoring/types";
import type { ActiveEvent } from "../../data/events";

interface MCAlertCenterProps {
  alerts: ScoringAlerts;
  activeEvent: ActiveEvent | null;
}

interface AlertItem {
  id: string;
  type: "warning" | "critical" | "info";
  title: string;
  description: string;
  icon: React.ReactNode;
}

const MCAlertCenter: React.FC<MCAlertCenterProps> = ({ alerts, activeEvent }) => {
  const activeAlerts: AlertItem[] = [];

  // 1. Check scoring threshold alerts
  if (alerts.lowSafety) {
    activeAlerts.push({
      id: "low-safety",
      type: "critical",
      title: "LOW SAFETY MARGIN",
      description: "Spacecraft safety index is under 50%. Hull or crew integrity compromised.",
      icon: <Heart className="h-4 w-4 text-rose-500" />,
    });
  }

  if (alerts.lowFuel) {
    activeAlerts.push({
      id: "low-fuel",
      type: "critical",
      title: "CRITICAL FUEL LEVEL",
      description: "Remaining fuel reserves are under 30%. Minimize propulsive actions.",
      icon: <Fuel className="h-4 w-4 text-rose-500" />,
    });
  }

  if (alerts.lowSuccess) {
    activeAlerts.push({
      id: "low-success",
      type: "warning",
      title: "LOW SUCCESS PROBABILITY",
      description: "Mission success expectation has fallen below 40%.",
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    });
  }

  // 2. Check active event severity
  if (activeEvent) {
    const isCritical = activeEvent.severity === "Critical";
    const isHigh = activeEvent.severity === "High";
    if (isCritical || isHigh) {
      activeAlerts.push({
        id: `event-${activeEvent.id}`,
        type: isCritical ? "critical" : "warning",
        title: `ACTIVE HAZARD: ${activeEvent.title}`,
        description: activeEvent.description,
        icon: <ShieldAlert className={`h-4 w-4 ${isCritical ? "text-rose-500" : "text-amber-500"}`} />,
      });
    }
  }

  return (
    <div className="glass-panel rounded-xl border border-tau-teal/20 overflow-hidden flex flex-col w-full relative shrink-0">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-tau-teal/50" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-tau-teal/50" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-tau-teal/50" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-tau-teal/50" />

      {/* Header */}
      <div className="flex items-center px-4 py-2 border-b border-tau-teal/10 shrink-0 bg-slate-950/40">
        <span className="text-[9px] font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-tau-teal" />
          Active Alert &amp; Threat Center
        </span>
        <div className="ml-auto flex items-center gap-1.5 text-[8px] font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-tau-teal animate-pulse" />
          SYSTEM GUARDIAN ONLINE
        </div>
      </div>

      <div className="p-3 bg-slate-900/10 min-h-16 flex items-center">
        <AnimatePresence mode="wait">
          {activeAlerts.length === 0 ? (
            <motion.div
              key="all-clear"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            >
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-orbitron font-bold uppercase tracking-wider">ALL SYSTEMS NOMINAL</span>
                <span className="text-[9px] font-mono text-emerald-500/80">No structural anomalies or safety threshold violations detected.</span>
              </div>
            </motion.div>
          ) : (
            <div className="w-full overflow-x-auto flex gap-3 pb-1 scrollbar-thin scrollbar-thumb-slate-800">
              {activeAlerts.map((alert) => {
                const isCrit = alert.type === "critical";
                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      x: 0,
                      ...(isCrit ? {
                        opacity: [1, 0.5, 1],
                        transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                      } : {})
                    }}
                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                    className={`flex items-start gap-3 p-3 rounded-lg border min-w-[280px] max-w-[350px] shrink-0 ${
                      isCrit 
                        ? "border-rose-500/35 bg-rose-500/10 text-rose-300 shadow-md shadow-rose-950/20" 
                        : "border-amber-500/35 bg-amber-500/10 text-amber-300 shadow-md shadow-amber-950/20"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{alert.icon}</div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-orbitron font-extrabold tracking-wider leading-tight">
                        {alert.title}
                      </span>
                      <span className="text-[9px] font-mono text-slate-300 leading-normal mt-1 truncate-2-lines">
                        {alert.description}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MCAlertCenter;
