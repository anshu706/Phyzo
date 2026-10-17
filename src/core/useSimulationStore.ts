import { create } from 'zustand';
import { LiveTelemetry, CaptionEvent } from '../physics/types';

interface SimulationState {
  isPlaying: boolean;
  timeScale: number;
  simulationTime: number;
  gravity: [number, number, number];
  explainLens: boolean;
  showGrid: boolean;
  showEnergyHud: boolean;
  showMathOverlay: boolean;
  showCaptions: boolean;
  showGhostTrails: boolean;
  activePresetId: string;
  telemetry: Record<string, LiveTelemetry>;
  captions: CaptionEvent[];
  
  // Actions
  togglePlay: () => void;
  setIsPlaying: (val: boolean) => void;
  setTimeScale: (scale: number) => void;
  stepSimulation: (delta?: number) => void;
  resetSimulation: () => void;
  setGravity: (g: [number, number, number]) => void;
  toggleExplainLens: () => void;
  toggleGrid: () => void;
  toggleEnergyHud: () => void;
  toggleMathOverlay: () => void;
  toggleCaptions: () => void;
  toggleGhostTrails: () => void;
  setActivePresetId: (id: string) => void;
  updateTelemetry: (id: string, data: LiveTelemetry) => void;
  addCaption: (event: Omit<CaptionEvent, 'id' | 'timestamp'>) => void;
  clearCaptions: () => void;
  resetKey: number; // incremented to force physics re-mount
}

export const useSimulationStore = create<SimulationState>((set) => ({
  isPlaying: false,
  timeScale: 1.0,
  simulationTime: 0,
  gravity: [0, -9.81, 0],
  explainLens: true,
  showGrid: true,
  showEnergyHud: true,
  showMathOverlay: true,
  showCaptions: true,
  showGhostTrails: true,
  activePresetId: 'projectile-launcher',
  telemetry: {},
  captions: [
    {
      id: 'cap-initial',
      timestamp: Date.now(),
      text: 'Physics Sandbox ready. Select an object or preset to inspect real-time forces and equations.',
      category: 'kinematics',
      severity: 'info'
    }
  ],
  resetKey: 0,

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setTimeScale: (timeScale) => set({ timeScale }),
  
  stepSimulation: (delta = 0.016) => set((state) => ({
    simulationTime: state.simulationTime + delta * state.timeScale
  })),

  resetSimulation: () => set((state) => ({
    isPlaying: false,
    simulationTime: 0,
    resetKey: state.resetKey + 1,
    telemetry: {}
  })),

  setGravity: (gravity) => set({ gravity }),
  toggleExplainLens: () => set((state) => ({ explainLens: !state.explainLens })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleEnergyHud: () => set((state) => ({ showEnergyHud: !state.showEnergyHud })),
  toggleMathOverlay: () => set((state) => ({ showMathOverlay: !state.showMathOverlay })),
  toggleCaptions: () => set((state) => ({ showCaptions: !state.showCaptions })),
  toggleGhostTrails: () => set((state) => ({ showGhostTrails: !state.showGhostTrails })),
  setActivePresetId: (activePresetId) => set({ activePresetId }),
  
  updateTelemetry: (id, data) => set((state) => ({
    telemetry: {
      ...state.telemetry,
      [id]: data
    }
  })),

  addCaption: (event) => set((state) => {
    // Keep max 8 latest captions for performance
    const newCaption: CaptionEvent = {
      ...event,
      id: `cap-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now()
    };
    return {
      captions: [newCaption, ...state.captions].slice(0, 8)
    };
  }),

  clearCaptions: () => set({ captions: [] })
}));
