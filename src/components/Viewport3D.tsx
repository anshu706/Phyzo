import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, CuboidCollider } from '@react-three/rapier';
import { InfiniteGrid } from './InfiniteGrid';
import { Atmosphere } from './Atmosphere';
import { CameraController } from './CameraController';
import { PostProcessingPipeline } from './PostProcessingPipeline';
import { PhysicsObjectRenderer } from '../modules/mechanics/PhysicsObjectRenderer';
import { OpticalElementRenderer } from '../modules/optics/OpticalElementRenderer';
import { OpticsRayRenderer } from '../modules/optics/OpticsRayRenderer';
import { useSceneStore } from '../core/useSceneStore';
import { useSimulationStore } from '../core/useSimulationStore';

const MECHANICS_TYPES = new Set(['sphere', 'cube', 'ramp', 'cannon', 'spring', 'pendulum']);
const OPTICS_TYPES = new Set([
  'convex_lens',
  'concave_lens',
  'flat_mirror',
  'curved_mirror',
  'prism',
  'laser_emitter',
  'white_light_emitter'
]);

export const Viewport3D: React.FC = () => {
  const objects = useSceneStore((state) => state.objects);
  const selectObject = useSceneStore((state) => state.selectObject);
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const gravity = useSimulationStore((state) => state.gravity);
  const showGrid = useSimulationStore((state) => state.showGrid);
  const resetKey = useSimulationStore((state) => state.resetKey);

  const mechanicsObjects = objects.filter((o) => MECHANICS_TYPES.has(o.type));
  const opticsObjects = objects.filter((o) => OPTICS_TYPES.has(o.type));

  return (
    <div
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
      onPointerDown={(e) => {
        // Deselect if clicking directly on canvas container (unless stopped by mesh)
        if (e.target === e.currentTarget) {
          selectObject(null);
        }
      }}
    >
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [12, 8, 14], fov: 45 }}
        onPointerDown={(e) => {
          // Deselect on ground or empty space click
          if ((e as any).intersections && (e as any).intersections.length === 0) {
            selectObject(null);
          }
        }}
      >
        <Suspense fallback={null}>
          <Atmosphere />
          <InfiniteGrid visible={showGrid} />
          <CameraController />

          {/* Physics World Simulation for Mechanics Objects */}
          <Physics
            key={`rapier-${resetKey}`}
            gravity={gravity}
            paused={!isPlaying}
            timeStep="vary"
          >
            {/* Infinite Ground Rigid Body Collider */}
            <CuboidCollider position={[0, -0.5, 0]} args={[50, 0.5, 50]} friction={0.6} restitution={0.4} />

            {/* Render all mechanics objects */}
            {mechanicsObjects.map((obj) => (
              <PhysicsObjectRenderer key={obj.id} data={obj} />
            ))}
          </Physics>

          {/* Render Optical Elements & Glowing Emissive Rays */}
          {opticsObjects.map((obj) => (
            <OpticalElementRenderer key={obj.id} data={obj} />
          ))}
          <OpticsRayRenderer />

          <PostProcessingPipeline />
        </Suspense>
      </Canvas>
    </div>
  );
};
