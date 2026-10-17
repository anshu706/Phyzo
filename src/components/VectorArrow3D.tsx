import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface VectorArrow3DProps {
  origin: [number, number, number];
  vector: [number, number, number];
  color?: string;
  label?: string;
  scale?: number;
  minMagnitude?: number;
  maxVisualLength?: number;
  thickness?: number;
}

export const VectorArrow3D: React.FC<VectorArrow3DProps> = ({
  origin,
  vector,
  color = '#DD0200',
  label,
  scale = 0.3,
  minMagnitude = 0.05,
  maxVisualLength = 5.0,
  thickness = 0.04
}) => {
  const { direction, length, quaternion, labelPos } = useMemo(() => {
    const v = new THREE.Vector3(vector[0], vector[1], vector[2]);
    const mag = v.length();

    if (mag < minMagnitude) {
      return { length: 0, direction: new THREE.Vector3(0, 1, 0), quaternion: new THREE.Quaternion(), labelPos: [0, 0, 0] as [number, number, number] };
    }

    const visualLength = Math.min(maxVisualLength, Math.max(0.4, mag * scale));
    const dir = v.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);

    const tipPos = new THREE.Vector3(origin[0], origin[1], origin[2]).add(
      dir.clone().multiplyScalar(visualLength + 0.25)
    );

    return {
      direction: dir,
      length: visualLength,
      quaternion: quat,
      labelPos: [tipPos.x, tipPos.y, tipPos.z] as [number, number, number]
    };
  }, [origin, vector, scale, minMagnitude, maxVisualLength]);

  if (length === 0) return null;

  const headLength = Math.min(0.35, length * 0.35);
  const headWidth = thickness * 3.0;
  const cylinderHeight = Math.max(0.01, length - headLength);

  return (
    <group position={origin}>
      {/* Rotated arrow assembly */}
      <group quaternion={quaternion}>
        {/* Shaft */}
        <mesh position={[0, cylinderHeight / 2, 0]}>
          <cylinderGeometry args={[thickness, thickness, cylinderHeight, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.5}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Arrow Tip Cone */}
        <mesh position={[0, cylinderHeight + headLength / 2, 0]}>
          <coneGeometry args={[headWidth, headLength, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={3.0}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* Floating vector badge */}
      {label && (
        <Html position={[labelPos[0] - origin[0], labelPos[1] - origin[1], labelPos[2] - origin[2]]} center distanceFactor={14}>
          <div
            className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider pointer-events-none whitespace-nowrap shadow-md"
            style={{
              backgroundColor: 'rgba(24, 24, 24, 0.85)',
              color: color,
              border: `1px solid ${color}88`,
              backdropFilter: 'blur(8px)',
              boxShadow: `0 0 10px ${color}44`
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};
