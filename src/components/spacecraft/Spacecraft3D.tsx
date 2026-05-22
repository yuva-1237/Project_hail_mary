import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SpacecraftState } from "../../data/spacecraft";

interface Spacecraft3DProps {
  spacecraft: SpacecraftState;
  activeEventSeverity?: "Low" | "Medium" | "High" | "Critical" | null;
}

export default function Spacecraft3D({ spacecraft, activeEventSeverity }: Spacecraft3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const dishRef = useRef<THREE.Group>(null);
  const solarTopRef = useRef<THREE.Group>(null);
  const solarBottomRef = useRef<THREE.Group>(null);
  const enginesRef = useRef<THREE.Group>(null);
  const hullLightsRef = useRef<THREE.Group>(null);

  // ── Telemetry ──────────────────────────────────────────────────────────────
  const fuel = spacecraft.fuel;
  const power = spacecraft.power;
  const health = spacecraft.health;
  const isConnected = spacecraft.communication;
  const progress = spacecraft.missionProgress;
  const isManeuver = (progress > 10 && progress < 35) || (progress > 70 && progress < 90);
  const isEmergency = health < 30 || activeEventSeverity === "Critical";

  // ── Dynamic material colors ────────────────────────────────────────────────
  const hullColor = fuel > 40 ? "#dde3ee" : fuel > 15 ? "#f59e0b" : "#ef4444";
  const shieldColor = health > 75 ? "#10b981" : health > 30 ? "#f59e0b" : "#ef4444";
  const powerGlow = Math.max(0.05, power / 100);

  // ── Reusable materials ─────────────────────────────────────────────────────
  const mat = useMemo(() => ({
    hull: new THREE.MeshStandardMaterial({ color: hullColor, metalness: 0.3, roughness: 0.6 }),
    goldBand: new THREE.MeshStandardMaterial({ color: "#c9a227", metalness: 0.9, roughness: 0.2 }),
    truss: new THREE.MeshStandardMaterial({ color: "#374151", metalness: 0.85, roughness: 0.45 }),
    solar: new THREE.MeshStandardMaterial({ color: "#0a1628", emissive: new THREE.Color("#0284c7"), emissiveIntensity: powerGlow, metalness: 0.95, roughness: 0.05 }),
    radiator: new THREE.MeshStandardMaterial({ color: "#f1f5f9", metalness: 0.1, roughness: 0.85 }),
    nozzle: new THREE.MeshStandardMaterial({ color: "#6b7280", metalness: 0.9, roughness: 0.5 }),
    greeble: new THREE.MeshStandardMaterial({ color: "#9ca3af", metalness: 0.5, roughness: 0.7 }),
    pipe: new THREE.MeshStandardMaterial({ color: "#4b5563", metalness: 0.95, roughness: 0.15 }),
    window: new THREE.MeshStandardMaterial({ color: "#0ea5e9", emissive: new THREE.Color("#0ea5e9"), emissiveIntensity: 0.6, metalness: 1, roughness: 0 }),
  }), [hullColor, powerGlow]);

  // ── Animation loop ─────────────────────────────────────────────────────────
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // Slow gentle float + Y rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.08;
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.08;
    }

    // Dish tracking rotation
    if (dishRef.current) {
      dishRef.current.rotation.y = t * 0.6;
    }

    // Solar panel gentle flexing
    if (solarTopRef.current) solarTopRef.current.rotation.z = Math.sin(t * 0.15) * 0.06;
    if (solarBottomRef.current) solarBottomRef.current.rotation.z = -Math.sin(t * 0.15) * 0.06;

    // Engine plasma visibility
    if (enginesRef.current) {
      enginesRef.current.visible = isManeuver;
      if (isManeuver) {
        const flicker = 1 + Math.random() * 0.3;
        enginesRef.current.scale.setScalar(flicker);
      }
    }

    // Nav lights pulsing
    if (hullLightsRef.current) {
      hullLightsRef.current.children.forEach((c: any, i) => {
        if (c.material) {
          if (isEmergency) {
            c.material.emissiveIntensity = (Math.sin(t * 10 + i) + 1) * 2.5;
            c.material.emissive.setHex(0xef4444);
          } else {
            c.material.emissiveIntensity = Math.sin(t * 1.5 + i * 1.2) > 0 ? 1.2 : 0.1;
            c.material.emissive.setHex(isConnected ? 0x06b6d4 : 0x374151);
          }
        }
      });
    }
  });

  // ── Geometry helpers ───────────────────────────────────────────────────────
  // The spacecraft is oriented horizontally along the X axis
  // Total span ≈ ±3.5 on X, ±0.8 on Y and Z — fits neatly in camera frustum

  return (
    <group ref={groupRef} dispose={null}>

      {/* ── Central spine (horizontal truss along X) ── */}
      <mesh material={mat.truss} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 7, 10]} />
      </mesh>

      {/* ── Main propellant tank (centre, largest) ── */}
      <group position={[0, 0, 0]}>
        <mesh material={mat.hull} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.55, 0.55, 2.2, 32]} />
        </mesh>
        {/* gold thermal bands */}
        {[-0.7, 0, 0.7].map((x, i) => (
          <mesh key={i} material={mat.goldBand} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.57, 0.57, 0.07, 32]} />
          </mesh>
        ))}
        {/* side greeble conduits */}
        {[0.45, -0.45].map((z, i) => (
          <mesh key={i} material={mat.pipe} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 2.2, 8]} />
          </mesh>
        ))}
      </group>

      {/* ── Secondary tank (right) ── */}
      <group position={[2.1, 0, 0]}>
        <mesh material={mat.hull} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.38, 1.4, 32]} />
        </mesh>
        {[-0.45, 0.45].map((x, i) => (
          <mesh key={i} material={mat.goldBand} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.06, 32]} />
          </mesh>
        ))}
      </group>

      {/* ── Engine / thruster module (right end) ── */}
      <group position={[3.2, 0, 0]}>
        {/* mounting ring */}
        <mesh material={mat.truss} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 0.35, 16]} />
        </mesh>
        {/* 4 nozzles arranged in a square */}
        {([-0.22, 0.22] as number[]).flatMap((y) =>
          ([-0.22, 0.22] as number[]).map((z, j) => (
            <mesh key={`n-${y}-${j}`} material={mat.nozzle} position={[0.35, y, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.2, 0.5, 14]} />
            </mesh>
          ))
        )}
      </group>

      {/* ── Engine plasma plumes (only during maneuver) ── */}
      <group ref={enginesRef} position={[3.75, 0, 0]}>
        {([-0.22, 0.22] as number[]).flatMap((y) =>
          ([-0.22, 0.22] as number[]).map((z, j) => (
            <group key={`p-${y}-${j}`} position={[0, y, z]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.18, 0.04, 1.2, 12]} />
                <meshBasicMaterial color="#3b82f6" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]} position={[0.2, 0, 0]}>
                <cylinderGeometry args={[0.09, 0.02, 0.7, 12]} />
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]} position={[0.35, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.01, 0.35, 8]} />
                <meshBasicMaterial color="#ffffff" blending={THREE.AdditiveBlending} depthWrite={false} />
              </mesh>
            </group>
          ))
        )}
      </group>

      {/* ── Command / science module (left side) ── */}
      <group position={[-2.3, 0, 0]}>
        {/* main body */}
        <mesh material={mat.hull} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.48, 0.42, 1.2, 16]} />
        </mesh>
        {/* viewport windows */}
        {[0.2, -0.2].map((z, i) => (
          <mesh key={i} material={mat.window} position={[-0.05, 0.4, z]}>
            <sphereGeometry args={[0.07, 12, 12]} />
          </mesh>
        ))}
        {/* sensor dome */}
        <mesh material={mat.greeble} position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        </mesh>
      </group>

      {/* ── Solar arrays (top & bottom wings, along Z) ── */}
      {/* top yoke */}
      <mesh material={mat.truss} position={[0.3, 0.55, 0]}>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
      </mesh>
      {/* bottom yoke */}
      <mesh material={mat.truss} position={[0.3, -0.55, 0]}>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
      </mesh>

      {/* top solar panel */}
      <group ref={solarTopRef} position={[0.3, 0.85, 0]}>
        <mesh material={mat.solar}>
          <boxGeometry args={[1.4, 0.04, 3.0]} />
        </mesh>
        {/* cell lines */}
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[0, 0.025, -1.0 + i * 0.5]}>
            <boxGeometry args={[1.35, 0.01, 0.38]} />
            <meshStandardMaterial color="#001f3f" emissive={new THREE.Color("#0284c7")} emissiveIntensity={powerGlow * 0.5} />
          </mesh>
        ))}
      </group>

      {/* bottom solar panel */}
      <group ref={solarBottomRef} position={[0.3, -0.85, 0]}>
        <mesh material={mat.solar}>
          <boxGeometry args={[1.4, 0.04, 3.0]} />
        </mesh>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[0, -0.025, -1.0 + i * 0.5]}>
            <boxGeometry args={[1.35, 0.01, 0.38]} />
            <meshStandardMaterial color="#001f3f" emissive={new THREE.Color("#0284c7")} emissiveIntensity={powerGlow * 0.5} />
          </mesh>
        ))}
      </group>

      {/* ── High-gain comm dish ── */}
      <group position={[-1.2, 0.7, 0]} rotation={[0, 0, Math.PI / 6]}>
        {/* boom */}
        <mesh material={mat.truss} position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
        </mesh>
        {/* dish */}
        <group ref={dishRef} position={[0, 0.65, 0]}>
          <mesh material={mat.greeble}>
            <sphereGeometry args={[0.38, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.38]} />
          </mesh>
          {/* feed horn */}
          <mesh material={mat.truss} position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.42, 8]} />
          </mesh>
        </group>
      </group>

      {/* ── Radiator panels (forward, along X) ── */}
      <mesh material={mat.radiator} position={[-0.6, 0, 0.65]}>
        <boxGeometry args={[1.8, 0.03, 0.9]} />
      </mesh>
      <mesh material={mat.radiator} position={[-0.6, 0, -0.65]}>
        <boxGeometry args={[1.8, 0.03, 0.9]} />
      </mesh>

      {/* ── Navigation / beacon lights ── */}
      <group ref={hullLightsRef}>
        <mesh position={[3.6, 0.2, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive={new THREE.Color("#06b6d4")} emissiveIntensity={1} />
        </mesh>
        <mesh position={[-2.8, 0.2, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive={new THREE.Color("#06b6d4")} emissiveIntensity={1} />
        </mesh>
        <mesh position={[0, 0.9, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive={new THREE.Color("#06b6d4")} emissiveIntensity={1} />
        </mesh>
      </group>

      {/* ── Health shield (subtle atmosphere) ── */}
      <mesh>
        <sphereGeometry args={[3.8, 24, 24]} />
        <meshBasicMaterial
          color={shieldColor}
          transparent
          opacity={isEmergency ? 0.12 : 0.025}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
