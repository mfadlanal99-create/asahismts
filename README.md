# Asahi-SMTS — Asahimas Smart Maintenance Training System

An interactive plant reliability, diagnostic instrumentation, and mechanical maintenance training suite built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

## Features

- **35 Interactive Simulators** across **5 Engineering Categories**:
  - **Precision Measurement (4):** Vernier Caliper & Micrometer, Fits & Tolerances, Cylinder Bore Gauge, Hardness Testing
  - **Diagnostic Instruments (7):** Digital Multimeter, Clamp Meter, Megohmmeter (Insulation Tester), Laser Tachometer, IR Thermometer, Vibration Meter, Acoustic / dB Meter (with interactive drag-and-drop probes & realistic machine acoustics)
  - **Rotating Equipment (3):** Laser Shaft Alignment, Bearing Fault Diagnostics, Vibration Spectrum Analyzer
  - **Machine Elements (16):** Bolt Torque Sequencing, Belt & Gear Drives, Gear Strength, Chain Conveyor, Rigging & Lifting, UTM Tensile Testing, Beam Bending, Weld Strength, Thermal Expansion, Coupling Alignment, Lubrication & Tribology, plus 5 foundational Maintenance Basics labs
  - **Fluid Power (5):** Pneumatic Circuits, Hydraulic Circuits, Centrifugal Pump Curves, Valve Packing & Sealing, Air Compressor Systems
- **4-Mode Learning Workflow:** **Simulate** (live rigs & fault injection), **Explore** (maintenance theory & standards), **Practice** (step-by-step numerical drills), and **Quiz** (competency checks with instant explanations).
- **Trilingual UI:** Full **English**, **Indonesian (Bahasa Indonesia)**, and **Japanese (日本語)** support.
- **Competency & Field Tools:** Live Competency Dashboard, printable Competency Report, Field Handbook, Command Palette (`Ctrl+K`), and Light/Dark glassmorphism theme.

## Local Development

```bash
npm install
npm run dev
```

## Build & Lint

```bash
npm run lint
npm run build
```

## GitHub Pages Deployment

This repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that builds and deploys the `dist/` bundle to GitHub Pages whenever changes are pushed to `main`.

To enable it on GitHub:
1. Push this repository to GitHub (`main` branch).
2. Open **Settings → Pages** in your GitHub repository.
3. Set **Source** to **GitHub Actions**.

---

Made by **M. Fadlan Alamsyah**
