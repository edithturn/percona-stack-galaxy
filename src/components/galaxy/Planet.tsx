"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Product } from "@/types/galaxy";
import { COORD_SCALE, PLANET_RADIUS, PLANET_COLORS, PLANET_MATERIAL, getActivityScore } from "@/lib/utils";

interface PlanetProps {
  product: Product;
  isSelected: boolean;
  isDimmed: boolean;
  onClick: () => void;
  panMode: boolean;
}

// ─── Shared ring using RingGeometry (flat disc ring, visible from top-down) ───

function FlatRing({
  innerR, outerR, color, tilt = 0, opacity = 0.45, metalness = 0.0,
}: {
  innerR: number; outerR: number; color: THREE.Color;
  tilt?: number; opacity?: number; metalness?: number;
}) {
  // rotation: [PI/2 - tilt, 0, 0] places ring in XZ plane (circle from top-down)
  return (
    <mesh rotation={[Math.PI / 2 - tilt, 0, 0]}>
      <ringGeometry args={[innerR, outerR, 64]} />
      <meshStandardMaterial
        color={color} metalness={metalness} roughness={0.5}
        transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false}
      />
    </mesh>
  );
}

// ─── Moon orbiting in XZ plane ────────────────────────────────────────────────

function Moon({
  orbitRadius, size, speed, phase, color, isDimmed,
}: {
  orbitRadius: number; size: number; speed: number;
  phase: number; color: THREE.Color; isDimmed: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const angle = clock.elapsedTime * speed + phase;
      ref.current.position.x = Math.cos(angle) * orbitRadius;
      ref.current.position.z = Math.sin(angle) * orbitRadius;
    }
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[size, 10, 10]} />
        <meshStandardMaterial
          color={color} roughness={0.8} metalness={0.05}
          transparent={isDimmed} opacity={isDimmed ? 0.25 : 1}
        />
      </mesh>
    </group>
  );
}

// ─── Operator halo: thin static ring, slightly tilted ────────────────────────

function OperatorHalo({ r, color }: { r: number; color: THREE.Color }) {
  // Static — no pulsing, just a gentle inclined ring to mark operators
  return (
    <mesh rotation={[Math.PI / 2 - 0.35, 0, 0]}>
      <torusGeometry args={[r * 2.0, r * 0.03, 8, 80]} />
      <meshBasicMaterial
        color={color} transparent opacity={0.22}
        blending={THREE.AdditiveBlending} depthWrite={false}
      />
    </mesh>
  );
}

// ─── PMM observability ring: static flat ring in XZ plane ────────────────────

function ObservabilityRing({ r, color }: { r: number; color: THREE.Color }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r * 1.55, r * 1.75, 64]} />
      <meshBasicMaterial
        color={color} transparent opacity={0.18}
        side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false}
      />
    </mesh>
  );
}

// ─── PMM: frosted glass inner machinery ──────────────────────────────────────

function PMMDecorations({ r, color }: { r: number; color: THREE.Color }) {
  const ref0 = useRef<THREE.Mesh>(null);
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);
  const ref3 = useRef<THREE.Mesh>(null);

  const glowGreen = useMemo(() => new THREE.Color("#ff9944"), []);
  const glowCyan  = useMemo(() => new THREE.Color("#ffb060"), []);
  const glowMint  = useMemo(() => new THREE.Color("#ff7722"), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    ref0.current?.position.set(
      Math.cos(t * 0.35) * r * 0.38,
      Math.sin(t * 0.27) * r * 0.22,
      Math.sin(t * 0.35) * r * 0.38
    );
    ref1.current?.position.set(
      Math.cos(t * 0.52 + 2.1) * r * 0.28,
      Math.sin(t * 0.41 + 1.0) * r * 0.25,
      Math.sin(t * 0.52 + 2.1) * r * 0.28
    );
    ref2.current?.position.set(
      Math.cos(t * 0.21 + 4.5) * r * 0.44,
      Math.sin(t * 0.31 + 3.2) * r * 0.18,
      Math.sin(t * 0.21 + 4.5) * r * 0.44
    );
    ref3.current?.position.set(
      Math.cos(t * 0.63 + 1.0) * r * 0.20,
      Math.sin(t * 0.47 + 2.5) * r * 0.32,
      Math.sin(t * 0.63 + 1.0) * r * 0.20
    );
  });

  return (
    <>
      <ObservabilityRing r={r} color={color} />
      {/* Orb 0 — large drifting core */}
      <mesh ref={ref0}>
        <sphereGeometry args={[r * 0.24, 10, 10]} />
        <meshBasicMaterial color={glowGreen} transparent opacity={0.30}
          blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} />
      </mesh>
      {/* Orb 1 — medium warm */}
      <mesh ref={ref1}>
        <sphereGeometry args={[r * 0.17, 10, 10]} />
        <meshBasicMaterial color={glowCyan} transparent opacity={0.25}
          blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} />
      </mesh>
      {/* Orb 2 — large slow */}
      <mesh ref={ref2}>
        <sphereGeometry args={[r * 0.30, 10, 10]} />
        <meshBasicMaterial color={glowMint} transparent opacity={0.20}
          blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} />
      </mesh>
      {/* Orb 3 — small bright core */}
      <mesh ref={ref3}>
        <sphereGeometry args={[r * 0.13, 10, 10]} />
        <meshBasicMaterial color={glowGreen} transparent opacity={0.35}
          blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} />
      </mesh>
    </>
  );
}

// ─── Pond ripple rings: expanding concentric rings like water surface ─────────

function RippleRings({ r, color }: { r: number; color: THREE.Color }) {
  const groupRef = useRef<THREE.Group>(null);
  const CYCLE = 3.4;
  const COUNT = 4;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const progress = ((t + (i / COUNT) * CYCLE) % CYCLE) / CYCLE; // 0→1 per ring
      mesh.scale.setScalar(1.0 + progress * 1.8);
      (mesh.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.18;
    });
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 2, 0, 0]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i}>
          <torusGeometry args={[r * 1.02, r * 0.022, 6, 80]} />
          <meshBasicMaterial
            color={color} transparent opacity={0.18}
            blending={THREE.AdditiveBlending} depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── MySQL Operator: rainbow geometric stairs + funnels ───────────────────────

function MySQLOperatorDecorations({ r, color }: { r: number; color: THREE.Color }) {
  const groupRef = useRef<THREE.Group>(null);

  const rainbow = useMemo(() => [
    new THREE.Color("#ff2222"),
    new THREE.Color("#ff7700"),
    new THREE.Color("#ffdd00"),
    new THREE.Color("#22cc44"),
    new THREE.Color("#2277ff"),
    new THREE.Color("#9933ff"),
  ], []);

  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.elapsedTime * 0.06;
  });

  const orbit = r * 2.1;
  const s = r * 0.22;

  return (
    <group ref={groupRef}>
      <OperatorHalo r={r} color={color} />

      {/* 3 staircase clusters at 120° intervals */}
      {[0, 1, 2].map((ci) => {
        const a = (ci / 3) * Math.PI * 2;
        return (
          <group key={`stair-${ci}`} position={[Math.cos(a) * orbit, 0, Math.sin(a) * orbit]}>
            {[0, 1, 2, 3, 4].map((step) => (
              <mesh
                key={step}
                position={[step * s * 0.5 - s, step * s * 0.38, 0]}
              >
                <boxGeometry args={[s, s * (0.45 + step * 0.22), s]} />
                <meshStandardMaterial
                  color={rainbow[step % rainbow.length]}
                  metalness={0.86}
                  roughness={0.14}
                  emissive={rainbow[step % rainbow.length]}
                  emissiveIntensity={0.08}
                />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* 3 funnels at 60° offset from stairs */}
      {[0, 1, 2].map((fi) => {
        const a = (fi / 3) * Math.PI * 2 + Math.PI / 3;
        return (
          <mesh
            key={`funnel-${fi}`}
            position={[Math.cos(a) * orbit * 0.88, s * 0.4, Math.sin(a) * orbit * 0.88]}
          >
            {/* 6-sided funnel — wide top, narrow bottom */}
            <cylinderGeometry args={[s * 0.85, s * 0.18, s * 1.9, 6, 1]} />
            <meshStandardMaterial
              color={rainbow[(fi * 2 + 1) % rainbow.length]}
              metalness={0.86}
              roughness={0.14}
              emissive={rainbow[(fi * 2 + 1) % rainbow.length]}
              emissiveIntensity={0.08}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Toolkit asteroid belt: points orbiting in XZ plane ──────────────────────

function AsteroidBelt({ r, color }: { r: number; color: THREE.Color }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 55;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
      const dist = r * 2.1 + (Math.random() - 0.5) * r * 0.6;
      arr[i * 3]     = Math.cos(angle) * dist;
      arr[i * 3 + 1] = (Math.random() - 0.5) * r * 0.25;
      arr[i * 3 + 2] = Math.sin(angle) * dist;
    }
    return arr;
  }, [r]);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.07;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color} size={2.5} sizeAttenuation={false}
        transparent opacity={0.7}
      />
    </points>
  );
}

// ─── Per-planet decorations ───────────────────────────────────────────────────

// ─── MongoDB-inspired curly leaf cluster (3 leaves, fern-like curl) ──────────

function MongoLeaves({ r }: { r: number }) {
  const leafColor = useMemo(() => new THREE.Color("#4CAF72"), []);
  const s = r * 0.31;

  // Curly leaf shape in local XY plane.
  // +Y = outward (away from planet). Right side bows out, tip hooks back left.
  const leafGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    // Outer right edge — sweeps up and outward
    shape.bezierCurveTo(s * 0.85, s * 0.05, s * 1.25, s * 0.95, s * 0.75, s * 1.85);
    // Curl: tip hooks back inward
    shape.bezierCurveTo(s * 0.45, s * 2.25, -s * 0.2, s * 2.05, s * 0.05, s * 1.65);
    // Inner left edge back to base
    shape.bezierCurveTo(-s * 0.15, s * 1.05, -s * 0.05, s * 0.35, 0, 0);
    return new THREE.ShapeGeometry(shape, 24);
  }, [s]);

  // 3 leaves evenly spaced at 120° intervals
  const angles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
  const dist = r * 1.02;

  return (
    <>
      {angles.map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh geometry={leafGeom} position={[0, 0.02, dist]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial
              color={leafColor}
              transparent
              opacity={0.92}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

// ─── PSMDB Operator: light-green internal glow patches ───────────────────────

function PSMDBOperatorDecorations({ r, color }: { r: number; color: THREE.Color }) {
  const paleGreen  = useMemo(() => new THREE.Color("#bbf7d0"), []);
  const mintGreen  = useMemo(() => new THREE.Color("#86efac"), []);

  // Surface patches: positions normalized to sit just on the sphere surface
  // Each is a soft glowing blob additively blended to create organic green shading
  const patches = useMemo(() => {
    const raw: [number, number, number][] = [
      [ 0.62,  0.0,  0.78],
      [-0.80,  0.0,  0.52],
      [ 0.30,  0.0, -0.95],
      [-0.45,  0.0, -0.70],
      [ 0.88,  0.0, -0.25],
    ];
    return raw.map(([x, y, z]) => {
      const len = Math.sqrt(x * x + y * y + z * z);
      const f = (r * 0.98) / len;
      return [x * f, y * f, z * f] as [number, number, number];
    });
  }, [r]);

  return (
    <>
      <OperatorHalo r={r} color={color} />
      {patches.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r * (i % 2 === 0 ? 0.44 : 0.36), 10, 10]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? mintGreen : paleGreen}
            transparent
            opacity={i % 2 === 0 ? 0.11 : 0.08}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>
      ))}
    </>
  );
}

function PSMDBDecorations({ r, color, isDimmed }: { r: number; color: THREE.Color; isDimmed: boolean }) {
  return (
    <>
      <MongoLeaves r={r} />
      <Moon orbitRadius={r * 1.9} size={r * 0.2} speed={0.65} phase={0}                    color={color} isDimmed={isDimmed} />
      <Moon orbitRadius={r * 1.9} size={r * 0.2} speed={0.65} phase={(Math.PI * 2) / 3}   color={color} isDimmed={isDimmed} />
      <Moon orbitRadius={r * 1.9} size={r * 0.2} speed={0.65} phase={(Math.PI * 4) / 3}   color={color} isDimmed={isDimmed} />
    </>
  );
}

function PPGDecorations({ r, color }: { r: number; color: THREE.Color }) {
  return (
    <>
      <RippleRings r={r} color={color} />
      <FlatRing innerR={r * 1.5} outerR={r * 2.0} color={color} tilt={0.5} opacity={0.45} />
      <FlatRing innerR={r * 2.1} outerR={r * 2.45} color={color} tilt={0.5} opacity={0.25} />
      <Moon orbitRadius={r * 2.9} size={r * 0.18} speed={0.4} phase={0.8} color={color} isDimmed={false} />
    </>
  );
}

function PGOperatorDecorations({ r, color }: { r: number; color: THREE.Color }) {
  return (
    <>
      <RippleRings r={r} color={color} />
      <OperatorHalo r={r} color={color} />
    </>
  );
}

function PSMMySQLDecorations({ r, color, isDimmed }: { r: number; color: THREE.Color; isDimmed: boolean }) {
  return (
    <>
      <FlatRing innerR={r * 1.3} outerR={r * 1.6} color={color} tilt={0} opacity={0.40} />
      <FlatRing innerR={r * 1.65} outerR={r * 1.9} color={color} tilt={0} opacity={0.25} />
      <Moon orbitRadius={r * 2.3} size={r * 0.18} speed={0.5} phase={1.5} color={color} isDimmed={isDimmed} />
    </>
  );
}

function PXCDecorations({ r, color, isDimmed }: { r: number; color: THREE.Color; isDimmed: boolean }) {
  const silver = useMemo(() => new THREE.Color("#c0c0c0"), []);
  return (
    <>
      <FlatRing innerR={r * 1.4} outerR={r * 2.2} color={silver} tilt={0.4} opacity={0.55} metalness={0.8} />
      <Moon orbitRadius={r * 2.9} size={r * 0.22} speed={0.55} phase={0}        color={color} isDimmed={isDimmed} />
      <Moon orbitRadius={r * 2.9} size={r * 0.22} speed={0.55} phase={Math.PI}  color={color} isDimmed={isDimmed} />
    </>
  );
}

function PXCOperatorDecorations({ r, color, isDimmed }: { r: number; color: THREE.Color; isDimmed: boolean }) {
  return (
    <>
      <OperatorHalo r={r} color={color} />
      <Moon orbitRadius={r * 2.6} size={r * 0.14} speed={1.1} phase={0}        color={color} isDimmed={isDimmed} />
      <Moon orbitRadius={r * 2.6} size={r * 0.14} speed={1.1} phase={Math.PI}  color={color} isDimmed={isDimmed} />
    </>
  );
}

function ValkeyDecorations({ r, color }: { r: number; color: THREE.Color }) {
  return (
    <FlatRing innerR={r * 1.55} outerR={r * 1.8} color={color} tilt={0.2} opacity={0.50} />
  );
}

function PlanetDecorations({
  id, r, color, isDimmed,
}: { id: string; r: number; color: THREE.Color; isDimmed: boolean }) {
  switch (id) {
    case "psmdb":          return <PSMDBDecorations r={r} color={color} isDimmed={isDimmed} />;
    case "psmdb-operator": return <PSMDBOperatorDecorations r={r} color={color} />;
    case "ppg":            return <PPGDecorations r={r} color={color} />;
    case "pg-operator":    return <PGOperatorDecorations r={r} color={color} />;
    case "psmysql":        return <PSMMySQLDecorations r={r} color={color} isDimmed={isDimmed} />;
    case "mysql-operator": return <MySQLOperatorDecorations r={r} color={color} />;
    case "pxc":            return <PXCDecorations r={r} color={color} isDimmed={isDimmed} />;
    case "pxc-operator":   return <PXCOperatorDecorations r={r} color={color} isDimmed={isDimmed} />;
    case "pmm":            return <PMMDecorations r={r} color={color} />;
    case "valkey":         return <ValkeyDecorations r={r} color={color} />;
    case "toolkit":        return <AsteroidBelt r={r} color={color} />;
    default:               return null;
  }
}

// ─── Main Planet component ────────────────────────────────────────────────────

export function Planet({ product, isSelected, isDimmed, onClick, panMode }: PlanetProps) {
  const groupRef  = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const glowRef   = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const colorHex = PLANET_COLORS[product.id] ?? "#8888ff";
  const mat      = PLANET_MATERIAL[product.id] ?? { roughness: 0.65, metalness: 0.1 };
  const radius   = PLANET_RADIUS[product.category];
  const activity = getActivityScore(product.releases);
  const colorObj = useMemo(() => new THREE.Color(colorHex), [colorHex]);
  const emissive = useMemo(() => colorObj.clone().multiplyScalar(0.6), [colorObj]);

  const seed = useRef(product.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) * 0.1);
  const baseY = product.position.y * COORD_SCALE;
  const baseZ = product.position.z * COORD_SCALE;

  const isFluid = product.id === "ppg" || product.id === "pg-operator";

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current)
      groupRef.current.position.z = baseZ + Math.sin(t * 0.4 + seed.current) * 0.22;
    if (sphereRef.current) {
      const m = sphereRef.current.material as THREE.MeshStandardMaterial;
      if (isFluid) {
        // Subtle shimmering — gentle, slow oscillation
        m.emissiveIntensity = 0.14
          + Math.sin(t * 1.2 + seed.current) * 0.04
          + Math.cos(t * 0.8 + seed.current * 0.5) * 0.03
          + (isSelected ? 0.12 : 0);
      } else {
        m.emissiveIntensity = 0.28 + Math.sin(t * 1.8 + seed.current) * 0.08
          + (isSelected ? 0.5 : 0) + activity * 0.18;
      }
    }
    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = (0.14 + activity * 0.14 + (isSelected ? 0.14 : 0)) * (isDimmed ? 0.2 : 1);
    }
  });

  const handlePointerOver = useCallback(() => {
    setHovered(true);
    if (!panMode) document.body.style.cursor = "pointer";
  }, [panMode]);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = "default";
  }, []);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); },
    [onClick]
  );

  return (
    <group
      ref={groupRef}
      position={[product.position.x * COORD_SCALE, baseY, product.position.z * COORD_SCALE]}
    >
      {/* Atmosphere glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 1.65, 16, 16]} />
        <meshBasicMaterial
          color={colorObj} transparent opacity={0.07}
          blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide}
        />
      </mesh>

      {/* Core sphere — MeshPhysicalMaterial */}
      <mesh ref={sphereRef} scale={hovered ? 1.1 : isDimmed ? 0.72 : 1}>
        <sphereGeometry args={[radius, 48, 32]} />
        {product.id === "pmm" ? (
          // Frosted translucent glass — inner orbs visible through matte surface
          <meshPhysicalMaterial
            color={colorObj}
            emissive={emissive}
            emissiveIntensity={0.12}
            roughness={0.82}
            metalness={0.0}
            transmission={0.52}
            thickness={1.6}
            ior={1.22}
            transparent
            opacity={isDimmed ? 0.12 : 0.86}
          />
        ) : isFluid ? (
          // Perfectly reflective fluid surface — like a shimmering pond
          <meshPhysicalMaterial
            color={colorObj}
            emissive={emissive}
            emissiveIntensity={0.18}
            roughness={0.05}
            metalness={0.90}
            clearcoat={1.0}
            clearcoatRoughness={0.03}
            transparent={isDimmed}
            opacity={isDimmed ? 0.12 : 1}
          />
        ) : (
          <meshPhysicalMaterial
            color={colorObj}
            emissive={emissive}
            emissiveIntensity={0.30}
            roughness={mat.roughness}
            metalness={mat.metalness}
            clearcoat={mat.clearcoat ?? 0}
            clearcoatRoughness={0.3}
            transparent={isDimmed}
            opacity={isDimmed ? 0.12 : 1}
          />
        )}
      </mesh>

      {/* Per-planet decorations */}
      <PlanetDecorations id={product.id} r={radius} color={colorObj} isDimmed={isDimmed} />

      {/* Invisible hit-target */}
      <mesh onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} visible={false}>
        <sphereGeometry args={[radius * 2.5, 10, 10]} />
        <meshBasicMaterial />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius * 2.8, 0.05, 8, 80]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.65} />
        </mesh>
      )}

      {/* Label */}
      <Html position={[0, 0, radius + 2.2]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div
          className={`text-[11px] font-medium select-none transition-opacity text-center leading-snug
            ${isDimmed ? "opacity-0" : "opacity-90"}`}
          style={{
            color: "var(--text)",
          }}
        >
          {product.shortName.includes(" based on ") ? (
            <>
              <span className="whitespace-nowrap">{product.shortName.split(" based on ")[0]}</span>
              <br />
              <span className="whitespace-nowrap">based on {product.shortName.split(" based on ")[1]}</span>
            </>
          ) : (
            <span className="whitespace-nowrap">{product.shortName}</span>
          )}
        </div>
      </Html>
    </group>
  );
}
