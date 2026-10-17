import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../../core/useSceneStore';
import { useSimulationStore } from '../../core/useSimulationStore';
import { generateEMFieldLines, EMFieldLine, stepChargedParticle, ChargedParticleState } from '../../physics/emSolver';

export const EMFieldRenderer: React.FC = () => {
  const objects = useSceneStore((state) => state.objects);
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const timeScale = useSimulationStore((state) => state.timeScale);

  // Compute field lines from charges, magnets, and current elements
  const fieldLines = useMemo<EMFieldLine[]>(() => {
    return generateEMFieldLines(objects);
  }, [objects]);

  // Particles traveling along field lines for dynamic flow visualization
  const particlesRef = useRef<THREE.Points>(null);
  const flowOffsetRef = useRef(0);

  // Dynamic particle cloud streaming along field lines
  const { positions, colors } = useMemo(() => {
    const posList: number[] = [];
    const colList: number[] = [];

    fieldLines.forEach((line) => {
      const isElectric = line.type === 'electric';
      const c = new THREE.Color(isElectric ? '#7D4047' : '#19E3F5');

      line.points.forEach((p, idx) => {
        if (idx % 2 === 0) {
          posList.push(p[0], p[1], p[2]);
          colList.push(c.r, c.g, c.b);
        }
      });
    });

    return {
      positions: new Float32Array(posList),
      colors: new Float32Array(colList)
    };
  }, [fieldLines]);

  useFrame((_, delta) => {
    if (isPlaying) {
      flowOffsetRef.current += delta * 1.5 * timeScale;
    }
  });

  if (fieldLines.length === 0) return null;

  return (
    <group name="em-fields-layer">
      {/* 3D Static/Dynamic Field Lines (Vintage Rosewood #7D4047 & Electric Cyan #19E3F5) */}
      {fieldLines.map((line) => {
        if (line.points.length < 2) return null;
        const pts = line.points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));

        return (
          <line key={line.id}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={pts.length}
                array={new Float32Array(pts.flatMap((v) => [v.x, v.y, v.z]))}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={line.color}
              linewidth={2}
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
            />
          </line>
        );
      })}

      {/* Dynamic Particle Stream Flow along Field Lines */}
      {positions.length > 0 && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={positions.length / 3}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={colors.length / 3}
              array={colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.12}
            vertexColors
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
};
