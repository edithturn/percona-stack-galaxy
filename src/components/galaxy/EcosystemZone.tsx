"use client";

import { useMemo, useRef } from "react";
import { Line, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { COORD_SCALE } from "@/lib/utils";

const OUTER_A = 14.5;
const OUTER_B = 10.5;

export interface EcosystemContribution {
  id: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  url: string;
}

export const ECOSYSTEM_CONTRIBUTIONS: EcosystemContribution[] = [
  {
    id: "valkey",
    name: "Valkey",
    tagline: "Redis-compatible open-source key-value store",
    description:
      "Valkey is a high-performance, open-source key-value datastore governed by the Linux Foundation, born after Redis changed its license away from open source. " +
      "Percona is a founding contributor to the Valkey project, led by Co-founder Vadim Tkachenko. While other companies pull away from open source, Percona is doubling down — " +
      "enhancing Valkey's functionality and helping companies migrate from Redis. Percona offers Health Assessments, Valkey Migration Services, and 24×7 support " +
      "to ensure a smooth transition — staying true to its 18-year mission of keeping open source databases open.",
    color: "#a855f7",
    url: "https://valkey.io",
  },
  {
    id: "openeverest",
    name: "OpenEverest",
    tagline: "Cloud-native open source database platform for Kubernetes",
    description:
      "OpenEverest is the evolution of Percona Everest — now an independent open source project with open governance and a multi-vendor community. " +
      "It automates the deployment, scaling, and management of open-source databases (PostgreSQL, MySQL, MongoDB) on Kubernetes, providing a unified " +
      "control plane without vendor lock-in. Built as an extensible platform, it aims to become a flexible, community-driven foundation for managing " +
      "modern data infrastructure. Percona founded the project and remains an active contributor, providing enterprise-grade support and services through " +
      "Solanica, a Percona subsidiary dedicated to OpenEverest's growth and community.",
    color: "#38bdf8",
    url: "https://openeverest.io/documentation/current/",
  },
];

const ANGLES: Record<string, number> = {
  valkey: Math.PI - 0.168,
  openeverest: Math.PI + 0.6,
};

// ─── Jupiter-style banded texture (purple tones for Valkey) ──────────────────

function makeValkeyTexture(): THREE.CanvasTexture {
  const W = 512, H = 256;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Base deep purple
  ctx.fillStyle = "#1e0845";
  ctx.fillRect(0, 0, W, H);

  // Band definitions: center (0–1), thickness (0–1), color, alpha
  const bands: [number, number, string, number][] = [
    [0.04, 0.05, "#c4b5fd", 0.70],
    [0.10, 0.04, "#7c3aed", 0.80],
    [0.17, 0.07, "#6d28d9", 0.60],
    [0.26, 0.04, "#ddd6fe", 0.75],
    [0.33, 0.06, "#9333ea", 0.70],
    [0.41, 0.03, "#ede9fe", 0.55],
    [0.47, 0.07, "#4c1d95", 0.90],
    [0.55, 0.05, "#c084fc", 0.65],
    [0.62, 0.06, "#7c3aed", 0.75],
    [0.70, 0.04, "#f3e8ff", 0.60],
    [0.76, 0.07, "#9333ea", 0.70],
    [0.85, 0.04, "#c4b5fd", 0.65],
    [0.92, 0.06, "#6d28d9", 0.80],
    [0.98, 0.04, "#ddd6fe", 0.55],
  ];

  for (const [cy, bh, color, alpha] of bands) {
    const yc = cy * H;
    const halfH = (bh * H) / 2;

    ctx.globalAlpha = alpha;
    // Draw wavy filled band using a path
    ctx.beginPath();
    const freq1 = 3.5 + Math.random() * 2;
    const freq2 = 2.5 + Math.random() * 2;
    const amp = halfH * 0.45;

    // Top edge (wavy)
    ctx.moveTo(0, yc - halfH);
    for (let x = 0; x <= W; x += 3) {
      ctx.lineTo(x, yc - halfH + Math.sin((x / W) * Math.PI * freq1) * amp);
    }
    // Bottom edge (wavy, different frequency)
    for (let x = W; x >= 0; x -= 3) {
      ctx.lineTo(x, yc + halfH + Math.sin((x / W) * Math.PI * freq2 + 1.2) * amp);
    }
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, yc - halfH, 0, yc + halfH);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(0.25, color);
    grad.addColorStop(0.75, color);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Subtle horizontal highlight near equator
  const eqGrad = ctx.createLinearGradient(0, H * 0.44, 0, H * 0.56);
  eqGrad.addColorStop(0, "transparent");
  eqGrad.addColorStop(0.5, "rgba(255,230,255,0.12)");
  eqGrad.addColorStop(1, "transparent");
  ctx.fillStyle = eqGrad;
  ctx.fillRect(0, H * 0.44, W, H * 0.12);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

// ─── Sky-blue planet with white lines (OpenEverest) ──────────────────────────

function makeEverestTexture(): THREE.CanvasTexture {
  const W = 512, H = 256;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Sky-blue base
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(0, 0, W, H);

  // Slightly deeper sky patches for depth
  const patches: [number, number, number, string][] = [
    [0.20, 0.25, 0.28, "#0ea5e9"],
    [0.65, 0.50, 0.32, "#0284c7"],
    [0.40, 0.80, 0.24, "#0ea5e9"],
    [0.85, 0.20, 0.20, "#0284c7"],
    [0.10, 0.70, 0.18, "#7dd3fc"],
  ];
  for (const [x, y, r, color] of patches) {
    const grad = ctx.createRadialGradient(x * W, y * H, 0, x * W, y * H, r * W);
    grad.addColorStop(0, color);
    grad.addColorStop(1, "transparent");
    ctx.globalAlpha = 0.50;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  // White lines — thin horizontal streaks at varying y positions and opacities
  const lines: [number, number, number][] = [
    // yFrac, thickness (px), opacity
    [0.08,  1.2, 0.75],
    [0.16,  2.0, 0.60],
    [0.23,  1.0, 0.50],
    [0.31,  1.8, 0.80],
    [0.39,  1.2, 0.55],
    [0.47,  2.4, 0.70],
    [0.54,  1.0, 0.45],
    [0.61,  1.6, 0.65],
    [0.69,  2.0, 0.75],
    [0.76,  1.2, 0.50],
    [0.83,  1.8, 0.68],
    [0.91,  1.0, 0.55],
  ];

  for (const [yFrac, thick, alpha] of lines) {
    const y = yFrac * H;
    // Slight sine-wave wobble along X for an organic feel
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 4) {
      ctx.lineTo(x, y + Math.sin((x / W) * Math.PI * 5) * thick * 1.2);
    }
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = thick;
    ctx.stroke();
  }

  // Bright highlight near top pole
  const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.15);
  topGrad.addColorStop(0, "rgba(255,255,255,0.35)");
  topGrad.addColorStop(1, "transparent");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, H * 0.15);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

// ─── EcosystemNode ────────────────────────────────────────────────────────────

const CORE_R  = 1.0;
const ATMO_R  = 1.55;
const HIT_R   = 2.1;

function EcosystemNode({
  contrib,
  onSelect,
}: {
  contrib: EcosystemContribution;
  onSelect: (c: EcosystemContribution) => void;
}) {
  const coreRef = useRef<THREE.Mesh>(null);
  const { color, id } = contrib;
  const angle = ANGLES[id];
  const wa = OUTER_A * COORD_SCALE;
  const wb = OUTER_B * COORD_SCALE;
  const x = Math.cos(angle) * wa;
  const z = Math.sin(angle) * wb;

  // Generate canvas texture per planet type
  const texture = useMemo(() => {
    if (id === "valkey")       return makeValkeyTexture();
    if (id === "openeverest")  return makeEverestTexture();
    return null;
  }, [id]);

  const colorObj  = useMemo(() => new THREE.Color(color), [color]);
  const emissive  = useMemo(() => new THREE.Color(color).multiplyScalar(0.55), [color]);

  // Gentle slow self-rotation
  useFrame(({ clock }) => {
    if (coreRef.current) {
      coreRef.current.rotation.y = clock.elapsedTime * (id === "valkey" ? 0.06 : 0.04);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(contrib);
  };
  const handlePointerOver = () => { document.body.style.cursor = "pointer"; };
  const handlePointerOut  = () => { document.body.style.cursor = "default"; };

  return (
    <group position={[x, 0, z]}>
      {/* Per-planet fill light so the texture is visible regardless of scene lighting */}
      <pointLight color={color} intensity={1.8} distance={8} decay={2} />

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[ATMO_R, 24, 24]} />
        <meshBasicMaterial
          color={colorObj} transparent opacity={0.18}
          depthWrite={false} side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer soft halo ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ATMO_R * 1.05, ATMO_R * 1.45, 64]} />
        <meshBasicMaterial
          color={colorObj} transparent opacity={0.12}
          side={THREE.DoubleSide} depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Planet core — textured sphere */}
      <mesh
        ref={coreRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[CORE_R, 48, 32]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            emissive={emissive}
            emissiveIntensity={0.45}
            roughness={0.55}
            metalness={0.05}
          />
        ) : (
          <meshBasicMaterial color={colorObj} transparent opacity={0.4} depthWrite={false} />
        )}
      </mesh>

      {/* Invisible larger hit target */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        visible={false}
      >
        <sphereGeometry args={[HIT_R, 10, 10]} />
        <meshBasicMaterial />
      </mesh>

      {/* Label — same style and position as regular planet labels */}
      <Html position={[0, 0, CORE_R + 2.4]} center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--text)",
            whiteSpace: "nowrap",
            textAlign: "center",
            opacity: 0.9,
            lineHeight: 1.4,
          }}
        >
          {contrib.name}
        </div>
      </Html>
    </group>
  );
}

// ─── EcosystemZone ────────────────────────────────────────────────────────────

export function EcosystemZone({
  theme,
  onSelectContribution,
}: {
  theme: "dark" | "light";
  onSelectContribution: (c: EcosystemContribution) => void;
}) {
  const points = useMemo(() => {
    const wa = OUTER_A * COORD_SCALE;
    const wb = OUTER_B * COORD_SCALE;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * wa, 0, Math.sin(angle) * wb));
    }
    return pts;
  }, []);

  return (
    <>
      <Line
        points={points}
        color="#475569"
        lineWidth={0.9}
        transparent
        opacity={theme === "light" ? 0.45 : 0.28}
        dashed
        dashSize={0.7}
        gapSize={1.0}
      />

{ECOSYSTEM_CONTRIBUTIONS.map((c) => (
        <EcosystemNode key={c.id} contrib={c} onSelect={onSelectContribution} />
      ))}
    </>
  );
}
