import { useState, useCallback, useRef } from "react";
import type { VoiceRecording } from "../types/voice";
import { idbStorage } from "../utils/idbStorage";

// Sanitize transcript to prevent XSS in storage
function sanitize(text: string): string {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
}

export function useVoiceMemory() {
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const missionIdRef = useRef<string>(`MISSION-${Date.now()}`);

  const addRecording = useCallback(async (params: {
    transcript: string;
    audioBlob: Blob | null;
    durationMs: number;
    speaker?: string;
    linkedEventId?: string;
    linkedDecisionId?: string;
    mode?: VoiceRecording["mode"];
    confidenceScore?: number;
  }) => {
    const id = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const audioBlobId = `audio-${id}`;

    // Persist audio blob to IndexedDB for offline replay
    if (params.audioBlob && params.audioBlob.size > 0) {
      try {
        await idbStorage.saveBlob(audioBlobId, params.audioBlob);
      } catch (e) {
        console.warn("[MVIAS] IndexedDB save failed:", e);
      }
    }

    const record: VoiceRecording = {
      id,
      missionId: missionIdRef.current,
      timestamp: new Date().toISOString(),
      speaker: params.speaker ?? "Human Operator",
      transcript: sanitize(params.transcript),
      linkedEventId: params.linkedEventId,
      linkedDecisionId: params.linkedDecisionId,
      confidenceScore: params.confidenceScore ?? 1.0,
      mode: params.mode ?? "Command",
      audioBlobId: params.audioBlob && params.audioBlob.size > 0 ? audioBlobId : undefined,
      audioDurationMs: params.durationMs,
    };

    setRecordings(prev => [record, ...prev]);
    return record;
  }, []);

  const deleteRecording = useCallback(async (id: string) => {
    setRecordings(prev => {
      const record = prev.find(r => r.id === id);
      if (record?.audioBlobId) {
        idbStorage.deleteBlob(record.audioBlobId).catch(console.warn);
      }
      return prev.filter(r => r.id !== id);
    });
  }, []);

  const getAudioURL = useCallback(async (recording: VoiceRecording): Promise<string | null> => {
    if (!recording.audioBlobId) return null;
    try {
      const blob = await idbStorage.getBlob(recording.audioBlobId);
      if (!blob) return null;
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }, []);

  const searchRecordings = useCallback((query: string): VoiceRecording[] => {
    if (!query.trim()) return recordings;
    const q = query.toLowerCase().trim();
    return recordings.filter(r =>
      r.transcript.toLowerCase().includes(q) ||
      r.speaker.toLowerCase().includes(q) ||
      r.missionId.toLowerCase().includes(q) ||
      (r.linkedEventId?.toLowerCase().includes(q) ?? false) ||
      (r.linkedDecisionId?.toLowerCase().includes(q) ?? false)
    );
  }, [recordings]);

  return {
    recordings,
    missionId: missionIdRef.current,
    addRecording,
    deleteRecording,
    getAudioURL,
    searchRecordings,
  };
}
