export interface SpacecraftState {
  fuel: number;
  power: number;
  oxygen: number;
  temperature: number;
  health: number;
  communication: boolean;
  position: string;
  velocity: number;
  missionProgress: number;
}

export const INITIAL_SPACECRAFT_STATE: SpacecraftState = {
  fuel: 100,
  power: 100,
  oxygen: 100,
  temperature: 22,
  health: 100,
  communication: true,
  position: "Earth Orbit",
  velocity: 7.8,
  missionProgress: 0,
};

export interface MissionPhase {
  minProgress: number;
  maxProgress: number;
  name: string;
  position: string;
  velocity: number; // km/s base
  communicationDelay: string;
  statusText: string;
}

export const MISSION_PHASES: MissionPhase[] = [
  {
    minProgress: 0,
    maxProgress: 10,
    name: "System Check & Departure",
    position: "Earth Orbit / Escape Trajectory",
    velocity: 7.8,
    communicationDelay: "1.2s (Realtime)",
    statusText: "All systems nominal. Initiating solar system exit burn.",
  },
  {
    minProgress: 11,
    maxProgress: 35,
    name: "Relativistic Acceleration",
    position: "Solar System Boundary / Oort Cloud",
    velocity: 85000,
    communicationDelay: "4.2 minutes",
    statusText: "Spin gravity established. Astrophage propulsion firing at full throttle.",
  },
  {
    minProgress: 36,
    maxProgress: 70,
    name: "Deep Space Cruise (0.9c)",
    position: "Interstellar Void (approx. 2.1 LY from Sol)",
    velocity: 269813,
    communicationDelay: "2.1 years",
    statusText: "Coasting at relativistic speed. Radiation deflectors active.",
  },
  {
    minProgress: 71,
    maxProgress: 90,
    name: "Braking & Deceleration",
    position: "Approaching Tau Ceti Horizon",
    velocity: 95000,
    communicationDelay: "11.6 years",
    statusText: "Engines oriented forward. High-gain braking burn in progress.",
  },
  {
    minProgress: 91,
    maxProgress: 99,
    name: "Tau Ceti Orbit Insertion",
    position: "Tau Ceti System Outer Orbit",
    velocity: 32.4,
    communicationDelay: "11.9 years",
    statusText: "Intercepting planet Adrian orbit. Preparing atmospheric probes.",
  },
  {
    minProgress: 100,
    maxProgress: 100,
    name: "Adrian Orbit Stabilized",
    position: "Planet Adrian Orbit (Destination Reached)",
    velocity: 4.8,
    communicationDelay: "12.0 years",
    statusText: "Rendezvous complete. Orbital farm deployed. Mission successful.",
  },
];

export interface LogMessage {
  id: string;
  timestamp: string; // MET format e.g. 00:00:12
  text: string;
  type: "info" | "success" | "warning" | "danger";
  progressTrigger: number;
}

export const SIMULATION_LOGS: LogMessage[] = [
  {
    id: "log-0",
    timestamp: "MET 00:00:00",
    text: "Hail Mary computer systems online. Primary mission data loaded.",
    type: "info",
    progressTrigger: 0,
  },
  {
    id: "log-1",
    timestamp: "MET 00:00:02",
    text: "Astrophage reactor ignited. Thruster fuel pumps pressurized.",
    type: "success",
    progressTrigger: 2,
  },
  {
    id: "log-2",
    timestamp: "MET 00:00:08",
    text: "Escaping Earth gravitational well. Velocity vector locks onto Tau Ceti.",
    type: "info",
    progressTrigger: 8,
  },
  {
    id: "log-3",
    timestamp: "MET 00:00:15",
    text: "Relativistic spin cycle activated. Centrifugal force stabilizing at 1.0g.",
    type: "success",
    progressTrigger: 15,
  },
  {
    id: "log-4",
    timestamp: "MET 00:00:25",
    text: "Life Support: Carbon dioxide scrubbers active. O2 concentration stable at 21%.",
    type: "success",
    progressTrigger: 25,
  },
  {
    id: "log-5",
    timestamp: "MET 00:00:38",
    text: "Entering deep space cruise mode. Velocity exceeds 0.9c. Communication signal delay mounting.",
    type: "info",
    progressTrigger: 38,
  },
  {
    id: "log-6",
    timestamp: "MET 00:00:52",
    text: "Subsystem check: Solar panels fully retracted. Reactor heat sink operating optimally.",
    type: "info",
    progressTrigger: 52,
  },
  {
    id: "log-7",
    timestamp: "MET 00:00:65",
    text: "Alert: Shield grid registers hyper-velocity micro-debris collision. Deflection nominal.",
    type: "warning",
    progressTrigger: 65,
  },
  {
    id: "log-8",
    timestamp: "MET 00:00:72",
    text: "Reversing Hail Mary thruster vector. Initiating decel burn phase.",
    type: "info",
    progressTrigger: 72,
  },
  {
    id: "log-9",
    timestamp: "MET 00:00:83",
    text: "Relativistic speed shedding. Life support systems report all modules at 100% capacity.",
    type: "success",
    progressTrigger: 83,
  },
  {
    id: "log-10",
    timestamp: "MET 00:00:91",
    text: "Visual acquisition: planet Adrian is within scanner envelope. Gravity assists calculated.",
    type: "info",
    progressTrigger: 91,
  },
  {
    id: "log-11",
    timestamp: "MET 00:00:96",
    text: "Braking sequence final stage. Entering Adrian upper thermosphere.",
    type: "warning",
    progressTrigger: 96,
  },
  {
    id: "log-12",
    timestamp: "MET 00:01:00",
    text: "Stable circular orbit achieved. Taumeeba atmospheric sampling tanks deployed. Mission Goal Achieved.",
    type: "success",
    progressTrigger: 100,
  },
];

export function getMissionPhase(progress: number): MissionPhase {
  // Return the phase that contains the current progress, or the last one if it goes over
  const phase = MISSION_PHASES.find(
    (p) => progress >= p.minProgress && progress <= p.maxProgress
  );
  return phase || MISSION_PHASES[MISSION_PHASES.length - 1];
}
