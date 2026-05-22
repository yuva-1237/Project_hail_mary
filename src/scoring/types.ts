/**
 * Phase 8 – Mission Intelligence & Scoring System
 * Core type definitions for the scoring engine.
 */

// ─── Individual metric scores (0–100 each) ────────────────────────────────────

export interface MetricScores {
  fuelEfficiency: number;
  powerEfficiency: number;
  oxygenManagement: number;
  safetyScore: number;
  resourceUtilization: number;
  scienceValue: number;
  decisionQuality: number;
  timeEfficiency: number;
  crewSurvivalProbability: number;
  overallSuccessProbability: number;
}

// ─── Weighted composite mission score ────────────────────────────────────────

export interface MissionScore {
  overall: number;                 // 0–100 weighted composite
  metrics: MetricScores;
  grade: "S" | "A" | "B" | "C" | "D" | "F";
  trend: "improving" | "stable" | "declining";
  previousOverall: number;         // for trend arrow
  lastUpdated: string;             // MET timestamp
}

// ─── Decision quality record ──────────────────────────────────────────────────

export interface DecisionQualityRecord {
  id: string;
  timestamp: string;               // MET format
  eventTitle: string;
  selectedAction: string;
  predictedSuccessProbability: number;
  actualSuccessProbability: number;
  decisionAccuracy: number;        // 100 - |predicted - actual|, clamped 0-100
  verdict: "approved" | "rejected" | "auto";
}

// ─── Performance timeline entry ───────────────────────────────────────────────

export interface PerformanceSnapshot {
  id: string;
  timestamp: string;               // MET format
  eventTitle: string;
  actionTaken: string;
  scoreBefore: number;
  scoreAfter: number;
  delta: number;                   // scoreAfter - scoreBefore
  severity: "Low" | "Medium" | "High" | "Critical";
}

// ─── Threshold alerts ─────────────────────────────────────────────────────────

export interface ScoringAlerts {
  lowSafety: boolean;              // safetyScore < 50
  lowFuel: boolean;                // fuelEfficiency < 30
  lowSuccess: boolean;             // overallSuccessProbability < 40
  criticalMode: boolean;           // any two alerts active simultaneously
}

// ─── Metric weight configuration ─────────────────────────────────────────────

export const METRIC_WEIGHTS = {
  safetyScore:              0.25,
  decisionQuality:          0.20,
  scienceValue:             0.15,
  fuelEfficiency:           0.15,
  resourceUtilization:      0.15,
  overallSuccessProbability: 0.10,
} as const;

// ─── Metric display metadata ──────────────────────────────────────────────────

export interface MetricDisplayConfig {
  key: keyof MetricScores;
  label: string;
  shortLabel: string;
  icon: string;
  weight: number;
  description: string;
}

export const METRIC_DISPLAY_CONFIG: MetricDisplayConfig[] = [
  {
    key: "safetyScore",
    label: "Safety Score",
    shortLabel: "Safety",
    icon: "🛡",
    weight: 25,
    description: "Hull integrity and crew health composite",
  },
  {
    key: "decisionQuality",
    label: "Decision Quality",
    shortLabel: "Decisions",
    icon: "🧠",
    weight: 20,
    description: "Accuracy of Commander agent decisions",
  },
  {
    key: "scienceValue",
    label: "Science Value",
    shortLabel: "Science",
    icon: "🔬",
    weight: 15,
    description: "Mission progress and data gathered",
  },
  {
    key: "fuelEfficiency",
    label: "Fuel Efficiency",
    shortLabel: "Fuel",
    icon: "⛽",
    weight: 15,
    description: "Current fuel reserve level",
  },
  {
    key: "resourceUtilization",
    label: "Resource Mgmt",
    shortLabel: "Resources",
    icon: "📊",
    weight: 15,
    description: "Average of all consumable resources",
  },
  {
    key: "overallSuccessProbability",
    label: "Success Probability",
    shortLabel: "Success",
    icon: "🎯",
    weight: 10,
    description: "Current mission success probability",
  },
];
