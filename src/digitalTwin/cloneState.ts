import type { SpacecraftState } from "../data/spacecraft";
import type { CrewMember } from "../types/crew";

/**
 * Creates a clean copy of the spacecraft state to prevent reference mutations.
 */
export function cloneSpacecraftState(state: SpacecraftState): SpacecraftState {
  return { ...state };
}

/**
 * Creates a deep copy of the crew list to prevent reference mutations.
 */
export function cloneCrew(crew: CrewMember[]): CrewMember[] {
  return crew.map((member) => ({ ...member }));
}
