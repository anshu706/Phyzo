import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { TrajectoryPoint } from '../physics/types';

interface TrajectoryTrailProps {
  historyPoints: [number, number, number][];
  predictedPoints?: TrajectoryPoint[];
  color?: string;
  predictedColor?: string;
  showGhostTrails?: boolean;
}

export const TrajectoryTrail: React.FC<TrajectoryTrailProps> = ({
  historyPoints,
  predictedPoints,
  color = '#DD0200',
  predictedColor = '#19E3F5',
  showGhostTrails = true
}) => {
  // Convert predicted points into Three.js line points
  const predictedPath = useMemo(() => {
    if (!predictedPoints || predictedPoints.length < 2) return null;
    return predictedPoints.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  }, [predictedPoints]);

  // Convert history points
  const historyPath = useMemo(() => {
    if (!showGhostTrails || historyPoints.length < 2) return null;
    return historyPoints.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  }, [historyPoints, showGhostTrails]);

  return (
    <group>
      {/* Historical Ghost Trail */}
      {historyPath && historyPath.length > 1 && (
        <Line
          points={historyPath}
          color={color}
          lineWidth={2.5}
          dashed={false}
          transparent
          opacity={0.8}
        />
      )}

      {/* Historical ghost point markers at intervals */}
      {showGhostTrails && historyPoints.length > 0 && (
        <group>
          {historyPoints.filter((_, idx) => idx % 6 === 0).map((pt, i) => (
            <mesh key={i} position={pt}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.5}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Predictive Dotted Trajectory */}
      {predictedPath && predictedPath.length > 1 && (
        <Line
          points={predictedPath}
          color={predictedColor}
          lineWidth={2.0}
          dashed={true}
          dashScale={1.5}
          dashSize={0.4}
          gapSize={0.3}
          transparent
          opacity={0.75}
        />
      )}
    </group>
  );
};
