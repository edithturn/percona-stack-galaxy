"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { Position } from "@/types/galaxy";
import { COORD_SCALE } from "@/lib/utils";

interface EdgeLineProps {
  from: Position;
  to: Position;
  dimmed?: boolean;
  theme?: "dark" | "light";
}

export function EdgeLine({ from, to, dimmed = false, theme = "dark" }: EdgeLineProps) {
  const points = useMemo(() => {
    const start = new THREE.Vector3(from.x * COORD_SCALE, from.y * COORD_SCALE, from.z * COORD_SCALE);
    const end = new THREE.Vector3(to.x * COORD_SCALE, to.y * COORD_SCALE, to.z * COORD_SCALE);

    // Arc sideways in XZ plane so lines are visible from top-down
    const mid = start.clone().lerp(end, 0.5);
    const dist = start.distanceTo(end);
    const dir = end.clone().sub(start).normalize();
    const perp = new THREE.Vector3(-dir.z, 0, dir.x);
    mid.addScaledVector(perp, dist * 0.22);

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(32);
  }, [from, to]);

  const color     = theme === "light" ? "#334155" : "#475569";
  const opacity   = theme === "light" ? (dimmed ? 0.04 : 0.18) : (dimmed ? 0.04 : 0.10);
  const lineWidth = theme === "light" ? 0.8 : 0.3;

  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      depthWrite={false}
      dashed={false}
    />
  );
}
