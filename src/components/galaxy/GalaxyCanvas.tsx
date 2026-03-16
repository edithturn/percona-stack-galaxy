"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import type React from "react";
import type { GalaxyData, Product } from "@/types/galaxy";
import { GalaxyScene } from "./GalaxyScene";
import type { EcosystemContribution } from "./EcosystemZone";

interface GalaxyCanvasProps {
  data: GalaxyData;
  selectedProduct: Product | null;
  visibleProductIds: Set<string>;
  onSelectProduct: (p: Product) => void;
  onSelectContribution: (c: EcosystemContribution) => void;
  onDeselect: () => void;
  recenterKey: number;
  panMode: boolean;
  theme: "dark" | "light";
  zoomDeltaRef: React.MutableRefObject<number>;
}

export function GalaxyCanvas({ onDeselect, theme, onSelectContribution, ...props }: GalaxyCanvasProps) {
  const bg = theme === "light" ? "#e8e8ec" : "#040d10";
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 80, 0], zoom: 14, near: -200, far: 500 }}
      onCreated={({ camera }) => { camera.up.set(0, 0, -1); }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      style={{ background: bg }}
      dpr={[1, 2]}
      onPointerMissed={onDeselect}
    >
      <color attach="background" args={[bg]} />

      <Suspense fallback={null}>
        <GalaxyScene {...props} theme={theme} onSelectContribution={onSelectContribution} />
      </Suspense>
    </Canvas>
  );
}
