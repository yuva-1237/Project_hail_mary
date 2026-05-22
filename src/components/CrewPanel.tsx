/**
 * CrewPanel – Phase 5
 * Full crew roster panel showing all 4 crew member cards in a 2×2 grid.
 */
import React from "react";
import { Users } from "lucide-react";
import type { CrewMember } from "../types/crew";
import CrewCard from "./CrewCard";

interface CrewPanelProps {
  crew: CrewMember[];
}

const CrewPanel: React.FC<CrewPanelProps> = ({ crew }) => {
  // Compute average health & morale for fleet summary
  const avgHealth = crew.reduce((s, c) => s + c.health, 0) / crew.length;
  const avgMorale = crew.reduce((s, c) => s + c.morale, 0) / crew.length;

  const statusColor =
    avgHealth > 60 && avgMorale > 60
      ? "text-cyber-green"
      : avgHealth > 35 || avgMorale > 35
      ? "text-amber-400"
      : "text-rose-400";

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold text-tau-teal tracking-widest uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-tau-teal rounded-full" />
          Crew Status
        </h3>
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-slate-500" />
          <span className={`text-[10px] font-mono ${statusColor}`}>
            ♥ {avgHealth.toFixed(0)}% · ☺ {avgMorale.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* 2×2 crew grid */}
      <div className="grid grid-cols-2 gap-3">
        {crew.map((member) => (
          <CrewCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
};

export default CrewPanel;
