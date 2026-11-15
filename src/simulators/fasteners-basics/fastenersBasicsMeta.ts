import type { SimulatorMeta } from '../../types/simulator';
import './fastenersBasicsI18n';

export const fastenersBasicsMeta: SimulatorMeta = {
  id: 'fasteners-basics',
  title: 'Beginner: Bolt, Nut, Washer & Property Class Lab',
  shortTitle: 'Bolt, Nut & Washer Basics',
  description:
    'Beginner-friendly machine elements lab covering industrial fastener identification (Hex DIN 933, Allen Socket DIN 912, Countersunk, Carriage, Stud), lock nuts (Nyloc, Flange, Castle + Cotter), anti-vibration washers (Flat, Split Spring, Nord-Lock), ISO property classes (4.8, 8.8, 10.9, 12.9, A2/A4), and metric spanner sizing (M6–M16).',
  category: 'Machine Elements',
  difficulty: 'Beginner',
  iconName: 'Wrench',
  accentColor: 'emerald',
  explore: [
    {
      title: 'Metric Bolt Property Classes (ISO 898-1 & ISO 3506)',
      summary:
        'Structural carbon and alloy steel metric bolts carry a two-number embossed stamp on the head (such as 8.8, 10.9, or 12.9). Multiplying the first number by 100 yields nominal ultimate tensile strength (Rm) in MPa. Multiplying Rm by the second digit divided by 10 yields nominal yield strength (Re).',
      equations: [
        {
          label: 'Nominal Ultimate Tensile Strength (Rm)',
          formula: 'R_m = First_Number × 100 MPa',
          note: 'Example for Class 8.8: 8 × 100 = 800 MPa.',
        },
        {
          label: 'Nominal Yield Strength (Re)',
          formula: 'R_e = R_m × (Second_Digit / 10)',
          note: 'Example for Class 8.8: 800 × 0.8 = 640 MPa.',
        },
        {
          label: 'Proof Load Stress (Sp)',
          formula: 'S_p ≈ 0.90 × R_e',
          note: 'Elastic stress limit without measurable permanent set (~580 MPa for Class 8.8).',
        },
        {
          label: 'Stainless Steel Grades (ISO 3506: A2 / A4)',
          formula: 'A2-70 (AISI 304, Rm = 700 MPa) | A4-80 (AISI 316, Rm = 800 MPa)',
          note: 'A2 resists general indoor corrosion; A4 adds Molybdenum for marine & chemical resistance.',
        },
      ],
      workedExample: {
        title: 'Decoding Tensile & Yield Strength for a Class 10.9 Bolt',
        given: [
          'Fastener: M12 Hex Bolt Class 10.9 (DIN 933)',
          'First number = 10',
          'Second digit = 9',
        ],
        steps: [
          'Calculate Nominal Tensile Strength (Rm): Rm = 10 × 100 = 1000 MPa (N/mm²).',
          'Calculate Yield Ratio: Ratio = 9 / 10 = 0.90 (90%).',
          'Calculate Nominal Yield Strength (Re): Re = 1000 MPa × 0.90 = 900 MPa.',
          'Elastic Proof Stress (Sp): Sp ≈ 830 MPa.',
        ],
        answer: 'Tensile = 1000 MPa, Yield = 900 MPa (Quenched & Tempered Alloy Steel)',
      },
    },
    {
      title: 'Nuts, Washers & Anti-Loosening Locking Mechanisms',
      summary:
        'Transverse cyclic vibration is the primary cause of bolted joint self-loosening. Engineers pair standard bolts with specialized locking hardware: friction-based nylon inserts (Nyloc), serrated bearing flanges, spring washers, Junker-tested Nord-Lock wedge pairs, or positive mechanical locking via slotted Castle Nuts with cotter pins.',
      equations: [
        {
          label: 'Transverse Slip Loosening Condition',
          formula: 'F_transverse > μ · F_clamp',
          note: 'When transverse shear overcomes under-head and thread friction, the bolt unwinds.',
        },
        {
          label: 'Nord-Lock Wedge Principle (Tension-Based)',
          formula: 'Cam Wedge Angle (α) > Thread Helix Angle (β)',
          note: 'Pair of cam-faced washers increases axial tension if the nut attempts to rotate loose.',
        },
      ],
      workedExample: {
        title: 'Selecting Vibration Locking Hardware for a Quarry Vibrating Screen',
        given: [
          'Application: Heavy-duty mining vibrating screen',
          'Condition: Continuous high-frequency transverse cyclic vibration',
          'Options: Standard Nut + Split Spring DIN 127 vs. Nord-Lock Wedge Pair DIN 25201',
        ],
        steps: [
          'Evaluate DIN 127 Split Spring: Under dynamic Junker vibration tests, spring washers flatten completely at normal clamp load and offer minimal anti-rotation resistance.',
          'Evaluate Nord-Lock: Cam angle α exceeds thread pitch angle β, locking the joint via tension rather than plain friction.',
          'Recommendation: Install lightly oiled Nord-Lock wedge washers with Class 8.8 or 10.9 hardware.',
        ],
        answer: 'Select Nord-Lock Wedge Washers (DIN 25201) for maximum vibration security.',
      },
    },
    {
      title: 'Bolt Head Geometry, Spanner Sizing (AF) & Torque T = K · d · Fi',
      summary:
        'Bolt head selection balances tool access, flush surface requirements, and torque transmission. Hex DIN 933 suits open spanner clearance, Allen DIN 912 fits tight counterbored pockets, Countersunk sits flush, and Carriage bolts lock in square slots. Target tightening torque scales with diameter, 75% proof preload, and nut factor K.',
      equations: [
        {
          label: 'Torque–Preload Relationship',
          formula: 'T = K · d · F_i',
          note: 'K ≈ 0.20 (dry steel) or 0.15 (lubricated), d = nominal diameter (m), Fi = axial preload (N).',
        },
        {
          label: 'Bolt Proof Load (Fp)',
          formula: 'F_p = S_p · A_s',
          note: 'Sp = proof stress (MPa), As = tensile stress area (mm²). Standard target preload = 0.75 · Fp.',
        },
      ],
      workedExample: {
        title: 'Calculating Target Tightening Torque for Dry M10 Class 8.8',
        given: [
          'M10 Bolt (d = 10 mm = 0.010 m, As = 58.0 mm²)',
          'Property Class 8.8 (Sp = 580 MPa)',
          'Condition: Dry steel (K = 0.20), target preload 75% of proof load',
        ],
        steps: [
          'Calculate Proof Load: Fp = 580 MPa × 58.0 mm² = 33,640 N (33.64 kN).',
          'Calculate Target Preload (75%): Fi = 0.75 × 33,640 N = 25,230 N.',
          'Calculate Target Torque: T = 0.20 × 0.010 m × 25,230 N = 50.46 N·m.',
          'Select Spanner: Standard M10 Hex DIN 933 uses a 17 mm wrench (8 mm hex key for DIN 912).',
        ],
        answer: 'T = 50.5 N·m (Use 17 mm wrench for DIN 933)',
      },
    },
  ],
  practice: [
    {
      id: 'p1',
      prompt:
        'Calculate the nominal Yield Strength (MPa) of a metric steel bolt stamped with Property Class 8.8.',
      hint: 'Multiply the first number by 100 to get UTS, then multiply by 0.8.',
      targetValue: 640,
      unit: 'MPa',
      tolerance: 5,
      solutionSteps: [
        'Nominal Tensile Strength: Rm = 8 × 100 = 800 MPa.',
        'Nominal Yield Strength: Re = 800 × 0.8 = 640 MPa.',
      ],
    },
    {
      id: 'p2',
      prompt:
        'Calculate the nominal Yield Strength (MPa) of a high-strength alloy bolt stamped with Property Class 10.9.',
      hint: '10 gives UTS = 1000 MPa, and .9 means yield strength is 90% of UTS.',
      targetValue: 900,
      unit: 'MPa',
      tolerance: 5,
      solutionSteps: [
        'Nominal Tensile Strength: Rm = 10 × 100 = 1000 MPa.',
        'Nominal Yield Strength: Re = 1000 × 0.9 = 900 MPa.',
      ],
    },
    {
      id: 'p3',
      prompt:
        'What standard metric wrench / spanner size (Across Flats - AF) in mm fits a standard M10 Hex Bolt (DIN 933)?',
      hint: 'Standard DIN 933 sizing for M10 uses a 17 mm spanner.',
      targetValue: 17,
      unit: 'mm',
      tolerance: 0.5,
      solutionSteps: [
        'Per DIN 933 / ISO 4017 for standard metric M10 hex head bolts, the across-flats width (s) is 17 mm.',
      ],
    },
    {
      id: 'p4',
      prompt:
        'What standard metric wrench / spanner size (AF) in mm fits a standard M12 Hex Bolt (DIN 933)?',
      hint: 'Standard DIN 933 progression: M6→10mm, M8→13mm, M10→17mm, M12→19mm, M16→24mm.',
      targetValue: 19,
      unit: 'mm',
      tolerance: 0.5,
      solutionSteps: [
        'Per DIN 933 for M12 hex bolts, the standard across-flats head width is 19 mm.',
      ],
    },
    {
      id: 'p5',
      prompt:
        'Using T = K · d · Fi, calculate the tightening torque (N·m) for an M10 bolt (d = 10 mm) in dry condition (K = 0.20) with target clamp preload Fi = 25 kN.',
      hint: 'Convert d = 0.010 m and Fi = 25,000 N, then multiply T = 0.20 × 0.010 × 25,000.',
      targetValue: 50,
      unit: 'N·m',
      tolerance: 1,
      solutionSteps: [
        'Convert to SI units: d = 0.010 m, Fi = 25,000 N.',
        'Compute Torque: T = 0.20 × 0.010 × 25,000 = 50.0 N·m.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q1',
      question:
        'In the ISO metric bolt stamp "10.9", what do "10" and ".9" represent?',
      options: [
        'Nominal tensile strength of 1000 MPa, and yield strength equal to 90% of tensile (900 MPa)',
        'Bolt length of 10 cm and thread diameter of 9 mm',
        'Grade 10 thread tolerance with 0.9 mm thread pitch',
        'Maximum 10 tightening cycles under a 9 kN shear load',
      ],
      correctIndex: 0,
      explanation:
        'Under ISO 898-1, multiplying the first number by 100 yields nominal tensile strength (10 × 100 = 1000 MPa), and the second digit represents yield-to-tensile ratio in tenths (0.9 × 1000 = 900 MPa).',
    },
    {
      id: 'q2',
      question:
        'What is the core operating principle of Nord-Lock wedge-locking washers (DIN 25201) under severe vibration?',
      options: [
        'Cam wedge angle (α) exceeds thread pitch angle (β), creating a wedge effect that increases tension if loosening begins',
        'Anaerobic adhesive capsules embedded inside the washer serrations glue the nut permanently',
        'Elastomer rubber rings cushion axial vibration energy without metallic contact',
        'Flat bearing friction prevents thread movement without any geometric cam engagement',
      ],
      correctIndex: 0,
      explanation:
        'Nord-Lock washers lock via tension rather than friction. Because cam angle α > thread helix angle β, any backing rotation forces the upper cam to climb, raising clamp tension and jamming the nut.',
    },
    {
      id: 'q3',
      question:
        'Which nut type incorporates slotted castellations designed to accept a split cotter pin for positive mechanical locking?',
      options: [
        'Castle Nut (DIN 935)',
        'Nyloc Nylon-Insert Nut (DIN 985)',
        'Serrated Flange Nut (DIN 6923)',
        'Acorn Cap Nut (DIN 1587)',
      ],
      correctIndex: 0,
      explanation:
        'A Castle Nut (DIN 935) features machined slots across its top crown. Once torqued, a cotter pin passes through a slot and a cross-drilled hole in the bolt shaft, physically blocking rotation.',
    },
    {
      id: 'q4',
      question:
        'Why should Nyloc lock nuts (DIN 985) be replaced after 2–3 assembly cycles or in safety-critical joints?',
      options: [
        'The internal nylon collar undergoes permanent plastic deformation, reducing prevailing locking torque',
        'Nylon collars melt under normal room temperatures',
        'The steel body of a Nyloc nut has no hardened threads',
        'Nyloc nuts are only compatible with DIN 127 spring washers',
      ],
      correctIndex: 0,
      explanation:
        'A Nyloc nut relies on the elastic/plastic interference of its polymer collar cutting slightly against male threads. Repeated reuse wears the polymer groove and lowers locking drag.',
    },
    {
      id: 'q5',
      question:
        'What did dynamic Junker transverse vibration testing reveal about standard Split Spring Lock Washers (DIN 127)?',
      options: [
        'They flatten completely at normal preload and often accelerate self-loosening under cyclic shear vibration',
        'They outperform both Nord-Lock wedge pairs and cotter-pinned castle nuts',
        'They eliminate the need for any nut locking feature on vibrating machinery',
        'They are designed exclusively for flush Countersunk DIN 7991 bolts',
      ],
      correctIndex: 0,
      explanation:
        'Once tightened to normal steel bolt preloads, DIN 127 split washers compress completely flat and lose their spring bite, behaving like an uncalibrated flat washer during vibration.',
    },
    {
      id: 'q6',
      question:
        'Which stainless steel grade is strongly preferred for outdoor marine spray, coastal decks, or chemical acid washdown?',
      options: [
        'Stainless A4-80 (AISI 316 with Molybdenum alloy, Rm 800 MPa)',
        'Uncoated low-carbon steel Class 4.8',
        'Black-oxide alloy steel Class 12.9 without corrosion barrier',
        'Standard A2-70 (AISI 304 without Molybdenum)',
      ],
      correctIndex: 0,
      explanation:
        'A4 stainless steel (AISI 316) contains 2–3% Molybdenum, providing far superior resistance to chloride pitting corrosion in seawater and acidic chemical plants compared with A2 (AISI 304).',
    },
  ],
};
