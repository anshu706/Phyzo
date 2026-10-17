/**
 * Phyzo Quantum Physics Solver
 * Implements:
 * - Photoelectric Effect: E_k = hf - φ (work function)
 * - Hydrogen Atom Energy Levels: E_n = -13.6 / n^2 eV
 * - 1D Infinite Potential Well (Particle in a Box):
 *   ψ_n(x) = sqrt(2/L) * sin(n*pi*x / L)
 *   E_n = n^2 * h^2 / (8*m*L^2)
 * - Schrödinger Equation probability density |ψ|^2 sampling
 * - Bohr Model orbital radii and spectral transitions
 */

// Fundamental Constants
export const H_PLANCK = 6.62607e-34;   // J·s
export const H_BAR = 1.05457e-34;       // ℏ = h/(2π)
export const ELECTRON_MASS = 9.10938e-31; // kg
export const ELECTRON_CHARGE = 1.60218e-19; // C
export const BOHR_RADIUS = 5.29177e-11; // m (a0)
export const RYDBERG_EV = 13.6;         // eV

export interface PhotoelectricResult {
  photonEnergy: number;      // eV
  workFunction: number;      // eV
  kineticEnergy: number;     // eV (max KE of ejected electron)
  isEmitted: boolean;        // true if photon energy > work function
  thresholdFreq: number;     // Hz
  stoppingVoltage: number;   // Volts
}

export interface HydrogenLevel {
  n: number;
  energy: number;     // eV
  radius: number;     // Bohr radii (a0)
  wavelengthFromGround: number; // nm (emission wavelength for transition n→1)
}

export interface QuantumWellState {
  n: number;
  energy: number;         // eV
  wellWidth: number;      // nm
  psiSamples: { x: number; psi: number; probDensity: number }[];
}

export interface SpectralTransition {
  nInitial: number;
  nFinal: number;
  energyDiff: number;    // eV
  wavelength: number;    // nm
  color: string;         // approximate visible hex
  seriesName: string;    // Lyman, Balmer, Paschen, etc.
}

/**
 * Photoelectric Effect Calculator
 * E = hf, KE_max = hf - φ
 */
export function solvePhotoelectricEffect(
  frequency: number, // Hz
  workFunction: number // eV
): PhotoelectricResult {
  const photonEnergyJ = H_PLANCK * frequency;
  const photonEnergyEV = photonEnergyJ / ELECTRON_CHARGE;
  const keMax = photonEnergyEV - workFunction;
  const thresholdFreq = (workFunction * ELECTRON_CHARGE) / H_PLANCK;

  return {
    photonEnergy: photonEnergyEV,
    workFunction,
    kineticEnergy: Math.max(0, keMax),
    isEmitted: keMax > 0,
    thresholdFreq,
    stoppingVoltage: Math.max(0, keMax) // V_stop = KE_max / e (in eV = Volts)
  };
}

/**
 * Hydrogen Atom Bohr Model Energy Levels
 * E_n = -13.6 / n^2 eV
 * r_n = n^2 * a_0
 */
export function getHydrogenEnergyLevels(maxN: number = 6): HydrogenLevel[] {
  const levels: HydrogenLevel[] = [];

  for (let n = 1; n <= maxN; n++) {
    const energy = -RYDBERG_EV / (n * n);
    const radius = n * n; // In units of Bohr radii

    // Emission wavelength for transition n → 1 (Lyman series)
    let wavelengthNm = Infinity;
    if (n > 1) {
      const deltaE = RYDBERG_EV * (1 - 1 / (n * n)); // eV
      const deltaEJ = deltaE * ELECTRON_CHARGE;
      wavelengthNm = (H_PLANCK * 3e8 / deltaEJ) * 1e9;
    }

    levels.push({ n, energy, radius, wavelengthFromGround: wavelengthNm });
  }

  return levels;
}

/**
 * Spectral transitions between hydrogen energy levels
 */
export function getSpectralTransitions(maxN: number = 6): SpectralTransition[] {
  const transitions: SpectralTransition[] = [];

  for (let ni = 2; ni <= maxN; ni++) {
    for (let nf = 1; nf < ni; nf++) {
      const deltaE = RYDBERG_EV * (1 / (nf * nf) - 1 / (ni * ni));
      const wavelengthM = (H_PLANCK * 3e8) / (deltaE * ELECTRON_CHARGE);
      const wavelengthNm = wavelengthM * 1e9;

      let seriesName = '';
      if (nf === 1) seriesName = 'Lyman (UV)';
      else if (nf === 2) seriesName = 'Balmer (Visible)';
      else if (nf === 3) seriesName = 'Paschen (IR)';
      else seriesName = `Series (n_f=${nf})`;

      // Approximate visible color for Balmer series
      let color = '#AAAAAA';
      if (wavelengthNm >= 380 && wavelengthNm <= 750) {
        color = wavelengthToHex(wavelengthNm);
      } else if (wavelengthNm < 380) {
        color = '#6B21A8'; // UV purple
      } else {
        color = '#7F1D1D'; // IR deep red
      }

      transitions.push({
        nInitial: ni,
        nFinal: nf,
        energyDiff: deltaE,
        wavelength: wavelengthNm,
        color,
        seriesName
      });
    }
  }

  return transitions;
}

function wavelengthToHex(nm: number): string {
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm >= 440 && nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm >= 490 && nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm >= 510 && nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm >= 580 && nm < 645) { r = 1; g = -(nm - 645) / 65; }
  else if (nm >= 645 && nm <= 750) { r = 1; }

  const toHex = (c: number) => Math.round(Math.max(0, Math.min(255, c * 255))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 1D Infinite Potential Well (Particle in a Box)
 * ψ_n(x) = sqrt(2/L) * sin(n*π*x / L)
 * E_n = n² * h² / (8 * m * L²) [in eV]
 */
export function solveQuantumWell(
  n: number,
  wellWidthNm: number,
  numSamples: number = 100
): QuantumWellState {
  const L = wellWidthNm * 1e-9; // Convert to meters
  const energyJ = (n * n * H_PLANCK * H_PLANCK) / (8 * ELECTRON_MASS * L * L);
  const energyEV = energyJ / ELECTRON_CHARGE;

  const norm = Math.sqrt(2.0 / L);
  const samples: { x: number; psi: number; probDensity: number }[] = [];

  for (let i = 0; i <= numSamples; i++) {
    const xFrac = i / numSamples; // 0 to 1 (normalized)
    const xM = xFrac * L;
    const psi = norm * Math.sin((n * Math.PI * xM) / L);
    const probDensity = psi * psi;

    samples.push({
      x: xFrac,
      psi: psi / norm, // Normalized for display (-1 to 1)
      probDensity: probDensity / (norm * norm) // Normalized for display (0 to 1)
    });
  }

  return {
    n,
    energy: energyEV,
    wellWidth: wellWidthNm,
    psiSamples: samples
  };
}

/**
 * Generate 3D probability density cloud sample points for hydrogen atom visualization
 * Based on radial wave function R_nl(r) and spherical harmonics Y_lm(θ, φ)
 * Uses Monte Carlo rejection sampling
 */
export function sampleHydrogenProbabilityCloud(
  n: number,
  l: number,
  m: number,
  numPoints: number = 400
): [number, number, number][] {
  const points: [number, number, number][] = [];
  const maxR = n * n * 4.0; // Scale in Bohr radii units for visualization
  let attempts = 0;
  const maxAttempts = numPoints * 25;

  while (points.length < numPoints && attempts < maxAttempts) {
    attempts++;

    // Random point in spherical volume
    const r = Math.random() * maxR;
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * 2 * Math.PI;

    // Simplified hydrogen radial probability: P(r) ∝ r^2 * |R_nl(r)|^2
    // Use approximate analytical forms for low n, l
    let prob = 0;

    if (n === 1 && l === 0) {
      // 1s orbital: R_10 = 2 * exp(-r)
      prob = 4 * r * r * Math.exp(-2 * r);
    } else if (n === 2 && l === 0) {
      // 2s orbital: R_20 ∝ (2 - r) * exp(-r/2)
      const val = (2 - r) * Math.exp(-r / 2);
      prob = r * r * val * val * 0.25;
    } else if (n === 2 && l === 1) {
      // 2p orbital: R_21 ∝ r * exp(-r/2) * cos(theta)
      const val = r * Math.exp(-r / 2);
      const angular = Math.cos(theta); // m=0 component
      prob = val * val * angular * angular * 0.08;
    } else if (n === 3 && l === 0) {
      // 3s orbital
      const val = (27 - 18 * r + 2 * r * r) * Math.exp(-r / 3) / 27;
      prob = r * r * val * val * 0.1;
    } else {
      // Generic fallback
      const rNorm = r / n;
      prob = rNorm * rNorm * Math.exp(-2 * rNorm) * 0.5;
    }

    // Rejection sampling
    const threshold = Math.random() * 0.35;
    if (prob > threshold) {
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.cos(theta);
      const z = r * Math.sin(theta) * Math.sin(phi);
      points.push([x, y, z]);
    }
  }

  return points;
}
