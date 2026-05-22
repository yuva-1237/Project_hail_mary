/**
 * Phase 9 – MissionControlView
 * Orchestrator layout for the NASA-inspired Mission Control dashboard.
 */
import React from "react";
import MCHeader from "./MCHeader";
import MCSpacecraftStatus from "./MCSpacecraftStatus";
import MCEventPanel from "./MCEventPanel";
import MCAgentComms from "./MCAgentComms";
import MCDigitalTwin from "./MCDigitalTwin";
import MCScores from "./MCScores";
import MCTimeline from "./MCTimeline";
import MCAlertCenter from "./MCAlertCenter";
import SpacecraftViewer from "../spacecraft/SpacecraftViewer";
import type { MissionControlProps } from "../../types/missionControl";

interface MissionControlViewProps extends MissionControlProps {
  highlightedMetrics: Record<string, boolean>;
  decisionMode: string;
  viewMode: "technical" | "control";
  onToggleView: () => void;
}

const MissionControlView: React.FC<MissionControlViewProps> = ({
  spacecraft,
  activeEvent,
  decisionStatus,
  successProbability,
  elapsedSeconds,
  isRunning,
  isPaused,
  systemStatus,
  activeCollaboration,
  collaborationStatus,
  digitalTwinPredictions,
  digitalTwinStatus,
  twinCommanderDecision,
  twinCommanderVerdict,
  missionScore,
  decisionQualityLog,
  performanceHistory,
  scoringAlerts,
  onStart,
  onPause,
  onReset,
  onApproveTwin,
  onRejectTwin,
  highlightedMetrics,
  decisionMode,
  viewMode,
  onToggleView,
}) => {
  return (
    <div className="w-full flex flex-col gap-6 relative min-h-screen">
      {/* Decorative background grid and ambient shadows */}
      <div className="absolute inset-0 pointer-events-none mc-dot-grid opacity-80" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-tau-teal/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-astrophage/3 rounded-full blur-[128px] pointer-events-none" />

      {/* Row 1: MCHeader (full width) */}
      <div className="w-full shrink-0 relative z-10">
        <MCHeader
          elapsedSeconds={elapsedSeconds}
          systemStatus={systemStatus}
          isRunning={isRunning}
          isPaused={isPaused}
          missionProgress={spacecraft.missionProgress}
          successProbability={successProbability}
          communication={spacecraft.communication}
          onStart={onStart}
          onPause={onPause}
          onReset={onReset}
          viewMode={viewMode}
          onToggleView={onToggleView}
        />
      </div>

      {/* Row 2: 3D Spacecraft Digital Twin (full width) */}
      <div className="w-full relative z-10 h-[400px]">
        <SpacecraftViewer 
          spacecraft={spacecraft} 
          activeEventSeverity={activeEvent?.severity} 
        />
      </div>

      {/* Row 3: MCSpacecraftStatus (full width) */}
      <div className="w-full relative z-10">
        <MCSpacecraftStatus
          spacecraft={spacecraft}
          highlighted={highlightedMetrics}
        />
      </div>

      {/* Main dashboard content area - Responsive grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-stretch">
        {/* Row 3 Col 1: Active Event Panel */}
        <div className="lg:col-span-4 min-h-[350px]">
          <MCEventPanel
            activeEvent={activeEvent}
            decisionStatus={decisionStatus}
            digitalTwinPredictions={digitalTwinPredictions}
            digitalTwinStatus={digitalTwinStatus}
            twinCommanderDecision={twinCommanderDecision}
          />
        </div>

        {/* Row 3 Col 2: Agent Communication Panel */}
        <div className="lg:col-span-4 min-h-[350px]">
          <MCAgentComms
            activeCollaboration={activeCollaboration}
            collaborationStatus={collaborationStatus}
          />
        </div>

        {/* Row 3 Col 3: Digital Twin Panel */}
        <div className="lg:col-span-4 min-h-[350px]">
          <MCDigitalTwin
            predictions={digitalTwinPredictions}
            status={digitalTwinStatus}
            commanderDecision={twinCommanderDecision}
            commanderVerdict={twinCommanderVerdict}
            decisionMode={decisionMode}
            onApprove={onApproveTwin}
            onReject={onRejectTwin}
          />
        </div>

        {/* Row 4 Col 1: Scores Panel */}
        <div className="lg:col-span-4 min-h-[360px]">
          <MCScores
            score={missionScore}
            alerts={scoringAlerts}
            decisionQualityLog={decisionQualityLog}
          />
        </div>

        {/* Row 4 Col 2: Timeline / Decision Log */}
        <div className="lg:col-span-8 min-h-[360px]">
          <MCTimeline
            performanceHistory={performanceHistory}
          />
        </div>
      </div>

      {/* Row 5: MCAlertCenter (full width) */}
      <div className="w-full relative z-10 shrink-0">
        <MCAlertCenter
          alerts={scoringAlerts}
          activeEvent={activeEvent}
        />
      </div>

      <footer className="text-center font-mono text-[10px] text-slate-600 mt-2 select-text shrink-0">
        PROJECT HAIL MARY MISSION DATA BASE // CLASSIFIED INTEL // UNITED NATIONS SPACE PROGRAM
      </footer>
    </div>
  );
};

export default MissionControlView;
