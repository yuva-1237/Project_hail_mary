/**
 * MissionObjectives – Phase 5
 * Scrollable panel showing all six mission objectives with animated progress bars.
 */
import React from "react";
import { Target, CheckCircle2, Circle, Lock, XCircle, Compass, Database, ShieldAlert, Telescope, Rocket } from "lucide-react";
import type { MissionObjective, ObjectiveCategory } from "../types/objectives";

interface MissionObjectivesProps {
  objectives: MissionObjective[];
}

const CATEGORY_STYLES: Record<ObjectiveCategory, { icon: React.ReactNode; color: string; bg: string }> = {
  navigation: {
    icon: <Compass className="h-3.5 w-3.5" />,
    color: "text-sky-400",
    bg: "bg-sky-500/15",
  },
  resource: {
    icon: <Database className="h-3.5 w-3.5" />,
    color: "text-amber-400",
    bg: "bg-amber-500/15",
  },
  safety: {
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
    color: "text-rose-400",
    bg: "bg-rose-500/15",
  },
  science: {
    icon: <Telescope className="h-3.5 w-3.5" />,
    color: "text-violet-400",
    bg: "bg-violet-500/15",
  },
  mission: {
    icon: <Rocket className="h-3.5 w-3.5" />,
    color: "text-tau-teal",
    bg: "bg-tau-teal/15",
  },
};

function StatusIcon({ status }: { status: MissionObjective["status"] }) {
  switch (status) {
    case "complete":
      return <CheckCircle2 className="h-4 w-4 text-cyber-green shrink-0" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-rose-400 shrink-0" />;
    case "locked":
      return <Lock className="h-4 w-4 text-slate-600 shrink-0" />;
    default:
      return <Circle className="h-4 w-4 text-slate-500 shrink-0" />;
  }
}

const MissionObjectives: React.FC<MissionObjectivesProps> = ({ objectives }) => {
  const completed = objectives.filter((o) => o.status === "complete").length;

  return (
    <div className="glass-panel p-4 rounded-lg border border-tau-teal/15 flex flex-col relative overflow-hidden">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tau-teal/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tau-teal/40" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-tau-teal/10 pb-2.5">
        <h3 className="text-xs font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <Target className="h-4 w-4 text-tau-teal" />
          Mission Objectives
        </h3>
        <span className="text-[10px] font-mono text-tau-teal/70">
          {completed}/{objectives.length} Complete
        </span>
      </div>

      {/* Objectives list */}
      <div className="space-y-2.5">
        {objectives.map((obj) => {
          const catStyle = CATEGORY_STYLES[obj.category];
          const isComplete = obj.status === "complete";
          const isFailed = obj.status === "failed";
          const isLocked = obj.status === "locked";

          return (
            <div
              key={obj.id}
              className={`rounded-md border p-2.5 transition-all duration-500 ${
                isComplete
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : isFailed
                  ? "border-rose-500/20 bg-rose-500/5 opacity-60"
                  : isLocked
                  ? "border-slate-700/30 opacity-40"
                  : "border-slate-700/40"
              }`}
            >
              <div className="flex items-start gap-2">
                <StatusIcon status={obj.status} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p
                      className={`text-[11px] font-mono font-semibold ${
                        isComplete
                          ? "text-cyber-green line-through"
                          : isFailed
                          ? "text-rose-400 line-through"
                          : isLocked
                          ? "text-slate-600"
                          : "text-white"
                      }`}
                    >
                      {obj.title}
                    </p>
                    {/* Category pill */}
                    <span
                      className={`shrink-0 text-[8px] font-mono px-1.5 py-0.5 rounded-full ${catStyle.bg} ${catStyle.color}`}
                    >
                      {obj.category.toUpperCase()}
                    </span>
                    {/* Bonus */}
                    {isComplete && (
                      <span className="shrink-0 text-[8px] font-mono text-cyber-green">
                        +{obj.successBonus}%
                      </span>
                    )}
                  </div>

                  <p className="text-[9px] text-slate-500 leading-relaxed mb-1.5">
                    {obj.description}
                  </p>

                  {/* Progress bar */}
                  {!isLocked && (
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          isComplete
                            ? "bg-cyber-green"
                            : isFailed
                            ? "bg-rose-500"
                            : "bg-tau-teal"
                        }`}
                        style={{ width: `${obj.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MissionObjectives;
