"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

type OrbProps = {
  color: string;
  geometry: "icosahedron" | "octahedron";
};

function Orb({ color, geometry }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) {
      return;
    }

    meshRef.current.rotation.y += delta * 0.55;
    meshRef.current.rotation.x += delta * 0.2;
  });

  return (
    <Float speed={2.2} rotationIntensity={0.7} floatIntensity={1.1}>
      <mesh ref={meshRef}>
        {geometry === "icosahedron" ? (
          <icosahedronGeometry args={[1, 1]} />
        ) : (
          <octahedronGeometry args={[1.1, 0]} />
        )}
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.22}
          emissive={"#111111"}
          emissiveIntensity={0.4}
        />
      </mesh>
    </Float>
  );
}

type AgentAvatar3DProps = {
  accentColor?: string;
  variant?: "orb" | "halo" | "prism";
};

export function AgentAvatar3D({
  accentColor = "#14F195",
  variant = "orb",
}: AgentAvatar3DProps) {
  const geometry = variant === "prism" ? "octahedron" : "icosahedron";

  return (
    <div
      className={`h-28 w-full rounded-xl border border-white/10 ${
        variant === "halo"
          ? "bg-[radial-gradient(circle_at_50%_40%,rgba(20,241,149,0.18),rgba(0,0,0,0.3))]"
          : "bg-gradient-to-br from-white/[0.08] to-black/20"
      }`}
    >
      <Canvas camera={{ position: [0, 0, 3.2], fov: 44 }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 2, 2]} intensity={1.2} color={accentColor} />
        <pointLight position={[-1.5, -2, 2]} intensity={0.8} color="#9945FF" />
        <Orb color={accentColor} geometry={geometry} />
      </Canvas>
    </div>
  );
}
