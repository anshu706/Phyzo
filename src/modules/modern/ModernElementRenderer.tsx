import React, { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import { PhysicsObjectState } from '../../physics/types';
import { useSceneStore } from '../../core/useSceneStore';
import { useSimulationStore } from '../../core/useSimulationStore';
import { initializeGasChamber, stepGasChamber, GasParticle } from '../../physics/thermoSolver';
import { sampleHydrogenProbabilityCloud, solveQuantumWell } from '../../physics/quantumSolver';

interface ModernElementProps {
  data: PhysicsObjectState;
}

export const ModernElementRenderer: React.FC<ModernElementProps> = ({ data }) => {
  const selectedObjectId = useSceneStore((state) => state.selectedObjectId);
  const selectObject = useSceneStore((state) => state.selectObject);
  const updateObject = useSceneStore((state) => state.updateObject);
  const transformMode = useSceneStore((state) => state.transformMode);
  const snapToGrid = useSceneStore((state) => state.snapToGrid);
  const gridSnapSize = useSceneStore((state) => state.gridSnapSize);
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const timeScale = useSimulationStore((state) => state.timeScale);

  const groupRef = useRef<THREE.Group>(null);
  const isSelected = selectedObjectId === data.id;

  // Gas Chamber State
  const chamberBounds = useMemo<[number, number, number]>(() => {
    return data.chamberDimensions || [3.5, 3.5, 3.5];
  }, [data.chamberDimensions]);

  const [gasParticles, setGasParticles] = useState<GasParticle[]>(() => {
    return initializeGasChamber(data.particleCount || 60, data.temperature || 300, chamberBounds);
  });

  const gasPointsRef = useRef<THREE.Points>(null);

  // Quantum Hydrogen sample points
  const hydrogenPoints = useMemo(() => {
    if (data.type !== 'hydrogen_atom') return [];
    const n = data.quantumN || 2;
    const l = data.quantumL || 1;
    const m = data.quantumM || 0;
    return sampleHydrogenProbabilityCloud(n, l, m, 450);
  }, [data.type, data.quantumN, data.quantumL, data.quantumM]);

  // Quantum Well wave data
  const quantumWellData = useMemo(() => {
    if (data.type !== 'quantum_well') return null;
    const n = data.quantumN || 1;
    const width = data.wellWidth || 2.0;
    return solveQuantumWell(n, width, 80);
  }, [data.type, data.quantumN, data.wellWidth]);

  // Photoelectric simulation particles
  const [photoelectrons, setPhotoelectrons] = useState<{ id: number; pos: [number, number, number]; vel: [number, number, number] }[]>([]);

  // Simulation frame update
  const [wellPhase, setWellPhase] = useState(0);
  const [electronAngle, setElectronAngle] = useState(0);

  // Synchronize gas particles when user changes count or temperature in inspector
  React.useEffect(() => {
    if (data.type === 'gas_chamber') {
      const targetCount = data.particleCount || 60;
      const targetTemp = data.temperature || 300;
      setGasParticles((prev) => {
        if (prev.length !== targetCount) {
          return initializeGasChamber(targetCount, targetTemp, chamberBounds);
        }
        return prev;
      });
    }
  }, [data.type, data.particleCount, chamberBounds]);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    const dt = Math.min(delta, 0.05) * timeScale;

    // Update quantum well wave phase
    if (data.type === 'quantum_well') {
      const n = data.quantumN || 1;
      setWellPhase((p) => (p + dt * n * 2.5) % (Math.PI * 2));
    }

    // Update orbiting electron on Bohr radius
    if (data.type === 'hydrogen_atom') {
      const n = data.quantumN || 2;
      setElectronAngle((a) => (a + dt * (3.0 / n)) % (Math.PI * 2));
    }

    // Update gas particles
    if (data.type === 'gas_chamber') {
      setGasParticles((prev) => {
        const { particles } = stepGasChamber(prev, chamberBounds, data.temperature || 300, dt);
        return particles;
      });
    }

    // Photoelectric electron emission
    if (data.type === 'photoelectric_emitter') {
      const h_planck = 4.135667e-15; // eV * s
      const freq = data.incidentPhotonFreq || 7.0e14;
      const photonEnergy = h_planck * freq;
      const phi = data.workFunction || 2.3;
      const ke = photonEnergy - phi;

      if (ke > 0 && Math.random() < 0.3) {
        const speed = Math.sqrt(ke) * 2.8;
        setPhotoelectrons((prev) => [
          ...prev.slice(-35),
          {
            id: Math.random(),
            pos: [-1.2, (Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 1.5],
            vel: [speed, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4]
          }
        ]);
      }

      setPhotoelectrons((prev) =>
        prev
          .map((p) => ({
            ...p,
            pos: [p.pos[0] + p.vel[0] * dt, p.pos[1] + p.vel[1] * dt, p.pos[2] + p.vel[2] * dt] as [number, number, number]
          }))
          .filter((p) => p.pos[0] < 2.5)
      );
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    selectObject(data.id);
  };

  // Incident light color based on frequency
  const incidentLightColor = useMemo(() => {
    const freq = data.incidentPhotonFreq || 7.0e14;
    const lambdaNm = (3e8 / freq) * 1e9;
    if (lambdaNm < 390) return '#C084FC'; // UV
    if (lambdaNm > 700) return '#EF4444'; // Red / IR
    if (lambdaNm >= 390 && lambdaNm < 450) return '#818CF8';
    if (lambdaNm >= 450 && lambdaNm < 520) return '#38BDF8';
    if (lambdaNm >= 520 && lambdaNm < 590) return '#34D399';
    return '#FBBF24';
  }, [data.incidentPhotonFreq]);

  // Orbital name helper
  const orbitalName = useMemo(() => {
    const n = data.quantumN || 2;
    const l = data.quantumL || 0;
    const lLetters = ['s', 'p', 'd', 'f'];
    return `${n}${lLetters[l] || 's'}`;
  }, [data.quantumN, data.quantumL]);

  const renderContent = () => {
    switch (data.type) {
      case 'gas_chamber': {
        const [bx, by, bz] = chamberBounds;
        const particlePositions = new Float32Array(gasParticles.flatMap((p) => p.position));
        const particleColors = new Float32Array(
          gasParticles.flatMap((p) => {
            const normalizedSpeed = Math.min(1, p.speed / 4.0);
            return [normalizedSpeed, 0.4 * (1 - normalizedSpeed), 1 - normalizedSpeed];
          })
        );

        return (
          <group>
            {/* Transparent Glass Chamber Box */}
            <mesh>
              <boxGeometry args={[bx, by, bz]} />
              <meshPhysicalMaterial
                color="#FFFFFF"
                transmission={0.9}
                opacity={0.3}
                transparent
                roughness={0.1}
                ior={1.45}
                thickness={0.5}
              />
            </mesh>
            {/* Outer Chamber Frame Edges */}
            <mesh>
              <boxGeometry args={[bx, by, bz]} />
              <meshBasicMaterial color="#19E3F5" wireframe transparent opacity={0.35} />
            </mesh>
            {/* Bouncing Gas Molecules */}
            {gasParticles.length > 0 && (
              <points ref={gasPointsRef}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={gasParticles.length}
                    array={particlePositions}
                    itemSize={3}
                  />
                  <bufferAttribute
                    attach="attributes-color"
                    count={gasParticles.length}
                    array={particleColors}
                    itemSize={3}
                  />
                </bufferGeometry>
                <pointsMaterial
                  size={0.2}
                  vertexColors
                  transparent
                  opacity={0.95}
                  blending={THREE.AdditiveBlending}
                />
              </points>
            )}
          </group>
        );
      }

      case 'hydrogen_atom': {
        const cloudPositions = new Float32Array(hydrogenPoints.flatMap((p) => [p[0] * 0.4, p[1] * 0.4, p[2] * 0.4]));
        const n = data.quantumN || 2;
        const orbitRadius = n * 0.8;
        const electronX = Math.cos(electronAngle) * orbitRadius;
        const electronZ = Math.sin(electronAngle) * orbitRadius;

        return (
          <group>
            {/* Proton Nucleus */}
            <mesh>
              <sphereGeometry args={[0.25, 32, 32]} />
              <meshStandardMaterial color="#DD0200" emissive="#DD0200" emissiveIntensity={0.8} />
            </mesh>

            {/* Bohr Classical Orbits */}
            {[1, 2, 3, 4].map((level) => (
              <mesh key={level} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[level * 0.8, 0.015, 8, 64]} />
                <meshBasicMaterial
                  color={level === n ? '#19E3F5' : '#475569'}
                  transparent
                  opacity={level === n ? 0.9 : 0.25}
                />
              </mesh>
            ))}

            {/* Orbiting Valence Electron on active Bohr level */}
            <mesh position={[electronX, 0, electronZ]}>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshStandardMaterial color="#19E3F5" emissive="#19E3F5" emissiveIntensity={1.2} />
            </mesh>

            {/* 3D Volumetric Probability Density Cloud |Ψ|² */}
            {cloudPositions.length > 0 && (
              <points>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={hydrogenPoints.length}
                    array={cloudPositions}
                    itemSize={3}
                  />
                </bufferGeometry>
                <pointsMaterial
                  size={0.12}
                  color="#19E3F5"
                  transparent
                  opacity={0.7}
                  blending={THREE.AdditiveBlending}
                />
              </points>
            )}
          </group>
        );
      }

      case 'quantum_well': {
        if (!quantumWellData) return null;
        const width = data.wellWidth || 3.0;
        const halfW = width / 2;

        // Wave function points oscillating with time phase
        const psiPts = quantumWellData.psiSamples.map(
          (s) => new THREE.Vector3((s.x - 0.5) * width, s.psi * 1.5 * Math.cos(wellPhase), 0)
        );
        const probPts = quantumWellData.psiSamples.map(
          (s) => new THREE.Vector3((s.x - 0.5) * width, s.probDensity * 2.0, 0)
        );

        return (
          <group>
            {/* Left Infinite Barrier */}
            <mesh position={[-halfW, 1.5, 0]}>
              <boxGeometry args={[0.2, 3.5, 2.0]} />
              <meshStandardMaterial color="#7D4047" roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Right Infinite Barrier */}
            <mesh position={[halfW, 1.5, 0]}>
              <boxGeometry args={[0.2, 3.5, 2.0]} />
              <meshStandardMaterial color="#7D4047" roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Floor Base */}
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[width + 0.4, 0.2, 2.0]} />
              <meshStandardMaterial color="#1E293B" />
            </mesh>

            {/* Standing Wave Function Re[Ψ(x,t)] Line */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={psiPts.length}
                  array={new Float32Array(psiPts.flatMap((p) => [p.x, p.y + 1.5, p.z]))}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#19E3F5" linewidth={2} />
            </line>

            {/* Probability Density |ψ(x)|² Glowing Curve */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={probPts.length}
                  array={new Float32Array(probPts.flatMap((p) => [p.x, p.y + 0.1, p.z]))}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#DD0200" linewidth={3} transparent opacity={0.85} />
            </line>
          </group>
        );
      }

      case 'photoelectric_emitter': {
        const phi = data.workFunction || 2.3;
        const h_planck = 4.135667e-15;
        const freq = data.incidentPhotonFreq || 7.0e14;
        const photonEnergy = h_planck * freq;
        const isEmitting = photonEnergy > phi;

        return (
          <group>
            {/* Cathode Metal Plate (Emitter) */}
            <mesh position={[-1.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[2.5, 3.0, 0.1]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Anode Collector Plate */}
            <mesh position={[2.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[2.5, 3.0, 0.1]} />
              <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.4} transparent opacity={0.5} />
            </mesh>

            {/* Incident Photon Light Rays with dynamic wavelength color */}
            {[-0.8, 0, 0.8].map((yOff) => (
              <mesh key={yOff} position={[-2.8, yOff + 0.5, 0]} rotation={[0, 0, -Math.PI / 4]}>
                <cylinderGeometry args={[0.025, 0.025, 1.8, 8]} />
                <meshBasicMaterial color={incidentLightColor} />
              </mesh>
            ))}

            {/* Ejected Photoelectrons in flight */}
            {photoelectrons.map((e) => (
              <mesh key={e.id} position={e.pos}>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshBasicMaterial color="#19E3F5" />
              </mesh>
            ))}

            {/* Circuit Wire connection indicator */}
            <mesh position={[0.5, -1.8, 0]}>
              <boxGeometry args={[4.2, 0.05, 0.05]} />
              <meshBasicMaterial color={isEmitting ? '#34D399' : '#64748B'} />
            </mesh>
          </group>
        );
      }

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
        {renderContent()}

        {isSelected && (
          <mesh>
            <boxGeometry args={[4.5, 4.5, 4.5]} />
            <meshBasicMaterial color="#19E3F5" wireframe transparent opacity={0.3} />
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
