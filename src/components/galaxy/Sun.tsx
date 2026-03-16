"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const COLOR = new THREE.Color("#FF8C20");
const R = 1.4; // core radius in world units

export function Sun() {
  const coreRef = useRef<THREE.Mesh>(null);
  const glow1Ref = useRef<THREE.Mesh>(null);
  const glow2Ref = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    if (coreRef.current) {
      (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.7 + Math.sin(t * 1.1) * 0.15;
    }
    if (glow1Ref.current) {
      (glow1Ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + Math.sin(t * 0.7) * 0.02;
    }
    if (glow2Ref.current) {
      (glow2Ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.03 + Math.sin(t * 0.5 + 1.2) * 0.01;
    }
    if (ring1Ref.current) {
      (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.15 + Math.sin(t * 0.9 + 0.5) * 0.04;
    }
    if (ring2Ref.current) {
      (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + Math.sin(t * 0.6) * 0.02;
    }
  });

  return (
    <group>
      {/* Outer corona */}
      <mesh ref={glow2Ref}>
        <sphereGeometry args={[R * 3.4, 16, 16]} />
        <meshBasicMaterial
          color={COLOR} transparent opacity={0.06}
          blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide}
        />
      </mesh>

      {/* Inner corona */}
      <mesh ref={glow1Ref}>
        <sphereGeometry args={[R * 2.1, 16, 16]} />
        <meshBasicMaterial
          color={COLOR} transparent opacity={0.14}
          blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide}
        />
      </mesh>

      {/* Tight atmosphere */}
      <mesh>
        <sphereGeometry args={[R * 1.35, 16, 16]} />
        <meshBasicMaterial
          color={COLOR} transparent opacity={0.12}
          blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide}
        />
      </mesh>

      {/* Core sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[R, 48, 48]} />
        <meshStandardMaterial
          color={COLOR}
          emissive={COLOR}
          emissiveIntensity={0.7}
          roughness={0.12}
          metalness={0.05}
        />
      </mesh>

      {/* Wireframe overlay for texture */}
      <mesh>
        <sphereGeometry args={[R * 1.02, 10, 10]} />
        <meshBasicMaterial
          color={COLOR} wireframe transparent opacity={0.07}
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </mesh>

      {/* Inner equatorial ring — visible as circle from top-down */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[R * 2.0, 0.04, 8, 80]} />
        <meshBasicMaterial
          color={COLOR} transparent opacity={0.28}
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </mesh>

      {/* Outer equatorial ring */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[R * 2.9, 0.025, 8, 80]} />
        <meshBasicMaterial
          color={COLOR} transparent opacity={0.14}
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </mesh>

      {/* Label — positioned below the sun on screen (+Z = down in top-down view) */}
      <Html
        position={[0, 0, R + 1.2]}
        center
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            padding: "3px 12px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 700,
            whiteSpace: "nowrap",
            color: "#FFD0A0",
            background: "rgba(5,7,20,0.75)",
            border: "1px solid rgba(255,140,32,0.5)",
            backdropFilter: "blur(4px)",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
          }}
        >
          Percona OSS Core
        </div>
      </Html>
    </group>
  );
}
