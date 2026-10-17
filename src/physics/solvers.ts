import { Vector3D, TrajectoryPoint } from './types';

export const STANDARD_GRAVITY = 9.80665; // m/s^2

/**
 * Basic 3D Vector Math Utilities
 */
export const Vec3 = {
  zero: (): [number, number, number] => [0, 0, 0],
  
  add: (a: [number, number, number], b: [number, number, number]): [number, number, number] => [
    a[0] + b[0],
    a[1] + b[1],
    a[2] + b[2]
  ],
  
  sub: (a: [number, number, number], b: [number, number, number]): [number, number, number] => [
    a[0] - b[0],
    a[1] - b[1],
    a[2] - b[2]
  ],
  
  scale: (v: [number, number, number], s: number): [number, number, number] => [
    v[0] * s,
    v[1] * s,
    v[2] * s
  ],
  
  length: (v: [number, number, number]): number => {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  },
  
  normalize: (v: [number, number, number]): [number, number, number] => {
    const len = Vec3.length(v);
    if (len < 1e-8) return [0, 0, 0];
    return [v[0] / len, v[1] / len, v[2] / len];
  },
  
  dot: (a: [number, number, number], b: [number, number, number]): number => {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  },
  
  distance: (a: [number, number, number], b: [number, number, number]): number => {
    return Vec3.length(Vec3.sub(a, b));
  }
};

/**
 * Energy & Work Computations (SI units: J, kg, m/s, m)
 */
export function calculateKineticEnergy(mass: number, speed: number): number {
  return 0.5 * mass * speed * speed;
}

export function calculatePotentialEnergy(mass: number, height: number, g = STANDARD_GRAVITY): number {
  return Math.max(0, mass * g * height);
}

export function calculateMomentum(mass: number, velocity: [number, number, number]): [number, number, number] {
  return Vec3.scale(velocity, mass);
}

/**
 * Projectile Motion Predictive Solver
 * Returns analytical trajectory points for previewing ballistic paths
 */
export function predictProjectileTrajectory(
  origin: [number, number, number],
  velocity: [number, number, number],
  gravity = STANDARD_GRAVITY,
  stepTime = 0.04,
  maxTime = 4.0,
  floorY = 0
): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  const [x0, y0, z0] = origin;
  const [vx0, vy0, vz0] = velocity;
  
  for (let t = 0; t <= maxTime; t += stepTime) {
    const x = x0 + vx0 * t;
    const y = y0 + vy0 * t - 0.5 * gravity * t * t;
    const z = z0 + vz0 * t;
    
    if (y < floorY && t > 0) {
      // Find exact impact t
      const discriminant = vy0 * vy0 + 2 * gravity * (y0 - floorY);
      if (discriminant >= 0) {
        const tImpact = (vy0 + Math.sqrt(discriminant)) / gravity;
        points.push({
          x: x0 + vx0 * tImpact,
          y: floorY,
          z: z0 + vz0 * tImpact,
          time: tImpact
        });
      }
      break;
    }
    
    points.push({ x, y, z, time: t });
  }
  
  return points;
}

/**
 * Inclined Plane Analytical Force Decomposition
 * For a mass on an incline of angle theta (radians):
 * Parallel gravity: F_parallel = m * g * sin(theta) (down the ramp)
 * Normal force: N = m * g * cos(theta)
 * Max static friction: f_s_max = mu_s * N
 * Kinetic friction: f_k = mu_k * N (opposing relative motion)
 * Net acceleration down incline: a = g * (sin(theta) - mu_k * cos(theta))
 */
export function solveInclineForces(
  mass: number,
  angleRad: number,
  muFriction: number,
  g = STANDARD_GRAVITY
) {
  const fg = mass * g;
  const normal = fg * Math.cos(angleRad);
  const fParallel = fg * Math.sin(angleRad);
  const frictionForce = Math.min(fParallel, muFriction * normal);
  const netForce = Math.max(0, fParallel - frictionForce);
  const acceleration = netForce / mass;
  
  return {
    gravityForce: fg,
    normalForce: normal,
    parallelForce: fParallel,
    frictionForce: frictionForce,
    netForce: netForce,
    acceleration: acceleration,
    willSlide: fParallel > muFriction * normal
  };
}

/**
 * 1D / 3D Elastic / Inelastic Collision Solver
 * Given m1, m2, v1, v2 and restitution coefficient e:
 * v1' = (m1*v1 + m2*v2 - m2*e*(v1 - v2)) / (m1 + m2)
 * v2' = (m1*v1 + m2*v2 + m1*e*(v1 - v2)) / (m1 + m2)
 */
export function solveCollision1D(
  m1: number,
  m2: number,
  v1: number,
  v2: number,
  e: number
): { v1Final: number; v2Final: number; energyLoss: number } {
  const keInitial = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
  const totalM = m1 + m2;
  
  const v1Final = (m1 * v1 + m2 * v2 - m2 * e * (v1 - v2)) / totalM;
  const v2Final = (m1 * v1 + m2 * v2 + m1 * e * (v1 - v2)) / totalM;
  
  const keFinal = 0.5 * m1 * v1Final * v1Final + 0.5 * m2 * v2Final * v2Final;
  const energyLoss = Math.max(0, keInitial - keFinal);
  
  return { v1Final, v2Final, energyLoss };
}

/**
 * Harmonic Oscillator (Spring-Mass System)
 * Differential Eq: m*x'' + c*x' + k*x = 0
 * Natural angular frequency: omega_0 = sqrt(k / m)
 * Damping ratio: zeta = c / (2 * sqrt(m * k))
 */
export function getSpringParameters(mass: number, k: number, damping: number) {
  const omega0 = Math.sqrt(Math.max(1e-4, k / mass));
  const criticalDamping = 2 * Math.sqrt(mass * k);
  const dampingRatio = damping / criticalDamping;
  const frequency = omega0 / (2 * Math.PI);
  const period = 1 / frequency;
  
  return {
    omega0,
    criticalDamping,
    dampingRatio,
    frequency,
    period
  };
}

/**
 * Simple Pendulum
 * Period: T = 2 * pi * sqrt(L / g) (for small angle approximation)
 * Angular frequency: omega = sqrt(g / L)
 */
export function getPendulumParameters(length: number, g = STANDARD_GRAVITY) {
  const omega = Math.sqrt(Math.max(1e-4, g / length));
  const period = 2 * Math.PI * Math.sqrt(length / g);
  const frequency = 1 / period;
  
  return {
    omega,
    period,
    frequency
  };
}
