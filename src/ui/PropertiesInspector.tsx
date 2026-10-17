import React, { useState } from 'react';
import { useSceneStore } from '../core/useSceneStore';
import { useSimulationStore } from '../core/useSimulationStore';
import { ObjectType, PhysicsDomain } from '../physics/types';
import { wavelengthToRGB } from '../physics/opticsSolver';
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
  Anchor,
  Sun,
  Zap,
  Sparkles,
  Eye,
  Disc,
  Triangle,
  Flame,
  Atom
} from 'lucide-react';

export const PropertiesInspector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<PhysicsDomain>('mechanics');

  const objects = useSceneStore((state) => state.objects);
  const selectedObjectId = useSceneStore((state) => state.selectedObjectId);
  const selectObject = useSceneStore((state) => state.selectObject);
  const updateObject = useSceneStore((state) => state.updateObject);
  const removeObject = useSceneStore((state) => state.removeObject);
  const addObject = useSceneStore((state) => state.addObject);
  const isPlaying = useSimulationStore((state) => state.isPlaying);

  const selectedObj = objects.find((o) => o.id === selectedObjectId);

  const mechanicsPalette = [
    { type: 'sphere', label: 'Sphere', icon: Circle, color: '#DD0200' },
    { type: 'cube', label: 'Cube', icon: Square, color: '#F0E6D8' },
    { type: 'ramp', label: 'Ramp', icon: TrendingDown, color: '#6F7F5F' },
    { type: 'cannon', label: 'Cannon', icon: Crosshair, color: '#7D4047' },
    { type: 'spring', label: 'Spring', icon: Waves, color: '#19E3F5' },
    { type: 'pendulum', label: 'Pendulum', icon: Anchor, color: '#B5543A' }
  ];

  const opticsPalette = [
    { type: 'convex_lens', label: 'Convex Lens', icon: Eye, color: '#19E3F5' },
    { type: 'concave_lens', label: 'Concave Lens', icon: Eye, color: '#38BDF8' },
    { type: 'prism', label: 'Prism', icon: Triangle, color: '#A855F7' },
    { type: 'flat_mirror', label: 'Plane Mirror', icon: Square, color: '#FFFFFF' },
    { type: 'curved_mirror', label: 'Curved Mirror', icon: Disc, color: '#CBD5E1' },
    { type: 'laser_emitter', label: 'Laser', icon: Zap, color: '#EF4444' },
    { type: 'white_light_emitter', label: 'White Light', icon: Sun, color: '#F0E6D8' }
  ];

  const isOpticsType = (type?: string) =>
    type &&
    [
      'convex_lens',
      'concave_lens',
      'prism',
      'flat_mirror',
      'curved_mirror',
      'laser_emitter',
      'white_light_emitter'
    ].includes(type);

  return (
    <div
      className={`absolute top-20 right-4 glass-panel rounded-2xl shadow-glass border border-greige-border pointer-events-auto transition-all duration-300 z-30 flex ${
        isOpen ? 'w-84' : 'w-12'
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
          {/* Domain Tabs */}
          <div>
            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/5 text-[11px] font-mono mb-2">
              <button
                onClick={() => setActiveTab('mechanics')}
                className={`flex-1 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                  activeTab === 'mechanics'
                    ? 'bg-white/15 text-[#19E3F5] font-semibold'
                    : 'text-limestone-muted hover:text-limestone'
                }`}
              >
                <span>Mechanics</span>
              </button>
              <button
                onClick={() => setActiveTab('optics')}
                className={`flex-1 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                  activeTab === 'optics'
                    ? 'bg-white/15 text-[#19E3F5] font-semibold'
                    : 'text-limestone-muted hover:text-limestone'
                }`}
              >
                <span>Optics</span>
              </button>
            </div>

            {/* Spawn Palette */}
            <div className="text-[10px] uppercase font-mono tracking-wider text-limestone-muted mb-2 flex items-center justify-between">
              <span>Spawn {activeTab === 'optics' ? 'Optics' : 'Mechanics'} Object</span>
              <Plus className="w-3.5 h-3.5 text-[#19E3F5]" />
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(activeTab === 'optics' ? opticsPalette : mechanicsPalette).map(
                ({ type, label, icon: Icon, color }) => (
                  <button
                    key={type}
                    onClick={() => addObject(type as ObjectType)}
                    className="p-2 rounded-xl bg-black/25 hover:bg-black/40 border border-white/5 flex flex-col items-center gap-1 text-[11px] font-mono text-limestone transition-all hover:scale-[1.02]"
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                    <span className="truncate max-w-full text-center">{label}</span>
                  </button>
                )
              )}
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
                    Type: {selectedObj.type.replace('_', ' ')}
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

              {/* OPTICS PROPERTIES */}
              {isOpticsType(selectedObj.type) ? (
                <div className="space-y-3 bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <div className="text-[10px] font-mono uppercase text-[#19E3F5] tracking-wider">
                    Optical Parameters
                  </div>

                  {/* Focal Length (Lenses) */}
                  {(selectedObj.type === 'convex_lens' || selectedObj.type === 'concave_lens') && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-limestone-muted">Focal Length (f)</span>
                        <span className="text-limestone font-bold">
                          {(selectedObj.focalLength || 3.5).toFixed(1)} m
                        </span>
                      </div>
                      <input
                        type="range"
                        min={selectedObj.type === 'concave_lens' ? -10.0 : 1.0}
                        max={selectedObj.type === 'concave_lens' ? -1.0 : 10.0}
                        step="0.2"
                        value={selectedObj.focalLength || (selectedObj.type === 'concave_lens' ? -3.5 : 3.5)}
                        onChange={(e) =>
                          updateObject(selectedObj.id, { focalLength: parseFloat(e.target.value) })
                        }
                        className="w-full accent-[#19E3F5] cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Refractive Index (Lenses & Prism) */}
                  {(selectedObj.type === 'convex_lens' ||
                    selectedObj.type === 'concave_lens' ||
                    selectedObj.type === 'prism') && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-limestone-muted">Refractive Index (n)</span>
                        <span className="text-limestone font-bold">
                          {(selectedObj.refractiveIndex || 1.52).toFixed(3)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1.1"
                        max="2.4"
                        step="0.01"
                        value={selectedObj.refractiveIndex || 1.52}
                        onChange={(e) =>
                          updateObject(selectedObj.id, {
                            refractiveIndex: parseFloat(e.target.value)
                          })
                        }
                        className="w-full accent-olive cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Cauchy Dispersion Coefficient (Prism) */}
                  {selectedObj.type === 'prism' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-limestone-muted">Cauchy Dispersion (B)</span>
                        <span className="text-limestone font-bold">
                          {(selectedObj.cauchyB || 0.005).toFixed(4)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.001"
                        max="0.015"
                        step="0.0005"
                        value={selectedObj.cauchyB || 0.005}
                        onChange={(e) =>
                          updateObject(selectedObj.id, { cauchyB: parseFloat(e.target.value) })
                        }
                        className="w-full accent-purple-400 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Spherical Mirror Radius */}
                  {selectedObj.type === 'curved_mirror' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-limestone-muted">Curvature Radius (R)</span>
                        <span className="text-limestone font-bold">
                          {(selectedObj.mirrorRadius || 6.0).toFixed(1)} m
                        </span>
                      </div>
                      <input
                        type="range"
                        min="2.0"
                        max="15.0"
                        step="0.5"
                        value={selectedObj.mirrorRadius || 6.0}
                        onChange={(e) =>
                          updateObject(selectedObj.id, { mirrorRadius: parseFloat(e.target.value) })
                        }
                        className="w-full accent-[#19E3F5] cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Laser Emitter Wavelength & Color */}
                  {selectedObj.type === 'laser_emitter' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-limestone-muted">Wavelength (λ)</span>
                        <span className="font-bold flex items-center gap-1.5" style={{ color: selectedObj.color || '#19E3F5' }}>
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: selectedObj.color || '#19E3F5' }} />
                          {selectedObj.beamWavelength || 532} nm
                        </span>
                      </div>
                      <input
                        type="range"
                        min="380"
                        max="750"
                        step="5"
                        value={selectedObj.beamWavelength || 532}
                        onChange={(e) => {
                          const w = parseFloat(e.target.value);
                          updateObject(selectedObj.id, {
                            beamWavelength: w,
                            color: wavelengthToRGB(w)
                          });
                        }}
                        className="w-full cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Beam Spread & Ray Count */}
                  {(selectedObj.type === 'laser_emitter' || selectedObj.type === 'white_light_emitter') && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-limestone-muted">Beam Spread Angle</span>
                          <span className="text-limestone font-bold">
                            {(selectedObj.beamSpread || 1.0).toFixed(1)}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="15.0"
                          step="0.2"
                          value={selectedObj.beamSpread || 1.0}
                          onChange={(e) =>
                            updateObject(selectedObj.id, { beamSpread: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#19E3F5] cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-limestone-muted">Ray Paths</span>
                          <span className="text-limestone font-bold">{selectedObj.rayCount || 5}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="15"
                          step="2"
                          value={selectedObj.rayCount || 5}
                          onChange={(e) =>
                            updateObject(selectedObj.id, { rayCount: parseInt(e.target.value) })
                          }
                          className="w-full accent-olive cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* MECHANICS PROPERTIES */
                <>
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
                      className="w-full accent-racing-red cursor-pointer"
                    />
                  </div>

                  {/* Spring Parameters */}
                  {selectedObj.type === 'spring' && (
                    <div className="space-y-3 bg-black/20 p-2.5 rounded-xl border border-white/5">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-limestone-muted">Spring Constant (k)</span>
                          <span className="text-limestone font-bold">{selectedObj.springK || 30} N/m</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          step="5"
                          value={selectedObj.springK || 30}
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

                  {/* Pendulum Parameters */}
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
                          className="w-full accent-[#19E3F5] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Color Swatch */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-limestone-muted">Accent Color</span>
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
