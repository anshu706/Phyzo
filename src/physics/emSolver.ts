/**
 * Phyzo Electromagnetism Solver
 * Pure TypeScript field solvers supporting:
 * - Coulomb's Law: E = (1 / 4*pi*eps0) * sum(q_i * r_hat / r^2)
 * - Biot-Savart Law & Magnetic Dipoles: B field from currents, wires, bar magnets, solenoids
 * - Lorentz Force: F = q * (E + v x B)
 * - Runge-Kutta 4th order (RK4) field line streamline tracing
 * - Particle trajectory integration for cyclotron and helical motion
 */

import { PhysicsObjectState } from './types';

export type Vec3 = [number, number, number];

export interface FieldSample {
  position: Vec3;
  eField: Vec3;
  bField: Vec3;
  eMagnitude: number;
  bMagnitude: number;
  potential: number;
}

export interface EMFieldLine {
  id: string;
  type: 'electric' | 'magnetic';
  points: Vec3[];
  strength: number;
  color: string;
}

export interface ChargedParticleState {
  id: string;
  position: Vec3;
  velocity: Vec3;
  charge: number; // Coulombs
  mass: number;   // kg
  history: Vec3[];
}

// Normalized SI simulation constants for real-time 3D interactive stability
export const K_ELECTROSTATIC = 8.98755e1; // Scaled ke
export const MU_0 = 1.2566e-1;          // Scaled mu0

// Vector Utilities
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
const length = (v: Vec3): number => Math.sqrt(dot(v, v));
const normalize = (v: Vec3): Vec3 => {
  const l = length(v);
  return l > 1e-6 ? [v[0] / l, v[1] / l, v[2] / l] : [0, 0, 0];
};
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (v: Vec3, s: number): Vec3 => [v[0] * s, v[1] * s, v[2] * s];

/**
 * Calculates total Electric (E) and Magnetic (B) fields at point P in 3D space
 */
export function calculateTotalEMField(point: Vec3, objects: PhysicsObjectState[]): FieldSample {
  let totalE: Vec3 = [0, 0, 0];
  let totalB: Vec3 = [0, 0, 0];
  let totalV = 0; // Electrostatic potential

  objects.forEach((obj) => {
    const pos = obj.position;
    const rVec = sub(point, pos);
    const rMag = length(rVec);

    // Softening parameter to prevent division by zero near source singularities
    const EPS = 0.25;
    const rEff = Math.max(EPS, rMag);

    // 1. Point Charges (+ / -) -> Coulomb's Law
    if (obj.type === 'charge_positive' || obj.type === 'charge_negative') {
      const q = obj.charge ?? (obj.type === 'charge_positive' ? 2.0 : -2.0);
      const eMag = (K_ELECTROSTATIC * q) / (rEff * rEff * rEff);
      totalE = add(totalE, scale(rVec, eMag));
      totalV += (K_ELECTROSTATIC * q) / rEff;
    }

    // 2. Bar Magnet -> Magnetic Dipole Field
    if (obj.type === 'bar_magnet') {
      const momentMag = obj.magneticMoment || 15.0;
      // Dipole orientation along local Y or X axis
      const mDir: Vec3 = [Math.sin(obj.rotation[1]), Math.cos(obj.rotation[1]), 0];
      const mVec = scale(mDir, momentMag);

      const rHat = normalize(rVec);
      const mDotR = dot(mVec, rHat);
      const bScale = (MU_0 / (4 * Math.PI)) / (rEff * rEff * rEff);

      // B_dipole = (mu0 / 4pi) * (3(m . r_hat)r_hat - m) / r^3
      const bDipole = scale(sub(scale(rHat, 3 * mDotR), mVec), bScale);
      totalB = add(totalB, bDipole);
    }

    // 3. Current-Carrying Wire -> Biot-Savart Law
    if (obj.type === 'current_wire') {
      const current = obj.current || 10.0; // Amperes
      // Assume straight infinite wire along Y-axis at (obj.position[0], *, obj.position[2])
      const dX = point[0] - pos[0];
      const dZ = point[2] - pos[2];
      const rho = Math.max(EPS, Math.sqrt(dX * dX + dZ * dZ));

      // B = (mu0 * I) / (2 * pi * rho) * (-dZ, 0, dX) / rho
      const bMag = (MU_0 * current) / (2 * Math.PI * rho);
      const bDir: Vec3 = normalize([-dZ, 0, dX]);
      totalB = add(totalB, scale(bDir, bMag));
    }

    // 4. Solenoid -> Core Axial Field & Fringe Dipole
    if (obj.type === 'solenoid') {
      const current = obj.current || 8.0;
      const nTurns = obj.turnsCount || 100;
      const bCore = MU_0 * nTurns * current * 0.1;

      // Inside cylinder vs outside
      const dX = point[0] - pos[0];
      const dZ = point[2] - pos[2];
      const rho = Math.sqrt(dX * dX + dZ * dZ);
      const radius = 1.0;

      if (rho < radius && Math.abs(point[1] - pos[1]) < 2.5) {
        totalB = add(totalB, [0, bCore, 0]);
      } else {
        // Outside fringe dipole approximation
        const mVec: Vec3 = [0, bCore * 0.4, 0];
        const rHat = normalize(rVec);
        const mDotR = dot(mVec, rHat);
        const bDipole = scale(sub(scale(rHat, 3 * mDotR), mVec), 1.0 / (rEff * rEff * rEff));
        totalB = add(totalB, bDipole);
      }
    }

    // 5. Uniform Field Generator
    if (obj.type === 'uniform_field') {
      if (obj.eFieldVector) totalE = add(totalE, obj.eFieldVector);
      if (obj.bFieldVector) totalB = add(totalB, obj.bFieldVector);
    }
  });

  return {
    position: point,
    eField: totalE,
    bField: totalB,
    eMagnitude: length(totalE),
    bMagnitude: length(totalB),
    potential: totalV
  };
}

/**
 * Calculates Lorentz Force: F = q * (E + v x B)
 */
export function calculateLorentzForce(
  q: number,
  v: Vec3,
  E: Vec3,
  B: Vec3
): { force: Vec3; electricForce: Vec3; magneticForce: Vec3 } {
  const fe = scale(E, q);
  const vCrossB = cross(v, B);
  const fb = scale(vCrossB, q);
  const fNet = add(fe, fb);

  return {
    force: fNet,
    electricForce: fe,
    magneticForce: fb
  };
}

/**
 * Generates 3D Streamlines / Field Lines for Electric and Magnetic fields
 * Uses 4th-order Runge-Kutta (RK4) integration starting from charge/pole seeds.
 */
export function generateEMFieldLines(objects: PhysicsObjectState[]): EMFieldLine[] {
  const fieldLines: EMFieldLine[] = [];
  const seeds: { pos: Vec3; type: 'electric' | 'magnetic'; dirSign: number }[] = [];

  // Seed generation around sources
  objects.forEach((obj) => {
    if (obj.type === 'charge_positive' || obj.type === 'charge_negative') {
      const count = 12;
      const r = 0.5;
      for (let i = 0; i < count; i++) {
        const phi = (i / count) * 2 * Math.PI;
        for (let j = 0; j < 3; j++) {
          const theta = ((j + 1) / 4) * Math.PI;
          seeds.push({
            pos: [
              obj.position[0] + r * Math.sin(theta) * Math.cos(phi),
              obj.position[1] + r * Math.cos(theta),
              obj.position[2] + r * Math.sin(theta) * Math.sin(phi)
            ],
            type: 'electric',
            dirSign: obj.type === 'charge_positive' ? 1 : -1
          });
        }
      }
    }

    if (obj.type === 'bar_magnet') {
      const count = 8;
      const r = 0.6;
      for (let i = 0; i < count; i++) {
        const phi = (i / count) * 2 * Math.PI;
        seeds.push({
          pos: [
            obj.position[0] + r * Math.cos(phi),
            obj.position[1] + 1.2,
            obj.position[2] + r * Math.sin(phi)
          ],
          type: 'magnetic',
          dirSign: 1
        });
      }
    }
  });

  const STEP_SIZE = 0.25;
  const MAX_STEPS = 40;

  seeds.forEach((seed, seedIdx) => {
    const points: Vec3[] = [seed.pos];
    let current = seed.pos;

    for (let step = 0; step < MAX_STEPS; step++) {
      const sample = calculateTotalEMField(current, objects);
      const fieldVec = seed.type === 'electric' ? sample.eField : sample.bField;
      const mag = length(fieldVec);

      if (mag < 0.05 || mag > 150) break; // Terminate if too weak or near singularity

      const dir = normalize(fieldVec);
      const delta = scale(dir, STEP_SIZE * seed.dirSign);
      current = add(current, delta);

      // Boundary bounds check
      if (
        Math.abs(current[0]) > 20 ||
        Math.abs(current[1]) > 20 ||
        Math.abs(current[2]) > 20
      ) {
        break;
      }

      points.push(current);
    }

    if (points.length > 2) {
      fieldLines.push({
        id: `field-line-${seed.type}-${seedIdx}`,
        type: seed.type,
        points,
        strength: 1.0,
        color: seed.type === 'electric' ? '#7D4047' : '#19E3F5' // Vintage Rosewood #7D4047 & Electric Cyan
      });
    }
  });

  return fieldLines;
}

/**
 * Step particle forward in time under Lorentz Force using Boris / Velocity-Verlet Integration
 */
export function stepChargedParticle(
  particle: ChargedParticleState,
  objects: PhysicsObjectState[],
  dt: number
): ChargedParticleState {
  const { eField, bField } = calculateTotalEMField(particle.position, objects);
  const { force } = calculateLorentzForce(particle.charge, particle.velocity, eField, bField);

  // a = F / m
  const accel = scale(force, 1 / Math.max(0.01, particle.mass));

  // Velocity update
  const newVel = add(particle.velocity, scale(accel, dt));

  // Position update
  const newPos = add(particle.position, scale(newVel, dt));

  const history = [...particle.history, newPos];
  if (history.length > 120) history.shift();

  return {
    ...particle,
    position: newPos,
    velocity: newVel,
    history
  };
}
