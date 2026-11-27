import type { SimulatorMeta } from '../../types/simulator';
import './fanucM900I18n';

export const fanucM900Meta: SimulatorMeta = {
  id: 'fanuc-m900ib',
  title: 'FANUC M-900iB/700 Robot & iPendant (R-30iB)',
  shortTitle: 'FANUC M-900iB/700',
  category: 'Rotating Equipment',
  difficulty: 'Advanced',
  description:
    'Interactive 6-axis heavy-payload industrial robot laboratory featuring the FANUC M-900iB/700 (700 kg payload, 2832 mm reach) and R-30iB iPendant: JOINT vs WORLD jogging, forward/inverse kinematics, J2/J3 parallel linkage torque, wrist singularity, Teach Pendant (TP) programming, and SRVO/MOTN alarm diagnostics.',
  iconName: 'Cog',
  accentColor: 'amber',
  explore: [
    {
      title: '1. Heavy-Payload 6-Axis Kinematics & Parallel Linkage (M-900iB/700)',
      summary:
        'The FANUC M-900iB/700 is a 6-axis articulated heavy-duty robot rated for 700 kg payload and 2832 mm horizontal reach. Unlike serial-link arms, it uses a J2/J3 parallel linkage with a hydropneumatic counterbalance cylinder on the J2 shoulder to offset static gravity torque and reduce αiS servo motor current.',
      equations: [
        {
          label: 'Planar Reach & Forward Kinematics',
          formula: 'R_tcp = a1 + a2·sin(J2) + d4·cos(J3) + d6·cos(θ_tool)',
          note: 'a1 = 410 mm, a2 = 1120 mm, d4 = 1285 mm, d6 = 260 mm; max envelope R_max = 2832 mm.',
        },
        {
          label: 'Net J2 Shoulder Servo Torque',
          formula: 'τ_J2 = τ_gravity(arm + payload) − τ_counterbalance(J2)',
          note: 'Exceeding 700 kg payload or hitting an obstacle spikes disturbance torque and triggers SRVO-050 Collision Detect.',
        },
      ],
      workedExample: {
        title: 'Static Payload Moment at Full Horizontal Extension',
        given: [
          'Payload mass m = 600 kg at radial distance r = 2.40 m from J2',
          'Gravity g = 9.81 m/s²',
        ],
        steps: [
          'Payload weight: F = 600 kg × 9.81 m/s² = 5886 N.',
          'Gross payload moment about J2: τ = 5886 N × 2.40 m = 14,126 N·m.',
          'The hydropneumatic counterbalance cylinder offsets ~1,600–2,200 N·m to keep αiS servo load within continuous rating.',
        ],
        answer: 'Gross payload torque = 14,126 N·m (within 700 kg rating)',
      },
    },
    {
      title: '2. JOINT vs WORLD Coordinate Jogging & Wrist Singularity',
      summary:
        'In JOINT mode, ±J1..±J6 keys drive each individual servo axis directly. In WORLD mode, ±X/±Y/±Z keys solve Inverse Kinematics (IK) in real time so the Tool Center Point (TCP) moves linearly along Cartesian axes while maintaining tool orientation. When J5 approaches 0° (|J5| < 5°), J4 and J6 axes align collinearly, causing a wrist singularity where small Cartesian moves demand extreme J4/J6 velocities.',
      equations: [
        {
          label: 'Wrist Singularity Condition',
          formula: '|J5| < 5°  ⇒  J4 ∥ J6 (Infinite Jacobian Velocity)',
          note: 'Avoid singularity by tilting the wrist pitch (J5 ≈ −75° to −95°) or using Joint (J) motion through the region.',
        },
        {
          label: 'Cartesian WORLD Radial Reach Check',
          formula: 'R = √(X² + Y²) ≤ 2832 mm',
          note: 'Jogging outside joint limits (J2: -64..+90°, J3: -130..+30°) or 2832 mm envelope triggers MOTN-017 Limit Error.',
        },
      ],
    },
    {
      title: '3. R-30iB iPendant Safety Interlocks, TP Programming & Alarms',
      summary:
        'To jog or run a Teach Pendant (TP) program manually on a FANUC R-30iB controller, the TP switch must be ON, the Deadman enable switch must be held, and the E-Stop must be released. Key industrial alarms include SRVO-001 (Operator/TP E-Stop), SRVO-050 (Collision Detect), SRVO-062 (BZAL pulsecoder battery 0 V / mastering lost), and MOTN-017 (Axis/Reach Limit Error).',
      equations: [
        {
          label: 'TP Motion Syntax',
          formula: 'Line: [J | L]  P[n]  [Speed]  [FINE | CNT100]',
          note: 'J = Joint interpolation (fastest path); L = Linear Cartesian path; FINE stops exactly at target; CNT100 blends corners.',
        },
      ],
    },
  ],
  practice: [
    {
      id: 'fanuc-p1',
      prompt:
        'A FANUC M-900iB/700 lifts a 550 kg casting at a radial lever arm of 2.2 m from the J2 shoulder axis. Calculate the gross payload gravity torque (N·m) before counterbalance assist (use g = 9.81 m/s²).',
      hint: 'τ = m × g × r = 550 × 9.81 × 2.2.',
      targetValue: 11870,
      unit: 'N·m',
      tolerance: 50,
      solutionSteps: [
        'Calculate payload force: F = 550 kg × 9.81 m/s² = 5395.5 N.',
        'Multiply by lever arm: τ = 5395.5 N × 2.2 m = 11,870.1 N·m.',
      ],
    },
    {
      id: 'fanuc-p2',
      prompt:
        'In WORLD coordinates, the TCP is at X = 1800 mm, Y = 1200 mm. Calculate the horizontal radial distance R (mm) from the J1 axis.',
      hint: 'Use R = √(X² + Y²).',
      targetValue: 2163,
      unit: 'mm',
      tolerance: 10,
      solutionSteps: [
        'R = √(1800² + 1200²) = √(3,240,000 + 1,440,000) = √4,680,000.',
        'R ≈ 2163.3 mm (well within the 2832 mm reach envelope).',
      ],
    },
    {
      id: 'fanuc-p3',
      prompt:
        'What is the maximum rated payload capacity (kg) of the FANUC M-900iB/700?',
      hint: 'Check the model designation M-900iB/700.',
      targetValue: 700,
      unit: 'kg',
      tolerance: 0,
      solutionSteps: [
        'The suffix /700 in FANUC M-900iB/700 specifies a 700 kg maximum wrist payload.',
      ],
    },
  ],
  quiz: [
    {
      id: 'fanuc-q1',
      question:
        'Which FANUC alarm occurs when the pulsecoder backup battery voltage drops to 0 V and joint mastering data is lost?',
      options: [
        'SRVO-001 Operator panel E-stop',
        'SRVO-050 Collision Detect alarm',
        'SRVO-062 BZAL alarm',
        'MOTN-017 Limit error',
      ],
      correctIndex: 2,
      explanation:
        'SRVO-062 BZAL (Battery Zero Alarm) indicates the encoder backup battery failed and the robot must have its battery replaced and axes remastered.',
    },
    {
      id: 'fanuc-q2',
      question:
        'What physical condition causes a 6-axis robot wrist singularity on the FANUC M-900iB/700?',
      options: [
        'J1 reaches +180°',
        'J5 approaches 0° (|J5| < 5°), aligning J4 and J6 axes',
        'Payload exceeds 50% of 700 kg',
        'TP speed override is set to 100%',
      ],
      correctIndex: 1,
      explanation:
        'When J5 ≈ 0°, J4 and J6 become collinear, losing one rotational degree of freedom and causing extreme wrist spin during linear (L) or WORLD moves.',
    },
    {
      id: 'fanuc-q3',
      question:
        'Why does the FANUC M-900iB/700 include a hydropneumatic counterbalance cylinder on J2?',
      options: [
        'To increase J6 rotational speed',
        'To offset static gravity torque on the J2 shoulder and reduce αiS servo motor load',
        'To cool the R-30iB controller cabinet',
        'To lock the vacuum gripper during E-Stop',
      ],
      correctIndex: 1,
      explanation:
        'The hydropneumatic counterbalance cylinder assists the J2 axis against the heavy arm and 700 kg payload gravity moment.',
    },
    {
      id: 'fanuc-q4',
      question:
        'In a Teach Pendant program, what is the difference between `L P[2] 500mm/sec FINE` and `L P[3] 500mm/sec CNT100`?',
      options: [
        'FINE stops at the exact taught point; CNT100 smoothly blends past the corner without stopping',
        'FINE uses Joint interpolation; CNT100 uses Linear interpolation',
        'CNT100 disables the Deadman switch',
        'FINE turns DO[1] ON automatically',
      ],
      correctIndex: 0,
      explanation:
        'FINE termination decelerates to a complete stop at the point (used for pick/place), whereas CNT100 (Continuous) rounds the corner to maintain cycle speed.',
    },
  ],
};
