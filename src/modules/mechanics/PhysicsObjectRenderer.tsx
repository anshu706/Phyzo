import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CuboidCollider, BallCollider } from '@react-three/rapier';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { PhysicsObjectState, LiveTelemetry, TrajectoryPoint } from '../../physics/types';
import { useSceneStore } from '../../core/useSceneStore';
import { useSimulationStore } from '../../core/useSimulationStore';
import { VectorArrow3D } from '../../components/VectorArrow3D';
import { TrajectoryTrail } from '../../components/TrajectoryTrail';
import { SpringMesh } from './SpringMesh';
import { predictProjectileTrajectory, calculateKineticEnergy, calculatePotentialEnergy, STANDARD_GRAVITY } from '../../physics/solvers';

interface Props {
  data: PhysicsObjectState;
}

export const PhysicsObjectRenderer: React.FC<Props> = ({ data }) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshGroupRef = useRef<THREE.Group>(null);
  const transformRef = useRef<any>(null);

  const selectedObjectId = useSceneStore((state) => state.selectedObjectId);
  const selectObject = useSceneStore((state) => state.selectObject);
  const updateObject = useSceneStore((state) => state.updateObject);
  const transformMode = useSceneStore((state) => state.transformMode);
  const snapToGrid = useSceneStore((state) => state.snapToGrid);
  const gridSnapSize = useSceneStore((state) => state.gridSnapSize);

  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const timeScale = useSimulationStore((state) => state.timeScale);
  const explainLens = useSimulationStore((state) => state.explainLens);
  const showGhostTrails = useSimulationStore((state) => state.showGhostTrails);
  const updateTelemetry = useSimulationStore((state) => state.updateTelemetry);
  const resetKey = useSimulationStore((state) => state.resetKey);
  const addCaption = useSimulationStore((state) => state.addCaption);

  const isSelected = selectedObjectId === data.id;

  // Local state for rendering telemetry and trails
  const [currentPos, setCurrentPos] = useState<[number, number, number]>(data.position);
  const [currentVel, setCurrentVel] = useState<[number, number, number]>([0, 0, 0]);
  const [currentForces, setCurrentForces] = useState<{
    gravity: [number, number, number];
    net: [number, number, number];
    normal?: [number, number, number];
    spring?: [number, number, number];
    tension?: [number, number, number];
  }>({
    gravity: [0, -data.mass * STANDARD_GRAVITY, 0],
    net: [0, 0, 0]
  });

  const [historyTrail, setHistoryTrail] = useState<[number, number, number][]>([]);
  const prevVelRef = useRef<[number, number, number]>([0, 0, 0]);
  const initializedLaunchRef = useRef(false);

  // Pendulum internal angle & angular velocity state
  const pendulumAngleRef = useRef(data.initialTheta ? (data.initialTheta * Math.PI) / 180 : 0.6);
  const pendulumOmegaRef = useRef(0);

  // Spring internal displacement state for analytical/simulated sync
  const springPosRef = useRef<[number, number, number]>([...data.position]);
  const springVelRef = useRef<[number, number, number]>([0, 0, 0]);

  // Reset positions when simulation resets or data updates
  useEffect(() => {
    setCurrentPos(data.position);
    setCurrentVel(data.initialVelocity || [0, 0, 0]);
    setHistoryTrail([]);
    initializedLaunchRef.current = false;
    pendulumAngleRef.current = data.initialTheta ? (data.initialTheta * Math.PI) / 180 : 0.6;
    pendulumOmegaRef.current = 0;
    springPosRef.current = [...data.position];
    springVelRef.current = [0, 0, 0];

    if (rigidBodyRef.current) {
      rigidBodyRef.current.setTranslation(
        new THREE.Vector3(...data.position),
        true
      );
      rigidBodyRef.current.setLinvel(
        new THREE.Vector3(...(data.initialVelocity || [0, 0, 0])),
        true
      );
      rigidBodyRef.current.setAngvel(new THREE.Vector3(0, 0, 0), true);
    }
  }, [resetKey, data.position, data.initialVelocity, data.initialTheta]);

  // Initial impulse or velocity setting on play
  useEffect(() => {
    if (isPlaying && !initializedLaunchRef.current && rigidBodyRef.current) {
      initializedLaunchRef.current = true;
      if (data.initialVelocity && (data.initialVelocity[0] !== 0 || data.initialVelocity[1] !== 0 || data.initialVelocity[2] !== 0)) {
        rigidBodyRef.current.setLinvel(
          new THREE.Vector3(...data.initialVelocity),
          true
        );
      }
    }
  }, [isPlaying, data.initialVelocity]);

  // Projectile trajectory prediction preview
  const predictedPath: TrajectoryPoint[] = React.useMemo(() => {
    if (data.type === 'cannon' || (data.type === 'sphere' && data.initialVelocity && (data.initialVelocity[0] !== 0 || data.initialVelocity[1] !== 0))) {
      const vel = data.initialVelocity || [
        (data.launchSpeed || 12) * Math.cos(((data.launchAngle || 45) * Math.PI) / 180),
        (data.launchSpeed || 12) * Math.sin(((data.launchAngle || 45) * Math.PI) / 180),
        0
      ];
      return predictProjectileTrajectory(data.position, vel, STANDARD_GRAVITY, 0.04, 3.5, 0);
    }
    return [];
  }, [data.position, data.initialVelocity, data.launchSpeed, data.launchAngle, data.type]);

  // Simulation physics frame update
  useFrame((_, delta) => {
    const dt = Math.min(0.04, delta) * timeScale;

    // Handle Harmonic Spring System
    if (data.type === 'spring') {
      const anchor = data.anchorPosition || [-2, 1.5, 0];
      if (isPlaying) {
        const k = data.springK || 25;
        const restLen = data.restLength || 3.0;
        const damping = data.damping || 0.15;
        const m = data.mass || 2.0;

        // Vector from anchor to mass
        const dx = springPosRef.current[0] - anchor[0];
        const currentLen = Math.abs(dx);
        const displacement = currentLen - restLen;

        // Hooke's Law: F_s = -k * displacement - damping * v
        const fSpring = -k * displacement - damping * springVelRef.current[0];
        const accel = fSpring / m;

        springVelRef.current[0] += accel * dt;
        springPosRef.current[0] += springVelRef.current[0] * dt;

        const pos: [number, number, number] = [springPosRef.current[0], anchor[1], anchor[2]];
        const vel: [number, number, number] = [springVelRef.current[0], 0, 0];
        setCurrentPos(pos);
        setCurrentVel(vel);

        const speed = Math.abs(vel[0]);
        const ke = calculateKineticEnergy(m, speed);
        const pe = 0.5 * k * displacement * displacement;

        const springForceVec: [number, number, number] = [fSpring, 0, 0];
        setCurrentForces({
          gravity: [0, 0, 0],
          net: springForceVec,
          spring: springForceVec
        });

        // Telemetry
        updateTelemetry(data.id, {
          id: data.id,
          position: pos,
          velocity: vel,
          speed,
          acceleration: [accel, 0, 0],
          kineticEnergy: ke,
          potentialEnergy: pe,
          mechanicalEnergy: ke + pe,
          forces: {
            gravity: [0, 0, 0],
            net: springForceVec,
            spring: springForceVec
          },
          momentum: [m * vel[0], 0, 0]
        });

        // Historical Trail
        setHistoryTrail((prev) => [...prev.slice(-120), pos]);
      } else {
        setCurrentPos(data.position);
      }
      return;
    }

    // Handle Simple Gravity Pendulum
    if (data.type === 'pendulum') {
      const pivot = data.pivotPosition || [0, 6, 0];
      const L = data.pendulumLength || 4.0;
      const m = data.bobMass || data.mass || 2.5;

      if (isPlaying) {
        // d^2(theta)/dt^2 = -(g / L) * sin(theta) - damping * omega
        const damping = 0.04;
        const alpha = -(STANDARD_GRAVITY / L) * Math.sin(pendulumAngleRef.current) - damping * pendulumOmegaRef.current;
        pendulumOmegaRef.current += alpha * dt;
        pendulumAngleRef.current += pendulumOmegaRef.current * dt;

        const theta = pendulumAngleRef.current;
        const x = pivot[0] + L * Math.sin(theta);
        const y = pivot[1] - L * Math.cos(theta);
        const z = pivot[2];

        const speed = Math.abs(pendulumOmegaRef.current * L);
        const vx = pendulumOmegaRef.current * L * Math.cos(theta);
        const vy = pendulumOmegaRef.current * L * Math.sin(theta);

        const pos: [number, number, number] = [x, y, z];
        const vel: [number, number, number] = [vx, vy, 0];
        setCurrentPos(pos);
        setCurrentVel(vel);

        // Tension force T = m * (g*cos(theta) + L*omega^2)
        const tensionMag = m * (STANDARD_GRAVITY * Math.cos(theta) + L * pendulumOmegaRef.current * pendulumOmegaRef.current);
        const tensionVec: [number, number, number] = [
          -tensionMag * Math.sin(theta),
          tensionMag * Math.cos(theta),
          0
        ];

        const gravityVec: [number, number, number] = [0, -m * STANDARD_GRAVITY, 0];
        const netVec: [number, number, number] = [
          tensionVec[0] + gravityVec[0],
          tensionVec[1] + gravityVec[1],
          0
        ];

        setCurrentForces({
          gravity: gravityVec,
          net: netVec,
          tension: tensionVec
        });

        const ke = calculateKineticEnergy(m, speed);
        const pe = calculatePotentialEnergy(m, y);

        updateTelemetry(data.id, {
          id: data.id,
          position: pos,
          velocity: vel,
          speed,
          acceleration: [netVec[0] / m, netVec[1] / m, 0],
          kineticEnergy: ke,
          potentialEnergy: pe,
          mechanicalEnergy: ke + pe,
          forces: {
            gravity: gravityVec,
            net: netVec,
            tension: tensionVec
          },
          momentum: [m * vx, m * vy, 0]
        });

        setHistoryTrail((prev) => [...prev.slice(-140), pos]);
      } else {
        const theta = (data.initialTheta || 35) * (Math.PI / 180);
        const x = pivot[0] + L * Math.sin(theta);
        const y = pivot[1] - L * Math.cos(theta);
        setCurrentPos([x, y, pivot[2]]);
      }
      return;
    }

    // Standard Rapier RigidBody handling (Sphere, Cube, Ramp, Cannon)
    if (rigidBodyRef.current && !data.isStatic) {
      if (isPlaying) {
        const trans = rigidBodyRef.current.translation();
        const linvel = rigidBodyRef.current.linvel();
        const pos: [number, number, number] = [trans.x, trans.y, trans.z];
        const vel: [number, number, number] = [linvel.x, linvel.y, linvel.z];
        const speed = Math.sqrt(vel[0] * vel[0] + vel[1] * vel[1] + vel[2] * vel[2]);

        setCurrentPos(pos);
        setCurrentVel(vel);

        // Approximate acceleration from delta v
        const accel: [number, number, number] = [
          (vel[0] - prevVelRef.current[0]) / Math.max(1e-4, dt),
          (vel[1] - prevVelRef.current[1]) / Math.max(1e-4, dt),
          (vel[2] - prevVelRef.current[2]) / Math.max(1e-4, dt)
        ];
        prevVelRef.current = vel;

        const m = data.mass;
        const ke = calculateKineticEnergy(m, speed);
        const pe = calculatePotentialEnergy(m, Math.max(0, pos[1]));

        const fg: [number, number, number] = [0, -m * STANDARD_GRAVITY, 0];
        const fNet: [number, number, number] = [m * accel[0], m * accel[1], m * accel[2]];

        setCurrentForces({
          gravity: fg,
          net: fNet
        });

        // Telemetry update
        updateTelemetry(data.id, {
          id: data.id,
          position: pos,
          velocity: vel,
          speed,
          acceleration: accel,
          kineticEnergy: ke,
          potentialEnergy: pe,
          mechanicalEnergy: ke + pe,
          forces: {
            gravity: fg,
            net: fNet
          },
          momentum: [m * vel[0], m * vel[1], m * vel[2]]
        });

        // Add to history trail
        setHistoryTrail((prev) => [...prev.slice(-140), pos]);

        // Dynamic caption triggers
        if (speed > 0.1 && Math.abs(vel[1]) < 0.15 && pos[1] > 2.5 && !data.isStatic) {
          // Near apex
          addCaption({
            text: `Object ${data.name} reached apex (v_y ≈ 0). Kinetic energy is minimal, potential energy maximal.`,
            category: 'kinematics',
            severity: 'highlight'
          });
        }
      } else {
        // Paused state
        const m = data.mass;
        const pe = calculatePotentialEnergy(m, Math.max(0, currentPos[1]));
        const speed = Math.sqrt(currentVel[0] ** 2 + currentVel[1] ** 2 + currentVel[2] ** 2);
        const ke = calculateKineticEnergy(m, speed);

        updateTelemetry(data.id, {
          id: data.id,
          position: currentPos,
          velocity: currentVel,
          speed,
          acceleration: [0, 0, 0],
          kineticEnergy: ke,
          potentialEnergy: pe,
          mechanicalEnergy: ke + pe,
          forces: {
            gravity: [0, -m * STANDARD_GRAVITY, 0],
            net: [0, 0, 0]
          },
          momentum: [m * currentVel[0], m * currentVel[1], m * currentVel[2]]
        });
      }
    }
  });

  // Handle TransformControls dragging when selected and paused
  const handleTransformChange = () => {
    if (transformRef.current && meshGroupRef.current && !isPlaying) {
      const obj = meshGroupRef.current;
      let newPos: [number, number, number] = [obj.position.x, obj.position.y, obj.position.z];
      
      if (snapToGrid) {
        newPos = [
          Math.round(newPos[0] / gridSnapSize) * gridSnapSize,
          Math.max(0, Math.round(newPos[1] / gridSnapSize) * gridSnapSize),
          Math.round(newPos[2] / gridSnapSize) * gridSnapSize
        ];
        obj.position.set(...newPos);
      }

      setCurrentPos(newPos);
      updateObject(data.id, {
        position: newPos,
        rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
        scale: [obj.scale.x, obj.scale.y, obj.scale.z]
      });

      if (rigidBodyRef.current) {
        rigidBodyRef.current.setTranslation(new THREE.Vector3(...newPos), true);
      }
    }
  };

  const objectColor = data.color || '#DDD5CD';

  return (
    <group>
      {/* 3D Transform Gizmo for selected object (only when paused) */}
      {isSelected && !isPlaying && (
        <TransformControls
          ref={transformRef}
          mode={transformMode}
          size={0.7}
          onObjectChange={handleTransformChange}
        >
          <group ref={meshGroupRef} position={data.position} rotation={data.rotation} scale={data.scale} />
        </TransformControls>
      )}

      {/* Physics Body Implementation */}
      {data.type === 'spring' ? (
        <group>
          {/* Anchor Pillar */}
          <mesh position={data.anchorPosition || [-2, 1.5, 0]}>
            <boxGeometry args={[0.4, 3, 0.4]} />
            <meshStandardMaterial color="#3D3B38" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Dynamic Helical Spring Mesh */}
          <SpringMesh
            start={data.anchorPosition || [-2, 1.5, 0]}
            end={currentPos}
            color={objectColor}
          />

          {/* Mass Block */}
          <group
            position={currentPos}
            onClick={(e) => {
              e.stopPropagation();
              selectObject(data.id);
            }}
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={data.scale} />
              <meshStandardMaterial
                color={objectColor}
                roughness={0.25}
                metalness={0.65}
                emissive={isSelected ? '#19E3F5' : '#000000'}
                emissiveIntensity={isSelected ? 0.35 : 0}
              />
            </mesh>
          </group>
        </group>
      ) : data.type === 'pendulum' ? (
        <group>
          {/* Ceiling Anchor Point */}
          <mesh position={data.pivotPosition || [0, 6, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#7D4047" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Connecting Rod */}
          {(() => {
            const pivot = data.pivotPosition || [0, 6, 0];
            const p1 = new THREE.Vector3(...pivot);
            const p2 = new THREE.Vector3(...currentPos);
            const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
            const len = p1.distanceTo(p2);
            const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
            const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

            return (
              <mesh position={mid} quaternion={quat}>
                <cylinderGeometry args={[0.03, 0.03, len, 8]} />
                <meshStandardMaterial color="#DDD5CD" metalness={0.8} roughness={0.2} />
              </mesh>
            );
          })()}

          {/* Pendulum Bob Sphere */}
          <group
            position={currentPos}
            onClick={(e) => {
              e.stopPropagation();
              selectObject(data.id);
            }}
          >
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[data.scale[0], 32, 32]} />
              <meshStandardMaterial
                color={objectColor}
                roughness={0.2}
                metalness={0.8}
                emissive={isSelected ? '#7D4047' : '#000000'}
                emissiveIntensity={isSelected ? 0.4 : 0}
              />
            </mesh>
          </group>
        </group>
      ) : (
        /* Standard Rigid Body */
        <RigidBody
          ref={rigidBodyRef}
          type={data.isStatic ? 'fixed' : 'dynamic'}
          position={data.position}
          rotation={data.rotation}
          friction={data.material.friction}
          restitution={data.material.restitution}
          colliders={false}
        >
          {data.type === 'sphere' && (
            <BallCollider args={[data.scale[0]]} />
          )}
          {(data.type === 'cube' || data.type === 'ramp') && (
            <CuboidCollider args={[data.scale[0] / 2, data.scale[1] / 2, data.scale[2] / 2]} />
          )}
          {data.type === 'cannon' && (
            <CuboidCollider args={[1, 1, 1]} />
          )}

          <group
            onClick={(e) => {
              e.stopPropagation();
              selectObject(data.id);
            }}
          >
            {data.type === 'sphere' && (
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[data.scale[0], 36, 36]} />
                <meshStandardMaterial
                  color={objectColor}
                  roughness={0.25}
                  metalness={0.65}
                  emissive={isSelected ? '#19E3F5' : '#000000'}
                  emissiveIntensity={isSelected ? 0.35 : 0}
                />
              </mesh>
            )}

            {data.type === 'cube' && (
              <mesh castShadow receiveShadow>
                <boxGeometry args={data.scale} />
                <meshStandardMaterial
                  color={objectColor}
                  roughness={0.3}
                  metalness={0.5}
                  emissive={isSelected ? '#19E3F5' : '#000000'}
                  emissiveIntensity={isSelected ? 0.35 : 0}
                />
              </mesh>
            )}

            {data.type === 'ramp' && (
              <group>
                {/* Sloped Plane Wedge */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={data.scale} />
                  <meshStandardMaterial
                    color={objectColor}
                    roughness={0.4}
                    metalness={0.3}
                    emissive={isSelected ? '#19E3F5' : '#000000'}
                    emissiveIntensity={isSelected ? 0.25 : 0}
                  />
                </mesh>
                {/* Surface graduation markings */}
                <mesh position={[0, data.scale[1] / 2 + 0.01, 0]}>
                  <planeGeometry args={[data.scale[0], data.scale[2]]} />
                  <meshBasicMaterial color="#DDD5CD" wireframe transparent opacity={0.25} />
                </mesh>
              </group>
            )}

            {data.type === 'cannon' && (
              <group>
                {/* Base Stand */}
                <mesh position={[0, -0.4, 0]} castShadow>
                  <cylinderGeometry args={[0.7, 0.9, 0.4, 24]} />
                  <meshStandardMaterial color="#2E2E2E" roughness={0.4} metalness={0.8} />
                </mesh>
                {/* Cannon Barrel */}
                <mesh position={[0, 0.4, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
                  <cylinderGeometry args={[0.3, 0.4, 2.0, 24]} />
                  <meshStandardMaterial color={objectColor} roughness={0.2} metalness={0.85} />
                </mesh>
              </group>
            )}
          </group>
        </RigidBody>
      )}

      {/* Trajectory & Motion Trails */}
      <TrajectoryTrail
        historyPoints={historyTrail}
        predictedPoints={predictedPath}
        color={objectColor}
        predictedColor="#19E3F5"
        showGhostTrails={showGhostTrails}
      />

      {/* 3D Glowing Vectors (Explain Lens) */}
      {explainLens && (
        <group>
          {/* Velocity Vector (Cyan) */}
          <VectorArrow3D
            origin={currentPos}
            vector={currentVel}
            color="#19E3F5"
            label="v"
            scale={0.35}
            minMagnitude={0.15}
          />

          {/* Net Force Vector (Racing Red) */}
          <VectorArrow3D
            origin={currentPos}
            vector={currentForces.net}
            color="#DD0200"
            label="F_net"
            scale={0.08}
            minMagnitude={0.5}
          />

          {/* Gravity Vector (Terracotta) */}
          {!data.isStatic && data.type !== 'spring' && (
            <VectorArrow3D
              origin={currentPos}
              vector={currentForces.gravity}
              color="#B5543A"
              label="F_g"
              scale={0.05}
              minMagnitude={0.5}
            />
          )}

          {/* Tension Force (Rosewood) for Pendulum */}
          {currentForces.tension && (
            <VectorArrow3D
              origin={currentPos}
              vector={currentForces.tension}
              color="#7D4047"
              label="T"
              scale={0.06}
              minMagnitude={0.5}
            />
          )}

          {/* Spring Restoring Force (Cyan) for Spring */}
          {currentForces.spring && (
            <VectorArrow3D
              origin={currentPos}
              vector={currentForces.spring}
              color="#19E3F5"
              label="F_s"
              scale={0.08}
              minMagnitude={0.5}
            />
          )}
        </group>
      )}
    </group>
  );
};
