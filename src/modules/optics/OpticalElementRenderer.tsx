import React, { useRef } from 'react';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';
import { PhysicsObjectState } from '../../physics/types';
import { useSceneStore } from '../../core/useSceneStore';
import { useSimulationStore } from '../../core/useSimulationStore';

interface OpticalElementProps {
  data: PhysicsObjectState;
}

export const OpticalElementRenderer: React.FC<OpticalElementProps> = ({ data }) => {
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
      case 'convex_lens':
        return (
          <group>
            {/* Glass Biconvex Lens Body */}
            <mesh scale={[1, 1, 0.4]}>
              <sphereGeometry args={[1.5, 32, 16]} />
              <meshPhysicalMaterial
                color="#E0F7FA"
                transmission={0.92}
                opacity={0.85}
                transparent
                roughness={0.05}
                ior={data.refractiveIndex || 1.517}
                reflectivity={0.5}
                metalness={0.1}
              />
            </mesh>
            {/* Frosted Lens Rim Frame */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.52, 0.08, 16, 48]} />
              <meshStandardMaterial color="#2E3440" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Lens Center Optical Axis Indicator */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 3.2, 8]} />
              <meshBasicMaterial color="#19E3F5" transparent opacity={0.3} />
            </mesh>
          </group>
        );

      case 'concave_lens':
        return (
          <group>
            {/* Concave Glass Lens */}
            <mesh scale={[1, 1, 0.25]}>
              <cylinderGeometry args={[1.5, 1.5, 0.4, 32]} />
              <meshPhysicalMaterial
                color="#EBF8FF"
                transmission={0.92}
                opacity={0.85}
                transparent
                roughness={0.08}
                ior={data.refractiveIndex || 1.517}
              />
            </mesh>
            {/* Rim Frame */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.52, 0.09, 16, 48]} />
              <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        );

      case 'prism':
        return (
          <group position={[0, 0, 0]}>
            {/* Crystal Glass Triangular Prism using 3-segment cylinder */}
            <mesh rotation={[0, Math.PI / 6, 0]}>
              <cylinderGeometry args={[1.4, 1.4, 2.5, 3]} />
              <meshPhysicalMaterial
                color="#F0F8FF"
                transmission={0.95}
                opacity={0.88}
                transparent
                roughness={0.02}
                ior={data.refractiveIndex || 1.52}
                metalness={0.05}
              />
            </mesh>
            {/* Sleek Prism Stand */}
            <mesh position={[0, -1.4, 0]}>
              <cylinderGeometry args={[0.8, 1.0, 0.3, 24]} />
              <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.4} />
            </mesh>
          </group>
        );

      case 'flat_mirror':
      case 'curved_mirror':
        return (
          <group>
            {/* High-reflective Mirror Face */}
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[0.08, 2.5, 3.5]} />
              <meshStandardMaterial
                color="#FFFFFF"
                metalness={0.98}
                roughness={0.02}
                envMapIntensity={1.5}
              />
            </mesh>
            {/* Mirror Dark Border Frame */}
            <mesh rotation={[0, Math.PI / 2, 0]} position={[-0.05, 0, 0]}>
              <boxGeometry args={[0.04, 2.65, 3.65]} />
              <meshStandardMaterial color="#0F172A" metalness={0.6} roughness={0.5} />
            </mesh>
            {/* Heavy Base Stand */}
            <mesh position={[0, -1.4, 0]}>
              <cylinderGeometry args={[0.6, 0.8, 0.3, 24]} />
              <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        );

      case 'laser_emitter':
      case 'white_light_emitter':
        return (
          <group>
            {/* Emitter Cylinder Body */}
            <mesh rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.25, 0.3, 1.4, 24]} />
              <meshStandardMaterial color="#18181B" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* Gold / Cyan Trim Ring */}
            <mesh rotation={[0, 0, -Math.PI / 2]} position={[0.4, 0, 0]}>
              <torusGeometry args={[0.27, 0.03, 16, 32]} />
              <meshStandardMaterial
                color={data.type === 'white_light_emitter' ? '#F0E6D8' : '#19E3F5'}
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
            {/* Laser Nozzle Glowing Aperture */}
            <mesh rotation={[0, 0, -Math.PI / 2]} position={[0.7, 0, 0]}>
              <cylinderGeometry args={[0.15, 0.2, 0.1, 16]} />
              <meshBasicMaterial
                color={data.type === 'white_light_emitter' ? '#FFFFFF' : (data.color || '#19E3F5')}
              />
            </mesh>
            {/* Articulated Swivel Stand */}
            <mesh position={[0, -0.6, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.7, 12]} />
              <meshStandardMaterial color="#3F3F46" metalness={0.7} roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.95, 0]}>
              <cylinderGeometry args={[0.5, 0.6, 0.15, 24]} />
              <meshStandardMaterial color="#27272A" metalness={0.8} roughness={0.3} />
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

        {/* Selection Glowing Outline/Halo */}
        {isSelected && (
          <mesh>
            <boxGeometry args={[3.2, 3.2, 3.2]} />
            <meshBasicMaterial
              color="#19E3F5"
              wireframe
              transparent
              opacity={0.4}
            />
          </mesh>
        )}
      </group>

      {/* Gizmo Transform Controls for Interactive Dragging */}
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
