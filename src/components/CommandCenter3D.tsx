import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import type { SpacecraftState } from '../data/spacecraft';
import * as THREE from 'three';

interface SpacecraftModelProps {
  state: SpacecraftState;
}

function SpacecraftModel({ state }: SpacecraftModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const commsRef = useRef<THREE.Mesh>(null);
  const engineGlowRef = useRef<THREE.Mesh>(null);

  useFrame((clockState) => {
    const t = clockState.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t / 4) * 0.2;
      groupRef.current.rotation.z = Math.cos(t / 5) * 0.1;
    }
    if (commsRef.current && state.communication) {
      commsRef.current.rotation.y += 0.05;
    }
    if (engineGlowRef.current) {
      // Pulse engine glow based on fuel
      const intensity = state.fuel > 10 ? Math.sin(t * 10) * 0.2 + 0.8 : 0.2;
      (engineGlowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
    }
  });

  const isDamaged = state.health < 50;
  const hullColor = isDamaged ? "#ff4444" : "#e2e8f0";
  const panelColor = state.power < 40 ? "#1e293b" : "#0ea5e9";
  const commsColor = state.communication ? "#10b981" : "#ff4444";

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main Fuselage */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 4, 32]} />
        <meshStandardMaterial color={hullColor} metalness={0.8} roughness={0.2} emissive={isDamaged ? "#ff0000" : "#000000"} emissiveIntensity={isDamaged ? 0.5 : 0} />
      </mesh>

      {/* Solar Panels */}
      <mesh position={[-2.5, 0, 0]}>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color={panelColor} metalness={0.9} roughness={0.1} emissive={panelColor} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[2.5, 0, 0]}>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color={panelColor} metalness={0.9} roughness={0.1} emissive={panelColor} emissiveIntensity={0.2} />
      </mesh>

      {/* Comms Array */}
      <mesh ref={commsRef} position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={commsColor} emissive={commsColor} emissiveIntensity={state.communication ? 0.8 : 0.2} />
      </mesh>

      {/* Engine */}
      <mesh position={[0, -2.5, 0]}>
        <coneGeometry args={[1.2, 1, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.9} />
      </mesh>
      
      {/* Engine Glow */}
      <mesh ref={engineGlowRef} position={[0, -3.2, 0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

export default function CommandCenter3D({ state, onClose }: { state: SpacecraftState; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
      <div className="absolute top-4 right-4 z-10">
        <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 hover:text-white font-mono text-sm border border-slate-600 transition-colors">
          CLOSE COMMAND CENTER
        </button>
      </div>
      
      {/* Overlays */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h2 className="text-3xl font-orbitron font-bold text-cyan-400 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
          Project Hail Mary
        </h2>
        <p className="font-mono text-sm text-slate-400 uppercase tracking-widest mt-2">
          3D Telemetry Visualizer
        </p>
        
        <div className="mt-8 flex flex-col gap-4 pointer-events-auto">
          <div className="bg-slate-900/60 p-4 border border-slate-700/50 rounded-lg backdrop-blur-md w-48 shadow-lg">
            <h3 className="font-mono text-xs text-slate-500 uppercase">Hull Integrity</h3>
            <p className={`font-mono text-2xl font-bold mt-1 ${state.health < 50 ? 'text-cyber-red animate-pulse' : 'text-cyber-green'}`}>
              {state.health}%
            </p>
          </div>
          <div className="bg-slate-900/60 p-4 border border-slate-700/50 rounded-lg backdrop-blur-md w-48 shadow-lg">
            <h3 className="font-mono text-xs text-slate-500 uppercase">Power Grid</h3>
            <p className={`font-mono text-2xl font-bold mt-1 ${state.power < 40 ? 'text-amber-500' : 'text-cyber-green'}`}>
              {state.power}%
            </p>
          </div>
          <div className="bg-slate-900/60 p-4 border border-slate-700/50 rounded-lg backdrop-blur-md w-48 shadow-lg">
            <h3 className="font-mono text-xs text-slate-500 uppercase">Comms Relay</h3>
            <p className={`font-mono text-2xl font-bold mt-1 ${state.communication ? 'text-cyber-green' : 'text-cyber-red animate-pulse'}`}>
              {state.communication ? 'ONLINE' : 'OFFLINE'}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full h-full cursor-move">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0ea5e9" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Sparkles count={100} scale={12} size={2} speed={0.4} opacity={0.1} color="#0ea5e9" />
          
          <SpacecraftModel state={state} />
          
          <OrbitControls 
            enablePan={false} 
            minDistance={5} 
            maxDistance={20} 
            autoRotate 
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>
    </div>
  );
}
