import React, { useState } from 'react';
import { useSceneStore } from '../core/useSceneStore';
import { useSimulationStore } from '../core/useSimulationStore';
import { ObjectType } from '../physics/types';
import {
  Sliders,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Circle,
  Square,
  TrendingDown,
  Crosshair,
  Waves,
  Anchor
} from 'lucide-react';

export const PropertiesInspector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const objects = useSceneStore((state) => state.objects);
  const selectedObjectId = useSceneStore((state) => state.selectedObjectId);
  const selectObject = useSceneStore((state) => state.selectObject);
  const updateObject = useSceneStore((state) => state.updateObject);
  const removeObject = useSceneStore((state) => state.removeObject);
  const addObject = useSceneStore((state) => state.addObject);
  const isPlaying = useSimulationStore((state) => state.isPlaying);

  const selectedObj = objects.find((o) => o.id === selectedObjectId);

  return (
    <div
      className={`absolute top-20 right-4 glass-panel rounded-2xl shadow-glass border border-greige-border pointer-events-auto transition-all duration-300 z-30 flex ${
        isOpen ? 'w-80' : 'w-12'
      }`}
      style={{ maxHeight: 'calc(100vh - 160px)' }}
    >
      {/* Collapse Toggle Tab */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 flex flex-col items-center justify-start py-4 text-limestone-muted hover:text-limestone transition-colors border-r border-white/5"
        title={isOpen ? 'Collapse Panel' : 'Expand Properties'}
      >
        <Sliders className="w-4 h-4 mb-2 text-[#19E3F5]" />
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* Add Object Quick Palette */}
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-limestone-muted mb-2 flex items-center justify-between">
              <span>Spawn Mechanics Object</span>
              <Plus className="w-3.5 h-3.5 text-[#19E3F5]" />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { type: 'sphere', label: 'Sphere', icon: Circle, color: '#DD0200' },
                { type: 'cube', label: 'Cube', icon: Square, color: '#F0E6D8' },
                { type: 'ramp', label: 'Ramp', icon: TrendingDown, color: '#6F7F5F' },
                { type: 'cannon', label: 'Cannon', icon: Crosshair, color: '#7D4047' },
                { type: 'spring', label: 'Spring', icon: Waves, color: '#19E3F5' },
                { type: 'pendulum', label: 'Pendulum', icon: Anchor, color: '#B5543A' }
              ].map(({ type, label, icon: Icon, color }) => (
                <button
                  key={type}
                  onClick={() => addObject(type as ObjectType)}
                  className="p-2 rounded-xl bg-black/25 hover:bg-black/40 border border-white/5 flex flex-col items-center gap-1 text-[11px] font-mono text-limestone transition-all hover:scale-[1.02]"
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Selected Object Properties */}
          {selectedObj ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-limestone font-display">
                    {selectedObj.name}
                  </h3>
                  <span className="text-[10px] font-mono text-limestone-muted uppercase">
                    Type: {selectedObj.type}
                  </span>
                </div>
                <button
                  onClick={() => removeObject(selectedObj.id)}
                  className="p-1.5 rounded-lg text-racing-red hover:bg-racing-red/15 transition-colors"
                  title="Delete Object"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Mass (kg) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-limestone-muted">Mass (m)</span>
                  <span className="text-limestone font-bold">{selectedObj.mass.toFixed(1)} kg</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="50"
                  step="0.2"
                  value={selectedObj.mass}
                  onChange={(e) => updateObject(selectedObj.id, { mass: parseFloat(e.target.value) })}
                  className="w-full accent-[#19E3F5] cursor-pointer"
                />
              </div>

              {/* Friction (μ) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-limestone-muted">Friction (μ)</span>
                  <span className="text-limestone font-bold">{selectedObj.material.friction.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={selectedObj.material.friction}
                  onChange={(e) =>
                    updateObject(selectedObj.id, {
                      material: { ...selectedObj.material, friction: parseFloat(e.target.value) }
                    })
                  }
                  className="w-full accent-olive cursor-pointer"
                />
              </div>

              {/* Restitution / Bounciness (e) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-limestone-muted">Restitution (e)</span>
                  <span className="text-limestone font-bold">{selectedObj.material.restitution.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={selectedObj.material.restitution}
                  onChange={(e) =>
                    updateObject(selectedObj.id, {
                      material: { ...selectedObj.material, restitution: parseFloat(e.target.value) }
                    })
                  }
                  className="w-full accent-rosewood cursor-pointer"
                />
              </div>

              {/* Specific Parameters */}
              {selectedObj.type === 'ramp' && (
                <div className="space-y-1 bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-limestone-muted">Incline Angle (θ)</span>
                    <span className="text-limestone font-bold">{selectedObj.rampAngle || 30}°</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="75"
                    step="1"
                    value={selectedObj.rampAngle || 30}
                    onChange={(e) => {
                      const ang = parseFloat(e.target.value);
                      updateObject(selectedObj.id, {
                        rampAngle: ang,
                        rotation: [0, 0, (-ang * Math.PI) / 180]
                      });
                    }}
                    className="w-full accent-terracotta cursor-pointer"
                  />
                </div>
              )}

              {selectedObj.type === 'spring' && (
                <div className="space-y-3 bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-limestone-muted">Stiffness (k)</span>
                      <span className="text-limestone font-bold">{selectedObj.springK || 25} N/m</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={selectedObj.springK || 25}
                      onChange={(e) => updateObject(selectedObj.id, { springK: parseFloat(e.target.value) })}
                      className="w-full accent-[#19E3F5] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-limestone-muted">Damping (c)</span>
                      <span className="text-limestone font-bold">{selectedObj.damping || 0.15}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.05"
                      value={selectedObj.damping || 0.15}
                      onChange={(e) => updateObject(selectedObj.id, { damping: parseFloat(e.target.value) })}
                      className="w-full accent-olive cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {selectedObj.type === 'pendulum' && (
                <div className="space-y-3 bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-limestone-muted">Length (L)</span>
                      <span className="text-limestone font-bold">{(selectedObj.pendulumLength || 4).toFixed(1)} m</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="8.0"
                      step="0.2"
                      value={selectedObj.pendulumLength || 4}
                      onChange={(e) => updateObject(selectedObj.id, { pendulumLength: parseFloat(e.target.value) })}
                      className="w-full accent-rosewood cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-limestone-muted">Initial Angle (θ₀)</span>
                      <span className="text-limestone font-bold">{selectedObj.initialTheta || 35}°</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="80"
                      step="5"
                      value={selectedObj.initialTheta || 35}
                      onChange={(e) => updateObject(selectedObj.id, { initialTheta: parseFloat(e.target.value) })}
                      className="w-full accent-terracotta cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Initial Launch Velocity for Projectile Launcher */}
              {(selectedObj.type === 'cannon' || selectedObj.type === 'sphere') && (
                <div className="space-y-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <div className="text-[10px] font-mono uppercase text-limestone-muted">Initial Velocity (v₀)</div>
                  <div className="grid grid-cols-3 gap-2">
                    {['X', 'Y', 'Z'].map((axis, i) => (
                      <div key={axis} className="space-y-0.5">
                        <span className="text-[10px] font-mono text-limestone-muted">{axis}</span>
                        <input
                          type="number"
                          step="0.5"
                          disabled={isPlaying}
                          value={selectedObj.initialVelocity[i] || 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const newVel = [...selectedObj.initialVelocity] as [number, number, number];
                            newVel[i] = val;
                            updateObject(selectedObj.id, { initialVelocity: newVel });
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-xs font-mono text-limestone disabled:opacity-50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Swatch */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-limestone-muted">Material Accent</span>
                <div className="flex items-center gap-2">
                  {['#DD0200', '#6F7F5F', '#7D4047', '#B5543A', '#19E3F5', '#F0E6D8'].map((c) => (
                    <button
                      key={c}
                      onClick={() => updateObject(selectedObj.id, { color: c })}
                      className={`w-6 h-6 rounded-full border transition-all ${
                        selectedObj.color === c ? 'scale-110 border-white shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-limestone-muted">
              <Sliders className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#19E3F5]" />
              <p className="text-xs font-mono">No object selected</p>
              <p className="text-[11px] text-limestone-muted/70 mt-1">
                Click any 3D body or spawn one above to tweak parameters.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
