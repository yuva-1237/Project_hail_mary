import { useState, useEffect, useRef, useCallback } from "react";
import type { CMIMessage, CMIOrbState, CMIVoiceMode } from "../types/cmi";
import type { AIConfiguration } from "../ai/types";
import { SpeechHelper } from "../utils/speechHelper";
import { vectorMemory } from "../utils/vectorMemory";

// Direct speech recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface CMIActions {
  startMission: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  replayLastDecision: () => void;
  generateMissionReport: () => void;
  runWhatIfAnalysis: () => void;
  simulateDualFailure: () => void;
  exportAnalytics: () => void;
  switchMode: (mode: "space" | "earth") => void;
  highlightSection: (section: string) => void;
  openKnowledgeGraph: () => void;
  open3DView: () => void;
  approveAnomaly: () => void;
  rejectAnomaly: () => void;
  compareAlternatives: () => void;
  rerunSimulations: () => void;
}

export function useCMI(simState: any, actions: CMIActions, aiConfig: AIConfiguration) {
  const [messages, setMessages] = useState<CMIMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "HAIL MARY Conversational Mission Intelligence active. Operational metrics nominal. Standing by for voice queries.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [orbState, setOrbState] = useState<CMIOrbState>("idle");
  const [voiceMode, setVoiceMode] = useState<CMIVoiceMode>("ptt");
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [micVolume, setMicVolume] = useState(0);

  const recognitionRef = useRef<any>(null);
  const speechHelperRef = useRef<SpeechHelper | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Track state in refs for async listeners
  const orbStateRef = useRef<CMIOrbState>("idle");
  const voiceModeRef = useRef<CMIVoiceMode>("ptt");
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    orbStateRef.current = orbState;
  }, [orbState]);

  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);

  // Initialize Speech Synthesizer
  useEffect(() => {
    speechHelperRef.current = new SpeechHelper((speaking) => {
      isSpeakingRef.current = speaking;
      if (speaking) {
        setOrbState("speaking");
      } else {
        if (orbStateRef.current === "speaking") {
          setOrbState("idle");
        }
      }
    });

    return () => {
      if (speechHelperRef.current) {
        speechHelperRef.current.cancel();
      }
    };
  }, []);

  // Web Audio microphone level detection for pulsing visual orb
  const stopAudioAnalyser = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicVolume(0);
  };

  const startAudioAnalyser = async () => {
    try {
      stopAudioAnalyser();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current || orbStateRef.current !== "listening") {
          setMicVolume(0);
          return;
        }
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        // Map average volume [0, 128] to [0, 1] for Framer Motion scaling
        setMicVolume(Math.min(1, avg / 80));

        if (orbStateRef.current === "listening") {
          requestAnimationFrame(updateVolume);
        }
      };

      updateVolume();
    } catch (err) {
      console.warn("[CMI] Microhone level analysis access denied:", err);
    }
  };

  // Setup Web Speech API recognition
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("[CMI] Speech Recognition API not supported in this browser.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      setOrbState("listening");
      startAudioAnalyser();
    };

    rec.onresult = (event: any) => {
      // Barge-in (interrupt playback) if assistant is speaking
      if (isSpeakingRef.current && speechHelperRef.current) {
        speechHelperRef.current.cancel();
      }

      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        setCurrentTranscript(interim);
      }

      if (final) {
        setCurrentTranscript("");
        handleUserMessage(final.trim());
      }
    };

    rec.onerror = (e: any) => {
      if (e.error !== "no-speech") {
        console.warn("[CMI] Recognition error:", e.error);
        if (e.error === "not-allowed") {
          setVoiceMode("muted");
        }
      }
    };

    rec.onend = () => {
      stopAudioAnalyser();
      // Auto-restart in hands-free mode
      if (voiceModeRef.current === "hands-free") {
        try { rec.start(); } catch {}
      } else {
        setOrbState("idle");
      }
    };

    recognitionRef.current = rec;
  }, []);

  // Sync recognition instance based on voice mode
  useEffect(() => {
    initSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopAudioAnalyser();
    };
  }, [initSpeechRecognition]);

  useEffect(() => {
    if (!recognitionRef.current) return;

    if (voiceMode === "hands-free") {
      try {
        recognitionRef.current.start();
      } catch {}
    } else {
      try {
        recognitionRef.current.stop();
      } catch {}
      setOrbState("idle");
    }
  }, [voiceMode]);

  // Trigger recording manually in Push-To-Talk (PTT) mode
  const startPTTListening = () => {
    if (voiceMode !== "ptt" || !recognitionRef.current) return;
    if (isSpeakingRef.current && speechHelperRef.current) {
      speechHelperRef.current.cancel();
    }
    try {
      recognitionRef.current.start();
    } catch {}
  };

  const stopPTTListening = () => {
    if (voiceMode !== "ptt" || !recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {}
  };

  // Multi-modal structured action execution routing
  const executeCommandAction = (actionToken: string) => {
    console.log("[CMI Action Router] Executing:", actionToken);

    if (actionToken.startsWith("[ACTION:")) {
      const match = actionToken.match(/\[ACTION:\s*(\w+)\]/);
      if (!match) return;
      const act = match[1];

      switch (act) {
        case "start_mission":
          actions.startMission();
          break;
        case "pause_simulation":
          actions.pauseSimulation();
          break;
        case "resume_mission":
          actions.resumeSimulation();
          break;
        case "replay_last_decision":
          actions.replayLastDecision();
          break;
        case "generate_report":
          actions.generateMissionReport();
          break;
        case "run_what_if":
          actions.runWhatIfAnalysis();
          break;
        case "simulate_dual_failure":
          actions.simulateDualFailure();
          break;
        case "export_analytics":
          actions.exportAnalytics();
          break;
        case "switch_mode":
          const currentMode = simState.spacecraft.position.includes("Earth") ? "space" : "earth";
          actions.switchMode(currentMode === "space" ? "earth" : "space");
          break;
        case "open_kg":
          actions.openKnowledgeGraph();
          break;
        case "open_3d":
          actions.open3DView();
          break;
        case "approve_anomaly":
          actions.approveAnomaly();
          break;
        case "reject_anomaly":
          actions.rejectAnomaly();
          break;
        case "compare_alternatives":
          actions.compareAlternatives();
          break;
        case "rerun_simulations":
          actions.rerunSimulations();
          break;
        default:
          console.warn("[CMI Action Router] Unknown action:", act);
      }
    } else if (actionToken.startsWith("[HIGHLIGHT:")) {
      const match = actionToken.match(/\[HIGHLIGHT:\s*(\w+)\]/);
      if (!match) return;
      const section = match[1];
      actions.highlightSection(section);
    }
  };

  // Compile full mission context
  const buildSystemContext = async (userQuery: string): Promise<string> => {
    const sc = simState.spacecraft;
    const active = simState.activeEvent;
    const dec = simState.activeDecision;

    // 1. Fetch relevant vector memories locally
    const memories = await vectorMemory.searchEntries({
      query: userQuery,
      apiKey: aiConfig.openaiApiKey,
      limit: 3
    });

    const memoryString = memories.length > 0
      ? memories.map(m => `* [${m.entry.type}] ${m.entry.text}`).join("\n")
      : "No matching memory records.";

    // 2. Format spacecraft telemetry
    const telemetry = `
Spacecraft State:
- Progress: ${sc.missionProgress.toFixed(1)}%
- Hull Health: ${sc.health.toFixed(1)}%
- Fuel: ${sc.fuel.toFixed(1)}%
- Reactor Power: ${sc.power.toFixed(1)}%
- Cabin Oxygen: ${sc.oxygen.toFixed(1)}%
- Temperature: ${sc.temperature}°C
- Velocity: ${sc.velocity} km/s
- Position: ${sc.position}
- Network: ${sc.communication ? "ONLINE" : "SIGNAL LOSS"}
- Mission Grade: ${simState.missionScore.grade} (Overall: ${simState.missionScore.overall}%)
- Success Probability: ${simState.successProbability}%
`;

    // 3. Add context for events and objectives
    const environmentalContext = `
Active Alert: ${active ? `${active.title} (${active.severity}) - ${active.description}` : "None"}
Commander Recommendations: ${dec ? `"${dec.selectedAction}". Reasoning: ${dec.reasoning}` : "None"}
Crew Status: ${simState.crew.map((c: any) => `${c.name} (${c.role}): Health ${c.health}%, Morale ${c.morale}%`).join(", ")}
Mission Objectives:
${simState.objectives.map((o: any) => `- ${o.title}: ${o.status}`).join("\n")}
`;

    // 4. Standard Instructions
    const instructions = `
You are CMI (Conversational Mission Intelligence), the calm, technically precise voice commander of the HAIL MARY.
Respond directly in a supportive, professional, NASA Flight Director style.
Keep your spoken responses short (1-3 sentences maximum) for fluid TTS conversations, unless specifically asked for details.

Available System Actions (You can execute actions on the dashboard by appending these tokens exactly to the END of your text response):
- Start Sim: [ACTION: start_mission]
- Pause Sim: [ACTION: pause_simulation]
- Resume Sim: [ACTION: resume_mission]
- Open Replay: [ACTION: replay_last_decision]
- Export PDF Report: [ACTION: generate_report]
- What-If Sandbox: [ACTION: run_what_if]
- Inject Dual Failure: [ACTION: simulate_dual_failure]
- Open Analytics: [ACTION: export_analytics]
- Switch Space/Earth Modes: [ACTION: switch_mode]
- Open Graph: [ACTION: open_kg]
- Open 3D View: [ACTION: open_3d]
- Approve Recommendation: [ACTION: approve_anomaly]
- Reject Recommendation: [ACTION: reject_anomaly]
- Compare Alternatives: [ACTION: compare_alternatives]
- Rerun Simulations: [ACTION: rerun_simulations]

You can highlight metrics by appending:
- [HIGHLIGHT: fuel]
- [HIGHLIGHT: power]
- [HIGHLIGHT: oxygen]
- [HIGHLIGHT: health]
- [HIGHLIGHT: velocity]
- [HIGHLIGHT: progress]
- [HIGHLIGHT: crew]
- [HIGHLIGHT: objectives]
- [HIGHLIGHT: 3d]
- [HIGHLIGHT: intelligence]

Retrieve Past Records:
${memoryString}
`;

    return telemetry + environmentalContext + instructions;
  };

  // Streaming AI response orchestrator
  const streamAIResponse = async (userQuery: string, systemContext: string) => {
    setOrbState("thinking");

    const newAssistantMessageId = `assist-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: newAssistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString()
    }]);

    let fullText = "";
    let sentenceBuffer = "";

    const queueSentenceForTTS = (text: string) => {
      // Strip action tokens from voice synthesis
      const cleanSpeak = text
        .replace(/\[ACTION:\s*\w+\]/g, "")
        .replace(/\[HIGHLIGHT:\s*\w+\]/g, "")
        .trim();

      if (cleanSpeak && speechHelperRef.current) {
        // Choose TTS provider based on keys
        let provider: "browser" | "openai" | "elevenlabs" = "browser";
        let apiKey = "";

        if (aiConfig.openaiApiKey && aiConfig.openaiApiKey.startsWith("sk-")) {
          provider = "openai";
          apiKey = aiConfig.openaiApiKey;
        }

        speechHelperRef.current.queueSentence(cleanSpeak, provider, apiKey);
      }
    };

    // ── FALLBACK OFFLINE MOCK STREAMING ──
    const handleMockResponse = () => {
      let reply = "Scanning subsystems. Telemetry checks are currently nominal. Please define query parameter.";

      const q = userQuery.toLowerCase();
      if (q.includes("status") || q.includes("hail mary")) {
        reply = `Spacecraft telemetry stands at fuel ${simState.spacecraft.fuel.toFixed(0)}%, hull health ${simState.spacecraft.health.toFixed(0)}%, reactor power ${simState.spacecraft.power.toFixed(0)}%. [HIGHLIGHT: health]`;
      } else if (q.includes("risk") || q.includes("danger") || q.includes("alert")) {
        if (simState.activeEvent) {
          reply = `Active alert detected: ${simState.activeEvent.title}. Severity: ${simState.activeEvent.severity}. I recommend executing corrective actions immediately. [HIGHLIGHT: intelligence]`;
        } else {
          reply = "No active environmental anomalies detected. System success probability stands at ninety-five percent. [HIGHLIGHT: progress]";
        }
      } else if (q.includes("explain") || q.includes("storm") || q.includes("survive")) {
        reply = "We successfully navigated the solar storm by entering Safe Mode. Our digital twin simulations calculated a ninety-two percent success rate, preventing hull damage. [ACTION: open_kg]";
      } else if (q.includes("pause")) {
        reply = "Acknowledged. Pausing mission simulation. [ACTION: pause_simulation]";
      } else if (q.includes("resume") || q.includes("start")) {
        reply = "Understood. Resuming autopilot course trajectory. [ACTION: resume_mission]";
      } else if (q.includes("replay")) {
        reply = "Opening DVR flight logs panel. [ACTION: replay_last_decision]";
      } else if (q.includes("report")) {
        reply = "Exporting post-mission autopsy report. [ACTION: generate_report]";
      } else if (q.includes("what-if") || q.includes("what if")) {
        reply = "Initiating digital twin sandbox variables. [ACTION: run_what_if]";
      } else if (q.includes("dual") || q.includes("failure")) {
        reply = "Critical warning: Injecting reactor and antenna dual failure sequence. [ACTION: simulate_dual_failure]";
      } else if (q.includes("analytics") || q.includes("performance")) {
        reply = "Loading advanced mission telemetry charts. [ACTION: export_analytics]";
      } else if (q.includes("earth") || q.includes("twin")) {
        reply = "Swapping dashboard coordinates to terrestrial emergency dispatch state. [ACTION: switch_mode]";
      } else if (q.includes("3d") || q.includes("ship")) {
        reply = "Opening three dimensional structural viewer. [ACTION: open_3d]";
      }

      // Stream the mock reply word-by-word
      const words = reply.split(" ");
      let wordIdx = 0;
      setOrbState("speaking");

      const interval = setInterval(() => {
        if (wordIdx >= words.length) {
          clearInterval(interval);
          setOrbState("idle");

          // Parse actions out of final text
          const actionMatches = reply.match(/\[ACTION:\s*\w+\]/g) || [];
          const highlightMatches = reply.match(/\[HIGHLIGHT:\s*\w+\]/g) || [];

          [...actionMatches, ...highlightMatches].forEach(executeCommandAction);

          // Save final dialogue to vector memory
          vectorMemory.saveEntry({
            text: `Operator: ${userQuery}\nAssistant: ${reply}`,
            type: "conversation",
            apiKey: aiConfig.openaiApiKey
          }).catch(console.warn);

          return;
        }

        const nextWord = words[wordIdx];
        fullText += (wordIdx === 0 ? "" : " ") + nextWord;
        sentenceBuffer += (wordIdx === 0 ? "" : " ") + nextWord;

        setMessages(prev => prev.map(m => m.id === newAssistantMessageId ? { ...m, content: fullText } : m));

        // Sentence detection for fluid speaking
        if (/[.!?]/.test(nextWord) || nextWord.includes("]") ) {
          queueSentenceForTTS(sentenceBuffer);
          sentenceBuffer = "";
        }

        wordIdx++;
      }, 180);
    };

    // ── CLOUD LLM STREAMING ──
    const provider = aiConfig.provider;
    const apiKey = provider === "openai" ? aiConfig.openaiApiKey : provider === "gemini" ? aiConfig.geminiApiKey : "";

    if (provider === "mock" || !apiKey) {
      handleMockResponse();
      return;
    }

    try {
      let response: Response;

      if (provider === "openai") {
        response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemContext },
              { role: "user", content: userQuery }
            ],
            temperature: 0.3,
            stream: true
          })
        });
      } else {
        // Gemini streaming
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`;
        response = await fetch(geminiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemContext }] },
            contents: [{ parts: [{ text: userQuery }] }],
            generationConfig: { temperature: 0.3 }
          })
        });
      }

      if (!response.ok) {
        throw new Error(`Cloud stream request failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Null stream reader");

      const decoder = new TextDecoder();
      let buffer = "";

      setOrbState("speaking");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;

          let chunkText = "";

          if (provider === "openai") {
            if (cleanLine.startsWith("data: ")) {
              const dataStr = cleanLine.slice(6);
              if (dataStr === "[DONE]") break;
              try {
                const parsed = JSON.parse(dataStr);
                chunkText = parsed.choices?.[0]?.delta?.content || "";
              } catch {}
            }
          } else {
            // Gemini JSON structure chunk streaming
            try {
              if (cleanLine.startsWith(",")) {
                // Remove leading separator in JSON arrays
                const parsed = JSON.parse(cleanLine.slice(1));
                chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
              } else if (cleanLine.startsWith("[")) {
                // Start of stream
                const parsed = JSON.parse(cleanLine.slice(1));
                chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
              } else {
                const parsed = JSON.parse(cleanLine);
                chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
              }
            } catch {}
          }

          if (chunkText) {
            fullText += chunkText;
            sentenceBuffer += chunkText;

            setMessages(prev => prev.map(m => m.id === newAssistantMessageId ? { ...m, content: fullText } : m));

            // Queue a sentence when it finishes
            if (/[.!?\n]/.test(chunkText)) {
              queueSentenceForTTS(sentenceBuffer);
              sentenceBuffer = "";
            }
          }
        }
      }

      // Speak remaining chunks
      if (sentenceBuffer.trim()) {
        queueSentenceForTTS(sentenceBuffer);
      }

      // Check actions/highlights in completed response
      const actionMatches = fullText.match(/\[ACTION:\s*\w+\]/g) || [];
      const highlightMatches = fullText.match(/\[HIGHLIGHT:\s*\w+\]/g) || [];
      [...actionMatches, ...highlightMatches].forEach(executeCommandAction);

      // Save dialogue to IndexedDB memory
      vectorMemory.saveEntry({
        text: `Operator: ${userQuery}\nAssistant: ${fullText}`,
        type: "conversation",
        apiKey: aiConfig.openaiApiKey
      }).catch(console.warn);

      setOrbState("idle");

    } catch (err) {
      console.warn("[CMI] Streaming failed, using offline mock fallback:", err);
      // Clean up failed stream UI
      setMessages(prev => prev.filter(m => m.id !== newAssistantMessageId));
      handleMockResponse();
    }
  };

  // Submit standard user voice text to conversation loop
  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    // Interrupt any active voice synthesis
    if (speechHelperRef.current) {
      speechHelperRef.current.cancel();
    }

    const userMsg: CMIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);

    const context = await buildSystemContext(text);
    await streamAIResponse(text, context);
  };

  // Voice actions
  const toggleVoiceMode = () => {
    setVoiceMode(prev => {
      if (prev === "muted") return "ptt";
      if (prev === "ptt") return "hands-free";
      return "muted";
    });
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Logs purged. HAIL MARY Conversational Mission Intelligence ready.",
        timestamp: new Date().toISOString()
      }
    ]);
    vectorMemory.clear().catch(console.warn);
  };

  return {
    messages,
    orbState,
    voiceMode,
    currentTranscript,
    micVolume,
    sendMessage: handleUserMessage,
    toggleVoiceMode,
    startPTTListening,
    stopPTTListening,
    clearChatHistory
  };
}
