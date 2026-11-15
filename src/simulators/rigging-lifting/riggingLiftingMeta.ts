import type { SimulatorMeta } from '../../types/simulator';
import './riggingLiftingI18n';

export const riggingLiftingMeta: SimulatorMeta = {
  id: 'rigging-lifting',
  title: 'Industrial Rigging, Sling Angle & CoG Hoisting',
  shortTitle: 'Rigging & Sling Load',
  category: 'Machine Elements',
  difficulty: 'Intermediate',
  description:
    'Analyze multi-leg sling angle tension multipliers (1/sin θ), asymmetric Center-of-Gravity (CoG) load sharing, hitch efficiency factors (Vertical, Choker, Basket), shackle selection, and crane hook plumb alignment per ASME B30.9.',
  iconName: 'Triangle',
  accentColor: 'emerald',
  explore: [
    {
      title: 'Sling Angle Load Factor (L/H = 1 / sin θ)',
      summary:
        'When a two-leg bridle sling lifts a load at an angle θ measured from the horizontal, each sling leg must generate both the vertical lifting component (W/2) and an inward horizontal compression force (H = (W/2)·cot θ) that tries to pinch the load. As θ drops below 60°, horizontal pinch force and leg tension escalate rapidly—at θ = 30°, each leg experiences a tension equal to the entire payload weight!',
      equations: [
        {
          label: 'Sling Angle Multiplier (Load Factor)',
          formula: 'LF = L / H = 1 / sin θ',
          note: 'θ measured from the horizontal plane: 60° → 1.155× | 45° → 1.414× | 30° → 2.000×',
        },
        {
          label: 'Symmetric 2-Leg Sling Tension',
          formula: 'T = (W / 2) · (1 / sin θ) = W / (2 · sin θ)',
          note: 'Each leg carries half the vertical load multiplied by the angle factor LF',
        },
        {
          label: 'Horizontal Compressive Pinch Force',
          formula: 'F_horiz = (W / 2) / tan θ',
          note: 'Compresses long heat exchangers or thin-walled skids; use a spreader beam when θ < 45°',
        },
      ],
      workedExample: {
        title: 'Lifting a 4.2 t Heat Exchanger Bundle at 45° vs. 30° Horizontal Sling Angle',
        given: [
          'Payload mass W = 4.2 t (41.2 kN), symmetric Center of Gravity (d1 = d2)',
          '2-leg vertical bridle hitch using 3.0 t WLL synthetic web slings',
        ],
        steps: [
          'At θ = 45°: Load Factor LF = 1 / sin(45°) = 1.414. Leg tension T = (4.2 / 2) × 1.414 = 2.97 t (99% of 3.0 t WLL — borderline safe).',
          'At θ = 30°: Load Factor LF = 1 / sin(30°) = 2.000. Leg tension T = (4.2 / 2) × 2.000 = 4.20 t (140% of 3.0 t WLL — SEVERE OVERLOAD!).',
          'Increasing sling length to achieve θ = 60° reduces LF to 1.155 and leg tension to T = 2.1 × 1.155 = 2.43 t (81% WLL).',
        ],
        answer: 'T(60°) = 2.43 t (Safe)  |  T(45°) = 2.97 t (Caution)  |  T(30°) = 4.20 t (Overload)',
      },
    },
    {
      title: 'Off-Center Center-of-Gravity (CoG) & Unequal Leg Tension',
      summary:
        'Industrial machinery skids (such as a pump coupled to a heavy drive motor or an asymmetric gearbox) rarely have their Center of Gravity (CoG) halfway between lifting lugs. For a stable, level lift, the crane hook MUST be positioned vertically directly above the CoG, and the sling leg closest to the CoG carries the majority of the weight.',
      equations: [
        {
          label: 'Vertical Load Share on Leg 1 & Leg 2',
          formula: 'V1 = W · d2 / (d1 + d2)   |   V2 = W · d1 / (d1 + d2)',
          note: 'd1 = horizontal distance from Lug 1 to CoG; d2 = horizontal distance from Lug 2 to CoG',
        },
        {
          label: 'Asymmetric Leg Tension with Sling Angles θ1, θ2',
          formula: 'T1 = (W · d2) / [(d1 + d2) · sin θ1]   |   T2 = (W · d1) / [(d1 + d2) · sin θ2]',
          note: 'The shorter, steeper leg closer to the CoG carries both a larger vertical share and a steeper angle',
        },
        {
          label: 'Hook Plumb Equilibrium Rule',
          formula: 'x_CoG = x_hook  (at static equilibrium)',
          note: 'If the crane hook starts off-center from the CoG, the load swings and tilts until the CoG settles directly beneath the hook!',
        },
      ],
      workedExample: {
        title: 'Calculating Unequal Leg Tensions on a 6.5 t Asymmetric Gearbox Skid',
        given: [
          'Total weight W = 6.5 t, lug span D = d1 + d2 = 3.0 m',
          'Heavy gearbox shifts CoG toward Lug 1: d1 = 1.0 m, d2 = 2.0 m',
          'Headroom H = 2.0 m above lugs (hook positioned directly over CoG)',
        ],
        steps: [
          'Find sling lengths: L1 = √(d1² + H²) = √(1.0² + 2.0²) = 2.236 m (sin θ1 = 2.0 / 2.236 = 0.894); L2 = √(2.0² + 2.0²) = 2.828 m (sin θ2 = 2.0 / 2.828 = 0.707).',
          'Vertical shares: V1 = 6.5 × (2.0 / 3.0) = 4.333 t; V2 = 6.5 × (1.0 / 3.0) = 2.167 t.',
          'Actual leg tensions: T1 = 4.333 / 0.894 = 4.85 t (47.5 kN); T2 = 2.167 / 0.707 = 3.06 t (30.1 kN).',
        ],
        answer: 'Leg 1 (near heavy end) = 4.85 t (requires 5.0 t WLL sling); Leg 2 = 3.06 t.',
      },
    },
    {
      title: 'Hitch Efficiency Factors (Vertical, Choker, Basket) & ASME B30.9 Safety',
      summary:
        'How a sling is rigged around the load changes its effective Working Load Limit (WLL). A straight vertical hitch provides 100% (1.0×) of the rated sling capacity. A choker hitch bends the sling sharply around its own choke eye, derating capacity to ~75% (0.75×). A true vertical basket hitch cradles the load on two vertical legs per sling, doubling effective capacity to 200% (2.0×) before angle factors are applied.',
      equations: [
        {
          label: 'Effective Per-Leg WLL by Hitch Type',
          formula: 'WLL_eff = WLL_rated · η_hitch',
          note: 'Vertical Bridle: η = 1.00  |  Standard Choker (≥120° choke): η = 0.75  |  Vertical Basket: η = 2.00',
        },
        {
          label: 'Design Factor (Safety Factor) per ASME B30.9',
          formula: 'WLL = Minimum Breaking Strength (MBS) / SF',
          note: 'Wire rope slings: SF = 5:1  |  Alloy chain (Grade 80/100): SF = 4:1  |  Synthetic web/round: SF = 5:1 to 7:1',
        },
        {
          label: 'ASME B30.9 Critical Angle Rules',
          formula: 'θ ≥ 60° (Preferred)   |   45° ≤ θ < 60° (Caution)   |   θ < 30° (PROHIBITED)',
          note: 'Never rig horizontal sling angles below 30°; use an engineered lifting/spreader beam instead',
        },
      ],
      workedExample: {
        title: 'Verifying a Choker Hitch Lift on a 4.2 t Cylindrical Bundle',
        given: [
          'Payload W = 4.2 t, symmetric CoG (V1 = V2 = 2.1 t)',
          'Two slings rigged in Choker Hitch (η = 0.75) at horizontal angle θ = 60°',
          'Each sling has a vertical rated WLL = 3.0 t',
        ],
        steps: [
          'Calculate effective per-leg WLL in choker configuration: WLL_eff = 3.0 t × 0.75 = 2.25 t.',
          'Calculate tension in each sling leg at θ = 60°: T = (4.2 / 2) / sin(60°) = 2.1 / 0.866 = 2.425 t.',
          'Compare T to WLL_eff: Utilization = 2.425 / 2.25 = 107.8% (OVERLOAD due to 0.75× choker derating!). Upgrade to 5.0 t WLL slings (WLL_eff = 3.75 t, utilization = 64.7%).',
        ],
        answer: '3.0 t slings are overloaded at 108% in choker hitch; upgrade to 5.0 t WLL slings.',
      },
    },
  ],
  practice: [
    {
      id: 'rl-p1',
      prompt:
        'A symmetric 4.0 t machinery skid is lifted with a 2-leg bridle sling at a horizontal sling angle θ = 30°. What is the tension T (in tonnes) in each sling leg?',
      hint: 'At θ = 30°, sin(30°) = 0.50 (Load Factor = 2.0). Use T = (W / 2) / sin θ.',
      targetValue: 4.0,
      unit: 't',
      tolerance: 0.08,
      solutionSteps: [
        'Vertical load per leg V = W / 2 = 4.0 / 2 = 2.0 t',
        'Sling Angle Load Factor at 30°: LF = 1 / sin(30°) = 1 / 0.50 = 2.00',
        'Tension per leg T = 2.0 t × 2.00 = 4.00 t (each leg carries the full payload weight!)',
      ],
    },
    {
      id: 'rl-p2',
      prompt:
        'A 4.2 t heat exchanger bundle is lifted symmetrically using a 2-leg bridle at θ = 60° from the horizontal. Calculate the tension T (in tonnes) in each sling leg.',
      hint: 'sin(60°) = 0.866 (or Load Factor = 1.155). Divide half the weight by sin(60°).',
      targetValue: 2.42,
      unit: 't',
      tolerance: 0.06,
      solutionSteps: [
        'Vertical share per leg V = 4.2 / 2 = 2.10 t',
        'At θ = 60°, sin(60°) = 0.8660 (LF = 1.1547)',
        'Tension T = 2.10 / 0.8660 = 2.425 t',
      ],
    },
    {
      id: 'rl-p3',
      prompt:
        'A 6.0 t asymmetric pump-motor skid has lifting lugs spaced 3.0 m apart. The Center of Gravity (CoG) is d1 = 1.0 m from Lug 1 and d2 = 2.0 m from Lug 2. How much vertical load V1 (in tonnes) is carried by Leg 1?',
      hint: 'Use the lever rule: V1 = W × d2 / (d1 + d2). The leg closer to the CoG carries the larger share.',
      targetValue: 4.0,
      unit: 't',
      tolerance: 0.08,
      solutionSteps: [
        'Total span between lugs D = d1 + d2 = 1.0 + 2.0 = 3.0 m',
        'V1 = W × (d2 / D) = 6.0 t × (2.0 / 3.0) = 4.00 t',
        'Leg 2 carries the remaining V2 = 6.0 × (1.0 / 3.0) = 2.00 t',
      ],
    },
    {
      id: 'rl-p4',
      prompt:
        'A synthetic web sling has a straight Vertical WLL rating of 3.0 t. What is its effective Working Load Limit WLL_eff (in tonnes) when rigged in a standard Choker Hitch (efficiency factor 0.75×)?',
      hint: 'Multiply the vertical rated WLL by the choker hitch efficiency factor 0.75.',
      targetValue: 2.25,
      unit: 't',
      tolerance: 0.05,
      solutionSteps: [
        'Standard Choker Hitch efficiency factor η_choker = 0.75',
        'WLL_eff = 3.0 t × 0.75 = 2.25 t',
      ],
    },
    {
      id: 'rl-p5',
      prompt:
        'A 1.8 t centrifugal pump skid is lifted symmetrically with a 2-leg bridle at θ = 45° (LF = 1.414). Convert the resulting tension in one sling leg into kilonewtons (kN), using g = 9.81 m/s².',
      hint: 'First find leg tension in tonnes: T_t = (1.8 / 2) × 1.4142, then multiply by 9.81 kN/t.',
      targetValue: 12.49,
      unit: 'kN',
      tolerance: 0.3,
      solutionSteps: [
        'Leg tension in tonnes: T = (1.8 / 2) / sin(45°) = 0.90 × 1.4142 = 1.2728 t',
        'Convert tonnes-force to kN: T_kN = 1.2728 t × 9.81 kN/t = 12.49 kN',
      ],
    },
  ],
  quiz: [
    {
      id: 'rl-q1',
      question:
        'When lifting a load with a symmetric 2-leg bridle sling at a 30° horizontal sling angle, what is the tension in EACH sling leg?',
      options: [
        'Equal to 100% of the total payload weight W (Load Factor = 2.0 on W/2)',
        'Equal to 50% of the total payload weight W',
        'Equal to 70.7% of the total payload weight W',
        'Equal to 200% of the total payload weight W in each leg',
      ],
      correctIndex: 0,
      explanation:
        'Since T = (W / 2) / sin(30°) and sin(30°) = 0.5, each leg experiences T = (W / 2) / 0.5 = W—meaning each individual leg carries a tension equal to the entire weight of the load.',
    },
    {
      id: 'rl-q2',
      question:
        'On an asymmetric machinery skid where the Center of Gravity (CoG) is closer to Lug 1 than Lug 2, where must the crane hook be positioned before hoisting so the load lifts level without swinging?',
      options: [
        'Vertically plumb directly above the Center of Gravity (CoG)',
        'Exactly halfway between Lug 1 and Lug 2 (geometric center)',
        'Directly above Lug 2 (the lighter end)',
        'Hook position does not affect load tilt if both slings have the same WLL',
      ],
      correctIndex: 0,
      explanation:
        'A suspended load always seeks static equilibrium with its Center of Gravity directly beneath the crane hook. If the hook is not plumb over the CoG prior to lift-off, the load will swing and tilt until the CoG aligns vertically under the hook.',
    },
    {
      id: 'rl-q3',
      question:
        'Why does a standard Choker Hitch derate a sling’s Working Load Limit (WLL) to approximately 75% of its vertical rating?',
      options: [
        'The sharp bend and pinching action where the sling passes through its own eye concentrates stress in the outer fibers/strands',
        'Choker hitches always operate at a 30° horizontal angle',
        'Gravity increases by 25% when a load is cylindrical',
        'Only one half of the sling eye is attached to the crane hook',
      ],
      correctIndex: 0,
      explanation:
        'Where the sling body chokes through the eye, tight curvature and localized shearing/pinching prevent uniform load distribution across the wire rope strands or synthetic yarns, reducing capacity to ~75% (and even lower if the choke angle is under 120°).',
    },
    {
      id: 'rl-q4',
      question:
        'According to ASME B30.9 rigging safety standards, what is the minimum permissible horizontal sling angle θ, and what is the recommended minimum angle for routine lifts?',
      options: [
        'Never below 30° (prohibited); 60° or greater is preferred (45° minimum recommended without engineering review)',
        'Never below 10°; 30° is preferred for all lifts',
        'Never below 60°; 85° is required for all lifts',
        'Any angle is permissible as long as a choker hitch is used',
      ],
      correctIndex: 0,
      explanation:
        'Below 30° from horizontal, the 1/sin θ curve rises hyperbolically (LF > 2.0) and small measurement errors cause catastrophic tension spikes and crushing force. 60° (LF = 1.155) is standard practice, and <45° requires caution or a spreader beam.',
    },
    {
      id: 'rl-q5',
      question:
        'On an asymmetric lift rigged with the crane hook directly over the CoG and lifting lugs at the same elevation, which sling leg experiences the higher tension?',
      options: [
        'The shorter, steeper sling leg attached to the lug closest to the CoG',
        'The longer, shallower sling leg attached to the lug farthest from the CoG',
        'Both sling legs always have identical tension when the load is level',
        'Tension depends only on shackle pin diameter, not CoG position',
      ],
      correctIndex: 0,
      explanation:
        'The lug closer to the CoG supports the majority of the vertical load (V1 = W · d2 / (d1 + d2)) AND forms a steeper angle to the hook, resulting in the highest total tension.',
    },
    {
      id: 'rl-q6',
      question:
        'What is the primary mechanical advantage of using an overhead Spreader Beam when hoisting a long, thin-walled heat exchanger bundle?',
      options: [
        'It converts angled sling pulls into vertical pulls at the load lugs, eliminating inward compressive pinch force and reducing the 1/sin θ tension multiplier',
        'It doubles the crane hoist motor horsepower',
        'It allows the crane hook to be positioned away from the Center of Gravity without tilting',
        'It eliminates the need for shackles at the lifting lugs',
      ],
      correctIndex: 0,
      explanation:
        'A spreader beam absorbs the horizontal compressive force in its own rigid strut so the lower slings hang vertically (θ = 90°, LF = 1.0), protecting delicate equipment from buckling and maximizing sling WLL.',
    },
  ],
};
