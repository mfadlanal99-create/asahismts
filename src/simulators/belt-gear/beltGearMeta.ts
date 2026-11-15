import type { SimulatorMeta } from '../../types/simulator';
import './beltGearI18n';

export const beltGearMeta: SimulatorMeta = {
  id: 'belt-gear',
  title: 'Belt & Gear Drive Maintenance Simulator',
  shortTitle: 'Belt & Gear Drive',
  category: 'Machine Elements',
  difficulty: 'Beginner',
  description:
    'Inspect V-belt tension using the C/64 force-deflection method, check sheave alignment and belt slip, and tune spur gear center distance, backlash, and pitch-line velocity.',
  iconName: 'Layers',
  accentColor: 'rose',
  explore: [
    {
      title: 'Belt Ratio & Pitch Length',
      summary:
        'V-belt drives transmit power between parallel shafts through friction in trapezoidal sheave grooves. Speed ratio depends on the effective pitch diameters of the driver and driven pulleys, while belt length depends on both pulley diameters and center distance.',
      equations: [
        {
          label: 'Speed Ratio',
          formula: 'i = D₂ / D₁ = N₁ / N₂',
          note: 'Ideal ratio without belt slip; D₁ = driver, D₂ = driven',
        },
        {
          label: 'Approximate Pitch Length',
          formula: 'L ≈ 2C + (π/2)(D₁ + D₂) + (D₂ − D₁)² / (4C)',
          note: 'C = shaft center-to-center distance (mm)',
        },
        {
          label: 'Small Pulley Wrap Angle',
          formula: 'θ₁ = 180° − 2·arcsin((D₂ − D₁) / (2C))',
          note: 'Keep θ₁ ≥ 120° to prevent excessive slip under load',
        },
      ],
      workedExample: {
        title: 'Sizing a V-Belt for a Fan Drive',
        given: [
          'Driver pulley D₁ = 125 mm at N₁ = 1450 RPM',
          'Driven pulley D₂ = 250 mm',
          'Center distance C = 480 mm',
        ],
        steps: [
          'Speed ratio: i = 250 / 125 = 2.00',
          'Ideal output speed: N₂ = 1450 / 2.00 = 725 RPM',
          'Belt length: L = 2(480) + (π/2)(125 + 250) + (250 − 125)² / (4 × 480)',
          'L = 960 + 589.05 + 8.14 = 1557.2 mm',
        ],
        answer: 'i = 2.00, N₂ = 725 RPM, L ≈ 1557 mm',
      },
    },
    {
      title: 'Force-Deflection Tension Check (C/64 Rule)',
      summary:
        'Proper V-belt tension is verified by applying a calibrated perpendicular test force at the center of the belt span and measuring the deflection δ. Under-tensioned belts slip and glaze; over-tensioned belts overload shaft bearings.',
      equations: [
        {
          label: 'Target Mid-Span Deflection',
          formula: 'δ_target = C / 64  (or  t / 64)',
          note: 'Standard rule of thumb: 1/64 in per inch of span (≈ 1.56% of span)',
        },
        {
          label: 'Belt Span Length',
          formula: 't = √(C² − ((D₂ − D₁) / 2)²)',
          note: 'Free unsupported span between pulley tangent points',
        },
        {
          label: 'Actual Output Speed with Slip',
          formula: 'N₂,actual = (N₁ / i) × (1 − s)',
          note: 's = fractional belt slip (typically < 1% when properly tensioned)',
        },
      ],
      workedExample: {
        title: 'Mid-Span Deflection Inspection',
        given: [
          'Center distance C = 640 mm',
          'Measured mid-span deflection δ = 14.5 mm at 35 N test force',
        ],
        steps: [
          'Calculate target deflection: δ_target = 640 / 64 = 10.0 mm',
          'Compare measured vs target: 14.5 mm > 10.0 mm (+45% excess deflection)',
          'Diagnosis: Belt is Loose; tighten motor slide base until δ ≈ 10.0 mm',
        ],
        answer: 'Target δ = 10.0 mm; belt is Loose and requires tensioning',
      },
    },
    {
      title: 'Gear Ratio, Module & Center Distance',
      summary:
        'Spur gears transmit positive, non-slip motion through meshing involute teeth. For two gears to mesh properly, they must share the same module (m) and pressure angle (typically 20°).',
      equations: [
        {
          label: 'Gear Speed Ratio',
          formula: 'i = Z₂ / Z₁ = N₁ / N₂',
          note: 'Z₁ = driver teeth, Z₂ = driven teeth',
        },
        {
          label: 'Pitch Diameter',
          formula: 'd = m × Z',
          note: 'm = module (mm per tooth)',
        },
        {
          label: 'Standard Center Distance',
          formula: 'C₀ = m × (Z₁ + Z₂) / 2',
          note: 'Exact theoretical distance for zero-shift involute mesh',
        },
        {
          label: 'Pitch-Line Velocity',
          formula: 'v = (π × d₁ × N₁) / 60,000  (m/s)',
          note: 'Guides lubrication method (grease vs oil bath vs forced spray)',
        },
      ],
      workedExample: {
        title: 'Spur Gearset Layout',
        given: [
          'Module m = 3 mm, Z₁ = 20 teeth, Z₂ = 45 teeth',
          'Motor speed N₁ = 1450 RPM',
        ],
        steps: [
          'Pitch diameters: d₁ = 3 × 20 = 60 mm, d₂ = 3 × 45 = 135 mm',
          'Standard center distance: C₀ = 3 × (20 + 45) / 2 = 97.5 mm',
          'Speed ratio: i = 45 / 20 = 2.25 → N₂ = 1450 / 2.25 = 644.4 RPM',
          'Pitch-line velocity: v = (π × 60 × 1450) / 60,000 = 4.56 m/s',
        ],
        answer: 'C₀ = 97.5 mm, N₂ = 644.4 RPM, v = 4.56 m/s',
      },
    },
    {
      title: 'Torque Multiplication & Backlash Maintenance',
      summary:
        'Speed reduction multiplies output torque proportionally to speed ratio and mechanical efficiency. In spur gears, a controlled amount of backlash is required for lubrication film and thermal expansion.',
      equations: [
        {
          label: 'Input Torque',
          formula: 'T₁ = (9550 × P_kW) / N₁  (N·m)',
          note: '9550 = 60,000 / (2π) conversion constant',
        },
        {
          label: 'Output Torque',
          formula: 'T₂ = T₁ × i × η',
          note: 'η ≈ 0.95 (V-belt) or 0.98 (spur gear)',
        },
        {
          label: 'Backlash Change from Center Offset',
          formula: 'Δj ≈ 2 × ΔC × tan(α)',
          note: 'α = 20° pressure angle; negative ΔC risks tooth binding',
        },
      ],
      workedExample: {
        title: 'Torque & Backlash Check',
        given: [
          'Motor power P = 7.5 kW at N₁ = 1450 RPM',
          'Gear ratio i = 2.25, efficiency η = 98.2%',
          'Center distance offset ΔC = +0.10 mm (α = 20°)',
        ],
        steps: [
          'Input torque: T₁ = (9550 × 7.5) / 1450 = 49.40 N·m',
          'Output torque: T₂ = 49.40 × 2.25 × 0.982 = 109.15 N·m',
          'Additional backlash: Δj = 2 × 0.10 × tan(20°) = 0.073 mm',
        ],
        answer: 'T₂ = 109.2 N·m, Δj = +0.073 mm',
      },
    },
  ],
  practice: [
    {
      id: 'bg-p1',
      prompt:
        'A V-belt drive has a driver pulley D₁ = 120 mm rotating at N₁ = 1500 RPM and a driven pulley D₂ = 300 mm. Assuming negligible slip, calculate the output speed N₂ in RPM.',
      hint: 'First find speed ratio i = D₂ / D₁, then divide N₁ by i.',
      targetValue: 600,
      unit: 'RPM',
      tolerance: 5,
      solutionSteps: [
        'Speed ratio i = D₂ / D₁ = 300 / 120 = 2.5',
        'Output speed N₂ = N₁ / i = 1500 / 2.5 = 600 RPM',
      ],
    },
    {
      id: 'bg-p2',
      prompt:
        'Calculate the approximate pitch length L (in mm) for a V-belt drive with D₁ = 100 mm, D₂ = 260 mm, and shaft center distance C = 400 mm.',
      hint: 'Use L ≈ 2C + (π/2)(D₁ + D₂) + (D₂ − D₁)² / (4C).',
      targetValue: 1381.5,
      unit: 'mm',
      tolerance: 5,
      solutionSteps: [
        '2C = 2 × 400 = 800 mm',
        '(π/2)(100 + 260) = 1.5708 × 360 = 565.49 mm',
        '(260 − 100)² / (4 × 400) = 25600 / 1600 = 16.00 mm',
        'Total L = 800 + 565.49 + 16.00 = 1381.5 mm',
      ],
    },
    {
      id: 'bg-p3',
      prompt:
        'Using the C/64 force-deflection rule, what is the target mid-span belt deflection δ (in mm) for a drive with center distance C = 512 mm?',
      hint: 'Divide the center distance C (in mm) by 64.',
      targetValue: 8.0,
      unit: 'mm',
      tolerance: 0.2,
      solutionSteps: [
        'δ_target = C / 64 = 512 / 64 = 8.0 mm',
      ],
    },
    {
      id: 'bg-p4',
      prompt:
        'Two meshing spur gears have module m = 4 mm, Z₁ = 18 teeth, and Z₂ = 42 teeth. What is the standard center distance C₀ in mm?',
      hint: 'Use C₀ = m × (Z₁ + Z₂) / 2.',
      targetValue: 120,
      unit: 'mm',
      tolerance: 0.5,
      solutionSteps: [
        'C₀ = 4 × (18 + 42) / 2 = 4 × 60 / 2 = 120 mm',
      ],
    },
    {
      id: 'bg-p5',
      prompt:
        'A 7.5 kW motor runs at 1500 RPM driving a reduction stage with ratio i = 3.0 and efficiency η = 96% (0.96). Calculate the output torque T₂ in N·m.',
      hint: 'Compute T₁ = 9550 × P / N₁, then multiply by i and η.',
      targetValue: 137.5,
      unit: 'N·m',
      tolerance: 1.5,
      solutionSteps: [
        'Input torque T₁ = (9550 × 7.5) / 1500 = 47.75 N·m',
        'Output torque T₂ = 47.75 × 3.0 × 0.96 = 137.52 N·m',
      ],
    },
  ],
  quiz: [
    {
      id: 'bg-q1',
      question:
        'During a V-belt tension inspection using the C/64 rule, what does a measured deflection significantly GREATER than C/64 indicate?',
      options: [
        'The belt is over-tightened and overloading the bearings',
        'The belt is loose and prone to slipping and glazing',
        'The sheaves are perfectly aligned',
        'The motor is running above synchronous speed',
      ],
      correctIndex: 1,
      explanation:
        'Greater deflection under the specified test force means lower belt tension (loose belt), which leads to belt slip, heat buildup, and sidewall glazing.',
    },
    {
      id: 'bg-q2',
      question:
        'What is the primary mechanical consequence of running an over-tightened V-belt drive?',
      options: [
        'Reduced output speed due to excessive slip',
        'Excessive radial bearing load, shaft deflection, and premature bearing failure',
        'Increased wrap angle on the driven pulley',
        'Lower pitch-line velocity',
      ],
      correctIndex: 1,
      explanation:
        'Over-tensioning puts high static radial load on both motor and driven shaft bearings, accelerating bearing fatigue and belt cord failure.',
    },
    {
      id: 'bg-q3',
      question:
        'Which symptom is most directly caused by angular or parallel sheave misalignment in a V-belt drive?',
      options: [
        'Rapid sidewall wear, belt squeal, and risk of belt rolling in the groove',
        'Zero backlash at the pitch circle',
        'Increase in gear module',
        'Higher theoretical speed ratio',
      ],
      correctIndex: 0,
      explanation:
        'Misaligned sheaves force the belt to enter and exit grooves at an angle, scrubbing the belt sidewalls and risking belt turnover.',
    },
    {
      id: 'bg-q4',
      question:
        'For two standard spur gears to mesh correctly without interference, which parameters must be identical on both gears?',
      options: [
        'Number of teeth (Z) and face width',
        'Pitch diameter (d) and shaft diameter',
        'Module (m) and pressure angle (α)',
        'Material hardness and RPM',
      ],
      correctIndex: 2,
      explanation:
        'Mating spur gears must have the same module (tooth size) and pressure angle (typically 20°) so their tooth profiles conjugate smoothly.',
    },
    {
      id: 'bg-q5',
      question:
        'If maintenance technicians slightly increase the center distance of a spur gear pair (+ΔC), what happens to the gear mesh?',
      options: [
        'Backlash increases, which can cause rattle if excessive',
        'Speed ratio increases proportionally',
        'Backlash drops to zero and the teeth bind',
        'Pitch-line velocity doubles',
      ],
      correctIndex: 0,
      explanation:
        'Pulling the gear centers apart increases tooth clearance (backlash) by Δj ≈ 2·ΔC·tan(α), while the speed ratio Z₂/Z₁ remains unchanged.',
    },
    {
      id: 'bg-q6',
      question:
        'Why is pitch-line velocity (v = π·d₁·N₁ / 60,000) monitored during gear drive maintenance?',
      options: [
        'It determines whether the belt length needs re-tensioning',
        'It dictates lubrication requirements, dynamic tooth loads, and noise limits',
        'It replaces the need for checking backlash',
        'It measures shaft axial runout directly',
      ],
      correctIndex: 1,
      explanation:
        'Higher pitch-line velocities generate more heat and centrifugal oil throw-off, requiring upgraded lubrication (e.g., oil bath or forced spray) and tighter gear balance.',
    },
  ],
};
