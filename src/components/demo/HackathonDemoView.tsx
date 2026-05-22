/**
 * Phase 10 – HackathonDemoView
 * Full-screen cinematic presentation mode for Project HAIL MARY.
 * Features customizable scripts, sound effects, custom canvas confetti,
 * speed controllers, and detailed final reporting.
 */
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, RotateCcw, Compass, Database, ShieldAlert, Telescope, Star, 
  Wifi, ShieldCheck, AlertTriangle, Zap, Wind, Droplet, 
  Terminal, Rocket, Flame, X, Trophy, Volume2, VolumeX 
} from "lucide-react";
import type { SpacecraftState } from "../../data/spacecraft";
import type { ActiveEvent } from "../../data/events";
import type { SimulationResult } from "../../digitalTwin/simulateAction";
import type { MissionScore, ScoringAlerts, DecisionQualityRecord, PerformanceSnapshot } from "../../scoring/types";
import type { AnomalyQueueItem, HumanOverrideRecord } from "../../types/missionControl";
import { AGENT_META } from "../../types/agents";

interface HackathonDemoViewProps {
  // Pass state from dashboard for Sandbox Telemetry Mode
  spacecraft: SpacecraftState;
  activeEvent: ActiveEvent | null;
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  systemStatus: string;
  successProbability: number;
  missionScore: MissionScore;
  decisionQualityLog: DecisionQualityRecord[];
  performanceHistory: PerformanceSnapshot[];
  scoringAlerts: ScoringAlerts;
  
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  
  onToggleView: () => void;

  // MARM – optional live-dashboard anomaly feed for judge panels
  anomalyQueue?: AnomalyQueueItem[];
  humanOverrideLog?: HumanOverrideRecord[];
  onOpenMARM?: () => void;
}

// ─── Sound Synthesizer (Web Audio API) ───────────────────────────────────────
const playBeep = (freq = 800, duration = 0.1, muted = false) => {
  if (muted) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignored
  }
};

// ─── Custom Canvas Particle Confetti ──────────────────────────────────────────
interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotSpeed: number;
}

const ConfettiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = ["#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#3b82f6"];
    const particles: ConfettiParticle[] = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: Math.random() * 4 - 2,
      speedY: Math.random() * 4 + 3,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 4 - 2,
    }));

    const update = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      animId = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" />;
};

// ─── Cinematic Mars Mission Script Data ──────────────────────────────────────
interface CinematicStep {
  progress: number;
  event: ActiveEvent | null;
  deliberation: { sender: string; content: string; type: string }[] | null;
  twin: SimulationResult[] | null;
  decision: { action: string; reasoning: string; confidence: number } | null;
  outcomeEffects: { fuel?: number; power?: number; oxygen?: number; health?: number; science?: number };
}

const CINEMATIC_SCRIPT: CinematicStep[] = [
  // 0. Initial cruise
  {
    progress: 5,
    event: null,
    deliberation: null,
    twin: null,
    decision: null,
    outcomeEffects: {},
  },
  // 1. Solar Storm
  {
    progress: 15,
    event: {
      id: "evt-solar",
      title: "Solar Storm Warning",
      description: "Severe solar particle event detected. High-energy radiation arriving in 30 seconds.",
      severity: "High",
      timestamp: "MET 00:01:12",
      appliedEffects: { power: 12, health: 5 },
    },
    deliberation: [
      { sender: "safety", content: "Incoming radiation levels are hazardous. Secondary systems must be shielded immediately.", type: "CHALLENGE" },
      { sender: "navigation", content: "Suggest orienting spacecraft shields toward the solar flare vector.", type: "SUGGESTION" },
      { sender: "resource", content: "Deploying shields will consume 15% core power. Heat sinks must handle thermal overflow.", type: "SUPPORT" },
      { sender: "science", content: "Recommend deploying secondary sensor arrays to measure flare electromagnetic spectrum.", type: "SUGGESTION" },
      { sender: "commander", content: "Acknowledged. Prioritizing shielding configuration. Rerouting emergency power to deflector grid.", type: "AGREEMENT" },
    ],
    twin: [
      { actionName: "Deploy Radiation Deflectors", benefits: "Protects crew and core systems.", risks: "High core power load (-15 units).", successProbability: 94, fuelDelta: 0, powerDelta: -15, oxygenDelta: 0, healthDelta: 0, progressDelta: 0, crewHealthDelta: 0, crewMoraleDelta: 0, resultingState: {} as any, resultingCrew: [] },
      { actionName: "Enter Safe Mode", benefits: "Saves energy. Minimal power consumption.", risks: "Hull sustains light radiation damage.", successProbability: 72, fuelDelta: 0, powerDelta: -5, oxygenDelta: 0, healthDelta: -10, progressDelta: -2, crewHealthDelta: -10, crewMoraleDelta: 0, resultingState: {} as any, resultingCrew: [] },
      { actionName: "Ignore Event", benefits: "Preserves flight itinerary.", risks: "Critical damage to navigation logic.", successProbability: 38, fuelDelta: 0, powerDelta: 0, oxygenDelta: -5, healthDelta: -25, progressDelta: 0, crewHealthDelta: -25, crewMoraleDelta: -10, resultingState: {} as any, resultingCrew: [] },
    ],
    decision: {
      action: "Deploy Radiation Deflectors",
      reasoning: "Deflectors provide optimal protection against radiation. Absorbs electromagnetic flux with acceptable power drop.",
      confidence: 94,
    },
    outcomeEffects: { power: -15, science: 10 },
  },
  // 2. Cruise
  {
    progress: 35,
    event: null,
    deliberation: null,
    twin: null,
    decision: null,
    outcomeEffects: {},
  },
  // 3. Oxygen Cabin Leak
  {
    progress: 50,
    event: {
      id: "evt-o2",
      title: "Oxygen Cabin Leak",
      description: "Atmospheric pressure drop in Cabin Sector 3. Life support systems failing.",
      severity: "Critical",
      timestamp: "MET 00:02:44",
      appliedEffects: { oxygen: 18 },
    },
    deliberation: [
      { sender: "resource", content: "Life support warning active. Oxygen reserve declining at 1.8% per second.", type: "ESCALATION" },
      { sender: "safety", content: "Must isolate Cabin Sector 3. Evacuate crew members to central storm shelter.", type: "CHALLENGE" },
      { sender: "science", content: "Closing sectors restricts access to botanical research pods. Is there an alternative seal?", type: "QUESTION" },
      { sender: "navigation", content: "No flight corrections needed. Focus entirely on structural pressure sealing.", type: "SUPPORT" },
      { sender: "commander", content: "Understood. Sector 3 seal initiated. Initiating backup O2 tank pressurization.", type: "AGREEMENT" },
    ],
    twin: [
      { actionName: "Seal Cabin Sector 3", benefits: "Stops atmospheric pressure collapse immediately.", risks: "Slight loss in science investigation access.", successProbability: 88, fuelDelta: 0, powerDelta: 0, oxygenDelta: -8, healthDelta: -4, progressDelta: 0, crewHealthDelta: -4, crewMoraleDelta: 0, resultingState: {} as any, resultingCrew: [] },
      { actionName: "Deploy Emergency O2 Tanks", benefits: "Maintains cabin pressure temporarily without sealing.", risks: "Consumes finite oxygen cylinders.", successProbability: 62, fuelDelta: 0, powerDelta: -8, oxygenDelta: -2, healthDelta: -12, progressDelta: 0, crewHealthDelta: -12, crewMoraleDelta: 0, resultingState: {} as any, resultingCrew: [] },
      { actionName: "Continue Operations", benefits: "No action penalty.", risks: "Critical hypoxia hazard for crew.", successProbability: 15, fuelDelta: 0, powerDelta: 0, oxygenDelta: -30, healthDelta: -40, progressDelta: 0, crewHealthDelta: -40, crewMoraleDelta: -20, resultingState: {} as any, resultingCrew: [] },
    ],
    decision: {
      action: "Seal Cabin Sector 3",
      reasoning: "Sealing is the only permanent solution to stabilize cabin air pressure and safeguard the crew.",
      confidence: 88,
    },
    outcomeEffects: { oxygen: -8, health: -4, science: 5 },
  },
  // 4. Unknown Object (Opportunity)
  {
    progress: 70,
    event: {
      id: "evt-object",
      title: "Unknown Object Detected",
      description: "Anomaly registered on long-range lidar. High scientific data yield opportunity.",
      severity: "Low",
      timestamp: "MET 00:03:52",
      appliedEffects: {},
      isOpportunity: true,
    },
    deliberation: [
      { sender: "science", content: "Strong electromagnetic signature! Request dispatching probe to scan surface composition.", type: "SUPPORT" },
      { sender: "navigation", content: "Orbital flight adjustment of 0.05 AU required to intercept trajectory.", type: "SUGGESTION" },
      { sender: "resource", content: "Probe launch will consume fuel reserves (-8% Fuel).", type: "QUESTION" },
      { sender: "safety", content: "Scanning at safe distance carries zero structural risk.", type: "SUPPORT" },
      { sender: "commander", content: "Launch probe. Science yields outweigh minor propellant expenditure.", type: "AGREEMENT" },
    ],
    twin: [
      { actionName: "Deploy Scanner Probe", benefits: "Gathers critical research data (+30 Science Value).", risks: "Consumes flight propellant.", successProbability: 95, fuelDelta: -8, powerDelta: 0, oxygenDelta: 0, healthDelta: 0, progressDelta: 0, crewHealthDelta: 0, crewMoraleDelta: 0, resultingState: {} as any, resultingCrew: [] },
      { actionName: "Perform Flyby Scan", benefits: "Zero propellant load.", risks: "Low resolution telemetry (+10 Science).", successProbability: 85, fuelDelta: 0, powerDelta: -4, oxygenDelta: 0, healthDelta: 0, progressDelta: 0, crewHealthDelta: 0, crewMoraleDelta: 0, resultingState: {} as any, resultingCrew: [] },
      { actionName: "Ignore Anomaly", benefits: "Preserves fuel reserves.", risks: "Lost scientific milestone.", successProbability: 90, fuelDelta: 0, powerDelta: 0, oxygenDelta: 0, healthDelta: 0, progressDelta: 0, crewHealthDelta: 0, crewMoraleDelta: 0, resultingState: {} as any, resultingCrew: [] },
    ],
    decision: {
      action: "Deploy Scanner Probe",
      reasoning: "High-resolution telemetry gathers irreplaceable planetary science, proving mission capacity.",
      confidence: 95,
    },
    outcomeEffects: { fuel: -8, science: 30 },
  },
  // 5. Engine Thruster Failure
  {
    progress: 85,
    event: {
      id: "evt-engine",
      title: "Thruster Core Failure",
      description: "Propulsion manifold leak in auxiliary thrusters. Cruise deceleration disrupted.",
      severity: "Critical",
      timestamp: "MET 00:04:30",
      appliedEffects: { velocity: -10 },
    },
    deliberation: [
      { sender: "navigation", content: "Braking burn vector is misaligned. Spacecraft will overshoot orbit insertion without correction.", type: "ESCALATION" },
      { sender: "safety", content: "Unstable exhaust valves are a rupture threat. Close emergency manifold valves.", type: "CHALLENGE" },
      { sender: "resource", content: "Closing manifolds requires rerouting reactor plasma. Power core will drop.", type: "QUESTION" },
      { sender: "science", content: "Sensors show high-pressure thermal spikes in propulsion lines.", type: "SUGGESTION" },
      { sender: "commander", content: "Engaging auxiliary coils. Manifold shutoff active. Adjusting braking vector.", type: "AGREEMENT" },
    ],
    twin: [
      { actionName: "Engage Auxiliary Coils", benefits: "Re-establishes trajectory insertion deceleration.", risks: "Consumes remaining power core stability.", successProbability: 90, fuelDelta: -6, powerDelta: -10, oxygenDelta: 0, healthDelta: 0, progressDelta: 0, crewHealthDelta: 0, crewMoraleDelta: 0, resultingState: {} as any, resultingCrew: [] },
      { actionName: "Reroute Plasma Flow", benefits: "Maintains thrust core velocity.", risks: "High danger of core exhaust explosion.", successProbability: 60, fuelDelta: -10, powerDelta: -25, oxygenDelta: 0, healthDelta: -15, progressDelta: 0, crewHealthDelta: -15, crewMoraleDelta: 0, resultingState: {} as any, resultingCrew: [] },
      { actionName: "Ignore Malfunction", benefits: "Zero load modifications.", risks: "Uncontrolled orbit bypass. Total mission abort.", successProbability: 25, fuelDelta: 0, powerDelta: 0, oxygenDelta: 0, healthDelta: 0, progressDelta: -10, crewHealthDelta: 0, crewMoraleDelta: 0, resultingState: {} as any, resultingCrew: [] },
    ],
    decision: {
      action: "Engage Auxiliary Coils",
      reasoning: "Safeguards orbital insertion. Rerouting power holds low explosion risk compared to bypass.",
      confidence: 90,
    },
    outcomeEffects: { fuel: -6, power: -10 },
  },
  // 6. Arrival
  {
    progress: 100,
    event: null,
    deliberation: null,
    twin: null,
    decision: null,
    outcomeEffects: {},
  },
];

const AGENT_ICONS: Record<string, React.ReactNode> = {
  navigation: <Compass className="h-3.5 w-3.5" />,
  resource:   <Database className="h-3.5 w-3.5" />,
  safety:     <ShieldAlert className="h-3.5 w-3.5" />,
  science:    <Telescope className="h-3.5 w-3.5" />,
  commander:  <Star className="h-3.5 w-3.5" />,
};

const AGENT_COLORS: Record<string, string> = {
  navigation: "bg-sky-500/20 border-sky-500/50 text-sky-400",
  resource:   "bg-amber-500/20 border-amber-500/50 text-amber-400",
  safety:     "bg-rose-500/20 border-rose-500/50 text-rose-400",
  science:    "bg-violet-500/20 border-violet-500/50 text-violet-400",
  commander:  "bg-tau-teal/20 border-tau-teal/60 text-tau-teal",
};

const HackathonDemoView: React.FC<HackathonDemoViewProps> = ({
  spacecraft: sandboxSpacecraft,
  activeEvent: sandboxActiveEvent,
  elapsedSeconds: sandboxElapsedSeconds,
  isRunning: _sandboxIsRunning,
  isPaused: sandboxIsPaused,
  systemStatus: _sandboxSystemStatus,
  successProbability: sandboxSuccessProbability,
  missionScore: sandboxMissionScore,
  decisionQualityLog: _sandboxDecisionQualityLog,
  performanceHistory: sandboxPerformanceHistory,
  scoringAlerts: _sandboxScoringAlerts,
  onStart: startSandbox,
  onPause: pauseSandbox,
  onReset: resetSandbox,
  onToggleView,
  // MARM optional props
  anomalyQueue = [],
  humanOverrideLog = [],
  onOpenMARM,
}) => {
  // Dummy reference to satisfy TS unused locals rule
  if (anomalyQueue.length < 0 || humanOverrideLog.length < 0 || onOpenMARM) { /* no-op */ }

  // ─── Demo Core States ──────────────────────────────────────────────────────
  const [demoStep, setDemoStep] = useState<"config" | "countdown" | "launch" | "running" | "success" | "failed">("config");
  const [demoMode, setDemoMode] = useState<"success" | "failure" | "sandbox">("success");
  
  // Simulation variables (Cinematic Mode)
  const [fuel, setFuel] = useState(100);
  const [power, setPower] = useState(100);
  const [oxygen, setOxygen] = useState(100);
  const [health, setHealth] = useState(100);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [successScore, setSuccessScore] = useState(95);
  const [scienceYield, setScienceYield] = useState(0);

  // Playback Controls
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 5>(1);
  const [muted, setMuted] = useState(false);

  // Script tracking indices
  const [countdownVal, setCountdownVal] = useState(10);
  const [scriptIndex, setScriptIndex] = useState(0);
  const [deliberationIdx, setDeliberationIdx] = useState(-1);
  const [activeEvent, setActiveEvent] = useState<ActiveEvent | null>(null);
  
  // Deliberation and decisions
  const [deliberationLogs, setDeliberationLogs] = useState<{ sender: string; content: string; type: string }[]>([]);
  const [twinPredictions, setTwinPredictions] = useState<SimulationResult[]>([]);
  const [comDecision, setComDecision] = useState<{ action: string; reasoning: string; confidence: number } | null>(null);
  
  // Logs console
  const [consoleLogs, setConsoleLogs] = useState<{ id: string; text: string; type: "info" | "success" | "warning" | "danger" }[]>([]);
  
  // Timing references
  const timerRef = useRef<number | null>(null);
  const stateRef = useRef({ progress, demoStep, isDemoRunning, speedMultiplier, scriptIndex, deliberationIdx, activeEvent });

  useEffect(() => {
    stateRef.current = { progress, demoStep, isDemoRunning, speedMultiplier, scriptIndex, deliberationIdx, activeEvent };
  }, [progress, demoStep, isDemoRunning, speedMultiplier, scriptIndex, deliberationIdx, activeEvent]);

  // Audio beep shorthand
  const beep = (freq?: number, dur?: number) => playBeep(freq, dur, muted);

  // ─── Confetti trigger ───
  const showConfetti = demoStep === "success";

  // Compute live composite score
  const liveScore = useMemo(() => {
    if (demoMode === "sandbox") return sandboxMissionScore.overall;
    const composite = Math.round(
      (health * 0.25) + 
      (successScore * 0.20) + 
      ((fuel + power + oxygen) / 3 * 0.25) + 
      (Math.min(100, scienceYield) * 0.15) + 
      (progress * 0.15)
    );
    return Math.max(0, Math.min(100, composite));
  }, [health, successScore, fuel, power, oxygen, scienceYield, progress, demoMode, sandboxMissionScore]);

  // ─── Audio and Ticker Initialization ───
  const addConsoleLog = (text: string, type: "info" | "success" | "warning" | "danger" = "info") => {
    setConsoleLogs((prev) => [
      ...prev,
      { id: `log-${Date.now()}-${Math.random()}`, text, type }
    ].slice(-30));
  };

  // Reset Cinematic states
  const initCinematic = () => {
    setFuel(100);
    setPower(100);
    setOxygen(100);
    setHealth(100);
    setProgress(0);
    setElapsed(0);
    setSuccessScore(95);
    setScienceYield(0);
    setScriptIndex(0);
    setDeliberationIdx(-1);
    setActiveEvent(null);
    setDeliberationLogs([]);
    setTwinPredictions([]);
    setComDecision(null);
    setConsoleLogs([]);
    setCountdownVal(10);
  };

  // ─── Launch Click ───
  const startDemo = () => {
    beep(520, 0.15);
    if (demoMode === "sandbox") {
      setDemoStep("running");
      startSandbox();
      setIsDemoRunning(true);
    } else {
      initCinematic();
      setDemoStep("countdown");
      setCountdownVal(10);
      setIsDemoRunning(true);
    }
  };

  // Countdown timer loop
  useEffect(() => {
    if (demoStep === "countdown" && isDemoRunning) {
      const intervalTime = 1000 / speedMultiplier;
      const t = setTimeout(() => {
        if (countdownVal > 0) {
          beep(800, 0.08);
          setCountdownVal(prev => prev - 1);
        } else {
          beep(1200, 0.4);
          setDemoStep("launch");
        }
      }, intervalTime);
      return () => clearTimeout(t);
    }
  }, [demoStep, countdownVal, isDemoRunning, speedMultiplier]);

  // Launch overlay screen time
  useEffect(() => {
    if (demoStep === "launch") {
      addConsoleLog("LAUNCH MANIFOLDS INITIATED.", "success");
      addConsoleLog("AUTONOMOUS CONTROL SYSTEM: ONLINE.", "info");
      addConsoleLog("DIGITAL TWIN ENGINE SANDBOX: ACTIVE.", "info");
      
      const t = setTimeout(() => {
        setDemoStep("running");
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [demoStep]);

  // ─── Playback Tick Engine (Main Script / Sandbox Bridge) ────────────────────
  useEffect(() => {
    if (demoStep === "running" && isDemoRunning) {
      const intervalTime = 1000 / speedMultiplier;
      
      timerRef.current = window.setInterval(() => {
        // Mode A: Sandbox telemetry bridge
        if (demoMode === "sandbox") {
          // If simulation fails
          if (sandboxSuccessProbability === 0 || sandboxSpacecraft.health <= 0) {
            setIsDemoRunning(false);
            setDemoStep("failed");
            beep(250, 0.6);
            return;
          }
          // If simulation reaches Mars (100% progress)
          if (sandboxSpacecraft.missionProgress >= 100) {
            setIsDemoRunning(false);
            setDemoStep("success");
            beep(880, 0.5);
            return;
          }
          return; // Telemetry handles rendering automatically
        }

        // Mode B & C: Cinematic Script Loops
        const currentScript = CINEMATIC_SCRIPT[stateRef.current.scriptIndex];
        
        // 1. If currently showing a deliberation session
        if (stateRef.current.deliberationIdx >= 0) {
          const collab = currentScript.deliberation;
          if (collab && stateRef.current.deliberationIdx < collab.length) {
            // Stream in next agent message
            const msg = collab[stateRef.current.deliberationIdx];
            setDeliberationLogs(prev => [...prev, msg]);
            beep(750, 0.05);
            setDeliberationIdx(prev => prev + 1);
          } else {
            // Deliberation complete. Show Digital Twin recommendations
            setTwinPredictions(currentScript.twin || []);
            setComDecision(currentScript.decision);
            beep(680, 0.15);
            setDeliberationIdx(-2); // Lock deliberation state
            
            addConsoleLog(`Commander deliberating outcome paths...`, "info");
          }
          return;
        }

        // 2. If Twin recommendations are showing, commander makes approval decision on the next tick
        if (stateRef.current.deliberationIdx === -2) {
          // Commander approves recommended action
          beep(900, 0.2);
          
          const decision = currentScript.decision;
          const effects = currentScript.outcomeEffects;

          addConsoleLog(`Commander committed decision: "${decision?.action}"`, "success");
          
          // Apply outcome effects to spacecraft state
          if (effects.fuel) setFuel(f => Math.max(0, f + effects.fuel!));
          if (effects.power) setPower(p => Math.max(0, p + effects.power!));
          if (effects.oxygen) setOxygen(o => Math.max(0, o + effects.oxygen!));
          if (effects.health) setHealth(h => Math.max(0, h + effects.health!));
          if (effects.science) setScienceYield(s => s + effects.science!);
          
          // Deduct from event damage effects
          const eventEffects = currentScript.event?.appliedEffects;
          if (eventEffects) {
            if (eventEffects.fuel) setFuel(f => Math.max(0, f - eventEffects.fuel!));
            if (eventEffects.power) setPower(p => Math.max(0, p - eventEffects.power!));
            if (eventEffects.oxygen) setOxygen(o => Math.max(0, o - eventEffects.oxygen!));
            if (eventEffects.health) setHealth(h => Math.max(0, h - eventEffects.health!));
          }

          // In cinematic failure mode, we trigger crash parameters
          if (demoMode === "failure" && stateRef.current.scriptIndex === 1) {
            // Fail the mission
            setHealth(0);
            setPower(0);
            setSuccessScore(0);
            setIsDemoRunning(false);
            setDemoStep("failed");
            beep(250, 0.6);
            return;
          }

          // Advance state ref parameters
          setDeliberationIdx(-1);
          setScriptIndex(prev => prev + 1);
          setActiveEvent(null);
          setTwinPredictions([]);
          setComDecision(null);
          setDeliberationLogs([]);
          return;
        }

        // 3. Cruise state
        setElapsed(prev => prev + 1);
        
        // Progress spacing
        const targetProgress = currentScript.progress;
        if (progress < targetProgress) {
          setProgress(p => Math.min(targetProgress, p + Math.max(1, Math.round((targetProgress - p) / 2))));
        } else {
          // Reached target progress, examine next script index
          const nextIndex = stateRef.current.scriptIndex + 1;
          if (nextIndex >= CINEMATIC_SCRIPT.length) {
            // Script finished successfully
            setIsDemoRunning(false);
            setDemoStep("success");
            beep(880, 0.5);
            return;
          }

          const nextScript = CINEMATIC_SCRIPT[nextIndex];
          setScriptIndex(nextIndex);

          // If next step is an event
          if (nextScript.event) {
            beep(440, 0.3);
            setActiveEvent(nextScript.event);
            addConsoleLog(`CRITICAL ANOMALY: ${nextScript.event.title}`, "danger");
            
            // Adjust success probability down temporarily for drama
            setSuccessScore(s => Math.max(25, s - (Math.floor(Math.random() * 8) + 12)));
            setDeliberationIdx(0); // Trigger deliberation sequence
          } else {
            // Normal cruise step
            setProgress(nextScript.progress);
          }
        }
      }, intervalTime);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [demoStep, isDemoRunning, speedMultiplier, progress, demoMode]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formattedMET = (s: number) => {
    const hrs = Math.floor(s / 3600).toString().padStart(2, "0");
    const mins = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `MET ${hrs}:${mins}:${secs}`;
  };

  // Active status color classes
  const ssClass = (val: number) => {
    if (val >= 70) return "text-emerald-400";
    if (val >= 40) return "text-amber-400 animate-pulse";
    return "text-rose-500 animate-pulse";
  };

  return (
    <div className="w-full flex flex-col gap-6 relative min-h-screen text-slate-100 select-none pb-12 overflow-hidden bg-space-black">
      {/* Visual background grid */}
      <div className="absolute inset-0 pointer-events-none mc-dot-grid opacity-60" />
      
      {/* ─── CONFETTI CANVAS ─── */}
      {showConfetti && <ConfettiCanvas />}

      <AnimatePresence mode="wait">
        {/* ─── 1. CONFIGURATION / START SCREEN ─── */}
        {demoStep === "config" && (
          <motion.div
            key="config"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 max-w-2xl mx-auto w-full flex flex-col gap-6 items-center justify-center py-20 px-6 relative z-10"
          >
            <div className="glass-panel w-full rounded-2xl border border-tau-teal/30 p-8 flex flex-col gap-6 relative overflow-hidden shadow-2xl">
              {/* Sci Fi Corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-tau-teal/50" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-tau-teal/50" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-tau-teal/50" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-tau-teal/50" />

              <div className="text-center flex flex-col items-center gap-2">
                <Rocket className="h-12 w-12 text-tau-teal animate-bounce" />
                <h1 className="font-orbitron text-2xl font-black text-white tracking-[0.2em] uppercase glow-text-teal">
                  Project HAIL MARY
                </h1>
                <p className="text-[10px] font-mono text-tau-teal/70 uppercase tracking-widest">
                  Autonomous Space Mission Hackathon Presentation
                </p>
              </div>

              <div className="border-t border-b border-tau-teal/10 py-4 space-y-3 font-mono text-xs text-slate-300">
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500 uppercase">Mission Destination:</span>
                  <span className="text-white font-bold">Mars (Orbit Insertion)</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500 uppercase">Objective:</span>
                  <span className="text-tau-teal font-semibold text-right max-w-xs">
                    Maximize scientific yield while ensuring 100% spacecraft survival.
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Autonomous Systems:</span>
                  <span className="text-emerald-400 font-bold">Multi-Agent Deliberation &amp; Digital Twin Online</span>
                </div>
              </div>

              {/* Mode Selectors */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-wider">
                  Select Presentation Scenario:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => { beep(580, 0.08); setDemoMode("success"); }}
                    className={`p-3.5 rounded-xl border font-mono text-[11px] text-left transition-all ${
                      demoMode === "success"
                        ? "border-tau-teal bg-tau-teal/10 shadow-lg shadow-tau-teal/10"
                        : "border-slate-800 bg-slate-950/40 hover:border-slate-700 font-medium cursor-pointer"
                    }`}
                  >
                    <div className="font-orbitron font-bold text-[10px] text-white flex items-center gap-1.5 mb-1.5">
                      <Star className="h-3 w-3 text-tau-teal fill-tau-teal" /> CINEMATIC SUCCESS
                    </div>
                    Runs a narrative Mars route with 4 scripted events &amp; landing celebration.
                  </button>
                  <button
                    onClick={() => { beep(580, 0.08); setDemoMode("failure"); }}
                    className={`p-3.5 rounded-xl border font-mono text-[11px] text-left transition-all ${
                      demoMode === "failure"
                        ? "border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-950/25"
                        : "border-slate-800 bg-slate-950/40 hover:border-slate-700 font-medium cursor-pointer"
                    }`}
                  >
                    <div className="font-orbitron font-bold text-[10px] text-rose-400 flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="h-3 w-3" /> CINEMATIC FAILURE
                    </div>
                    Demonstrates mission abort sequence on a critical system malfunction.
                  </button>
                  <button
                    onClick={() => { beep(580, 0.08); setDemoMode("sandbox"); }}
                    className={`p-3.5 rounded-xl border font-mono text-[11px] text-left transition-all ${
                      demoMode === "sandbox"
                        ? "border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-950/20"
                        : "border-slate-800 bg-slate-950/40 hover:border-slate-700 font-medium cursor-pointer"
                    }`}
                  >
                    <div className="font-orbitron font-bold text-[10px] text-amber-400 flex items-center gap-1.5 mb-1.5">
                      <Wifi className="h-3 w-3" /> SANDBOX BRIDGE
                    </div>
                    Visualizes the active live dashboard simulation telemetry in real-time.
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={onToggleView}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 font-mono text-[11px] hover:bg-slate-900 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Exit Demo Mode
                </button>
                <button
                  onClick={startDemo}
                  className="px-6 py-2.5 rounded-xl bg-tau-teal text-space-black font-orbitron font-extrabold text-[11px] uppercase tracking-wider shadow-lg shadow-tau-teal/20 hover:bg-tau-teal/90 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-space-black text-space-black" /> Start Presentation
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── 2. COUNTDOWN SCREEN ─── */}
        {demoStep === "countdown" && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-24 relative z-10 text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
              className="text-slate-500 font-orbitron text-xs font-semibold tracking-widest uppercase mb-4"
            >
              LAUNCH SEQUENCE INITIATED
            </motion.div>
            <motion.div
              key={countdownVal}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="font-orbitron text-9xl font-black text-white tabular-nums glow-text-teal"
            >
              T-{countdownVal}
            </motion.div>
            <div className="mt-8 font-mono text-[11px] text-tau-teal/40 uppercase tracking-widest">
              PROJECT HAIL MARY // BOUND FOR MARS // AUTOPILOT ENGAGED
            </div>
          </motion.div>
        )}

        {/* ─── 3. LAUNCH SCREEN ─── */}
        {demoStep === "launch" && (
          <motion.div
            key="launch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-24 relative z-10 text-center overflow-hidden"
          >
            <motion.div
              animate={{ 
                x: [0, -4, 4, -2, 2, 0], 
                y: [0, 2, -2, 1, -1, 0] 
              }}
              transition={{ repeat: Infinity, duration: 0.15 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-tau-teal/10 border-4 border-tau-teal shadow-2xl">
                <Rocket className="h-14 w-14 text-tau-teal rotate-45" />
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 0.2 }}
                  className="absolute -bottom-4 flex justify-center text-amber-500"
                >
                  <Flame className="h-8 w-8 fill-amber-500 text-amber-500 animate-pulse rotate-180" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <h1 className="font-orbitron text-3xl font-black text-white tracking-[0.25em] uppercase glow-text-teal">
                  IGNITION &amp; LIFTOFF
                </h1>
                <p className="font-mono text-xs text-slate-400">
                  THRUSTER DISCHARGE SYSTEM ACTIVE at 100% YIELD
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ─── 4. MAIN TELEMETRY PRESENTATION ACTIVE ─── */}
        {demoStep === "running" && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 flex flex-col gap-6 relative z-10"
          >
            {/* Header Control Panel */}
            <div className="glass-panel rounded-xl border border-tau-teal/20 px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950/40">
              <div className="flex items-center gap-3">
                <Rocket className="h-5 w-5 text-tau-teal shrink-0" />
                <div>
                  <h2 className="font-orbitron text-xs font-bold tracking-widest text-white">
                    MISSION COMMAND CONTROL ROOM
                  </h2>
                  <p className="text-[9px] font-mono text-slate-500 uppercase">
                    Mode: {demoMode === "sandbox" ? "SANDBOX BRIDGE" : `CINEMATIC Mars — ${demoMode.toUpperCase()}`}
                  </p>
                </div>
              </div>

              {/* Status and Clock */}
              <div className="flex items-center gap-4">
                <div className="text-center font-mono">
                  <div className="text-[7px] text-slate-500 uppercase tracking-widest">Time Elapsed</div>
                  <div className="text-[12px] font-bold text-white tabular-nums">
                    {formattedMET(demoMode === "sandbox" ? sandboxElapsedSeconds : elapsed)}
                  </div>
                </div>
                <div className="w-px h-6 bg-slate-800" />
                <div className="text-center font-mono">
                  <div className="text-[7px] text-slate-500 uppercase tracking-widest">Coordinates</div>
                  <div className="text-[12px] font-bold text-tau-teal truncate max-w-[120px]">
                    {demoMode === "sandbox" ? sandboxSpacecraft.position.split(" ")[0] : progress < 100 ? "Approaching Mars" : "Mars Orbit Insertion"}
                  </div>
                </div>
              </div>

              {/* Speed and controls */}
              <div className="flex items-center gap-3">
                {/* Audio controls */}
                <button
                  onClick={() => setMuted(!muted)}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {muted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-tau-teal" />}
                </button>
                <div className="w-px h-6 bg-slate-800" />

                {/* Speed Multiplier */}
                {demoMode !== "sandbox" && (
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shrink-0">
                    {([1, 2, 5] as const).map(speed => (
                      <button
                        key={speed}
                        onClick={() => { beep(640, 0.05); setSpeedMultiplier(speed); }}
                        className={`px-2 py-1 text-[9px] font-mono font-bold transition-colors cursor-pointer ${
                          speedMultiplier === speed
                            ? "bg-tau-teal text-space-black"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}

                {/* Play/Pause */}
                {demoMode === "sandbox" ? (
                  <button
                    onClick={() => {
                      beep(600, 0.1);
                      if (sandboxIsPaused) startSandbox();
                      else pauseSandbox();
                    }}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[9px] font-bold border flex items-center gap-1.5 uppercase cursor-pointer ${
                      sandboxIsPaused
                        ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                        : "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                    }`}
                  >
                    {sandboxIsPaused ? <Play className="h-3 w-3 fill-emerald-400 text-emerald-400" /> : <Pause className="h-3 w-3 fill-amber-400 text-amber-400" />}
                    {sandboxIsPaused ? "Resume" : "Pause"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      beep(600, 0.1);
                      setIsDemoRunning(!isDemoRunning);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[9px] font-bold border flex items-center gap-1.5 uppercase cursor-pointer ${
                      !isDemoRunning
                        ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                        : "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                    }`}
                  >
                    {!isDemoRunning ? <Play className="h-3 w-3 fill-emerald-400 text-emerald-400" /> : <Pause className="h-3 w-3 fill-amber-400 text-amber-400" />}
                    {!isDemoRunning ? "Resume" : "Pause"}
                  </button>
                )}

                {/* Restart */}
                <button
                  onClick={() => {
                    beep(600, 0.1);
                    if (demoMode === "sandbox") {
                      resetSandbox();
                    } else {
                      initCinematic();
                      setDemoStep("config");
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-mono text-[9px] font-bold flex items-center gap-1.5 uppercase cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" /> Restart
                </button>

                {/* Exit */}
                <button
                  onClick={() => {
                    beep(600, 0.1);
                    onToggleView();
                  }}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg font-mono text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <X className="h-3 w-3" /> Exit
                </button>
              </div>
            </div>

            {/* Dashboard grid structure */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Column 1: Spacecraft Telemetry HUD (4/12 width) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="glass-panel p-5 rounded-xl border border-tau-teal/15 flex flex-col gap-4 relative overflow-hidden bg-slate-950/20">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-tau-teal/40" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-tau-teal/40" />
                  
                  <h3 className="text-[10px] font-orbitron font-bold text-white tracking-widest uppercase flex items-center justify-between border-b border-slate-800 pb-2 mb-1">
                    <span>Spacecraft Telemetry</span>
                    <span className="text-[8px] font-mono text-slate-600">HM-OS v10.0</span>
                  </h3>

                  {/* Telemetry Row Items */}
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    {/* Fuel */}
                    <div className="border border-slate-800/80 bg-slate-950/40 rounded-lg p-2.5">
                      <div className="text-[7px] text-slate-500 uppercase flex items-center gap-1">
                        <Droplet className="h-2.5 w-2.5 text-tau-teal" /> Fuel Reserve
                      </div>
                      <div className={`text-base font-bold font-orbitron mt-1 ${ssClass(demoMode === "sandbox" ? sandboxSpacecraft.fuel : fuel)}`}>
                        {(demoMode === "sandbox" ? sandboxSpacecraft.fuel : fuel).toFixed(1)}%
                      </div>
                    </div>
                    {/* Power */}
                    <div className="border border-slate-800/80 bg-slate-950/40 rounded-lg p-2.5">
                      <div className="text-[7px] text-slate-500 uppercase flex items-center gap-1">
                        <Zap className="h-2.5 w-2.5 text-sky-400" /> Core Power
                      </div>
                      <div className={`text-base font-bold font-orbitron mt-1 ${ssClass(demoMode === "sandbox" ? sandboxSpacecraft.power : power)}`}>
                        {(demoMode === "sandbox" ? sandboxSpacecraft.power : power).toFixed(1)}%
                      </div>
                    </div>
                    {/* Oxygen */}
                    <div className="border border-slate-800/80 bg-slate-950/40 rounded-lg p-2.5">
                      <div className="text-[7px] text-slate-500 uppercase flex items-center gap-1">
                        <Wind className="h-2.5 w-2.5 text-emerald-400" /> Cabin Oxygen
                      </div>
                      <div className={`text-base font-bold font-orbitron mt-1 ${ssClass(demoMode === "sandbox" ? sandboxSpacecraft.oxygen : oxygen)}`}>
                        {(demoMode === "sandbox" ? sandboxSpacecraft.oxygen : oxygen).toFixed(1)}%
                      </div>
                    </div>
                    {/* Hull Integrity */}
                    <div className="border border-slate-800/80 bg-slate-950/40 rounded-lg p-2.5">
                      <div className="text-[7px] text-slate-500 uppercase flex items-center gap-1">
                        <ShieldCheck className="h-2.5 w-2.5 text-violet-400" /> Hull Integrity
                      </div>
                      <div className={`text-base font-bold font-orbitron mt-1 ${ssClass(demoMode === "sandbox" ? sandboxSpacecraft.health : health)}`}>
                        {(demoMode === "sandbox" ? sandboxSpacecraft.health : health).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1 font-mono text-[9px] border-t border-slate-800/80 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Mars Trajectory Progress</span>
                      <span className="text-tau-teal">{(demoMode === "sandbox" ? sandboxSpacecraft.missionProgress : progress).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-tau-teal/40 to-tau-teal"
                        animate={{ width: `${demoMode === "sandbox" ? sandboxSpacecraft.missionProgress : progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Score panel */}
                <div className="glass-panel p-5 rounded-xl border border-tau-teal/15 flex flex-col gap-4 relative overflow-hidden bg-slate-950/20">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-tau-teal/40" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-tau-teal/40" />
                  
                  <h3 className="text-[10px] font-orbitron font-bold text-white tracking-widest uppercase flex items-center justify-between border-b border-slate-800 pb-2 mb-1">
                    <span>Performance Analytics</span>
                    <span className="text-[8px] font-mono text-emerald-400 animate-pulse">LIVE SCORE</span>
                  </h3>

                  {/* Composite Score Display */}
                  <div className="flex items-center gap-4 bg-tau-teal/5 border border-tau-teal/10 rounded-xl p-3">
                    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="28" cy="28" r="24" className="stroke-slate-800" strokeWidth="3.5" fill="transparent" />
                        <motion.circle cx="28" cy="28" r="24" className="stroke-tau-teal" strokeWidth="3.5" fill="transparent"
                          strokeDasharray={2 * Math.PI * 24}
                          animate={{ strokeDasharray: `${(liveScore / 100) * 2 * Math.PI * 24} ${2 * Math.PI * 24}` }}
                          style={{ filter: "drop-shadow(0 0 3px rgba(6,182,212,0.4))" }}
                        />
                      </svg>
                      <span className="absolute font-orbitron text-sm font-black text-white">{liveScore}</span>
                    </div>
                    <div>
                      <div className="text-[9px] font-orbitron font-extrabold text-tau-teal uppercase">Mission Score</div>
                      <div className="text-[8px] font-mono text-slate-500 mt-0.5">Weighted composite rating. Grade: {liveScore >= 85 ? "S" : liveScore >= 70 ? "A" : liveScore >= 50 ? "B" : "C"}</div>
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-400">
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
                      <span className="text-slate-500 uppercase">Integrity:</span>
                      <span className="float-right text-white font-bold">{(demoMode === "sandbox" ? sandboxSuccessProbability : successScore)}%</span>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
                      <span className="text-slate-500 uppercase">Science Yield:</span>
                      <span className="float-right text-white font-bold">{(demoMode === "sandbox" ? sandboxMissionScore.metrics.scienceValue : scienceYield).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Agent Deliberation Chat Window (4/12 width) */}
              <div className="lg:col-span-4 min-h-[450px]">
                <div className="glass-panel rounded-xl border border-tau-teal/20 overflow-hidden flex flex-col h-full bg-slate-950/20">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0 bg-slate-950/40">
                    <h3 className="text-[10px] font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5 text-tau-teal animate-pulse" />
                      Autonomous Debate Room
                    </h3>
                    <span className="text-[8px] font-mono text-slate-500">
                      {deliberationLogs.length > 0 ? `${deliberationLogs.length} MESSAGES` : "STANDBY"}
                    </span>
                  </div>

                  {/* Agent seats indicator strip */}
                  <div className="flex items-center justify-around px-4 py-2 border-b border-slate-800 shrink-0 bg-slate-900/30">
                    {["navigation", "resource", "safety", "science", "commander"].map(agentId => {
                      const active = deliberationLogs.some(l => l.sender === agentId);
                      return (
                        <div key={agentId} className="flex flex-col items-center gap-0.5">
                          <div className={`w-7 h-7 rounded-full border flex items-center justify-center ${AGENT_COLORS[agentId]} ${active ? "opacity-100" : "opacity-30"}`}>
                            {AGENT_ICONS[agentId]}
                          </div>
                          <span className="text-[6px] font-mono text-slate-500 uppercase">{agentId.substring(0, 4)}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Messages box */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0 bg-slate-950/30">
                    <AnimatePresence>
                      {activeEvent === null && (demoMode !== "sandbox" || sandboxActiveEvent === null) ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8 text-center">
                          <ShieldCheck className="h-8 w-8 text-emerald-500/60 animate-pulse" />
                          <p className="text-[10px] font-mono text-slate-500">ALL SYSTEMS NOMINAL</p>
                          <p className="text-[8px] font-mono text-slate-600">Awaiting spacecraft event alerts.</p>
                        </div>
                      ) : demoMode === "sandbox" ? (
                        // If sandbox mode is active, render active conversation log
                        <div className="text-[10px] font-mono text-slate-400 space-y-1">
                          <div className="text-[9px] text-amber-400 uppercase font-orbitron font-bold">Active Event Investigation:</div>
                          <div className="text-white border border-slate-800/80 p-2 rounded-lg bg-slate-900/40">{sandboxActiveEvent?.description}</div>
                        </div>
                      ) : (
                        // If cinematic, stream script deliberations
                        deliberationLogs.map((msg, i) => {
                          const isCommander = msg.sender === "commander";
                          const color = AGENT_COLORS[msg.sender];
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className={`flex gap-2.5 items-start ${isCommander ? "flex-row-reverse" : ""}`}
                            >
                              <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${color}`}>
                                {AGENT_ICONS[msg.sender]}
                              </div>
                              <div className={`flex flex-col gap-1 max-w-[80%] ${isCommander ? "items-end" : "items-start"}`}>
                                <span className="text-[7px] font-mono text-slate-500 uppercase">{AGENT_META[msg.sender as keyof typeof AGENT_META]?.name || msg.sender}</span>
                                <div className={`px-2.5 py-1.5 rounded-xl border text-[9px] font-mono leading-relaxed ${
                                  isCommander ? "bg-tau-teal/15 border-tau-teal/30 text-tau-teal" : "bg-slate-900 border-slate-800 text-slate-300"
                                }`}>
                                  {msg.content}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </AnimatePresence>

                    {/* Typing dots */}
                    {deliberationIdx >= 0 && deliberationIdx < (CINEMATIC_SCRIPT[scriptIndex]?.deliberation?.length ?? 0) && (
                      <div className="flex gap-2 items-center">
                        <div className="w-6 h-6 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center">
                          <Star className="h-3.5 w-3.5 text-slate-500" />
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 flex gap-1">
                          {[0, 1, 2].map((n) => (
                            <motion.div
                              key={n}
                              className="w-1 h-1 bg-tau-teal/70 rounded-full"
                              animate={{ y: [0, -3, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: n * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 3: Digital Twin Projections & Decision (4/12 width) */}
              <div className="lg:col-span-4 min-h-[450px] flex flex-col gap-6">
                
                {/* Event alert display */}
                <AnimatePresence mode="wait">
                  {(activeEvent || (demoMode === "sandbox" && sandboxActiveEvent)) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="glass-panel p-4 rounded-xl border border-rose-500/35 bg-rose-500/5 text-rose-300 relative overflow-hidden flex flex-col gap-2"
                    >
                      <div className="absolute top-0 right-0 p-1.5">
                        <AlertTriangle className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                      </div>
                      <span className="text-[8px] font-orbitron font-extrabold text-rose-500 tracking-wider">ACTIVE SYSTEM EVENT ALERT</span>
                      <h4 className="font-orbitron font-bold text-xs text-white">
                        {demoMode === "sandbox" ? sandboxActiveEvent?.title : activeEvent?.title}
                      </h4>
                      <p className="text-[9px] font-mono text-slate-300 leading-normal">
                        {demoMode === "sandbox" ? sandboxActiveEvent?.description : activeEvent?.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Digital Twin Sandbox */}
                <div className="glass-panel rounded-xl border border-tau-teal/20 overflow-hidden flex-1 flex flex-col bg-slate-950/20">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0 bg-slate-950/40">
                    <h3 className="text-[10px] font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
                      <Database className="h-3.5 w-3.5 text-tau-teal" />
                      Digital Twin Sandbox
                    </h3>
                    <span className="text-[8px] font-mono text-slate-500">
                      {twinPredictions.length > 0 ? "RESOLVED" : "STANDBY"}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
                    {twinPredictions.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-center">
                        <Database className="h-8 w-8 text-slate-700 animate-pulse" />
                        <p className="text-[10px] font-mono text-slate-500">SANDBOX IDLE</p>
                      </div>
                    ) : (
                      twinPredictions.map((pred) => {
                        const isRecommended = comDecision?.action === pred.actionName;
                        return (
                          <div
                            key={pred.actionName}
                            className={`p-3 rounded-lg border transition-all ${
                              isRecommended 
                                ? "border-tau-teal/50 bg-tau-teal/5 shadow-md shadow-tau-teal/5"
                                : "border-slate-800 bg-slate-900/30"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-orbitron font-bold text-white">{pred.actionName}</span>
                              <span className={`text-[10px] font-mono font-bold ${pred.successProbability >= 70 ? "text-emerald-400" : "text-rose-400"}`}>
                                {pred.successProbability}% Success
                              </span>
                            </div>
                            <p className="text-[8px] font-mono text-slate-400 mt-1 leading-normal">
                              {pred.benefits}
                            </p>
                            {isRecommended && (
                              <div className="mt-2 flex justify-end">
                                <span className="text-[7px] font-orbitron font-black bg-tau-teal text-space-black px-1.5 py-0.5 rounded">
                                  ★ RECOMMENDED
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Commander Decision Summary */}
                  {comDecision && (
                    <div className="border-t border-slate-800 p-3 bg-slate-900/40 shrink-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[7px] font-mono text-slate-500 uppercase">Decision Selection</span>
                        <span className="text-[9px] font-mono font-black text-emerald-400">APPROVED</span>
                      </div>
                      <h4 className="font-orbitron font-extrabold text-[11px] text-tau-teal">{comDecision.action}</h4>
                      <p className="text-[9px] font-mono text-slate-300 mt-1 leading-tight">{comDecision.reasoning}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom console window logs */}
            <div className="glass-panel p-4 rounded-xl border border-tau-teal/15 flex flex-col h-[180px] relative overflow-hidden bg-slate-950/20 shrink-0">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tau-teal/40" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tau-teal/40" />
              
              <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-2">
                <span className="text-[9px] font-orbitron font-bold tracking-widest text-white uppercase flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-tau-teal" />
                  Telemetry Log Ticker
                </span>
                <span className="text-[8px] font-mono text-slate-600">HM_OS TERMINAL FEED</span>
              </div>

              <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-1 select-text">
                {consoleLogs.length === 0 ? (
                  <div className="text-slate-600 italic">No telemetry console logs yet. Launch sequences active.</div>
                ) : (
                  consoleLogs.map((log) => {
                    const typeColor = log.type === "success" ? "text-emerald-400"
                      : log.type === "warning" ? "text-amber-400"
                      : log.type === "danger" ? "text-rose-400 animate-pulse font-bold"
                      : "text-tau-teal/70";
                    return (
                      <div key={log.id} className="flex gap-2 pb-0.5 border-b border-slate-900/30">
                        <span className="text-slate-600">[{formattedMET(elapsed)}]</span>
                        <span className={typeColor}>{log.text}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── 5. CELEBRATION SCREEN (SUCCESS) ─── */}
        {demoStep === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 max-w-2xl mx-auto w-full flex flex-col gap-6 items-center justify-center py-20 px-6 relative z-10"
          >
            <div className="glass-panel w-full rounded-2xl border border-emerald-500/35 p-8 flex flex-col gap-6 relative overflow-hidden bg-slate-950/80 shadow-2xl text-center">
              {/* Sci Fi Corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500/50" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500/50" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500/50" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500/50" />

              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Trophy className="h-8 w-8 text-emerald-400 animate-bounce" />
                </div>
                <h1 className="font-orbitron text-3xl font-black text-emerald-400 tracking-[0.25em] uppercase glow-text-green">
                  MISSION ACCOMPLISHED
                </h1>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  Autonomous Mars Orbit stabilized successfully
                </p>
              </div>

              {/* Stats Card */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-800 py-5 text-left font-mono text-xs">
                <div className="space-y-1">
                  <div className="text-slate-500 text-[9px] uppercase">Fuel Remaining</div>
                  <div className="text-white font-bold text-sm">{(demoMode === "sandbox" ? sandboxSpacecraft.fuel : fuel).toFixed(1)}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-500 text-[9px] uppercase">Science Yield</div>
                  <div className="text-white font-bold text-sm">{(demoMode === "sandbox" ? sandboxMissionScore.metrics.scienceValue : scienceYield).toFixed(0)} Points</div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-500 text-[9px] uppercase">Events Survived</div>
                  <div className="text-white font-bold text-sm">{(demoMode === "sandbox" ? sandboxPerformanceHistory.length : 4)} Hazards</div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-500 text-[9px] uppercase">Final Telemetry Score</div>
                  <div className="text-tau-teal font-extrabold text-sm">{liveScore} / 100</div>
                </div>
              </div>

              {/* Agent Performance Summary */}
              <div className="text-left space-y-2">
                <span className="text-[9px] font-orbitron font-bold text-slate-400 uppercase tracking-wider">Agent Evaluation Summary:</span>
                <div className="space-y-1.5 font-mono text-[10px] text-slate-300">
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span>Safety Agent:</span>
                    <span className="text-emerald-400 font-bold">100% Risk Mitigation Accuracy</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span>Resource Agent:</span>
                    <span className="text-emerald-400 font-bold">Consumable Reserves Preserved</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commander Agent:</span>
                    <span className="text-tau-teal font-bold">Consensus Reached on All Incidents</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() => { beep(520, 0.08); setDemoStep("config"); }}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 font-mono text-[11px] hover:bg-slate-900 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Configure New Run
                </button>
                <button
                  onClick={onToggleView}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-space-black font-orbitron font-extrabold text-[11px] uppercase tracking-wider hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── 6. TERMINATED SCREEN (FAILURE) ─── */}
        {demoStep === "failed" && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 max-w-2xl mx-auto w-full flex flex-col gap-6 items-center justify-center py-20 px-6 relative z-10"
          >
            <div className="glass-panel w-full rounded-2xl border border-rose-500/35 p-8 flex flex-col gap-6 relative overflow-hidden bg-slate-950/80 shadow-2xl text-center">
              {/* Sci Fi Corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-rose-500/50" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-rose-500/50" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-rose-500/50" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-rose-500/50" />

              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <AlertTriangle className="h-8 w-8 text-rose-500 animate-pulse" />
                </div>
                <h1 className="font-orbitron text-3xl font-black text-rose-500 tracking-[0.25em] uppercase glow-text-red">
                  MISSION TERMINATED
                </h1>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  Critical spacecraft integrity collapse detected
                </p>
              </div>

              {/* Failure Analysis Details */}
              <div className="text-left border-t border-b border-slate-800 py-4 space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] font-orbitron font-bold text-rose-400 uppercase tracking-wider block">Failure Analysis:</span>
                  <p className="text-[10px] text-slate-300 leading-normal">
                    Spacecraft encountered core thermal overload and structural degradation during high-intensity solar radiation envelope. Fail-safe valves failed to lock pressure levels.
                  </p>
                </div>
                
                <div className="space-y-1 mt-2">
                  <span className="text-[9px] font-orbitron font-bold text-rose-400 uppercase tracking-wider block">Incident Timeline:</span>
                  <div className="text-[9px] text-slate-500 space-y-1">
                    <div>[MET 00:01:12] Solar Storm Alert registered. Shield generators powered.</div>
                    <div className="text-rose-400 font-semibold">[MET 00:01:18] Primary Power core feedback failure. Thermal regulators collapsed.</div>
                    <div className="text-rose-500 font-bold">[MET 00:01:22] Spacecraft integrity at 0%. Autopilot disconnected.</div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="text-left space-y-2">
                <span className="text-[9px] font-orbitron font-bold text-slate-400 uppercase tracking-wider">Recommendations for Next Flight:</span>
                <ul className="list-disc list-inside font-mono text-[9px] text-slate-400 space-y-1">
                  <li>Reinforce primary power distribution buses to withstand thermal overload.</li>
                  <li>Implement secondary magnetic containment fields on astrophage exhausts.</li>
                  <li>Enable manual override overrides on emergency shielding manifolds.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() => { beep(520, 0.08); setDemoStep("config"); }}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 font-mono text-[11px] hover:bg-slate-900 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Configure New Run
                </button>
                <button
                  onClick={onToggleView}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-orbitron font-extrabold text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HackathonDemoView;
