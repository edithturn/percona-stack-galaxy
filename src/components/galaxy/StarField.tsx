"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Five loose cluster regions to mimic star clusters / distant nebulae
const CLUSTERS = [
  { theta: 0.85, phi: 2.10, r: 145, spread: 18, count: 320 },
  { theta: 2.40, phi: 0.90, r: 162, spread: 22, count: 280 },
  { theta: 4.10, phi: 2.40, r: 155, spread: 20, count: 260 },
  { theta: 5.50, phi: 1.20, r: 142, spread: 17, count: 300 },
  { theta: 1.20, phi: 2.80, r: 172, spread: 25, count: 240 },
];

const CLUSTER_TOTAL = CLUSTERS.reduce((s, c) => s + c.count, 0);
const REGULAR_COUNT = 6200;
const TOTAL = REGULAR_COUNT + CLUSTER_TOTAL;

export function StarField({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const pointsRef  = useRef<THREE.Points>(null);
  const brightRef  = useRef<THREE.Points>(null);

  // ── Main star field (regular + clusters) ──────────────────────────────────
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(TOTAL * 3);
    const colors    = new Float32Array(TOTAL * 3);

    // Regular background stars
    for (let i = 0; i < REGULAR_COUNT; i++) {
      const r     = 82 + Math.random() * 198;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const bright = 0.15 + Math.random() * 0.80;
      const rnd    = Math.random();
      if (rnd < 0.55) {         // cold blue-white (most common)
        colors[i * 3] = bright * 0.82; colors[i * 3 + 1] = bright * 0.90; colors[i * 3 + 2] = bright;
      } else if (rnd < 0.80) {  // pure white
        colors[i * 3] = bright; colors[i * 3 + 1] = bright; colors[i * 3 + 2] = bright;
      } else if (rnd < 0.92) {  // warm white / yellow-white
        colors[i * 3] = bright; colors[i * 3 + 1] = bright * 0.88; colors[i * 3 + 2] = bright * 0.68;
      } else {                  // blue-violet
        colors[i * 3] = bright * 0.68; colors[i * 3 + 1] = bright * 0.72; colors[i * 3 + 2] = bright;
      }
    }

    // Star clusters — denser regions
    let idx = REGULAR_COUNT;
    for (const cl of CLUSTERS) {
      const cx = cl.r * Math.sin(cl.phi) * Math.cos(cl.theta);
      const cy = cl.r * Math.sin(cl.phi) * Math.sin(cl.theta);
      const cz = cl.r * Math.cos(cl.phi);
      const isWarm = cl.theta > 2 && cl.theta < 3;
      for (let j = 0; j < cl.count; j++) {
        if (idx >= TOTAL) break;
        positions[idx * 3]     = cx + (Math.random() - 0.5) * cl.spread;
        positions[idx * 3 + 1] = cy + (Math.random() - 0.5) * cl.spread;
        positions[idx * 3 + 2] = cz + (Math.random() - 0.5) * cl.spread;
        const b = 0.50 + Math.random() * 0.45;
        if (isWarm) {
          colors[idx * 3] = b; colors[idx * 3 + 1] = b * 0.90; colors[idx * 3 + 2] = b * 0.72;
        } else {
          colors[idx * 3] = b * 0.84; colors[idx * 3 + 1] = b * 0.92; colors[idx * 3 + 2] = b;
        }
        idx++;
      }
    }

    return { positions, colors };
  }, []);

  // ── Light-mode: sparse faint grey dots ───────────────────────────────────
  const lightPositions = useMemo(() => {
    const N = 400;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r     = 85 + Math.random() * 190;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  // ── Bright accent stars (larger, sparse) ──────────────────────────────────
  const brightPositions = useMemo(() => {
    const N = 200;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r     = 88 + Math.random() * 165;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    const rot = state.clock.elapsedTime * 0.003;
    if (pointsRef.current)  pointsRef.current.rotation.y  = rot;
    if (brightRef.current)  brightRef.current.rotation.y  = rot;
  });

  if (theme === "light") {
    return (
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lightPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          sizeAttenuation
          color="#9aaabb"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </points>
    );
  }

  return (
    <>
      {/* Main starfield */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color"    args={[colors, 3]}    />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.88}
          depthWrite={false}
        />
      </points>

      {/* Sparse bright accent stars */}
      <points ref={brightRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[brightPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.44}
          sizeAttenuation
          color="#e8f0ff"
          transparent
          opacity={0.68}
          depthWrite={false}
        />
      </points>
    </>
  );
}
