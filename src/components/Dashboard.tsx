import React, { useState, useEffect, useRef } from "react";
import { 
  Droplet, 
  Zap, 
  Wind, 
  Thermometer, 
  Activity, 
  Radio, 
  MapPin, 
  Gauge, 
  Milestone, 
  Terminal 
} from "lucide-react";
import Header from "./Header";
import MetricCard from "./MetricCard";
import ProgressBar from "./ProgressBar";
import ControlPanel from "./ControlPanel";
import NavigationMap from "./NavigationMap";
import EventAlert from "./EventAlert";
import EventHistory from "./EventHistory";
import SuccessProbability from "./SuccessProbability";
// Phase 4
import AgentPanel from "./AgentPanel";
// Phase 5
import CrewPanel from "./CrewPanel";
import MissionObjectives from "./MissionObjectives";
import DiscussionFeed from "./DiscussionFeed";
import DiscussionHistory from "./DiscussionHistory";
// Phase 6
import MissionIntelligence from "./MissionIntelligence";
import ReasoningHistory from "./ReasoningHistory";
import AISettings from "./AISettings";
// Phase 7
import { simulateAction } from "../digitalTwin/simulateAction";
import type { SimulationResult } from "../digitalTwin/simulateAction";
import DigitalTwinPanel from "./DigitalTwinPanel";
import { commanderAgent } from "../agents/commanderAgent";
import type { CommanderDecision } from "../types/agents";
// Phase 8
import { calculateMetricScores } from "../scoring/calculateMetricScores";
import { calculateMissionScore } from "../scoring/calculateMissionScore";
import { evaluateDecisionQuality } from "../scoring/evaluateDecisionQuality";
import { recordMissionEvent } from "../scoring/recordMissionEvent";
import { checkAlerts } from "../scoring/checkAlerts";
import type { MissionScore, DecisionQualityRecord, PerformanceSnapshot, ScoringAlerts } from "../scoring/types";
import MissionScoreCard from "./scoring/MissionScoreCard";
import DecisionAnalysis from "./scoring/DecisionAnalysis";
import PerformanceHistory from "./scoring/PerformanceHistory";
import MissionControlView from "./missionControl/MissionControlView";
import HackathonDemoView from "./demo/HackathonDemoView";
import SpacecraftViewer from "./spacecraft/SpacecraftViewer";

import { 
  INITIAL_SPACECRAFT_STATE, 
  getMissionPhase, 
  SIMULATION_LOGS, 
} from "../data/spacecraft";
import type { SpacecraftState, LogMessage } from "../data/spacecraft";
import type { ActiveEvent } from "../data/events";
import { generateRandomEvent, generateEarthEvent } from "../utils/eventGenerator";

import { DECISION_TEMPLATES } from "../data/decisions";
import { EARTH_DECISION_TEMPLATES } from "../data/earthDecisions";
import type { Decision } from "../data/decisions";

import AREPanel from "./AREPanel";
import { generateAREForecast } from "../ai/adaptiveResilience";
import { useSpaceWeather } from "../hooks/useSpaceWeather";
import SpaceWeatherWidget from "./SpaceWeatherWidget";

import JudgePanel from "./JudgePanel";
import MissionReplay from "./MissionReplay";
import WhatIfExplorer from "./WhatIfExplorer";
import KnowledgeGraph from "./KnowledgeGraph";
import CommandCenter3D from "./CommandCenter3D";
import AdvancedAnalytics from "./AdvancedAnalytics";
import MissionVoiceCenter from "./MissionVoiceCenter";
import { useVoiceMemory } from "../hooks/useVoiceMemory";
import type { VoiceCommandResult } from "../hooks/useVoiceControl";
import { ConversationalPanel } from "./ConversationalPanel";
import { useCMI } from "../hooks/useCMI";

import { injectJudgeScenario } from "../utils/judgeScenarios";
import type { JudgeScenarioType } from "../utils/judgeScenarios";
import { useVoiceControl } from "../hooks/useVoiceControl";
import { exportMissionReport } from "../utils/exportReport";
import { recordOutcome } from "../ai/learningEngine";
// Phase 4
import { runAgentCollaboration } from "../utils/agentCoordinator";
import type { AgentCollaboration } from "../types/agents";
import type { DiscussionSession } from "../types/communication";
// Phase 5
import type { CrewMember } from "../types/crew";
import { INITIAL_CREW, CREW_EVENT_EFFECTS, applyCrewEffect } from "../data/crew";
import type { MissionObjective } from "../types/objectives";
import { INITIAL_OBJECTIVES, evaluateObjectives } from "../data/objectives";
// Phase 6
import { useMissionAI } from "../hooks/useMissionAI";
import type { AIConfiguration } from "../ai/types";
import { DEFAULT_AI_CONFIG, AI_CONFIG_STORAGE_KEY } from "../ai/types";
import type { AnomalyQueueItem, HumanOverrideRecord } from "../types/missionControl";
import { AnomalyCommandCenter } from "./AnomalyCommandCenter";

interface SimulationState {
  spacecraft: SpacecraftState;
  activeEvent: ActiveEvent | null;
  eventHistory: ActiveEvent[];
  activeDecision: Decision | null;
  decisionHistory: Decision[];
  decisionStatus: "idle" | "analyzing" | "resolved";
  successProbability: number;
  elapsedSeconds: number;
  // Phase 4
  activeCollaboration: AgentCollaboration | null;
  collaborationHistory: AgentCollaboration[];
  collaborationStatus: "idle" | "analyzing" | "resolved";
  // Phase 5
  crew: CrewMember[];
  objectives: MissionObjective[];
  bootComplete: boolean;
  discussionHistory: DiscussionSession[];
  // Phase 7
  digitalTwinPredictions: SimulationResult[];
  digitalTwinStatus: "idle" | "analyzing" | "resolved";
  twinCommanderDecision: CommanderDecision | null;
  twinCommanderVerdict: "approved" | "rejected" | null;
  // Phase 8
  missionScore: MissionScore;
  decisionQualityLog: DecisionQualityRecord[];
  performanceHistory: PerformanceSnapshot[];
  scoringAlerts: ScoringAlerts;
  // MARM additions
  anomalyQueue: AnomalyQueueItem[];
  humanOverrideLog: HumanOverrideRecord[];
}

export const Dashboard: React.FC = () => {
  const [simState, setSimState] = useState<SimulationState>({
    spacecraft: INITIAL_SPACECRAFT_STATE,
    activeEvent: null,
    eventHistory: [],
    activeDecision: null,
    decisionHistory: [],
    decisionStatus: "idle",
    successProbability: 95,
    elapsedSeconds: 0,
    activeCollaboration: null,
    collaborationHistory: [],
    collaborationStatus: "idle",
    // Phase 5
    crew: INITIAL_CREW,
    objectives: INITIAL_OBJECTIVES,
    bootComplete: false,
    discussionHistory: [],
    // Phase 7
    digitalTwinPredictions: [],
    digitalTwinStatus: "idle",
    twinCommanderDecision: null,
    twinCommanderVerdict: null,
    // Phase 8 – initial score (pre-mission)
    missionScore: {
      overall: 85,
      metrics: {
        fuelEfficiency: 100, powerEfficiency: 100, oxygenManagement: 100,
        safetyScore: 100, resourceUtilization: 100, scienceValue: 0,
        decisionQuality: 85, timeEfficiency: 100, crewSurvivalProbability: 100,
        overallSuccessProbability: 95,
      },
      grade: "A",
      trend: "stable",
      previousOverall: 85,
      lastUpdated: "00:00:00",
    },
    decisionQualityLog: [],
    performanceHistory: [],
    scoringAlerts: { lowSafety: false, lowFuel: false, lowSuccess: false, criticalMode: false },
    anomalyQueue: [],
    humanOverrideLog: [],
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeLogs, setActiveLogs] = useState<LogMessage[]>([SIMULATION_LOGS[0]]);
  const [highlightedMetrics, setHighlightedMetrics] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"technical" | "control" | "demo" | "marm">("control");
  
  const [safetyWindow, setSafetyWindow] = useState<string>("0"); // HGACS: default ∞ hold
  // HGACS: timerFallback is always "wait" — no auto-execution ever
  const timerFallback = "wait" as const;
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [marmOpen, setMarmOpen] = useState<boolean>(false);
  const [marmActiveStep, setMarmActiveStep] = useState<"detection" | "deliberation" | "simulation" | "xai" | "governance">("detection");
  const safetyTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const [mode, setMode] = useState<"space" | "earth">("space");
  const [judgePanelOpen, setJudgePanelOpen] = useState(false);
  const [missionReplayOpen, setMissionReplayOpen] = useState(false);
  const [whatIfExplorerOpen, setWhatIfExplorerOpen] = useState(false);
  const [knowledgeGraphOpen, setKnowledgeGraphOpen] = useState(false);
  const [commandCenter3DOpen, setCommandCenter3DOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [voiceMemoryOpen, setVoiceMemoryOpen] = useState(false);

  // MVIAS: Global voice memory
  const voiceMemory = useVoiceMemory();

  // Phase 6 – AI configuration (loaded from localStorage) - HGACS: force manual mode
  const [aiConfig, setAiConfig] = useState<AIConfiguration>(() => {
    try {
      const saved = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
      if (saved) return { ...DEFAULT_AI_CONFIG, ...JSON.parse(saved), decisionMode: "manual" };
    } catch { /* ignore */ }
    return { ...DEFAULT_AI_CONFIG, decisionMode: "manual" };
  });
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);

  // CMI: Conversational Mission Intelligence
  const [cmiOpen, setCmiOpen] = useState(false);
  const [highlightedSections, setHighlightedSections] = useState<Record<string, boolean>>({});

  const cmiActions = {
    startMission: () => handleStart(),
    pauseSimulation: () => handlePause(),
    resumeSimulation: () => handleStart(),
    replayLastDecision: () => setMissionReplayOpen(true),
    generateMissionReport: () => handleExportPDF(),
    runWhatIfAnalysis: () => setWhatIfExplorerOpen(true),
    simulateDualFailure: () => handleInjectJudgeScenario("Dual Failure"),
    exportAnalytics: () => setAnalyticsOpen(true),
    switchMode: (newMode: "space" | "earth") => setMode(newMode),
    highlightSection: (section: string) => {
      const metrics = ["fuel", "power", "oxygen", "health", "velocity", "progress", "temperature", "position", "communication"];
      if (metrics.includes(section)) {
        setHighlightedMetrics({ [section]: true });
        setTimeout(() => setHighlightedMetrics({}), 3000);
      } else {
        setHighlightedSections({ [section]: true });
        setTimeout(() => setHighlightedSections(prev => ({ ...prev, [section]: false })), 3000);
      }
    },
    openKnowledgeGraph: () => setKnowledgeGraphOpen(true),
    open3DView: () => setCommandCenter3DOpen(true),
    approveAnomaly: () => {
      const pending = simState.anomalyQueue.find((a) => a.status === "Pending");
      if (pending) {
        const recAction = pending.recommendation?.finalAction ?? pending.digitalTwinPredictions[0]?.actionName ?? "Ignore";
        resolveAnomalyRef.current(recAction, "approved", "CMI Voice Action: approve_anomaly");
      }
    },
    rejectAnomaly: () => {
      const pending = simState.anomalyQueue.find((a) => a.status === "Pending");
      if (pending) {
        const fallback = pending.digitalTwinPredictions.find(
          (p) => p.actionName === "Ignore" || p.actionName === "Continue Mission"
        ) ?? pending.digitalTwinPredictions[0];
        resolveAnomalyRef.current(fallback?.actionName ?? "Ignore", "rejected", "CMI Voice Action: reject_anomaly");
      }
    },
    compareAlternatives: () => {
      const pending = simState.anomalyQueue.find((a) => a.status === "Pending");
      if (pending) {
        setMarmOpen(true);
        setMarmActiveStep("simulation");
      }
    },
    rerunSimulations: () => {
      const pending = simState.anomalyQueue.find((a) => a.status === "Pending");
      if (pending) {
        setMarmOpen(true);
        setMarmActiveStep("simulation");
        handleRerunSimulations(pending.id, 500);
      }
    },
  };

  const cmi = useCMI(simState, cmiActions, aiConfig);

  // HGACS: Stable ref so voice handler (defined early) can call the resolve handler (defined later)
  const resolveAnomalyRef = React.useRef<(
    actionName: string,
    userDecision: "approved" | "rejected" | "alternative" | "override",
    justification: string
  ) => void>(() => {});

  const handleVoiceCommand = (result: VoiceCommandResult) => {
    const { action, transcript, audioBlob, durationMs } = result;
    if (action === "PAUSE") setIsPaused(true);
    else if (action === "RESUME") { setIsPaused(false); setIsRunning(true); }
    else if (action === "ABORT") setIsRunning(false);
    // HGACS: voice APPROVE / REJECT route to human governance handler via stable ref
    else if (action === "APPROVE") {
      const pending = simState.anomalyQueue.find((a) => a.status === "Pending");
      if (pending) {
        const recAction = pending.recommendation?.finalAction ?? pending.digitalTwinPredictions[0]?.actionName ?? "Ignore";
        resolveAnomalyRef.current(recAction, "approved", "Voice command: APPROVE");
      }
    } else if (action === "REJECT") {
      const pending = simState.anomalyQueue.find((a) => a.status === "Pending");
      if (pending) {
        const fallback = pending.digitalTwinPredictions.find(
          (p) => p.actionName === "Ignore" || p.actionName === "Continue Mission"
        ) ?? pending.digitalTwinPredictions[0];
        resolveAnomalyRef.current(fallback?.actionName ?? "Ignore", "rejected", "Voice command: REJECT");
      }
    } else if (action === "COMPARE") {
      const pending = simState.anomalyQueue.find((a) => a.status === "Pending");
      if (pending) {
        setMarmOpen(true);
        setMarmActiveStep("simulation");
      }
    } else if (action === "RERUN") {
      const pending = simState.anomalyQueue.find((a) => a.status === "Pending");
      if (pending) {
        setMarmOpen(true);
        setMarmActiveStep("simulation");
        handleRerunSimulations(pending.id, 500);
      }
    }

    // Persist to MVIAS — auto-link current event/decision context
    voiceMemory.addRecording({
      transcript,
      audioBlob,
      durationMs,
      speaker: "Human Operator",
      linkedEventId: simState.activeEvent?.id,
      linkedDecisionId: simState.activeDecision?.id,
      mode: action === "APPROVE" ? "Human Override" : "Command",
      confidenceScore: 0.92,
    });
  };
  const { isListening, toggleListening } = useVoiceControl(handleVoiceCommand);


  // Phase 6 – AI hook
  const aiHook = useMissionAI();

  // Phase 12 - Space Weather
  const spaceWeather = useSpaceWeather();

  const timerRef = useRef<number | null>(null);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);
  const eventCountdownRef = useRef<number>(-1);
  const decisionCountdownRef = useRef<number>(-1);
  const commsOfflineRemainingRef = useRef<number>(0);
  const decisionStatusRef = useRef<"idle" | "analyzing" | "resolved">("idle");
  const activeEventRef = useRef<ActiveEvent | null>(null);
  const pendingJudgeEventRef = useRef<ActiveEvent | null>(null);
  // Phase 4 refs
  const collaborationStatusRef = useRef<"idle" | "analyzing" | "resolved">("idle");
  const activeCollaborationRef = useRef<AgentCollaboration | null>(null);
  // Phase 5 refs
  const bootCompleteRef = useRef<boolean>(false);
  // Phase 6 refs
  const lastProcessedCollabIdRef = useRef<string | null>(null);
  const appliedAnalysisIdsRef = useRef<Set<string>>(new Set());
  // Scroll guard: track previous log count so auto-scroll only fires on new entries
  const prevLogsLengthRef = useRef<number>(0);

  // Initialize event countdown on mount to avoid impure Math.random during render
  useEffect(() => {
    if (eventCountdownRef.current === -1) {
      eventCountdownRef.current = Math.floor(Math.random() * 11) + 10;
    }
  }, []);

  // Auto-scroll telemetry log only when new entries are appended, never on initial mount
  useEffect(() => {
    if (
      logsContainerRef.current &&
      activeLogs.length > prevLogsLengthRef.current
    ) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
    prevLogsLengthRef.current = activeLogs.length;
  }, [activeLogs]);

  // Phase 6 – Trigger AI analysis when agent collaboration resolves
  useEffect(() => {
    const collab = simState.activeCollaboration;
    if (
      simState.collaborationStatus === "resolved" &&
      collab &&
      collab.id !== lastProcessedCollabIdRef.current &&
      collab.commanderDecision &&
      collab.discussionSession &&
      simState.activeEvent
    ) {
      lastProcessedCollabIdRef.current = collab.id;
      aiHook.triggerAnalysis(
        {
          spacecraft: simState.spacecraft,
          event: simState.activeEvent,
          recommendations: collab.recommendations,
          discussionSummary: collab.discussionSession.discussionSummary,
          consensusScore: collab.discussionSession.consensusScore,
          successProbability: simState.successProbability,
        },
        aiConfig
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simState.collaborationStatus, simState.activeCollaboration]);

  // Phase 6 – Apply successAdjustment when analysis is approved
  useEffect(() => {
    const analysis = aiHook.currentAnalysis;
    if (
      analysis &&
      analysis.commanderVerdict === "approved" &&
      !appliedAnalysisIdsRef.current.has(analysis.id)
    ) {
      appliedAnalysisIdsRef.current.add(analysis.id);
      const adj = analysis.response.successAdjustment;
      if (adj !== 0) {
        setSimState((prev) => ({
          ...prev,
          successProbability: Math.max(0, Math.min(100, prev.successProbability + adj)),
        }));
      }
      const adjStr = adj > 0 ? `+${adj}` : String(adj);
      setActiveLogs((prev) => [
        ...prev,
        {
          id: `ai-log-${Date.now()}`,
          timestamp: "AI INTEL",
          text: `MISSION AI: "${analysis.response.selectedAction}" — ${analysis.response.predictedImpact} (${adjStr}% Integrity) [${analysis.provider}, ${analysis.responseTimeMs}ms]`,
          type: adj >= 0 ? "success" : "warning",
          progressTrigger: -1,
        },
      ]);
    }
  }, [aiHook.currentAnalysis]);

  const formatMET = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // ─── Main simulation tick ───────────────────────────────────────────────
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setSimState((prev) => {
          const nextTime = prev.elapsedSeconds + 1;
          const metString = formatMET(nextTime);

          // Decrement timers
          if (commsOfflineRemainingRef.current > 0) commsOfflineRemainingRef.current -= 1;
          eventCountdownRef.current -= 1;
          if (decisionCountdownRef.current > 0) decisionCountdownRef.current -= 1;

          // Base spacecraft metrics
          const spacecraft = { ...prev.spacecraft };
          const nextProgressBase = Math.min(spacecraft.missionProgress + 1.0, 100);

          let nextFuel = Math.max(spacecraft.fuel - 0.6, 0);
          let nextPower = Math.max(spacecraft.power - 0.45, 0);
          let nextOxygen = Math.max(spacecraft.oxygen - 0.35, 0);
          let nextHealth = spacecraft.health;
          let nextProgress = nextProgressBase;

          let activeEvent = prev.activeEvent;
          let eventHistory = [...prev.eventHistory];
          let activeDecision = prev.activeDecision;
          let decisionHistory = [...prev.decisionHistory];
          let decisionStatus = decisionStatusRef.current;
          let successProbability = prev.successProbability;

          // Phase 4
          let activeCollaboration = prev.activeCollaboration;
          let collaborationHistory = [...prev.collaborationHistory];
          let collaborationStatus = collaborationStatusRef.current;

          // Phase 5
          let crew = [...prev.crew];
          let objectives = [...prev.objectives];
          let bootComplete = bootCompleteRef.current;
          let discussionHistory = [...prev.discussionHistory];

          // Phase 7
          let digitalTwinPredictions = [...prev.digitalTwinPredictions];
          let digitalTwinStatus = prev.digitalTwinStatus;
          let twinCommanderDecision = prev.twinCommanderDecision;
          let twinCommanderVerdict = prev.twinCommanderVerdict;

          // Phase 8
          let decisionQualityLog = [...prev.decisionQualityLog];
          let performanceHistory = [...prev.performanceHistory];
          const missionScore = prev.missionScore;

          // ── Boot sequence objective complete on first tick ──
          if (!bootComplete) {
            bootComplete = true;
            bootCompleteRef.current = true;
          }

          // ── Evaluate objectives (boot + progress-threshold ones) ──
          const { objectives: updatedObjs, bonusEarned: bootBonus } = evaluateObjectives(
            objectives,
            nextProgress,
            null,
            null,
            null,
            bootComplete
          );
          objectives = updatedObjs;
          if (bootBonus > 0) {
            successProbability = Math.min(successProbability + bootBonus, 100);
          }

          // ── EVENT TRIGGER ──
          if (eventCountdownRef.current === 0 && nextProgress < 100) {
            let newEvent: ActiveEvent;
            if (pendingJudgeEventRef.current) {
              newEvent = pendingJudgeEventRef.current;
              pendingJudgeEventRef.current = null;
            } else {
              newEvent = mode === "space" ? generateRandomEvent(metString, spaceWeather.status) : generateEarthEvent(metString);
            }
            activeEvent = newEvent;
            activeEventRef.current = newEvent;
            eventHistory = [newEvent, ...eventHistory];

            decisionStatus = "analyzing";
            decisionStatusRef.current = "analyzing";
            activeDecision = null;

            collaborationStatus = "analyzing";
            collaborationStatusRef.current = "analyzing";
            activeCollaboration = null;

            // Apply event resource damage
            const ef = newEvent.appliedEffects;
            if (ef.fuel !== undefined) nextFuel = Math.max(nextFuel - ef.fuel, 0);
            if (ef.power !== undefined) nextPower = Math.max(nextPower - ef.power, 0);
            if (ef.oxygen !== undefined) nextOxygen = Math.max(nextOxygen - ef.oxygen, 0);
            if (ef.health !== undefined) nextHealth = Math.max(nextHealth - ef.health, 0);
            if (ef.missionProgress !== undefined) nextProgress = Math.max(nextProgress - ef.missionProgress, 0);
            if (ef.communicationDuration !== undefined) {
              commsOfflineRemainingRef.current = ef.communicationDuration;
            }

            // Phase 5 – apply crew event effects
            const crewEventEff = CREW_EVENT_EFFECTS[newEvent.title];
            if (crewEventEff) crew = applyCrewEffect(crew, crewEventEff);

            // Deduct success probability
            const successLoss = Math.floor(Math.random() * 4) + 2;
            successProbability = Math.max(successProbability - successLoss, 0);

            // Highlight affected metric cards
            const highlights: Record<string, boolean> = {};
            if (ef.fuel !== undefined) highlights.fuel = true;
            if (ef.power !== undefined) highlights.power = true;
            if (ef.oxygen !== undefined) highlights.oxygen = true;
            if (ef.health !== undefined) highlights.health = true;
            if (ef.missionProgress !== undefined) highlights.missionProgress = true;
            if (ef.velocity !== undefined) highlights.velocity = true;
            if (ef.communicationDuration !== undefined) highlights.communication = true;
            setHighlightedMetrics(highlights);
            setTimeout(() => setHighlightedMetrics({}), 2500);

            // Log event
            const severityType = newEvent.severity === "Critical"
              ? "danger" : newEvent.severity === "High"
              ? "warning" : newEvent.isOpportunity
              ? "success" : "info";

            setActiveLogs(prev => [...prev, {
              id: `evt-log-${Date.now()}`,
              timestamp: `MET ${metString}`,
              text: `ALERT [${newEvent.severity}]: ${newEvent.title} — ${newEvent.description} (Integrity -${successLoss}%)`,
              type: severityType,
              progressTrigger: -1,
            }]);
            setActiveLogs(prev => [...prev, {
              id: `agent-start-${Date.now()}`,
              timestamp: `MET ${metString}`,
              text: `MULTI-AGENT: Nav · Resource · Safety · Science agents now analyzing "${newEvent.title}"...`,
              type: "info",
              progressTrigger: -1,
            }]);

            // Phase 7: Digital Twin Sandbox Initialization
            const decisionTemplates = mode === "space" ? DECISION_TEMPLATES : EARTH_DECISION_TEMPLATES;
            const twinActions = decisionTemplates[newEvent.title]?.availableActions || ["Ignore", "Reduce Speed", "Activate Backup Tank"];
            const twinState: SpacecraftState = {
              fuel: nextFuel,
              power: nextPower,
              oxygen: nextOxygen,
              temperature: spacecraft.temperature,
              health: nextHealth,
              communication: commsOfflineRemainingRef.current === 0 && nextProgress < 99,
              position: getMissionPhase(nextProgress).position,
              velocity: spacecraft.velocity,
              missionProgress: nextProgress,
            };
            digitalTwinPredictions = twinActions
              .map(act => simulateAction(twinState, crew, newEvent.title, act, successProbability))
              .filter((p): p is SimulationResult => p !== null);
            digitalTwinStatus = "analyzing";
            twinCommanderDecision = null;
            twinCommanderVerdict = null;

            decisionCountdownRef.current = 2;
            eventCountdownRef.current = Math.floor(Math.random() * 11) + 10;
          }

          // ── DECISION RESOLUTION (t+2s after event) ──
          if (decisionCountdownRef.current === 0 && decisionStatus === "analyzing" && activeEventRef.current) {
            const currentEvent = activeEventRef.current;

            // Phase 4 – run full agent collaboration
            const currentPhaseForCollab = getMissionPhase(nextProgress);
            const stateForCollab: SpacecraftState = {
              fuel: nextFuel, power: nextPower, oxygen: nextOxygen,
              temperature: spacecraft.temperature, health: nextHealth,
              communication: commsOfflineRemainingRef.current === 0 && nextProgress < 99,
              position: currentPhaseForCollab.position,
              velocity: spacecraft.velocity, missionProgress: nextProgress,
            };
            const collab = runAgentCollaboration(currentEvent, stateForCollab, metString);
            activeCollaboration = collab;
            activeCollaborationRef.current = collab;
            collaborationHistory = [collab, ...collaborationHistory].slice(0, 10);
            collaborationStatus = "resolved";
            collaborationStatusRef.current = "resolved";

            // Phase 5 – record discussion session in history
            if (collab.discussionSession) {
              discussionHistory = [collab.discussionSession, ...discussionHistory].slice(0, 10);
            }
            // Phase 7: Run Commander Agent using Digital Twin predictions
            const twinDecision = commanderAgent(currentEvent, collab.recommendations, metString, digitalTwinPredictions);
            twinCommanderDecision = twinDecision;
            digitalTwinStatus = "resolved";

            // Make a backward-compatible decision object
            const twinDecisionRecord: Decision = {
              id: `dec-${Date.now()}`,
              eventId: currentEvent.id,
              eventTitle: currentEvent.title,
              availableActions: digitalTwinPredictions.map(p => p.actionName),
              selectedAction: twinDecision.finalAction,
              reasoning: twinDecision.reasoning,
              outcome: "Simulation committed successfully.",
              timestamp: metString,
              successImpact: 0,
            };
            activeDecision = twinDecisionRecord;
            decisionHistory = [twinDecisionRecord, ...decisionHistory];
            decisionStatus = "resolved";
            decisionStatusRef.current = "resolved";

            if (aiConfig.decisionMode === "auto") {
              twinCommanderVerdict = "approved";
              const selectedSim = digitalTwinPredictions.find(
                p => p.actionName.toLowerCase() === twinDecision.finalAction.toLowerCase()
              );
              if (selectedSim) {
                nextFuel = selectedSim.resultingState.fuel;
                nextPower = selectedSim.resultingState.power;
                nextOxygen = selectedSim.resultingState.oxygen;
                nextHealth = selectedSim.resultingState.health;
                nextProgress = selectedSim.resultingState.missionProgress;
                crew = selectedSim.resultingCrew;
                successProbability = selectedSim.successProbability;

                if (selectedSim.actionName === "Use Backup Antenna" || selectedSim.actionName === "Enter Safe Mode") {
                  commsOfflineRemainingRef.current = 0;
                }

                // Phase 5 – evaluate objectives on decision
                const { objectives: objs2, bonusEarned: objBonus } = evaluateObjectives(
                  objectives,
                  nextProgress,
                  selectedSim.actionName,
                  currentEvent.title,
                  currentEvent.severity,
                  bootComplete
                );
                objectives = objs2;
                if (objBonus > 0) {
                  successProbability = Math.min(successProbability + objBonus, 100);
                  setActiveLogs(prev => [...prev, {
                    id: `obj-log-${Date.now()}`,
                    timestamp: `MET ${metString}`,
                    text: `OBJECTIVE COMPLETE: Mission objective achieved (+${objBonus}% Success Integrity)`,
                    type: "success",
                    progressTrigger: -1,
                  }]);
                }

                // Highlight outcome metrics based on deltas
                const highlights: Record<string, boolean> = {};
                if (selectedSim.fuelDelta !== 0) highlights.fuel = true;
                if (selectedSim.powerDelta !== 0) highlights.power = true;
                if (selectedSim.oxygenDelta !== 0) highlights.oxygen = true;
                if (selectedSim.healthDelta !== 0) highlights.health = true;
                if (selectedSim.progressDelta !== 0) highlights.missionProgress = true;
                setHighlightedMetrics(highlights);
                setTimeout(() => setHighlightedMetrics({}), 2500);

                // Log auto commander decision
                setActiveLogs(prev => [...prev, {
                  id: `dec-log-${Date.now()}`,
                  timestamp: `MET ${metString}`,
                  text: `COMMANDER (AUTO): "${selectedSim.actionName}" committed to main systems. (Simulated Success: ${selectedSim.successProbability}%)`,
                  type: "success",
                  progressTrigger: -1,
                }]);
              }

              // ── Phase 8: Record decision quality + performance snapshot (auto mode) ──
              const selectedSimForScore = digitalTwinPredictions.find(
                p => p.actionName.toLowerCase() === twinDecision.finalAction.toLowerCase()
              );
              if (selectedSimForScore) {
                const dqRecord = evaluateDecisionQuality(
                  currentEvent.title,
                  selectedSimForScore.actionName,
                  selectedSimForScore.successProbability,
                  successProbability,
                  "auto",
                  `MET ${metString}`
                );
                decisionQualityLog = [dqRecord, ...decisionQualityLog].slice(0, 50);

                const snap = recordMissionEvent(
                  currentEvent,
                  selectedSimForScore.actionName,
                  missionScore.overall,
                  selectedSimForScore.successProbability,
                  `MET ${metString}`
                );
                performanceHistory = [snap, ...performanceHistory].slice(0, 30);
                
                recordOutcome({
                  eventId: currentEvent.id,
                  eventTitle: currentEvent.title,
                  selectedAction: selectedSimForScore.actionName,
                  successImpact: selectedSimForScore.successProbability - successProbability,
                  healthDelta: selectedSimForScore.healthDelta,
                  timestamp: `MET ${metString}`
                });
              }
            } else {
              // HGACS: enqueue anomaly — ALL responses require human authorization
              const queueItem: AnomalyQueueItem = {
                id: `marm-${Date.now()}`,
                timestamp: `MET ${metString}`,
                event: currentEvent,
                recommendation: twinDecision,
                digitalTwinPredictions,
                // HGACS: attach collaboration snapshot so HGACS console can show deliberation
                collaboration: activeCollaboration,
                status: "Pending",
                workflowStep: "detection",
              };
              pendingMarmQueueItemRef.current = queueItem;

              // Auto-open the HGACS overlay immediately
              setMarmActiveStep("detection");
              setMarmOpen(true);
              // Freeze simulation until human decides
              setIsPaused(true);

              setActiveLogs(prev => [...prev, {
                id: `dec-log-${Date.now()}`,
                timestamp: `MET ${metString}`,
                text: `🛡️ HGACS: Anomaly queued for MANDATORY human authorization — "${twinDecision.finalAction}" AI advisory. Simulation FROZEN pending operator decision.`,
                type: "warning",
                progressTrigger: -1,
              }]);
            }

            decisionCountdownRef.current = -1;
          }

          // ── Also update progress-threshold objectives every tick ──
          const { objectives: objs3, bonusEarned: progressBonus } = evaluateObjectives(
            objectives,
            nextProgress,
            null,
            null,
            null,
            bootComplete
          );
          if (progressBonus > 0) {
            objectives = objs3;
            successProbability = Math.min(successProbability + progressBonus, 100);
            setActiveLogs(prev => [...prev, {
              id: `obj-prog-${Date.now()}`,
              timestamp: `MET ${metString}`,
              text: `OBJECTIVE COMPLETE: Mission threshold reached (+${progressBonus}% Success Integrity)`,
              type: "success",
              progressTrigger: -1,
            }]);
          } else {
            // Still update progress bars even if not complete
            objectives = objs3;
          }

          // Mission abort
          if (successProbability === 0 && nextProgress < 100) {
            setIsRunning(false);
            setActiveLogs(prev => [...prev, {
              id: `fail-log-${Date.now()}`,
              timestamp: `MET ${metString}`,
              text: `MISSION ABORTED: System Success Probability has reached 0%. Mission failure.`,
              type: "danger",
              progressTrigger: -1,
            }]);
          }

          // Health penalty if resources are dry
          if (nextFuel === 0 || nextPower === 0 || nextOxygen === 0) {
            nextHealth = Math.max(nextHealth - 8.0, 0);
          }
          nextHealth = Math.min(nextHealth, 100);

          // Temp fluctuations
          const baseTemp = 22;
          const tempFluctuation = Math.sin(nextTime / 5) * 0.4 + (Math.random() * 0.1);
          const nextTemp = parseFloat((baseTemp + tempFluctuation).toFixed(1));

          // Velocity calculations
          const phase = getMissionPhase(nextProgress);
          let nextVelocityBase = phase.velocity;

          if (activeEvent && decisionStatus === "analyzing" && activeEvent.appliedEffects.velocity !== undefined) {
            nextVelocityBase = Math.max(nextVelocityBase - activeEvent.appliedEffects.velocity, 0);
          }

          let nextVelocity = nextVelocityBase;
          if (nextProgress > 0 && nextProgress < 100) {
            const noise = nextVelocityBase > 1000
              ? (Math.random() * 200 - 100) : (Math.random() * 0.3 - 0.15);
            nextVelocity = parseFloat((nextVelocityBase + noise).toFixed(1));
          }

          if (nextProgress === 100) setIsRunning(false);

          // Checkpoint logs
          const triggeredLogs = SIMULATION_LOGS.filter(
            (log) => Math.floor(nextProgress) === log.progressTrigger
          );
          if (triggeredLogs.length > 0) {
            setActiveLogs((prevLogs) => {
              const newLogs = triggeredLogs.filter(
                (tLog) => !prevLogs.some((pLog) => pLog.id === tLog.id)
              );
              return newLogs.length > 0 ? [...prevLogs, ...newLogs] : prevLogs;
            });
          }

          // ── Phase 8: Recalculate mission score every tick ──────────────────
          const p8State = {
            fuel: parseFloat(nextFuel.toFixed(1)),
            power: parseFloat(nextPower.toFixed(1)),
            oxygen: parseFloat(nextOxygen.toFixed(1)),
            temperature: nextTemp,
            health: parseFloat(nextHealth.toFixed(1)),
            communication: commsOfflineRemainingRef.current === 0 && nextProgress < 99,
            position: phase.position,
            velocity: nextVelocity,
            missionProgress: nextProgress,
          };
          const p8Metrics = calculateMetricScores(
            p8State, successProbability, crew,
            decisionQualityLog, nextTime, 0
          );
          const p8Score = calculateMissionScore(
            p8Metrics,
            missionScore.overall,
            metString
          );
          const p8Alerts = checkAlerts(p8Metrics);

          // MARM: flush any newly created queue item
          const newQueueItem = pendingMarmQueueItemRef.current;
          pendingMarmQueueItemRef.current = null;
          const nextAnomalyQueue = newQueueItem
            ? [...prev.anomalyQueue, newQueueItem]
            : prev.anomalyQueue;

          return {
            spacecraft: p8State,
            activeEvent, eventHistory, activeDecision, decisionHistory,
            decisionStatus, successProbability, elapsedSeconds: nextTime,
            activeCollaboration, collaborationHistory, collaborationStatus,
            crew, objectives, bootComplete, discussionHistory,
            // Phase 7
            digitalTwinPredictions,
            digitalTwinStatus,
            twinCommanderDecision,
            twinCommanderVerdict,
            // Phase 8
            missionScore: p8Score,
            decisionQualityLog,
            performanceHistory,
            scoringAlerts: p8Alerts,
            // MARM
            anomalyQueue: nextAnomalyQueue,
            humanOverrideLog: prev.humanOverrideLog,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, isPaused]);

  const handleStart = () => {
    if (simState.successProbability === 0) return;
    setIsRunning(true);
    setIsPaused(false);
    if (simState.elapsedSeconds === 0) {
      const startLog = SIMULATION_LOGS.find(l => l.progressTrigger === 0);
      if (startLog && !activeLogs.some(l => l.id === startLog.id)) {
        setActiveLogs([startLog]);
      }
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    setActiveLogs(prev => [...prev, {
      id: `pause-${Date.now()}`,
      timestamp: `MET ${formatMET(simState.elapsedSeconds)}`,
      text: `Simulation sequence PAUSED by operator. Systems holding at current metrics.`,
      type: "warning",
      progressTrigger: simState.spacecraft.missionProgress,
    }]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSimState({
      spacecraft: INITIAL_SPACECRAFT_STATE,
      activeEvent: null, eventHistory: [],
      activeDecision: null, decisionHistory: [],
      decisionStatus: "idle", successProbability: 95, elapsedSeconds: 0,
      activeCollaboration: null, collaborationHistory: [], collaborationStatus: "idle",
      crew: INITIAL_CREW, objectives: INITIAL_OBJECTIVES, bootComplete: false,
      discussionHistory: [],
      // Phase 7
      digitalTwinPredictions: [],
      digitalTwinStatus: "idle",
      twinCommanderDecision: null,
      twinCommanderVerdict: null,
      // Phase 8
      missionScore: {
        overall: 85, metrics: {
          fuelEfficiency: 100, powerEfficiency: 100, oxygenManagement: 100,
          safetyScore: 100, resourceUtilization: 100, scienceValue: 0,
          decisionQuality: 85, timeEfficiency: 100, crewSurvivalProbability: 100,
          overallSuccessProbability: 95,
        }, grade: "A", trend: "stable", previousOverall: 85, lastUpdated: "00:00:00",
      },
      decisionQualityLog: [],
      performanceHistory: [],
      scoringAlerts: { lowSafety: false, lowFuel: false, lowSuccess: false, criticalMode: false },
      // MARM reset
      anomalyQueue: [],
      humanOverrideLog: [],
    });
    setActiveLogs([SIMULATION_LOGS[0]]);
    setHighlightedMetrics({});
    setTimeLeft(null);
    if (safetyTimerRef.current) { clearInterval(safetyTimerRef.current); safetyTimerRef.current = null; }
    eventCountdownRef.current = Math.floor(Math.random() * 11) + 10;
    decisionCountdownRef.current = -1;
    commsOfflineRemainingRef.current = 0;
    decisionStatusRef.current = "idle";
    activeEventRef.current = null;
    collaborationStatusRef.current = "idle";
    activeCollaborationRef.current = null;
    bootCompleteRef.current = false;
    // Phase 6 reset
    aiHook.resetAI();
    lastProcessedCollabIdRef.current = null;
    appliedAnalysisIdsRef.current.clear();
  };

  const handleDismissAlert = () => {
    setSimState((prev) => ({
      ...prev,
      activeEvent: null,
      decisionStatus: prev.decisionStatus === "resolved" ? "idle" : prev.decisionStatus,
      collaborationStatus: prev.collaborationStatus === "resolved" ? "idle" : prev.collaborationStatus,
    }));
    decisionStatusRef.current = decisionStatusRef.current === "resolved" ? "idle" : decisionStatusRef.current;
    collaborationStatusRef.current = collaborationStatusRef.current === "resolved" ? "idle" : collaborationStatusRef.current;
  };

  const handleExportPDF = () => {
    exportMissionReport(simState.eventHistory, simState.decisionHistory, simState.missionScore, mode, simState.humanOverrideLog);
  };

  const handleInjectJudgeScenario = (scenario: JudgeScenarioType) => {
    const metString = formatMET(simState.elapsedSeconds);
    pendingJudgeEventRef.current = injectJudgeScenario(scenario, metString);
    eventCountdownRef.current = 0; // Trigger immediately
    if (!isRunning) handleStart();
  };

  // Phase 7: Pause simulation in manual mode when twin predictions resolve
  useEffect(() => {
    if (
      simState.digitalTwinStatus === "resolved" &&
      aiConfig.decisionMode === "manual" &&
      !simState.twinCommanderVerdict &&
      !isPaused &&
      isRunning
    ) {
      setIsPaused(true);
      setActiveLogs((prev) => [
        ...prev,
        {
          id: `twin-pause-${Date.now()}`,
          timestamp: "SYSTEM",
          text: "DIGITAL TWIN: Sim paused for operator review. Authorize or Reject recommended action to proceed.",
          type: "warning" as const,
          progressTrigger: -1,
        },
      ]);
    }
  }, [simState.digitalTwinStatus, aiConfig.decisionMode, simState.twinCommanderVerdict, isPaused, isRunning]);

  // MARM: ref for passing queue items out of setSimState closure
  const pendingMarmQueueItemRef = React.useRef<AnomalyQueueItem | null>(null);

  // HGACS: Safety hold timer — only counts down if safetyWindow > 0.
  // On expiry: ALWAYS holds (never auto-approves). Human must decide.
  useEffect(() => {
    const hasPending = simState.anomalyQueue.some((a) => a.status === "Pending");
    // If no pending items, clear timer
    if (!hasPending || safetyWindow === "0") {
      if (safetyTimerRef.current) { clearInterval(safetyTimerRef.current); safetyTimerRef.current = null; }
      if (!hasPending) setTimeLeft(null);
      return;
    }
    // If timer already running, don't restart
    if (safetyTimerRef.current) return;
    const totalSecs = parseInt(safetyWindow, 10) || 0;
    if (totalSecs === 0) return; // ∞ hold — no countdown needed
    setTimeLeft(totalSecs);
    safetyTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (safetyTimerRef.current) { clearInterval(safetyTimerRef.current); safetyTimerRef.current = null; }
          // HGACS RULE: ALWAYS hold — no auto-approve, ever
          setActiveLogs((prev) => [...prev, {
            id: `hgacs-hold-${Date.now()}`,
            timestamp: "SYSTEM",
            text: `🛡️ HGACS: Hold window elapsed. Simulation remains FROZEN. Human authorization still required.`,
            type: "warning" as const,
            progressTrigger: -1,
          }]);
          setTimeLeft(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (safetyTimerRef.current) { clearInterval(safetyTimerRef.current); safetyTimerRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simState.anomalyQueue, safetyWindow]);

  // MARM: resolve an anomaly (approve / reject / alternative / override)
  const handleResolveAnomaly = (
    actionName: string,
    userDecision: "approved" | "rejected" | "alternative" | "override",
    justification: string
  ) => {
    setSimState((prev) => {
      const pendingItem = prev.anomalyQueue.find((a) => a.status === "Pending");
      if (!pendingItem) return prev;

      const selectedSim = prev.digitalTwinPredictions.find(
        (p) => p.actionName.toLowerCase() === actionName.toLowerCase()
      ) ?? prev.digitalTwinPredictions[0];

      let nextState = { ...prev };

      if (selectedSim) {
        // Evaluate objectives
        const { objectives: newObjs, bonusEarned: objBonus } = evaluateObjectives(
          prev.objectives,
          selectedSim.resultingState.missionProgress,
          selectedSim.actionName,
          pendingItem.event.title,
          pendingItem.event.severity,
          prev.bootComplete
        );
        let finalSuccess = selectedSim.successProbability;
        if (objBonus > 0) finalSuccess = Math.min(100, finalSuccess + objBonus);

        if (selectedSim.actionName === "Use Backup Antenna" || selectedSim.actionName === "Enter Safe Mode") {
          commsOfflineRemainingRef.current = 0;
        }

        // Metric highlights
        const highlights: Record<string, boolean> = {};
        if (selectedSim.fuelDelta !== 0) highlights.fuel = true;
        if (selectedSim.powerDelta !== 0) highlights.power = true;
        if (selectedSim.oxygenDelta !== 0) highlights.oxygen = true;
        if (selectedSim.healthDelta !== 0) highlights.health = true;
        if (selectedSim.progressDelta !== 0) highlights.missionProgress = true;
        setHighlightedMetrics(highlights);
        setTimeout(() => setHighlightedMetrics({}), 2500);

        // Phase 8 scoring
        const ts = `MET ${formatMET(prev.elapsedSeconds)}`;
        const dqRecord = evaluateDecisionQuality(
          pendingItem.event.title,
          selectedSim.actionName,
          selectedSim.successProbability,
          finalSuccess,
          userDecision === "rejected" ? "rejected" : "approved",
          ts
        );
        const snap = recordMissionEvent(
          pendingItem.event,
          selectedSim.actionName,
          prev.missionScore.overall,
          selectedSim.successProbability,
          ts
        );
        recordOutcome({
          eventId: pendingItem.event.id,
          eventTitle: pendingItem.event.title,
          selectedAction: selectedSim.actionName,
          successImpact: finalSuccess - prev.successProbability,
          healthDelta: selectedSim.healthDelta,
          timestamp: ts
        });

        nextState = {
          ...nextState,
          spacecraft: selectedSim.resultingState,
          crew: selectedSim.resultingCrew,
          successProbability: finalSuccess,
          objectives: newObjs,
          twinCommanderVerdict: userDecision === "rejected" ? "rejected" : "approved",
          decisionQualityLog: [dqRecord, ...prev.decisionQualityLog].slice(0, 50),
          performanceHistory: [snap, ...prev.performanceHistory].slice(0, 30),
        };
      }

      // Build HumanOverrideRecord
      const overrideRecord: HumanOverrideRecord = {
        timestamp: `MET ${formatMET(prev.elapsedSeconds)}`,
        anomalyId: pendingItem.id,
        anomalyTitle: pendingItem.event.title,
        userDecision,
        selectedAction: actionName,
        justification,
        finalOutcome: selectedSim
          ? `Success prob: ${selectedSim.successProbability}%`
          : "Fallback executed.",
      };

      // Log
      setActiveLogs((prevLogs) => [...prevLogs, {
        id: `marm-resolve-${Date.now()}`,
        timestamp: `MET ${formatMET(prev.elapsedSeconds)}`,
        text: `MARM [${userDecision.toUpperCase()}]: Operator executed "${actionName}" for "${pendingItem.event.title}". ${justification ? `Note: ${justification}` : ""}`,
        type: userDecision === "rejected" ? "danger" as const : "success" as const,
        progressTrigger: -1,
      }]);

      return {
        ...nextState,
        anomalyQueue: nextState.anomalyQueue.map((a) =>
          a.id === pendingItem.id
            ? { ...a, status: "Approved" as const, selectedAction: actionName, userDecision, justification }
            : a
        ),
        humanOverrideLog: [overrideRecord, ...nextState.humanOverrideLog],
      };
    });

    // Clear timer and resume simulation
    if (safetyTimerRef.current) { clearInterval(safetyTimerRef.current); safetyTimerRef.current = null; }
    setTimeLeft(null);
    setIsPaused(false);
  };

  // HGACS: keep the stable ref in sync with the live handler
  resolveAnomalyRef.current = handleResolveAnomaly;

  const handleRerunSimulations = (anomalyId: string, depth: number) => {
    setSimState((prev) => {
      const activeAnomaly = prev.anomalyQueue.find((a) => a.id === anomalyId);
      if (!activeAnomaly) return prev;

      // Apply slight random adjustments to predictions to simulate Monte Carlo variance
      const newPredictions = activeAnomaly.digitalTwinPredictions.map((pred) => {
        const variance = (Math.random() * 6 - 3); // -3% to +3%
        return {
          ...pred,
          successProbability: Math.max(0, Math.min(100, pred.successProbability + variance))
        };
      });

      const nextQueue = prev.anomalyQueue.map((item) => {
        if (item.id === anomalyId) {
          const runs = (item.runsSimulated || 0) + depth;
          const newAuditEntry = {
            timestamp: `MET ${formatMET(prev.elapsedSeconds)}`,
            actor: "System",
            action: "Simulations Rerun",
            detail: `Monte Carlo simulations rerun at depth ${depth}. Runs simulated: ${runs}.`
          };
          return {
            ...item,
            digitalTwinPredictions: newPredictions,
            runsSimulated: runs,
            auditLog: [...(item.auditLog || []), newAuditEntry]
          };
        }
        return item;
      });

      return {
        ...prev,
        anomalyQueue: nextQueue
      };
    });

    // Add logs to show rerun success
    setActiveLogs((prevLogs) => [
      ...prevLogs,
      {
        id: `sim-rerun-${Date.now()}`,
        timestamp: `MET ${formatMET(simState.elapsedSeconds)}`,
        text: `🛡️ HGACS: Monte Carlo simulations rerun completed for "${simState.anomalyQueue.find(a => a.id === anomalyId)?.event.title || "anomaly"}" at depth ${depth}.`,
        type: "info" as const,
        progressTrigger: -1,
      }
    ]);
  };

  const handleApproveTwinDecision = () => {

    setSimState((prev) => {
      if (!prev.twinCommanderDecision) return prev;
      const selectedSim = prev.digitalTwinPredictions.find(
        (p) => p.actionName.toLowerCase() === prev.twinCommanderDecision!.finalAction.toLowerCase()
      );
      if (!selectedSim) return prev;

      // Update objectives on approval
      const currentEvent = prev.activeEvent;
      const { objectives: newObjs, bonusEarned: objBonus } = evaluateObjectives(
        prev.objectives,
        selectedSim.resultingState.missionProgress,
        selectedSim.actionName,
        currentEvent?.title ?? "",
        currentEvent?.severity ?? "Low",
        prev.bootComplete
      );

      let finalSuccess = selectedSim.successProbability;
      if (objBonus > 0) {
        finalSuccess = Math.min(100, finalSuccess + objBonus);
      }

      if (selectedSim.actionName === "Use Backup Antenna" || selectedSim.actionName === "Enter Safe Mode") {
        commsOfflineRemainingRef.current = 0;
      }

      // Highlight outcome metrics based on deltas
      const highlights: Record<string, boolean> = {};
      if (selectedSim.fuelDelta !== 0) highlights.fuel = true;
      if (selectedSim.powerDelta !== 0) highlights.power = true;
      if (selectedSim.oxygenDelta !== 0) highlights.oxygen = true;
      if (selectedSim.healthDelta !== 0) highlights.health = true;
      if (selectedSim.progressDelta !== 0) highlights.missionProgress = true;
      setHighlightedMetrics(highlights);
      setTimeout(() => setHighlightedMetrics({}), 2500);

      // Add logs
      if (objBonus > 0) {
        setActiveLogs(prevLogs => [
          ...prevLogs,
          {
            id: `obj-log-${Date.now()}`,
            timestamp: `MET ${formatMET(prev.elapsedSeconds)}`,
            text: `OBJECTIVE COMPLETE: Mission objective achieved (+${objBonus}% Success Integrity)`,
            type: "success" as const,
            progressTrigger: -1,
          },
          {
            id: `dec-log-${Date.now()}`,
            timestamp: `MET ${formatMET(prev.elapsedSeconds)}`,
            text: `COMMANDER (APPROVED): "${selectedSim.actionName}" committed to main systems. (Simulated Success: ${selectedSim.successProbability}%)`,
            type: "success" as const,
            progressTrigger: -1,
          }
        ]);
      } else {
        setActiveLogs(prevLogs => [
          ...prevLogs,
          {
            id: `dec-log-${Date.now()}`,
            timestamp: `MET ${formatMET(prev.elapsedSeconds)}`,
            text: `COMMANDER (APPROVED): "${selectedSim.actionName}" committed to main systems. (Simulated Success: ${selectedSim.successProbability}%)`,
            type: "success" as const,
            progressTrigger: -1,
          }
        ]);
      }

      // Update active decision record outcome
      const updatedDecisionHistory = prev.decisionHistory.map((d, idx) => {
        if (idx === 0) {
          return { ...d, outcome: `Commander approved: ${selectedSim.benefits}` };
        }
        return d;
      });

      // Phase 8: Record decision quality + performance snapshot (manual approved)
      const approveTimestamp = `MET ${formatMET(prev.elapsedSeconds)}`;
      const dqApprove = evaluateDecisionQuality(
        prev.activeEvent?.title ?? "Unknown Event",
        selectedSim.actionName,
        selectedSim.successProbability,
        finalSuccess,
        "approved",
        approveTimestamp
      );
      const snapApprove = recordMissionEvent(
        prev.activeEvent ?? { id: "evt", title: "Unknown Event", severity: "Low", description: "", appliedEffects: {}, timestamp: approveTimestamp },
        selectedSim.actionName,
        prev.missionScore.overall,
        selectedSim.successProbability,
        approveTimestamp
      );

      recordOutcome({
        eventId: prev.activeEvent?.id ?? "evt",
        eventTitle: prev.activeEvent?.title ?? "Unknown Event",
        selectedAction: selectedSim.actionName,
        successImpact: finalSuccess - prev.successProbability,
        healthDelta: selectedSim.healthDelta,
        timestamp: approveTimestamp
      });

      return {
        ...prev,
        spacecraft: selectedSim.resultingState,
        crew: selectedSim.resultingCrew,
        successProbability: finalSuccess,
        objectives: newObjs,
        decisionHistory: updatedDecisionHistory,
        twinCommanderVerdict: "approved",
        // Phase 8
        decisionQualityLog: [dqApprove, ...prev.decisionQualityLog].slice(0, 50),
        performanceHistory: [snapApprove, ...prev.performanceHistory].slice(0, 30),
      };
    });
    setIsPaused(false);
  };

  const handleRejectTwinDecision = () => {
    setSimState((prev) => {
      // Rejection defaults to fallback "Ignore" outcome
      const fallbackSim = prev.digitalTwinPredictions.find(
        (p) => p.actionName === "Ignore" || p.actionName === "Continue Mission" || p.actionName === "Continue Operations"
      ) || prev.digitalTwinPredictions[0];

      if (!fallbackSim) return prev;

      const currentEvent = prev.activeEvent;
      const { objectives: newObjs, bonusEarned: objBonus } = evaluateObjectives(
        prev.objectives,
        fallbackSim.resultingState.missionProgress,
        fallbackSim.actionName,
        currentEvent?.title ?? "",
        currentEvent?.severity ?? "Low",
        prev.bootComplete
      );

      let finalSuccess = fallbackSim.successProbability;
      if (objBonus > 0) {
        finalSuccess = Math.min(100, finalSuccess + objBonus);
      }

      setActiveLogs(prevLogs => [
        ...prevLogs,
        {
          id: `dec-log-${Date.now()}`,
          timestamp: `MET ${formatMET(prev.elapsedSeconds)}`,
          text: `COMMANDER (REJECTED): Operator overrode recommendation. Defaulting to fallback: "${fallbackSim.actionName}" (Success Prob: ${fallbackSim.successProbability}%)`,
          type: "danger" as const,
          progressTrigger: -1,
        }
      ]);

      // Update active decision record outcome
      const updatedDecisionHistory = prev.decisionHistory.map((d, idx) => {
        if (idx === 0) {
          return { ...d, outcome: `Commander rejected recommendation. Fallback executed.` };
        }
        return d;
      });

      // Phase 8: Record decision quality + performance snapshot (manual rejected)
      const rejectTimestamp = `MET ${formatMET(prev.elapsedSeconds)}`;
      const dqReject = evaluateDecisionQuality(
        currentEvent?.title ?? "Unknown Event",
        fallbackSim.actionName,
        fallbackSim.successProbability,
        finalSuccess,
        "rejected",
        rejectTimestamp
      );
      const snapReject = recordMissionEvent(
        currentEvent ?? { id: "evt", title: "Unknown Event", severity: "Low", description: "", appliedEffects: {}, timestamp: rejectTimestamp },
        fallbackSim.actionName,
        prev.missionScore.overall,
        fallbackSim.successProbability,
        rejectTimestamp
      );

      return {
        ...prev,
        spacecraft: fallbackSim.resultingState,
        crew: fallbackSim.resultingCrew,
        successProbability: finalSuccess,
        objectives: newObjs,
        decisionHistory: updatedDecisionHistory,
        twinCommanderVerdict: "rejected",
        // Phase 8
        decisionQualityLog: [dqReject, ...prev.decisionQualityLog].slice(0, 50),
        performanceHistory: [snapReject, ...prev.performanceHistory].slice(0, 30),
      };
    });
    setIsPaused(false);
  };

  const getSystemStatus = () => {
    if (!isRunning && simState.elapsedSeconds === 0) return "STANDBY";
    if (simState.successProbability === 0) return "CRITICAL";
    if (simState.spacecraft.health <= 35) return "CRITICAL";
    if (simState.spacecraft.fuel <= 20 || simState.spacecraft.power <= 20 || simState.spacecraft.oxygen <= 20) return "WARNING";
    return "NOMINAL";
  };

  const getMetricStatus = (key: keyof SpacecraftState) => {
    const val = simState.spacecraft[key];
    if (key === "health" && typeof val === "number") {
      if (val > 60) return "nominal";
      if (val > 25) return "warning";
      return "critical";
    }
    if ((key === "fuel" || key === "power" || key === "oxygen") && typeof val === "number") {
      if (val > 30) return "nominal";
      if (val > 10) return "warning";
      return "critical";
    }
    if (key === "communication") return val ? "active" : "critical";
    if (key === "missionProgress" && typeof val === "number") {
      if (val === 100) return "nominal";
      return isRunning && !isPaused ? "active" : "inactive";
    }
    return "info";
  };

  const systemStatus = getSystemStatus();
  const currentPhase = getMissionPhase(simState.spacecraft.missionProgress);

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 py-6 md:py-8 min-h-screen flex flex-col gap-6 text-slate-100 select-none ${viewMode === "technical" ? "scanlines" : "mc-dot-grid"}`}>
      {/* Floating toggle button for Dashboard views */}
      {viewMode !== "demo" && (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          {/* MARM toggle */}
          <button
            id="marm-toggle-btn"
            onClick={() => setMarmOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-orbitron font-extrabold text-[9px] uppercase tracking-wider rounded-lg shadow-lg transition-all border cursor-pointer
              ${aiConfig.decisionMode === "manual"
                ? simState.anomalyQueue.some((a) => a.status === "Pending")
                  ? "bg-red-500 text-white border-red-500/60 shadow-red-500/40 animate-pulse"
                  : "bg-red-900/60 text-red-300 border-red-500/40 shadow-red-500/20"
                : "bg-slate-800 text-slate-400 border-slate-700 shadow-slate-900/20 hover:text-slate-200 hover:border-slate-600"
              }`}
            title="Open MARM – Manual Anomaly Response Mode"
          >
            🚨 {aiConfig.decisionMode === "manual" && simState.anomalyQueue.some((a) => a.status === "Pending")
              ? `MARM (${simState.anomalyQueue.filter((a) => a.status === "Pending").length})`
              : "MARM"}
          </button>
          <button
            onClick={() => setViewMode("demo")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 font-orbitron font-extrabold text-[9px] uppercase tracking-wider rounded-lg shadow-lg shadow-amber-500/30 hover:bg-amber-400 transition-all border border-amber-500/40 cursor-pointer"
          >
            🚀 Launch Demo Mode
          </button>
          <button
            onClick={() => setViewMode(viewMode === "technical" ? "control" : "technical")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-tau-teal text-slate-950 font-orbitron font-extrabold text-[9px] uppercase tracking-wider rounded-lg shadow-lg shadow-tau-teal/30 hover:bg-tau-teal/90 transition-all border border-tau-teal/40 cursor-pointer"
          >
            ⇄ {viewMode === "technical" ? "Mission Control View" : "Technical View"}
          </button>
        </div>
      )}

      {/* HGACS – Human-Governed Anomaly Command System overlay */}
      {marmOpen && (
        <AnomalyCommandCenter
          anomalyQueue={simState.anomalyQueue}
          humanOverrideLog={simState.humanOverrideLog}
          safetyWindow={safetyWindow}
          timerFallback={timerFallback}
          timeLeft={timeLeft}
          onResolveAnomaly={handleResolveAnomaly}
          onChangeSafetyWindow={setSafetyWindow}
          onChangeTimerFallback={() => {/* HGACS: timerFallback always "wait" */}}
          onClose={() => setMarmOpen(false)}
          activeStep={marmActiveStep}
          onChangeActiveStep={setMarmActiveStep}
          onRerunSimulations={handleRerunSimulations}
        />
      )}

      {/* Phase 6 – AI Settings Modal */}
      <AISettings
        isOpen={aiSettingsOpen}
        onClose={() => setAiSettingsOpen(false)}
        onSave={(config) => setAiConfig(config)}
        currentConfig={aiConfig}
      />

      <JudgePanel
        isOpen={judgePanelOpen}
        onClose={() => setJudgePanelOpen(false)}
        onInjectScenario={handleInjectJudgeScenario}
      />

      {missionReplayOpen && (
        <MissionReplay
          events={simState.eventHistory}
          decisions={simState.decisionHistory}
          onClose={() => setMissionReplayOpen(false)}
        />
      )}

      {whatIfExplorerOpen && (
        <WhatIfExplorer 
          currentState={simState.spacecraft} 
          onClose={() => setWhatIfExplorerOpen(false)} 
        />
      )}

      {knowledgeGraphOpen && (
        <KnowledgeGraph 
          onClose={() => setKnowledgeGraphOpen(false)} 
        />
      )}

      {commandCenter3DOpen && (
        <CommandCenter3D
          state={simState.spacecraft}
          onClose={() => setCommandCenter3DOpen(false)}
        />
      )}

      {analyticsOpen && (
        <AdvancedAnalytics onClose={() => setAnalyticsOpen(false)} />
      )}

      {voiceMemoryOpen && (
        <MissionVoiceCenter
          recordings={voiceMemory.recordings}
          isListening={isListening}
          onToggleListen={toggleListening}
          onDeleteRecording={voiceMemory.deleteRecording}
          onGetAudioURL={voiceMemory.getAudioURL}
          onSearch={voiceMemory.searchRecordings}
          onClose={() => setVoiceMemoryOpen(false)}
          missionId={voiceMemory.missionId}
        />
      )}

      <ConversationalPanel
        messages={cmi.messages}
        orbState={cmi.orbState}
        voiceMode={cmi.voiceMode}
        currentTranscript={cmi.currentTranscript}
        micVolume={cmi.micVolume}
        sendMessage={cmi.sendMessage}
        toggleVoiceMode={cmi.toggleVoiceMode}
        startPTTListening={cmi.startPTTListening}
        stopPTTListening={cmi.stopPTTListening}
        clearChatHistory={cmi.clearChatHistory}
        onClose={() => setCmiOpen(false)}
        isOpen={cmiOpen}
      />

      {viewMode === "demo" ? (
        <HackathonDemoView
          spacecraft={simState.spacecraft}
          activeEvent={simState.activeEvent}
          elapsedSeconds={simState.elapsedSeconds}
          isRunning={isRunning}
          isPaused={isPaused}
          systemStatus={systemStatus}
          successProbability={simState.successProbability}
          missionScore={simState.missionScore}
          decisionQualityLog={simState.decisionQualityLog}
          performanceHistory={simState.performanceHistory}
          scoringAlerts={simState.scoringAlerts}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onToggleView={() => setViewMode("control")}
        />
      ) : viewMode === "control" ? (
        <MissionControlView
          spacecraft={simState.spacecraft}
          activeEvent={simState.activeEvent}
          eventHistory={simState.eventHistory}
          activeDecision={simState.activeDecision}
          decisionHistory={simState.decisionHistory}
          decisionStatus={simState.decisionStatus}
          successProbability={simState.successProbability}
          elapsedSeconds={simState.elapsedSeconds}
          isRunning={isRunning}
          isPaused={isPaused}
          systemStatus={systemStatus}
          activeCollaboration={simState.activeCollaboration}
          collaborationStatus={simState.collaborationStatus}
          crew={simState.crew}
          objectives={simState.objectives}
          discussionHistory={simState.discussionHistory}
          digitalTwinPredictions={simState.digitalTwinPredictions}
          digitalTwinStatus={simState.digitalTwinStatus}
          twinCommanderDecision={simState.twinCommanderDecision}
          twinCommanderVerdict={simState.twinCommanderVerdict}
          missionScore={simState.missionScore}
          decisionQualityLog={simState.decisionQualityLog}
          performanceHistory={simState.performanceHistory}
          scoringAlerts={simState.scoringAlerts}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onApproveTwin={handleApproveTwinDecision}
          onRejectTwin={handleRejectTwinDecision}
          highlightedMetrics={highlightedMetrics}
          decisionMode={aiConfig.decisionMode}
          viewMode={viewMode}
          onToggleView={() => setViewMode("technical")}
        />
      ) : (
        <>
          {/* Visual top decor */}
          <div className="hidden lg:flex items-center justify-between text-[10px] font-mono text-tau-teal/40 uppercase tracking-widest mb-1">
            <span>Expedition: HM-01 // Destination: Tau Ceti (12.0 Light Years)</span>
            <span>A.I. Autopilot Mode: Mission Intelligence Active — Phase 8</span>
          </div>

          {/* Header + Success Gauge + Space Weather */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3 flex flex-col gap-4">
              <Header 
                elapsedSeconds={simState.elapsedSeconds} 
                systemStatus={systemStatus} 
                mode={mode}
                onToggleMode={() => setMode(prev => prev === "space" ? "earth" : "space")}
                onToggleJudgeMode={() => setJudgePanelOpen(true)}
                isVoiceActive={isListening}
                onToggleVoice={toggleListening}
                onExportReport={handleExportPDF}
                onToggleReplay={() => setMissionReplayOpen(true)}
                onToggleWhatIf={() => setWhatIfExplorerOpen(true)}
                onToggleKnowledgeGraph={() => setKnowledgeGraphOpen(true)}
                onToggle3D={() => setCommandCenter3DOpen(true)}
                onToggleAnalytics={() => setAnalyticsOpen(true)}
                onToggleVoiceCenter={() => setVoiceMemoryOpen(true)}
                voiceRecordingCount={voiceMemory.recordings.length}
                onToggleCMI={() => setCmiOpen(prev => !prev)}
                isCMIOpen={cmiOpen}
              />
              <SpaceWeatherWidget weather={spaceWeather} />
            </div>
            <div className="md:col-span-1">
              <SuccessProbability score={simState.successProbability} />
            </div>
          </div>

          {/* Main Grid: left 3/4, right 1/4 */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* ─── Left: main content ─── */}
            <div className="lg:col-span-3 flex flex-col gap-6">

              {/* 3D Spacecraft Digital Twin */}
              <div className={`w-full h-[400px] transition-all duration-500 rounded-lg ${highlightedSections["3d"] ? "border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] p-1 bg-cyan-950/10" : ""}`}>
                <SpacecraftViewer 
                  spacecraft={simState.spacecraft} 
                  activeEventSeverity={simState.activeEvent?.severity} 
                />
              </div>

              {/* Telemetry Cards */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xs font-mono font-bold text-tau-teal tracking-widest uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-tau-teal rounded-sm" /> Spacecraft Live Telemetry
                  </h2>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Updates: 1Hz</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <MetricCard label="Fuel Reserve" value={simState.spacecraft.fuel} unit="%" icon={<Droplet className="h-4 w-4" />} status={getMetricStatus("fuel")} highlighted={highlightedMetrics.fuel} />
                  <MetricCard label="Core Power" value={simState.spacecraft.power} unit="%" icon={<Zap className="h-4 w-4" />} status={getMetricStatus("power")} highlighted={highlightedMetrics.power} />
                  <MetricCard label="Cabin Oxygen" value={simState.spacecraft.oxygen} unit="%" icon={<Wind className="h-4 w-4" />} status={getMetricStatus("oxygen")} highlighted={highlightedMetrics.oxygen} />
                  <MetricCard label="Cabin Temp" value={simState.spacecraft.temperature} unit="°C" icon={<Thermometer className="h-4 w-4" />} status="info" highlighted={highlightedMetrics.temperature} />
                  <MetricCard label="Hull Integrity" value={simState.spacecraft.health} unit="%" icon={<Activity className="h-4 w-4" />} status={getMetricStatus("health")} highlighted={highlightedMetrics.health} />
                  <MetricCard label="Comms Network" value={simState.spacecraft.communication ? "ONLINE" : "SIGNAL LOSS"} icon={<Radio className="h-4 w-4" />} status={getMetricStatus("communication")} highlighted={highlightedMetrics.communication} />
                  <MetricCard label="Coordinates" value={simState.spacecraft.position.split(" ")[0]} unit={simState.spacecraft.position.split(" ").slice(1).join(" ")} icon={<MapPin className="h-4 w-4" />} status="info" className="col-span-1 sm:col-span-1" highlighted={highlightedMetrics.position} />
                  <MetricCard label="Velocity" value={simState.spacecraft.velocity >= 1000 ? (simState.spacecraft.velocity / 1000).toFixed(1) : simState.spacecraft.velocity} unit={simState.spacecraft.velocity >= 1000 ? "x10³ km/s" : "km/s"} icon={<Gauge className="h-4 w-4" />} status="info" highlighted={highlightedMetrics.velocity} />
                  <MetricCard label="Mission Progress" value={simState.spacecraft.missionProgress.toFixed(0)} unit="%" icon={<Milestone className="h-4 w-4" />} status={getMetricStatus("missionProgress")} highlighted={highlightedMetrics.missionProgress} />
                </div>
              </div>

              {/* Phase 5 – Crew Status */}
              <div className={`transition-all duration-500 rounded-lg ${highlightedSections.crew ? "border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] p-1 bg-cyan-950/10" : ""}`}>
                <CrewPanel crew={simState.crew} />
              </div>

              {/* Phase 4 – Agent Collaboration */}
              <div className={`transition-all duration-500 rounded-lg ${highlightedSections.agents ? "border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] p-1 bg-cyan-950/10" : ""}`}>
                <AgentPanel collaboration={simState.activeCollaboration} status={simState.collaborationStatus} />
              </div>

              {/* Phase 5 – Mission Discussion Feed */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-mono font-bold text-tau-teal tracking-widest uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-tau-teal rounded-full" /> Mission Discussion Feed
                  </h3>
                </div>
                <DiscussionFeed
                  session={simState.activeCollaboration?.discussionSession ?? null}
                  status={simState.collaborationStatus}
                />
              </div>

              {/* Phase 6 – Mission Intelligence (LLM Reasoning Layer) */}
              <div className={`transition-all duration-500 rounded-lg ${highlightedSections.intelligence ? "border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] p-1 bg-cyan-950/10" : ""}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-mono font-bold text-tau-teal tracking-widest uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-tau-teal rounded-full" /> Mission Intelligence
                  </h3>
                </div>
                <MissionIntelligence
                  aiStatus={aiHook.aiStatus}
                  currentAnalysis={aiHook.currentAnalysis}
                  pendingAnalysis={aiHook.pendingAnalysis}
                  decisionMode={aiConfig.decisionMode}
                  onApprove={() => aiHook.approveAnalysis()}
                  onReject={() => aiHook.rejectAnalysis()}
                  onOpenSettings={() => setAiSettingsOpen(true)}
                />
              </div>

              {/* Phase 7 – Digital Twin Simulation Engine */}
              <div className={`transition-all duration-500 rounded-lg ${highlightedSections.twin ? "border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] p-1 bg-cyan-950/10" : ""}`}>
                <DigitalTwinPanel
                  predictions={simState.digitalTwinPredictions}
                  status={simState.digitalTwinStatus}
                  commanderDecision={simState.twinCommanderDecision}
                  decisionMode={aiConfig.decisionMode}
                  onApprove={handleApproveTwinDecision}
                  onReject={handleRejectTwinDecision}
                  commanderVerdict={simState.twinCommanderVerdict}
                />
              </div>

              {/* Phase 8 – Mission Intelligence & Scoring System */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-tau-teal tracking-widest uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-tau-teal rounded-full animate-pulse" /> Mission Performance Intelligence
                  </h3>
                  <span className="text-[9px] font-mono text-slate-600 uppercase">Phase 8</span>
                </div>
                {/* Score card: full width */}
                <MissionScoreCard
                  score={simState.missionScore}
                  alerts={simState.scoringAlerts}
                />
                {/* Two-column: decision analysis + performance history */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="min-h-[320px]">
                    <DecisionAnalysis records={simState.decisionQualityLog} />
                  </div>
                  <div className="min-h-[320px]">
                    <PerformanceHistory snapshots={simState.performanceHistory} />
                  </div>
                </div>
              </div>

              {/* Trajectory Navigation Map */}
              <div className={`w-full transition-all duration-500 rounded-lg ${highlightedSections.navigation ? "border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] p-1 bg-cyan-950/10" : ""}`}>
                <NavigationMap progress={simState.spacecraft.missionProgress} position={simState.spacecraft.position} communicationDelay={currentPhase.communicationDelay} />
              </div>
            </div>

            {/* ─── Right: sidebar ─── */}
            <div className="lg:col-span-1 flex flex-col gap-6">

              {/* Controls */}
              <ControlPanel
                isRunning={isRunning} isPaused={isPaused}
                isCompleted={simState.spacecraft.missionProgress === 100 || simState.successProbability === 0}
                onStart={handleStart} onPause={handlePause} onReset={handleReset}
              />

              {/* Active Alerts */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-mono font-bold text-tau-teal tracking-widest uppercase">Active Alerts</h3>
                </div>
                <EventAlert activeEvent={simState.activeEvent} onDismiss={handleDismissAlert} />
              </div>

              {/* Phase 12 - ARE Forecast */}
              <AREPanel forecasts={generateAREForecast(simState.spacecraft)} />

              {/* Phase 5 – Mission Objectives */}
              <div className={`transition-all duration-500 rounded-lg ${highlightedSections.objectives ? "border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] p-1 bg-cyan-950/10" : ""}`}>
                <MissionObjectives objectives={simState.objectives} />
              </div>

              {/* Resource Bars */}
              <div className="glass-panel p-5 rounded-lg border border-tau-teal/15 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tau-teal/40" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tau-teal/40" />
                <h3 className="text-xs font-orbitron font-bold text-white tracking-widest uppercase border-b border-tau-teal/10 pb-2 mb-2">
                  Resource Levels
                </h3>
                <ProgressBar label="Fuel Reserve" value={simState.spacecraft.fuel} colorType="fuel" />
                <ProgressBar label="Reactor Power" value={simState.spacecraft.power} colorType="power" />
                <ProgressBar label="Cabin Oxygen" value={simState.spacecraft.oxygen} colorType="oxygen" />
                <ProgressBar label="Structural Integrity" value={simState.spacecraft.health} colorType="health" />
                <ProgressBar label="Mission Progress" value={simState.spacecraft.missionProgress} colorType="progress" />
              </div>
            </div>
          </div>

          {/* Bottom row: 4 history/log panels */}
          <div className="w-full mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Alert History */}
              <div><EventHistory history={simState.eventHistory} /></div>

              {/* Phase 5 – Discussion Session History */}
              <div><DiscussionHistory history={simState.discussionHistory} /></div>

              {/* Phase 6 – AI Reasoning Log */}
              <div><ReasoningHistory history={aiHook.analysisHistory} /></div>

              {/* Telemetry Console */}
              <div className="glass-panel p-4 rounded-lg border border-tau-teal/15 flex flex-col h-[280px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tau-teal/40" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-tau-teal/40" />
                <div className="flex justify-between items-center mb-3 border-b border-tau-teal/10 pb-2.5">
                  <h3 className="text-xs font-orbitron font-bold text-white tracking-widest uppercase flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-tau-teal animate-pulse" />
                    Telemetry Logs
                  </h3>
                  <span className="text-[10px] font-mono text-tau-teal/60">HM_OS v8.0.0</span>
                </div>
                <div ref={logsContainerRef} className="flex-1 overflow-y-auto font-mono text-[11px] leading-5 space-y-1.5 pr-2 select-text">
                  {activeLogs.map((log) => {
                    const color = log.type === "success" ? "text-cyber-green font-semibold"
                      : log.type === "warning" ? "text-astrophage"
                      : log.type === "danger" ? "text-cyber-red glow-red font-bold"
                      : "text-tau-teal";
                    return (
                      <div key={log.id} className="flex items-start gap-2 border-b border-slate-900 pb-1 hover:bg-tau-teal/5 rounded px-1 transition-colors">
                        <span className="text-slate-500 shrink-0 font-medium">{log.timestamp}</span>
                        <span className="text-slate-400 shrink-0 select-none">&gt;</span>
                        <span className={`${color} flex-1`}>{log.text}</span>
                      </div>
                    );
                  })}
                  {isRunning && !isPaused && (
                    <div className="flex items-center gap-2 animate-pulse">
                      <span className="text-slate-600 shrink-0">MET LINK</span>
                      <span className="text-slate-600 shrink-0 select-none">&gt;</span>
                      <span className="text-tau-teal/60 font-semibold uppercase tracking-wider text-[10px]">Phase 8 Mission Performance Intelligence active — scoring engine nominal...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <footer className="text-center font-mono text-[10px] text-slate-600 mt-4 pb-2 select-text">
            PROJECT HAIL MARY MISSION DATA BASE // CLASSIFIED INTEL // UNITED NATIONS SPACE PROGRAM
          </footer>
        </>
      )}
    </div>
  );
};
export default Dashboard;
