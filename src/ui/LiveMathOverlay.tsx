import React from 'react';
import { useSimulationStore } from '../core/useSimulationStore';
import { useSceneStore } from '../core/useSceneStore';
import { KaTeXBlock } from './KaTeXBlock';
import { Sigma, BookOpen, Layers } from 'lucide-react';
import { STANDARD_GRAVITY } from '../physics/solvers';

export const LiveMathOverlay: React.FC = () => {
  const showMathOverlay = useSimulationStore((state) => state.showMathOverlay);
  const activePresetId = useSimulationStore((state) => state.activePresetId);
  const telemetry = useSimulationStore((state) => state.telemetry);
  const selectedObjectId = useSceneStore((state) => state.selectedObjectId);
  const objects = useSceneStore((state) => state.objects);

  if (!showMathOverlay) return null;

  const targetObj = objects.find((o) => o.id === selectedObjectId) || objects.find((o) => !o.isStatic) || objects[0];
  const tel = targetObj ? telemetry[targetObj.id] : null;

  const m = targetObj?.mass || 2.0;
  const speed = tel?.speed || 0;
  const vy = tel?.velocity ? tel.velocity[1] : 0;
  const vx = tel?.velocity ? tel.velocity[0] : 0;
  const h = tel?.position ? Math.max(0, tel.position[1]) : 0;
  const ke = tel?.kineticEnergy || 0;
  const pe = tel?.potentialEnergy || 0;
  const fNetMag = tel?.forces?.net ? Math.sqrt(tel.forces.net[0]**2 + tel.forces.net[1]**2 + tel.forces.net[2]**2) : 0;

  return (
    <div className="absolute top-16 right-6 w-96 glass-panel rounded-xl p-4 shadow-glass border border-greige-border pointer-events-auto transition-all animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sigma className="w-4 h-4 text-[#19E3F5]" />
          <span className="text-xs uppercase tracking-wider font-mono font-semibold text-limestone">
            Live Math & SI Telemetry
          </span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-limestone-muted border border-white/5">
          {targetObj?.name || 'Formulas'}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {/* Contextual Formula Blocks based on Active Mechanics */}
        {activePresetId === 'projectile-launcher' ? (
          <div className="space-y-2">
            <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
              <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                <span>Horizontal Velocity (No Drag)</span>
                <span className="text-olive font-semibold">Constant</span>
              </div>
              <KaTeXBlock math={`v_x = v_0 \\cos\\theta = ${vx.toFixed(2)}\\text{ m/s}`} />
            </div>

            <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
              <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                <span>Vertical Kinematics</span>
                <span className="text-racing-red font-semibold">Accelerated</span>
              </div>
              <KaTeXBlock math={`v_y(t) = v_{y0} - gt = ${vy.toFixed(2)}\\text{ m/s}`} />
            </div>

            <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
              <div className="text-[10px] font-mono text-limestone-muted mb-1">Position Equation</div>
              <KaTeXBlock math={`y(t) = h_0 + v_{y0}t - \\frac{1}{2}gt^2 = ${h.toFixed(2)}\\text{ m}`} />
            </div>
          </div>
        ) : activePresetId === 'inclined-plane' ? (
          <div className="space-y-2">
            {(() => {
              const thetaDeg = targetObj?.rampAngle || 30;
              const thetaRad = (thetaDeg * Math.PI) / 180;
              const fNormal = m * STANDARD_GRAVITY * Math.cos(thetaRad);
              const fParallel = m * STANDARD_GRAVITY * Math.sin(thetaRad);
              const mu = targetObj?.material?.friction || 0.25;
              const fFriction = mu * fNormal;
              const aIncline = Math.max(0, (fParallel - fFriction) / m);

              return (
                <>
                  <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Normal Force</div>
                    <KaTeXBlock math={`N = mg\\cos(${thetaDeg}^\\circ) = ${fNormal.toFixed(1)}\\text{ N}`} />
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Downhill Driving Force</div>
                    <KaTeXBlock math={`F_\\parallel = mg\\sin(${thetaDeg}^\\circ) = ${fParallel.toFixed(1)}\\text{ N}`} />
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Kinetic Friction & Accel</div>
                    <KaTeXBlock math={`f_k = \\mu_k N = ${fFriction.toFixed(1)}\\text{ N}, \\quad a = ${aIncline.toFixed(2)}\\text{ m/s}^2`} />
                  </div>
                </>
              );
            })()}
          </div>
        ) : activePresetId === 'harmonic-spring' ? (
          <div className="space-y-2">
            {(() => {
              const k = targetObj?.springK || 25;
              const omega0 = Math.sqrt(k / m);
              const period = (2 * Math.PI) / omega0;

              return (
                <>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Hooke's Law Restoring Force</div>
                    <KaTeXBlock math={`F_s = -k \\Delta x = ${fNetMag.toFixed(1)}\\text{ N}`} />
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Natural Angular Frequency</div>
                    <KaTeXBlock math={`\\omega_0 = \\sqrt{\\frac{k}{m}} = \\sqrt{\\frac{${k}}{${m}}} = ${omega0.toFixed(2)}\\text{ rad/s}`} />
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Oscillation Period</div>
                    <KaTeXBlock math={`T = \\frac{2\\pi}{\\omega_0} = ${period.toFixed(2)}\\text{ s}`} />
                  </div>
                </>
              );
            })()}
          </div>
        ) : activePresetId === 'simple-pendulum' ? (
          <div className="space-y-2">
            {(() => {
              const L = targetObj?.pendulumLength || 4.0;
              const period = 2 * Math.PI * Math.sqrt(L / STANDARD_GRAVITY);
              const omega = Math.sqrt(STANDARD_GRAVITY / L);

              return (
                <>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Pendulum Period (Small Angle)</div>
                    <KaTeXBlock math={`T = 2\\pi\\sqrt{\\frac{L}{g}} = 2\\pi\\sqrt{\\frac{${L.toFixed(1)}}{9.81}} = ${period.toFixed(2)}\\text{ s}`} />
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Angular Frequency</div>
                    <KaTeXBlock math={`\\omega = \\sqrt{\\frac{g}{L}} = ${omega.toFixed(2)}\\text{ rad/s}`} />
                  </div>
                </>
              );
            })()}
          </div>
        ) : activePresetId === 'thin-lens-imaging' ? (
          <div className="space-y-2">
            {(() => {
              const lens = objects.find((o) => o.type === 'convex_lens' || o.type === 'concave_lens') || targetObj;
              const emitter = objects.find((o) => o.type === 'laser_emitter' || o.type === 'white_light_emitter');
              const f = lens?.focalLength || 3.5;
              const dO = Math.max(0.1, Math.abs((lens?.position[0] || 0) - (emitter?.position[0] || -6)));
              const dI = (f * dO) / (dO - f);
              const mag = -dI / dO;
              const isReal = dI > 0;

              return (
                <>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                      <span>Gaussian Thin Lens Equation</span>
                      <span className="text-[#19E3F5] font-semibold">{isReal ? 'Real Image' : 'Virtual Image'}</span>
                    </div>
                    <KaTeXBlock math={`\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i} \\implies d_i = \\frac{f \\cdot d_o}{d_o - f}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Live Conjugate Distances</div>
                    <KaTeXBlock math={`d_o = ${dO.toFixed(2)}\\text{ m}, \\quad f = ${f.toFixed(2)}\\text{ m} \\implies d_i = ${dI.toFixed(2)}\\text{ m}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                      <span>Transverse Magnification</span>
                      <span className="text-olive font-semibold">{mag < 0 ? 'Inverted' : 'Upright'}</span>
                    </div>
                    <KaTeXBlock math={`M = -\\frac{d_i}{d_o} = -\\frac{${dI.toFixed(2)}}{${dO.toFixed(2)}} = ${mag.toFixed(2)}\\times`} />
                  </div>
                </>
              );
            })()}
          </div>
        ) : activePresetId === 'prism-dispersion' ? (
          <div className="space-y-2">
            {(() => {
              const prism = objects.find((o) => o.type === 'prism') || targetObj;
              const baseN = prism?.refractiveIndex || 1.52;
              const cauchyB = prism?.cauchyB || 0.005;
              const nRed = baseN + cauchyB / ((0.670)**2);
              const nViolet = baseN + cauchyB / ((0.415)**2);
              const deltaN = nViolet - nRed;

              return (
                <>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                      <span>Cauchy's Dispersion Equation</span>
                      <span className="text-[#19E3F5] font-semibold">Wave Dispersion</span>
                    </div>
                    <KaTeXBlock math={`n(\\lambda) = A + \\frac{B}{\\lambda^2}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Spectral Refractive Indices</div>
                    <KaTeXBlock math={`n_{\\text{red}}(670\\text{nm}) = ${nRed.toFixed(4)}, \\quad n_{\\text{viol}}(415\\text{nm}) = ${nViolet.toFixed(4)}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                      <span>Snell's Law of Refraction</span>
                      <span className="text-racing-red font-semibold">\\Delta n = {deltaN.toFixed(4)}</span>
                    </div>
                    <KaTeXBlock math={`n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2`} />
                  </div>
                </>
              );
            })()}
          </div>
        ) : activePresetId === 'tir-reflection' ? (
          <div className="space-y-2">
            {(() => {
              const nGlass = 1.52;
              const nAir = 1.0;
              const thetaCritRad = Math.asin(nAir / nGlass);
              const thetaCritDeg = (thetaCritRad * 180) / Math.PI;
              const thetaIncDeg = 45.0;

              return (
                <>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                      <span>Critical Angle Condition</span>
                      <span className="text-olive font-semibold">TIR Active</span>
                    </div>
                    <KaTeXBlock math={`\\theta_c = \\arcsin\\left(\\frac{n_2}{n_1}\\right) = \\arcsin\\left(\\frac{1.0}{${nGlass.toFixed(2)}}\\right) = ${thetaCritDeg.toFixed(1)}^\\circ`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Incident Angle Comparison</div>
                    <KaTeXBlock math={`\\theta_i = ${thetaIncDeg.toFixed(1)}^\\circ > \\theta_c (${thetaCritDeg.toFixed(1)}^\\circ) \\implies \\text{100\\% Reflection}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Law of Specular Reflection</div>
                    <KaTeXBlock math={`\\vec{r} = \\vec{d} - 2(\\vec{d}\\cdot\\hat{n})\\hat{n}, \\quad \\theta_r = \\theta_i = ${thetaIncDeg}^\\circ`} />
                  </div>
                </>
              );
            })()}
          </div>
        ) : activePresetId === 'concave-mirror' ? (
          <div className="space-y-2">
            {(() => {
              const R = 6.0;
              const f = R / 2;

              return (
                <>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                      <span>Spherical Mirror Focal Length</span>
                      <span className="text-[#19E3F5] font-semibold">Paraxial Focus</span>
                    </div>
                    <KaTeXBlock math={`f = \\frac{R}{2} = \\frac{${R.toFixed(1)}}{2} = ${f.toFixed(1)}\\text{ m}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Vector Reflection Ray Formula</div>
                    <KaTeXBlock math={`\\vec{r} = \\vec{v}_i - 2(\\vec{v}_i \\cdot \\hat{n})\\hat{n}`} />
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          /* General Newtonian Mechanics */
          <div className="space-y-2">
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <div className="text-[10px] font-mono text-limestone-muted mb-1">Work-Energy Theorem</div>
              <KaTeXBlock math={`KE = \\frac{1}{2}m v^2 = \\frac{1}{2}(${m})(${speed.toFixed(2)})^2 = ${ke.toFixed(1)}\\text{ J}`} />
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <div className="text-[10px] font-mono text-limestone-muted mb-1">Gravitational Potential Energy</div>
              <KaTeXBlock math={`PE = mgh = (${m})(9.81)(${h.toFixed(2)}) = ${pe.toFixed(1)}\\text{ J}`} />
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <div className="text-[10px] font-mono text-limestone-muted mb-1">Newton's 2nd Law</div>
              <KaTeXBlock math={`F_{net} = ma = ${fNetMag.toFixed(1)}\\text{ N}`} />
            </div>
          </div>
        )}

        {/* Live Vector Values Strip */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-limestone-muted">
          <span>|v|: <strong className="text-[#19E3F5]">{speed.toFixed(2)} m/s</strong></span>
          <span>|a|: <strong className="text-racing-red">{(fNetMag / Math.max(0.1, m)).toFixed(2)} m/s²</strong></span>
          <span>p: <strong className="text-olive">{(m * speed).toFixed(2)} kg·m/s</strong></span>
        </div>
      </div>
    </div>
  );
};
