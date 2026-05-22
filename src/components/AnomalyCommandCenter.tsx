/**
 * HGACS – Human-Governed Anomaly Command System
 * Phase 10 upgrade of the former MARM AnomalyCommandCenter.
 *
 * ALL anomalies require explicit human authorization.
 * AI provides intelligence and recommendations; humans retain ultimate authority.
 *
 * 5-Phase Workflow:
 *  1. Detection & Classification
 *  2. Multi-Agent Deliberation
 *  3. Digital Twin Monte Carlo Simulation
 *  4. Explainable AI (XAI) Recommendation
 *  5. Governance & Human Authorization
 */

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Clock,
  ShieldCheck,
  Zap,
  Flame,
  Wind,
  Heart,
  Activity,
  ChevronRight,
  ChevronDown,
  Info,
  FileText,
  User,
  Brain,
  Cpu,
  BarChart3,
  Shield,
  Eye,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  Minus,
  ListChecks,
  Network,
  Radar,
} from "lucide-react";
import type { AnomalyQueueItem, HGACSAuthorityLevel, HGACSAuditEntry } from "../types/missionControl";
import type { SimulationResult } from "../digitalTwin/simulateAction";

/* ─────────────────────────────────────────── helpers ── */

function severityColor(severity: string) {
  if (severity === "Critical") return "text-red-400 border-red-500/40 bg-red-950/30";
  if (severity === "High") return "text-amber-400 border-amber-500/40 bg-amber-950/30";
  if (severity === "Medium") return "text-yellow-400 border-yellow-500/30 bg-yellow-950/20";
  return "text-tau-teal border-tau-teal/30 bg-tau-teal/5";
}

function severityBadge(severity: string) {
  if (severity === "Critical") return "bg-red-500/20 text-red-400 border border-red-500/40";
  if (severity === "High") return "bg-amber-500/20 text-amber-400 border border-amber-500/40";
  if (severity === "Medium") return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40";
  return "bg-tau-teal/10 text-tau-teal border border-tau-teal/30";
}

function deltaTag(value: number, unit = "%") {
  if (value > 0) return <span className="text-cyber-green font-mono text-[11px]">+{value.toFixed(1)}{unit}</span>;
  if (value < 0) return <span className="text-red-400 font-mono text-[11px]">{value.toFixed(1)}{unit}</span>;
  return <span className="text-slate-500 font-mono text-[11px]">—</span>;
}

function SuccessBar({ value }: { value: number }) {
  const color = value >= 70 ? "bg-cyber-green" : value >= 45 ? "bg-amber-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-[11px] font-bold font-mono ${value >= 70 ? "text-cyber-green" : value >= 45 ? "text-amber-400" : "text-red-400"}`}>
        {value.toFixed(0)}%
      </span>
    </div>
  );
}

function authorityBadge(level: HGACSAuthorityLevel) {
  if (level === "Mission Commander") return "bg-purple-500/20 text-purple-300 border border-purple-500/40";
  if (level === "Flight Director") return "bg-tau-teal/15 text-tau-teal border border-tau-teal/40";
  return "bg-slate-700/40 text-slate-400 border border-slate-600/40";
}

function authorityIcon(level: HGACSAuthorityLevel) {
  if (level === "Mission Commander") return <Lock className="w-3 h-3" />;
  if (level === "Flight Director") return <Shield className="w-3 h-3" />;
  return <Eye className="w-3 h-3" />;
}

/* ─────────────────────── Workflow Step Definitions ── */

type WorkflowStep = "detection" | "deliberation" | "simulation" | "xai" | "governance";

const WORKFLOW_STEPS: { id: WorkflowStep; label: string; icon: React.ReactNode; shortLabel: string }[] = [
  { id: "detection",    label: "Detection & Classification", shortLabel: "Detection",    icon: <Radar className="w-4 h-4" /> },
  { id: "deliberation", label: "Multi-Agent Deliberation",   shortLabel: "Deliberation", icon: <Network className="w-4 h-4" /> },
  { id: "simulation",   label: "Digital Twin Simulation",    shortLabel: "Simulation",   icon: <Cpu className="w-4 h-4" /> },
  { id: "xai",          label: "Explainable AI",             shortLabel: "XAI",          icon: <Brain className="w-4 h-4" /> },
  { id: "governance",   label: "Human Authorization",        shortLabel: "Authorize",    icon: <ShieldCheck className="w-4 h-4" /> },
];

const STEP_ORDER: WorkflowStep[] = ["detection", "deliberation", "simulation", "xai", "governance"];

/* ─────────────────────────────── SimCard ── */

interface SimCardProps {
  sim: SimulationResult;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect: () => void;
  rank: number;
}

const SimCard: React.FC<SimCardProps> = ({ sim, isRecommended, isSelected, onSelect, rank }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-xl border cursor-pointer transition-all duration-200 overflow-hidden
        ${isSelected
          ? "border-tau-teal/80 bg-tau-teal/10 shadow-lg shadow-tau-teal/10"
          : isRecommended
            ? "border-amber-500/50 bg-amber-950/20 hover:border-amber-400/70"
            : "border-slate-700/60 bg-slate-900/60 hover:border-slate-600"
        }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-5 h-5 rounded-full shrink-0 border-2 flex items-center justify-center text-[9px] font-bold transition-colors
            ${isSelected ? "border-tau-teal bg-tau-teal text-slate-950" : "border-slate-600 bg-slate-800 text-slate-500"}`}>
            {rank}
          </div>
          <span className="font-mono font-bold text-[12px] text-white truncate">{sim.actionName}</span>
          {isRecommended && (
            <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded shrink-0">
              AI Rec
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          className="shrink-0 text-slate-500 hover:text-tau-teal transition-colors"
        >
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Success bar */}
      <div className="px-3 pb-2.5">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">Monte Carlo Success</div>
        <SuccessBar value={sim.successProbability} />
      </div>

      {/* Deltas */}
      <div className="grid grid-cols-4 gap-1 px-3 pb-2.5 text-center">
        {[
          { icon: <Flame className="w-3 h-3" />, label: "Fuel", val: sim.fuelDelta },
          { icon: <Zap className="w-3 h-3" />, label: "Power", val: sim.powerDelta },
          { icon: <Wind className="w-3 h-3" />, label: "O₂", val: sim.oxygenDelta },
          { icon: <Heart className="w-3 h-3" />, label: "Hull", val: sim.healthDelta },
        ].map(({ icon, label, val }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span className="text-slate-500">{icon}</span>
            <span className="text-[9px] text-slate-500 uppercase">{label}</span>
            {deltaTag(val)}
          </div>
        ))}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-slate-700/50 pt-2.5 space-y-1.5">
          {sim.benefits && (
            <div>
              <div className="text-[10px] font-bold uppercase text-cyber-green/80 tracking-wider mb-1">Expected Benefits</div>
              <p className="text-[11px] text-cyber-green/70 leading-relaxed">{sim.benefits}</p>
            </div>
          )}
          {sim.risks && (
            <div>
              <div className="text-[10px] font-bold uppercase text-red-400 tracking-wider mb-1">Identified Risks</div>
              <p className="text-[11px] text-red-300/80 leading-relaxed">{sim.risks}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────── Queue Item Card ── */

interface QueueItemCardProps {
  item: AnomalyQueueItem;
  isActive: boolean;
  onClick: () => void;
}

const QueueItemCard: React.FC<QueueItemCardProps> = ({ item, isActive, onClick }) => {
  const statusIcon =
    item.status === "Approved"  ? <CheckCircle2 className="w-3.5 h-3.5 text-cyber-green" /> :
    item.status === "Rejected"  ? <XCircle className="w-3.5 h-3.5 text-red-400" /> :
    item.status === "Executed"  ? <ShieldCheck className="w-3.5 h-3.5 text-tau-teal" /> :
    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border px-3 py-2 transition-all duration-200
        ${isActive
          ? "border-tau-teal/70 bg-tau-teal/10"
          : "border-slate-700/60 bg-slate-900/40 hover:border-slate-600/80 hover:bg-slate-800/40"
        }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {statusIcon}
          <span className="font-mono text-[11px] font-bold text-white truncate">{item.event.title}</span>
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${severityBadge(item.event.severity)}`}>
          {item.event.severity}
        </span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
        <span className={`text-[9px] font-mono uppercase tracking-wide
          ${item.status === "Pending" ? "text-amber-400" :
            item.status === "Approved" ? "text-cyber-green" :
            item.status === "Rejected" ? "text-red-400" : "text-tau-teal"}`}>
          {item.status}
        </span>
      </div>
    </button>
  );
};

/* ─────────────────────── XAI Comparison Panel ── */

function XAIPanel({
  recommended,
  allSims,
  selectedAction,
}: {
  recommended: SimulationResult | null;
  allSims: SimulationResult[];
  selectedAction: string | null;
}) {
  const others = allSims.filter((s) => s.actionName !== recommended?.actionName).slice(0, 2);
  const selected = allSims.find((s) => s.actionName === selectedAction);

  return (
    <div className="space-y-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
        <Brain className="w-3.5 h-3.5" />
        Why This Recommendation?
      </div>

      {recommended ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">AI Recommends:</span>
            <span className="text-[12px] font-bold text-white font-mono">"{recommended.actionName}"</span>
          </div>
          <p className="text-[12px] text-slate-200 leading-relaxed">{recommended.benefits}</p>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <div className="text-[10px] font-bold uppercase text-cyber-green/70 mb-1.5">Why recommended</div>
              <ul className="space-y-1">
                <li className="flex gap-1.5 text-slate-300">
                  <TrendingUp className="w-3 h-3 text-cyber-green shrink-0 mt-0.5" />
                  Highest Monte Carlo success probability
                </li>
                {recommended.benefits && (
                  <li className="flex gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-cyber-green shrink-0 mt-0.5" />
                    {recommended.benefits}
                  </li>
                )}
                {recommended.successProbability >= 70 && (
                  <li className="flex gap-1.5 text-slate-300">
                    <ShieldCheck className="w-3 h-3 text-cyber-green shrink-0 mt-0.5" />
                    Risk-adjusted score above mission safety threshold
                  </li>
                )}
              </ul>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-red-400/70 mb-1.5">Residual risks</div>
              <ul className="space-y-1">
                {recommended.risks ? (
                  <li className="flex gap-1.5 text-slate-400">
                    <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                    {recommended.risks}
                  </li>
                ) : (
                  <li className="text-slate-500 text-[11px]">No critical risks identified</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-slate-500 text-[12px]">No recommendation available.</div>
      )}

      {others.length > 0 && (
        <>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pt-1">
            <Minus className="w-3 h-3" />
            Why not alternatives?
          </div>
          <div className="space-y-2">
            {others.map((alt) => (
              <div key={alt.actionName} className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-[11px] text-slate-300">{alt.actionName}</span>
                  <span className={`text-[10px] font-mono font-bold ${alt.successProbability >= 70 ? "text-cyber-green" : alt.successProbability >= 45 ? "text-amber-400" : "text-red-400"}`}>
                    {alt.successProbability.toFixed(0)}% success
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-[11px] text-slate-500">
                  <TrendingDown className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                  Lower success probability than recommended action
                  {alt.risks && <span>. Primary risk: {alt.risks}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selected && selected.actionName !== recommended?.actionName && (
        <div className="rounded-xl border border-tau-teal/30 bg-tau-teal/5 p-3">
          <div className="text-[10px] font-bold uppercase text-tau-teal tracking-wider mb-1.5">Your Selected Action</div>
          <div className="font-mono font-bold text-white text-[12px] mb-1">"{selected.actionName}"</div>
          <p className="text-[11px] text-slate-300">{selected.benefits}</p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Audit Trail ── */

function AuditTrail({ log }: { log: HGACSAuditEntry[] }) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3">
        <ListChecks className="w-3.5 h-3.5" />
        Tamper-Resistant Audit Trail
      </div>
      {log.length === 0 ? (
        <div className="text-slate-600 text-[11px]">No entries yet.</div>
      ) : (
        <div className="space-y-1.5">
          {log.map((entry, i) => (
            <div key={i} className="flex gap-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60 px-3 py-2">
              <div className="shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-tau-teal/60 mt-1" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-500">{entry.timestamp}</span>
                  <span className="text-[10px] font-bold text-tau-teal">{entry.actor}</span>
                  {entry.authorityLevel && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ${authorityBadge(entry.authorityLevel)}`}>
                      {entry.authorityLevel}
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-bold text-white mt-0.5">{entry.action}</div>
                {entry.detail && <div className="text-[11px] text-slate-400 mt-0.5">{entry.detail}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Agent Deliberation Cards ── */

function AgentDeliberationPanel({ collaboration }: { collaboration: any }) {
  if (!collaboration) {
    return (
      <div className="text-slate-500 text-[12px] text-center py-6">
        Agent collaboration data unavailable.
      </div>
    );
  }

  const agents = [
    { key: "navigation",   label: "NAV",      color: "text-blue-400",       bg: "bg-blue-950/20 border-blue-500/30",   icon: <Activity className="w-3.5 h-3.5" /> },
    { key: "resource",     label: "RES",      color: "text-amber-400",      bg: "bg-amber-950/20 border-amber-500/30", icon: <Flame className="w-3.5 h-3.5" /> },
    { key: "safety",       label: "SAF",      color: "text-red-400",        bg: "bg-red-950/20 border-red-500/30",     icon: <Shield className="w-3.5 h-3.5" /> },
    { key: "science",      label: "SCI",      color: "text-purple-400",     bg: "bg-purple-950/20 border-purple-500/30", icon: <Brain className="w-3.5 h-3.5" /> },
    { key: "commander",    label: "CMD",      color: "text-tau-teal",       bg: "bg-tau-teal/10 border-tau-teal/30",   icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  const recs = collaboration.recommendations || {};
  const cmdDecision = collaboration.commanderDecision;
  const session = collaboration.discussionSession;

  return (
    <div className="space-y-4">
      {/* Agent recommendation cards in 2-column grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
        {agents.map(({ key, label, color, bg, icon }) => {
          const rec = recs[key];
          if (!rec) return null;
          return (
            <div key={key} className={`rounded-xl border p-3 ${bg}`}>
              <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${color} mb-2`}>
                {icon}
                {label} Agent
              </div>
              <div className="font-mono font-bold text-[11px] text-white mb-1">
                "{rec.action || rec.recommendation || "—"}"
              </div>
              {rec.confidence !== undefined && (
                <div className="text-[10px] text-slate-500">
                  Confidence: <span className="text-slate-300 font-bold">{(rec.confidence * 100).toFixed(0)}%</span>
                </div>
              )}
              {rec.reasoning && (
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-3">{rec.reasoning}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Commander synthesis */}
      {cmdDecision && (
        <div className="rounded-xl border border-tau-teal/40 bg-tau-teal/8 p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-tau-teal mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Commander Agent Synthesis
          </div>
          <div className="font-mono font-bold text-white text-[13px] mb-1.5">
            Recommends: "{cmdDecision.finalAction}"
          </div>
          {cmdDecision.reasoning && (
            <p className="text-[12px] text-slate-200 leading-relaxed">{cmdDecision.reasoning}</p>
          )}
          {cmdDecision.confidence !== undefined && (
            <div className="mt-2 text-[10px] text-slate-400">
              Confidence: <span className="font-bold text-white">{(cmdDecision.confidence * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Discussion session summary */}
      {session && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Discussion Summary</div>
          <p className="text-[11px] text-slate-300 leading-relaxed">{session.discussionSummary}</p>
          {session.consensusScore !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] text-slate-500">Consensus Score:</span>
              <div className="flex-1 max-w-[120px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${session.consensusScore >= 0.7 ? "bg-cyber-green" : session.consensusScore >= 0.4 ? "bg-amber-400" : "bg-red-500"}`}
                  style={{ width: `${session.consensusScore * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-white">{(session.consensusScore * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── main component ── */

export interface AnomalyCommandCenterProps {
  anomalyQueue: AnomalyQueueItem[];
  humanOverrideLog: HumanOverrideLog[];
  safetyWindow: string;
  timerFallback: "wait" | "auto";
  timeLeft: number | null;
  onResolveAnomaly: (
    actionName: string,
    userDecision: "approved" | "rejected" | "alternative" | "override",
    justification: string,
    authorityLevel?: HGACSAuthorityLevel
  ) => void;
  onChangeSafetyWindow: (val: string) => void;
  onChangeTimerFallback: (val: "wait" | "auto") => void;
  onClose: () => void;
  activeStep?: WorkflowStep;
  onChangeActiveStep?: (step: WorkflowStep) => void;
  onRerunSimulations?: (anomalyId: string, depth: number) => void;
}

// Re-exported so Dashboard doesn't need to import from types twice
export type HumanOverrideLog = import("../types/missionControl").HumanOverrideRecord;

export const AnomalyCommandCenter: React.FC<AnomalyCommandCenterProps> = ({
  anomalyQueue,
  humanOverrideLog,
  safetyWindow,
  timeLeft,
  onResolveAnomaly,
  onChangeSafetyWindow,
  onClose,
  activeStep: externalStep,
  onChangeActiveStep,
  onRerunSimulations,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [justification, setJustification] = useState("");
  const [sidebarTab, setSidebarTab] = useState<"queue" | "log" | "audit">("queue");
  const [localStep, setLocalStep] = useState<WorkflowStep>("detection");
  const [authorityLevel, setAuthorityLevel] = useState<HGACSAuthorityLevel>("Flight Director");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<"approved" | "rejected" | "alternative" | "override" | null>(null);
  const [mcDepth, setMcDepth] = useState<100 | 500 | 1000>(500);

  const activeStep = externalStep ?? localStep;
  const setActiveStep = onChangeActiveStep ?? setLocalStep;

  const handleRerunLocalSimulations = () => {
    if (activeItem && onRerunSimulations) {
      onRerunSimulations(activeItem.id, mcDepth);
    }
  };

  const pendingItems = anomalyQueue.filter((a) => a.status === "Pending");
  const resolvedItems = anomalyQueue.filter((a) => a.status !== "Pending");

  const activeItem: AnomalyQueueItem | undefined =
    activeId
      ? anomalyQueue.find((a) => a.id === activeId)
      : pendingItems[0] ?? anomalyQueue[0];

  const recommendedAction = activeItem?.recommendation?.finalAction ?? null;
  const recommendedSim = activeItem?.digitalTwinPredictions?.find(
    (p) => p.actionName === recommendedAction
  ) ?? activeItem?.digitalTwinPredictions?.[0] ?? null;

  // Reset selection when active item changes
  useEffect(() => {
    setSelectedAction(null);
    setJustification("");
    setActiveStep("detection");
    setConfirmOpen(false);
    setPendingDecision(null);
  }, [activeItem?.id]);

  // Auto-advance to governance step if everything else is ready
  useEffect(() => {
    if (
      activeItem?.status === "Pending" &&
      activeItem?.digitalTwinPredictions?.length > 0 &&
      activeItem?.recommendation
    ) {
      // Don't auto-advance past xai if user hasn't started
      if (activeStep === "detection") {
        setTimeout(() => setActiveStep("deliberation"), 800);
      }
    }
  }, [activeItem?.id]);

  const isObserver = authorityLevel === "Observer";

  const requestDecision = (decision: "approved" | "rejected" | "alternative" | "override") => {
    if (isObserver) return;
    setPendingDecision(decision);
    setConfirmOpen(true);
  };

  const confirmDecision = () => {
    if (!activeItem || !pendingDecision) return;
    const action =
      pendingDecision === "rejected"
        ? (activeItem.digitalTwinPredictions?.find(
            (p) => p.actionName === "Ignore" || p.actionName === "Continue Mission" || p.actionName === "Continue Operations"
          ) ?? activeItem.digitalTwinPredictions?.[0])?.actionName ?? "Ignore"
        : (selectedAction ?? recommendedAction ?? activeItem.digitalTwinPredictions?.[0]?.actionName ?? "Ignore");

    onResolveAnomaly(action, pendingDecision, justification || "(No justification provided)", authorityLevel);
    setJustification("");
    setSelectedAction(null);
    setConfirmOpen(false);
    setPendingDecision(null);

    // Advance to next pending item
    const nextPending = pendingItems.find((p) => p.id !== activeItem.id);
    setActiveId(nextPending?.id ?? null);
  };

  const timerBarWidth = (() => {
    if (timeLeft === null) return 100;
    const totalSecs = parseInt(safetyWindow, 10) || 30;
    return Math.max(0, Math.min(100, (timeLeft / totalSecs) * 100));
  })();

  const timerColor = timerBarWidth > 50 ? "bg-cyber-green" : timerBarWidth > 20 ? "bg-amber-400" : "bg-red-500";

  const currentStepIndex = STEP_ORDER.indexOf(activeStep);

  // Build a local audit log for the active item
  const localAuditLog: HGACSAuditEntry[] = activeItem?.auditLog ?? [
    { timestamp: activeItem?.timestamp ?? "—", actor: "System", action: "Anomaly Detected", detail: `"${activeItem?.event?.title ?? ""}" — Severity: ${activeItem?.event?.severity ?? ""}` },
    { timestamp: activeItem?.timestamp ?? "—", actor: "System", action: "Multi-Agent Deliberation Complete", detail: activeItem?.collaboration ? "Agent collaboration snapshot attached." : "Using fallback analysis." },
    { timestamp: activeItem?.timestamp ?? "—", actor: "System", action: "Digital Twin Simulation Complete", detail: `${activeItem?.digitalTwinPredictions?.length ?? 0} action(s) simulated. Recommended: "${recommendedAction ?? "—"}"` },
    { timestamp: activeItem?.timestamp ?? "—", actor: "System", action: "XAI Report Generated", detail: "Explainable AI reasoning available in XAI panel." },
    { timestamp: activeItem?.timestamp ?? "—", actor: "System", action: "Awaiting Human Authorization", detail: `Operator role: ${authorityLevel}. Simulation held pending decision.` },
  ].filter((_, i) => i <= currentStepIndex + 1);

  /* ─── Render ── */
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/97 backdrop-blur-sm flex flex-col overflow-hidden font-mono">

      {/* ── Title bar ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-red-500/25 bg-gradient-to-r from-red-950/30 via-slate-950/50 to-purple-950/20 shrink-0">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-red-400 animate-pulse" />
          <span className="font-orbitron font-black text-sm text-white tracking-widest uppercase">
            🛡️ Human-Governed Anomaly Command System
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-widest">
            HGACS Active
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25 uppercase tracking-widest">
            All Manual
          </span>
          {pendingItems.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
              {pendingItems.length} Pending Authorization
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Safety window selector */}
          <div className="flex items-center gap-2 text-[10px] text-slate-400 border border-slate-700/60 px-2 py-1 rounded-md">
            <Clock className="w-3 h-3" />
            <span className="uppercase tracking-wide">Hold Window</span>
            <select
              value={safetyWindow}
              onChange={(e) => onChangeSafetyWindow(e.target.value)}
              className="bg-transparent text-white outline-none text-[10px] cursor-pointer"
            >
              <option value="0">∞ Hold</option>
              <option value="30">30s</option>
              <option value="60">60s</option>
              <option value="120">120s</option>
            </select>
          </div>

          {/* Authority level */}
          <div className={`flex items-center gap-1.5 text-[10px] border px-2 py-1 rounded-md cursor-pointer ${authorityBadge(authorityLevel)}`}>
            {authorityIcon(authorityLevel)}
            <select
              value={authorityLevel}
              onChange={(e) => setAuthorityLevel(e.target.value as HGACSAuthorityLevel)}
              className="bg-transparent outline-none text-[10px] cursor-pointer font-bold"
            >
              <option value="Observer">Observer</option>
              <option value="Flight Director">Flight Director</option>
              <option value="Mission Commander">Mission Commander</option>
            </select>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
            title="Return to dashboard"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Safety hold bar ── */}
      {timeLeft !== null && pendingItems.length > 0 && (
        <div className="shrink-0 px-0">
          <div className="relative h-[3px] w-full bg-slate-800">
            <div className={`h-full ${timerColor} transition-all duration-1000`} style={{ width: `${timerBarWidth}%` }} />
          </div>
          <div className="flex justify-between items-center px-6 py-1 text-[10px] text-slate-500">
            <span>Hold timer: <span className={`font-bold ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-white"}`}>{timeLeft}s</span> remaining</span>
            <span className="uppercase tracking-wider text-amber-400/70">Simulation held — human decision required</span>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT: Sidebar ── */}
        <div className="w-[220px] shrink-0 border-r border-slate-800/60 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-800/60 shrink-0">
            {(["queue", "log", "audit"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSidebarTab(t)}
                className={`flex-1 py-2 text-[9px] uppercase tracking-widest font-bold transition-colors
                  ${sidebarTab === t ? "text-tau-teal border-b-2 border-tau-teal" : "text-slate-500 hover:text-slate-300"}`}
              >
                {t === "queue" ? `Queue (${anomalyQueue.length})` : t === "log" ? `Log (${humanOverrideLog.length})` : "Audit"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {sidebarTab === "queue" ? (
              anomalyQueue.length === 0 ? (
                <div className="text-center text-[11px] text-slate-600 mt-8">No anomalies</div>
              ) : (
                [...pendingItems, ...resolvedItems].map((item) => (
                  <QueueItemCard
                    key={item.id}
                    item={item}
                    isActive={activeItem?.id === item.id}
                    onClick={() => setActiveId(item.id)}
                  />
                ))
              )
            ) : sidebarTab === "log" ? (
              humanOverrideLog.length === 0 ? (
                <div className="text-center text-[11px] text-slate-600 mt-8">No decisions yet</div>
              ) : (
                humanOverrideLog.map((rec, i) => (
                  <div key={i} className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-3 py-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-tau-teal" />
                      <span className="text-[11px] font-bold text-white truncate">{rec.anomalyTitle}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{rec.timestamp}</div>
                    <div className="text-[10px]">
                      <span className={`font-bold uppercase ${rec.userDecision === "approved" ? "text-cyber-green" : rec.userDecision === "rejected" ? "text-red-400" : "text-amber-400"}`}>
                        {rec.userDecision}
                      </span>
                      <span className="text-slate-500"> → </span>
                      <span className="text-slate-300">{rec.selectedAction}</span>
                    </div>
                    {rec.authorityLevel && (
                      <div className={`text-[9px] px-1.5 py-0.5 rounded inline-flex items-center gap-1 font-bold uppercase tracking-widest ${authorityBadge(rec.authorityLevel as HGACSAuthorityLevel)}`}>
                        {rec.authorityLevel}
                      </div>
                    )}
                    {rec.justification && rec.justification !== "(No justification provided)" && (
                      <div className="text-[10px] text-slate-500 italic">"{rec.justification}"</div>
                    )}
                  </div>
                ))
              )
            ) : (
              /* Audit tab */
              activeItem ? (
                <div className="p-1">
                  <AuditTrail log={localAuditLog} />
                </div>
              ) : (
                <div className="text-center text-[11px] text-slate-600 mt-8">Select an anomaly</div>
              )
            )}
          </div>
        </div>

        {/* ── CENTER + RIGHT ── */}
        {activeItem ? (
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Resolved banner */}
            {activeItem.status !== "Pending" && (
              <div className={`shrink-0 px-6 py-2 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2
                ${activeItem.status === "Approved" ? "bg-cyber-green/10 text-cyber-green border-b border-cyber-green/20" :
                  activeItem.status === "Rejected" ? "bg-red-950/30 text-red-400 border-b border-red-500/20" :
                  "bg-tau-teal/10 text-tau-teal border-b border-tau-teal/20"}`}>
                {activeItem.status === "Approved" ? <CheckCircle2 className="w-4 h-4" /> :
                 activeItem.status === "Rejected" ? <XCircle className="w-4 h-4" /> :
                 <ShieldCheck className="w-4 h-4" />}
                Anomaly {activeItem.status.toLowerCase()} by human operator.
                {activeItem.selectedAction && (
                  <span className="font-normal text-slate-400 ml-1">
                    Action: <span className="font-bold text-white">{activeItem.selectedAction}</span>
                  </span>
                )}
              </div>
            )}

            {/* ── Workflow Stepper ── */}
            <div className="shrink-0 border-b border-slate-800/60 bg-slate-950/60 px-4 py-2">
              <div className="flex items-center gap-0">
                {WORKFLOW_STEPS.map((step, idx) => {
                  const isActive = activeStep === step.id;
                  const isDone = STEP_ORDER.indexOf(activeStep) > idx;
                  const isClickable = isDone || isActive || STEP_ORDER.indexOf(activeStep) >= idx - 1;
                  return (
                    <React.Fragment key={step.id}>
                      <button
                        onClick={() => isClickable && setActiveStep(step.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                          ${isActive
                            ? "bg-tau-teal/15 text-tau-teal border border-tau-teal/40"
                            : isDone
                              ? "text-cyber-green border border-cyber-green/30 bg-cyber-green/5 cursor-pointer hover:bg-cyber-green/10"
                              : isClickable
                                ? "text-slate-400 border border-slate-700/50 cursor-pointer hover:text-slate-200 hover:border-slate-600"
                                : "text-slate-600 border border-transparent cursor-default"
                          }`}
                      >
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.icon}
                        <span className="hidden xl:inline">{step.shortLabel}</span>
                      </button>
                      {idx < WORKFLOW_STEPS.length - 1 && (
                        <div className={`w-5 h-[1px] mx-0.5 ${isDone ? "bg-cyber-green/40" : "bg-slate-700/60"}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* ── Main content area (scrollable) ── */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* ── STEP 1: Detection & Classification ── */}
              {activeStep === "detection" && (
                <>
                  {/* Anomaly summary card */}
                  <div className={`rounded-xl border p-4 ${severityColor(activeItem.event.severity)}`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <AlertTriangle className="w-4 h-4" />
                          <h2 className="font-orbitron font-black text-base text-white tracking-wide">
                            {activeItem.event.title}
                          </h2>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${severityBadge(activeItem.event.severity)}`}>
                            {activeItem.event.severity}
                          </span>
                          {activeItem.event.isOpportunity && (
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest bg-cyber-green/10 text-cyber-green border border-cyber-green/30">
                              Opportunity
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest bg-red-500/15 text-red-300 border border-red-500/25">
                            🛡️ Manual Authorization Required
                          </span>
                        </div>
                        <p className="text-[12px] text-slate-300 leading-relaxed">{activeItem.event.description}</p>
                      </div>
                      <div className="shrink-0 text-right text-[10px] text-slate-500 min-w-[110px]">
                        <div>{activeItem.timestamp}</div>
                        {activeItem.event.appliedEffects && Object.keys(activeItem.event.appliedEffects).length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {activeItem.event.appliedEffects.fuel !== undefined && (
                              <div className="text-red-400">Fuel −{activeItem.event.appliedEffects.fuel}%</div>
                            )}
                            {activeItem.event.appliedEffects.power !== undefined && (
                              <div className="text-amber-400">Power −{activeItem.event.appliedEffects.power}%</div>
                            )}
                            {activeItem.event.appliedEffects.oxygen !== undefined && (
                              <div className="text-blue-400">O₂ −{activeItem.event.appliedEffects.oxygen}%</div>
                            )}
                            {activeItem.event.appliedEffects.health !== undefined && (
                              <div className="text-red-400">Hull −{activeItem.event.appliedEffects.health}%</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Threat classification metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-white/10">
                      {[
                        { label: "Threat Class", value: activeItem.event.severity, color: activeItem.event.severity === "Critical" ? "text-red-400" : activeItem.event.severity === "High" ? "text-amber-400" : "text-yellow-400" },
                        { label: "Response Mode", value: "MANUAL ONLY", color: "text-red-300" },
                        { label: "AI Advisory", value: "ADVISORY", color: "text-amber-400" },
                        { label: "Human Required", value: "YES", color: "text-cyber-green" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-lg bg-black/20 px-3 py-2 text-center">
                          <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">{label}</div>
                          <div className={`text-[12px] font-bold font-mono ${color}`}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveStep("deliberation")}
                    className="flex items-center gap-2 text-[11px] text-tau-teal hover:text-white transition-colors font-bold uppercase tracking-wider"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Proceed to Multi-Agent Deliberation
                  </button>
                </>
              )}

              {/* ── STEP 2: Multi-Agent Deliberation ── */}
              {activeStep === "deliberation" && (
                <>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1">
                    <Network className="w-3.5 h-3.5" />
                    Multi-Agent Deliberation — Advisory Intelligence
                    <span className="text-[9px] ml-2 px-2 py-0.5 bg-slate-800/80 border border-slate-700/60 rounded text-slate-500 normal-case tracking-normal font-normal uppercase">
                      For operator context only — no automatic action
                    </span>
                  </div>
                  <AgentDeliberationPanel collaboration={activeItem.collaboration ?? null} />
                  <button
                    onClick={() => setActiveStep("simulation")}
                    className="flex items-center gap-2 text-[11px] text-tau-teal hover:text-white transition-colors font-bold uppercase tracking-wider"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Proceed to Digital Twin Simulation
                  </button>
                </>
              )}

              {/* ── STEP 3: Digital Twin Monte Carlo ── */}
              {activeStep === "simulation" && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-tau-teal font-bold">
                      <Cpu className="w-3.5 h-3.5" />
                      Digital Twin Monte Carlo Analysis — Select Action
                    </div>
                    {/* MC depth selector and rerun */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 border border-slate-700/60 rounded-md px-2 py-1">
                        <BarChart3 className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">MC Depth</span>
                        {([100, 500, 1000] as const).map((d) => (
                          <button
                            key={d}
                            onClick={() => setMcDepth(d)}
                            className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors
                              ${mcDepth === d ? "bg-tau-teal/20 text-tau-teal border border-tau-teal/40" : "text-slate-500 hover:text-slate-300"}`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                      {activeItem.status === "Pending" && (
                        <button
                          onClick={handleRerunLocalSimulations}
                          className="flex items-center gap-1 px-3 py-1 text-[10px] uppercase font-bold text-tau-teal border border-tau-teal/50 hover:bg-tau-teal/10 rounded-md cursor-pointer transition-colors"
                        >
                          <RefreshCcw className="w-3 h-3" /> Rerun Simulation
                        </button>
                      )}
                    </div>
                  </div>

                  {activeItem.digitalTwinPredictions?.length === 0 ? (
                    <div className="text-[11px] text-slate-500">No simulations available.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                      {[...activeItem.digitalTwinPredictions]
                        .sort((a, b) => b.successProbability - a.successProbability)
                        .map((sim, idx) => (
                          <SimCard
                            key={sim.actionName}
                            sim={sim}
                            rank={idx + 1}
                            isRecommended={sim.actionName === recommendedAction}
                            isSelected={
                              selectedAction === sim.actionName ||
                              (selectedAction === null && sim.actionName === recommendedAction)
                            }
                            onSelect={() => {
                              if (activeItem.status === "Pending") setSelectedAction(sim.actionName);
                            }}
                          />
                        ))}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 italic flex items-center justify-between gap-1.5 pt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Info className="w-3 h-3 text-slate-500" />
                      Results are advisory — human operator must authorize execution.
                    </span>
                    <span className="font-mono text-[10px] text-tau-teal font-bold bg-tau-teal/10 border border-tau-teal/30 px-2 py-0.5 rounded-md">
                      Total Simulated Runs: {activeItem.runsSimulated || 500}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveStep("xai")}
                    className="flex items-center gap-2 text-[11px] text-tau-teal hover:text-white transition-colors font-bold uppercase tracking-wider"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Proceed to Explainable AI
                  </button>
                </>
              )}

              {/* ── STEP 4: XAI ── */}
              {activeStep === "xai" && (
                <>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-1">
                    <Brain className="w-3.5 h-3.5" />
                    Explainable AI Decision Transparency
                  </div>
                  <XAIPanel
                    recommended={recommendedSim}
                    allSims={activeItem.digitalTwinPredictions ?? []}
                    selectedAction={selectedAction ?? recommendedAction}
                  />
                  <button
                    onClick={() => setActiveStep("governance")}
                    className="flex items-center gap-2 text-[11px] text-tau-teal hover:text-white transition-colors font-bold uppercase tracking-wider"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Proceed to Human Authorization
                  </button>
                </>
              )}

              {/* ── STEP 5: Governance & Human Authorization ── */}
              {activeStep === "governance" && (
                <>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-400 font-bold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Human Authorization — {isObserver ? "Observer Mode (Read-Only)" : `Authority: ${authorityLevel}`}
                  </div>

                  {isObserver && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 px-4 py-3 text-[12px] text-amber-300 flex items-center gap-2">
                      <Eye className="w-4 h-4 shrink-0" />
                      You are in Observer mode. Switch to Flight Director or Mission Commander to authorize decisions.
                    </div>
                  )}

                  {/* Final summary */}
                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-4 space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Authorization Summary</div>
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-slate-500">Anomaly:</span>
                        <span className="text-white font-bold ml-2">{activeItem.event.title}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Severity:</span>
                        <span className={`ml-2 font-bold ${activeItem.event.severity === "Critical" ? "text-red-400" : activeItem.event.severity === "High" ? "text-amber-400" : "text-yellow-400"}`}>
                          {activeItem.event.severity}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">AI Recommends:</span>
                        <span className="text-amber-400 font-bold ml-2 font-mono">"{recommendedAction ?? "—"}"</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Your Selection:</span>
                        <span className="text-tau-teal font-bold ml-2 font-mono">"{selectedAction ?? recommendedAction ?? "—"}"</span>
                      </div>
                      {recommendedSim && (
                        <div>
                          <span className="text-slate-500">Success Probability:</span>
                          <span className={`ml-2 font-bold ${recommendedSim.successProbability >= 70 ? "text-cyber-green" : recommendedSim.successProbability >= 45 ? "text-amber-400" : "text-red-400"}`}>
                            {recommendedSim.successProbability.toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operator notes */}
                  {activeItem.status === "Pending" && !isObserver && (
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">
                        <FileText className="w-3 h-3" />
                        Operator Justification
                        <span className="text-slate-600 normal-case tracking-normal font-normal">(recommended)</span>
                      </div>
                      <textarea
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        placeholder="Document your rationale for the record..."
                        rows={2}
                        className="w-full bg-slate-900/80 border border-slate-700/60 rounded-lg px-3 py-2 text-[12px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-tau-teal/60 resize-none font-mono"
                      />
                    </div>
                  )}

                  {/* Decision review step list */}
                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5" />
                      Pre-Authorization Checklist
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Anomaly reviewed (Detection)", done: STEP_ORDER.indexOf(activeStep) >= 0 },
                        { label: "Agent analysis reviewed (Deliberation)", done: STEP_ORDER.indexOf(activeStep) >= 1 },
                        { label: "Simulation outcomes reviewed (Digital Twin)", done: STEP_ORDER.indexOf(activeStep) >= 2 },
                        { label: "AI reasoning reviewed (XAI)", done: STEP_ORDER.indexOf(activeStep) >= 3 },
                        { label: "Action selected and justification documented", done: !!(selectedAction || recommendedAction) && !!justification },
                      ].map(({ label, done }) => (
                        <div key={label} className="flex items-center gap-2 text-[11px]">
                          <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center ${done ? "border-cyber-green/50 bg-cyber-green/10" : "border-slate-700 bg-slate-900"}`}>
                            {done && <CheckCircle2 className="w-3 h-3 text-cyber-green" />}
                          </div>
                          <span className={done ? "text-slate-300" : "text-slate-500"}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action selection reminder */}
                  {activeItem.status === "Pending" && (
                    <div className="rounded-lg border border-slate-700/40 bg-slate-900/30 px-4 py-2.5 flex items-center gap-3 text-[11px]">
                      <Info className="w-4 h-4 text-slate-500 shrink-0" />
                      <div>
                        <span className="text-slate-500">Selected action: </span>
                        <span className="text-tau-teal font-bold font-mono">"{selectedAction ?? recommendedAction ?? "—"}"</span>
                        {!selectedAction && (
                          <span className="text-slate-500 ml-2">
                            (AI recommendation — <button onClick={() => setActiveStep("simulation")} className="text-tau-teal/70 hover:text-tau-teal underline">change in Simulation step</button>)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Authorization Buttons (fixed at bottom) ── */}
            {activeItem.status === "Pending" && activeStep === "governance" && !isObserver && (
              <div className="shrink-0 border-t border-slate-800/70 px-5 py-4 bg-slate-950/80 flex flex-wrap items-center gap-3">

                {/* AUTHORIZE & EXECUTE */}
                <button
                  id="hgacs-approve-btn"
                  onClick={() => requestDecision("approved")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-orbitron font-extrabold text-[11px] uppercase tracking-widest
                    bg-cyber-green/15 border border-cyber-green/50 text-cyber-green
                    hover:bg-cyber-green/25 hover:border-cyber-green/80 hover:shadow-lg hover:shadow-cyber-green/10
                    active:scale-95 transition-all duration-150 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Authorize & Execute
                </button>

                {/* EXECUTE ALTERNATIVE */}
                {selectedAction && selectedAction !== recommendedAction && (
                  <button
                    id="hgacs-alternative-btn"
                    onClick={() => requestDecision("alternative")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-orbitron font-extrabold text-[11px] uppercase tracking-widest
                      bg-tau-teal/10 border border-tau-teal/50 text-tau-teal
                      hover:bg-tau-teal/20 hover:border-tau-teal/80 hover:shadow-lg hover:shadow-tau-teal/10
                      active:scale-95 transition-all duration-150 cursor-pointer"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Execute Alternative
                  </button>
                )}

                {/* FORCE OVERRIDE (Mission Commander only) */}
                {authorityLevel === "Mission Commander" && (
                  <button
                    id="hgacs-override-btn"
                    onClick={() => requestDecision("override")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-orbitron font-extrabold text-[11px] uppercase tracking-widest
                      bg-purple-500/10 border border-purple-500/40 text-purple-300
                      hover:bg-purple-500/20 hover:border-purple-500/70 hover:shadow-lg hover:shadow-purple-500/10
                      active:scale-95 transition-all duration-150 cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    Commander Override
                  </button>
                )}

                {/* REJECT */}
                <button
                  id="hgacs-reject-btn"
                  onClick={() => requestDecision("rejected")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-orbitron font-extrabold text-[11px] uppercase tracking-widest
                    bg-red-950/30 border border-red-500/40 text-red-400
                    hover:bg-red-950/50 hover:border-red-500/70 hover:shadow-lg hover:shadow-red-500/10
                    active:scale-95 transition-all duration-150 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  Reject & Use Fallback
                </button>

                <div className="ml-auto text-[10px] text-slate-600 text-right leading-relaxed">
                  <div>Role: <span className="text-slate-400 font-bold">{authorityLevel}</span></div>
                  {timeLeft !== null && (
                    <div className={timeLeft <= 10 ? "text-red-400 animate-pulse font-bold" : ""}>
                      Simulation held: {timeLeft}s
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Governance footer (non-governance steps) ── */}
            {activeItem.status === "Pending" && activeStep !== "governance" && (
              <div className="shrink-0 border-t border-slate-800/50 px-5 py-2.5 bg-slate-950/60 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-red-400" />
                  <span>Authorization locked — complete workflow to step 5 to enable decision controls</span>
                </div>
                <button
                  onClick={() => setActiveStep("governance")}
                  className="text-tau-teal font-bold hover:text-white transition-colors"
                >
                  Skip to Authorization →
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="space-y-3">
              <ShieldCheck className="w-12 h-12 text-tau-teal/30 mx-auto" />
              <div className="text-slate-500 font-mono text-sm">All anomalies resolved</div>
              <div className="text-slate-600 text-[11px]">Awaiting next anomaly detection…</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Confirmation Dialog ── */}
      {confirmOpen && pendingDecision && (
        <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-black/60 p-6 w-full max-w-md mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                ${pendingDecision === "approved" || pendingDecision === "alternative" ? "bg-cyber-green/15 border border-cyber-green/30" :
                  pendingDecision === "override" ? "bg-purple-500/15 border border-purple-500/30" :
                  "bg-red-950/30 border border-red-500/30"}`}>
                {pendingDecision === "approved" || pendingDecision === "alternative"
                  ? <CheckCircle2 className="w-5 h-5 text-cyber-green" />
                  : pendingDecision === "override"
                    ? <Unlock className="w-5 h-5 text-purple-300" />
                    : <XCircle className="w-5 h-5 text-red-400" />}
              </div>
              <div>
                <div className="font-orbitron font-black text-white text-sm uppercase tracking-wider">
                  Confirm: {pendingDecision === "approved" ? "Authorize & Execute" :
                            pendingDecision === "alternative" ? "Execute Alternative" :
                            pendingDecision === "override" ? "Commander Override" :
                            "Reject & Use Fallback"}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">This action will be permanently recorded in the HGACS audit trail.</div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-3 space-y-1.5 text-[12px]">
              <div><span className="text-slate-500">Anomaly: </span><span className="text-white font-bold">{activeItem?.event.title}</span></div>
              <div><span className="text-slate-500">Action: </span><span className="text-tau-teal font-bold font-mono">"{selectedAction ?? recommendedAction ?? "—"}"</span></div>
              <div><span className="text-slate-500">Authorized by: </span><span className="text-slate-300 font-bold">{authorityLevel}</span></div>
              {justification && <div><span className="text-slate-500">Note: </span><span className="text-slate-300 italic">"{justification}"</span></div>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmDecision}
                className={`flex-1 py-2.5 rounded-lg font-orbitron font-extrabold text-[11px] uppercase tracking-widest
                  active:scale-95 transition-all duration-150 cursor-pointer
                  ${pendingDecision === "approved" || pendingDecision === "alternative"
                    ? "bg-cyber-green/15 border border-cyber-green/50 text-cyber-green hover:bg-cyber-green/25"
                    : pendingDecision === "override"
                      ? "bg-purple-500/15 border border-purple-500/50 text-purple-300 hover:bg-purple-500/25"
                      : "bg-red-950/30 border border-red-500/40 text-red-400 hover:bg-red-950/50"}`}
              >
                ✓ Confirm Decision
              </button>
              <button
                onClick={() => { setConfirmOpen(false); setPendingDecision(null); }}
                className="flex-1 py-2.5 rounded-lg font-orbitron font-extrabold text-[11px] uppercase tracking-widest
                  bg-slate-800 border border-slate-700 text-slate-400
                  hover:text-white hover:border-slate-600 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyCommandCenter;
