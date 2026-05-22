import React from "react";
import { Sun, Activity, AlertTriangle } from "lucide-react";
import type { SpaceWeatherData } from "../hooks/useSpaceWeather";

interface SpaceWeatherWidgetProps {
  weather: SpaceWeatherData;
}

const SpaceWeatherWidget: React.FC<SpaceWeatherWidgetProps> = ({ weather }) => {
  const getColors = () => {
    switch (weather.status) {
      case "storm": return "border-cyber-red/50 bg-cyber-red/10 text-cyber-red";
      case "elevated": return "border-amber-500/50 bg-amber-500/10 text-amber-500";
      default: return "border-tau-teal/30 bg-tau-teal/5 text-tau-teal";
    }
  };

  const getIcon = () => {
    switch (weather.status) {
      case "storm": return <AlertTriangle className="h-4 w-4 animate-pulse glow-red" />;
      case "elevated": return <Activity className="h-4 w-4 animate-pulse" />;
      default: return <Sun className="h-4 w-4" />;
    }
  };

  const fluxDisplay = weather.xrayFlux ? weather.xrayFlux.toExponential(2) : "0.00e0";

  return (
    <div className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border backdrop-blur-sm ${getColors()} transition-colors`}>
      {getIcon()}
      <div className="flex flex-col">
        <span className="text-[9px] font-orbitron font-bold uppercase tracking-wider flex items-center gap-2">
          Space Weather
          {weather.isMock && <span className="text-[7px] px-1 py-0.5 rounded bg-slate-800 text-slate-400">OFFLINE MOCK</span>}
        </span>
        <span className="text-[10px] font-mono text-slate-300">
          X-Ray Flux: <span className="font-bold">{fluxDisplay}</span> W/m²
        </span>
      </div>
    </div>
  );
};

export default SpaceWeatherWidget;
