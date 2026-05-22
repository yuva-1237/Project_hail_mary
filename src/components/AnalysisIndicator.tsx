import React, { useEffect, useState } from "react";
import { Cpu, Terminal } from "lucide-react";

const diagnosticLogs = [
  "EVALUATING RESOURCE telemetry...",
  "CALCULATING DEVIATION vectors...",
  "ISOLATING FAILED power relays...",
  "RUNNING SIMULATION outcomes...",
  "SELECTING OPTIMAL respond vectors...",
];

export const AnalysisIndicator: React.FC = () => {
  const [logIndex, setLogIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % diagnosticLogs.length);
    }, 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-3 h-full select-none">
      {/* Circle scanning animation */}
      <div className="relative flex items-center justify-center w-14 h-14 mb-3">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border border-astrophage/20 animate-ping opacity-75" />
        
        {/* Spinning dashboard border */}
        <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-astrophage animate-spin" />
        
        {/* CPU center core */}
        <Cpu className="h-6 w-6 text-astrophage animate-pulse" />
      </div>

      <span className="text-[11px] font-mono font-bold text-white tracking-widest uppercase mb-1">
        Analyzing Event Telemetry...
      </span>

      <div className="flex items-center gap-1.5 font-mono text-[9px] text-astrophage/70 uppercase">
        <Terminal className="h-2.5 w-2.5" />
        <span className="animate-pulse">{diagnosticLogs[logIndex]}</span>
      </div>
    </div>
  );
};
export default AnalysisIndicator;
