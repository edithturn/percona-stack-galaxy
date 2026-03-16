"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { MapControls } from "@react-three/drei";
import type { OrbitControls } from "three-stdlib";
const INITIAL_ZOOM = 14;
const ZOOM_STEP = 4;
const MIN_ZOOM = 4;
const MAX_ZOOM = 60;

interface CameraRigProps {
  recenterKey: number;
  zoomDeltaRef: React.MutableRefObject<number>;
}

export function CameraRig({ recenterKey, zoomDeltaRef }: CameraRigProps) {
  const controlsRef = useRef<OrbitControls>(null);
  const isRecentering = useRef(false);
  const targetZoom = useRef(INITIAL_ZOOM);

  useEffect(() => {
    if (recenterKey > 0) {
      isRecentering.current = true;
      targetZoom.current = INITIAL_ZOOM;
    }
  }, [recenterKey]);

  useFrame(({ camera }) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Consume any pending zoom delta from buttons
    if (zoomDeltaRef.current !== 0) {
      targetZoom.current = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom.current + zoomDeltaRef.current * ZOOM_STEP));
      zoomDeltaRef.current = 0;
    }

    if (isRecentering.current) {
      camera.position.x += (0 - camera.position.x) * 0.07;
      camera.position.z += (0 - camera.position.z) * 0.07;
      controls.target.x += (0 - controls.target.x) * 0.07;
      controls.target.z += (0 - controls.target.z) * 0.07;

      if (
        Math.abs(camera.position.x) < 0.05 &&
        Math.abs(camera.position.z) < 0.05
      ) {
        camera.position.x = 0;
        camera.position.z = 0;
        controls.target.x = 0;
        controls.target.z = 0;
        isRecentering.current = false;
      }
      controls.update();
    }

    // Smooth zoom towards target
    camera.zoom += (targetZoom.current - camera.zoom) * 0.1;
    camera.updateProjectionMatrix();
  });

  return (
    <MapControls
      ref={controlsRef}
      makeDefault
      minZoom={4}
      maxZoom={60}
      dampingFactor={0.08}
    />
  );
}
