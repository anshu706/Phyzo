import React, { useMemo } from 'react';
import * as THREE from 'three';

interface SpringMeshProps {
  start: [number, number, number];
  end: [number, number, number];
  coils?: number;
  radius?: number;
  tubeRadius?: number;
  color?: string;
}

export const SpringMesh: React.FC<SpringMeshProps> = ({
  start,
  end,
  coils = 14,
  radius = 0.35,
  tubeRadius = 0.04,
  color = '#19E3F5'
}) => {
  const geometry = useMemo(() => {
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);
    const length = p1.distanceTo(p2);
    
    // Generate helix curve points
    const points: THREE.Vector3[] = [];
    const segments = coils * 30;
    
    // Direction vector from p1 to p2
    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
    // Build an arbitrary orthogonal frame
    const up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(dir.dot(up)) > 0.9) {
      up.set(1, 0, 0);
    }
    const right = new THREE.Vector3().crossVectors(dir, up).normalize();
    const orthoUp = new THREE.Vector3().crossVectors(right, dir).normalize();

    // Straight ends for attachment
    const straightMargin = 0.2;
    const activeLength = Math.max(0.1, length - straightMargin * 2);

    for (let i = 0; i <= segments; i++) {
      const frac = i / segments;
      const distAlong = straightMargin + frac * activeLength;
      const angle = frac * coils * Math.PI * 2;
      
      const rad = (frac === 0 || frac === 1) ? 0 : radius;
      const xOffset = Math.cos(angle) * rad;
      const yOffset = Math.sin(angle) * rad;
      
      const pt = new THREE.Vector3()
        .copy(p1)
        .addScaledVector(dir, distAlong)
        .addScaledVector(right, xOffset)
        .addScaledVector(orthoUp, yOffset);
      
      points.push(pt);
    }

    // Add anchor endpoints
    points.unshift(p1);
    points.push(p2);

    const CatmullRomCurveClass = (THREE as any).CatmullRomCurve3;
    const TubeGeometryClass = (THREE as any).TubeGeometry;
    const curve = new CatmullRomCurveClass(points);
    return new TubeGeometryClass(curve, segments, tubeRadius, 8, false);
  }, [start, end, coils, radius, tubeRadius]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        roughness={0.3}
        metalness={0.7}
      />
    </mesh>
  );
};
