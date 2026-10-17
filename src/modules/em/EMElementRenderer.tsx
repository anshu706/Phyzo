import React, { useRef } from 'react';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';
import { PhysicsObjectState } from '../../physics/types';
import { useSceneStore } from '../../core/useSceneStore';
import { useSimulationStore } from '../../core/useSimulationStore';

interface EMElementProps {
  data: PhysicsObjectState;
}

export const EMElementRenderer: React.FC<EMElementProps> = ({ data }) => {
  const selectedObjectId = useSceneStore((state) => state.selectedObjectId);
  const selectObject = useSceneStore((state) => state.selectObject);
  const updateObject = useSceneStore((state) => state.updateObject);
  const transformMode = useSceneStore((state) => state.transformMode);
  const snapToGrid = useSceneStore((state) => state.snapToGrid);
  const gridSnapSize = useSceneStore((state) => state.gridSnapSize);
  const isPlaying = useSimulationStore((state) => state.isPlaying);

  const groupRef = useRef<THREE.Group>(null);
  const isSelected = selectedObjectId === data.id;

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    selectObject(data.id);
  };

  const renderMeshByType = () => {
    switch (data.type) {
      case 'charge_positive':
        return (
          <group>
            {/* Positive Charge Sphere with Emissive Core */}
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial
                color="#DD0200"
                emissive="#DD0200"
                emissiveIntensity={0.5}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            {/* Outer Glowing Halo */}
            <mesh>
              <sphereGeometry args={[0.7, 16, 16]} />
              <meshBasicMaterial
                color="#DD0200"
                transparent
                opacity={0.25}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        );

      case 'charge_negative':
        return (
          <group>
            {/* Negative Charge Sphere */}
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial
                color="#2563EB"
                emissive="#2563EB"
                emissiveIntensity={0.5}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            {/* Outer Glowing Halo */}
            <mesh>
              <sphereGeometry args={[0.7, 16, 16]} />
              <meshBasicMaterial
                color="#2563EB"
                transparent
                opacity={0.25}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        );

      case 'bar_magnet':
        return (
          <group>
            {/* North Pole (Red, +Y) */}
            <mesh position={[0, 0.75, 0]}>
              <boxGeometry args={[0.8, 1.5, 0.5]} />
              <meshStandardMaterial
                color="#DC2626"
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            {/* South Pole (Blue, -Y) */}
            <mesh position={[0, -0.75, 0]}>
              <boxGeometry args={[0.8, 1.5, 0.5]} />
              <meshStandardMaterial
                color="#2563EB"
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            {/* Metallic Center Band */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.82, 0.2, 0.52]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        );

      case 'current_wire':
        return (
          <group>
            {/* Infinite Straight Wire Cylinder */}
            <mesh>
              <cylinderGeometry args={[0.08, 0.08, 12, 16]} />
              <meshStandardMaterial
                color="#F59E0B"
                metalness={0.85}
                roughness={0.2}
                emissive="#B45309"
                emissiveIntensity={0.3}
              />
            </mesh>
            {/* Current Flow Direction Indicator Arrows */}
            {[ -3, 0, 3 ].map((yOffset) => (
              <mesh key={yOffset} position={[0, yOffset, 0]}>
                <coneGeometry args={[0.2, 0.4, 12]} />
                <meshStandardMaterial color="#FBBF24" emissive="#F59E0B" emissiveIntensity={0.6} />
              </mesh>
            ))}
          </group>
        );

      case 'solenoid':
        return (
          <group>
            {/* Solenoid Inner Core */}
            <mesh>
              <cylinderGeometry args={[0.9, 0.9, 4.0, 24]} />
              <meshStandardMaterial
                color="#1E293B"
                metalness={0.5}
                roughness={0.6}
                transparent
                opacity={0.6}
              />
            </mesh>
            {/* Copper Wire Windings */}
            {Array.from({ length: 12 }).map((_, idx) => (
              <mesh key={idx} position={[0, -1.8 + idx * 0.33, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.95, 0.05, 12, 32]} />
                <meshStandardMaterial
                  color="#F59E0B"
                  metalness={0.9}
                  roughness={0.2}
                  emissive="#B45309"
                  emissiveIntensity={0.2}
                />
              </mesh>
            ))}
          </group>
        );

      case 'uniform_field':
        return (
          <group>
            {/* Positive Plate */}
            <mesh position={[-3, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[4, 3, 0.1]} />
              <meshStandardMaterial color="#DC2626" transparent opacity={0.6} />
            </mesh>
            {/* Negative Plate */}
            <mesh position={[3, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[4, 3, 0.1]} />
              <meshStandardMaterial color="#2563EB" transparent opacity={0.6} />
            </mesh>
            {/* Vector Arrow between plates */}
            <mesh rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 5.4, 8]} />
              <meshBasicMaterial color="#19E3F5" />
            </mesh>
          </group>
        );

      case 'charged_particle':
        return (
          <group>
            <mesh>
              <sphereGeometry args={[0.25, 24, 24]} />
              <meshStandardMaterial
                color="#19E3F5"
                emissive="#19E3F5"
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshBasicMaterial
                color="#19E3F5"
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <group
        ref={groupRef}
        position={data.position}
        rotation={data.rotation}
        scale={data.scale}
        onPointerDown={handlePointerDown}
      >
        {renderMeshByType()}

        {isSelected && (
          <mesh>
            <boxGeometry args={[2.0, 2.0, 2.0]} />
            <meshBasicMaterial
              color="#19E3F5"
              wireframe
              transparent
              opacity={0.4}
            />
          </mesh>
        )}
      </group>

      {isSelected && !isPlaying && (
        <TransformControls
          object={groupRef as any}
          mode={transformMode}
          translationSnap={snapToGrid ? gridSnapSize : null}
          rotationSnap={snapToGrid ? Math.PI / 12 : null}
          scaleSnap={snapToGrid ? 0.25 : null}
          onObjectChange={() => {
            if (groupRef.current) {
              const pos = groupRef.current.position;
              const rot = groupRef.current.rotation;
              const sc = groupRef.current.scale;
              updateObject(data.id, {
                position: [pos.x, pos.y, pos.z],
                rotation: [rot.x, rot.y, rot.z],
                scale: [sc.x, sc.y, sc.z]
              });
            }
          }}
        />
      )}
    </>
  );
};
