import { create } from 'zustand';
import { PhysicsObjectState, ObjectType, CameraPreset } from '../physics/types';
import { SCENE_PRESETS } from '../physics/presets';
import { useSimulationStore } from './useSimulationStore';

interface SceneState {
  objects: PhysicsObjectState[];
  selectedObjectId: string | null;
  transformMode: 'translate' | 'rotate' | 'scale';
  cameraPreset: CameraPreset;
  snapToGrid: boolean;
  gridSnapSize: number;
  
  // History
  history: PhysicsObjectState[][];
  historyIndex: number;
  
  // Actions
  selectObject: (id: string | null) => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  setCameraPreset: (preset: CameraPreset) => void;
  toggleSnapToGrid: () => void;
  setGridSnapSize: (size: number) => void;
  
  addObject: (type: ObjectType, overrides?: Partial<PhysicsObjectState>) => void;
  updateObject: (id: string, updates: Partial<PhysicsObjectState>) => void;
  removeObject: (id: string) => void;
  loadPreset: (presetId: string) => void;
  
  // Undo / Redo
  undo: () => void;
  redo: () => void;
  
  // Storage
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  exportSceneJSON: () => string;
  importSceneJSON: (jsonStr: string) => boolean;
}

const defaultPreset = SCENE_PRESETS[0];

export const useSceneStore = create<SceneState>((set, get) => ({
  objects: JSON.parse(JSON.stringify(defaultPreset.objects)),
  selectedObjectId: defaultPreset.objects[1]?.id || defaultPreset.objects[0]?.id || null,
  transformMode: 'translate',
  cameraPreset: 'default',
  snapToGrid: false,
  gridSnapSize: 0.5,
  
  history: [JSON.parse(JSON.stringify(defaultPreset.objects))],
  historyIndex: 0,

  selectObject: (selectedObjectId) => set({ selectedObjectId }),
  
  setTransformMode: (transformMode) => set({ transformMode }),
  
  setCameraPreset: (cameraPreset) => set({ cameraPreset }),
  
  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
  
  setGridSnapSize: (gridSnapSize) => set({ gridSnapSize }),

  addObject: (type: ObjectType, overrides = {}) => {
    const id = `obj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    let newObj: PhysicsObjectState;

    switch (type) {
      case 'sphere':
        newObj = {
          id,
          name: `Sphere ${get().objects.length + 1}`,
          type: 'sphere',
          position: [0, 4, 0],
          rotation: [0, 0, 0],
          scale: [0.8, 0.8, 0.8],
          mass: 2.0,
          isStatic: false,
          material: { friction: 0.3, restitution: 0.7, density: 1200 },
          initialVelocity: [0, 0, 0],
          color: '#DD0200',
          ...overrides
        };
        break;
      case 'cube':
        newObj = {
          id,
          name: `Block ${get().objects.length + 1}`,
          type: 'cube',
          position: [0, 3, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 3.0,
          isStatic: false,
          material: { friction: 0.4, restitution: 0.3, density: 1000 },
          initialVelocity: [0, 0, 0],
          color: '#F0E6D8',
          ...overrides
        };
        break;
      case 'ramp':
        newObj = {
          id,
          name: `Ramp ${get().objects.length + 1}`,
          type: 'ramp',
          position: [0, 1.5, 0],
          rotation: [0, 0, -Math.PI / 6],
          scale: [8, 0.4, 3],
          mass: 100,
          isStatic: true,
          material: { friction: 0.3, restitution: 0.1, density: 2500 },
          initialVelocity: [0, 0, 0],
          rampAngle: 30,
          rampLength: 8,
          rampHeight: 4,
          color: '#2E2E2E',
          ...overrides
        };
        break;
      case 'cannon':
        newObj = {
          id,
          name: `Cannon ${get().objects.length + 1}`,
          type: 'cannon',
          position: [-5, 0.5, 0],
          rotation: [0, 0, Math.PI / 4],
          scale: [1, 1, 1],
          mass: 50,
          isStatic: true,
          material: { friction: 0.5, restitution: 0.2, density: 2000 },
          initialVelocity: [0, 0, 0],
          launchSpeed: 12,
          launchAngle: 45,
          color: '#7D4047',
          ...overrides
        };
        break;
      case 'spring':
        newObj = {
          id,
          name: `Spring ${get().objects.length + 1}`,
          type: 'spring',
          position: [3, 1.5, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 2.0,
          isStatic: false,
          material: { friction: 0.05, restitution: 0.8, density: 1000 },
          initialVelocity: [0, 0, 0],
          springK: 30,
          restLength: 3,
          damping: 0.2,
          anchorPosition: [-2, 1.5, 0],
          color: '#19E3F5',
          ...overrides
        };
        break;
      case 'pendulum':
        newObj = {
          id,
          name: `Pendulum ${get().objects.length + 1}`,
          type: 'pendulum',
          position: [2, 3.5, 0],
          rotation: [0, 0, 0],
          scale: [0.8, 0.8, 0.8],
          mass: 2.5,
          isStatic: false,
          material: { friction: 0.01, restitution: 0.9, density: 1500 },
          initialVelocity: [0, 0, 0],
          pendulumLength: 4,
          bobMass: 2.5,
          initialTheta: 35,
          pivotPosition: [0, 6.5, 0],
          color: '#7D4047',
          ...overrides
        };
        break;

      // Optics Elements
      case 'convex_lens':
        newObj = {
          id,
          name: `Convex Lens ${get().objects.length + 1}`,
          type: 'convex_lens',
          position: [0, 2, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 1.0,
          isStatic: true,
          material: { friction: 0.1, restitution: 0.5, density: 2500 },
          initialVelocity: [0, 0, 0],
          focalLength: 3.5,
          refractiveIndex: 1.517,
          aperture: 3.0,
          color: '#E0F7FA',
          ...overrides
        };
        break;

      case 'concave_lens':
        newObj = {
          id,
          name: `Concave Lens ${get().objects.length + 1}`,
          type: 'concave_lens',
          position: [0, 2, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 1.0,
          isStatic: true,
          material: { friction: 0.1, restitution: 0.5, density: 2500 },
          initialVelocity: [0, 0, 0],
          focalLength: -3.5,
          refractiveIndex: 1.517,
          aperture: 3.0,
          color: '#EBF8FF',
          ...overrides
        };
        break;

      case 'flat_mirror':
        newObj = {
          id,
          name: `Plane Mirror ${get().objects.length + 1}`,
          type: 'flat_mirror',
          position: [3, 2, 0],
          rotation: [0, Math.PI / 4, 0],
          scale: [1, 1, 1],
          mass: 2.0,
          isStatic: true,
          material: { friction: 0.2, restitution: 0.4, density: 2500 },
          initialVelocity: [0, 0, 0],
          aperture: 3.5,
          color: '#FFFFFF',
          ...overrides
        };
        break;

      case 'curved_mirror':
        newObj = {
          id,
          name: `Concave Mirror ${get().objects.length + 1}`,
          type: 'curved_mirror',
          position: [4, 2, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 2.0,
          isStatic: true,
          material: { friction: 0.2, restitution: 0.4, density: 2500 },
          initialVelocity: [0, 0, 0],
          mirrorRadius: 6.0,
          aperture: 3.5,
          color: '#E2E8F0',
          ...overrides
        };
        break;

      case 'prism':
        newObj = {
          id,
          name: `Dispersive Prism ${get().objects.length + 1}`,
          type: 'prism',
          position: [0, 1.8, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 1.5,
          isStatic: true,
          material: { friction: 0.2, restitution: 0.4, density: 2600 },
          initialVelocity: [0, 0, 0],
          refractiveIndex: 1.52,
          cauchyB: 0.005,
          prismAngle: 60,
          color: '#F0F8FF',
          ...overrides
        };
        break;

      case 'laser_emitter':
        newObj = {
          id,
          name: `Laser Pointer ${get().objects.length + 1}`,
          type: 'laser_emitter',
          position: [-6, 2, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 0.5,
          isStatic: true,
          material: { friction: 0.3, restitution: 0.3, density: 1000 },
          initialVelocity: [0, 0, 0],
          beamWavelength: 532,
          beamSpread: 0.2,
          rayCount: 5,
          color: '#19E3F5',
          ...overrides
        };
        break;

      case 'white_light_emitter':
        newObj = {
          id,
          name: `White Light Source ${get().objects.length + 1}`,
          type: 'white_light_emitter',
          position: [-6, 2, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 0.8,
          isStatic: true,
          material: { friction: 0.3, restitution: 0.3, density: 1200 },
          initialVelocity: [0, 0, 0],
          isWhiteLight: true,
          beamSpread: 1.5,
          rayCount: 7,
          color: '#F0E6D8',
          ...overrides
        };
        break;

      // Electromagnetism Elements
      case 'charge_positive':
        newObj = {
          id,
          name: `+ Charge ${get().objects.length + 1}`,
          type: 'charge_positive',
          position: [-2, 2, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 0.01,
          isStatic: true,
          material: { friction: 0, restitution: 0, density: 1000 },
          initialVelocity: [0, 0, 0],
          charge: 2.0,
          color: '#DD0200',
          ...overrides
        };
        break;

      case 'charge_negative':
        newObj = {
          id,
          name: `− Charge ${get().objects.length + 1}`,
          type: 'charge_negative',
          position: [2, 2, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 0.01,
          isStatic: true,
          material: { friction: 0, restitution: 0, density: 1000 },
          initialVelocity: [0, 0, 0],
          charge: -2.0,
          color: '#2563EB',
          ...overrides
        };
        break;

      case 'bar_magnet':
        newObj = {
          id,
          name: `Bar Magnet ${get().objects.length + 1}`,
          type: 'bar_magnet',
          position: [0, 2, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 0.5,
          isStatic: true,
          material: { friction: 0.3, restitution: 0.2, density: 7800 },
          initialVelocity: [0, 0, 0],
          magneticMoment: 15.0,
          color: '#DC2626',
          ...overrides
        };
        break;

      case 'current_wire':
        newObj = {
          id,
          name: `Current Wire ${get().objects.length + 1}`,
          type: 'current_wire',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 1.0,
          isStatic: true,
          material: { friction: 0.3, restitution: 0.1, density: 8900 },
          initialVelocity: [0, 0, 0],
          current: 10.0,
          color: '#F59E0B',
          ...overrides
        };
        break;

      case 'solenoid':
        newObj = {
          id,
          name: `Solenoid ${get().objects.length + 1}`,
          type: 'solenoid',
          position: [0, 2, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 2.0,
          isStatic: true,
          material: { friction: 0.3, restitution: 0.1, density: 8900 },
          initialVelocity: [0, 0, 0],
          current: 8.0,
          turnsCount: 100,
          color: '#F59E0B',
          ...overrides
        };
        break;

      case 'uniform_field':
        newObj = {
          id,
          name: `Uniform Field ${get().objects.length + 1}`,
          type: 'uniform_field',
          position: [0, 2, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 0,
          isStatic: true,
          material: { friction: 0, restitution: 0, density: 0 },
          initialVelocity: [0, 0, 0],
          eFieldVector: [5.0, 0, 0],
          color: '#19E3F5',
          ...overrides
        };
        break;

      case 'charged_particle':
        newObj = {
          id,
          name: `Test Particle ${get().objects.length + 1}`,
          type: 'charged_particle',
          position: [0, 4, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 1.0,
          isStatic: false,
          material: { friction: 0, restitution: 1.0, density: 1000 },
          initialVelocity: [2, 0, 1],
          charge: 1.0,
          color: '#19E3F5',
          ...overrides
        };
        break;

      // Thermodynamics & Modern / Quantum Elements
      case 'gas_chamber':
        newObj = {
          id,
          name: `Gas Chamber ${get().objects.length + 1}`,
          type: 'gas_chamber',
          position: [0, 2, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 10,
          isStatic: true,
          material: { friction: 0, restitution: 1.0, density: 1000 },
          initialVelocity: [0, 0, 0],
          temperature: 300,
          particleCount: 80,
          chamberDimensions: [4, 4, 4],
          color: '#F0E6D8',
          ...overrides
        };
        break;

      case 'photoelectric_emitter':
        newObj = {
          id,
          name: `Photoelectric Plate ${get().objects.length + 1}`,
          type: 'photoelectric_emitter',
          position: [0, 2, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 5,
          isStatic: true,
          material: { friction: 0.3, restitution: 0.1, density: 7800 },
          initialVelocity: [0, 0, 0],
          workFunction: 2.3,
          incidentPhotonFreq: 6.5e14,
          color: '#94A3B8',
          ...overrides
        };
        break;

      case 'hydrogen_atom':
        newObj = {
          id,
          name: `Hydrogen Atom ${get().objects.length + 1}`,
          type: 'hydrogen_atom',
          position: [0, 2, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 1.67e-27,
          isStatic: true,
          material: { friction: 0, restitution: 0, density: 0 },
          initialVelocity: [0, 0, 0],
          quantumN: 1,
          quantumL: 0,
          quantumM: 0,
          color: '#A855F7',
          ...overrides
        };
        break;

      case 'quantum_well':
        newObj = {
          id,
          name: `Quantum Well ${get().objects.length + 1}`,
          type: 'quantum_well',
          position: [0, 2, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          mass: 9.109e-31,
          isStatic: true,
          material: { friction: 0, restitution: 0, density: 0 },
          initialVelocity: [0, 0, 0],
          quantumN: 1,
          wellWidth: 1.0,
          color: '#19E3F5',
          ...overrides
        };
        break;

      default:
        return;
    }

    const nextObjects = [...get().objects, newObj];
    const newHistory = get().history.slice(0, get().historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(nextObjects)));

    set({
      objects: nextObjects,
      selectedObjectId: newObj.id,
      history: newHistory,
      historyIndex: newHistory.length - 1
    });

    useSimulationStore.getState().addCaption({
      text: `Added ${newObj.name} to the viewport.`,
      category: 'kinematics',
      severity: 'info'
    });
  },

  updateObject: (id, updates) => {
    const updated = get().objects.map((obj) =>
      obj.id === id ? { ...obj, ...updates } : obj
    );
    set({ objects: updated });
  },

  removeObject: (id) => {
    const remaining = get().objects.filter((obj) => obj.id !== id);
    const newHistory = get().history.slice(0, get().historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(remaining)));

    set({
      objects: remaining,
      selectedObjectId: get().selectedObjectId === id ? null : get().selectedObjectId,
      history: newHistory,
      historyIndex: newHistory.length - 1
    });

    useSimulationStore.getState().addCaption({
      text: `Removed object from viewport.`,
      category: 'kinematics',
      severity: 'info'
    });
  },

  loadPreset: (presetId) => {
    const preset = SCENE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const simStore = useSimulationStore.getState();
    simStore.resetSimulation();
    simStore.setGravity(preset.gravity);
    simStore.setActivePresetId(presetId);
    simStore.addCaption({
      text: preset.initialCaption,
      latex: preset.formula,
      category: 'dynamics',
      severity: 'highlight'
    });

    const newObjs = JSON.parse(JSON.stringify(preset.objects));
    set({
      objects: newObjs,
      selectedObjectId: newObjs[1]?.id || newObjs[0]?.id || null,
      history: [JSON.parse(JSON.stringify(newObjs))],
      historyIndex: 0
    });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      set({
        objects: JSON.parse(JSON.stringify(prev)),
        historyIndex: historyIndex - 1
      });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      set({
        objects: JSON.parse(JSON.stringify(next)),
        historyIndex: historyIndex + 1
      });
    }
  },

  saveToLocalStorage: () => {
    try {
      const sceneData = {
        objects: get().objects,
        gravity: useSimulationStore.getState().gravity,
        timestamp: Date.now()
      };
      localStorage.setItem('phyzo_scene_backup', JSON.stringify(sceneData));
      useSimulationStore.getState().addCaption({
        text: 'Scene state saved to local storage.',
        category: 'dynamics',
        severity: 'info'
      });
    } catch (e) {
      console.error(e);
    }
  },

  loadFromLocalStorage: () => {
    try {
      const raw = localStorage.getItem('phyzo_scene_backup');
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.objects)) {
        useSimulationStore.getState().resetSimulation();
        if (data.gravity) {
          useSimulationStore.getState().setGravity(data.gravity);
        }
        set({
          objects: data.objects,
          selectedObjectId: data.objects[0]?.id || null,
          history: [JSON.parse(JSON.stringify(data.objects))],
          historyIndex: 0
        });
        useSimulationStore.getState().addCaption({
          text: 'Scene state restored from local storage.',
          category: 'dynamics',
          severity: 'info'
        });
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  },

  exportSceneJSON: () => {
    const exportData = {
      version: '1.0',
      appName: 'Phyzo Physics Sandbox',
      timestamp: new Date().toISOString(),
      gravity: useSimulationStore.getState().gravity,
      objects: get().objects
    };
    return JSON.stringify(exportData, null, 2);
  },

  importSceneJSON: (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data && Array.isArray(data.objects)) {
        useSimulationStore.getState().resetSimulation();
        if (data.gravity) {
          useSimulationStore.getState().setGravity(data.gravity);
        }
        set({
          objects: data.objects,
          selectedObjectId: data.objects[0]?.id || null,
          history: [JSON.parse(JSON.stringify(data.objects))],
          historyIndex: 0
        });
        useSimulationStore.getState().addCaption({
          text: 'External scene imported successfully.',
          category: 'dynamics',
          severity: 'highlight'
        });
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }
}));
