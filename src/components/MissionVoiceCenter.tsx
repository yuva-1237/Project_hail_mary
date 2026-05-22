import { useState, useRef, useCallback } from "react";
import {
  Mic, MicOff, Play, Pause, Search, X, Trash2,
  AudioLines, Clock, Shield, Radio, Download
} from "lucide-react";
import type { VoiceRecording } from "../types/voice";

interface MissionVoiceCenterProps {
  recordings: VoiceRecording[];
  isListening: boolean;
  onToggleListen: () => void;
  onDeleteRecording: (id: string) => void;
  onGetAudioURL: (recording: VoiceRecording) => Promise<string | null>;
  onSearch: (query: string) => VoiceRecording[];
  onClose: () => void;
  missionId: string;
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", { hour12: false });
  } catch { return iso; }
}

function formatDuration(ms?: number): string {
  if (!ms) return "—";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

function ModeChip({ mode }: { mode: VoiceRecording["mode"] }) {
  const styles: Record<VoiceRecording["mode"], string> = {
    "Command": "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    "Human Override": "bg-amber-500/15 text-amber-400 border-amber-500/30",
    "Autonomous": "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
  };
  return (
    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${styles[mode]}`}>
      {mode}
    </span>
  );
}

// Animated waveform bars
function WaveformBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            animationDelay: `${i * 60}ms`,
            height: active ? `${Math.random() * 100}%` : "20%",
          }}
          className={`w-[3px] rounded-full transition-all ${
            active
              ? "bg-cyan-400 animate-pulse"
              : "bg-slate-700"
          }`}
        />
      ))}
    </div>
  );
}

function RecordingCard({
  recording,
  onDelete,
  onGetAudioURL,
}: {
  recording: VoiceRecording;
  onDelete: (id: string) => void;
  onGetAudioURL: (r: VoiceRecording) => Promise<string | null>;
}) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noAudio, setNoAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleReplay = useCallback(async () => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }

    setLoading(true);
    const url = await onGetAudioURL(recording);
    setLoading(false);

    if (!url) {
      setNoAudio(true);
      return;
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => setPlaying(true);
    audio.onended = () => {
      setPlaying(false);
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      setPlaying(false);
      setNoAudio(true);
    };

    audio.play().catch(() => setNoAudio(true));
  }, [playing, recording, onGetAudioURL]);

  return (
    <div className="group relative rounded-lg border border-slate-800 bg-slate-900/60 hover:border-cyan-500/30 hover:bg-slate-900 transition-all p-3 flex flex-col gap-2">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-orbitron font-bold text-[11px] text-white truncate">
            {recording.speaker}
          </span>
          <ModeChip mode={recording.mode} />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] font-mono text-slate-500">
            {formatTimestamp(recording.timestamp)}
          </span>
          <button
            onClick={() => onDelete(recording.id)}
            className="p-1 rounded text-slate-600 hover:text-cyber-red hover:bg-cyber-red/10 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete recording"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Transcript */}
      <p className="text-xs font-mono text-slate-300 leading-relaxed pl-5 border-l border-slate-800">
        "{recording.transcript}"
      </p>

      {/* Metadata Row */}
      <div className="flex items-center justify-between gap-2 pl-5">
        <div className="flex items-center gap-3 flex-wrap">
          {recording.linkedEventId && (
            <span className="text-[9px] font-mono text-amber-400/80">
              EVENT: {recording.linkedEventId.substring(0, 12)}
            </span>
          )}
          {recording.linkedDecisionId && (
            <span className="text-[9px] font-mono text-fuchsia-400/80">
              DECISION: {recording.linkedDecisionId.substring(0, 12)}
            </span>
          )}
          <span className="text-[9px] font-mono text-slate-600">
            {formatDuration(recording.audioDurationMs)}
          </span>
          <span className="text-[9px] font-mono text-slate-600">
            Conf: {Math.round(recording.confidenceScore * 100)}%
          </span>
        </div>

        {/* Replay Button */}
        <button
          onClick={handleReplay}
          disabled={loading}
          title={noAudio ? "No audio available" : playing ? "Stop playback" : "Replay recording"}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all border ${
            noAudio
              ? "border-slate-700 text-slate-600 cursor-not-allowed"
              : playing
              ? "border-cyber-red/40 bg-cyber-red/10 text-cyber-red animate-pulse"
              : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
          }`}
        >
          {loading ? (
            <span className="animate-spin text-[10px]">⟳</span>
          ) : playing ? (
            <><Pause className="w-2.5 h-2.5" /> Stop</>
          ) : noAudio ? (
            <><AudioLines className="w-2.5 h-2.5" /> No Audio</>
          ) : (
            <><Play className="w-2.5 h-2.5" /> Replay</>
          )}
        </button>
      </div>
    </div>
  );
}

export default function MissionVoiceCenter({
  recordings,
  isListening,
  onToggleListen,
  onDeleteRecording,
  onGetAudioURL,
  onSearch,
  onClose,
  missionId,
}: MissionVoiceCenterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"timeline" | "search" | "judge">("timeline");

  const displayedRecordings = searchQuery ? onSearch(searchQuery) : recordings;

  // Export timeline as JSON
  const handleExport = () => {
    const data = JSON.stringify(recordings.map(r => ({
      ...r,
      audioBlobId: undefined, // don't export internal IDs
    })), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${missionId}-voice-audit.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabClasses = (tab: typeof activeTab) =>
    `px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors rounded-t-lg ${
      activeTab === tab
        ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5"
        : "text-slate-500 hover:text-slate-300"
    }`;

  return (
    <div className="fixed inset-0 z-[65] bg-black/85 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-[#080d14] border border-cyan-500/20 rounded-xl w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl shadow-cyan-500/10 overflow-hidden">

        {/* Header */}
        <div className="px-5 pt-4 pb-0 border-b border-slate-800 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <AudioLines className="w-5 h-5 text-cyan-400" />
                <h2 className="font-orbitron font-bold text-lg text-white tracking-wider">
                  Mission Voice Intelligence
                </h2>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 uppercase">
                  MVIAS
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5 ml-7">
                Audit System · {missionId} · {recordings.length} recording{recordings.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                disabled={recordings.length === 0}
                className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors disabled:opacity-40"
                title="Export Voice Audit as JSON"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:border-cyber-red/50 hover:text-cyber-red transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live Recording Status Strip */}
          <div className={`flex items-center justify-between rounded-lg px-4 py-2.5 transition-all ${
            isListening
              ? "bg-cyber-red/10 border border-cyber-red/30"
              : "bg-slate-900/50 border border-slate-800"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${isListening ? "bg-cyber-red animate-pulse" : "bg-slate-700"}`} />
              <span className={`text-[11px] font-mono font-bold uppercase tracking-widest ${isListening ? "text-cyber-red" : "text-slate-500"}`}>
                {isListening ? "Recording Active — Microphone Engaged" : "Microphone Inactive"}
              </span>
              {isListening && <WaveformBars active />}
            </div>
            <button
              onClick={onToggleListen}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all border ${
                isListening
                  ? "border-cyber-red/40 bg-cyber-red/15 text-cyber-red hover:bg-cyber-red/25"
                  : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
              }`}
            >
              {isListening ? <><MicOff className="w-3.5 h-3.5" /> Stop</> : <><Mic className="w-3.5 h-3.5" /> Activate</>}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px">
            <button className={tabClasses("timeline")} onClick={() => setActiveTab("timeline")}>
              <Clock className="inline w-3 h-3 mr-1 -mt-0.5" />Timeline
            </button>
            <button className={tabClasses("search")} onClick={() => setActiveTab("search")}>
              <Search className="inline w-3 h-3 mr-1 -mt-0.5" />Search
            </button>
            <button className={tabClasses("judge")} onClick={() => setActiveTab("judge")}>
              <Shield className="inline w-3 h-3 mr-1 -mt-0.5" />Judge Review
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* SEARCH TAB */}
          {activeTab === "search" && (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder='Search transcripts, speakers, events… e.g. "safe mode"'
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-[10px] font-mono text-slate-500 uppercase">
                  {displayedRecordings.length} result{displayedRecordings.length !== 1 ? "s" : ""} for "{searchQuery}"
                </p>
              )}
              <div className="flex flex-col gap-3">
                {displayedRecordings.length === 0 ? (
                  <div className="text-center py-12 text-slate-600 font-mono text-sm">
                    No recordings match your query.
                  </div>
                ) : (
                  displayedRecordings.map(r => (
                    <RecordingCard
                      key={r.id}
                      recording={r}
                      onDelete={onDeleteRecording}
                      onGetAudioURL={onGetAudioURL}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === "timeline" && (
            <div className="flex flex-col gap-3">
              {recordings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <AudioLines className="w-10 h-10 text-slate-800" />
                  <p className="font-orbitron font-bold text-slate-600">No Voice Interactions Recorded</p>
                  <p className="text-xs font-mono text-slate-700 max-w-xs">
                    Activate the microphone and say "Computer, [command]" or "HAIL MARY, [command]" to begin recording.
                  </p>
                </div>
              ) : (
                recordings.map(r => (
                  <RecordingCard
                    key={r.id}
                    recording={r}
                    onDelete={onDeleteRecording}
                    onGetAudioURL={onGetAudioURL}
                  />
                ))
              )}
            </div>
          )}

          {/* JUDGE REVIEW TAB */}
          {activeTab === "judge" && (
            <div className="flex flex-col gap-5">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <h3 className="font-orbitron font-bold text-sm text-amber-400 mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Judge Review Mode — MVIAS Audit Panel
                </h3>
                <p className="text-xs font-mono text-slate-400 leading-relaxed">
                  This panel provides full transparency into every human-AI voice interaction during the mission.
                  Every command issued by human operators is recorded, transcribed, timestamped, and linked to
                  specific events and commander decisions, forming a verifiable chain of custody for all mission-critical actions.
                </p>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Recordings", value: recordings.length, color: "text-cyan-400" },
                  { label: "Human Overrides", value: recordings.filter(r => r.mode === "Human Override").length, color: "text-amber-400" },
                  { label: "Linked to Events", value: recordings.filter(r => r.linkedEventId).length, color: "text-fuchsia-400" },
                ].map(s => (
                  <div key={s.label} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-center">
                    <div className={`font-orbitron font-bold text-2xl ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] font-mono text-slate-500 uppercase mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Override Events Focus */}
              <div>
                <h4 className="text-[10px] font-mono text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Radio className="w-3 h-3 text-amber-400" /> Human Override Events
                </h4>
                <div className="flex flex-col gap-2">
                  {recordings.filter(r => r.mode === "Human Override").length === 0 ? (
                    <p className="text-xs font-mono text-slate-600 pl-2">No human overrides recorded during this mission.</p>
                  ) : (
                    recordings
                      .filter(r => r.mode === "Human Override")
                      .map(r => (
                        <RecordingCard
                          key={r.id}
                          recording={r}
                          onDelete={onDeleteRecording}
                          onGetAudioURL={onGetAudioURL}
                        />
                      ))
                  )}
                </div>
              </div>

              {/* All Commands */}
              <div>
                <h4 className="text-[10px] font-mono text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <AudioLines className="w-3 h-3 text-cyan-400" /> Complete Voice Audit Log
                </h4>
                <div className="flex flex-col gap-2">
                  {recordings.length === 0 ? (
                    <p className="text-xs font-mono text-slate-600 pl-2">No recordings yet.</p>
                  ) : (
                    recordings.map(r => (
                      <RecordingCard
                        key={r.id}
                        recording={r}
                        onDelete={onDeleteRecording}
                        onGetAudioURL={onGetAudioURL}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
