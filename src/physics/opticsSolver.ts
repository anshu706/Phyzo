/**
 * Phyzo Optics Solver
 * Custom geometric and wave-optics ray tracer supporting:
 * - Snell's Law of Refraction: n1 * sin(theta1) = n2 * sin(theta2)
 * - Chromatic Dispersion via Cauchy's Equation: n(lambda) = A + B / lambda^2
 * - Total Internal Reflection (TIR) when sin(theta2) > 1
 * - Specular and Curved Mirror Reflection
 * - Thin Lens Equation Conjugates: 1/f = 1/d_o + 1/d_i
 */

import { PhysicsObjectState } from './types';

export interface OpticalRayPoint {
  position: [number, number, number];
  intensity: number;
}

export interface OpticalRay {
  id: string;
  wavelength: number; // nm (e.g. 400 - 700)
  color: string;      // Hex or RGB string
  points: [number, number, number][];
  intensity: number;
}

export interface LensEquationResult {
  focalLength: number; // f in meters
  objectDistance: number; // d_o in meters
  imageDistance: number; // d_i in meters
  magnification: number; // M = -d_i / d_o
  isReal: boolean;
  isInverted: boolean;
  isValid: boolean;
}

/**
 * Maps wavelength (380nm - 750nm) to accurate RGB hex representation.
 */
export function wavelengthToRGB(wavelength: number): string {
  let r = 0, g = 0, b = 0;
  const w = Math.max(380, Math.min(750, wavelength));

  if (w >= 380 && w < 440) {
    r = -(w - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (w >= 440 && w < 490) {
    r = 0.0;
    g = (w - 440) / (490 - 440);
    b = 1.0;
  } else if (w >= 490 && w < 510) {
    r = 0.0;
    g = 1.0;
    b = -(w - 510) / (510 - 490);
  } else if (w >= 510 && w < 580) {
    r = (w - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (w >= 580 && w < 645) {
    r = 1.0;
    g = -(w - 645) / (645 - 580);
    b = 0.0;
  } else if (w >= 645 && w <= 750) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  }

  // Intensity falloff near vision limits
  let factor = 1.0;
  if (w >= 380 && w < 420) {
    factor = 0.3 + 0.7 * (w - 380) / (420 - 380);
  } else if (w >= 680 && w <= 750) {
    factor = 0.3 + 0.7 * (750 - w) / (750 - 680);
  }

  const toHex = (c: number) => {
    const val = Math.round(Math.max(0, Math.min(255, c * factor * 255)));
    return val.toString(16).padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Cauchy's dispersion equation:
 * n(lambda) = A + B / lambda^2
 * where lambda is in micrometers (um)
 */
export function getCauchyRefractiveIndex(
  baseN: number = 1.5168, // Crown glass standard
  cauchyB: number = 0.0042, // um^2
  wavelengthNm: number = 589.3 // Sodium D-line
): number {
  const lambdaMicrons = wavelengthNm / 1000.0;
  return baseN + cauchyB / (lambdaMicrons * lambdaMicrons);
}

/**
 * 3D Vector Math Helpers
 */
type Vec3 = [number, number, number];

const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const length = (v: Vec3): number => Math.sqrt(dot(v, v));
const normalize = (v: Vec3): Vec3 => {
  const l = length(v);
  return l > 1e-6 ? [v[0] / l, v[1] / l, v[2] / l] : [0, 0, 1];
};
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (v: Vec3, s: number): Vec3 => [v[0] * s, v[1] * s, v[2] * s];

/**
 * Specular Reflection Vector
 * r = d - 2 * (d . n) * n
 */
export function reflectVector(incident: Vec3, normal: Vec3): Vec3 {
  const norm = normalize(normal);
  const dDotN = dot(incident, norm);
  return sub(incident, scale(norm, 2 * dDotN));
}

/**
 * Vector Snell's Law Refraction with Total Internal Reflection (TIR) Check
 * Returns { refracted: Vec3, isTIR: boolean }
 */
export function refractVector(
  incident: Vec3,
  normal: Vec3,
  n1: number,
  n2: number
): { refracted: Vec3; isTIR: boolean } {
  const inc = normalize(incident);
  let norm = normalize(normal);
  let cosTheta1 = -dot(inc, norm);

  // If incident from inside the surface, flip normal and swap indices
  let eta = n1 / n2;
  if (cosTheta1 < 0) {
    cosTheta1 = -cosTheta1;
    norm = scale(norm, -1);
  }

  const sin2Theta2 = eta * eta * (1.0 - cosTheta1 * cosTheta1);

  // Total Internal Reflection condition: sin(theta2) > 1
  if (sin2Theta2 > 1.0) {
    return {
      refracted: reflectVector(inc, norm),
      isTIR: true
    };
  }

  const cosTheta2 = Math.sqrt(1.0 - sin2Theta2);
  const refracted = add(
    scale(inc, eta),
    scale(norm, eta * cosTheta1 - cosTheta2)
  );

  return {
    refracted: normalize(refracted),
    isTIR: false
  };
}

/**
 * Solves Thin Lens Equation: 1/f = 1/d_o + 1/d_i
 */
export function solveThinLensEquation(
  focalLength: number,
  objectDistance: number
): LensEquationResult {
  if (Math.abs(objectDistance - focalLength) < 1e-4) {
    // Object located at focal point: rays emerge parallel, image at infinity
    return {
      focalLength,
      objectDistance,
      imageDistance: Infinity,
      magnification: Infinity,
      isReal: false,
      isInverted: false,
      isValid: false
    };
  }

  const di = (focalLength * objectDistance) / (objectDistance - focalLength);
  const m = -di / objectDistance;

  return {
    focalLength,
    objectDistance,
    imageDistance: di,
    magnification: m,
    isReal: di > 0,
    isInverted: m < 0,
    isValid: true
  };
}

/**
 * Optical Simulation Ray Tracer
 * Traces rays emitted from light sources (lasers, white light emitters)
 * through lenses, prisms, and mirrors in 3D scene space.
 */
export function traceOpticalRays(objects: PhysicsObjectState[]): OpticalRay[] {
  const rays: OpticalRay[] = [];
  const emitters = objects.filter(
    (o) => o.type === 'laser_emitter' || o.type === 'white_light_emitter'
  );
  const opticalElements = objects.filter(
    (o) =>
      o.type === 'convex_lens' ||
      o.type === 'concave_lens' ||
      o.type === 'flat_mirror' ||
      o.type === 'curved_mirror' ||
      o.type === 'prism'
  );

  if (emitters.length === 0) return rays;

  const MAX_BOUNCES = 6;
  const RAY_LENGTH = 18;

  emitters.forEach((emitter) => {
    const isWhite = emitter.type === 'white_light_emitter' || emitter.isWhiteLight;
    const baseWavelength = emitter.beamWavelength || 532; // Green laser default (nm)
    const rayCount = emitter.rayCount || (isWhite ? 7 : 5);
    const spread = (emitter.beamSpread || 0.1) * (Math.PI / 180);

    // Spectrum definition: wavelengths from 410nm to 680nm for dispersion
    const spectralWavelengths: number[] = isWhite
      ? [415, 460, 505, 540, 585, 620, 670]
      : Array.from({ length: rayCount }, () => baseWavelength);

    spectralWavelengths.forEach((wavelength, rayIdx) => {
      // Calculate initial direction based on emitter rotation and beam spread
      const rotY = emitter.rotation[1] || 0;
      const rotZ = emitter.rotation[2] || 0;
      const angleOffset =
        rayCount > 1
          ? (rayIdx - (rayCount - 1) / 2) * (spread / Math.max(1, rayCount - 1))
          : 0;

      // Base direction vector (along local X+ or Z+ rotated)
      const cosZ = Math.cos(rotZ + angleOffset);
      const sinZ = Math.sin(rotZ + angleOffset);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      let currentDir: Vec3 = normalize([cosZ * cosY, sinZ, -cosZ * sinY]);
      let currentOrigin: Vec3 = [
        emitter.position[0],
        emitter.position[1],
        emitter.position[2]
      ];

      const rayPoints: Vec3[] = [currentOrigin];
      let currentMediumN = 1.0; // Air
      let remainingDistance = RAY_LENGTH;

      for (let bounce = 0; bounce < MAX_BOUNCES; bounce++) {
        // Find closest intersection with an optical element
        let closestHit: {
          element: PhysicsObjectState;
          distance: number;
          hitPoint: Vec3;
          normal: Vec3;
        } | null = null;

        for (const el of opticalElements) {
          const elPos: Vec3 = el.position;
          const toEl = sub(elPos, currentOrigin);
          const proj = dot(toEl, currentDir);

          // Element must be in front of ray
          if (proj <= 0.05) continue;

          const perpDistSq = dot(toEl, toEl) - proj * proj;
          const radius = (el.aperture || (el.scale[1] || 2)) / 2;

          if (perpDistSq < radius * radius) {
            const hitDist = proj;
            if (hitDist > 0.05 && (!closestHit || hitDist < closestHit.distance)) {
              // Calculate surface normal
              let normal: Vec3 = [0, 0, 1];
              if (el.type === 'flat_mirror' || el.type === 'curved_mirror') {
                normal = normalize(sub(currentOrigin, elPos));
                if (dot(currentDir, normal) > 0) normal = scale(normal, -1);
              } else if (el.type === 'prism') {
                // Approximate equilateral prism faces
                const localX = (currentOrigin[0] + currentDir[0] * hitDist) - elPos[0];
                normal = localX < 0 ? [-0.866, 0.5, 0] : [0.866, 0.5, 0];
                if (dot(currentDir, normal) > 0) normal = scale(normal, -1);
              } else {
                // Thin Lens normal along element optical axis
                normal = [Math.cos(el.rotation[1]), 0, -Math.sin(el.rotation[1])];
                if (dot(currentDir, normal) > 0) normal = scale(normal, -1);
              }

              closestHit = {
                element: el,
                distance: hitDist,
                hitPoint: add(currentOrigin, scale(currentDir, hitDist)),
                normal
              };
            }
          }
        }

        if (!closestHit) {
          // Ray continues unobstructed to horizon
          rayPoints.push(add(currentOrigin, scale(currentDir, remainingDistance)));
          break;
        }

        // Ray struck an optical element
        const { element, distance: hitDist, hitPoint, normal } = closestHit;
        rayPoints.push(hitPoint);
        remainingDistance -= hitDist;
        if (remainingDistance <= 0.2) break;

        // Interaction logic based on element type
        if (element.type === 'flat_mirror') {
          // Pure specular reflection
          currentDir = reflectVector(currentDir, normal);
          currentOrigin = add(hitPoint, scale(currentDir, 0.02));
        } else if (element.type === 'curved_mirror') {
          // Spherical curved mirror: normal depends on distance from center
          const rCurve = element.mirrorRadius || 6.0;
          const radial = sub(hitPoint, element.position);
          const curvedNormal = normalize(sub(normal, scale(radial, 1 / rCurve)));
          currentDir = reflectVector(currentDir, curvedNormal);
          currentOrigin = add(hitPoint, scale(currentDir, 0.02));
        } else if (element.type === 'convex_lens' || element.type === 'concave_lens') {
          // Thin lens bending towards/away from focus
          const f = element.focalLength || (element.type === 'convex_lens' ? 4.0 : -4.0);
          const dX = hitPoint[0] - element.position[0];
          const dY = hitPoint[1] - element.position[1];

          // Lens deviation angle: theta = -h / f
          const bentDir: Vec3 = normalize([
            currentDir[0] - dX / f,
            currentDir[1] - dY / f,
            currentDir[2]
          ]);
          currentDir = bentDir;
          currentOrigin = add(hitPoint, scale(currentDir, 0.05));
        } else if (element.type === 'prism') {
          // Chromatic dispersion via Cauchy equation
          const baseN = element.refractiveIndex || 1.52;
          const cauchyB = element.cauchyB || 0.005;
          const prismN = getCauchyRefractiveIndex(baseN, cauchyB, wavelength);

          const { refracted, isTIR } = refractVector(
            currentDir,
            normal,
            currentMediumN,
            prismN
          );

          currentDir = refracted;
          currentOrigin = add(hitPoint, scale(currentDir, 0.02));
          currentMediumN = isTIR ? currentMediumN : (currentMediumN === 1.0 ? prismN : 1.0);
        }
      }

      rays.push({
        id: `ray-${emitter.id}-${rayIdx}-${wavelength}`,
        wavelength,
        color: isWhite ? wavelengthToRGB(wavelength) : (emitter.color || '#19E3F5'),
        points: rayPoints,
        intensity: 1.0
      });
    });
  });

  return rays;
}
