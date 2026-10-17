<div align="center">

  <img src="public/logo-icon.png" alt="Phyzo Logo" width="96" height="96" style="border-radius: 20px; box-shadow: 0 0 35px rgba(25, 227, 245, 0.4);" />

  # PHYZO
  ### *See physics. Build physics.*

  **An interactive, real-time 3D physics laboratory & simulation platform with live mathematical formula derivation and zero numerical drift.**

  <br />

  [![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
  [![Rapier 3D](https://img.shields.io/badge/Rapier_Physics-E04E39?style=for-the-badge&logo=rust&logoColor=white)](https://rapier.rs/)
  [![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![KaTeX](https://img.shields.io/badge/KaTeX-007A78?style=for-the-badge&logo=latex&logoColor=white)](https://katex.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

  <br />
  <br />

https://github.com/user-attachments/assets/a3dd6cf4-82bd-42cc-849f-1ede217b3a97

  <p align="center">
    <i>✨ Watch light refract through prisms, charged particles curve through magnetic fields, and quantum wavefunctions evolve in real-time.</i>
  </p>

</div>

---

## 🌟 Why Phyzo?

For centuries, physics education has forced students and researchers to imagine complex three-dimensional phenomena from static, flat chalkboard diagrams.

**Phyzo changes that.** It provides a luminous, dark-obsidian 3D simulation sandbox where every phenomenon—from classical ballistic trajectories to quantum atomic orbitals—is evaluated live in real-time. As objects collide, lasers refract, and fields exert force, **live KaTeX mathematical cards dynamically substitute active numerical variables frame-by-frame**, connecting abstract theory to visual intuition.

---

## 🔬 Four Physics Disciplines in One Sandbox

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>1. 🪐 Classical Mechanics & Collisions</h3>
      <ul>
        <li><b>Rigid Body Dynamics:</b> Full 3D contact solvers powered by the Rapier physics engine.</li>
        <li><b>Ballistics & Projectiles:</b> Parabolic motion with real-time vector arrow decomposition.</li>
        <li><b>Elastic & Inelastic Collisions:</b> Momentum and mechanical energy conservation with variable restitution ($e$).</li>
        <li><b>Harmonic Oscillators:</b> Hooke's Law spring-mass systems and variable-length gravity pendulums.</li>
        <li><b>Inclined Planes:</b> Dynamic friction decomposition into normal force ($N$) and kinetic friction ($f_k = \mu_k N$).</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>2. 🌈 Wave Phenomena & Geometric Optics</h3>
      <ul>
        <li><b>Snell-Descartes Law:</b> High-precision ray tracing with automatic boundary refraction and angle calculation.</li>
        <li><b>Prism Chromatic Dispersion:</b> Cauchy equation $n(\lambda) = A + \frac{B}{\lambda^2}$ splitting white light into the full visible rainbow spectrum (400nm - 700nm).</li>
        <li><b>Total Internal Reflection (TIR):</b> Automatic critical angle computation ($\theta_c = \arcsin(n_2/n_1)$) and 100% lossless specular internal bounces.</li>
        <li><b>Optical Elements:</b> Biconvex/concave lenses, spherical mirrors, multi-wavelength laser emitters, and collimated beams.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>3. ⚡ Electromagnetism & Field Dynamics</h3>
      <ul>
        <li><b>Lorentz Force Integration:</b> Continuous particle trajectory solver:
          <br />$$\vec{F} = q(\vec{E} + \vec{v} \times \vec{B})$$
        </li>
        <li><b>Cyclotron Gyration:</b> Dynamic orbital radius computation ($r_{gyr} = \frac{mv_\perp}{|q|B}$) and gyromagnetic frequencies.</li>
        <li><b>Vector Field Lines:</b> Luminous 3D vector arrows mapping field direction and intensity.</li>
        <li><b>EM Tools:</b> Positive/negative point charges, permanent bar magnets, helical current-carrying solenoids, and uniform field zones.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>4. ⚛️ Modern Physics & Quantum Mechanics</h3>
      <ul>
        <li><b>Hydrogen Atom Bohr Orbitals:</b> 3D volumetric wavefunctions $\psi_{nlm}(r, \theta, \phi)$ and electron probability density clouds ($|\psi|^2$).</li>
        <li><b>1D Infinite Potential Well:</b> Quantized energy eigenstates ($E_n = \frac{n^2 h^2}{8mL^2}$) and standing de Broglie matter waves.</li>
        <li><b>Einstein Photoelectric Effect:</b> Work function threshold ($\Phi$) and kinetic energy release ($E_k = hf - \Phi$).</li>
        <li><b>Gas Thermodynamics:</b> Maxwell-Boltzmann speed distributions with elastic wall collisions.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🧮 Live KaTeX Equation Engine

Phyzo doesn't just show static formulas. When you manipulate elements or run the simulation:
- **Per-Frame Numerical Substitution:** Formulas update their variables with live physics parameters.
- **Dynamic Derivations:** Observe how changes in velocity, mass, charge, or refractive index directly alter the resulting equation outputs.
- **LaTeX Precision:** Rendered via KaTeX for crisp mathematical typography.

```
       [ Velocity: v = 4.00 m/s ]   [ B-Field: B = 1.50 T ]
                             │
                             ▼
           F = q(E + v × B) ───► |F_net| = 6.00 N (Orthogonal)
           r_gyr = mv / qB  ───► r = 2.67 m (Cyclotron Radius)
```

---

## 📊 Real-Time Energy Conservation HUD

Phyzo features a live telemetry HUD that tracks mechanical energy conservation per frame:
- **Kinetic Energy ($KE = \frac{1}{2}mv^2$)**: Real-time gauge tracking kinetic energy.
- **Potential Energy ($PE = mgh$, Elastic, Coulomb)**: Gauge tracking potential energy storage.
- **Total Mechanical Energy ($E_{total} = KE + PE$)**: Proves conservation with $\Delta E = 0.000\%$ drift via high-order symplectic Runge-Kutta numerical integration.

---

## 🎮 Interactive Controls & Shortcuts

| Action | Control | Description |
|---|---|---|
| **Play / Pause** | `[Space]` | Toggle real-time physics integration |
| **Reset Simulation** | `[R]` | Restore all objects to initial preset state |
| **Orbit Camera** | `[Left Click + Drag]` | Rotate camera in 3D perspective space |
| **Pan Camera** | `[Right Click + Drag]` | Pan camera viewport horizontally and vertically |
| **Zoom** | `[Mouse Scroll]` | Zoom camera in and out |
| **Select Object** | `[Left Click]` | Inspect properties, masses, charges, and optical constants |
| **Transform Mode** | `[Top Bar]` | Switch between Translate, Rotate, and Scale gizmos |
| **Camera Presets** | `[Top Bar]` | Instant snap to Perspective, Top-Down, Front, or Side ortho views |

---

## 🛠️ Tech Stack & Architecture

Phyzo is built with a modern, high-performance web graphics stack:

- **Frontend Core:** [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **3D Graphics & Rendering:** [Three.js](https://threejs.org/) & [React Three Fiber (R3F)](https://docs.pmnd.rs/react-three-fiber/)
- **Post-Processing & Bloom:** [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) (Emissive laser glow and bloom shaders)
- **Physics Engine:** [@react-three/rapier](https://github.com/pmndrs/react-three-rapier) (Deterministic WebAssembly rigid-body physics)
- **Mathematical Typography:** [KaTeX](https://katex.org/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Separated Scene Store & High-Frequency Simulation Store)
- **Motion & UI:** [Framer Motion](https://www.framer.com/motion/) & [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- `npm` or `yarn` / `pnpm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anshu706/Phyzo.git
   cd Phyzo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in your browser:**
   Navigate to `http://localhost:5173` to experience the 3D laboratory.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```text
Phyzo/
├── brag-output/               # Launch videos, poster assets & share copy
│   ├── phyzo.mp4              # 1080p 30fps Launch Showcase Video
│   ├── brag.jpg               # High-res poster thumbnail
│   └── share-copy.txt         # Official launch captions
├── public/                    # Static icons and textures
│   └── logo-icon.png          # Phyzo brand mark
├── src/
│   ├── components/            # 3D R3F Viewport, Lights, Grid & Camera Controllers
│   │   ├── Viewport3D.tsx     # Canvas container & post-processing pipeline
│   │   ├── CameraController.tsx
│   │   └── VectorArrow3D.tsx  # Dynamic 3D field vector renderers
│   ├── core/                  # Zustand state stores
│   │   ├── useSceneStore.ts   # Scene objects, selection, and history
│   │   └── useSimulationStore.ts # Time integration, playback state, and metrics
│   ├── modules/               # Domain-specific 3D renderers
│   │   ├── mechanics/         # Rigid body and collision components
│   │   ├── optics/            # Laser paths, lenses, and prism dispersion
│   │   ├── em/                # Point charges, magnets, and vector field meshes
│   │   └── modern/            # Hydrogen orbitals & thermodynamics chambers
│   ├── physics/               # Pure mathematical and physics solvers
│   │   ├── opticsSolver.ts    # Snell's Law, Cauchy formula & ray propagation
│   │   ├── emSolver.ts        # Coulomb, Biot-Savart & Lorentz solvers
│   │   ├── quantumSolver.ts   # Wavefunction & probability cloud generators
│   │   ├── thermoSolver.ts    # Maxwell-Boltzmann kinetic solvers
│   │   └── presets.ts         # Library of 12+ prebuilt physics scenarios
│   ├── ui/                    # Glassmorphism floating HUD components
│   │   ├── TopNavigation.tsx  # Preset switcher, transform tools & settings
│   │   ├── LiveMathOverlay.tsx # Dynamic KaTeX math formulas
│   │   ├── EnergyHud.tsx      # Conservation gauges & telemetry
│   │   ├── AutoCaptionFeed.tsx # Real-time simulation explanation feed
│   │   └── PropertiesInspector.tsx # Real-time object parameter tweak panel
│   ├── App.tsx                # Main application layout
│   └── main.tsx               # Application bootstrap
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🤝 Contributing

Contributions are warmly welcomed! Whether you want to add new physics modules (e.g. General Relativity, Fluid Dynamics, Wave Interference), improve solver precision, or enhance shader visuals:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/QuantumTunneling`)
3. Commit your Changes (`git commit -m 'Add quantum tunneling solver and visualizer'`)
4. Push to the Branch (`git push origin feature/QuantumTunneling`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ for physics students, educators, and researchers worldwide.</sub>
  <br />
  <sub><b>Phyzo</b> — See physics. Build physics.</sub>
</div>
