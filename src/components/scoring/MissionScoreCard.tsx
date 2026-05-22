/**
 * Phase 8 – MissionScoreCard
 * Primary scoring HUD: animated circular gauge + 6 metric tiles + alert banner.
 */
import React, { useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, ShieldAlert, Fuel } from "lucide-react";
import type { MissionScore, ScoringAlerts } from "../../scoring/types";
import { METRIC_DISPLAY_CONFIG } from "../../scoring/types";

interface MissionScoreCardProps {
  score: MissionScore;
  alerts: ScoringAlerts;
}

// ─── Circular arc gauge ───────────────────────────────────────────────────────

function CircularGauge({ value, grade }: { value: number; grade: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const currentRef = useRef<number>(0);

  const gradeColor: Record<string, string> = {
    S: "#22d3ee", A: "#34d399", B: "#60a5fa",
    C: "#fbbf24", D: "#f97316", F: "#f43f5e",
  };
  const color = gradeColor[grade] ?? "#22d3ee";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const target = value;
    const dpr = window.devicePixelRatio || 1;
    const size = 140;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    function draw(current: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2, cy = size / 2, r = 54;
      const startAngle = Math.PI * 0.75;
      const fullSweep  = Math.PI * 1.5;

      // Track
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + fullSweep);
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth   = 10;
      ctx.lineCap     = "round";
      ctx.stroke();

      // Glow outer ring
      const glowArc = (current / 100) * fullSweep;
      const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
      grad.addColorStop(0, color + "60");
      grad.addColorStop(1, color);
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + glowArc);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 10;
      ctx.lineCap     = "round";
      ctx.shadowColor  = color;
      ctx.shadowBlur   = 16;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Dot at tip
      if (current > 2) {
        const tipAngle = startAngle + glowArc;
        ctx.beginPath();
        ctx.arc(cx + r * Math.cos(tipAngle), cy + r * Math.sin(tipAngle), 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur  = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Score text
      ctx.font = "bold 28px 'Orbitron', monospace";
      ctx.fillStyle = "#f1f5f9";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.round(current).toString(), cx, cy - 4);

      // Grade
      ctx.font = "bold 11px monospace";
      ctx.fillStyle = color;
      ctx.fillText(`GRADE ${grade}`, cx, cy + 18);
    }

    cancelAnimationFrame(animRef.current);
    const duration = 900;
    const startVal = currentRef.current;
    const startTime = performance.now();

    function animate(ts: number) {
      const t = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const curr = startVal + (target - startVal) * eased;
      currentRef.current = curr;
      draw(curr);
      if (t < 1) animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [value, grade, color]);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}

// ─── Trend icon ───────────────────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: MissionScore["trend"] }) {
  if (trend === "improving") return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
  if (trend === "declining") return <TrendingDown className="h-3.5 w-3.5 text-rose-400" />;
  return <Minus className="h-3.5 w-3.5 text-slate-500" />;
}

// ─── Score colour helper ──────────────────────────────────────────────────────

function scoreColor(v: number) {
  if (v >= 70) return { bar: "bg-emerald-500", text: "text-emerald-400", glow: "shadow-emerald-500/20" };
  if (v >= 40) return { bar: "bg-amber-400",   text: "text-amber-300",   glow: "shadow-amber-400/20" };
  return         { bar: "bg-rose-500",          text: "text-rose-400",    glow: "shadow-rose-500/20" };
}

// ─── Single metric tile ───────────────────────────────────────────────────────

function MetricTile({
  label, shortLabel, icon, value, weight,
}: {
  label: string; shortLabel: string; icon: string; value: number; weight: number;
}) {
  const { bar, text, glow } = scoreColor(value);
  return (
    <div className={`glass-panel rounded-md border border-slate-700/40 p-3 flex flex-col gap-2 shadow ${glow}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{icon}</span>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{shortLabel}</span>
        </div>
        <span className="text-[8px] font-mono text-slate-600">{weight}%</span>
      </div>
      <div className="flex items-end justify-between">
        <span className={`text-lg font-orbitron font-bold ${text}`}>{value}</span>
        <span className="text-[8px] font-mono text-slate-600">/100</span>
      </div>
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${bar}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-[8px] font-mono text-slate-600 truncate" title={label}>{label}</p>
    </div>
  );
}

// ─── Alert banner ─────────────────────────────────────────────────────────────

function AlertBanner({ alerts }: { alerts: ScoringAlerts }) {
  const messages: { icon: React.ReactNode; text: string; key: string }[] = [];
  if (alerts.lowSafety)  messages.push({ key: "safety",  icon: <ShieldAlert className="h-3 w-3" />, text: "SAFETY CRITICAL — Score below 50" });
  if (alerts.lowFuel)    messages.push({ key: "fuel",    icon: <Fuel className="h-3 w-3" />,        text: "LOW FUEL — Efficiency below 30%" });
  if (alerts.lowSuccess) messages.push({ key: "success", icon: <AlertTriangle className="h-3 w-3" />, text: "MISSION AT RISK — Success below 40%" });
  if (messages.length === 0) return null;

  const borderClass = alerts.criticalMode ? "border-rose-500/60 bg-rose-950/40" : "border-amber-500/40 bg-amber-950/20";
  const textClass   = alerts.criticalMode ? "text-rose-400" : "text-amber-400";

  return (
    <div className={`rounded-md border ${borderClass} px-3 py-2 flex flex-col gap-1`}>
      {messages.map((m) => (
        <div key={m.key} className={`flex items-center gap-2 text-[10px] font-mono font-bold ${textClass} uppercase tracking-wider`}>
          {m.icon}{m.text}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const MissionScoreCard: React.FC<MissionScoreCardProps> = ({ score, alerts }) => {
  const { metrics, overall, grade, trend, previousOverall } = score;
  const delta = overall - previousOverall;

  const primaryMetrics = METRIC_DISPLAY_CONFIG;

  return (
    <div className="glass-panel rounded-lg border border-tau-teal/20 overflow-hidden relative">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-tau-teal/50" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-tau-teal/50" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-tau-teal/10">
        <h3 className="text-xs font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-tau-teal animate-pulse" />
          Mission Performance Score
        </h3>
        <span className="text-[9px] font-mono text-slate-500 uppercase">
          Updated: {score.lastUpdated}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Alert banner (only shown when alerts fire) */}
        <AlertBanner alerts={alerts} />

        {/* Top row: gauge + summary */}
        <div className="flex items-center gap-6">
          {/* Circular gauge */}
          <div className="flex-shrink-0">
            <CircularGauge value={overall} grade={grade} />
          </div>

          {/* Summary stats */}
          <div className="flex flex-col gap-3 flex-1">
            <div>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Overall Mission Score</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-orbitron font-bold text-white">{overall}</span>
                <div className="flex items-center gap-1">
                  <TrendIcon trend={trend} />
                  <span className={`text-[10px] font-mono font-bold ${
                    delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : "text-slate-500"
                  }`}>
                    {delta > 0 ? `+${delta.toFixed(1)}` : delta < 0 ? delta.toFixed(1) : "stable"}
                  </span>
                </div>
              </div>
            </div>

            {/* Weighted breakdown bar */}
            <div>
              <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest mb-1.5">Score Composition</p>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
                {primaryMetrics.map((m) => {
                  const val = metrics[m.key] as number;
                  const w = m.weight;
                  const contribution = (val / 100) * w;
                  const { bar } = scoreColor(val);
                  return (
                    <div
                      key={m.key}
                      className={`${bar} h-full transition-all duration-700`}
                      style={{ width: `${contribution}%` }}
                      title={`${m.label}: ${val} (${w}% weight)`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[7px] font-mono text-slate-700 mt-0.5">
                <span>Safety 25%</span>
                <span>Decisions 20%</span>
                <span>Science/Fuel/Resources 15%</span>
                <span>Success 10%</span>
              </div>
            </div>

            {/* Grade badge */}
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded font-orbitron text-xs font-bold border ${
                grade === "S" ? "border-tau-teal/60 text-tau-teal bg-tau-teal/10" :
                grade === "A" ? "border-emerald-500/60 text-emerald-400 bg-emerald-500/10" :
                grade === "B" ? "border-sky-500/60 text-sky-400 bg-sky-500/10" :
                grade === "C" ? "border-amber-500/60 text-amber-400 bg-amber-500/10" :
                grade === "D" ? "border-orange-500/60 text-orange-400 bg-orange-500/10" :
                "border-rose-500/60 text-rose-400 bg-rose-500/10"
              }`}>
                GRADE {grade}
              </div>
              <span className="text-[9px] font-mono text-slate-500 capitalize">{trend} trajectory</span>
            </div>
          </div>
        </div>

        {/* Metric tiles grid */}
        <div>
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-3">
            Weighted Performance Metrics
          </p>
          <div className="grid grid-cols-3 gap-3">
            {primaryMetrics.map((m) => (
              <MetricTile
                key={m.key}
                label={m.label}
                shortLabel={m.shortLabel}
                icon={m.icon}
                value={metrics[m.key] as number}
                weight={m.weight}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionScoreCard;
