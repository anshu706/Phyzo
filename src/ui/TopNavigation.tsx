import React, { useState, useRef } from 'react';
import { useSceneStore } from '../core/useSceneStore';
import { useSimulationStore } from '../core/useSimulationStore';
import { SCENE_PRESETS } from '../physics/presets';
import { CameraPreset } from '../physics/types';
import {
  Move,
  RotateCw,
  Maximize2,
  Grid,
  Undo2,
  Redo2,
  Save,
  Download,
  Upload,
  Camera,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';

export const TopNavigation: React.FC = () => {
  const objects = useSceneStore((state) => state.objects);
  const transformMode = useSceneStore((state) => state.transformMode);
  const setTransformMode = useSceneStore((state) => state.setTransformMode);
  const snapToGrid = useSceneStore((state) => state.snapToGrid);
  const toggleSnapToGrid = useSceneStore((state) => state.toggleSnapToGrid);
  const cameraPreset = useSceneStore((state) => state.cameraPreset);
  const setCameraPreset = useSceneStore((state) => state.setCameraPreset);
  const loadPreset = useSceneStore((state) => state.loadPreset);
  const undo = useSceneStore((state) => state.undo);
  const redo = useSceneStore((state) => state.redo);
  const saveToLocalStorage = useSceneStore((state) => state.saveToLocalStorage);
  const loadFromLocalStorage = useSceneStore((state) => state.loadFromLocalStorage);
  const exportSceneJSON = useSceneStore((state) => state.exportSceneJSON);
  const importSceneJSON = useSceneStore((state) => state.importSceneJSON);

  const activePresetId = useSimulationStore((state) => state.activePresetId);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportSceneJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phyzo-scene-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importSceneJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="absolute top-4 left-4 right-4 h-14 glass-panel rounded-2xl px-4 flex items-center justify-between shadow-glass border border-greige-border pointer-events-auto z-40 select-none">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <img src="/logo-icon.png" alt="Phyzo Icon" className="w-8 h-8 object-contain rounded-lg drop-shadow-[0_0_8px_rgba(25,227,245,0.4)]" />
          <div className="flex flex-col">
            <span className="font-display font-bold text-base tracking-wide text-limestone">
              PHYZO
            </span>
            <span className="text-[10px] font-mono text-limestone-muted -mt-1 hidden sm:inline">
              See physics. Build physics.
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-white/10 hidden md:block" />

        {/* Scene Presets Selector */}
        <div className="relative">
          <button
            onClick={() => setShowPresetMenu(!showPresetMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/25 hover:bg-black/40 border border-white/10 text-xs font-mono text-limestone transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-[#19E3F5]" />
            <span className="font-medium truncate max-w-[150px] sm:max-w-none">
              {SCENE_PRESETS.find((p) => p.id === activePresetId)?.title || 'Select Preset'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-limestone-muted" />
          </button>

          {showPresetMenu && (
            <div className="absolute top-full left-0 mt-2 w-80 glass-panel rounded-xl p-2 shadow-glass border border-greige-border z-50 max-h-96 overflow-y-auto">
              {/* Mechanics Presets */}
              <div className="px-2 py-1 text-[10px] uppercase font-mono text-[#19E3F5] font-semibold flex items-center justify-between">
                <span>Mechanics Presets</span>
                <span className="text-limestone-muted text-[9px]">Newtonian</span>
              </div>
              <div className="space-y-0.5 mt-0.5 mb-2">
                {SCENE_PRESETS.filter((p) =>
                  ['projectile-launcher', 'inclined-plane', 'harmonic-spring', 'simple-pendulum', 'free-fall'].includes(p.id)
                ).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      loadPreset(preset.id);
                      setShowPresetMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                      activePresetId === preset.id
                        ? 'bg-[#19E3F5]/15 text-[#19E3F5] font-semibold'
                        : 'text-limestone hover:bg-white/10'
                    }`}
                  >
                    <span>{preset.title}</span>
                    {activePresetId === preset.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#19E3F5]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Optics & Wave Presets */}
              <div className="px-2 py-1 text-[10px] uppercase font-mono text-purple-400 font-semibold flex items-center justify-between border-t border-white/5 pt-2">
                <span>Optics & Waves</span>
                <span className="text-limestone-muted text-[9px]">Geometric & Physical</span>
              </div>
              <div className="space-y-0.5 mt-0.5">
                {SCENE_PRESETS.filter((p) =>
                  ['thin-lens-imaging', 'prism-dispersion', 'tir-reflection', 'concave-mirror'].includes(p.id)
                ).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      loadPreset(preset.id);
                      setShowPresetMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                      activePresetId === preset.id
                        ? 'bg-[#19E3F5]/15 text-[#19E3F5] font-semibold'
                        : 'text-limestone hover:bg-white/10'
                    }`}
                  >
                    <span>{preset.title}</span>
                    {activePresetId === preset.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#19E3F5]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Tools: Transform Manipulators & Camera Views */}
      <div className="flex items-center gap-2">
        {/* Transform Modes */}
        <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setTransformMode('translate')}
            className={`p-1.5 rounded-lg transition-colors ${
              transformMode === 'translate'
                ? 'bg-white/15 text-[#19E3F5]'
                : 'text-limestone-muted hover:text-limestone'
            }`}
            title="Translate Gizmo (Move)"
          >
            <Move className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTransformMode('rotate')}
            className={`p-1.5 rounded-lg transition-colors ${
              transformMode === 'rotate'
                ? 'bg-white/15 text-[#19E3F5]'
                : 'text-limestone-muted hover:text-limestone'
            }`}
            title="Rotate Gizmo"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTransformMode('scale')}
            className={`p-1.5 rounded-lg transition-colors ${
              transformMode === 'scale'
                ? 'bg-white/15 text-[#19E3F5]'
                : 'text-limestone-muted hover:text-limestone'
            }`}
            title="Scale Gizmo"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Snap to Grid */}
        <button
          onClick={toggleSnapToGrid}
          className={`p-2 rounded-xl border transition-all text-xs font-mono flex items-center gap-1.5 ${
            snapToGrid
              ? 'bg-[#19E3F5]/15 text-[#19E3F5] border-[#19E3F5]/40'
              : 'text-limestone-muted border-transparent hover:text-limestone hover:bg-white/5'
          }`}
          title="Snap to Grid (0.5m)"
        >
          <Grid className="w-4 h-4" />
          <span className="hidden md:inline text-[11px]">Snap</span>
        </button>

        <div className="h-5 w-px bg-white/10 hidden sm:block" />

        {/* Camera Views */}
        <div className="hidden sm:flex items-center bg-black/30 p-1 rounded-xl border border-white/5 text-[11px] font-mono">
          {(['default', 'top', 'side', 'front', 'isometric'] as CameraPreset[]).map((cam) => (
            <button
              key={cam}
              onClick={() => setCameraPreset(cam)}
              className={`px-2 py-1 rounded-lg capitalize transition-colors ${
                cameraPreset === cam
                  ? 'bg-white/15 text-limestone font-semibold'
                  : 'text-limestone-muted hover:text-limestone'
              }`}
            >
              {cam === 'default' ? '3D' : cam}
            </button>
          ))}
        </div>
      </div>

      {/* Right Tools: Undo/Redo & Save/Export */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={undo}
          className="p-2 rounded-xl text-limestone-muted hover:text-limestone hover:bg-white/5 transition-colors"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          className="p-2 rounded-xl text-limestone-muted hover:text-limestone hover:bg-white/5 transition-colors"
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block" />

        <button
          onClick={saveToLocalStorage}
          className="p-2 rounded-xl text-limestone-muted hover:text-limestone hover:bg-white/5 transition-colors"
          title="Save Scene to Local Storage"
        >
          <Save className="w-4 h-4" />
        </button>

        <button
          onClick={handleExport}
          className="p-2 rounded-xl text-limestone-muted hover:text-limestone hover:bg-white/5 transition-colors"
          title="Export Scene JSON"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-xl text-limestone-muted hover:text-limestone hover:bg-white/5 transition-colors"
          title="Import Scene JSON"
        >
          <Upload className="w-4 h-4" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFile}
          accept=".json"
          className="hidden"
        />
      </div>
    </header>
  );
};
