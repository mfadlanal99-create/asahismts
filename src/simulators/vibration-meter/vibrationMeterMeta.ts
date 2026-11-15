import type { SimulatorMeta } from '../../types/simulator';

export const vibrationMeterMeta: SimulatorMeta = {
  id: 'vibration-meter',
  title: 'Handheld Vibration Meter (ISO 10816-3 & BDU)',
  shortTitle: 'Handheld Vibration Meter',
  category: 'Diagnostic Instruments',
  difficulty: 'Intermediate',
  description:
    'Inspect rotating machinery using a portable handheld vibration meter with a magnetic accelerometer probe. Measure Velocity (mm/s RMS), Acceleration (g Peak), Displacement (μm P-P), and Bearing Damage Units (BDU) across Motor NDE, Motor DE, Pump DE, and Pump NDE to diagnose faults per ISO 10816-3.',
  iconName: 'Activity',
  accentColor: 'violet',
  explore: [
    {
      title: 'Velocity, Acceleration & Displacement Relationships',
      summary:
        'A piezoelectric accelerometer senses dynamic acceleration, then integrates once to obtain velocity and twice to obtain displacement. Because each integration divides by angular frequency ω = 2πf, displacement emphasizes low-frequency motion (unbalance, looseness), velocity (10–1000 Hz) provides flat energy sensitivity across the industrial machine band, and acceleration/BDU highlights high-frequency impacts from rolling-element bearing spalls.',
      equations: [
        {
          label: 'Peak Velocity from RMS (Sinusoidal)',
          formula: 'v_pk = √2 · v_rms ≈ 1.414 · v_rms   [mm/s]',
          note: 'Valid for a single dominant harmonic (e.g., 1X unbalance).',
        },
        {
          label: 'Peak-to-Peak Displacement from Velocity RMS',
          formula: 's_pp = (v_rms · √2 · 1000) / (π · f)   [μm P-P]',
          note: 'f = vibration frequency in Hz (1X = RPM / 60).',
        },
        {
          label: 'Peak Acceleration in g from Velocity RMS',
          formula: 'a_pk = (v_rms · √2 · 2π · f) / (1000 · 9.80665)   [g Peak]',
          note: '1 g = 9.80665 m/s². High-frequency bearing impacts add directly to a_pk.',
        },
      ],
      workedExample: {
        title: 'Converting 1X Velocity RMS to Displacement P-P at 1800 RPM',
        given: [
          'Machine speed N = 1,800 RPM → 1X frequency f = 1800 / 60 = 30.0 Hz',
          'Measured 1X velocity v_rms = 4.50 mm/s RMS',
        ],
        steps: [
          'Compute peak velocity: v_pk = 4.50 · √2 = 6.364 mm/s.',
          'Compute displacement P-P: s_pp = (6.364 · 1000) / (π · 30.0) = 6364 / 94.248 = 67.5 μm P-P.',
          'Compute sinusoidal 1X acceleration: a_pk = (6.364 · 2π · 30) / (1000 · 9.80665) = 0.122 g Peak.',
        ],
        answer: 's_pp = 67.5 μm P-P, a_pk = 0.122 g Peak',
      },
    },
    {
      title: 'ISO 10816-3 Vibration Severity Zones (A, B, C, D)',
      summary:
        'ISO 10816-3 evaluates broadband RMS velocity (10–1000 Hz) measured on bearing housings according to machine power class (Group 2: 15–300 kW; Group 1: > 300 kW) and foundation stiffness (Rigid vs. Flexible). Zone A represents newly commissioned machines, Zone B is acceptable for unrestricted long-term operation, Zone C requires scheduled corrective action, and Zone D indicates imminent damage.',
      equations: [
        {
          label: 'Group 2 (15–300 kW) Rigid Foundation Limits',
          formula: 'A ≤ 1.4  |  B: 1.4–2.8  |  C: 2.8–4.5  |  D > 4.5 mm/s RMS',
          note: 'Flexible foundations allow higher velocity limits (2.3 / 4.5 / 7.1 mm/s).',
        },
        {
          label: 'Group 1 (> 300 kW) Rigid Foundation Limits',
          formula: 'A ≤ 2.3  |  B: 2.3–4.5  |  C: 4.5–7.1  |  D > 7.1 mm/s RMS',
          note: 'Flexible Group 1 limits are 3.5 / 7.1 / 11.0 mm/s RMS.',
        },
      ],
      workedExample: {
        title: 'Classifying a 75 kW Centrifugal Pump on a Rigid Concrete Skid',
        given: [
          'Motor power = 75 kW (ISO Group 2: 15–300 kW), Rigid foundation',
          'Handheld meter reading at Pump DE = 3.40 mm/s RMS',
        ],
        steps: [
          'Select Group 2 Rigid boundaries: A/B = 1.4, B/C = 2.8, C/D = 4.5 mm/s RMS.',
          'Compare 3.40 mm/s RMS against boundaries: 2.8 < 3.40 ≤ 4.5 mm/s RMS.',
          'Machine falls in Zone C (Unsatisfactory for continuous operation — plan maintenance).',
        ],
        answer: 'ISO 10816-3 Zone C (Plan Corrective Maintenance)',
      },
    },
    {
      title: '4-Point Route Diagnostics & Bearing Damage Units (BDU)',
      summary:
        'Taking readings at all four bearing housings (Motor NDE, Motor DE, Pump DE, Pump NDE) reveals the spatial signature of a fault. Rotor unbalance peaks on the overhung rotor/impeller with normal BDU; shaft misalignment concentrates across the coupling (Motor DE & Pump DE); loose foundation elevates outer feet (NDE); and an early bearing outer-race spall spikes localized high-frequency Acceleration and BDU (> 100) long before broadband velocity reaches Zone D.',
      equations: [
        {
          label: 'Bearing Damage Units (BDU) Screening Thresholds',
          formula: 'BDU < 50: Good  |  50–100: Caution  |  BDU > 100: Bearing Damage',
          note: 'BDU measures high-frequency shock-pulse / enveloped acceleration energy (1–10 kHz).',
        },
      ],
      workedExample: {
        title: 'Catching an Early Pump DE Bearing Spall',
        given: [
          'Pump DE Velocity = 2.70 mm/s RMS (ISO Zone B on Group 2 Rigid)',
          'Pump DE Acceleration = 3.85 g Peak, BDU = 148',
          'Motor DE / NDE BDU = 18–46',
        ],
        steps: [
          'Velocity alone (2.70 mm/s) appears acceptable (Zone B), which can mask early rolling-element defects.',
          'However, localized BDU = 148 (> 100) and 3.85 g Peak at Pump DE confirm high-frequency metal-to-metal impact.',
          'Diagnosis: Early DE bearing outer-race spall — schedule bearing inspection/replacement.',
        ],
        answer: 'Early Pump DE Bearing Spall detected via BDU & g Peak',
      },
    },
  ],
  practice: [
    {
      id: 'vib-disp-from-vel',
      prompt:
        'A pump running at 1,800 RPM (30 Hz) has a pure 1X velocity of 4.50 mm/s RMS. Calculate the corresponding peak-to-peak displacement in μm P-P.',
      hint: 'Use s_pp = (v_rms · √2 · 1000) / (π · f) with f = 1800 / 60 = 30 Hz.',
      targetValue: 67.5,
      unit: 'μm P-P',
      tolerance: 1.5,
      solutionSteps: [
        '1X frequency f = 1,800 / 60 = 30.0 Hz.',
        'Peak velocity v_pk = 4.50 · √2 = 6.364 mm/s.',
        's_pp = (6.364 · 1000) / (π · 30.0) = 67.52 μm P-P.',
      ],
    },
    {
      id: 'vib-peak-vel',
      prompt:
        'A handheld vibration meter reads 3.50 mm/s RMS on a motor bearing housing for a dominant 1X sinusoidal vibration. What is the peak velocity in mm/s?',
      hint: 'For a pure sine wave, v_pk = √2 · v_rms.',
      targetValue: 4.95,
      unit: 'mm/s',
      tolerance: 0.1,
      solutionSteps: [
        'v_pk = 1.4142 · 3.50 = 4.95 mm/s.',
      ],
    },
    {
      id: 'vib-accel-from-vel',
      prompt:
        'At 3,000 RPM (50 Hz), a pure sinusoidal vibration measures 5.00 mm/s RMS. Calculate the peak acceleration in g (where 1 g = 9.80665 m/s²).',
      hint: 'Use a_pk = (v_rms · √2 · 2π · f) / (1000 · 9.80665).',
      targetValue: 0.227,
      unit: 'g',
      tolerance: 0.02,
      solutionSteps: [
        'f = 3,000 / 60 = 50 Hz; v_pk = 5.00 · √2 = 7.071 mm/s.',
        'a_pk (m/s²) = (7.071 · 2π · 50) / 1000 = 2.221 m/s².',
        'a_pk (g) = 2.221 / 9.80665 = 0.2265 g.',
      ],
    },
  ],
  quiz: [
    {
      id: 'vib-q1',
      question:
        'Which measurement mode is the primary parameter evaluated by ISO 10816-3 to classify overall machine vibration severity into Zones A, B, C, and D?',
      options: [
        'Displacement (μm P-P)',
        'Velocity (mm/s RMS)',
        'Acceleration (g Peak)',
        'Bearing Damage Units (BDU)',
      ],
      correctIndex: 1,
      explanation:
        'ISO 10816-3 defines Zone A/B/C/D severity thresholds using broadband Velocity in mm/s RMS across 10–1000 Hz.',
    },
    {
      id: 'vib-q2',
      question:
        'During a 4-point route check, Pump DE shows 2.6 mm/s RMS (Zone B) but BDU = 148 and Acceleration = 3.8 g Peak, while other points are normal. What is the most likely fault?',
      options: [
        'Rotor unbalance',
        'Loose foundation anchor bolts',
        'Early DE bearing outer-race spall',
        'Healthy machine',
      ],
      correctIndex: 2,
      explanation:
        'Early rolling-element bearing spalls generate high-frequency impact pulses that spike localized BDU (> 100) and g Peak before broadband velocity rises into Zone C/D.',
    },
    {
      id: 'vib-q3',
      question:
        'Why do Motor DE and Pump DE both show elevated vibration when shaft misalignment is present?',
      options: [
        'Misalignment creates reaction forces across the flexible coupling directly into the two adjacent drive-end bearings',
        'Non-drive-end bearings cannot transmit radial loads',
        'Misalignment only affects electrical stator windings',
        'The magnetic probe amplifies readings near the coupling',
      ],
      correctIndex: 0,
      explanation:
        'Parallel and angular shaft misalignment stresses the coupling, transmitting 1X/2X radial and axial forces directly into Motor DE and Pump DE.',
    },
    {
      id: 'vib-q4',
      question:
        'For a Group 2 (15–300 kW) machine on a Rigid foundation, what is the ISO 10816-3 Zone C/D boundary above which damage may occur?',
      options: ['1.4 mm/s RMS', '2.8 mm/s RMS', '4.5 mm/s RMS', '11.0 mm/s RMS'],
      correctIndex: 2,
      explanation:
        'For Group 2 Rigid machines, ISO 10816-3 boundaries are 1.4 (A/B), 2.8 (B/C), and 4.5 mm/s RMS (C/D).',
    },
  ],
};
