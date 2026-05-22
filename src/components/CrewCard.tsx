/**
 * CrewCard – Phase 5
 * Individual crew member glassmorphism card with health, morale, and status.
 */
import React from "react";
import { User, Heart, Smile, AlertTriangle } from "lucide-react";
import type { CrewMember } from "../types/crew";
import { getCrewStatus } from "../data/crew";

interface CrewCardProps {
  member: CrewMember;
}

const STATUS_STYLES = {
  nominal:  { text: "text-cyber-green",  border: "border-emerald-500/30", bg: "bg-emerald-500/10",  label: "NOMINAL"  },
  fatigued: { text: "text-amber-400",    border: "border-amber-500/30",   bg: "bg-amber-500/10",    label: "FATIGUED" },
  injured:  { text: "text-orange-400",   border: "border-orange-500/30",  bg: "bg-orange-500/10",   label: "INJURED"  },
  critical: { text: "text-rose-400",     border: "border-rose-500/40",    bg: "bg-rose-500/15",     label: "CRITICAL" },
};

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

const CrewCard: React.FC<CrewCardProps> = ({ member }) => {
  const crewStatus = getCrewStatus(member.health, member.morale);
  const style = STATUS_STYLES[crewStatus];

  const healthColor =
    member.health > 60 ? "bg-cyber-green" : member.health > 30 ? "bg-amber-400" : "bg-rose-500";
  const moraleColor =
    member.morale > 60 ? "bg-sky-400" : member.morale > 30 ? "bg-amber-400" : "bg-rose-500";

  const isCritical = crewStatus === "critical" || crewStatus === "injured";

  return (
    <div
      className={`
        glass-panel rounded-lg border p-3 flex flex-col gap-2 relative overflow-hidden
        ${style.border} ${isCritical ? "animate-pulse" : ""}
      `}
    >
      {/* Corner decoration */}
      <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${style.border}`} />

      {/* Header */}
      <div className="flex items-start gap-2">
        <div className={`p-1.5 rounded-md ${style.bg} shrink-0`}>
          {crewStatus === "critical" ? (
            <AlertTriangle className={`h-3.5 w-3.5 ${style.text}`} />
          ) : (
            <User className={`h-3.5 w-3.5 ${style.text}`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono font-bold text-white truncate leading-tight">
            {member.name}
          </p>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest truncate">
            {member.role}
          </p>
        </div>
        <span
          className={`text-[8px] font-mono px-1.5 py-0.5 rounded-full border ${style.border} ${style.text} ${style.bg} shrink-0`}
        >
          {style.label}
        </span>
      </div>

      {/* Specialty */}
      <p className="text-[9px] text-slate-500 font-mono">{member.specialty}</p>

      {/* Health bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[9px] font-mono text-slate-500">
            <Heart className="h-2.5 w-2.5 text-rose-400" /> Health
          </span>
          <span className="text-[9px] font-mono text-slate-400">{member.health.toFixed(0)}%</span>
        </div>
        <MiniBar value={member.health} color={healthColor} />
      </div>

      {/* Morale bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[9px] font-mono text-slate-500">
            <Smile className="h-2.5 w-2.5 text-sky-400" /> Morale
          </span>
          <span className="text-[9px] font-mono text-slate-400">{member.morale.toFixed(0)}%</span>
        </div>
        <MiniBar value={member.morale} color={moraleColor} />
      </div>
    </div>
  );
};

export default CrewCard;
