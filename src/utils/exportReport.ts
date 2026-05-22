import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { ActiveEvent } from '../data/events';
import type { Decision } from '../data/decisions';
import type { MissionScore } from '../scoring/types';
import type { HumanOverrideRecord } from '../types/missionControl';

export const exportMissionReport = (
  events: ActiveEvent[],
  decisions: Decision[],
  score: MissionScore,
  mode: "space" | "earth" = "space",
  humanOverrideLog: HumanOverrideRecord[] = []
) => {
  const doc = new jsPDF();
  const title = mode === "space" ? "Project HAIL MARY - Mission Report" : "Earth Twin Asset - Incident Report";
  
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Scoring Summary
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Performance Summary", 14, 45);
  
  doc.setFontSize(12);
  doc.text(`Overall Score: ${score.overall} / 100 (${score.grade})`, 14, 55);
  doc.text(`Decision Quality: ${score.metrics.decisionQuality} / 100`, 14, 62);
  doc.text(`Safety Score: ${score.metrics.safetyScore} / 100`, 14, 69);
  doc.text(`Success Probability at end: ${score.metrics.overallSuccessProbability}%`, 14, 76);

  // Events & Decisions Table
  const tableData = events.map(event => {
    const relatedDecision = decisions.find(d => d.eventTitle === event.title);
    return [
      event.timestamp.replace("MET ", ""),
      event.severity,
      event.title,
      relatedDecision ? relatedDecision.selectedAction : "Pending / None",
      relatedDecision ? relatedDecision.outcome : "N/A"
    ];
  });

  // @ts-ignore
  doc.autoTable({
    startY: 90,
    head: [['MET', 'Severity', 'Event', 'Action Taken', 'Outcome']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [6, 182, 212] }, // Cyan-500
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 },
      4: { cellWidth: 'auto' }
    }
  });

  // MARM: Human Override Log table (only when overrides exist)
  if (humanOverrideLog.length > 0) {
    // @ts-ignore
    const afterEventsY = (doc as any).lastAutoTable?.finalY ?? 120;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("MARM \u2013 Human Override Log", 14, afterEventsY + 12);

    const overrideData = humanOverrideLog.map(rec => [
      rec.timestamp,
      rec.anomalyTitle,
      rec.userDecision.toUpperCase(),
      rec.selectedAction,
      rec.justification,
      rec.finalOutcome,
    ]);

    // @ts-ignore
    doc.autoTable({
      startY: afterEventsY + 18,
      head: [['MET', 'Anomaly', 'Decision', 'Action', 'Justification', 'Outcome']],
      body: overrideData,
      theme: 'grid',
      headStyles: { fillColor: [220, 50, 50] }, // Red – MARM
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 35 },
        2: { cellWidth: 22 },
        3: { cellWidth: 30 },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 28 },
      }
    });
  }

  doc.save(mode === "space" ? "hail_mary_mission_report.pdf" : "earth_twin_incident_report.pdf");
};
