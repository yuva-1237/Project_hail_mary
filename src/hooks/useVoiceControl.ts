import { useState, useEffect, useCallback, useRef } from "react";

// Add TypeScript definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type VoiceCommandAction = "PAUSE" | "RESUME" | "STATUS" | "APPROVE" | "ABORT" | "REJECT" | "COMPARE" | "RERUN";

export interface VoiceCommandResult {
  action: VoiceCommandAction;
  transcript: string;
  audioBlob: Blob | null;
  durationMs: number;
}

export const useVoiceControl = (onCommand: (result: VoiceCommandResult) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const pendingCommandRef = useRef<VoiceCommandAction | null>(null);
  const pendingTranscriptRef = useRef<string>("");

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        const text = lastResult[0].transcript.toLowerCase().trim();
        setTranscript(text);

        if (text.includes("hail mary") || text.includes("computer")) {
          let command: VoiceCommandAction | null = null;
          if (text.includes("pause")) command = "PAUSE";
          else if (text.includes("resume") || text.includes("start")) command = "RESUME";
          else if (text.includes("status") || text.includes("report")) command = "STATUS";
          else if (text.includes("approve") || text.includes("execute") || text.includes("confirm")) command = "APPROVE";
          else if (text.includes("reject") || text.includes("disapprove")) command = "REJECT";
          else if (text.includes("compare") || text.includes("alternatives")) command = "COMPARE";
          else if (text.includes("rerun") || text.includes("simulate")) command = "RERUN";
          else if (text.includes("abort") || text.includes("cancel")) command = "ABORT";

          if (command) {
            pendingCommandRef.current = command;
            pendingTranscriptRef.current = text;
            
            // Stop recorder to finalize the chunk and trigger the command
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.stop();
            } else {
              // If no media recorder, just dispatch immediately
              onCommand({
                action: command,
                transcript: text,
                audioBlob: null,
                durationMs: 0
              });
            }
          }
        }
      };

      rec.onerror = (event: any) => {
        console.error("Voice recognition error:", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        // Auto-restart if it was supposed to be listening
        if (isListening) {
          rec.start();
        }
      };

      setRecognition(rec);
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const duration = Date.now() - startTimeRef.current;
        
        // If a command was pending when stopped, trigger it with the audio blob
        if (pendingCommandRef.current) {
          onCommand({
            action: pendingCommandRef.current,
            transcript: pendingTranscriptRef.current,
            audioBlob,
            durationMs: duration
          });
          pendingCommandRef.current = null;
          pendingTranscriptRef.current = "";
        }
        
        audioChunksRef.current = [];
        // If we are still supposed to be listening, immediately restart recording
        if (isListening) {
          audioChunksRef.current = [];
          startTimeRef.current = Date.now();
          mediaRecorder.start();
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      return mediaRecorder;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      return null;
    }
  };

  useEffect(() => {
    const handleListeningChange = async () => {
      if (isListening) {
        if (!mediaRecorderRef.current) {
          await initializeMediaRecorder();
        }
        if (recognition) {
          try { recognition.start(); } catch(e) { /* Ignore */ }
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
          audioChunksRef.current = [];
          startTimeRef.current = Date.now();
          mediaRecorderRef.current.start();
        }
      } else {
        if (recognition) {
          recognition.stop();
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      }
    };

    handleListeningChange();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, recognition]);

  const toggleListening = useCallback(() => {
    setIsListening(prev => !prev);
  }, []);

  return { isListening, toggleListening, transcript, supported: !!recognition };
};
