import type { SimulatorMeta } from '../../types/simulator';
import './alignmentI18n';

export const alignmentMeta: SimulatorMeta = {
  id: 'alignment',
  title: 'Dial Gauge & Shaft Alignment Simulator',
  shortTitle: 'Shaft Alignment',
  category: 'Rotating Equipment',
  difficulty: 'Intermediate',
  description:
    'Diagnose parallel offset and angular misalignment using rim-and-face dial indicators, compensate for bar sag, and calculate motor foot shims.',
  iconName: 'Activity',
  accentColor: 'emerald',
  explore: [
    {
      title: 'Rim & Face Dial Indicator Method',
      summary:
        'In the Rim-and-Face method, one dial indicator rides radially on the coupling hub (Rim) to measure parallel offset, while a second indicator rides axially on the coupling face (Face) to measure angular tilt. Both shafts are rotated together through 0° (Top), 90° (Right), 180° (Bottom), and 270° (Left) after zeroing at 12 o’clock.',
      equations: [
        {
          label: 'Parallel Offset (Vertical)',
          formula: 'y_c = -(R_B - R_T) / 2',
          note: 'A Total Indicator Reading (TIR) on the rim equals twice the centerline offset.',
        },
        {
          label: 'Parallel Offset (Horizontal)',
          formula: 'x_c = (R_R - R_L) / 2',
          note: 'Measured between 3 o’clock (R) and 9 o’clock (L).',
        },
        {
          label: 'Angularity (Slope)',
          formula: 'θ_v = (F_B - F_T) / D',
          note: 'Face TIR divided by the indicator sweep diameter D (rad or mm/mm).',
        },
      ],
      workedExample: {
        title: 'Finding Coupling Offset and Angularity',
        given: [
          'Coupling sweep diameter D = 150 mm',
          'Compensated Rim readings: T = 0.00 mm, B = +0.50 mm',
          'Face readings: T = 0.00 mm, B = +0.18 mm',
        ],
        steps: [
          'Vertical offset at coupling: y_c = -(0.50 - 0.00) / 2 = -0.25 mm (motor is 0.25 mm low).',
          'Vertical angular slope: θ_v = (0.18 - 0.00) / 150 = +0.0012 rad.',
          'Express angularity per 100 mm: 0.0012 × 100 = 0.12 mm / 100 mm.',
        ],
        answer: 'Motor is 0.25 mm low at the coupling with +0.12 mm/100 mm upward tilt.',
      },
    },
    {
      title: 'Bar Sag & The Validity Rule (T + B = L + R)',
      summary:
        'Gravity bends the indicator mounting bracket downward as the shafts rotate, making the 6 o’clock (Bottom) rim reading artificially negative. Measuring bar sag on a rigid mandrel beforehand lets you subtract it from raw readings. Before trusting any dial set, verify the mathematical identity T + B = L + R.',
      equations: [
        {
          label: 'Validity Rule',
          formula: 'T + B = L + R',
          note: 'If | (T + B) - (L + R) | exceeds 0.02 mm, suspect bracket slip, loose bolts, or soft foot.',
        },
        {
          label: 'Sag-Compensated Bottom Reading',
          formula: 'R_B,comp = R_B,raw + S_sag',
          note: 'Where S_sag > 0 is the measured downward sag TIR at 6 o’clock.',
        },
      ],
      workedExample: {
        title: 'Compensating a Raw Rim Set',
        given: [
          'Measured bracket sag S_sag = 0.08 mm',
          'Raw Rim readings: T = 0.00 mm, R = -0.14 mm, B = -0.28 mm, L = -0.14 mm',
        ],
        steps: [
          'Check raw validity: T + B = -0.28 mm; L + R = -0.28 mm (valid!).',
          'Add full sag to Bottom: B_comp = -0.28 + 0.08 = -0.20 mm.',
          'Add half sag to Left & Right: L_comp = R_comp = -0.14 + 0.04 = -0.10 mm.',
          'True vertical offset: y_c = -(-0.20) / 2 = +0.10 mm (motor is 0.10 mm high).',
        ],
        answer: 'True vertical offset is +0.10 mm (forgetting sag would overestimate by 0.04 mm).',
      },
    },
    {
      title: 'Foot Shim & Horizontal Jacking Formula',
      summary:
        'Once coupling offset and angularity are known, project the shaft centerline out to the motor front (inboard) and rear (outboard) feet. Always correct soft foot first by shimming any rocking foot before performing final vertical and horizontal moves.',
      equations: [
        {
          label: 'Front Foot Shim',
          formula: 'Δs_1 = -(y_c + θ_v · L_1)',
          note: 'L_1 is distance from coupling center to motor front feet. Positive = add shims.',
        },
        {
          label: 'Rear Foot Shim',
          formula: 'Δs_2 = -(y_c + θ_v · L_2)',
          note: 'L_2 is distance from coupling center to motor rear feet.',
        },
        {
          label: 'Horizontal Jacking Move',
          formula: 'Δh_i = -(x_c + θ_h · L_i)',
          note: 'Same projection geometry in the horizontal (3–9 o’clock) plane.',
        },
      ],
      workedExample: {
        title: 'Calculating Motor Front & Rear Shims',
        given: [
          'y_c = -0.25 mm (low), θ_v = +0.0012 rad',
          'Front foot distance L_1 = 200 mm, Rear foot distance L_2 = 550 mm',
        ],
        steps: [
          'Front foot position: y_1 = -0.25 + (0.0012 × 200) = -0.01 mm → Shim Δs_1 = +0.01 mm.',
          'Rear foot position: y_2 = -0.25 + (0.0012 × 550) = +0.41 mm → Shim Δs_2 = -0.41 mm (remove 0.41 mm).',
        ],
        answer: 'Add 0.01 mm at front feet and remove 0.41 mm at rear feet.',
      },
    },
  ],
  practice: [
    {
      id: 'align-p1',
      prompt:
        'A compensated Rim dial indicator reads T = 0.00 mm and B = -0.44 mm. What is the vertical offset y_c of the motor at the coupling (in mm)?',
      hint: 'Use y_c = -(R_B - R_T) / 2. A negative bottom reading means the motor sits high.',
      targetValue: 0.22,
      unit: 'mm',
      tolerance: 0.01,
      solutionSteps: [
        'y_c = -(R_B - R_T) / 2',
        'y_c = -(-0.44 - 0.00) / 2 = +0.22 mm',
      ],
    },
    {
      id: 'align-p2',
      prompt:
        'A Face indicator sweeping a 160 mm diameter reads T = 0.00 mm and B = +0.24 mm. Calculate the vertical angularity in mm per 100 mm.',
      hint: 'Angularity (mm/100 mm) = ((F_B - F_T) / D) × 100.',
      targetValue: 0.15,
      unit: 'mm/100mm',
      tolerance: 0.01,
      solutionSteps: [
        'θ_v = (0.24 - 0.00) / 160 = 0.0015 rad',
        'Per 100 mm = 0.0015 × 100 = 0.15 mm/100mm',
      ],
    },
    {
      id: 'align-p3',
      prompt:
        'You record T = 0.00 mm, R = -0.18 mm, and B = -0.46 mm on a Rim gauge. If the setup is valid (T + B = L + R), what must the Left (L) reading be (in mm)?',
      hint: 'Solve T + B = L + R for L.',
      targetValue: -0.28,
      unit: 'mm',
      tolerance: 0.01,
      solutionSteps: [
        'T + B = 0.00 + (-0.46) = -0.46 mm',
        'L = (T + B) - R = -0.46 - (-0.18) = -0.28 mm',
      ],
    },
    {
      id: 'align-p4',
      prompt:
        'A motor has coupling offset y_c = -0.30 mm (low) and slope θ_v = +0.0010 rad. If the rear foot is at L_2 = 600 mm from the coupling, how much shim (mm) must be added (+) or removed (-) at the rear foot?',
      hint: 'Use Δs_2 = -(y_c + θ_v · L_2).',
      targetValue: -0.3,
      unit: 'mm',
      tolerance: 0.02,
      solutionSteps: [
        'y_2 = -0.30 + (0.0010 × 600) = -0.30 + 0.60 = +0.30 mm',
        'Δs_2 = -y_2 = -0.30 mm (remove 0.30 mm of shims)',
      ],
    },
  ],
  quiz: [
    {
      id: 'align-q1',
      question:
        'Why must bar sag be measured and compensated in dial-indicator shaft alignment?',
      options: [
        'Gravity bends the indicator bracket downward, making the 6 o’clock rim reading artificially negative',
        'Thermal growth expands the bracket upward at 12 o’clock',
        'Centrifugal force pushes the plunger outward during slow hand rotation',
        'Bar sag only affects the axial Face indicator, never the Rim indicator',
      ],
      correctIndex: 0,
      explanation:
        'As the shaft rotates to 6 o’clock (Bottom), gravity pulls the cantilevered indicator bar away from the hub, creating a false negative rim reading unless compensated.',
    },
    {
      id: 'align-q2',
      question:
        'What does the dial-indicator validity rule T + B = L + R check?',
      options: [
        'Whether the motor is running at 1800 RPM',
        'Mathematical consistency of the four cardinal readings to catch bracket slip or plunger binding',
        'Whether the coupling gap equals the shaft diameter',
        'The exact thickness of stainless-steel shims required under the front feet',
      ],
      correctIndex: 1,
      explanation:
        'For any rigid misalignment, opposing cardinal sums (Top + Bottom and Left + Right) must be equal. A mismatch indicates measurement error such as a loose clamp or binding.',
    },
    {
      id: 'align-q3',
      question:
        'When should soft foot be checked and corrected during an alignment job?',
      options: [
        'Only after final horizontal jacking is complete',
        'First, before taking final alignment readings and shimming',
        'Only on machines running below 1000 RPM',
        'Never—tightening the anchor bolts eliminates soft foot automatically',
      ],
      correctIndex: 1,
      explanation:
        'Soft foot distorts the motor frame when anchor bolts are torqued, shifting shaft alignment unpredictably. Always eliminate soft foot (> 0.05 mm) before final alignment.',
    },
    {
      id: 'align-q4',
      question:
        'In the Rim-and-Face method, a Rim TIR of 0.40 mm between Top and Bottom corresponds to what parallel offset?',
      options: ['0.80 mm', '0.40 mm', '0.20 mm', '0.10 mm'],
      correctIndex: 2,
      explanation:
        'Rotating 180° reverses the radial eccentricity, so Total Indicator Reading (TIR) is twice the centerline offset: 0.40 / 2 = 0.20 mm.',
    },
    {
      id: 'align-q5',
      question:
        'How do ISO/ANSI shaft alignment tolerances change as machine operating speed increases from 1500 RPM to 3600 RPM?',
      options: [
        'Tolerances become tighter (smaller allowable offset and angularity)',
        'Tolerances become looser because high speed self-centers the coupling',
        'Tolerances stay identical regardless of RPM',
        'Only angularity changes; parallel offset is independent of RPM',
      ],
      correctIndex: 0,
      explanation:
        'Higher rotational speeds amplify dynamic forces, vibration, and bearing loads, requiring significantly tighter offset and angularity limits.',
    },
  ],
};
