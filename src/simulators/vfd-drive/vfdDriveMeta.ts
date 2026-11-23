import type { SimulatorMeta } from '../../types/simulator';
import './vfdDriveI18n';

export const vfdDriveMeta: SimulatorMeta = {
  id: 'vfd-drive',
  title: '3-Phase Motor & VFD (Inverter) Control Lab',
  shortTitle: '3-Phase Motor & VFD',
  category: 'Rotating Equipment',
  difficulty: 'Intermediate',
  description:
    'Interactive 3-phase induction motor and Variable Frequency Drive (VFD) laboratory comparing DOL, Star-Delta (Y-Δ), and VFD starting, V/f control with field weakening above base Hz, torque-speed curves, DC bus dynamics, and industrial fault diagnostics.',
  iconName: 'Zap',
  accentColor: 'amber',
  explore: [
    {
      title: '1. Starter Comparison: DOL vs Star-Delta (Y-Δ) vs VFD Inverter',
      summary:
        'Direct-On-Line (DOL) starting applies full line voltage immediately, causing a 6×–7× rated inrush current spike and high mechanical shock. Star-Delta (Y-Δ) reduces starting current and torque to one-third during the Star phase before switching to Delta. A Variable Frequency Drive (VFD) ramps frequency and voltage smoothly from 0 Hz, delivering full rated torque with ≤1.3× rated current.',
      equations: [
        {
          label: 'Star-Delta Starting Current & Torque Ratio',
          formula: 'I_start(Y) = (1/3) · I_start(Δ),   T_start(Y) = (1/3) · T_start(Δ)',
          note: 'Phase voltage drops by 1/√3 in Star, reducing both power/torque and line current by (1/√3)² = 1/3.',
        },
        {
          label: 'VFD Ramp Rate (Hz/s)',
          formula: 'df/dt = f_base / t_accel',
          note: 'Example: 50 Hz over an 8 s acceleration ramp gives 6.25 Hz/s.',
        },
      ],
      workedExample: {
        title: 'Comparing Inrush Current Across Starters (7.5 kW, 400 V Motor)',
        given: [
          'Rated full-load current I_rated = 14.3 A',
          'DOL locked-rotor factor = 6.5 × I_rated',
        ],
        steps: [
          'DOL inrush peak: I_DOL = 6.5 × 14.3 A = 93.0 A.',
          'Star-Delta starting current (Star stage): I_Y = 93.0 A / 3 = 31.0 A.',
          'VFD controlled start at 1.25 × I_rated: I_VFD = 1.25 × 14.3 A = 17.9 A.',
        ],
        answer: 'DOL = 93.0 A | Star-Delta = 31.0 A | VFD = 17.9 A',
      },
    },
    {
      title: '2. Constant V/f Control, Field Weakening & Torque-Speed Curve',
      summary:
        'To maintain constant air-gap magnetic flux (Φ ∝ V / f), a VFD scales output voltage proportionally with frequency up to the base frequency (50 Hz or 60 Hz). Above base frequency, voltage is clamped at rated mains voltage (400 V), entering the Field Weakening region where flux drops as f_base / f and breakdown torque falls as (f_base / f)².',
      equations: [
        {
          label: 'Constant V/f Ratio (f ≤ f_base)',
          formula: 'V_out = V_rated · (f / f_base)   [Constant Torque Region]',
          note: 'For 400 V / 50 Hz = 8.0 V/Hz. At 25 Hz, V_out ≈ 200 V.',
        },
        {
          label: 'Field Weakening Breakdown Torque (f > f_base)',
          formula: 'T_bk(f) = T_bk(base) · (f_base / f)²',
          note: 'At 75 Hz on a 50 Hz motor, breakdown torque drops to (50/75)² = 44.4% of base.',
        },
      ],
      workedExample: {
        title: 'Calculating Speed, Slip & Voltage at 35 Hz',
        given: [
          '4-Pole (4P) induction motor, base 50 Hz, 400 V',
          'VFD target frequency f = 35 Hz, operating slip s = 4.0%',
        ],
        steps: [
          'Synchronous speed: Ns = (120 × 35) / 4 = 1050 RPM.',
          'Rotor shaft speed: Nr = 1050 × (1 - 0.04) = 1008 RPM.',
          'V/f output voltage: V_out = 400 × (35 / 50) = 280 V.',
        ],
        answer: 'Ns = 1050 RPM, Nr = 1008 RPM, V_out = 280 V',
      },
    },
    {
      title: '3. DC Bus Dynamics, Fast-Decel Overvoltage & Bearing EDM Fluting',
      summary:
        'A 400 V 3-phase rectifier charges the VFD DC bus to V_dc ≈ √2 × 400 V ≈ 565 V. During rapid deceleration, rotor inertia acts as a generator and pumps energy back into the DC bus capacitors; without a braking resistor, V_dc spikes past ~800 V and trips on Overvoltage (OV). Additionally, high IGBT PWM carrier frequencies induce common-mode shaft currents (EDM) that flute motor bearings.',
      equations: [
        {
          label: 'Nominal Unloaded DC Bus Voltage',
          formula: 'V_dc = √2 · V_line,rms ≈ 1.414 × 400 V = 566 V',
          note: 'Input single-phasing causes severe DC bus voltage ripple (>80 Vpp) and capacitor overheating.',
        },
        {
          label: 'Overvoltage Trip Threshold (400 V Class Drive)',
          formula: 'V_dc,trip ≈ 800 V DC',
          note: 'Prevent OV trips by lengthening decel ramp time or adding a dynamic braking chopper + resistor.',
        },
      ],
    },
  ],
  practice: [
    {
      id: 'vfd-p1',
      prompt:
        'A 4-pole induction motor is driven by a VFD at 30 Hz. Calculate its synchronous magnetic field speed (RPM).',
      hint: 'Use Ns = (120 × f) / p with f = 30 Hz and p = 4.',
      targetValue: 900,
      unit: 'RPM',
      tolerance: 5,
      solutionSteps: [
        'Apply the synchronous speed formula: Ns = (120 × f) / p.',
        'Ns = (120 × 30) / 4 = 3600 / 4 = 900 RPM.',
      ],
    },
    {
      id: 'vfd-p2',
      prompt:
        'A 400 V / 50 Hz VFD operates in the constant V/f region at 25 Hz (ignore low-frequency IR boost). What output voltage (V) does it supply?',
      hint: 'V_out = V_rated × (f / f_base) = 400 × (25 / 50).',
      targetValue: 200,
      unit: 'V',
      tolerance: 5,
      solutionSteps: [
        'Constant V/f ratio = 400 V / 50 Hz = 8.0 V/Hz.',
        'At 25 Hz: V_out = 8.0 × 25 = 200 V.',
      ],
    },
    {
      id: 'vfd-p3',
      prompt:
        'A 400 V 3-phase AC supply feeds a VFD 6-pulse diode rectifier. Calculate the nominal unloaded DC bus voltage V_dc (V).',
      hint: 'V_dc = √2 × V_line,rms ≈ 1.414 × 400 V.',
      targetValue: 566,
      unit: 'V',
      tolerance: 8,
      solutionSteps: [
        'Peak line-to-line voltage charges the DC bus capacitors: V_dc = √2 × V_line.',
        'V_dc = 1.4142 × 400 V ≈ 565.7 V (≈ 566 V).',
      ],
    },
    {
      id: 'vfd-p4',
      prompt:
        'A 4-pole motor has a DOL starting inrush current of 90 A. If started with a Star-Delta (Y-Δ) starter, what is the initial Star-stage starting current (A)?',
      hint: 'Star-Delta reduces starting current to 1/3 of DOL.',
      targetValue: 30,
      unit: 'A',
      tolerance: 1,
      solutionSteps: [
        'In Star connection, phase voltage is 1/√3 of line voltage, so line current is 1/3 of Delta/DOL.',
        'I_star = 90 A / 3 = 30 A.',
      ],
    },
    {
      id: 'vfd-p5',
      prompt:
        'A 50 Hz motor is pushed to 75 Hz in the VFD field-weakening region. What percentage (%) of its base breakdown torque remains?',
      hint: 'Breakdown torque scales as (f_base / f)² × 100%.',
      targetValue: 44.4,
      unit: '%',
      tolerance: 1.5,
      solutionSteps: [
        'In field weakening (f > f_base), flux drops as f_base / f and breakdown torque scales as (f_base / f)².',
        '(50 / 75)² × 100% = (0.6667)² × 100% ≈ 44.4%.',
      ],
    },
  ],
  quiz: [
    {
      id: 'vfd-q1',
      question:
        'Why does a VFD maintain a constant V/f ratio between 0 Hz and base frequency (50 Hz)?',
      options: [
        'To keep stator air-gap magnetic flux constant so the motor delivers full rated torque without core saturation',
        'To double the DC bus voltage above 1000 V during low-speed operation',
        'To eliminate rotor slip completely so the motor runs synchronously',
        'To convert a 3-phase motor into a single-phase capacitor-start motor',
      ],
      correctIndex: 0,
      explanation:
        'Magnetic flux Φ is proportional to V/f. Keeping V/f constant maintains rated flux and full torque capability across the speed range up to base frequency.',
    },
    {
      id: 'vfd-q2',
      question:
        'What causes a VFD to trip on DC Bus Overvoltage (OV) when commanding a very fast deceleration time (e.g., 0.5 s) on a high-inertia fan?',
      options: [
        'Regenerative braking energy from the spinning load flows back through the inverter diodes and charges the DC bus capacitors above ~800 V',
        'The input AC mains frequency suddenly jumps from 50 Hz to 100 Hz',
        'The motor shaft bearings seize mechanically and short the DC bus',
        'IGBT carrier frequency drops to zero during deceleration',
      ],
      correctIndex: 0,
      explanation:
        'When the VFD slows the stator field faster than the high-inertia rotor slows down, slip becomes negative and the motor acts as an induction generator, pumping energy into the DC bus.',
    },
    {
      id: 'vfd-q3',
      question:
        'How does a Star-Delta (Y-Δ) starter compare to Direct-On-Line (DOL) during the initial starting phase?',
      options: [
        'It reduces both starting current and starting torque to 1/3 (33%) of DOL values',
        'It reduces starting current to 1/3 while doubling starting torque',
        'It provides smooth speed control from 0 Hz to 80 Hz',
        'It completely eliminates the transition transient when switching to Delta',
      ],
      correctIndex: 0,
      explanation:
        'In Star, each phase coil receives V_line / √3, reducing phase current by 1/√3 and line current/torque by (1/√3)² = 1/3.',
    },
    {
      id: 'vfd-q4',
      question:
        'What happens to motor performance when a VFD operates above base frequency (e.g., 65–80 Hz) in the Field Weakening region?',
      options: [
        'Output voltage clamps at rated voltage (400 V), magnetic flux weakens, and available torque decreases as speed rises',
        'Output voltage rises linearly to 640 V to maintain constant V/f',
        'Motor current drops to zero because slip becomes zero',
        'Synchronous speed stays fixed at 1500 RPM regardless of frequency',
      ],
      correctIndex: 0,
      explanation:
        'Because the VFD cannot output higher voltage than its DC bus allows (400 V), V/f drops above 50 Hz, weakening magnetic flux and reducing torque capability.',
    },
    {
      id: 'vfd-q5',
      question:
        'Which fault signature indicates Single-Phasing (input phase loss) on a 3-phase VFD rectifier?',
      options: [
        'High DC bus voltage ripple (>80 Vpp), elevated input current on the remaining two phases, and torque pulsation',
        'Zero voltage on all three output phases while the motor spins at 3000 RPM',
        'DC bus voltage climbing steadily above 850 V at standstill',
        'Carrier frequency automatically increasing from 4 kHz to 16 kHz',
      ],
      correctIndex: 0,
      explanation:
        'Losing one input phase forces the 6-pulse rectifier to operate as a single-phase bridge, causing severe DC bus ripple, capacitor stress, and overcurrent on the remaining two phases.',
    },
    {
      id: 'vfd-q6',
      question:
        'What causes bearing fluting (washboard pitting) on a VFD-driven motor, and how is it mitigated?',
      options: [
        'High-frequency PWM common-mode voltage induces EDM shaft currents across the bearing oil film; mitigated with shaft grounding brushes and insulated bearings',
        'Low-frequency operation below 10 Hz freezes the bearing grease',
        'Star-Delta contactors weld shut during normal running',
        'Using 2-pole motors instead of 4-pole motors on a 50 Hz grid',
      ],
      correctIndex: 0,
      explanation:
        'Fast IGBT dv/dt switching creates common-mode shaft voltage that discharges through bearing raceways via Electrical Discharge Machining (EDM). Shaft grounding rings and insulated NDE bearings prevent this.',
    },
  ],
};
