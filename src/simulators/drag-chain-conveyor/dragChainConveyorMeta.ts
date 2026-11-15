import type { SimulatorMeta } from '../../types/simulator';
import './dragChainConveyorI18n';

export const dragChainConveyorMeta: SimulatorMeta = {
  id: 'drag-chain-conveyor',
  title: 'En-Masse & Scraper Chain Conveyor',
  shortTitle: 'Chain Conveyor',
  category: 'Machine Elements',
  difficulty: 'Intermediate',
  description:
    'Model en-masse and scraper drag chain conveying capacity, chain pull tension, drive power, tail take-up catenary sag, and fault conditions including chain slack, broken flights, and shear-pin overload.',
  iconName: 'Cog',
  accentColor: 'violet',
  explore: [
    {
      title: 'En-Masse Conveying Principle & Mass Flow Capacity',
      summary:
        'An en-masse drag chain conveyor moves bulk solids inside an enclosed rectangular casing as a continuous, cohesive plug. Because internal particle-to-particle shear resistance exceeds casing-wall friction, the entire material bed advances at a high fraction (η ≈ 0.65–0.90) of the scraper chain speed.',
      equations: [
        {
          label: 'Material Bed Cross-Sectional Area',
          formula: 'A = (W / 1000) × (H / 1000)  [m²]',
          note: 'W = casing width (mm), H = material bed height (mm)',
        },
        {
          label: 'Volumetric Conveying Capacity',
          formula: 'Q_v = 3600 × A × v × η_eff  [m³/h]',
          note: 'v = chain speed (m/s), η_eff = conveying efficiency after inclination derating',
        },
        {
          label: 'Mass Flow Rate',
          formula: 'ṁ = (Q_v × ρ) / 1000  [t/h]',
          note: 'ρ = bulk density (kg/m³)',
        },
      ],
      workedExample: {
        title: 'Mass Flow of Dry Grain in a 320 mm En-Masse Conveyor',
        given: [
          'Casing width W = 320 mm, material bed height H = 160 mm',
          'Chain speed v = 0.45 m/s, effective efficiency η_eff = 0.78',
          'Bulk density ρ = 750 kg/m³ (horizontal, θ = 0°)',
        ],
        steps: [
          'Cross-sectional area: A = 0.320 × 0.160 = 0.0512 m²',
          'Volumetric flow: Q_v = 3600 × 0.0512 × 0.45 × 0.78 = 64.70 m³/h',
          'Mass flow rate: ṁ = (64.70 × 750) / 1000 = 48.53 t/h',
        ],
        answer: 'ṁ ≈ 48.5 t/h (Q_v = 64.7 m³/h)',
      },
    },
    {
      title: 'Chain Pull Tension, Inclination Lift & Drive Power',
      summary:
        'Total chain pull at the head drive sprocket overcomes sliding friction of the material bed and chain on the carrying liner, return-run chain friction, and the gravitational lift component on inclined conveyors. A calibrated shear pin on the head sprocket hub protects the chain and gearbox from jamming overloads.',
      equations: [
        {
          label: 'Carrying & Return Friction Force',
          formula:
            'F_f = [(q_m + q_c)·μ + q_c·μ_ret] × L × g × cos(θ)  [N]',
          note: 'q_m, q_c = linear masses of material and chain (kg/m); L = length (m)',
        },
        {
          label: 'Inclination Lift Component',
          formula: 'F_lift = q_m × L × g × sin(θ)  [N]',
          note: 'θ = conveyor inclination angle (deg)',
        },
        {
          label: 'Head Shaft & Motor Power',
          formula: 'P_shaft = F_t × v  [kW],   P_motor = P_shaft / η_drive',
          note: 'F_t = total chain pull (kN); η_drive ≈ 0.88 for gearbox + sprocket',
        },
      ],
      workedExample: {
        title: 'Drive Power Check for a 15 m Horizontal Conveyor',
        given: [
          'Total chain pull F_t = 3.85 kN at chain speed v = 0.45 m/s',
          'Gearbox & drive efficiency η_drive = 0.88',
        ],
        steps: [
          'Head shaft power: P_shaft = 3.85 × 0.45 = 1.73 kW',
          'Required motor power: P_motor = 1.73 / 0.88 = 1.97 kW',
        ],
        answer: 'P_shaft = 1.73 kW; P_motor ≈ 1.97 kW (select a 2.2 kW or 3.0 kW motor)',
      },
    },
    {
      title: 'Tail Take-Up Tension, Catenary Sag & Fault Diagnostics',
      summary:
        'Proper tail take-up screw adjustment keeps a controlled catenary sag on the return strand—preventing sprocket tooth jumping from excessive slack while avoiding parasitic bearing drag from over-tensioning. Broken scraper flights cause heavy return carryback, whereas discharge plugging triggers a rapid torque spike that shears the drive safety pin.',
      equations: [
        {
          label: 'Return-Side Catenary Sag Target',
          formula: 'S_target ≈ 15 – 30 mm (or ~1.5% – 2.5% of span)',
          note: 'Excessive sag (> 38 mm) risks chain whip and tooth skipping',
        },
        {
          label: 'Shear Pin Protection Margin',
          formula: 'Load % = (F_t / F_pin) × 100%',
          note: 'Pin shears at 100% to protect chain links and reducer',
        },
      ],
    },
  ],
  practice: [
    {
      id: 'dc-prac-1',
      prompt:
        'An en-masse conveyor has casing width W = 400 mm and material bed height H = 150 mm. It runs at v = 0.50 m/s with effective efficiency η_eff = 0.80 conveying grain of bulk density ρ = 750 kg/m³. Calculate the mass flow rate (in t/h).',
      hint: 'Compute A = 0.40 × 0.15 m², Q_v = 3600 × A × v × η_eff, then ṁ = Q_v × ρ / 1000.',
      targetValue: 64.8,
      unit: 't/h',
      tolerance: 0.8,
      solutionSteps: [
        'Cross-sectional area: A = 0.40 × 0.15 = 0.060 m²',
        'Volumetric capacity: Q_v = 3600 × 0.060 × 0.50 × 0.80 = 86.4 m³/h',
        'Mass flow rate: ṁ = (86.4 × 750) / 1000 = 64.8 t/h',
      ],
    },
    {
      id: 'dc-prac-2',
      prompt:
        'A scraper drag chain conveyor operates with total head chain pull F_t = 6.20 kN at a linear speed v = 0.60 m/s. Assuming drive efficiency η_drive = 0.88, what is the required motor input power (in kW)?',
      hint: 'P_shaft = F_t × v, then divide by 0.88.',
      targetValue: 4.23,
      unit: 'kW',
      tolerance: 0.1,
      solutionSteps: [
        'Shaft power: P_shaft = 6.20 kN × 0.60 m/s = 3.72 kW',
        'Motor input power: P_motor = 3.72 / 0.88 = 4.227 kW ≈ 4.23 kW',
      ],
    },
    {
      id: 'dc-prac-3',
      prompt:
        'A conveyor with casing width W = 320 mm has a shear pin rated at F_pin = 28.0 kN. During normal operation, chain pull is 5.60 kN. What percentage of the shear pin capacity is currently utilized (in %)?',
      hint: 'Divide 5.60 by 28.0 and multiply by 100.',
      targetValue: 20,
      unit: '%',
      tolerance: 0.5,
      solutionSteps: [
        'Load ratio = (5.60 / 28.0) × 100% = 20.0%',
      ],
    },
  ],
  quiz: [
    {
      id: 'dc-quiz-1',
      question:
        'Why can an en-masse drag chain conveyor move a material bed thicker than the scraper flight height?',
      options: [
        'Internal particle-to-particle shear resistance exceeds casing wall friction, locking the bed into a cohesive plug',
        'High-pressure air jets fluidize the bed along the bottom liner',
        'The return strand pushes the top layer forward simultaneously',
        'Centrifugal force from the tail sprocket throws material to the head',
      ],
      correctIndex: 0,
      explanation:
        'En-masse conveying relies on internal shear cohesion between bulk particles being stronger than the friction against the smooth steel casing walls.',
    },
    {
      id: 'dc-quiz-2',
      question:
        'What is the most immediate symptom of a broken scraper flight in an enclosed drag chain conveyor?',
      options: [
        'Zero chain speed at the motor shaft',
        'A sharp drop in conveying capacity accompanied by heavy material carryback along the return strand',
        'Immediate over-tensioning of the tail take-up screw',
        'Automatic reduction of bulk density',
      ],
      correctIndex: 1,
      explanation:
        'A broken or bent flight fails to clear the carrying run cleanly and drags un-discharged material back along the return track (carryback).',
    },
    {
      id: 'dc-quiz-3',
      question:
        'What is the primary purpose of the shear pin on the head drive sprocket hub?',
      options: [
        'To increase chain speed during peak hopper feed',
        'To lubricate the drive sprocket teeth automatically',
        'To fracture intentionally during a material jam or overload, protecting the chain and gearbox from catastrophic damage',
        'To adjust the return-side catenary sag',
      ],
      correctIndex: 2,
      explanation:
        'The shear pin acts as a mechanical fuse that fails at a calibrated torque/pull threshold when a discharge jam occurs.',
    },
    {
      id: 'dc-quiz-4',
      question:
        'If the tail take-up screw is backed off too far (insufficient tension), what happens on the return chain strand?',
      options: [
        'Excessive catenary sag, risking chain whip and sprocket tooth jumping',
        'The material bed height doubles automatically',
        'Gearbox efficiency rises above 100%',
        'Inclination angle drops to 0°',
      ],
      correctIndex: 0,
      explanation:
        'Insufficient take-up tension allows excessive catenary sag on the slack return span, causing chain slap and tooth skipping on the tail sprocket.',
    },
  ],
};
