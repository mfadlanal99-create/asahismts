import type { SimulatorMeta } from '../../types/simulator';
import './wireConnectionI18n';

export const wireConnectionMeta: SimulatorMeta = {
  id: 'wire-connection',
  title: 'Electrical Wire Connection & Termination Lab',
  shortTitle: 'Wire Termination Lab',
  category: 'Diagnostic Instruments',
  difficulty: 'Beginner',
  description:
    'Interactive electrical termination laboratory covering DIN-rail terminal blocks, motor stud lugs, inline splices, and protective earth (PE) bonding. Analyze contact resistance, I²R heating, tightening torque, strip length, IEC 60999-1 pull-out retention, and field wiring faults.',
  iconName: 'Zap',
  accentColor: 'amber',
  explore: [
    {
      title: '1. Contact Resistance, Voltage Drop & I²R Thermal Runaway',
      summary:
        'Every electrical termination introduces a small contact resistance (R_c). Under load current (I), even a seemingly minor increase from 0.3 mΩ (properly crimped ferrule/lug) to 25 mΩ (loose screw or pinched PVC insulation) multiplies heat generation by I²R, leading to terminal oxidation, insulation melting, micro-arcing, and electrical fires.',
      equations: [
        {
          label: 'Joint Voltage Drop (Ohm’s Law)',
          formula: 'ΔV = I · R_c   [mV = A · mΩ]',
          note: 'At 25 A, a 0.4 mΩ joint drops only 10 mV, whereas a loose 20 mΩ joint drops 500 mV.',
        },
        {
          label: 'Joint Power Dissipation (Joule Heating)',
          formula: 'P_loss = I² · R_c / 1000   [W]',
          note: 'Because heat scales with current squared (I²), doubling load current quadruples terminal heating.',
        },
      ],
      workedExample: {
        title: 'Comparing Healthy vs Loose Terminal at 30 A Load',
        given: [
          'Load current I = 30 A',
          'Healthy crimped ferrule joint R_c1 = 0.3 mΩ',
          'Under-torqued bare stranded joint R_c2 = 18.0 mΩ',
        ],
        steps: [
          'Healthy power loss: P1 = (30² × 0.3) / 1000 = 0.27 W (negligible ~2 °C rise).',
          'Loose joint voltage drop: ΔV2 = 30 × 18.0 = 540 mV.',
          'Loose joint power loss: P2 = (30² × 18.0) / 1000 = 16.20 W — localized hotspot exceeds 150 °C!',
        ],
        answer: 'Healthy = 0.27 W | Loose = 16.20 W (60× more heat)',
      },
    },
    {
      title: '2. Termination Methods: Ferrules, Ring Lugs, Wago & Solder-Tinned Risks',
      summary:
        'Fine-stranded copper conductors must be consolidated before clamping under a screw terminal. Crimped bootlace ferrules and ring/spade lugs provide gas-tight cold-weld compression and high mechanical pull-out retention. Conversely, solder-tinned wire tips undergo cold-flow (creep) under sustained screw pressure, gradually loosening the joint. Twisted wire with PVC tape is prohibited in industrial panels.',
      equations: [
        {
          label: 'IEC 60999-1 Minimum Pull-Out Force',
          formula: 'F_pull ≥ 40 N (1.5 mm²) | 50 N (2.5 mm²) | 60 N (4 mm²) | 80 N (6 mm²) | 90 N (10 mm²)',
          note: 'A proper crimp and torque must pass mechanical pull-testing without strand slip.',
        },
        {
          label: 'Proper Stud Washer Stack Order',
          formula: 'Busbar/Plate → Ring Lug → Flat Washer → Spring/Star Lock Washer → Hex Nut',
          note: 'Never place a lock washer between the lug and busbar; it reduces contact area and increases R_c.',
        },
      ],
      workedExample: {
        title: 'Selecting Strip Length & Torque for 2.5 mm² Control Wiring',
        given: [
          'Conductor: 2.5 mm² stranded copper in a DIN-rail screw terminal',
          'Termination method: Insulated bootlace ferrule',
        ],
        steps: [
          'Strip 8–10 mm of PVC insulation so copper reaches the end of the ferrule barrel without protruding.',
          'Crimp with a calibrated ratchet crimper and insert fully into the cage clamp.',
          'Tighten with a calibrated torque screwdriver to 0.8–1.2 N·m (avoiding PVC pinch or strand crushing).',
        ],
        answer: 'Strip 9 mm, Ferrule Crimp, Torque 1.0 N·m (Pull-out > 50 N)',
      },
    },
    {
      title: '3. Protective Earth (PE) Bonding & EMC Shield Termination',
      summary:
        'Protective Earth (PE) studs must carry fault currents safely to trip upstream breakers without dangerous touch voltages. Powder-coated or painted enclosures act as electrical insulators; paint must be scraped to bare metal (or penetrated with a serrated star washer) before torquing the PE lug. For VFD and servo motor cables, 360° EMC shield clamps bond high-frequency noise directly to the chassis.',
      equations: [
        {
          label: 'PE Continuity Resistance Target (IEC 60204-1)',
          formula: 'R_PE < 100 mΩ (typically < 1.0 mΩ at a clean stud)',
          note: 'An unscraped painted surface can add >40 mΩ–1000 mΩ, defeating fault protection.',
        },
      ],
    },
  ],
  practice: [
    {
      id: 'wire-p1',
      prompt:
        'A loose motor lug terminal has a contact resistance of 15 mΩ while carrying 20 A. Calculate the voltage drop across the joint in millivolts (mV).',
      hint: 'Use ΔV (mV) = I (A) × R_c (mΩ).',
      targetValue: 300,
      unit: 'mV',
      tolerance: 5,
      solutionSteps: [
        'Apply Ohm’s Law in milliohms: ΔV = I × R_c.',
        'ΔV = 20 A × 15 mΩ = 300 mV (0.30 V).',
      ],
    },
    {
      id: 'wire-p2',
      prompt:
        'Using the same 15 mΩ loose joint carrying 20 A, calculate the localized power dissipated as heat in Watts (W).',
      hint: 'Use P_loss = (I² × R_c) / 1000.',
      targetValue: 6.0,
      unit: 'W',
      tolerance: 0.2,
      solutionSteps: [
        'Convert R_c = 15 mΩ = 0.015 Ω.',
        'P_loss = I² × R = (20)² × 0.015 = 400 × 0.015 = 6.0 W.',
      ],
    },
    {
      id: 'wire-p3',
      prompt:
        'If load current through a 10 mΩ faulty splice doubles from 15 A to 30 A, calculate the new power dissipation in Watts (W).',
      hint: 'P_loss = (30² × 10) / 1000.',
      targetValue: 9.0,
      unit: 'W',
      tolerance: 0.2,
      solutionSteps: [
        'At 15 A: P = 15² × 0.010 = 2.25 W.',
        'At 30 A: P = 30² × 0.010 = 900 × 0.010 = 9.0 W (4× higher heat).',
      ],
    },
    {
      id: 'wire-p4',
      prompt:
        'According to IEC 60999-1, what is the minimum mechanical pull-out force (N) required for a 4 mm² conductor termination?',
      hint: 'Check the IEC 60999-1 pull-out table in Explore Section 2 (40, 50, 60, 80, 90 N).',
      targetValue: 60,
      unit: 'N',
      tolerance: 1,
      solutionSteps: [
        'IEC 60999-1 minimum pull-out thresholds: 1.5 mm² → 40 N, 2.5 mm² → 50 N, 4 mm² → 60 N.',
        'Therefore, a 4 mm² termination must withstand at least 60 N.',
      ],
    },
  ],
  quiz: [
    {
      id: 'wire-q1',
      question:
        'Why is tinning stranded copper wire with solder before clamping it under a screw terminal prohibited in industrial control panels?',
      options: [
        'Solder increases copper conductivity too much',
        'Solder undergoes cold-flow (creep) under screw pressure, causing the joint to loosen and overheat',
        'Solder prevents the screw from turning',
        'Solder is magnetic and causes eddy currents',
      ],
      correctIndex: 1,
      explanation:
        'Tin-lead and lead-free solders deform plastically (creep) under continuous clamping force, reducing contact pressure over time and creating high-resistance hotspots.',
    },
    {
      id: 'wire-q2',
      question:
        'What is the correct hardware stacking order when fastening a ring lug onto a motor terminal stud?',
      options: [
        'Stud Plate → Lock Washer → Ring Lug → Flat Washer → Nut',
        'Stud Plate → Flat Washer → Ring Lug → Nut',
        'Stud Plate → Ring Lug → Flat Washer → Spring Lock Washer → Nut',
        'Stud Plate → Nut → Ring Lug → Lock Washer',
      ],
      correctIndex: 2,
      explanation:
        'The ring lug must sit directly against the flat busbar/stud plate for maximum contact area, followed by a flat washer, spring lock washer, and hex nut.',
    },
    {
      id: 'wire-q3',
      question:
        'During a pre-commissioning inspection, a technician strips only 3 mm of PVC insulation and clamps the wire into a terminal block. What is the primary failure mode?',
      options: [
        'Insulation pinch: the screw clamps onto PVC plastic, causing high contact resistance and failed pull-out retention',
        'Excessive bare copper flashover',
        '360° EMC shield coupling',
        'Over-torque strand shearing',
      ],
      correctIndex: 0,
      explanation:
        'Insufficient strip length causes the clamp to bite onto the PVC jacket instead of bare copper/ferrule, resulting in open/high-R joints and mechanical pull-out failure.',
    },
    {
      id: 'wire-q4',
      question:
        'When terminating a Protective Earth (PE) ring lug onto a powder-coated steel cabinet, what must be done before torquing the nut?',
      options: [
        'Apply PVC electrical tape over the paint',
        'Scrape the paint down to bare metal (or use a paint-piercing serrated washer) to ensure low-impedance bonding',
        'Use a solder-tinned wire without a lug',
        'Torque to 0.2 N·m so the paint is not scratched',
      ],
      correctIndex: 1,
      explanation:
        'Paint and powder-coating are electrical insulators. Bare metal contact is mandatory for safe PE fault-current continuity.',
    },
    {
      id: 'wire-q5',
      question:
        'Which termination issue creates an immediate shock and phase-to-phase short-circuit flashover hazard outside the terminal housing?',
      options: [
        'Using a bootlace ferrule',
        'Oversized strip length leaving bare copper exposed outside the terminal block',
        'Using a calibrated torque screwdriver',
        'Bonding the EMC shield 360° to PE',
      ],
      correctIndex: 1,
      explanation:
        'Stripping too much insulation leaves live bare copper protruding outside the finger-safe terminal housing, risking accidental touch and arc flash.',
    },
  ],
};
