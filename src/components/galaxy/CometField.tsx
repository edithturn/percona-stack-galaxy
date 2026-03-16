"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const TAIL_PARTICLES = 120;

interface CometDef {
  sx: number; sz: number;
  ex: number; ez: number;
  tail: number;
  tailWidth: number;
  bright: number;
  speed: number;
  phase: number;
  headR: number;
  tailSize: number;
}

const COMETS: CometDef[] = [
  { sx: -46, sz: 22, ex: 40, ez: 16, tail: 15, tailWidth: 1.2, bright: 1.00, speed: 0.022, phase: 0.10, headR: 0.20, tailSize: 0.38 },
  { sx: -44, sz: 36, ex: 40, ez: 32, tail: 24, tailWidth: 1.8, bright: 0.90, speed: 0.012, phase: 0.55, headR: 0.28, tailSize: 0.55 },
];

// ── Procedural "dirty snowball" surface texture ────────────────────────────────
function makeCometTexture(): THREE.CanvasTexture {
  const S = 256;
  const canvas = document.createElement("canvas");
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#504438";
  ctx.fillRect(0, 0, S, S);

  for (let i = 0; i < 20; i++) {
    const x = Math.random() * S, y = Math.random() * S, r = 8 + Math.random() * 50;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(18,12,8,${0.35 + Math.random() * 0.45})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  }
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * S, y = Math.random() * S, r = 6 + Math.random() * 24;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(195,210,225,${0.25 + Math.random() * 0.40})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  }
  for (let i = 0; i < 7; i++) {
    const x = Math.random() * S, y = Math.random() * S, r = 3 + Math.random() * 11;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(14,10,7,${0.55 + Math.random() * 0.30})`; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r + 1.8, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(130,115,100,0.28)"; ctx.lineWidth = 1.5; ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

// ─────────────────────────────────────────────────────────────────────────────

function buildComet(def: CometDef) {
  // Nucleus: low-poly angular rocky body
  const head = new THREE.Mesh(
    new THREE.IcosahedronGeometry(def.headR, 0),
    new THREE.MeshStandardMaterial({
      map: makeCometTexture(),
      roughness: 0.92, metalness: 0.04,
      emissive: new THREE.Color(0.55, 0.38, 0.04),
      emissiveIntensity: 0.55,
    }),
  );

  // Coma: tight soft glow
  const coma = new THREE.Mesh(
    new THREE.SphereGeometry(def.headR * 1.8, 10, 7),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(1.0, 0.88, 0.30),
      transparent: true, opacity: 0.20,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    }),
  );

  // Tail: cone-shaped particle fan
  const tailGeo = new THREE.BufferGeometry();
  tailGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TAIL_PARTICLES * 3), 3));
  tailGeo.setAttribute("color",    new THREE.BufferAttribute(new Float32Array(TAIL_PARTICLES * 3), 3));
  const tailPoints = new THREE.Points(tailGeo, new THREE.PointsMaterial({
    size: def.tailSize,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true, opacity: 0.88,
    depthWrite: false,
  }));

  // Pre-compute per-particle offsets — 80 % hugging the central axis (bright streak),
  // 20 % in the outer diffuse fan
  const tailOffsets = new Float32Array(TAIL_PARTICLES * 2);
  const alongFracs  = new Float32Array(TAIL_PARTICLES);
  for (let i = 0; i < TAIL_PARTICLES; i++) {
    const along     = Math.pow(Math.random(), 0.45) * def.tail;
    const coneFrac  = along / def.tail;
    const maxSpread = coneFrac * def.tailWidth;
    const inCore    = Math.random() < 0.80;
    const spread    = inCore ? maxSpread * 0.12 : maxSpread;
    tailOffsets[i * 2]     = along;
    tailOffsets[i * 2 + 1] = (Math.random() - 0.5) * 2 * spread;
    alongFracs[i]           = coneFrac;
  }

  const dx = def.ex - def.sx, dz = def.ez - def.sz;
  const len = Math.sqrt(dx * dx + dz * dz);
  const tdx = -dx / len, tdz = -dz / len;
  const tpx = -tdz,      tpz =  tdx;

  return { def, head, coma, tailPoints, tailGeo, tailOffsets, alongFracs, tdx, tdz, tpx, tpz };
}

// ─────────────────────────────────────────────────────────────────────────────

export function CometField({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const comets   = useMemo(() => COMETS.map(buildComet), []);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useFrame(({ clock }) => {
    const isDark  = themeRef.current === "dark";
    const elapsed = clock.elapsedTime;

    for (const { def, head, coma, tailGeo, tailOffsets, alongFracs, tdx, tdz, tpx, tpz } of comets) {
      const t  = (elapsed * def.speed + def.phase) % 1;
      const hx = def.sx + (def.ex - def.sx) * t;
      const hz = def.sz + (def.ez - def.sz) * t;

      head.position.set(hx, 0.8, hz);
      head.rotation.y += 0.006;
      coma.position.set(hx, 0.8, hz);
      (coma.material as THREE.MeshBasicMaterial).color.set(isDark ? "#ffe066" : "#cc8800");

      const tp = tailGeo.attributes.position.array as Float32Array;
      const tc = tailGeo.attributes.color.array as Float32Array;
      for (let i = 0; i < TAIL_PARTICLES; i++) {
        const along = tailOffsets[i * 2], perp = tailOffsets[i * 2 + 1];
        tp[i * 3]     = hx + tdx * along + tpx * perp;
        tp[i * 3 + 1] = 0.8;
        tp[i * 3 + 2] = hz + tdz * along + tpz * perp;

        const b = Math.pow(1 - alongFracs[i], 1.5) * def.bright;
        if (isDark) {
          tc[i * 3] = b; tc[i * 3 + 1] = b * 0.85; tc[i * 3 + 2] = b * 0.18;
        } else {
          tc[i * 3]     = 0.78 * b + 0.91 * (1 - b);
          tc[i * 3 + 1] = 0.50 * b + 0.91 * (1 - b);
          tc[i * 3 + 2] = 0.00 * b + 0.93 * (1 - b);
        }
      }
      tailGeo.attributes.position.needsUpdate = true;
      tailGeo.attributes.color.needsUpdate    = true;
    }
  });

  return (
    <>
      {comets.map((c, i) => (
        <group key={i}>
          <primitive object={c.tailPoints} />
          <primitive object={c.coma} />
          <primitive object={c.head} />
        </group>
      ))}
    </>
  );
}
