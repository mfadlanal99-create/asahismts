import type { SimulatorMeta } from '../../types/simulator';
import './hydraulicI18n';

export const hydraulicMeta: SimulatorMeta = {
  id: 'hydraulic',
  title: 'Hydraulic Circuit & Relief Valve Simulator',
  shortTitle: 'Hydraulic Circuit',
  category: 'Fluid Power',
  difficulty: 'Intermediate',
  description:
    'Interactive fixed-displacement HPU, pressure relief valve, 4/3 directional control valve, meter-out flow control, and maintenance fault diagnosis.',
  iconName: 'Gauge',
  accentColor: 'amber',
  explore: [
    {
      title: "Pascal's Law & Differential Cylinder Area",
      summary:
        'In a double-acting hydraulic cylinder, pressurized oil acts on the full piston bore area (A_cap) during extension, but only on the smaller annular area (A_rod = A_cap - A_shaft) during retraction. Consequently, extension produces higher force at lower speed, while retraction produces higher speed at lower force for the same pump flow.',
      equations: [
        {
          label: 'Cap-End Area',
          formula: 'A_cap = (π / 4) × D²',
          note: 'D = cylinder bore diameter (e.g., 80 mm → 50.27 cm²)',
        },
        {
          label: 'Annular (Rod-End) Area',
          formula: 'A_ann = (π / 4) × (D² - d²)',
          note: 'd = rod diameter (e.g., 45 mm → 34.36 cm²)',
        },
        {
          label: 'Net Cylinder Force',
          formula: 'F_ext = (P₂ × A_cap - P₃ × A_ann) / 100',
          note: 'F in kN when P is in bar and A is in cm²',
        },
        {
          label: 'Actuator Velocity',
          formula: 'v = (Q × 10,000) / (60 × A)',
          note: 'v in mm/s, Q in L/min, A in cm²',
        },
      ],
      workedExample: {
        title: 'Extension Force & Retraction Speed',
        given: [
          'Bore D = 80 mm (A_cap = 50.27 cm²), Rod d = 45 mm (A_ann = 34.36 cm²)',
          'Pump flow Q = 24 L/min, Cap pressure P₂ = 120 bar, Rod backpressure P₃ = 5 bar',
        ],
        steps: [
          '1. Compute cap-end force: F_cap = (120 × 50.27) / 100 = 60.32 kN',
          '2. Subtract rod-end backpressure force: F_back = (5 × 34.36) / 100 = 1.72 kN',
          '3. Net extension force: F_net = 60.32 - 1.72 = 58.60 kN',
          '4. Extension speed: v_ext = (24 × 10,000) / (60 × 50.27) = 79.6 mm/s',
          '5. Retraction speed: v_ret = (24 × 10,000) / (60 × 34.36) = 116.4 mm/s',
        ],
        answer: 'F_net = 58.6 kN, v_ext = 79.6 mm/s, v_ret = 116.4 mm/s',
      },
    },
    {
      title: 'Pressure Relief Valve Operation & Hydraulic Power',
      summary:
        'A fixed-displacement pump delivers constant flow regardless of load. Without a pressure relief valve, dead-heading the cylinder at end-of-stroke or overloading would burst hoses. The relief valve remains closed below its cracking pressure and opens proportionally to bypass excess flow to tank when system pressure reaches the setpoint.',
      equations: [
        {
          label: 'Hydraulic Power',
          formula: 'P_hyd (kW) = (P₁ [bar] × Q_pump [L/min]) / 600',
          note: '100% of bypassed power across a relief valve converts directly into oil heat.',
        },
        {
          label: 'Flow Conservation',
          formula: 'Q_pump = Q_actuator + Q_relief',
          note: 'At end-of-stroke (dead-head), Q_actuator = 0 and Q_relief = Q_pump.',
        },
      ],
      workedExample: {
        title: 'Heat Load When Dead-Heading Over Relief',
        given: [
          'Pump flow Q_pump = 30 L/min',
          'Relief cracking pressure P_crack = 150 bar',
          'Cylinder held at full extension (dead-headed)',
        ],
        steps: [
          '1. Because the piston is at end-of-stroke, Q_actuator = 0 L/min.',
          '2. Full pump flow (30 L/min) bypasses across the relief valve at 150 bar.',
          '3. Hydraulic power converted to heat: P_hyd = (150 × 30) / 600 = 7.5 kW.',
        ],
        answer: '7.5 kW of continuous heat generation',
      },
    },
    {
      title: 'Meter-Out Flow Control & Hydraulic Fault Diagnosis',
      summary:
        'A meter-out flow control restricts oil leaving the cylinder rod end during extension, creating controlled backpressure (P₃) that prevents load runaway and regulates speed. When diagnosing faults, technicians correlate P₁, P₂, and P₃ gauge readings with actuator speed across Extend, Neutral, and Retract states.',
      equations: [
        {
          label: 'Relief Stuck Open Signature',
          formula: 'P₁ ≤ 15 bar (all states), v ≈ 0 under load',
          note: 'Broken spring or debris holds poppet open; pump flow dumps straight to tank.',
        },
        {
          label: 'Internal Piston Seal Bypass Signature',
          formula: 'P₂ ≈ P₃ (partial equalization), drift in Neutral',
          note: 'High-pressure oil leaks across worn piston seal into the low-pressure chamber.',
        },
        {
          label: 'Suction Strainer Cavitation Signature',
          formula: 'Erratic P₁ needle, Q_pump ↓ ~40%, pump noise',
          note: 'Clogged inlet strainer starves pump, causing vapor bubbles and implosion pitting.',
        },
      ],
      workedExample: {
        title: 'Diagnosing a Slow, Drifting Cylinder',
        given: [
          'Technician commands Extend with 30 kN load; relief is set to 160 bar.',
          'Gauges read P₁ = 55 bar, P₂ = 52 bar, P₃ = 36 bar (meter-out is 100% open!).',
          'In Neutral, the cylinder slowly retracts under the 30 kN load.',
        ],
        steps: [
          '1. With meter-out 100% open, P₃ should be near tank pressure (~2–5 bar), not 36 bar.',
          '2. Elevated P₃ alongside depressed P₂ indicates cross-piston leakage.',
          '3. Slow drift in Neutral confirms oil is bypassing the piston seal from cap to rod side.',
        ],
        answer: 'Cylinder Internal Seal Bypass (worn piston seal)',
      },
    },
  ],
  practice: [
    {
      id: 'hyd-p1',
      prompt:
        'A hydraulic cylinder with an 80 mm bore (A_cap = 50.27 cm²) and 45 mm rod (A_ann = 34.36 cm²) operates with P₂ = 140 bar and P₃ = 10 bar. Calculate the net extension force in kN.',
      hint: 'Use F_net = (P₂ × A_cap - P₃ × A_ann) / 100.',
      targetValue: 66.94,
      unit: 'kN',
      tolerance: 1.0,
      solutionSteps: [
        'Cap force = (140 × 50.27) / 100 = 70.38 kN',
        'Rod backpressure force = (10 × 34.36) / 100 = 3.44 kN',
        'Net force = 70.38 - 3.44 = 66.94 kN',
      ],
    },
    {
      id: 'hyd-p2',
      prompt:
        'A fixed-displacement pump delivers 28 L/min while the relief valve cracks at 175 bar. What is the hydraulic power (kW) being converted to heat if the cylinder is dead-headed?',
      hint: 'Use P_hyd = (P × Q) / 600.',
      targetValue: 8.17,
      unit: 'kW',
      tolerance: 0.2,
      solutionSteps: [
        'P_hyd = (175 bar × 28 L/min) / 600',
        'P_hyd = 4900 / 600 = 8.17 kW',
      ],
    },
    {
      id: 'hyd-p3',
      prompt:
        'With a pump flow of 24 L/min entering the rod-end annulus (A_ann = 34.36 cm²), calculate the retraction speed in mm/s.',
      hint: 'Use v = (Q × 10,000) / (60 × A_ann).',
      targetValue: 116.4,
      unit: 'mm/s',
      tolerance: 2.0,
      solutionSteps: [
        'Flow in cm³/s = (24 × 1000) / 60 = 400 cm³/s',
        'Velocity in cm/s = 400 / 34.36 = 11.64 cm/s',
        'Velocity in mm/s = 116.4 mm/s',
      ],
    },
    {
      id: 'hyd-p4',
      prompt:
        'You need to lift a 45 kN resistive load using the 80 mm bore cylinder (A_cap = 50.27 cm²). Neglecting friction and backpressure, what minimum cap-end pressure (bar) is required?',
      hint: 'P = (F × 100) / A_cap.',
      targetValue: 89.5,
      unit: 'bar',
      tolerance: 1.5,
      solutionSteps: [
        'P = (45 kN × 100) / 50.27 cm²',
        'P = 4500 / 50.27 = 89.52 bar',
      ],
    },
    {
      id: 'hyd-p5',
      prompt:
        'During meter-out extension, the pump delivers 30 L/min at 150 bar, and 18 L/min enters the cylinder cap end. How much flow (L/min) is bypassing through the relief valve?',
      hint: 'Q_relief = Q_pump - Q_actuator.',
      targetValue: 12,
      unit: 'L/min',
      tolerance: 0.5,
      solutionSteps: [
        'By conservation of flow: Q_pump = Q_actuator + Q_relief',
        'Q_relief = 30 - 18 = 12 L/min',
      ],
    },
  ],
  quiz: [
    {
      id: 'hyd-q1',
      question:
        'Why does a double-acting single-rod cylinder retract faster than it extends at the same pump flow rate?',
      options: [
        'The pump automatically speeds up during retraction',
        'The rod-end annular area is smaller than the full cap-end bore area',
        'The relief valve boosts flow during retraction',
        'Tank backpressure pushes the piston faster',
      ],
      correctIndex: 1,
      explanation:
        'Because v = Q / A and the rod-end annulus area (A_cap - A_rod) is smaller than A_cap, the same flow Q fills the smaller volume faster.',
    },
    {
      id: 'hyd-q2',
      question:
        'In a tandem-center 4/3 DCV in the Neutral position, what happens to pump flow?',
      options: [
        'It dead-heads against the blocked P port and forces the relief valve open',
        'It circulates from P directly to T at low pressure while A and B ports are blocked',
        'It flows equally into both cylinder ports A and B',
        'The pump motor stalls immediately',
      ],
      correctIndex: 1,
      explanation:
        'A tandem-center spool connects P to T in neutral (unloading the pump at low pressure) while blocking A and B to hold the actuator load.',
    },
    {
      id: 'hyd-q3',
      question:
        'Which gauge symptom most strongly indicates a Pressure Relief Valve stuck open?',
      options: [
        'P1 spikes above 220 bar in neutral',
        'P1 stays near 10–12 bar regardless of load or DCV position, and cylinder stalls',
        'P2 and P3 both climb to 180 bar simultaneously',
        'P1 fluctuates wildly while P2 stays at 150 bar',
      ],
      correctIndex: 1,
      explanation:
        'If the relief poppet is stuck open, pump flow dumps straight to tank at minimal pressure (~10–12 bar), preventing the system from building pressure to move a load.',
    },
    {
      id: 'hyd-q4',
      question:
        'A technician observes P2 and P3 partially equalizing during extension, sluggish speed, and cylinder drift in Neutral under load. What is the most likely fault?',
      options: [
        'Clogged suction strainer',
        'Relief valve cracking pressure set too high',
        'Cylinder internal piston seal bypass',
        'Meter-out check valve installed backwards',
      ],
      correctIndex: 2,
      explanation:
        'A worn piston seal allows high-pressure oil to leak internally into the opposite chamber, equalizing P2 and P3 and causing drift in neutral.',
    },
    {
      id: 'hyd-q5',
      question:
        'What is the primary purpose of the parallel check valve on a meter-out flow control assembly?',
      options: [
        'To allow free reverse flow into the rod end during retraction',
        'To increase cracking pressure of the relief valve',
        'To prevent pump cavitation during neutral',
        'To double the extension force',
      ],
      correctIndex: 0,
      explanation:
        'Meter-out throttles oil exiting the rod end during extension, while the bypass check valve opens to allow unthrottled flow into the rod end during retraction.',
    },
    {
      id: 'hyd-q6',
      question:
        'Which maintenance fault causes erratic/pulsating P1 gauge readings, ~40% flow loss, and audible pump noise?',
      options: [
        'Worn cylinder rod wiper',
        'Clogged suction strainer causing pump cavitation',
        'Oversized return line filter',
        'Tandem-center DCV spool',
      ],
      correctIndex: 1,
      explanation:
        'A restricted suction strainer starves the pump inlet, creating vacuum pockets (cavitation) that collapse violently, causing noise, flow loss, and gauge oscillation.',
    },
  ],
};
