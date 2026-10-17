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
        ) : activePresetId === 'electric-dipole' ? (
          <div className="space-y-2">
            {(() => {
              const q1 = 2.0;
              const q2 = -2.0;
              const d = 5.0; // distance between charges
              const k_e = 8.98755e9;
              const forceMicro = (k_e * (q1 * 1e-6) * (Math.abs(q2) * 1e-6)) / (d * d);

              return (
                <>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                      <span>Coulomb's Law (Attractive)</span>
                      <span className="text-rose-400 font-semibold">{forceMicro.toFixed(4)} N</span>
                    </div>
                    <KaTeXBlock math={`F_e = \\frac{1}{4\\pi\\varepsilon_0}\\frac{|q_1 q_2|}{r^2} = ${forceMicro.toFixed(4)}\\text{ N}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Gauss's Law for Electrostatics</div>
                    <KaTeXBlock math={`\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0}, \\quad \\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Electric Dipole Moment</div>
                    <KaTeXBlock math={`\\vec{p} = q \\vec{d} = (2.0\\,\\mu\\text{C})(5.0\\text{ m}) = 1.0\\times 10^{-5}\\text{ C}\\cdot\\text{m}`} />
                  </div>
                </>
              );
            })()}
          </div>
        ) : activePresetId === 'bar-magnet-field' ? (
          <div className="space-y-2">
            {(() => {
              const magnet = objects.find((o) => o.type === 'bar_magnet') || targetObj;
              const mMag = magnet?.magneticMoment || 18.0;

              return (
                <>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                      <span>Gauss's Law for Magnetism</span>
                      <span className="text-olive font-semibold">No Monopoles</span>
                    </div>
                    <KaTeXBlock math={`\\nabla \\cdot \\vec{B} = 0, \\quad \\oint \\vec{B} \\cdot d\\vec{A} = 0`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Dipole Moment Flux Field</div>
                    <KaTeXBlock math={`\\vec{B}(\\vec{r}) \\approx \\frac{\\mu_0}{4\\pi} \\left[ \\frac{3(\\vec{m}\\cdot\\hat{r})\\hat{r} - \\vec{m}}{r^3} \\right]`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">On-Axis Magnetic Field (r=2m)</div>
                    <KaTeXBlock math={`B_{axis} = \\frac{\\mu_0 m}{2\\pi r^3} = \\frac{(4\\pi\\times 10^{-7})(${mMag.toFixed(0)})}{2\\pi (8)} = ${( (4e-7 * mMag) / (2 * 8) * 1e6 ).toFixed(1)}\\,\\mu\\text{T}`} />
                  </div>
                </>
              );
            })()}
          </div>
        ) : activePresetId === 'lorentz-deflection' ? (
          <div className="space-y-2">
            {(() => {
              const fieldObj = objects.find((o) => o.type === 'uniform_field');
              const particle = objects.find((o) => o.type === 'charged_particle') || targetObj;
              const q = particle?.charge || 1.0;
              const v = Math.max(0.5, speed || 4.0);
              const B = Math.abs(fieldObj?.bFieldVector?.[2] || 1.5);
              const mPart = particle?.mass || 1.0;
              const rGyr = (mPart * v) / (Math.abs(q) * B);
              const omegaC = (Math.abs(q) * B) / mPart;

              return (
                <>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                      <span>Lorentz Force Vector Equation</span>
                      <span className="text-[#19E3F5] font-semibold">q = {q.toFixed(1)} C</span>
                    </div>
                    <KaTeXBlock math={`\\vec{F} = q(\\vec{E} + \\vec{v} \\times \\vec{B})`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Cyclotron Gyroradius</div>
                    <KaTeXBlock math={`r_{gyr} = \\frac{m v}{|q|B} = \\frac{(${mPart.toFixed(1)})(${v.toFixed(1)})}{(${Math.abs(q).toFixed(1)})(${B.toFixed(1)})} = ${rGyr.toFixed(2)}\\text{ m}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Cyclotron Angular Frequency</div>
                    <KaTeXBlock math={`\\omega_c = \\frac{|q|B}{m} = \\frac{(${Math.abs(q).toFixed(1)})(${B.toFixed(1)})}{${mPart.toFixed(1)}} = ${omegaC.toFixed(2)}\\text{ rad/s}`} />
                  </div>
                </>
              );
            })()}
          </div>
        ) : activePresetId === 'solenoid-biot-savart' ? (
          <div className="space-y-2">
            {(() => {
              const solenoid = objects.find((o) => o.type === 'solenoid') || targetObj;
              const I = solenoid?.current || 10.0;
              const N = solenoid?.turnsCount || 100;
              const L = 4.0; // length in meters
              const nTurns = N / L;
              const mu0 = 4 * Math.PI * 1e-7;
              const B_internal = mu0 * nTurns * I;

              return (
                <>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                      <span>Ampère's Law (Ideal Solenoid)</span>
                      <span className="text-amber-400 font-semibold">I = {I.toFixed(1)} A</span>
                    </div>
                    <KaTeXBlock math={`B = \\mu_0 n I = \\mu_0 \\left(\\frac{N}{L}\\right) I`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Internal Magnetic Flux Density</div>
                    <KaTeXBlock math={`B = (4\\pi\\times 10^{-7})(${nTurns.toFixed(0)})(${I.toFixed(0)}) = ${(B_internal * 1e3).toFixed(2)}\\text{ mT}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Biot-Savart Differential Law</div>
                    <KaTeXBlock math={`d\\vec{B} = \\frac{\\mu_0 I}{4\\pi} \\frac{d\\vec{\\ell} \\times \\hat{r}}{r^2}`} />
                  </div>
                </>
              );
            })()}
          </div>
        ) : activePresetId === 'gas-thermodynamics' ? (
          <div className="space-y-2">
            {(() => {
              const chamber = objects.find((o) => o.type === 'gas_chamber') || targetObj;
              const T = chamber?.temperature || 300;
              const N = chamber?.particleCount || 80;
              const V = 4 * 4 * 4; // 64 m^3
              const kB = 1.3806e-23;
              const P = (N * kB * T) / V;
              const vRms = Math.sqrt((3 * 1.0 * T) / 1.0); // scaled sim units

              return (
                <>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                      <span>Ideal Gas Law Equation</span>
                      <span className="text-emerald-400 font-semibold">T = {T} K</span>
                    </div>
                    <KaTeXBlock math={`PV = N k_B T \\implies P = \\frac{N k_B T}{V}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Root-Mean-Square Speed (v_rms)</div>
                    <KaTeXBlock math={`v_{rms} = \\sqrt{\\frac{3 k_B T}{m}} = ${vRms.toFixed(2)}\\text{ m/s}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Average Molecular Kinetic Energy</div>
                    <KaTeXBlock math={`\\langle K \\rangle = \\frac{3}{2} k_B T = \\frac{3}{2}(1.38\\times 10^{-23})(${T}) = ${(1.5 * kB * T * 1e21).toFixed(2)}\\times 10^{-21}\\text{ J}`} />
                  </div>
                </>
              );
            })()}
          </div>
        ) : activePresetId === 'photoelectric-effect' ? (
          <div className="space-y-2">
            {(() => {
              const photo = objects.find((o) => o.type === 'photoelectric_emitter') || targetObj;
              const freq = photo?.incidentPhotonFreq || 7.5e14;
              const phi = photo?.workFunction || 2.1;
              const h_eV = 4.135667e-15; // eV·s
              const E_photon = h_eV * freq;
              const keMax = Math.max(0, E_photon - phi);
              const vStop = keMax;

              return (
                <>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                      <span>Einstein Photoelectric Equation</span>
                      <span className="text-purple-400 font-semibold">{keMax > 0 ? 'Photoelectrons Ejected' : 'No Emission'}</span>
                    </div>
                    <KaTeXBlock math={`K_{max} = hf - \\Phi = ${E_photon.toFixed(2)} - ${phi.toFixed(2)} = ${keMax.toFixed(2)}\\text{ eV}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Incident Photon Energy</div>
                    <KaTeXBlock math={`E = hf = (${(freq / 1e14).toFixed(1)}\\times 10^{14}\\text{ Hz})h = ${E_photon.toFixed(2)}\\text{ eV}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Stopping Potential Voltage</div>
                    <KaTeXBlock math={`V_{stop} = \\frac{K_{max}}{e} = ${vStop.toFixed(2)}\\text{ Volts}`} />
                  </div>
                </>
              );
            })()}
          </div>
        ) : activePresetId === 'hydrogen-orbital' ? (
          <div className="space-y-2">
            {(() => {
              const hAtom = objects.find((o) => o.type === 'hydrogen_atom') || targetObj;
              const n = hAtom?.quantumN || 2;
              const E_n = -13.6 / (n * n);
              const r_n = n * n; // in Bohr radii

              return (
                <>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                      <span>Bohr Energy Quantization</span>
                      <span className="text-[#19E3F5] font-semibold">n = {n}</span>
                    </div>
                    <KaTeXBlock math={`E_n = -\\frac{13.6\\text{ eV}}{n^2} = -\\frac{13.6}{${n}^2} = ${E_n.toFixed(2)}\\text{ eV}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Quantized Orbital Radius</div>
                    <KaTeXBlock math={`r_n = n^2 a_0 = ${n}^2(0.529\\text{ Å}) = ${(r_n * 0.529).toFixed(2)}\\text{ Å}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Lyman Transition Emission (n → 1)</div>
                    <KaTeXBlock math={`\\Delta E = 13.6\\left(1 - \\frac{1}{${n}^2}\\right) = ${(13.6 * (1 - 1 / (n * n))).toFixed(2)}\\text{ eV}`} />
                  </div>
                </>
              );
            })()}
          </div>
        ) : activePresetId === 'quantum-infinite-well' ? (
          <div className="space-y-2">
            {(() => {
              const well = objects.find((o) => o.type === 'quantum_well') || targetObj;
              const n = well?.quantumN || 2;
              const L_nm = well?.wellWidth || 2.5;
              const L_m = L_nm * 1e-9;
              const h_p = 6.626e-34;
              const m_e = 9.109e-31;
              const E_joules = (n * n * h_p * h_p) / (8 * m_e * L_m * L_m);
              const E_eV = E_joules / 1.602e-19;

              return (
                <>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1 flex items-center justify-between">
                      <span>1D Schrödinger Time-Independent Eq</span>
                      <span className="text-emerald-400 font-semibold">n = {n}</span>
                    </div>
                    <KaTeXBlock math={`-\\frac{\\hbar^2}{2m}\\frac{d^2\\psi}{dx^2} = E\\psi`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Quantized Energy Eigenstate</div>
                    <KaTeXBlock math={`E_n = \\frac{n^2 h^2}{8mL^2} = \\frac{(${n})^2 h^2}{8m(${L_nm.toFixed(1)}\\text{nm})^2} = ${E_eV.toFixed(3)}\\text{ eV}`} />
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-limestone-muted mb-1">Normalized Standing Wave Function</div>
                    <KaTeXBlock math={`\\psi_n(x) = \\sqrt{\\frac{2}{L}}\\sin\\left(\\frac{${n}\\pi x}{L}\\right)`} />
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
