import { useState, useEffect } from 'react';

export interface SpaceWeatherData {
  status: "nominal" | "elevated" | "storm";
  xrayFlux: number;
  description: string;
  isMock: boolean;
}

export function useSpaceWeather() {
  const [weather, setWeather] = useState<SpaceWeatherData>({
    status: "nominal",
    xrayFlux: 0,
    description: "Initializing space weather array...",
    isMock: false
  });

  useEffect(() => {
    let mounted = true;

    async function fetchWeather() {
      try {
        const res = await fetch("https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json");
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0 && mounted) {
          const latest = data[data.length - 1];
          const flux = latest.flux;
          let status: SpaceWeatherData["status"] = "nominal";
          let description = "Solar activity is stable. Minimal radiation.";
          
          // M or X class
          if (flux >= 1e-5) { 
            status = "storm";
            description = "CRITICAL: Major solar flare detected! High radiation risk.";
          } else if (flux >= 1e-6) { 
            status = "elevated";
            description = "WARNING: Elevated solar x-ray flux. Comms interference possible.";
          }

          setWeather({ status, xrayFlux: flux, description, isMock: false });
          return;
        }
      } catch (err) {
        if (!mounted) return;
        // Deterministic fallback based on minutes
        const minute = new Date().getMinutes();
        if (minute % 5 === 0) {
          setWeather({ status: "storm", xrayFlux: 1.5e-5, description: "[OFFLINE MOCK] Coronal Mass Ejection detected.", isMock: true });
        } else if (minute % 2 === 0) {
          setWeather({ status: "elevated", xrayFlux: 2.5e-6, description: "[OFFLINE MOCK] Elevated solar winds.", isMock: true });
        } else {
          setWeather({ status: "nominal", xrayFlux: 5.0e-8, description: "[OFFLINE MOCK] Solar activity nominal.", isMock: true });
        }
      }
    }

    fetchWeather();
    const interval = setInterval(fetchWeather, 60000); // Poll every minute
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return weather;
}
