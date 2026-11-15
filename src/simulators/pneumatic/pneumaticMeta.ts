import type { SimulatorMeta } from '../../types/simulator';
import './pneumaticI18n';

export const pneumaticMeta: SimulatorMeta = {
  id: 'pneumatic',
  title: 'Pneumatic Circuit & Cylinder Lab',
  shortTitle: 'Pneumatic Lab',
  category: 'Fluid Power',
  difficulty: 'Beginner',
  description:
    'Design and actuate ISO 1219 pneumatic circuits with 3/2 and 5/2 directional control valves, AND/OR logic elements, meter-out flow controls, and live cylinder force kinematics.',
  iconName: 'Wind',
  accentColor: 'cyan',
  explore: [
    {
      title: 'ISO 1219 Symbols & Valve Naming (3/2 & 5/2 DCVs)',
      summary:
        'Directional control valves (DCVs) are designated by two numbers separated by a slash: ports / switching positions. A 3/2 valve has 3 ports (1 Supply P, 2 Working A, 3 Exhaust R) and 2 spool positions, making it ideal for single-acting cylinders or pilot signals. A 5/2 valve has 5 ports (1 Supply, 4 & 2 Working A/B, 5 & 3 Exhausts) and 2 positions, used to control double-acting cylinders.',
      equations: [
        {
          label: 'ISO 1219 Port Numbering',
          formula: '1 = Supply (P),  2 & 4 = Working (B, A),  3 & 5 = Exhaust (R, S)',
          note: 'Pilot signals are labeled 12 (connects 1→2) and 14 (connects 1→4).',
        },
        {
          label: 'Valve Designation',
          formula: 'N / M  ⇒  N = Number of Ports,  M = Number of Positions',
          note: 'Each position is drawn as one square box in the ISO 1219 schematic.',
        },
      ],
      workedExample: {
        title: 'Interpreting a 5/2 Double-Pilot Valve',
        given: [
          'Supply pressure at Port 1(P) = 6 bar',
          'Brief pilot pulse applied to Port 14(Z)',
        ],
        steps: [
          'Pilot 14(Z) shifts the spool to the left square (Position 1).',
          'Supply 1(P) is routed to working port 4(A), extending the cylinder.',
          'Working port 2(B) vents to exhaust port 3(EB).',
          'Because it is a bistable double-pilot valve, the spool stays in Position 1 until Port 12(Y) receives a pilot signal.',
        ],
        answer: 'Port 4(A) pressurized at 6 bar; Port 2(B) exhausted.',
      },
    },
    {
      title: "Pascal's Law & Cylinder Force",
      summary:
        'Compressed air exerts uniform pressure in all directions inside a cylinder chamber. Theoretical force equals gauge pressure multiplied by effective piston area. During retraction of a double-acting cylinder, the piston rod occupies part of the area, so the annulus area produces slightly less force than extension.',
      equations: [
        {
          label: 'Extension Force',
          formula: 'F_ext = P · A_bore = P · (π / 4) · D²',
          note: 'With P in MPa (1 bar = 0.1 MPa) and D in mm, F is directly in Newtons (N).',
        },
        {
          label: 'Retraction Force (Double-Acting)',
          formula: 'F_ret = P · A_annulus = P · (π / 4) · (D² − d²)',
          note: 'd is the piston rod diameter.',
        },
        {
          label: 'Effective Force with Friction',
          formula: 'F_eff = η · P · A  (typical η ≈ 0.85 – 0.90)',
          note: 'Accounts for seal friction and back-pressure.',
        },
      ],
      workedExample: {
        title: 'Double-Acting Cylinder Force at 6 bar',
        given: [
          'Bore diameter D = 50 mm',
          'Rod diameter d = 20 mm',
          'Operating pressure P = 6 bar = 0.6 MPa',
        ],
        steps: [
          'A_bore = (π / 4) × 50² = 1963.5 mm²',
          'F_ext = 0.6 MPa × 1963.5 mm² = 1178.1 N',
          'A_annulus = (π / 4) × (50² − 20²) = 1649.3 mm²',
          'F_ret = 0.6 MPa × 1649.3 mm² = 989.6 N',
        ],
        answer: 'F_ext = 1178 N, F_ret = 990 N',
      },
    },
    {
      title: 'Meter-In vs Meter-Out Flow Control',
      summary:
        'A one-way flow control valve combines a variable throttle orifice with a parallel check valve. In meter-out control, the check valve blocks exhausting air so it must pass through the throttle, trapping pressurized air on both sides of the piston and preventing jerky stick-slip motion under varying loads.',
      equations: [
        {
          label: 'Meter-Out Configuration',
          formula: 'Check valve allows free INFLOW to cylinder; throttle restricts EXHAUST.',
          note: 'Preferred for almost all double-acting pneumatic cylinders.',
        },
        {
          label: 'Free Air Consumption (Single Stroke)',
          formula: 'Q_free = V_cyl · (P_gauge + P_atm) / P_atm',
          note: 'P_atm ≈ 1 bar; expresses compressed volume in Normal Liters (NL).',
        },
      ],
      workedExample: {
        title: 'Free Air Consumption per Stroke',
        given: [
          'Bore D = 50 mm (0.5 dm), Stroke L = 200 mm (2.0 dm)',
          'Gauge pressure P_gauge = 6 bar, P_atm = 1 bar',
        ],
        steps: [
          'Cylinder volume V_cyl = (π / 4) × (0.5)² × 2.0 = 0.393 L',
          'Compression ratio = (6 + 1) / 1 = 7',
          'Q_free = 0.393 L × 7 = 2.75 NL',
        ],
        answer: '2.75 Normal Liters (NL) per extension stroke',
      },
    },
    {
      title: 'Pneumatic Logic: AND (Dual-Pressure) & OR (Shuttle) Valves',
      summary:
        'Pneumatic circuits can implement Boolean logic without electronics. A Dual-Pressure (AND) valve outputs air only when both inputs 1(X) and 1(Y) are pressurized—ideal for two-hand operator safety. A Shuttle (OR) valve outputs air whenever either input is pressurized, allowing control from multiple stations.',
      equations: [
        {
          label: 'Dual-Pressure Valve (AND)',
          formula: 'Y = X · Y_in  (Output active iff P_X > 0 AND P_Y > 0)',
          note: 'If pressures differ, the lower pressure passes to the output.',
        },
        {
          label: 'Shuttle Valve (OR)',
          formula: 'Y = X + Y_in  (Output active if P_X > 0 OR P_Y > 0)',
          note: 'Internal ball seals the unpressurized port to prevent backflow.',
        },
      ],
    },
  ],
  practice: [
    {
      id: 'pneu-1',
      prompt:
        'Calculate the theoretical extension force (in N) of a pneumatic cylinder with bore diameter D = 50 mm operating at P = 6 bar (0.6 MPa).',
      hint: 'Use F = P × (π/4) × D² with P = 0.6 N/mm² and D = 50 mm.',
      targetValue: 1178,
      unit: 'N',
      tolerance: 25,
      solutionSteps: [
        'Convert pressure: P = 6 bar = 0.6 MPa = 0.6 N/mm²',
        'Piston area: A = (π / 4) × 50² = 1963.5 mm²',
        'Force: F = 0.6 × 1963.5 = 1178.1 N',
      ],
    },
    {
      id: 'pneu-2',
      prompt:
        'A double-acting cylinder has bore D = 63 mm and rod diameter d = 20 mm. Find the theoretical retraction force (in N) at P = 6 bar (0.6 MPa).',
      hint: 'Subtract the rod area from the bore area: A_annulus = (π/4)(D² − d²).',
      targetValue: 1682,
      unit: 'N',
      tolerance: 35,
      solutionSteps: [
        'A_annulus = (π / 4) × (63² − 20²) = (π / 4) × 3569 = 2803.1 mm²',
        'P = 6 bar = 0.6 N/mm²',
        'F_ret = 0.6 × 2803.1 = 1681.9 N',
      ],
    },
    {
      id: 'pneu-3',
      prompt:
        'A 40 mm bore cylinder operates at 5 bar (0.5 MPa) with 90% mechanical efficiency (η = 0.90). What is the effective extension force in N?',
      hint: 'Multiply theoretical force F = P × A by η = 0.90.',
      targetValue: 565.5,
      unit: 'N',
      tolerance: 15,
      solutionSteps: [
        'A = (π / 4) × 40² = 1256.6 mm²',
        'F_theo = 0.5 × 1256.6 = 628.3 N',
        'F_eff = 0.90 × 628.3 = 565.5 N',
      ],
    },
    {
      id: 'pneu-4',
      prompt:
        'How many Normal Liters (NL) of free air are consumed by one extension stroke of a 50 mm bore, 200 mm stroke cylinder at 6 bar gauge pressure (P_atm = 1 bar)?',
      hint: 'V_cyl = (π/4) × (0.5 dm)² × 2 dm. Multiply by (P_gauge + 1) / 1.',
      targetValue: 2.75,
      unit: 'NL',
      tolerance: 0.1,
      solutionSteps: [
        'Convert to decimeters: D = 0.5 dm, L = 2.0 dm',
        'V_cyl = (π / 4) × 0.25 × 2.0 = 0.3927 L',
        'Q_free = 0.3927 × (6 + 1) / 1 = 2.75 NL',
      ],
    },
    {
      id: 'pneu-5',
      prompt:
        'What minimum bore diameter D (in mm) is required to generate 2000 N of theoretical extension force at 6 bar (0.6 MPa)?',
      hint: 'Solve A = F / P, then D = √(4A / π).',
      targetValue: 65.1,
      unit: 'mm',
      tolerance: 1.5,
      solutionSteps: [
        'Required area: A = 2000 N / 0.6 N/mm² = 3333.3 mm²',
        'D = √(4 × 3333.3 / π) = √4244.1 = 65.15 mm',
      ],
    },
  ],
  quiz: [
    {
      id: 'pq-1',
      question: 'In ISO 1219 pneumatic notation, what does "5/2" mean for a directional control valve?',
      options: [
        '5 bar maximum pressure and 2 L/min flow',
        '5 ports and 2 switching positions',
        '5 switching positions and 2 exhaust ports',
        '50 mm spool stroke and 2 pilot lines',
      ],
      correctIndex: 1,
      explanation:
        'The first number indicates the number of ports (1 supply, 2 & 4 working, 3 & 5 exhausts) and the second number indicates the number of switching positions.',
    },
    {
      id: 'pq-2',
      question: 'Why is meter-out flow control preferred over meter-in for double-acting pneumatic cylinders?',
      options: [
        'It doubles the maximum extension force',
        'It eliminates the need for an FRL unit',
        'It traps pressurized air on both sides of the piston, preventing stick-slip motion',
        'It vents air directly into the compressor',
      ],
      correctIndex: 2,
      explanation:
        'Meter-out throttles the exhausting air while allowing full supply pressure on the driving side, creating a stable air cushion that prevents jerky motion.',
    },
    {
      id: 'pq-3',
      question: 'Which ISO 1219 port number always represents the compressed air supply?',
      options: ['Port 1 (P)', 'Port 2 (B)', 'Port 3 (R)', 'Port 4 (A)'],
      correctIndex: 0,
      explanation:
        'In ISO 1219, Port 1 is always the main pressure supply (P), even numbers (2, 4) are working ports, and odd numbers (3, 5) are exhausts.',
    },
    {
      id: 'pq-4',
      question: 'A two-hand safety press circuit requires both pushbuttons to be pressed simultaneously. Which logic valve is used?',
      options: [
        'Shuttle Valve (OR)',
        'Dual-Pressure Valve (AND)',
        'Quick Exhaust Valve',
        'Non-return Check Valve',
      ],
      correctIndex: 1,
      explanation:
        'A Dual-Pressure (AND) valve only passes air to its output when both inputs are pressurized at the same time.',
    },
    {
      id: 'pq-5',
      question: 'Why is a double-acting cylinder’s retraction force smaller than its extension force at the same pressure?',
      options: [
        'Exhaust air has higher viscosity during retraction',
        'The piston rod reduces the effective pressurized area on the rod side',
        'A 5/2 valve drops pressure by 50% on Port 2',
        'The return spring opposes retraction',
      ],
      correctIndex: 1,
      explanation:
        'On the rod side, pressure acts only on the annular area A = (π/4)(D² − d²), which is smaller than the full bore area.',
    },
    {
      id: 'pq-6',
      question: 'What does an FRL unit at the start of a pneumatic circuit stand for?',
      options: [
        'Flow, Relief, Limit',
        'Filter, Regulator, Lubricator',
        'Force, Ratio, Load',
        'Feedback, Relay, Latch',
      ],
      correctIndex: 1,
      explanation:
        'An FRL unit conditions compressed air by filtering moisture/particles, regulating downstream pressure, and optionally adding mist lubrication.',
    },
  ],
};
