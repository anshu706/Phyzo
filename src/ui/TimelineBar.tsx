import React, { useEffect } from 'react';
import { useSimulationStore } from '../core/useSimulationStore';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Eye,
  EyeOff,
  Grid,
  Activity,
  Sigma,
  Zap,
  Clock,
  Compass
} from 'lucide-react';

export const TimelineBar: React.FC = () => {
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const timeScale = useSimulationStore((state) => state.timeScale);
  const simulationTime = useSimulationStore((state) => state.simulationTime);
  const explainLens = useSimulationStore((state) => state.explainLens);
  const showGrid = useSimulationStore((state) => state.showGrid);
  const showEnergyHud = useSimulationStore((state) => state.showEnergyHud);
  const showMathOverlay = useSimulationStore((state) => state.showMathOverlay);
  const showGhostTrails = useSimulationStore((state) => state.showGhostTrails);
  const gravity = useSimulationStore((state) => state.gravity);

  const togglePlay = useSimulationStore((state) => state.togglePlay);
  const setTimeScale = useSimulationStore((state) => state.setTimeScale);
  const stepSimulation = useSimulationStore((state) => state.stepSimulation);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);
  const toggleExplainLens = useSimulationStore((state) => state.toggleExplainLens);
  const toggleGrid = useSimulationStore((state) => state.toggleGrid);
  const toggleEnergyHud = useSimulationStore((state) => state.toggleEnergyHud);
  const toggleMathOverlay = useSimulationStore((state) => state.toggleMathOverlay);
  const toggleGhostTrails = useSimulationStore((state) => state.toggleGhostTrails);
  const setGravity = useSimulationStore((state) => state.setGravity);

  // Keyboard shortcut: Space for Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyR') {
        resetSimulation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, resetSimulation]);

  const hasGravity = gravity[1] !== 0;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel rounded-2xl px-5 py-3 shadow-glass border border-greige-border flex items-center gap-6 pointer-events-auto z-30 select-none">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        {/* Reset */}
        <button
          onClick={resetSimulation}
          className="p-2 rounded-xl text-limestone-muted hover:text-limestone hover:bg-white/10 transition-colors"
          title="Reset Simulation (R)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Play / Pause Primary Button */}
        <button
          onClick={togglePlay}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 font-mono text-xs font-semibold tracking-wider transition-all shadow-md ${
            isPlaying
              ? 'bg-racing-red text-white hover:bg-racing-red/90 shadow-red-glow'
              : 'bg-[#19E3F5] text-black hover:bg-[#19E3F5]/90 shadow-glass-glow'
          }`}
          title="Play / Pause (Space)"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>PLAY</span>
            </>
          )}
        </button>

        {/* Step Forward */}
        <button
          onClick={() => stepSimulation(0.04)}
          className="p-2 rounded-xl text-limestone-muted hover:text-limestone hover:bg-white/10 transition-colors"
          title="Step Forward"
        >
          <StepForward className="w-4 h-4" />
        </button>
      </div>

      <div className="h-6 w-px bg-white/10" />

      {/* Speed / Time Scale Picker */}
      <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
        {[0.25, 0.5, 1.0, 2.0].map((scale) => (
          <button
            key={scale}
            onClick={() => setTimeScale(scale)}
            className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all ${
              timeScale === scale
                ? 'bg-white/15 text-[#19E3F5] font-semibold border border-white/10'
                : 'text-limestone-muted hover:text-limestone'
            }`}
          >
            {scale}x
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-white/10" />

      {/* Time Counter */}
      <div className="flex items-center gap-1.5 font-mono text-xs text-limestone bg-black/25 px-2.5 py-1.5 rounded-xl border border-white/5">
        <Clock className="w-3.5 h-3.5 text-[#19E3F5]" />
        <span>t = {simulationTime.toFixed(2)}s</span>
      </div>

      <div className="h-6 w-px bg-white/10" />

      {/* Feature Toggles (Explain Lens, HUDs, Grid) */}
      <div className="flex items-center gap-2">
        {/* Explain Lens Toggle */}
        <button
          onClick={toggleExplainLens}
          className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-mono transition-all border ${
            explainLens
              ? 'bg-racing-red/20 text-white border-racing-red/60 shadow-red-glow'
              : 'bg-black/20 text-limestone-muted border-white/10 hover:text-limestone'
          }`}
          title="Toggle 3D Glowing Physics Vector Arrows"
        >
          <Zap className={`w-3.5 h-3.5 ${explainLens ? 'text-racing-red fill-current' : ''}`} />
          <span>Explain Lens</span>
        </button>

        {/* Energy HUD toggle */}
        <button
          onClick={toggleEnergyHud}
          className={`p-2 rounded-xl transition-all border ${
            showEnergyHud
              ? 'bg-olive/20 text-olive border-olive/50'
              : 'text-limestone-muted border-transparent hover:text-limestone'
          }`}
          title="Toggle Energy Spectrum HUD"
        >
          <Activity className="w-4 h-4" />
        </button>

        {/* Math overlay toggle */}
        <button
          onClick={toggleMathOverlay}
          className={`p-2 rounded-xl transition-all border ${
            showMathOverlay
              ? 'bg-[#19E3F5]/20 text-[#19E3F5] border-[#19E3F5]/50'
              : 'text-limestone-muted border-transparent hover:text-limestone'
          }`}
          title="Toggle Live Math Formula Overlay"
        >
          <Sigma className="w-4 h-4" />
        </button>

        {/* Ghost Trails toggle */}
        <button
          onClick={toggleGhostTrails}
          className={`p-2 rounded-xl transition-all border ${
            showGhostTrails
              ? 'bg-rosewood/30 text-limestone border-rosewood/60'
              : 'text-limestone-muted border-transparent hover:text-limestone'
          }`}
          title="Toggle Motion Ghost Trails"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Grid toggle */}
        <button
          onClick={toggleGrid}
          className={`p-2 rounded-xl transition-all border ${
            showGrid
              ? 'bg-white/10 text-limestone border-white/20'
              : 'text-limestone-muted border-transparent hover:text-limestone'
          }`}
          title="Toggle 3D Reference Floor Grid"
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Gravity toggle */}
        <button
          onClick={() => setGravity(hasGravity ? [0, 0, 0] : [0, -9.81, 0])}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all border ${
            hasGravity
              ? 'bg-terracotta/20 text-terracotta border-terracotta/50'
              : 'bg-black/20 text-limestone-muted border-white/10'
          }`}
          title="Toggle Gravity Field (9.81 m/s² vs 0)"
        >
          {hasGravity ? 'g = 9.81' : 'g = 0'}
        </button>
      </div>
    </div>
  );
};
