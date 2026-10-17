import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Atmosphere: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);

  // Generate gentle laboratory motes
  const count = 75;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = Math.random() * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        // Slow gentle upward/horizontal drift
        positions[i * 3 + 1] += delta * 0.15;
        if (positions[i * 3 + 1] > 15) {
          positions[i * 3 + 1] = 0;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Background color and depth fog */}
      <color attach="background" args={['#141414']} />
      <fog attach="fog" args={['#181818', 25, 60]} />

      {/* Atmospheric lighting */}
      <ambientLight intensity={0.55} color="#DDD5CD" />
      <directionalLight
        position={[12, 20, 10]}
        intensity={1.2}
        color="#F0E6D8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />
      {/* Cool fill light */}
      <directionalLight position={[-10, 8, -10]} intensity={0.35} color="#19E3F5" />
      {/* Ground bounce light */}
      <pointLight position={[0, 0.5, 0]} intensity={0.2} color="#7D4047" distance={15} />

      {/* Floating motes */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#DDD5CD"
          transparent
          opacity={0.35}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
};
