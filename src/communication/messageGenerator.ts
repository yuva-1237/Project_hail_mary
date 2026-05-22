/**
 * Message Generator – Phase 5
 * Produces deterministic inter-agent messages for each mission event.
 * Each event has a set of 4 rich message templates covering all four agent roles.
 */
import type { AgentMessage, MessageType } from "../types/communication";
import type { AgentRecommendation } from "../types/agents";

interface RawTemplate {
  sender: string;
  senderName: string;
  receiver: string;
  receiverName: string;
  messageType: MessageType;
  content: string;
}

// ─── Per-event message template bank ─────────────────────────────────────────

const EVENT_MESSAGES: Record<string, RawTemplate[]> = {
  "Fuel Leak": [
    {
      sender: "resource", senderName: "Resource Agent",
      receiver: "ALL",    receiverName: "All Agents",
      messageType: "ESCALATION",
      content: "Primary fuel line pressure dropping at 3.2 kPa/s. At this rate reserves will fall below critical threshold in under 4 minutes. Backup tank activation is non-negotiable.",
    },
    {
      sender: "safety", senderName: "Safety Agent",
      receiver: "resource", receiverName: "Resource Agent",
      messageType: "AGREEMENT",
      content: "Concur with Resource Agent. Fuel loss directly threatens propulsion and life support redundancy. Backup tank activation takes priority over all other actions.",
    },
    {
      sender: "navigation", senderName: "Navigation Agent",
      receiver: "resource", receiverName: "Resource Agent",
      messageType: "QUESTION",
      content: "Backup tank activation confirmed — will this preserve sufficient delta-v margin for the Tau Ceti orbital insertion burn scheduled at 87% mission progress?",
    },
    {
      sender: "science", senderName: "Science Agent",
      receiver: "ALL",    receiverName: "All Agents",
      messageType: "SUPPORT",
      content: "Mission science objectives remain fully viable with backup fuel engaged. Science instruments draw minimal fuel. Supporting Resource Agent's recommendation without reservation.",
    },
  ],

  "Solar Storm": [
    {
      sender: "safety", senderName: "Safety Agent",
      receiver: "ALL",  receiverName: "All Agents",
      messageType: "ESCALATION",
      content: "Solar particle flux at 680 mSv/hr — 2.7× the crew emergency threshold. Safe mode is mandatory. Every additional second of exposure increases cumulative radiation dose irreversibly.",
    },
    {
      sender: "resource", senderName: "Resource Agent",
      receiver: "safety", receiverName: "Safety Agent",
      messageType: "SUPPORT",
      content: "Load-shedding non-essential systems reduces strain on shielding arrays. Power draw is manageable. Fully backing safe mode protocol — initiating load schedule now.",
    },
    {
      sender: "navigation", senderName: "Navigation Agent",
      receiver: "ALL",    receiverName: "All Agents",
      messageType: "SUGGESTION",
      content: "Safe mode does not require course lock. A 1.8° lateral deviation could reduce the storm exposure window by 40% and is achievable within the current power envelope.",
    },
    {
      sender: "science", senderName: "Science Agent",
      receiver: "safety", receiverName: "Safety Agent",
      messageType: "AGREEMENT",
      content: "Science operations can safely pause during safe mode. Passive sensors will continue logging solar flux data. Crew survival takes absolute precedence — proceed with safe mode.",
    },
  ],

  "Engine Failure": [
    {
      sender: "navigation", senderName: "Navigation Agent",
      receiver: "ALL",     receiverName: "All Agents",
      messageType: "ESCALATION",
      content: "Primary propulsion system offline. Current velocity insufficient for planned insertion burn. Rerouting to backup thruster profile — efficiency reduced to 34% of nominal.",
    },
    {
      sender: "safety", senderName: "Safety Agent",
      receiver: "ALL",   receiverName: "All Agents",
      messageType: "ESCALATION",
      content: "Engine failure at this mission phase is a contingency-level emergency. Recommend priming emergency protocols in parallel with route recalculation to protect crew.",
    },
    {
      sender: "resource", senderName: "Resource Agent",
      receiver: "navigation", receiverName: "Navigation Agent",
      messageType: "QUESTION",
      content: "Will backup thruster rerouting require additional fuel draws beyond nominal? Current fuel reserve needs to be protected for the long-range burn to Tau Ceti.",
    },
    {
      sender: "science", senderName: "Science Agent",
      receiver: "navigation", receiverName: "Navigation Agent",
      messageType: "SUPPORT",
      content: "Backup thruster route is scientifically acceptable — it does not compromise primary observation targets. Supporting Navigation Agent's recalculation recommendation.",
    },
  ],

  "Oxygen Leak": [
    {
      sender: "safety", senderName: "Safety Agent",
      receiver: "ALL",   receiverName: "All Agents",
      messageType: "ESCALATION",
      content: "CRITICAL: Cabin pressure compromised. O₂ falling at emergency rate. Crew hypoxia risk within 8 minutes at current leak rate. Emergency isolation protocol is mandatory — activate NOW.",
    },
    {
      sender: "resource", senderName: "Resource Agent",
      receiver: "ALL",    receiverName: "All Agents",
      messageType: "ESCALATION",
      content: "Backup O₂ canisters fully charged and standing by. Immediate isolation of ruptured section followed by backup life support switch will prevent total pressure loss.",
    },
    {
      sender: "navigation", senderName: "Navigation Agent",
      receiver: "safety",  receiverName: "Safety Agent",
      messageType: "AGREEMENT",
      content: "Navigation holding steady on autopilot. All systems available for life-support emergency response. Safety Agent has full operational authority — standing by your orders.",
    },
    {
      sender: "science", senderName: "Science Agent",
      receiver: "safety", receiverName: "Safety Agent",
      messageType: "AGREEMENT",
      content: "All science operations immediately suspended. Science team assisting with emergency isolation procedures. Crew survival is the singular priority — execute emergency protocol.",
    },
  ],

  "Battery Failure": [
    {
      sender: "resource", senderName: "Resource Agent",
      receiver: "ALL",    receiverName: "All Agents",
      messageType: "ESCALATION",
      content: "Battery primary grid failing — power dropping below operational minimum. Auxiliary battery fully charged and ready. Immediate switch required to prevent total power loss cascade.",
    },
    {
      sender: "safety", senderName: "Safety Agent",
      receiver: "resource", receiverName: "Resource Agent",
      messageType: "SUPPORT",
      content: "Power grid instability risks cascading to life support failure. Backup battery switch protects crew deck systems. Fully supporting Resource Agent's recommendation.",
    },
    {
      sender: "navigation", senderName: "Navigation Agent",
      receiver: "ALL",     receiverName: "All Agents",
      messageType: "QUESTION",
      content: "Does the backup battery provide sufficient power for attitude thrusters during the switch? Route corrections may be needed during the power transition window.",
    },
    {
      sender: "science", senderName: "Science Agent",
      receiver: "resource", receiverName: "Resource Agent",
      messageType: "AGREEMENT",
      content: "All science instruments entering cold standby during power switch. This causes no data loss. Resource Agent's recommendation is the correct and necessary priority.",
    },
  ],

  "Navigation Error": [
    {
      sender: "navigation", senderName: "Navigation Agent",
      receiver: "ALL",     receiverName: "All Agents",
      messageType: "ESCALATION",
      content: "Star-tracker array confirms 0.31° heading deviation. At current velocity this compounds to a 2,400 km course error at arrival. Correction burn required immediately.",
    },
    {
      sender: "safety", senderName: "Safety Agent",
      receiver: "navigation", receiverName: "Navigation Agent",
      messageType: "AGREEMENT",
      content: "Navigation error is not an immediate crew safety threat — but unresolved it becomes one. Acknowledging urgency and supporting route recalculation without objection.",
    },
    {
      sender: "resource", senderName: "Resource Agent",
      receiver: "navigation", receiverName: "Navigation Agent",
      messageType: "QUESTION",
      content: "What is the fuel cost of the correction burn? Need to factor remaining reserves before authorising the manoeuvre — delta-v budget should be confirmed before execution.",
    },
    {
      sender: "science", senderName: "Science Agent",
      receiver: "ALL",    receiverName: "All Agents",
      messageType: "SUPPORT",
      content: "A corrected trajectory brings us 0.4° closer to the secondary observation target at waypoint 3. Navigation correction is not only necessary — it is scientifically beneficial.",
    },
  ],

  "Radiation Spike": [
    {
      sender: "safety", senderName: "Safety Agent",
      receiver: "ALL",   receiverName: "All Agents",
      messageType: "ESCALATION",
      content: "Radiation flux spiked to 890 mSv/hr — critically above safe limits. Deploying astrophage absorbers. Crew shielding must be activated without any further delay.",
    },
    {
      sender: "resource", senderName: "Resource Agent",
      receiver: "ALL",    receiverName: "All Agents",
      messageType: "SUPPORT",
      content: "Shield array draw is manageable — diverting 12% power from non-critical systems. Backing Safety Agent's shield deployment. Load schedule adjusted and confirmed.",
    },
    {
      sender: "navigation", senderName: "Navigation Agent",
      receiver: "safety",  receiverName: "Safety Agent",
      messageType: "AGREEMENT",
      content: "Route deviation assessed — storm corridor is 340 km wide. Shielding is more fuel-efficient than deviation at current velocity. Agreeing with Safety Agent's approach.",
    },
    {
      sender: "science", senderName: "Science Agent",
      receiver: "safety", receiverName: "Safety Agent",
      messageType: "SUPPORT",
      content: "Passive science sensors recording flux spectra from within shielding baffles. No science compromise necessary — fully supporting crew shield deployment.",
    },
  ],

  "Communication Loss": [
    {
      sender: "resource", senderName: "Resource Agent",
      receiver: "ALL",    receiverName: "All Agents",
      messageType: "SUGGESTION",
      content: "High-gain backup antenna array can restore the Earth link within 30 seconds at +8% power draw. Recommend activating Use Backup Antenna as highest priority action.",
    },
    {
      sender: "safety", senderName: "Safety Agent",
      receiver: "resource", receiverName: "Resource Agent",
      messageType: "AGREEMENT",
      content: "Communication blackout removes ground control oversight — this is a safety concern regardless of direct crew risk. Backup antenna restoration is a priority. Agreed.",
    },
    {
      sender: "navigation", senderName: "Navigation Agent",
      receiver: "ALL",     receiverName: "All Agents",
      messageType: "QUESTION",
      content: "Ground control comms offline — does this affect our navigation uplink? Star-tracker autonomous mode may have reduced accuracy. Navigation status should be confirmed.",
    },
    {
      sender: "science", senderName: "Science Agent",
      receiver: "resource", receiverName: "Resource Agent",
      messageType: "SUPPORT",
      content: "Science data is buffered and waiting for downlink. Backup antenna restoration will allow immediate data transmission. Supporting Resource Agent's antenna recommendation.",
    },
  ],

  "Asteroid Field": [
    {
      sender: "navigation", senderName: "Navigation Agent",
      receiver: "ALL",     receiverName: "All Agents",
      messageType: "ESCALATION",
      content: "Debris field confirmed at bearing 047°. At current velocity, impact probability reaches 73% in 90 seconds. Evasive burn vector is pre-loaded — course change is mandatory.",
    },
    {
      sender: "safety", senderName: "Safety Agent",
      receiver: "ALL",   receiverName: "All Agents",
      messageType: "ESCALATION",
      content: "Impact scenario at current hull integrity is critical. Shield arrays deployed but impact avoidance is the only safe response. Backing Navigation Agent unconditionally.",
    },
    {
      sender: "resource", senderName: "Resource Agent",
      receiver: "navigation", receiverName: "Navigation Agent",
      messageType: "QUESTION",
      content: "Evasive burn costs approximately 2.3% fuel. With current reserves this is manageable — but post-manoeuvre fuel status should be monitored closely.",
    },
    {
      sender: "science", senderName: "Science Agent",
      receiver: "navigation", receiverName: "Navigation Agent",
      messageType: "SUPPORT",
      content: "Side-mounted LIDAR can capture asteroid composition data during the evasive burn at no additional cost. No science loss from the course change. Supporting Navigation Agent.",
    },
  ],

  "Unknown Object Detected": [
    {
      sender: "science", senderName: "Science Agent",
      receiver: "ALL",   receiverName: "All Agents",
      messageType: "SUPPORT",
      content: "First-contact spectroscopic opportunity confirmed. Object at 340 km off port bow — safe observation distance. This could be the most significant scientific event of the entire mission.",
    },
    {
      sender: "safety", senderName: "Safety Agent",
      receiver: "science", receiverName: "Science Agent",
      messageType: "SUPPORT",
      content: "Risk assessment completed — object is not on collision course. Radiation profile is nominal. Safe observation is acceptable. Supporting Science Agent's scan recommendation.",
    },
    {
      sender: "navigation", senderName: "Navigation Agent",
      receiver: "ALL",     receiverName: "All Agents",
      messageType: "QUESTION",
      content: "Will the scan require holding position or reducing velocity? A 15-minute survey hold costs approximately 0.8% mission progress — is this within acceptable mission parameters?",
    },
    {
      sender: "resource", senderName: "Resource Agent",
      receiver: "science", receiverName: "Science Agent",
      messageType: "SUGGESTION",
      content: "Recommend limiting scan array to 60% power capacity. This gives a 12-minute survey window at reduced but scientifically acceptable resolution, conserving energy reserves.",
    },
  ],
};

/** Fallback messages for any unrecognised event */
const DEFAULT_MESSAGES: RawTemplate[] = [
  {
    sender: "safety", senderName: "Safety Agent",
    receiver: "ALL",  receiverName: "All Agents",
    messageType: "QUESTION",
    content: "Unclassified event detected. Requesting full telemetry review from all agents before any action is authorised.",
  },
  {
    sender: "resource", senderName: "Resource Agent",
    receiver: "ALL",    receiverName: "All Agents",
    messageType: "SUGGESTION",
    content: "Recommend holding current resource allocation pending clarification from Navigation and Safety agents on event impact.",
  },
  {
    sender: "navigation", senderName: "Navigation Agent",
    receiver: "safety",  receiverName: "Safety Agent",
    messageType: "AGREEMENT",
    content: "Concur with caution posture. Navigation telemetry is nominal. Awaiting Safety Agent's risk assessment before committing to any course action.",
  },
  {
    sender: "science", senderName: "Science Agent",
    receiver: "ALL",   receiverName: "All Agents",
    messageType: "SUPPORT",
    content: "Science systems in monitoring mode. Supporting a measured, data-driven response to this unclassified event.",
  },
];

/**
 * Generates inter-agent messages for the given event title.
 * Stamps each message with the provided MET timestamp.
 */
export function generateMessages(
  eventTitle: string,
  _recommendations: AgentRecommendation[],
  timestamp: string
): AgentMessage[] {
  const templates = EVENT_MESSAGES[eventTitle] ?? DEFAULT_MESSAGES;

  return templates.map((t, index): AgentMessage => ({
    id: `msg-${Date.now()}-${index}`,
    sender: t.sender,
    senderName: t.senderName,
    receiver: t.receiver,
    receiverName: t.receiverName,
    messageType: t.messageType,
    content: t.content,
    timestamp,
  }));
}
