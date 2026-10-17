import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '../../core/useSceneStore';
import { traceOpticalRays, OpticalRay } from '../../physics/opticsSolver';

export const OpticsRayRenderer: React.FC = () => {
  const objects = useSceneStore((state) => state.objects);

  // Re-trace rays whenever objects change (position, rotation, properties)
  const rays = useMemo<OpticalRay[]>(() => {
    return traceOpticalRays(objects);
  }, [objects]);

  if (rays.length === 0) return null;

  return (
    <group name="optics-rays-layer">
      {rays.map((ray) => {
        if (ray.points.length < 2) return null;

        // Create line geometry points
        const straightPoints = ray.points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));

        return (
          <group key={ray.id}>
            {/* Core bright laser ray */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={straightPoints.length}
                  array={new Float32Array(straightPoints.flatMap((v) => [v.x, v.y, v.z]))}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color={ray.color}
                linewidth={3}
                transparent
                opacity={0.95}
                blending={THREE.AdditiveBlending}
              />
            </line>

            {/* Glowing outer halo tube for intense bloom */}
            {straightPoints.map((startPt, idx) => {
              if (idx === straightPoints.length - 1) return null;
              const endPt = straightPoints[idx + 1];
              const segDir = new THREE.Vector3().subVectors(endPt, startPt);
              const segLen = segDir.length();
              if (segLen < 0.01) return null;

              const midPt = new THREE.Vector3().addVectors(startPt, endPt).multiplyScalar(0.5);
              const orientation = new THREE.Matrix4();
              orientation.lookAt(startPt, endPt, new THREE.Vector3(0, 1, 0));

              return (
                <mesh
                  key={`halo-${ray.id}-${idx}`}
                  position={[midPt.x, midPt.y, midPt.z]}
                  quaternion={new THREE.Quaternion().setFromRotationMatrix(orientation)}
                >
                  <cylinderGeometry args={[0.035, 0.035, segLen, 8, 1, true]} />
                  <meshBasicMaterial
                    color={ray.color}
                    transparent
                    opacity={0.35}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};
