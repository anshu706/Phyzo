/**
 * Phyzo Statistical Thermodynamics Solver
 * Implements:
 * - Maxwell-Boltzmann molecular speed distribution:
 *   f(v) = 4*pi * (m / (2*pi*kB*T))^(3/2) * v^2 * exp(-m*v^2 / (2*kB*T))
 * - Ideal Gas Law: P*V = N*kB*T
 * - Characteristic Speeds: v_rms, v_avg, v_mp
 * - 3D Gas particle collision integration and pressure calculations
 * - Live speed histogram distribution generation
 */

export interface GasParticle {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  speed: number;
}

export interface ThermoState {
  temperature: number; // Kelvin
  particleCount: number; // N
  volume: number; // m^3
  pressure: number; // Pascals (or kPa)
  vRms: number; // m/s
  vAvg: number; // m/s
  vMp: number; // most probable speed (m/s)
  histogram: { speed: number; count: number; theoretical: number }[];
}

export const K_B = 1.380649e-23; // Boltzmann constant J/K
export const ATOMIC_MASS_HE = 6.646e-27; // Helium atom mass (kg)

// Scaled interactive simulation units for responsive 60fps WebGL
export const SIM_KB = 1.0;
export const SIM_MASS = 1.0;

/**
 * Theoretical Maxwell-Boltzmann speed PDF
 */
export function maxwellBoltzmannPdf(v: number, T: number, m: number = SIM_MASS, kB: number = SIM_KB): number {
  if (v <= 0 || T <= 0) return 0;
  const factor = m / (2 * kB * T);
  const norm = 4 * Math.PI * Math.pow(factor / Math.PI, 1.5);
  return norm * v * v * Math.exp(-factor * v * v);
}

/**
 * Calculates characteristic thermodynamic speeds
 */
export function calculateCharacteristicSpeeds(T: number, m: number = SIM_MASS, kB: number = SIM_KB) {
  const vMp = Math.sqrt((2 * kB * T) / m);
  const vAvg = Math.sqrt((8 * kB * T) / (Math.PI * m));
  const vRms = Math.sqrt((3 * kB * T) / m);
  return { vMp, vAvg, vRms };
}

/**
 * Generates initial random Maxwell-Boltzmann distributed gas particles
 */
export function initializeGasChamber(
  count: number,
  temperature: number,
  bounds: [number, number, number] = [3, 3, 3]
): GasParticle[] {
  const { vMp } = calculateCharacteristicSpeeds(temperature);
  const particles: GasParticle[] = [];

  for (let i = 0; i < count; i++) {
    // Box-Muller transform for 3D Gaussian velocity components
    const u1 = Math.max(1e-6, Math.random());
    const u2 = Math.random();
    const u3 = Math.max(1e-6, Math.random());
    const u4 = Math.random();

    const std = vMp / Math.SQRT2;
    const vx = std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const vy = std * Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
    const vz = std * Math.sqrt(-2 * Math.log(u3)) * Math.cos(2 * Math.PI * u4);

    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);

    particles.push({
      id: `gas-${i}`,
      position: [
        (Math.random() - 0.5) * (bounds[0] - 0.2),
        (Math.random() - 0.5) * (bounds[1] - 0.2),
        (Math.random() - 0.5) * (bounds[2] - 0.2)
      ],
      velocity: [vx, vy, vz],
      speed
    });
  }

  return particles;
}

/**
 * Steps gas particles and bounces elastically off 3D chamber bounding walls
 */
export function stepGasChamber(
  particles: GasParticle[],
  bounds: [number, number, number],
  temperature: number,
  dt: number
): { particles: GasParticle[]; momentumTransferred: number } {
  const halfX = bounds[0] / 2;
  const halfY = bounds[1] / 2;
  const halfZ = bounds[2] / 2;
  let momentumTransferred = 0;

  const nextParticles = particles.map((p) => {
    let [px, py, pz] = p.position;
    let [vx, vy, vz] = p.velocity;

    px += vx * dt;
    py += vy * dt;
    pz += vz * dt;

    // Elastic wall collisions
    if (px < -halfX) {
      px = -halfX;
      vx = -vx;
      momentumTransferred += 2 * Math.abs(vx);
    } else if (px > halfX) {
      px = halfX;
      vx = -vx;
      momentumTransferred += 2 * Math.abs(vx);
    }

    if (py < -halfY) {
      py = -halfY;
      vy = -vy;
      momentumTransferred += 2 * Math.abs(vy);
    } else if (py > halfY) {
      py = halfY;
      vy = -vy;
      momentumTransferred += 2 * Math.abs(vy);
    }

    if (pz < -halfZ) {
      pz = -halfZ;
      vz = -vz;
      momentumTransferred += 2 * Math.abs(vz);
    } else if (pz > halfZ) {
      pz = halfZ;
      vz = -vz;
      momentumTransferred += 2 * Math.abs(vz);
    }

    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);

    return {
      ...p,
      position: [px, py, pz] as [number, number, number],
      velocity: [vx, vy, vz] as [number, number, number],
      speed
    };
  });

  return { particles: nextParticles, momentumTransferred };
}

/**
 * Builds speed histogram buckets for comparing simulation against Maxwell-Boltzmann theory
 */
export function buildSpeedHistogram(
  particles: GasParticle[],
  temperature: number,
  numBuckets: number = 10,
  maxSpeed: number = 6.0
) {
  const bucketWidth = maxSpeed / numBuckets;
  const counts = new Array(numBuckets).fill(0);

  particles.forEach((p) => {
    const b = Math.min(numBuckets - 1, Math.floor(p.speed / bucketWidth));
    if (b >= 0) counts[b]++;
  });

  return counts.map((count, idx) => {
    const speed = (idx + 0.5) * bucketWidth;
    const theoretical = maxwellBoltzmannPdf(speed, temperature) * particles.length * bucketWidth;
    return {
      speed,
      count,
      theoretical
    };
  });
}
