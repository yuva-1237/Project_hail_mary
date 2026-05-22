export interface LearningExperience {
  eventId: string;
  eventTitle: string;
  selectedAction: string;
  successImpact: number;
  healthDelta: number;
  timestamp: string;
}

const LEARNING_STORAGE_KEY = "hailmary_learning_v1";

export const recordOutcome = (experience: LearningExperience) => {
  try {
    const existingStr = localStorage.getItem(LEARNING_STORAGE_KEY);
    const existing: LearningExperience[] = existingStr ? JSON.parse(existingStr) : [];
    existing.push(experience);
    localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(existing.slice(-100))); // Keep last 100
  } catch (e) {
    console.error("Failed to record learning outcome", e);
  }
};

export const getLearnedBiases = (eventTitle: string): Record<string, number> => {
  try {
    const existingStr = localStorage.getItem(LEARNING_STORAGE_KEY);
    const existing: LearningExperience[] = existingStr ? JSON.parse(existingStr) : [];
    
    const biases: Record<string, number> = {};
    const related = existing.filter(e => e.eventTitle === eventTitle);
    
    related.forEach(exp => {
      if (!biases[exp.selectedAction]) biases[exp.selectedAction] = 0;
      // Bias increases if successImpact is positive and health doesn't drop significantly
      biases[exp.selectedAction] += (exp.successImpact > 0 ? 1 : -1) + (exp.healthDelta >= 0 ? 0.5 : -1);
    });
    
    return biases;
  } catch (e) {
    console.error("Failed to get learned biases", e);
    return {};
  }
};

export const getAllLearningExperiences = (): LearningExperience[] => {
  try {
    const existingStr = localStorage.getItem(LEARNING_STORAGE_KEY);
    return existingStr ? JSON.parse(existingStr) : [];
  } catch (e) {
    console.error("Failed to fetch learning experiences", e);
    return [];
  }
};
