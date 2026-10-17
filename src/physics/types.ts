export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type PhysicsDomain = 'mechanics' | 'optics' | 'electromagnetism' | 'modern';

export type ObjectType =
  // Mechanics
  | 'sphere'
  | 'cube'
  | 'ramp'
  | 'cannon'
  | 'spring'
  | 'pendulum'
  // Optics
  | 'convex_lens'
  | 'concave_lens'
  | 'flat_mirror'
  | 'curved_mirror'
  | 'prism'
  | 'laser_emitter'
  | 'white_light_emitter'
  // Electromagnetism
  | 'charge_positive'
  | 'charge_negative'
  | 'bar_magnet'
  | 'uniform_field'
  | 'current_wire'
  | 'solenoid'
  | 'charged_particle'
  // Thermodynamics & Modern / Quantum
  | 'gas_chamber'
  | 'photoelectric_emitter'
  | 'hydrogen_atom'
  | 'quantum_well';

export interface PhysicsMaterial {
  friction: number;       // static & kinetic friction coefficient
  restitution: number;    // bounciness (0 = completely inelastic, 1 = perfectly elastic)
  density: number;        // kg/m^3
}

export interface PhysicsObjectState {
  id: string;
  name: string;
  type: ObjectType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  mass: number;           // kg
  isStatic: boolean;
  material: PhysicsMaterial;
  initialVelocity: [number, number, number]; // m/s
  color?: string;
  wireframe?: boolean;
  
  // Specific parameters for mechanics types
  // For ramp
  rampAngle?: number;      // degrees
  rampLength?: number;     // meters
  rampHeight?: number;     // meters
  
  // For projectile launcher
  launchSpeed?: number;    // m/s
  launchAngle?: number;    // degrees (pitch)
  launchYaw?: number;      // degrees (yaw)
  
  // For spring
  springK?: number;        // N/m (spring constant)
  restLength?: number;     // meters
  damping?: number;        // damping coefficient (N*s/m)
  anchorPosition?: [number, number, number];
  
  // For pendulum
  pendulumLength?: number; // meters
  bobMass?: number;        // kg
  initialTheta?: number;   // degrees
  pivotPosition?: [number, number, number];

  // Specific parameters for Optics
  focalLength?: number;       // meters (+ for convex, - for concave)
  refractiveIndex?: number;   // n (e.g. 1.517)
  cauchyB?: number;           // Cauchy dispersion coefficient B
  prismAngle?: number;        // degrees (apex angle, e.g. 60)
  beamWavelength?: number;    // nm (e.g. 532, 633)
  beamSpread?: number;        // degrees of beam spread
  rayCount?: number;          // number of ray paths
  aperture?: number;          // diameter / width of optical aperture (m)
  mirrorRadius?: number;      // curvature radius for spherical mirror (m)
  isWhiteLight?: boolean;     // whether to emit multi-spectral dispersion rays

  // Specific parameters for Electromagnetism
  charge?: number;            // Coulombs (e.g. +1e-6 C)
  magneticMoment?: number;    // A * m^2 (for bar magnet / dipole)
  current?: number;           // Amperes (for wire / solenoid)
  turnsCount?: number;        // number of wire turns in solenoid
  eFieldVector?: [number, number, number]; // N/C uniform electric field
  bFieldVector?: [number, number, number]; // Tesla uniform magnetic field

  // Specific parameters for Thermodynamics & Modern / Quantum
  temperature?: number;       // Kelvin (e.g. 300 K)
  particleCount?: number;     // N gas particles in chamber
  chamberDimensions?: [number, number, number]; // width, height, depth (m)
  quantumN?: number;          // Principal quantum number (n = 1, 2, 3...)
  quantumL?: number;          // Orbital quantum number (l = 0, 1, 2...)
  quantumM?: number;          // Magnetic quantum number (m = -l...l)
  workFunction?: number;      // eV (for photoelectric emitter)
  incidentPhotonFreq?: number; // Hz or nm (for photoelectric effect)
  wellWidth?: number;         // nm (for 1D potential well)
}

export interface LiveTelemetry {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  speed: number;             // |v| in m/s
  acceleration: [number, number, number]; // m/s^2
  kineticEnergy: number;     // Joules (0.5 * m * v^2)
  potentialEnergy: number;   // Joules (m * g * h)
  mechanicalEnergy: number;  // Joules (KE + PE)
  forces: {
    gravity: [number, number, number];
    normal?: [number, number, number];
    friction?: [number, number, number];
    net: [number, number, number];
    tension?: [number, number, number];
    spring?: [number, number, number];
  };
  momentum: [number, number, number]; // kg * m/s
  angularVelocity?: [number, number, number];
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  z: number;
  time: number;
}

export interface CaptionEvent {
  id: string;
  timestamp: number;
  text: string;
  latex?: string;
  category: 'kinematics' | 'dynamics' | 'energy' | 'collision' | 'oscillation';
  severity: 'info' | 'highlight' | 'formula';
}

export type CameraPreset = 'default' | 'top' | 'side' | 'front' | 'isometric';

export interface ScenePreset {
  id: string;
  title: string;
  description: string;
  formula: string;
  objects: PhysicsObjectState[];
  gravity: [number, number, number];
  initialCaption: string;
}
