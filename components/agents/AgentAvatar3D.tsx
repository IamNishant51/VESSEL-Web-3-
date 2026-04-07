"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { SeededRandom } from "@/lib/generative-art/noise";

type ParticleFieldProps = {
  count: number;
  color: string;
  spread: number;
  seed: number;
};

function ParticleField({ count, color, spread, seed }: ParticleFieldProps) {
  const meshRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const rng = new SeededRandom(seed);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = rng.nextFloat(-spread, spread);
      pos[i * 3 + 1] = rng.nextFloat(-spread, spread);
      pos[i * 3 + 2] = rng.nextFloat(-spread, spread);
    }
    return pos;
  }, [count, spread, seed]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.05;
    meshRef.current.rotation.x += delta * 0.02;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

type EnergyRingProps = {
  radius: number;
  color: string;
  tilt: number;
  speed: number;
};

function EnergyRing({ radius, color, tilt, speed }: EnergyRingProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z += delta * speed;
  });

  return (
    <mesh ref={meshRef} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.01, 8, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

type SoulOrbProps = {
  color: string;
  accentColor: string;
  distort: number;
  speed: number;
  seed: number;
};

function SoulOrb({ color, accentColor, distort, speed, seed }: SoulOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * speed * 0.5;
    meshRef.current.rotation.x += delta * speed * 0.2;
  });

  return (
    <Float speed={2.2} rotationIntensity={0.7} floatIntensity={1.1}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={speed * 2}
          roughness={0.2}
          metalness={0.8}
          emissive={accentColor}
          emissiveIntensity={0.3}
        />
      </Sphere>
    </Float>
  );
}

type AgentAvatar3DProps = {
  accentColor?: string;
  primaryColor?: string;
  variant?: "orb" | "halo" | "prism";
  seed?: number;
  size?: number;
};

export function AgentAvatar3D({
  accentColor = "#14F195",
  primaryColor = "#171819",
  variant = "orb",
  seed = 42,
  size = 112,
}: AgentAvatar3DProps) {
  const particleCount = useMemo(() => {
    const r = new SeededRandom(seed);
    return r.nextInt(50, 150);
  }, [seed]);
  const ringCount = useMemo(() => {
    const r = new SeededRandom(seed);
    return r.nextInt(2, 4);
  }, [seed]);
  const distort = useMemo(() => {
    const r = new SeededRandom(seed);
    return r.nextFloat(0.2, 0.6);
  }, [seed]);
  const speed = useMemo(() => {
    const r = new SeededRandom(seed);
    return r.nextFloat(0.3, 0.8);
  }, [seed]);

  const rings = useMemo(() => {
    const r = new SeededRandom(seed);
    return Array.from({ length: ringCount }, (_, i) => ({
      radius: 1.3 + i * 0.3,
      color: i % 2 === 0 ? accentColor : primaryColor,
      tilt: r.nextFloat(-0.5, 0.5),
      speed: r.nextFloat(0.2, 0.6) * (i % 2 === 0 ? 1 : -1),
    }));
  }, [ringCount, accentColor, primaryColor, seed]);

  return (
    <div
      className="rounded-xl overflow-hidden border border-white/10"
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 44 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[2, 2, 2]} intensity={1.2} color={accentColor} />
        <pointLight position={[-2, -1, 2]} intensity={0.6} color={primaryColor} />
        <pointLight position={[0, 2, -1]} intensity={0.4} color="#9945FF" />

        <SoulOrb
          color={primaryColor}
          accentColor={accentColor}
          distort={distort}
          speed={speed}
          seed={seed}
        />

        {rings.map((ring, i) => (
          <EnergyRing key={i} {...ring} />
        ))}

        <ParticleField
          count={particleCount}
          color={accentColor}
          spread={2.5}
          seed={seed + 1000}
        />
      </Canvas>
    </div>
  );
}
