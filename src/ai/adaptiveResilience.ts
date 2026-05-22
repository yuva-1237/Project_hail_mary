import type { SpacecraftState } from "../data/spacecraft";

export interface AREForecast {
  id: string;
  probability: number;
  timeToFailure: string;
  system: string;
  recommendation: string;
}

export function generateAREForecast(state: SpacecraftState): AREForecast[] {
  const forecasts: AREForecast[] = [];

  if (state.power < 40) {
    forecasts.push({
      id: "are-pwr-1",
      probability: Math.min(Math.round(100 - state.power * 2), 99),
      timeToFailure: `${Math.floor(state.power / 2) + 2} minutes`,
      system: "Communication Array",
      recommendation: "Switch to backup relay to conserve active power draw."
    });
  }

  if (state.fuel < 35) {
    forecasts.push({
      id: "are-fuel-1",
      probability: Math.min(Math.round(100 - state.fuel * 2.5), 99),
      timeToFailure: `${Math.floor(state.fuel / 3) + 5} minutes`,
      system: "Navigation Thrusters",
      recommendation: "Initiate micro-burn drift protocols."
    });
  }

  if (state.health < 50) {
    forecasts.push({
      id: "are-hlth-1",
      probability: Math.min(Math.round(100 - state.health * 1.5), 99),
      timeToFailure: `${Math.floor(state.health / 5) + 1} minutes`,
      system: "Hull Integrity",
      recommendation: "Deploy automated nanite repair swarms."
    });
  }

  if (state.oxygen < 30) {
    forecasts.push({
      id: "are-oxy-1",
      probability: Math.min(Math.round(100 - state.oxygen * 3), 99),
      timeToFailure: `${Math.floor(state.oxygen / 4) + 2} minutes`,
      system: "Life Support",
      recommendation: "Seal non-essential bulkheads to isolate cabin pressure."
    });
  }

  return forecasts.sort((a, b) => b.probability - a.probability);
}
