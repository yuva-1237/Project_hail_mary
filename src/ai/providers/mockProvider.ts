/**
 * Mock AI Provider – Phase 6
 * Fully functional offline provider that simulates LLM reasoning.
 * Returns event-aware structured responses with realistic 1.2–3s delays.
 * This is the DEFAULT provider — the app works entirely without API keys.
 */
import type { AIProviderInterface, AIReasoningResponse } from "../types";

// ─── Event-aware response bank ────────────────────────────────────────────────

const EVENT_RESPONSES: Record<string, AIReasoningResponse> = {
  "Fuel Leak": {
    selectedAction: "Activate Backup Fuel Tank",
    reasoning:
      "The fuel leak presents an existential threat to propulsion continuity. At the detected drain rate, primary reserves will fall below critical threshold before the Tau Ceti insertion burn window. Activating the backup fuel tank is the only immediate measure that eliminates this risk while preserving full mission trajectory capability — the multi-agent consensus of 90+ points and Safety Agent agreement confirm this is the correct priority.",
    confidence: 94,
    risks: [
      "Backup tank isolation valve failure could trap reserve fuel inaccessibly",
      "Pressure differential during tank switch may stress connector seals",
      "Primary tank breach may worsen if patch is not applied simultaneously",
    ],
    predictedImpact:
      "Fuel reserves stabilised at backup capacity; full mission trajectory preserved with no velocity loss.",
    successAdjustment: 3,
  },
  "Solar Storm": {
    selectedAction: "Activate Safe Mode",
    reasoning:
      "Solar particle flux at detected levels presents irreversible radiation risk to both crew biology and onboard electronics. Safe mode is the only protective measure executable immediately without fuel expenditure. The Navigation Agent's 1.8° lateral deviation alternative is viable but carries non-trivial delta-v costs compared to safe mode's zero fuel cost — at current fuel reserves, we cannot afford speculative burns.",
    confidence: 91,
    risks: [
      "Safe mode reduces navigational correction capacity during storm duration",
      "Extended safe mode may cause thermal regulation imbalance in forward compartments",
      "Crew confined to shielded habitat reduces operational capability for 40+ minutes",
    ],
    predictedImpact:
      "Crew radiation exposure reduced to safe levels; all critical systems preserved; approximately 40-minute mission timeline delay.",
    successAdjustment: 2,
  },
  "Engine Failure": {
    selectedAction: "Reroute to Backup Thrusters",
    reasoning:
      "Primary engine failure at this mission phase is critical but recoverable via backup thruster rerouting. At 34% nominal efficiency, backup thrusters can still achieve the required delta-v for Tau Ceti insertion — the timeline extends but mission integrity holds. Resource Agent's fuel concern is valid, but the cost of inaction (trajectory drift) far exceeds the cost of backup activation.",
    confidence: 82,
    risks: [
      "34% thruster efficiency significantly increases fuel consumption rate",
      "Rerouting at current velocity may induce structural vibration stress on frame",
      "Mission timeline extends approximately 6–8 hours beyond planned schedule",
    ],
    predictedImpact:
      "Propulsion maintained at reduced efficiency; mission trajectory preserved with extended timeline and elevated fuel expenditure.",
    successAdjustment: 1,
  },
  "Oxygen Leak": {
    selectedAction: "Emergency Oxygen Isolation Protocol",
    reasoning:
      "Cabin pressure breach with active O₂ loss is the highest-priority crew survival event in the mission profile. At the current leak rate, crew hypoxia risk materialises within 8 minutes — faster than any alternative mitigation strategy. Emergency isolation of the breached section followed by backup life support activation is the only action that eliminates the mortal threat within the available window. Safety and Resource agents are in complete agreement.",
    confidence: 97,
    risks: [
      "Isolation may temporarily strand crew members in the affected hull section",
      "Backup O₂ canisters provide limited supply and must be supplemented within 4 hours",
      "Pressure differential during isolation may stress adjacent hull seal integrity",
    ],
    predictedImpact:
      "Crew survival secured; cabin pressure stabilised; approximately 18% of backup O₂ reserves consumed.",
    successAdjustment: 3,
  },
  "Battery Failure": {
    selectedAction: "Switch to Backup Battery",
    reasoning:
      "Primary battery failure risks a cascading power-loss event that could disable life support and navigation simultaneously — a dual-failure scenario we cannot recover from at this range from Earth. The backup battery is fully charged and the switch protocol is well-rehearsed. Navigation Agent's concern about thruster coverage during the transition window is valid; the switch should be timed to a low-maneuver phase.",
    confidence: 90,
    risks: [
      "4–8 second power gap during switch leaves attitude thrusters unresponsive",
      "Backup battery is rated for 72 hours — primary repair must complete in that window",
      "Voltage surge during switch may trip circuit breakers on sensitive instruments",
    ],
    predictedImpact:
      "Full power restored via backup grid; operations normalised within 90 seconds; 72-hour primary battery repair window opened.",
    successAdjustment: 2,
  },
  "Navigation Error": {
    selectedAction: "Recalculate Course Trajectory",
    reasoning:
      "A 0.31° heading deviation compounds to over 2,400 km of position error at Tau Ceti arrival — far exceeding the 50 km orbital insertion tolerance. Immediate correction burn is necessary, and the delta-v cost is modest given current fuel reserves. The Science Agent correctly notes the correction also improves alignment with secondary observation targets, making this both a necessity and an opportunity.",
    confidence: 88,
    risks: [
      "Correction burn fuel cost reduces contingency reserves by approximately 1.8%",
      "Star-tracker recalibration takes 3 minutes during which course lock accuracy is reduced",
      "Heading deviation may indicate gyroscope drift requiring full calibration sequence",
    ],
    predictedImpact:
      "Trajectory restored to within 0.02° of planned course; arrival positioning within orbital insertion tolerances.",
    successAdjustment: 2,
  },
  "Radiation Spike": {
    selectedAction: "Deploy Radiation Shield Arrays",
    reasoning:
      "At 890 mSv/hr, the detected radiation flux is well above the Level-4 emergency threshold and poses both acute crew risk and semiconductor damage to critical avionics. Shield array deployment is optimal — the 12% power draw from non-critical systems is manageable, and the protection is immediate. Navigation Agent correctly calculates that evasive deviation is less fuel-efficient than shielding at current velocity.",
    confidence: 92,
    risks: [
      "Shield array power draw further reduces available capacity for science instruments",
      "Extended high-flux exposure may permanently degrade onboard semiconductor systems",
      "Arrays rated for 4-hour maximum continuous deployment — event must resolve by then",
    ],
    predictedImpact:
      "Crew radiation dose reduced to safe levels within 45 seconds; passive science data continues via shielded sensor baffles.",
    successAdjustment: 2,
  },
  "Communication Loss": {
    selectedAction: "Deploy Backup Antenna",
    reasoning:
      "Communication blackout removes the critical ground control oversight layer, preventing both emergency navigation assistance and medical support access that autonomous systems cannot replicate. The backup antenna restores the Earth link within 30 seconds at a modest 8% power increase. Root cause analysis should run in parallel but must not delay the restoration, as the blackout exposure window compounds risk with each passing minute.",
    confidence: 86,
    risks: [
      "Backup antenna deployment in current thermal regime may introduce calibration drift",
      "8% power increase requires load reduction in at least one non-critical system",
      "Root cause of primary antenna failure unknown — same cause may affect backup",
    ],
    predictedImpact:
      "Earth communication link restored; 847 MB of buffered science data cleared for downlink; ground support capability fully reinstated.",
    successAdjustment: 2,
  },
  "Asteroid Field": {
    selectedAction: "Execute Evasive Course Change",
    reasoning:
      "A 73% impact probability with 90 seconds to intercept is an immediate kinetic survival threat with zero acceptable alternatives. The pre-loaded evasive burn vector is the correct response — shield arrays alone cannot withstand the impact energy at current velocity. The 2.3% fuel cost is within operational tolerance, and the Science Agent's observation that LIDAR data can be captured during the manoeuvre recovers scientific value from the emergency.",
    confidence: 96,
    risks: [
      "Evasive burn alters trajectory requiring resynchronisation with planned route",
      "Lateral debris field extends beyond primary cluster — secondary collision risk for 12 minutes",
      "2.3% fuel expenditure reduces contingency reserves below preferred threshold",
    ],
    predictedImpact:
      "Impact probability reduced to <0.1%; trajectory deviation of 0.15° correctable with next planned burn; LIDAR asteroid composition data captured.",
    successAdjustment: 3,
  },
  "Unknown Object Detected": {
    selectedAction: "Deploy Spectroscopic Scan Array",
    reasoning:
      "A confirmed non-threatening object at 340 km represents an unprecedented scientific opportunity that may be the most significant discovery of the entire mission. Safety Agent's risk assessment confirms no collision trajectory or anomalous radiation. The 15-minute survey hold costs 0.8% mission progress but could yield irreplaceable first-contact data — the Resource Agent's 60% power limitation is a prudent constraint that extends the survey window safely.",
    confidence: 78,
    risks: [
      "Unknown object properties may present hazards not detectable at current sensor range",
      "15-minute velocity hold extends mission timeline beyond planned schedule",
      "Object may not be stationary — the optimal scan window may close before completion",
    ],
    predictedImpact:
      "Full spectroscopic analysis completed; potential first-contact scientific data archived; 0.8% mission progress cost accepted for extraordinary scientific gain.",
    successAdjustment: 1,
  },
};

/** Fallback for unrecognised event titles */
const DEFAULT_RESPONSE: AIReasoningResponse = {
  selectedAction: "Initiate Emergency Protocol",
  reasoning:
    "The detected event presents a non-standard risk profile that falls outside primary classification parameters. Based on current telemetry and multi-agent consensus, the recommended emergency protocol minimises risk to crew and spacecraft while preserving mission objectives to the greatest feasible extent. Continuous monitoring is essential as secondary effects may emerge.",
  confidence: 72,
  risks: [
    "Event classification incomplete — response is precautionary rather than targeted",
    "Unknown secondary effects may emerge during protocol execution",
    "Resource consumption during emergency response reduces operational margins",
  ],
  predictedImpact:
    "Emergency protocol executed; mission continues with reduced operational margins pending full event assessment and classification.",
  successAdjustment: 1,
};

function randomDelay(): Promise<void> {
  const ms = 1200 + Math.random() * 1800; // 1.2 – 3.0 seconds
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockProvider: AIProviderInterface = {
  name: "mock",
  displayName: "Mission AI (Offline Mode)",

  async call(prompt: string): Promise<AIReasoningResponse> {
    await randomDelay();

    // Extract event title from the prompt for event-aware response selection
    const titleMatch = prompt.match(/Title:\s+(.+)/);
    const eventTitle = titleMatch ? titleMatch[1].trim() : "";

    const base = EVENT_RESPONSES[eventTitle] ?? DEFAULT_RESPONSE;

    // Add ±2 variance to confidence so each call feels dynamic
    const variance = Math.floor(Math.random() * 5) - 2;
    return {
      ...base,
      confidence: Math.max(0, Math.min(100, base.confidence + variance)),
    };
  },

  async testConnection(): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 400));
    return true;
  },
};
