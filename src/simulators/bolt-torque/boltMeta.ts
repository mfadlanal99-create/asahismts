import type { SimulatorMeta } from '../../types/simulator';
import './boltI18n';

export const boltTorqueMeta: SimulatorMeta = {
  id: 'bolt-torque',
  title: 'Bolted Joint & Torque Wrench Simulator',
  shortTitle: 'Bolt Torque',
  category: 'Machine Elements',
  difficulty: 'Beginner',
  description:
    'Explore torque-preload mechanics (T = K·d·Fi), nut factor (K) lubrication effects, proof-load safety, and multi-pass star-pattern flange tightening.',
  iconName: 'Wrench',
  accentColor: 'amber',
  explore: [
    {
      title: 'Torque-Preload Relation (T = K · d · Fi)',
      summary:
        'A torque wrench measures rotational effort, not bolt tension directly. Roughly 90% of applied torque overcomes thread and under-head bearing friction, leaving only ~10% to stretch the bolt and create clamping preload (Fi). The dimensionless nut factor K captures this friction.',
      equations: [
        {
          label: 'Torque-Preload Equation',
          formula: 'T = K · d · Fi',
          note: 'With T in N·m, d in mm, and Fi in kN (since 1 N·m / 1 mm = 1 kN)',
        },
        {
          label: 'Clamping Preload from Torque',
          formula: 'Fi = T / (K · d)',
          note: 'Lowering K (lubrication) increases Fi at the same torque T',
        },
        {
          label: 'Typical Nut Factors (K)',
          formula: 'Moly: 0.12  |  Light Oil: 0.15  |  Dry: 0.20  |  Zinc: 0.22',
          note: 'Applying dry torque specs to lubricated threads can overload the bolt by 40–67%',
        },
      ],
      workedExample: {
        title: 'Calculating Target Torque for an M12 Class 8.8 Bolt',
        given: [
          'Bolt size: M12 (d = 12 mm, At = 84.3 mm²)',
          'Property Class 8.8 (Proof strength Sp = 600 MPa)',
          'Condition: Dry steel (K = 0.20), target preload = 75% of proof load',
        ],
        steps: [
          'Compute Proof Load: Fp = (Sp · At) / 1000 = (600 × 84.3) / 1000 = 50.58 kN',
          'Compute Target Preload (75%): Fi = 0.75 × 50.58 = 37.94 kN',
          'Compute Tightening Torque: T = K · d · Fi = 0.20 × 12 × 37.94 = 91.0 N·m',
        ],
        answer: 'T = 91.0 N·m (producing 37.9 kN clamping preload)',
      },
    },
    {
      title: 'Proof Load, Tensile Stress & Yield Safety',
      summary:
        'A fastener acts like a stiff spring. Tightening stretches it within the elastic range so it clamps the joint members together. Exceeding the ISO 898-1 Proof Strength (Sp) causes permanent plastic stretch, loss of preload under vibration, or thread stripping.',
      equations: [
        {
          label: 'Bolt Tensile Stress',
          formula: 'σt = (Fi · 1000) / At',
          note: 'σt in MPa, Fi in kN, At = tensile stress area in mm²',
        },
        {
          label: 'Proof Load Capacity',
          formula: 'Fp = (Sp · At) / 1000',
          note: 'Maximum load the bolt must withstand without permanent set',
        },
        {
          label: 'Recommended Reusable Preload',
          formula: 'Fi,target = 0.75 · Fp',
          note: 'Leaves a 25% safety margin for wrench scatter and service loads',
        },
      ],
      workedExample: {
        title: 'Checking Over-Torque When Lubrication Changes',
        given: [
          'M12 Class 8.8 bolt (Fp = 50.58 kN, Sp = 600 MPa, At = 84.3 mm²)',
          'Dry torque T = 91.0 N·m is mistakenly applied to Moly Paste threads (K = 0.12)',
        ],
        steps: [
          'Compute actual preload: Fi = T / (K · d) = 91.0 / (0.12 × 12) = 63.19 kN',
          'Compute tensile stress: σt = (63.19 × 1000) / 84.3 = 749.6 MPa',
          'Compare to Proof Strength: (749.6 / 600) × 100 = 124.9% of Proof (exceeds Yield Sy = 640 MPa!)',
        ],
        answer: 'Bolt yields permanently at 125% Proof Load — replace fastener and reduce torque.',
      },
    },
    {
      title: 'Flange Star-Pattern Tightening & Gasket Compression',
      summary:
        'Tightening flange bolts sequentially around the circle tilts (cocks) the flange, crushing one side of the gasket while leaving the opposite side loose. Multi-pass cross/star tightening (30% → 70% → 100%) distributes elastic interaction and seats the gasket uniformly.',
      equations: [
        {
          label: '6-Bolt Star Sequence',
          formula: '1 → 4 → 2 → 5 → 3 → 6',
          note: 'Always jump 180° across the flange center between consecutive bolts',
        },
        {
          label: '8-Bolt Star Sequence',
          formula: '1 → 5 → 3 → 7 → 2 → 6 → 4 → 8',
          note: 'First cross-quadrant (1-5-3-7), then staggered cross-quadrant (2-6-4-8)',
        },
        {
          label: 'Three-Pass Torque Staging (ASME PCC-1)',
          formula: 'Pass 1: 30% T  →  Pass 2: 70% T  →  Pass 3: 100% T',
          note: 'Follow with a final clockwise check pass at 100% T to catch elastic relaxation',
        },
      ],
      workedExample: {
        title: 'Staging an 8-Bolt Pipe Flange to 400 N·m',
        given: [
          '8-bolt flange with target final torque T_final = 400 N·m',
          'Gasket requires even compression across all 3 passes',
        ],
        steps: [
          'Pass 1 (30%): Set torque wrench to 0.30 × 400 = 120 N·m; tighten 1 → 5 → 3 → 7 → 2 → 6 → 4 → 8.',
          'Pass 2 (70%): Set torque wrench to 0.70 × 400 = 280 N·m; repeat star sequence.',
          'Pass 3 (100%): Set torque wrench to 400 N·m; repeat star sequence, then verify clockwise.',
        ],
        answer: 'Uniform gasket compression achieved with minimal elastic cross-talk.',
      },
    },
    {
      title: 'ISO 898-1 Property Classes Explained',
      summary:
        'Metric bolt head markings (8.8, 10.9, 12.9) directly encode tensile and yield strength. The first number × 100 gives nominal ultimate tensile strength (MPa); multiplying the two numbers × 10 gives nominal yield strength (MPa).',
      equations: [
        {
          label: 'Class 8.8',
          formula: 'Sut = 800 MPa  |  Sy = 640 MPa  |  Sp = 600 MPa',
          note: 'Standard medium-carbon quenched & tempered machinery bolt',
        },
        {
          label: 'Class 10.9',
          formula: 'Sut = 1040 MPa  |  Sy = 940 MPa  |  Sp = 830 MPa',
          note: 'High-strength alloy steel for structural and automotive joints',
        },
        {
          label: 'Class 12.9',
          formula: 'Sut = 1220 MPa  |  Sy = 1100 MPa  |  Sp = 970 MPa',
          note: 'Ultra-high strength socket head cap screws; sensitive to hydrogen embrittlement',
        },
      ],
    },
  ],
  practice: [
    {
      id: 'bt-p1',
      prompt:
        'Calculate the recommended tightening torque (at 75% of proof load) for an M12 Class 8.8 bolt (At = 84.3 mm², Sp = 600 MPa) under Dry conditions (K = 0.20).',
      hint: 'First find Proof Load Fp = Sp × At / 1000, take 75% for Fi, then use T = K × d × Fi.',
      targetValue: 91.0,
      unit: 'N·m',
      tolerance: 2.0,
      solutionSteps: [
        'Proof load Fp = (600 MPa × 84.3 mm²) / 1000 = 50.58 kN',
        'Target preload Fi = 0.75 × 50.58 kN = 37.935 kN',
        'Torque T = K × d × Fi = 0.20 × 12 mm × 37.935 kN = 91.04 N·m',
      ],
    },
    {
      id: 'bt-p2',
      prompt:
        'An M16 bolt lubricated with Moly Paste (K = 0.12) is tightened to 180 N·m. What clamping preload Fi (in kN) is generated?',
      hint: 'Rearrange T = K · d · Fi to Fi = T / (K · d), keeping d in mm and Fi in kN.',
      targetValue: 93.75,
      unit: 'kN',
      tolerance: 1.5,
      solutionSteps: [
        'Use Fi = T / (K × d)',
        'Fi = 180 N·m / (0.12 × 16 mm) = 180 / 1.92 = 93.75 kN',
      ],
    },
    {
      id: 'bt-p3',
      prompt:
        'An M10 bolt (At = 58.0 mm²) carries a clamping preload of 34.8 kN. What is the resulting tensile stress σt in MPa?',
      hint: 'Convert Fi from kN to N (× 1000) and divide by the tensile stress area At in mm².',
      targetValue: 600,
      unit: 'MPa',
      tolerance: 5,
      solutionSteps: [
        'σt = (Fi × 1000) / At',
        'σt = (34.8 × 1000) / 58.0 = 34,800 / 58.0 = 600 MPa',
      ],
    },
    {
      id: 'bt-p4',
      prompt:
        'A technician applies 91.0 N·m (the dry spec) to an M12 bolt coated with Moly Paste (K = 0.12). What clamping preload Fi (in kN) results?',
      hint: 'Divide T = 91.0 N·m by (0.12 × 12 mm). Notice how much higher it is than the 50.58 kN proof load!',
      targetValue: 63.2,
      unit: 'kN',
      tolerance: 1.5,
      solutionSteps: [
        'Fi = T / (K × d) = 91.0 / (0.12 × 12) = 91.0 / 1.44 = 63.19 kN',
        'Since M12 Class 8.8 proof load is 50.58 kN, this overloads the bolt to ~125% of proof.',
      ],
    },
    {
      id: 'bt-p5',
      prompt:
        'An 8-bolt pipe flange has a final target torque of 420 N·m. What torque should be set on the wrench for Pass 1 (30% snug pass)?',
      hint: 'Multiply the final target torque by 0.30.',
      targetValue: 126,
      unit: 'N·m',
      tolerance: 2,
      solutionSteps: [
        'Pass 1 (30%): T1 = 0.30 × 420 N·m = 126 N·m',
      ],
    },
  ],
  quiz: [
    {
      id: 'bt-q1',
      question:
        'Roughly what percentage of applied tightening torque actually goes into stretching a dry steel bolt (creating preload)?',
      options: ['~10%', '~50%', '~75%', '~90%'],
      correctIndex: 0,
      explanation:
        'About 50% of torque overcomes under-head bearing friction and ~40% overcomes thread friction, leaving only ~10% to create clamping preload.',
    },
    {
      id: 'bt-q2',
      question:
        'If you switch from Dry (K = 0.20) to Moly Paste (K = 0.12) without reducing the wrench torque setting, what happens to the bolt preload?',
      options: [
        'Preload increases by 67% (risk of yielding/snapping the bolt)',
        'Preload decreases by 40% (risk of joint loosening)',
        'Preload stays the same because torque is unchanged',
        'Only the nut factor changes, not tensile stress',
      ],
      correctIndex: 0,
      explanation:
        'Since Fi = T / (K·d), reducing K from 0.20 to 0.12 multiplies preload by 0.20 / 0.12 = 1.67 (+67%).',
    },
    {
      id: 'bt-q3',
      question:
        'What is the standard ASME PCC-1 star-pattern sequence for an 8-bolt flange?',
      options: [
        '1 → 5 → 3 → 7 → 2 → 6 → 4 → 8',
        '1 → 2 → 3 → 4 → 5 → 6 → 7 → 8',
        '1 → 3 → 5 → 7 → 2 → 4 → 6 → 8',
        '1 → 4 → 7 → 2 → 5 → 8 → 3 → 6',
      ],
      correctIndex: 0,
      explanation:
        'Tightening 180° opposites in quadrants (1-5, 3-7, then 2-6, 4-8) prevents flange cocking and compresses the gasket evenly.',
    },
    {
      id: 'bt-q4',
      question:
        'What does the "10.9" marking on a metric bolt head indicate?',
      options: [
        'Nominal tensile strength 1000 MPa and yield strength 900 MPa (90% of tensile)',
        '10 mm diameter and 0.9 mm thread pitch',
        'Minimum proof load of 10.9 kN',
        'Recommended nut factor K = 0.109',
      ],
      correctIndex: 0,
      explanation:
        'In ISO 898-1, the first number × 100 is nominal tensile strength (1000 MPa; actual min 1040 MPa) and the second digit is the yield-to-tensile ratio (0.9 → ~900–940 MPa).',
    },
    {
      id: 'bt-q5',
      question:
        'Why are reusable bolted joints typically tightened to ~75% of Proof Load rather than 100%?',
      options: [
        'To allow a margin for torque wrench scatter and external service loads without permanent yielding',
        'Because bolts cannot carry any shear load above 75% proof',
        'To ensure the gasket never compresses',
        'Because nut factor K drops to zero above 75% proof',
      ],
      correctIndex: 0,
      explanation:
        'Torque-based tightening has ±20–25% preload scatter; targeting 75% of proof load keeps the bolt safely below permanent plastic deformation.',
    },
    {
      id: 'bt-q6',
      question:
        'Why should a flange be tightened in three progressive passes (30% → 70% → 100%) instead of 100% on the first pass?',
      options: [
        'To seat the gasket uniformly and compensate for elastic bolt cross-talk as adjacent bolts compress the flange',
        'To allow the bolt steel to work-harden between passes',
        'Because click-type torque wrenches cannot measure 100% torque in one pull',
        'To increase the nut factor K on each pass',
      ],
      correctIndex: 0,
      explanation:
        'Tightening one bolt compresses the gasket locally, reducing preload in previously tightened bolts (elastic interaction). Progressive passes keep the flange parallel.',
    },
  ],
};
