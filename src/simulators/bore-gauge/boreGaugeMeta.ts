import type { SimulatorMeta } from '../../types/simulator';
import './boreGaugeI18n';

export const boreGaugeMeta: SimulatorMeta = {
  id: 'bore-gauge',
  title: 'Dial Bore Gauge, Ovality & Cylinder Taper Lab',
  shortTitle: 'Dial Bore & Ovality',
  category: 'Precision Measurement',
  difficulty: 'Intermediate',
  description:
    'Interactive internal cylinder metrology simulator for 0.01 mm dial bore gauge rocking/null-point reversal technique, master ring gauge zeroing, and 6-point cylinder liner ovality and taper mapping.',
  iconName: 'Crosshair',
  accentColor: 'sky',
  explore: [
    {
      title: 'Dial Bore Gauge Rocking / Null-Point Reversal Technique',
      summary:
        'A two-point dial bore gauge (equipped with spring-loaded centering shoes) must be gently rocked back and forth across the cylinder axis. Whenever the gauge stem is tilted by an angle θ from perpendicular, the contact points span an oblique chord D / cos(θ) that is longer than the true bore diameter. The exact point where the dial needle stops and reverses direction (minimum bore reading) marks the true perpendicular diameter (θ = 0° null point).',
      equations: [
        {
          label: 'Oblique Span vs. Rocking Angle θ',
          formula: 'D(θ) = D_true / cos(θ) ≈ D_true * (1 + θ² / 2)',
          note: 'With θ in radians; any non-zero tilt angle causes the measured chord to exceed the true bore diameter D_true.',
        },
        {
          label: 'True Bore Diameter at Needle Reversal (Null Point)',
          formula: 'D_true = min_θ D(θ) = D_master + Δ_dial(θ = 0°)',
          note: 'Always record the reading at the exact instant the dial indicator pointer reaches its turning point and reverses.',
        },
        {
          label: 'Cosine Tilt Error (θ in degrees)',
          formula: 'e_rock = D_true * ((1 / cos(θ)) - 1)',
          note: 'In an 85 mm bore, holding the gauge just 3° off-square introduces +0.117 mm of error—more than double the 0.05 mm service limit.',
        },
      ],
      workedExample: {
        title: 'Measurement Error from Failing to Rock Through the Null Point',
        given: [
          'True cylinder bore diameter D_true = 85.020 mm',
          'Technician holds the bore gauge tilted at θ = 2.5° without rocking through the reversal point',
        ],
        steps: [
          'Evaluate cos(2.5°) = 0.999048.',
          'Apparent oblique span: D(2.5°) = 85.020 / 0.999048 = 85.101 mm.',
          'Tilt-induced cosine error: e_rock = 85.101 - 85.020 = +0.081 mm.',
          'By rocking the gauge smoothly through θ = 0°, the needle reverses at the true minimum diameter of 85.020 mm.',
        ],
        answer: 'D_true = 85.020 mm (a 2.5° tilt adds +0.081 mm false error)',
      },
    },
    {
      title: 'Cylinder Ovality |D_A - D_B| & Taper |D_top - D_bottom|',
      summary:
        'Cylinder liners wear unevenly in service. Connecting-rod angularity during the power stroke pushes the piston skirt hard against the thrust wall, causing elliptical wear along Axis A (0° Thrust) relative to Axis B (90° Wrist Pin). Simultaneously, peak combustion gas pressure, high temperature, and thin boundary lubrication near Top Dead Center (TDC) accelerate upper-cylinder wear, creating axial taper.',
      equations: [
        {
          label: 'Cylinder Ovality (Out-of-Round) at Any Depth Plane',
          formula: 'Ovality = |D_A - D_B|',
          note: 'Absolute difference between Axis A (0° Thrust) and Axis B (90° Pin) diameters measured at the same depth plane (Top, Mid, or Bottom).',
        },
        {
          label: 'Cylinder Taper Along Any Measurement Axis',
          formula: 'Taper = |D_top - D_bottom|',
          note: 'Absolute difference between Top (15 mm) and Bottom (135 mm) diameters measured in the same vertical plane (Axis A or Axis B).',
        },
        {
          label: 'OEM Re-Bore / Honing Service Limit Criterion',
          formula: 'max(Ovality) ≤ 0.050 mm  and  max(Taper) ≤ 0.050 mm',
          note: 'If either maximum ovality or maximum taper exceeds 0.050 mm, the cylinder must be rebored and honed for an oversize piston.',
        },
      ],
      workedExample: {
        title: 'Evaluating a 6-Point Bore Map Against the 0.05 mm OEM Service Limit',
        given: [
          'Top Plane (15 mm): D_A = 85.074 mm, D_B = 85.018 mm',
          'Mid Plane (75 mm): D_A = 85.048 mm, D_B = 85.014 mm',
          'Bottom Plane (135 mm): D_A = 85.012 mm, D_B = 85.008 mm',
          'OEM Maximum Service Limit for Ovality and Taper = 0.050 mm',
        ],
        steps: [
          'Calculate Ovality at each plane: Top = |85.074 - 85.018| = 0.056 mm; Mid = |85.048 - 85.014| = 0.034 mm; Bottom = |85.012 - 85.008| = 0.004 mm.',
          'Maximum Ovality = 0.056 mm (at Top plane).',
          'Calculate Taper along each axis: Axis A = |85.074 - 85.012| = 0.062 mm; Axis B = |85.018 - 85.008| = 0.010 mm.',
          'Maximum Taper = 0.062 mm (along Axis A). Both metrics exceed the 0.050 mm OEM service limit.',
        ],
        answer: 'Max Ovality = 0.056 mm, Max Taper = 0.062 mm → Re-Bore Required',
      },
    },
    {
      title: 'Master Ring Gauge Zeroing & Anvil Selection',
      summary:
        'A dial bore gauge is a comparative measuring instrument, not a direct-reading rule. Before inspecting a bore, you must select the fixed interchangeable anvil and spacer washers to slightly exceed the nominal diameter (providing ~0.5–1.0 mm spindle preload), insert the gauge head into a calibrated Master Setting Ring Gauge (or outside micrometer held in a bore-gauge setting fixture), rock to find the reversal point, and rotate the dial bezel to zero.',
      equations: [
        {
          label: 'Anvil & Spacer Stack Selection',
          formula: 'L_stack = L_anvil + L_shim ≈ D_nominal + Preload',
          note: 'A preload of 0.50 mm to 1.00 mm ensures the measuring plunger can travel both inward (smaller bore) and outward (larger bore).',
        },
        {
          label: 'Absolute Bore Diameter from Comparative Dial Deviation',
          formula: 'D_measured = D_ring + Δ_dial - e_zero',
          note: 'Where D_ring is the calibrated Master Ring ID, Δ_dial is the signed bore size deviation from zero, and e_zero is any bezel zeroing offset.',
        },
      ],
      workedExample: {
        title: 'Computing Actual Bore ID from Master Ring Zeroing',
        given: [
          'Calibrated Master Setting Ring Gauge D_ring = 85.000 mm',
          'Dial bore gauge zeroed (0.00 mm) at the reversal point inside the ring gauge with 1.00 mm preload',
          'When placed inside the cylinder liner, the null-point bore deviation reads +0.045 mm (bore larger than master ring)',
        ],
        steps: [
          'Since the gauge is zeroed at D_ring = 85.000 mm with e_zero = 0:',
          'Add the comparative bore size deviation (+0.045 mm) to the master ring reference diameter.',
          'D_measured = 85.000 mm + 0.045 mm = 85.045 mm.',
        ],
        answer: '85.045 mm',
      },
    },
  ],
  practice: [
    {
      id: 'bore-p1',
      prompt:
        'At the Mid depth plane (75 mm), Axis A (0° Thrust) measures 85.068 mm and Axis B (90° Pin) measures 85.016 mm. What is the cylinder ovality at the Mid plane in mm?',
      hint: 'Use Ovality = |D_A - D_B|.',
      targetValue: 0.052,
      unit: 'mm',
      tolerance: 0.002,
      solutionSteps: [
        'D_A = 85.068 mm and D_B = 85.016 mm.',
        'Ovality = |85.068 - 85.016| = 0.052 mm.',
      ],
    },
    {
      id: 'bore-p2',
      prompt:
        'Along Axis A (0° Thrust), the bore diameter at the Top plane (15 mm) is 85.084 mm and at the Bottom plane (135 mm) is 85.012 mm. What is the Axis A cylinder taper in mm?',
      hint: 'Use Taper = |D_top - D_bottom| along the same axis.',
      targetValue: 0.072,
      unit: 'mm',
      tolerance: 0.002,
      solutionSteps: [
        'D_top,A = 85.084 mm and D_bottom,A = 85.012 mm.',
        'Taper_A = |85.084 - 85.012| = 0.072 mm.',
      ],
    },
    {
      id: 'bore-p3',
      prompt:
        'A dial bore gauge (0.01 mm least count) is zeroed in an 85.000 mm Master Ring Gauge. When rocked in the upper cylinder, the null-point reversal indicates the bore is 3.5 divisions (+0.035 mm) larger than the master ring. What is the actual bore diameter in mm?',
      hint: 'Add the +0.035 mm deviation to the 85.000 mm master ring diameter.',
      targetValue: 85.035,
      unit: 'mm',
      tolerance: 0.005,
      solutionSteps: [
        'Master Ring reference diameter = 85.000 mm.',
        'Measured bore deviation = +3.5 * 0.01 mm = +0.035 mm.',
        'Actual bore diameter = 85.000 + 0.035 = 85.035 mm.',
      ],
    },
    {
      id: 'bore-p4',
      prompt:
        'A cylinder liner has a true bore diameter D_true = 85.000 mm. If the bore gauge is held tilted at θ = 4.0° without rocking to the null point, what apparent span D(θ) = D_true / cos(4°) is measured in mm? (Round to 2 decimal places)',
      hint: 'cos(4°) ≈ 0.997564. Compute 85.000 / 0.997564.',
      targetValue: 85.21,
      unit: 'mm',
      tolerance: 0.02,
      solutionSteps: [
        'cos(4.0°) = 0.997564.',
        'D(4.0°) = 85.000 / 0.997564 = 85.2075 mm ≈ 85.21 mm.',
      ],
    },
    {
      id: 'bore-p5',
      prompt:
        'A 6-point bore map records: Top (A=85.062, B=85.020), Mid (A=85.045, B=85.015), Bottom (A=85.014, B=85.010) mm. What is the Maximum Taper across both axes in mm?',
      hint: 'Compute Taper_A = |85.062 - 85.014| and Taper_B = |85.020 - 85.010|, then take the larger value.',
      targetValue: 0.048,
      unit: 'mm',
      tolerance: 0.002,
      solutionSteps: [
        'Axis A Taper = |85.062 - 85.014| = 0.048 mm.',
        'Axis B Taper = |85.020 - 85.010| = 0.010 mm.',
        'Max Taper = max(0.048, 0.010) = 0.048 mm.',
      ],
    },
  ],
  quiz: [
    {
      id: 'bore-q1',
      question:
        'Why must a two-point dial bore gauge be rocked back and forth across the bore axis when taking a cylinder diameter reading?',
      options: [
        'To spread lubricating oil evenly under the contact anvil',
        'To locate the needle reversal point (minimum diameter reading) where the measuring axis is strictly perpendicular to the cylinder axis',
        'To release spring tension from the centering shoes',
        'To automatically average the top and bottom cylinder diameters',
      ],
      correctIndex: 1,
      explanation:
        'Tilting the gauge measures an oblique elliptical chord D/cos(θ) that is larger than the true diameter. The needle reversal point marks the minimum span at θ = 0° (true perpendicular bore diameter).',
    },
    {
      id: 'bore-q2',
      question:
        'What is the mechanical purpose of the spring-loaded centering shoes (guide bridge) on a dial bore gauge head?',
      options: [
        'To lock the gauge vertically at a fixed depth',
        'To self-center the measuring plunger and anvil across the maximum chord (true center) in the radial cross-section',
        'To compensate automatically for thermal expansion',
        'To double the dial indicator resolution from 0.01 mm to 0.005 mm',
      ],
      correctIndex: 1,
      explanation:
        'The centering bridge aligns the contact line radially across the bore center (maximum chord in the horizontal cross-section), while vertical rocking locates the minimum axial tilt (θ = 0°).',
    },
    {
      id: 'bore-q3',
      question:
        'In a reciprocating internal combustion engine or reciprocating compressor, where does the greatest cylinder taper wear typically occur?',
      options: [
        'At the very bottom of the liner below piston skirt travel',
        'Near the top of the liner at the Top Dead Center (TDC) top-ring reversal zone',
        'Only along the wrist-pin axis (90°) at the bottom plane',
        'Uniformly at all depths from top to bottom',
      ],
      correctIndex: 1,
      explanation:
        'Just below TDC (Top — 15 mm), peak combustion gas pressure forces the top ring outward against the wall under maximum temperature and near-zero piston velocity (boundary lubrication).',
    },
    {
      id: 'bore-q4',
      question:
        'Why does Axis A (0° Thrust Axis, perpendicular to the crankshaft) typically exhibit greater ovality wear than Axis B (90° Wrist Pin Axis)?',
      options: [
        'Because the wrist pin expands thermally only along the crankshaft axis',
        'Because connecting-rod angularity during the power stroke generates high lateral side-thrust force against the 0° thrust wall',
        'Because coolant passages only surround the 90° pin axis',
        'Because piston rings cannot rotate past the thrust axis',
      ],
      correctIndex: 1,
      explanation:
        'Connecting-rod obliquity resolves combustion force into a strong horizontal side-thrust component along Axis A (0°), wearing the thrust and anti-thrust walls into an oval profile.',
    },
    {
      id: 'bore-q5',
      question:
        'At the Mid plane (75 mm), you measure D_A = 85.072 mm and D_B = 85.014 mm. Given an OEM maximum ovality service limit of 0.050 mm, what is the correct inspection verdict?',
      options: [
        'Pass — Ovality is 0.029 mm, well within the 0.050 mm limit',
        'Reject / Re-Bore Required — Ovality is 0.058 mm, exceeding the 0.050 mm OEM service limit',
        'Pass — as long as axial taper is under 0.050 mm',
        'Install standard-size rings without honing or reboring',
      ],
      correctIndex: 1,
      explanation:
        'Ovality = |85.072 - 85.014| = 0.058 mm, which exceeds the 0.050 mm service limit and requires reboring/honing to the next oversize specification.',
    },
    {
      id: 'bore-q6',
      question:
        'Which reference tool should be used to zero a precision 0.01 mm dial bore gauge before inspecting an engine block?',
      options: [
        'A 300 mm steel machinist rule',
        'The inside knife-edge jaws of a 0.05 mm vernier caliper',
        'A calibrated Master Setting Ring Gauge (or precision outside micrometer held in a setting fixture)',
        'A stack of leaf feeler gauges',
      ],
      correctIndex: 2,
      explanation:
        'A lapped Master Setting Ring Gauge (or calibrated micrometer setting fixture) provides a micron-accurate reference bore to zero the dial indicator at its reversal point.',
    },
  ],
};
