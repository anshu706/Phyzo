export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type ObjectType = 'sphere' | 'cube' | 'ramp' | 'cannon' | 'spring' | 'pendulum';

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
