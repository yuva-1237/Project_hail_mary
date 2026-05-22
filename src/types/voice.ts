export interface VoiceRecording {
  id: string;
  missionId: string;
  timestamp: string;      // ISO string or MET
  speaker: string;        // e.g., "Commander", "Human Operator"
  transcript: string;
  linkedEventId?: string; // Optional context
  linkedDecisionId?: string; // Optional context
  confidenceScore: number; // For Speech-to-Text accuracy, or AI confidence
  mode: "Autonomous" | "Human Override" | "Command";
  
  // Storage
  audioBlobId?: string; // The key used in IndexedDB to retrieve the audio Blob
  audioDurationMs?: number;
}
