"use client";

import { Suspense } from "react";
import type React from "react";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { GalaxyData, Product } from "@/types/galaxy";
import { StarField } from "./StarField";
import { Planet } from "./Planet";
import { EdgeLine } from "./EdgeLine";
import { CameraRig } from "./CameraRig";
import { Sun } from "./Sun";
import { OrbitPath } from "./OrbitPath";
import { EcosystemZone, type EcosystemContribution } from "./EcosystemZone";
import { CometField } from "./CometField";

interface GalaxySceneProps {
  data: GalaxyData;
  selectedProduct: Product | null;
  visibleProductIds: Set<string>;
  onSelectProduct: (p: Product) => void;
  onSelectContribution: (c: EcosystemContribution) => void;
  recenterKey: number;
  panMode: boolean;
  theme: "dark" | "light";
  zoomDeltaRef: React.MutableRefObject<number>;
}

export function GalaxyScene({
  data,
  selectedProduct,
  visibleProductIds,
  onSelectProduct,
  onSelectContribution,
  recenterKey,
  panMode,
  theme,
  zoomDeltaRef,
}: GalaxySceneProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[60, 80, 30]} intensity={2.8} color="#fff8f0" castShadow={false} />
      <pointLight position={[0, 30, 0]} intensity={1.8} color="#ff8830" distance={120} decay={2} />
      <pointLight position={[50, 10, -50]} intensity={1.2} color="#4070ff" distance={140} decay={2} />
      <pointLight position={[-40, 5, 30]} intensity={0.8} color="#9040ff" distance={100} decay={2} />


      {/* Comets — always visible, colour adapts to theme */}
      <CometField theme={theme} />

      {/* Stars — always visible, style adapts to theme */}
      <StarField theme={theme} />

      {/* Orbital paths — one per category */}
      <OrbitPath a={3.5} b={2.5} color="#3B82F6" theme={theme} />  {/* Databases */}
      <OrbitPath a={6}   b={4.5} color="#8B5CF6" theme={theme} />  {/* Operators */}
      <OrbitPath a={9}   b={6.5} color="#10B981" theme={theme} />  {/* Observability */}
      <OrbitPath a={11.5} b={7.5} color="#EC4899" theme={theme} />  {/* Tools */}

      {/* Ecosystem contributions outer zone */}
      <EcosystemZone theme={theme} onSelectContribution={onSelectContribution} />

      {/* Central sun */}
      <Sun />

      {/* Edges */}
      {data.edges.map((edge, i) => {
        const from = data.products.find((p) => p.id === edge.from);
        const to = data.products.find((p) => p.id === edge.to);
        if (!from || !to) return null;

        const isDimmed =
          selectedProduct !== null &&
          selectedProduct.id !== from.id &&
          selectedProduct.id !== to.id;

        return (
          <EdgeLine
            key={i}
            from={from.position}
            to={to.position}
            dimmed={isDimmed}
            theme={theme}
          />
        );
      })}

      {/* Planets */}
      {data.products.map((product) => {
        const isVisible = visibleProductIds.has(product.id);
        return (
          <Planet
            key={product.id}
            product={product}
            isSelected={selectedProduct?.id === product.id}
            isDimmed={!isVisible || (selectedProduct !== null && selectedProduct.id !== product.id)}
            onClick={() => onSelectProduct(product)}
            panMode={panMode}
          />
        );
      })}

      {/* Camera */}
      <CameraRig recenterKey={recenterKey} zoomDeltaRef={zoomDeltaRef} />

      {/* Post-processing */}
      <Suspense fallback={null}>
        <EffectComposer>
          <Bloom
            intensity={theme === "light" ? 0.3 : 1.6}
            luminanceThreshold={theme === "light" ? 0.9 : 0.18}
            luminanceSmoothing={0.85}
            mipmapBlur
          />
          <Vignette offset={0.18} darkness={theme === "light" ? 0.15 : 0.55} />
        </EffectComposer>
      </Suspense>
    </>
  );
}
