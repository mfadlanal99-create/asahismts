import type { SimulatorMeta } from '../../types/simulator';
import './beltConveyorI18n';

export const beltConveyorMeta: SimulatorMeta = {
  id: 'belt-conveyor',
  title: 'Belt Conveyor Drive & Tracking',
  shortTitle: 'Belt Conveyor',
  category: 'Machine Elements',
  difficulty: 'Intermediate',
  description:
    'Diagnose and correct belt conveyor mistracking using tail pulley take-up screws, self-aligning training idlers, and centered chute loading while monitoring edge tensions, head pulley RPM, and drive power.',
  iconName: 'Cog',
  accentColor: 'sky',
  explore: [
    {
      title: 'Belt Tracking Rule & Tail Pulley Take-Up Adjustment',
      summary:
        'A troughed or flat conveyor belt obeys two fundamental steering laws: (1) the belt moves toward the end of a roller or pulley it contacts FIRST in the direction of belt travel ("First Contact Rule"), and (2) at a tail screw take-up pulley, unequal screw extensions tilt the pulley axis and create differential edge tension, causing the belt to migrate toward the lower-tension side.',
      equations: [
        {
          label: 'Tail Take-Up Steering Contribution',
          formula: 'Δy_takeup = 1.8 × (x_left − x_right)  [mm]',
          note: 'x_left, x_right = left/right tail take-up screw extension (mm); positive Δy shifts belt RIGHT',
        },
        {
          label: 'Tail Pulley Skew Angle',
          formula: 'θ_tail = 0.12 × (x_left − x_right)  [°]',
          note: 'Small incremental turns (2–3 mm) are made, waiting 3 belt revolutions between checks',
        },
        {
          label: 'Differential Edge Tension',
          formula: 'T_L, T_R = (6.0 + 0.22·x_avg) ± 0.18·(x_left − x_right)  [kN]',
          note: 'Belt migrates toward the lower-tension side when take-up screws are uneven',
        },
      ],
      workedExample: {
        title: 'Correcting Right-Side Frame Rubbing at the Tail Pulley',
        given: [
          'Left take-up screw x_left = 36 mm, Right take-up screw x_right = 18 mm',
          'Chute is centered (e_chute = 0 mm) and training idler is square (0°)',
          'Maximum safe lateral frame clearance = ±25 mm',
        ],
        steps: [
          'Compute take-up differential: Δx = 36 − 18 = +18 mm',
          'Compute lateral belt wander: Δy = 1.8 × (+18) = +32.4 mm (toward RIGHT rail)',
          'Since +32.4 mm > +25 mm safe clearance, the belt is rubbing the right C-channel rail.',
          'Increase x_right (or reduce x_left) until x_left = x_right = 27 mm to square the tail pulley.',
        ],
        answer:
          'Initial wander = +32.4 mm (Right frame rubbing); squaring both screws to 27 mm returns wander to 0.0 mm',
      },
    },
    {
      title: 'Training Idlers, Off-Center Chute Loading & Frame Clearance',
      summary:
        'Self-aligning training idlers pivot on a central bearing to intentionally introduce a controlled skew angle that steers the belt back toward the centerline. Conversely, off-center material loading from a feed chute loads one inclined 3-roll troughing wing more heavily, pushing the belt laterally toward the opposite (lightly loaded) side. Safe lateral clearance is typically ±25 mm before edge fraying and splice damage occur.',
      equations: [
        {
          label: 'Training Idler Skew Steering',
          formula: 'Δy_idler = 5.5 × α_skew  [mm]',
          note: 'α_skew in degrees (±4°); +α steers belt RIGHT, −α steers belt LEFT',
        },
        {
          label: 'Off-Center Chute Loading Reaction',
          formula: 'Δy_chute = −0.45 × e_chute  [mm]',
          note: 'Material dropped off-center to the RIGHT (+e_chute) pushes the belt toward the LEFT (−Δy)',
        },
        {
          label: 'Total Lateral Wander Superposition',
          formula: 'Δy_total = Δy_takeup + Δy_idler + Δy_chute + 14.0 × θ_head',
          note: 'Caution threshold: |Δy| ≥ 12 mm; Frame rubbing alarm: |Δy| ≥ 25 mm',
        },
      ],
      workedExample: {
        title: 'Diagnosing Off-Center Chute Mistracking',
        given: [
          'Take-up screws are square (x_left = x_right = 25 mm) and head pulley skew is 0°',
          'Feed chute deflector is offset +50 mm toward the RIGHT side of the belt',
          'Training idler is set at α_skew = −0.5°',
        ],
        steps: [
          'Chute loading reaction: Δy_chute = −0.45 × (+50) = −22.5 mm (pushes belt LEFT)',
          'Training idler contribution: Δy_idler = 5.5 × (−0.5) = −2.75 mm',
          'Total lateral wander: Δy_total = −22.5 − 2.75 = −25.25 mm (reaches −25 mm left frame rubbing limit)',
        ],
        answer:
          'Δy_total = −25.3 mm (Left frame rubbing); center the chute deflector (e_chute → 0 mm) before adjusting idlers',
      },
    },
    {
      title: 'Head Pulley Drive Speed, Effective Pull & Motor Power',
      summary:
        'At the head end, a diamond-lagged drive drum coupled to a shaft-mounted bevel-helical gearmotor transmits effective tangential pull F_eff to overcome material lift, idler rolling resistance, and skirtboard friction. If a belt mistracks into the structural C-channel frame, parasitic edge rubbing adds extra drag and spikes motor power consumption while damaging belt edges.',
      equations: [
        {
          label: 'Head Drive Pulley Rotational Speed',
          formula: 'N_head = (60 × v) / (π × D_head)  [RPM]',
          note: 'For a standard D_head = 0.32 m (320 mm) lagged head drum and belt speed v in m/s',
        },
        {
          label: 'Drive Motor Shaft Power',
          formula: 'P_drive = (F_eff × v) / η_drive  [kW]',
          note: 'F_eff in kN, v in m/s, gearbox/drive efficiency η_drive = 0.88',
        },
      ],
      workedExample: {
        title: 'Head Pulley RPM & Drive Power at 2.0 m/s',
        given: [
          'Belt speed v = 2.0 m/s, Head drum diameter D_head = 0.32 m',
          'Effective tangential pull F_eff = 4.20 kN, drive efficiency η = 0.88',
        ],
        steps: [
          'Head pulley speed: N_head = (60 × 2.0) / (π × 0.32) = 120 / 1.0053 = 119.4 RPM',
          'Drive power: P_drive = (4.20 × 2.0) / 0.88 = 8.40 / 0.88 = 9.55 kW',
        ],
        answer: 'N_head = 119.4 RPM, P_drive = 9.55 kW',
      },
    },
  ],
  practice: [
    {
      id: 'bc-prac-1',
      prompt:
        'A belt conveyor has left tail take-up screw x_left = 35 mm and right screw x_right = 21 mm, with centered chute and zero idler/head skew. Using Δy = 1.8 × (x_left − x_right), calculate the lateral belt wander (in mm).',
      hint: 'Compute 1.8 × (35 − 21).',
      targetValue: 25.2,
      unit: 'mm',
      tolerance: 0.3,
      solutionSteps: [
        'Take-up differential: Δx = 35 − 21 = 14 mm',
        'Lateral wander: Δy = 1.8 × 14 = +25.2 mm (exceeds +25 mm frame clearance)',
      ],
    },
    {
      id: 'bc-prac-2',
      prompt:
        'An intrinsic head pulley misalignment of −1.1° causes a lateral wander of 14.0 × (−1.1) = −15.4 mm. What training idler skew angle α_skew (in degrees) is required to exactly cancel this drift using Δy_idler = 5.5 × α_skew?',
      hint: 'Solve 5.5 × α_skew = +15.4°.',
      targetValue: 2.8,
      unit: '°',
      tolerance: 0.1,
      solutionSteps: [
        'Set idler steering equal and opposite to head skew drift: 5.5 × α_skew = +15.4 mm',
        'α_skew = 15.4 / 5.5 = +2.8°',
      ],
    },
    {
      id: 'bc-prac-3',
      prompt:
        'Bulk material drops off-center by e_chute = +40 mm toward the right side of a troughed conveyor belt. Using Δy_chute = −0.45 × e_chute, what is the resulting lateral belt shift (in mm)?',
      hint: 'Multiply −0.45 × 40 (include the negative sign for leftward shift).',
      targetValue: -18,
      unit: 'mm',
      tolerance: 0.5,
      solutionSteps: [
        'Δy_chute = −0.45 × (+40 mm) = −18.0 mm',
        'Negative sign indicates the belt is pushed 18.0 mm toward the LEFT rail.',
      ],
    },
    {
      id: 'bc-prac-4',
      prompt:
        'A Ø320 mm (0.32 m) diamond-lagged head drive pulley runs a belt at v = 2.5 m/s. Calculate the head pulley rotational speed (in RPM).',
      hint: 'Use N = (60 × 2.5) / (π × 0.32).',
      targetValue: 149.2,
      unit: 'RPM',
      tolerance: 1.0,
      solutionSteps: [
        'Drum circumference: π × 0.32 = 1.0053 m',
        'N_head = (60 × 2.5) / 1.0053 = 150 / 1.0053 = 149.2 RPM',
      ],
    },
    {
      id: 'bc-prac-5',
      prompt:
        'A belt conveyor operates at v = 2.2 m/s with effective tangential pull F_eff = 4.20 kN and drive efficiency η = 0.88. Calculate the required drive motor power (in kW).',
      hint: 'Use P = (F_eff × v) / η.',
      targetValue: 10.5,
      unit: 'kW',
      tolerance: 0.2,
      solutionSteps: [
        'Belt shaft power: P_belt = 4.20 kN × 2.2 m/s = 9.24 kW',
        'Motor drive power: P_drive = 9.24 / 0.88 = 10.50 kW',
      ],
    },
  ],
  quiz: [
    {
      id: 'bc-quiz-1',
      question:
        'According to the fundamental Conveyor Belt Tracking Rule ("First Contact Rule"), how does a belt respond when one end of a carrying or training idler is skewed slightly forward in the direction of belt travel?',
      options: [
        'The belt steers toward the end of the roller it contacts FIRST',
        'The belt steers toward the end of the roller it contacts LAST',
        'Skewing an idler only changes belt speed, not lateral tracking',
        'The belt stops immediately due to friction',
      ],
      correctIndex: 0,
      explanation:
        'When an idler is skewed at a small angle to the belt centerline, the belt tracks toward the side of the roller that it contacts first in the direction of belt travel.',
    },
    {
      id: 'bc-quiz-2',
      question:
        'If bulk material from a loading chute consistently drops off-center toward the RIGHT side of a troughed conveyor belt, which way will the belt tend to mistrack?',
      options: [
        'It stays centered because troughing idlers are self-balancing',
        'The heavy off-center load pushes the belt toward the LEFT (lightly loaded) side',
        'The belt stretches into a V-belt',
        'The tail pulley automatically compensates',
      ],
      correctIndex: 1,
      explanation:
        'When material loads heavily on the right inclined troughing roll, the downward gravity force on the sloped roll pushes the belt laterally toward the left (lightly loaded) side.',
    },
    {
      id: 'bc-quiz-3',
      question:
        'At a screw-type tail take-up pulley, if the LEFT screw is extended further than the RIGHT screw (x_left > x_right), which side of the belt has lower tension and which way does the belt wander?',
      options: [
        'Left side has lower tension; belt wanders LEFT',
        'Right side has lower tension; belt wanders RIGHT',
        'Both sides have equal tension; belt stays centered',
        'Belt speed doubles on the left side',
      ],
      correctIndex: 1,
      explanation:
        'Extending the left take-up screw further stretches the left belt edge (higher T_L) and tilts the tail pulley so the belt migrates toward the lower-tension RIGHT side.',
    },
    {
      id: 'bc-quiz-4',
      question:
        'Why should a mechanic center an off-center loading chute BEFORE adjusting training idlers or tail take-up screws?',
      options: [
        'Because off-center loading creates a continuous lateral push that would force you to over-skew idlers and cause uneven belt edge wear',
        'Because training idlers only work when the conveyor is stopped',
        'Because chute plates are connected directly to the tail take-up screws',
        'Because off-center loading reverses the direction of the drive motor',
      ],
      correctIndex: 0,
      explanation:
        'Compensating for a crooked chute load by skewing idlers or take-up screws introduces opposing lateral forces that scrub the belt cover and overload edge cords. Always fix the root cause (center the load) first.',
    },
    {
      id: 'bc-quiz-5',
      question:
        'What is the immediate consequence when lateral belt wander exceeds the ±25 mm frame clearance?',
      options: [
        'The belt automatically self-centers against the C-channel rail',
        'The belt edge rubs against the steel frame rail, causing edge fraying, splice damage, and extra parasitic drive power',
        'The head pulley diameter increases',
        'Troughing angle drops to 0°',
      ],
      correctIndex: 1,
      explanation:
        'Frame rubbing rapidly frays the belt carcass edge, exposes fabric/steel plies to moisture, risks splice delamination, and adds frictional drag to the drive motor.',
    },
  ],
};
