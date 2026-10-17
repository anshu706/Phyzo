import { ScenePreset } from './types';

export const SCENE_PRESETS: ScenePreset[] = [
  {
    id: 'projectile-launcher',
    title: 'Ballistic Projectile Motion',
    description: 'Launch a projectile at an angle. Observe how horizontal velocity remains constant while vertical velocity is accelerated by gravity.',
    formula: 'y(t) = v_0 \\sin(\\theta) t - \\frac{1}{2}gt^2',
    gravity: [0, -9.81, 0],
    initialCaption: 'Projectile launcher initialized with v_0 = 12 m/s at 45°. Press Play to launch.',
    objects: [
      {
        id: 'projectile-cannon',
        name: 'Cannon Platform',
        type: 'cannon',
        position: [-8, 0.5, 0],
        rotation: [0, 0, Math.PI / 4], // 45 deg
        scale: [1, 1, 1],
        mass: 50,
        isStatic: true,
        material: { friction: 0.5, restitution: 0.2, density: 1000 },
        initialVelocity: [0, 0, 0],
        launchSpeed: 13,
        launchAngle: 45,
        color: '#7D4047'
      },
      {
        id: 'projectile-ball',
        name: 'Projectile Sphere',
        type: 'sphere',
        position: [-8, 1.2, 0],
        rotation: [0, 0, 0],
        scale: [0.7, 0.7, 0.7],
        mass: 2.0,
        isStatic: false,
        material: { friction: 0.3, restitution: 0.65, density: 1200 },
        initialVelocity: [9.19, 9.19, 0], // 13 m/s at 45 deg
        color: '#DD0200'
      }
    ]
  },
  {
    id: 'inclined-plane',
    title: 'Inclined Plane & Friction',
    description: 'Gravity decomposes into parallel component mg sin(θ) causing slide and perpendicular component mg cos(θ) creating normal force N.',
    formula: 'F_{net} = mg(\\sin\\theta - \\mu_k\\cos\\theta)',
    gravity: [0, -9.81, 0],
    initialCaption: 'Block on a 30° ramp. Parallel gravity opposes kinetic friction f_k = μ_k · N.',
    objects: [
      {
        id: 'ramp-base',
        name: 'Incline Wedge (30°)',
        type: 'ramp',
        position: [0, 2.0, 0],
        rotation: [0, 0, -Math.PI / 6], // 30 deg
        scale: [10, 0.5, 3],
        mass: 100,
        isStatic: true,
        material: { friction: 0.35, restitution: 0.1, density: 2500 },
        initialVelocity: [0, 0, 0],
        rampAngle: 30,
        rampLength: 10,
        rampHeight: 5,
        color: '#2E2E2E'
      },
      {
        id: 'ramp-slider',
        name: 'Sliding Block',
        type: 'cube',
        position: [-3.0, 4.3, 0],
        rotation: [0, 0, -Math.PI / 6],
        scale: [1, 1, 1],
        mass: 3.0,
        isStatic: false,
        material: { friction: 0.25, restitution: 0.1, density: 1000 },
        initialVelocity: [0, 0, 0],
        color: '#F0E6D8'
      }
    ]
  },
  {
    id: 'elastic-collision',
    title: "Newtonian Collisions",
    description: 'Demonstration of conservation of momentum and mechanical energy in elastic (e=1) and inelastic (e<1) impacts.',
    formula: 'm_1 v_1 + m_2 v_2 = m_1 v_1\' + m_2 v_2\'',
    gravity: [0, -9.81, 0],
    initialCaption: 'Red sphere approaches stationary Olive sphere. Watch momentum transfer upon impact.',
    objects: [
      {
        id: 'sphere-incoming',
        name: 'Fast Sphere (m=3kg)',
        type: 'sphere',
        position: [-6, 0.7, 0],
        rotation: [0, 0, 0],
        scale: [0.8, 0.8, 0.8],
        mass: 3.0,
        isStatic: false,
        material: { friction: 0.05, restitution: 0.98, density: 2000 },
        initialVelocity: [7, 0, 0],
        color: '#DD0200'
      },
      {
        id: 'sphere-target',
        name: 'Target Sphere (m=3kg)',
        type: 'sphere',
        position: [0, 0.7, 0],
        rotation: [0, 0, 0],
        scale: [0.8, 0.8, 0.8],
        mass: 3.0,
        isStatic: false,
        material: { friction: 0.05, restitution: 0.98, density: 2000 },
        initialVelocity: [0, 0, 0],
        color: '#6F7F5F'
      }
    ]
  },
  {
    id: 'harmonic-spring',
    title: 'Harmonic Spring Oscillator',
    description: 'Hookes Law restoring force F = -kx creates periodic oscillation. Mechanical energy cycles between elastic potential and kinetic.',
    formula: 'F_s = -k \\Delta x, \\quad \\omega_0 = \\sqrt{k/m}',
    gravity: [0, 0, 0], // zero gravity for pure horizontal spring
    initialCaption: 'Displaced mass attached to spring. Restoring force accelerates mass toward equilibrium x=0.',
    objects: [
      {
        id: 'spring-oscillator',
        name: 'Spring Mass System',
        type: 'spring',
        position: [3.5, 1.5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        mass: 2.0,
        isStatic: false,
        material: { friction: 0.02, restitution: 0.8, density: 1000 },
        initialVelocity: [0, 0, 0],
        springK: 25,
        restLength: 3.0,
        damping: 0.15,
        anchorPosition: [-3.0, 1.5, 0],
        color: '#19E3F5'
      }
    ]
  },
  {
    id: 'simple-pendulum',
    title: 'Gravity Pendulum',
    description: 'A pendulum bob suspended from an anchor. Small-angle oscillations have a period T = 2π√(L/g) independent of mass.',
    formula: 'T = 2\\pi \\sqrt{\\frac{L}{g}}, \\quad \\tau = -mgL\\sin\\theta',
    gravity: [0, -9.81, 0],
    initialCaption: 'Pendulum released from 40° initial displacement. Tension and tangential gravity exchange energies.',
    objects: [
      {
        id: 'pendulum-system',
        name: 'Simple Pendulum',
        type: 'pendulum',
        position: [2.5, 3.5, 0],
        rotation: [0, 0, 0],
        scale: [0.8, 0.8, 0.8],
        mass: 2.5,
        isStatic: false,
        material: { friction: 0.01, restitution: 0.9, density: 1500 },
        initialVelocity: [0, 0, 0],
        pendulumLength: 4.0,
        bobMass: 2.5,
        initialTheta: 40,
        pivotPosition: [0, 6.5, 0],
        color: '#7D4047'
      }
    ]
  },
  {
    id: 'free-fall',
    title: 'Free Fall & Energy Conservation',
    description: 'Objects dropped in gravitational field convert gravitational potential energy (mgh) into kinetic energy (1/2 mv²) without loss.',
    formula: 'E_{total} = mgh + \\frac{1}{2}mv^2 = \\text{const}',
    gravity: [0, -9.81, 0],
    initialCaption: 'Elevated spheres at h = 8m. When released, potential energy trades into velocity.',
    objects: [
      {
        id: 'heavy-sphere',
        name: 'Heavy Sphere (m=10kg)',
        type: 'sphere',
        position: [-2.0, 8.0, 0],
        rotation: [0, 0, 0],
        scale: [1.2, 1.2, 1.2],
        mass: 10.0,
        isStatic: false,
        material: { friction: 0.2, restitution: 0.75, density: 3000 },
        initialVelocity: [0, 0, 0],
        color: '#DD0200'
      },
      {
        id: 'light-sphere',
        name: 'Light Sphere (m=2kg)',
        type: 'sphere',
        position: [2.0, 8.0, 0],
        rotation: [0, 0, 0],
        scale: [0.7, 0.7, 0.7],
        mass: 2.0,
        isStatic: false,
        material: { friction: 0.2, restitution: 0.75, density: 1000 },
        initialVelocity: [0, 0, 0],
        color: '#6F7F5F'
      }
    ]
  }
];
