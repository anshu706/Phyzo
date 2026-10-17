import React, { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useSceneStore } from '../core/useSceneStore';
import { CameraPreset } from '../physics/types';

export const CameraController: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const cameraPreset = useSceneStore((state) => state.cameraPreset);
  const { camera } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;

    let targetPos: [number, number, number] = [12, 9, 14];
    let lookAt: [number, number, number] = [0, 2, 0];

    switch (cameraPreset) {
      case 'top':
        targetPos = [0, 22, 0.0001];
        lookAt = [0, 0, 0];
        break;
      case 'side':
        targetPos = [22, 4, 0];
        lookAt = [0, 2, 0];
        break;
      case 'front':
        targetPos = [0, 4, 22];
        lookAt = [0, 2, 0];
        break;
      case 'isometric':
        targetPos = [15, 15, 15];
        lookAt = [0, 2, 0];
        break;
      case 'default':
      default:
        targetPos = [12, 8, 14];
        lookAt = [0, 2, 0];
        break;
    }

    // Smooth transition
    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(...targetPos);
    const startTarget = controlsRef.current.target.clone();
    const endTarget = new THREE.Vector3(...lookAt);

    let progress = 0;
    const animate = () => {
      progress += 0.06;
      if (progress < 1) {
        camera.position.lerpVectors(startPos, endPos, progress);
        controlsRef.current?.target.lerpVectors(startTarget, endTarget, progress);
        controlsRef.current?.update();
        requestAnimationFrame(animate);
      } else {
        camera.position.copy(endPos);
        controlsRef.current?.target.copy(endTarget);
        controlsRef.current?.update();
      }
    };
    animate();
  }, [cameraPreset, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={2}
      maxDistance={60}
      maxPolarAngle={Math.PI / 2 - 0.02} // Don't dip below floor
      target={[0, 2, 0]}
    />
  );
};
