"use client";

import { useMemo } from "react";
import * as THREE from "three";

function makeNebulaTexture(): THREE.CanvasTexture {
  const S = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  // Deep space base — very dark teal
  ctx.fillStyle = "#040d10";
  ctx.fillRect(0, 0, S, S);

  // ── Major nebula clouds ────────────────────────────────────────────────────
  const clouds: Array<{ x: number; y: number; r: number; rgb: [number, number, number]; a: number }> = [
    // Deep teal/green blobs
    { x: 0.22, y: 0.32, r: 0.44, rgb: [10, 72,  52], a: 0.30 },
    { x: 0.74, y: 0.60, r: 0.40, rgb: [ 8, 60,  44], a: 0.27 },
    { x: 0.48, y: 0.18, r: 0.32, rgb: [20, 90,  68], a: 0.22 },
    { x: 0.88, y: 0.42, r: 0.30, rgb: [ 9, 58,  44], a: 0.23 },
    { x: 0.10, y: 0.76, r: 0.34, rgb: [12, 78,  58], a: 0.21 },
    { x: 0.55, y: 0.88, r: 0.36, rgb: [ 7, 50,  40], a: 0.25 },
    { x: 0.28, y: 0.70, r: 0.28, rgb: [22, 95,  72], a: 0.17 },
    { x: 0.82, y: 0.80, r: 0.24, rgb: [16, 84,  62], a: 0.16 },
    // Secondary lighter wisps
    { x: 0.60, y: 0.30, r: 0.26, rgb: [18, 100, 75], a: 0.14 },
    { x: 0.15, y: 0.50, r: 0.22, rgb: [14, 80,  60], a: 0.15 },
    // Blue-purple depth accents
    { x: 0.38, y: 0.48, r: 0.30, rgb: [ 8,  18, 62], a: 0.18 },
    { x: 0.76, y: 0.22, r: 0.24, rgb: [11,  22, 70], a: 0.15 },
    { x: 0.50, y: 0.64, r: 0.26, rgb: [ 6,  14, 50], a: 0.13 },
    // Bright nebula core glow spots
    { x: 0.22, y: 0.30, r: 0.14, rgb: [26, 130, 90], a: 0.14 },
    { x: 0.72, y: 0.63, r: 0.12, rgb: [22, 115, 80], a: 0.12 },
    { x: 0.48, y: 0.86, r: 0.10, rgb: [30, 145,105], a: 0.11 },
    // Wide faint glow to tie it together
    { x: 0.50, y: 0.50, r: 0.75, rgb: [ 6,  42, 32], a: 0.10 },
  ];

  for (const c of clouds) {
    const x = c.x * S, y = c.y * S, r = c.r * S;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${c.rgb[0]},${c.rgb[1]},${c.rgb[2]},1)`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = c.a;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    ctx.globalAlpha = 1;
  }

  // ── Wispy filament tendrils ────────────────────────────────────────────────
  for (let i = 0; i < 14; i++) {
    const x1 = Math.random() * S;
    const y1 = Math.random() * S;
    const x2 = x1 + (Math.random() - 0.5) * S * 0.60;
    const y2 = y1 + (Math.random() - 0.5) * S * 0.50;
    const alpha = 0.035 + Math.random() * 0.045;
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.30, `rgba(18,105,76,${alpha})`);
    g.addColorStop(0.70, `rgba(18,105,76,${alpha})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 2 + Math.random() * 8;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(
      x1 + (Math.random() - 0.5) * 420,
      y1 + (Math.random() - 0.5) * 320,
      x2 + (Math.random() - 0.5) * 420,
      y2 + (Math.random() - 0.5) * 320,
      x2, y2,
    );
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export function NebulaBackground() {
  const texture = useMemo(() => makeNebulaTexture(), []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} renderOrder={-10}>
      <planeGeometry args={[600, 600]} />
      <meshBasicMaterial map={texture} depthWrite={false} />
    </mesh>
  );
}
