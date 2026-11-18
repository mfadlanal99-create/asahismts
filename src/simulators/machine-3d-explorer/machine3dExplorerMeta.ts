import type { SimulatorMeta } from '../../types/simulator';
import './machine3dExplorerI18n';

export const machine3dExplorerMeta: SimulatorMeta = {
  id: 'machine-3d-explorer',
  title: '3D Machine Assembly & Exploded-View Inspector',
  shortTitle: '3D Machine Explorer',
  category: 'Rotating Equipment',
  difficulty: 'Intermediate',
  description:
    'Interactive 360° 3D CAD assembly and exploded-view explorer featuring three industrial machines: ANSI/ISO Centrifugal Process Pump, CEMA Troughed Belt Conveyor, and En-Masse & Scraper Drag Chain Conveyor. Zoom, orbit freely, animate disassembly stages, toggle X-ray casing, and click any 3D part for materials, failure modes, and torque/clearance specs.',
  iconName: 'Layers',
  accentColor: 'cyan',
  explore: [
    {
      title: 'Overhung Centrifugal Pump Back-Pull-Out Architecture',
      summary:
        'Industrial ANSI B73.1 / ISO 2858 chemical process pumps use a back-pull-out frame design. All rotating internals—the impeller, mechanical seal cartridge, shaft, and inboard/outboard bearings—bolt together with the bearing housing and backplate so technicians can withdraw the entire rotating assembly rearward without disturbing process suction and discharge piping.',
      equations: [
        {
          label: 'Hydraulic Radial Load Approximation (Volute Pump)',
          formula: 'F_r = K_r × P_d × D_2 × B_2  [N]',
          note: 'K_r = radial thrust factor (peaks near shutoff Q = 0); D_2 = impeller outer diameter; B_2 = impeller tip width.',
        },
        {
          label: 'Net Axial Thrust Acting Toward Suction',
          formula: 'F_a ≈ (P_d - P_s) × A_eye - F_balance',
          note: 'Resisted by the outboard back-to-back (DB) 40° angular-contact duplex bearing pair (7309).',
        },
      ],
      workedExample: {
        title: 'Calculating Shaft End-Play vs. Thermal Bearing Expansion',
        given: [
          'Pump steel shaft center distance between inboard 6309 and outboard 7309 bearings: L = 240 mm',
          'Operating bearing inner-race temperature rise: ΔT = 45 °C, thermal coefficient α = 11.7 × 10⁻⁶ /°C',
        ],
        steps: [
          'Compute axial shaft growth between bearings: ΔL = L × α × ΔT',
          'ΔL = 240 × (11.7 × 10⁻⁶) × 45 = 0.126 mm',
          'Since the inboard 6309 outer race floats axially in the housing H7 bore, this 0.126 mm thermal growth is absorbed without inducing parasitic thrust preload.',
        ],
        answer: 'ΔL = 0.126 mm absorbed cleanly by the floating inboard radial bearing.',
      },
    },
    {
      title: 'Wear-Ring Clearance & Mechanical Seal Flush Hygiene',
      summary:
        'High-pressure volute discharge leaks back into the suction eye across the casing wear ring clearance. Every 0.10 mm of excessive wear-ring radial erosion sharply raises recirculation loss and drops pump Best Efficiency Point (BEP) head. Meanwhile, the cartridge mechanical seal relies on a stable liquid film supplied via API Plan 11 from the casing discharge.',
      equations: [
        {
          label: 'Thermal Shrink-Fit Expansion for Ball Bearing Mounting',
          formula: 'Δd = d × α × ΔT  [mm]',
          note: 'Use an induction heater limited to 110 °C max so the inner race slips freely onto a 45 mm (k5) shaft journal without hammer brinelling.',
        },
        {
          label: 'Approximate Casing Flange Star-Pattern Bolt Torque',
          formula: 'T = K × d_bolt × F_preload  [N·m]',
          note: 'Typical nut factor K ≈ 0.18 with nickel anti-seize on stainless flange studs.',
        },
      ],
    },
    {
      title: 'Staged Disassembly & Assembly Inspection Checklist',
      summary:
        'Safe overhaul requires strict staged sequencing: Stage 1 isolates energy, drains volute casing, uncouples motor hub, and extracts back-pull-out frame and impeller locknut. Stage 2 withdraws enclosed impeller, renewable wear ring, and seal chamber backplate. Stage 3 removes cartridge mechanical seal and inspects k5 shaft straightness (≤ 0.025 mm TIR) before induction-mounting new C3/duplex bearings.',
      equations: [
        {
          label: 'Allowable Shaft Runout & Coupling Offset Limit',
          formula: 'TIR_shaft ≤ 0.025 mm  |  Offset_laser ≤ 0.05 mm',
          note: 'Excessive runout wipes mechanical seal carbon faces and generates 1× / 2× RPM vibration peaks.',
        },
      ],
    },
  ],
  practice: [
    {
      id: 'm3d-p1',
      prompt:
        'A stepped 17-4PH pump shaft has a bearing seat span L = 320 mm between the fixed outboard duplex thrust bearing and floating inboard radial bearing. With α = 11.7 × 10⁻⁶ /°C and an operating temperature rise ΔT = 50 °C, compute the axial shaft thermal expansion ΔL (in mm).',
      hint: 'Use ΔL = L × α × ΔT. Multiply 320 mm × 0.0000117 × 50.',
      targetValue: 0.187,
      unit: 'mm',
      tolerance: 0.01,
      solutionSteps: [
        'Given L = 320 mm, α = 11.7 × 10⁻⁶ /°C, ΔT = 50 °C.',
        'ΔL = 320 × 11.7e-6 × 50 = 0.1872 mm.',
        'Rounded to three decimals: 0.187 mm.',
      ],
    },
    {
      id: 'm3d-p2',
      prompt:
        'A 6309 C3 inboard bearing has a 45 mm bore. You heat it in an induction heater from 25 °C ambient to 110 °C (ΔT = 85 °C) using α = 11.5 × 10⁻⁶ /°C. Calculate the radial/diametral bore expansion Δd in micrometers (µm).',
      hint: 'Δd(µm) = d(mm) × 1000 × α × ΔT = 45,000 × 11.5e-6 × 85.',
      targetValue: 44.0,
      unit: 'µm',
      tolerance: 2.0,
      solutionSteps: [
        'Temperature rise ΔT = 110 - 25 = 85 °C.',
        'Δd = 45 mm × 11.5 × 10⁻⁶ /°C × 85 °C = 0.04399 mm.',
        'Convert mm to µm: 0.04399 × 1000 ≈ 44.0 µm.',
      ],
    },
    {
      id: 'm3d-p3',
      prompt:
        'A worn pump casing wear ring measures 140.84 mm ID while the mating impeller wear surface measures 139.60 mm OD. Calculate the current RADIAL running clearance in mm.',
      hint: 'Radial clearance = (Bore ID − Impeller OD) / 2.',
      targetValue: 0.62,
      unit: 'mm',
      tolerance: 0.02,
      solutionSteps: [
        'Diametral clearance = 140.84 - 139.60 = 1.24 mm.',
        'Radial clearance = 1.24 / 2 = 0.62 mm (exceeds typical 0.25–0.30 mm limit — replace ring!).',
      ],
    },
  ],
  quiz: [
    {
      id: 'm3d-q1',
      question:
        'Why is the inboard 6309 radial bearing left axially free-floating in the bearing frame housing while the outboard 7309 duplex bearing pair is locked in place?',
      options: [
        'To allow the steel shaft to expand axially during hot operation without binding and crushing the bearings',
        'To make the impeller wobble backward to absorb cavitation shocks',
        'Because 6309 bearings cannot withstand oil splash lubrication if clamped',
        'To allow the mechanical seal faces to separate slightly at high RPM',
      ],
      correctIndex: 0,
      explanation:
        'A fixed-floating bearing arrangement locks axial position at the outboard duplex 7309 pair and allows the inboard 6309 outer race to slide smoothly inside the H7 bore as the shaft heats up and elongates.',
    },
    {
      id: 'm3d-q2',
      question:
        'When installing a Cartridge Mechanical Seal (#06) on a centrifugal pump shaft, when MUST the red setting centering clips be removed?',
      options: [
        'Before sliding the cartridge onto the shaft so the gland sits flat',
        'ONLY AFTER both the gland plate bolts and shaft sleeve set screws are fully tightened',
        'Leave them permanently installed as anti-vibration dampeners',
        'After the pump has run at 1750 RPM for 5 minutes',
      ],
      correctIndex: 1,
      explanation:
        'The centering clips hold the seal at its exact spring compression and concentricity during installation. You must torque the gland bolts and tighten the shaft set screws first, then remove the clips immediately before rotating the shaft by hand.',
    },
    {
      id: 'm3d-q3',
      question:
        'What is the primary engineering purpose of the Renewable Casing Wear Ring (#02)?',
      options: [
        'To seal high-pressure oil inside the bearing housing sump',
        'To form a narrow sacrificial throttling restriction between discharge pressure and suction eye, reducing internal recirculation',
        'To act as a radial ball bearing supporting the front end of the pump shaft',
        'To prevent reverse motor rotation when tripping a breaker',
      ],
      correctIndex: 1,
      explanation:
        'The wear ring establishes a tight running clearance (typically 0.20–0.30 mm radial) between the high-pressure volute and suction eye. When wear widens this gap, replacing the inexpensive bronze/stellite ring restores hydraulic efficiency.',
    },
    {
      id: 'm3d-q4',
      question:
        'Why does an ANSI B73.1 overhung process pump include a rear Seal Backplate (#05) and Bearing Frame (#09) back-pull-out assembly?',
      options: [
        'So maintenance crews can pull the rotor assembly out without unbolting suction or discharge piping from the volute casing',
        'To double the pump discharge head compared to a split-case pump',
        'To eliminate the need for a shaft key or locknut on the impeller',
        'So water can flow directly through the ball bearings to cool them',
      ],
      correctIndex: 0,
      explanation:
        'Back-pull-out architecture lets the volute casing remain rigidly bolted and aligned to process piping while the impeller, seal, shaft, and bearing frame slide rearward out via a spacer coupling.',
    },
  ],
};
