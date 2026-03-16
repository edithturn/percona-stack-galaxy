"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { COORD_SCALE } from "@/lib/utils";

interface OrbitPathProps {
  /** Semi-axes in data coordinates (will be multiplied by COORD_SCALE) */
  a: number;
  b: number;
  color: string;
  segments?: number;
  theme?: "dark" | "light";
}

export function OrbitPath({ a, b, color, segments = 128, theme = "dark" }: OrbitPathProps) {
  const points = useMemo(() => {
    const wa = a * COORD_SCALE;
    const wb = b * COORD_SCALE;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * wa, 0, Math.sin(angle) * wb));
    }
    return pts;
  }, [a, b, segments]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={theme === "light" ? 1.4 : 1.0}
      transparent
      opacity={theme === "light" ? 0.75 : 0.55}
      dashed={false}
    />
  );
}
