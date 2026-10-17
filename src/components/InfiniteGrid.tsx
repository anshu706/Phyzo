import React from 'react';
import { Grid } from '@react-three/drei';

interface InfiniteGridProps {
  visible?: boolean;
}

export const InfiniteGrid: React.FC<InfiniteGridProps> = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <group position={[0, -0.01, 0]}>
      {/* Primary infinite fine grid */}
      <Grid
        infiniteGrid
        cellSize={1.0}
        cellThickness={0.8}
        cellColor="#3D3B38"
        sectionSize={5.0}
        sectionThickness={1.4}
        sectionColor="#635E57"
        fadeDistance={45}
        fadeStrength={1.5}
      />
      {/* Subtle floor contact receiver */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#141414"
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
};
