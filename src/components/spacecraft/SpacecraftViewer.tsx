import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, PerspectiveCamera } from "@react-three/drei";
import Spacecraft3D from "./Spacecraft3D";
import type { SpacecraftState } from "../../data/spacecraft";

interface SpacecraftViewerProps {
  spacecraft: SpacecraftState;
  activeEventSeverity?: "Low" | "Medium" | "High" | "Critical" | null;
}

export default function SpacecraftViewer({ spacecraft, activeEventSeverity }: SpacecraftViewerProps) {
  const [loaded, setLoaded] = useState(false);

  const fuelPct = spacecraft.fuel;
  const healthPct = spacecraft.health;
  const powerPct = spacecraft.power;
  const isAlarm = healthPct < 30 || activeEventSeverity === "Critical";

  return (
    <div
      className="w-full h-full min-h-[420px] rounded-xl overflow-hidden relative"
      style={{ background: "radial-gradient(ellipse at 40% 50%, #020b1a 0%, #000510 100%)" }}
    >
      {/* Sci-fi border */}
      <div className="absolute inset-0 rounded-xl border border-cyan-500/25 pointer-events-none z-20" />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-xl z-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-xl z-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-xl z-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400/50 rounded-br-xl z-30 pointer-events-none" />

      {/* Header badge */}
      <div className="absolute top-3 left-5 z-30 pointer-events-none flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
        <span className="text-[9px] font-mono font-bold text-cyan-400 tracking-[0.2em] uppercase">Live Digital Twin · Telemetry Sync Active</span>
      </div>

      {/* Top-right telemetry pills */}
      <div className="absolute top-3 right-5 z-30 pointer-events-none flex items-center gap-2">
        <div className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest border ${fuelPct > 40 ? "text-cyan-300 border-cyan-500/30 bg-cyan-900/20" : fuelPct > 15 ? "text-amber-300 border-amber-500/30 bg-amber-900/20" : "text-red-300 border-red-500/30 bg-red-900/20 animate-pulse"}`}>
          FUEL {fuelPct}%
        </div>
        <div className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest border ${healthPct > 60 ? "text-emerald-300 border-emerald-500/30 bg-emerald-900/20" : healthPct > 30 ? "text-amber-300 border-amber-500/30 bg-amber-900/20" : "text-red-300 border-red-500/30 bg-red-900/20 animate-pulse"}`}>
          HULL {healthPct}%
        </div>
        <div className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest border ${powerPct > 40 ? "text-blue-300 border-blue-500/30 bg-blue-900/20" : "text-amber-300 border-amber-500/30 bg-amber-900/20"}`}>
          PWR {powerPct}%
        </div>
      </div>

      {/* Loading overlay (fades out once canvas mounts) */}
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <div className="text-[10px] font-mono text-cyan-400/60 tracking-[0.25em] uppercase animate-pulse">
            Initialising Digital Twin...
          </div>
        </div>
      )}

      {/* Bottom info bar */}
      <div className="absolute bottom-3 left-5 right-5 z-30 pointer-events-none flex items-end justify-between">
        <div className="text-[8px] font-mono text-slate-500 uppercase leading-4">
          <div>{spacecraft.position}</div>
          <div>V = {spacecraft.velocity.toLocaleString()} km/s</div>
        </div>
        {isAlarm && (
          <div className="text-[9px] font-mono font-bold text-red-400 tracking-widest animate-pulse border border-red-500/30 bg-red-900/20 px-2 py-0.5 rounded">
            ⚠ CRITICAL ALERT
          </div>
        )}
        <div className="text-[8px] font-mono text-slate-500 uppercase text-right leading-4">
          <div>Progress {spacecraft.missionProgress.toFixed(0)}%</div>
          <div>Drag to orbit · Scroll to zoom</div>
        </div>
      </div>

      {/* THREE.js Canvas */}
      <Canvas
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        shadows
        onCreated={() => setLoaded(true)}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Custom camera — wide enough to show the full horizontal craft */}
        <PerspectiveCamera makeDefault position={[0, 2.5, 8]} fov={55} near={0.1} far={500} />

        <color attach="background" args={["#000814"]} />

        {/* ── Lighting ── */}
        {/* Key light — cool white from upper-left */}
        <directionalLight position={[-6, 8, 4]} intensity={2.2} color="#cce8ff" castShadow
          shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} />
        {/* Fill light — warm from lower-right */}
        <directionalLight position={[8, -4, -6]} intensity={0.6} color="#fde68a" />
        {/* Rim light — cyan from behind */}
        <directionalLight position={[0, 2, -10]} intensity={0.8} color="#06b6d4" />
        {/* Ambient */}
        <ambientLight intensity={0.15} color="#1e293b" />
        {/* Engine glow point */}
        <pointLight position={[4.5, 0, 0]} intensity={1.5} color="#f59e0b" distance={6} />

        {/* ── Background ── */}
        <Stars radius={120} depth={60} count={6000} factor={3} saturation={0} fade speed={0.5} />

        {/* ── Coordinate reference plane ── */}
        <gridHelper args={[28, 28, "#06b6d4", "#0f172a"]} position={[0, -2.5, 0]} />

        <Suspense fallback={null}>
          <Spacecraft3D spacecraft={spacecraft} activeEventSeverity={activeEventSeverity} />
        </Suspense>

        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          enableZoom
          minDistance={4}
          maxDistance={16}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={(Math.PI * 3) / 4}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
