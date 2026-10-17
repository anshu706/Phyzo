import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, CuboidCollider } from '@react-three/rapier';
import { InfiniteGrid } from './InfiniteGrid';
import { Atmosphere } from './Atmosphere';
import { CameraController } from './CameraController';
import { PostProcessingPipeline } from './PostProcessingPipeline';
import { PhysicsObjectRenderer } from '../modules/mechanics/PhysicsObjectRenderer';
import { useSceneStore } from '../core/useSceneStore';
import { useSimulationStore } from '../core/useSimulationStore';

export const Viewport3D: React.FC = () => {
  const objects = useSceneStore((state) => state.objects);
  const selectObject = useSceneStore((state) => state.selectObject);
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const gravity = useSimulationStore((state) => state.gravity);
  const showGrid = useSimulationStore((state) => state.showGrid);
  const resetKey = useSimulationStore((state) => state.resetKey);

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

          {/* Physics World Simulation */}
          <Physics
            key={`rapier-${resetKey}`}
            gravity={gravity}
            paused={!isPlaying}
            timeStep="vary"
          >
            {/* Infinite Ground Rigid Body Collider */}
            <CuboidCollider position={[0, -0.5, 0]} args={[50, 0.5, 50]} friction={0.6} restitution={0.4} />

            {/* Render all scene objects */}
            {objects.map((obj) => (
              <PhysicsObjectRenderer key={obj.id} data={obj} />
            ))}
          </Physics>

          <PostProcessingPipeline />
        </Suspense>
      </Canvas>
    </div>
  );
};
