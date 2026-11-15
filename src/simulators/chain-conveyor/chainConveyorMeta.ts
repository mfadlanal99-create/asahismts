import type { SimulatorMeta } from '../../types/simulator';
import './chainConveyorI18n';

export const chainConveyorMeta: SimulatorMeta = {
  id: 'chain-conveyor',
  title: 'Roller Chain Drive & Conveyor Belt Tracking',
  shortTitle: 'Chain & Conveyor',
  category: 'Machine Elements',
  difficulty: 'Intermediate',
  description:
    'Inspect ANSI roller chain pitch elongation with a 10-pitch vernier wear gauge, tune slack-side catenary sag and lubrication regimes, and correct conveyor belt mistracking using tail pulley take-up screws and training idlers.',
  iconName: 'Cog',
  accentColor: 'amber',
  explore: [
    {
      title: 'ANSI/ISO Roller Chain Pitch & 3% Wear Elongation Limit',
      summary:
        'Standard ANSI B29.1 roller chains are numbered in eighths of an inch of pitch (e.g., #40 = 4/8 in = 12.70 mm, #80 = 8/8 in = 25.40 mm). As pins and bushings articulate under load, abrasive and adhesive wear increases the effective pitch. Once elongation reaches 1.5% on case-hardened/large sprockets (z > 60) or 3.0% on standard industrial drives, the rollers ride high on the sprocket teeth, causing "hooked" teeth and chain jumping.',
      equations: [
        {
          label: 'ANSI Chain Pitch',
          formula: 'p = (Chain Number / 10) × (25.4 / 8)  [mm]',
          note: '#40 = 12.70 mm, #60 = 19.05 mm, #80 = 25.40 mm, #100 = 31.75 mm',
        },
        {
          label: 'Sprocket Pitch Diameter',
          formula: 'D = p / sin(180° / z)',
          note: 'z = number of sprocket teeth; polygonal chordal action increases when z < 17',
        },
        {
          label: 'Polygonal (Chordal) Speed Variation',
          formula: 'Δv / v = (1 − cos(180° / z₁)) × 100%',
          note: 'z₁ = driver sprocket tooth count; < 2% recommended for smooth drives',
        },
        {
          label: 'Wear Elongation Percentage (10-Pitch Gauge)',
          formula: 'ε = ((L_measured − 10·p) / (10·p)) × 100%',
          note: 'Replace chain at ε ≥ 3.0% (standard) or ε ≥ 1.5% (high-speed / large sprocket)',
        },
      ],
      workedExample: {
        title: '10-Pitch Vernier Gauge Inspection on an ANSI #80 Chain',
        given: [
          'Chain size: ANSI #80 (nominal pitch p = 25.40 mm)',
          'Nominal 10-pitch gauge length: L₀ = 10 × 25.40 = 254.0 mm',
          'Measured center-to-center distance across 10 pitches under taut pull: L = 260.6 mm',
        ],
        steps: [
          'Calculate total elongation over 10 pitches: ΔL = 260.6 − 254.0 = 6.6 mm',
          'Compute percentage wear elongation: ε = (6.6 / 254.0) × 100% = 2.60%',
          'Compare against limits: 2.60% exceeds the 1.5% precision/case-hardened limit and approaches the 3.0% maximum replacement limit.',
        ],
        answer:
          'ε = 2.60% (Warning zone — schedule immediate chain replacement before reaching 261.6 mm / 3.0%)',
      },
    },
    {
      title: 'Chain Slack Sag (S ≈ 0.02 C) & Lubrication Regimes',
      summary:
        'Unlike V-belts that require pre-tension, roller chains transmit power positively and must operate with controlled slack-span catenary sag—typically 2% of shaft center distance (S ≈ 0.02 C) for horizontal/inclined drives. Insufficient sag overloads shaft bearings, while excessive sag (> 4% C) causes chain whip and tooth skipping. Linear chain speed determines whether manual/drip lubrication (Type A/B) or an oil bath/slinger disc (Type C) is required.',
      equations: [
        {
          label: 'Target Slack Span Sag',
          formula: 'S_target ≈ 0.02 × C   (Acceptable range: 1% to 3% of C)',
          note: 'C = shaft center-to-center distance (mm); use 0.01 C for vertical drives',
        },
        {
          label: 'Approximate Catenary Excess Length',
          formula: 'ΔL_sag ≈ (8 × S²) / (3 × C)',
          note: 'Relates mid-span catenary sag S to slack span excess chain length',
        },
        {
          label: 'Linear Chain Pitch-Line Velocity',
          formula: 'v = (z₁ × p × N₁) / 60,000  [m/s]',
          note: 'Type A (Manual/Drip): v ≤ 1.5 m/s; Type B (Drip): ≤ 3.5 m/s; Type C (Oil Bath): ≤ 8 m/s',
        },
      ],
      workedExample: {
        title: 'Slack Sag & Lubrication Check for an ANSI #60 Drive',
        given: [
          'ANSI #60 chain (p = 19.05 mm), driver z₁ = 19 teeth at N₁ = 600 RPM',
          'Shaft center distance C = 750 mm',
        ],
        steps: [
          'Target slack sag: S = 0.02 × 750 = 15.0 mm (acceptable range: 7.5 to 22.5 mm)',
          'Linear chain speed: v = (19 × 19.05 × 600) / 60,000 = 3.62 m/s',
          'At v = 3.62 m/s, manual brush or slow drip oiling will fling off or starve pins; select Type C Oil Bath lubrication.',
        ],
        answer: 'Target sag S = 15.0 mm; Chain speed v = 3.62 m/s requires Oil Bath lubrication',
      },
    },
    {
      title: 'Conveyor Belt Tracking Rule & Tail Pulley Take-Up Adjustment',
      summary:
        'A troughing or flat conveyor belt follows two fundamental physical principles: (1) the belt moves toward the end of a roller/idler that it contacts FIRST in the direction of belt travel, and (2) at a tail take-up pulley, the belt migrates toward the side with LOWER tension (shorter center distance). Off-center chute loading pushes the belt toward the lightly loaded side due to lateral material reaction forces.',
      equations: [
        {
          label: 'Tail Take-Up Tension Steering Effect',
          formula: 'Δy_takeup ≈ K_t × (x_left − x_right)',
          note: 'Tightening the LEFT take-up screw (+x_left) stretches the left edge and shifts the belt toward the RIGHT (looser) side — and vice versa, in practice tightening the side the belt wanders TOWARD squares the pulley face so the belt contacts that side first.',
        },
        {
          label: 'Training Idler Skew Steering',
          formula: 'Δy_idler ≈ −K_α × tan(α_skew)',
          note: 'Advancing one end of an idler forward in the direction of travel steers the belt toward that advanced end ("First Contact Rule")',
        },
        {
          label: 'Off-Center Chute Loading Reaction',
          formula: 'Δy_load ≈ −K_L × e_chute',
          note: 'Heavy material dropped off-center (+e_chute to right) pushes the belt toward the opposite side (−y left) on troughing idlers',
        },
      ],
      workedExample: {
        title: 'Correcting Belt Mistracking Near the Tail Pulley',
        given: [
          'Belt wanders +28 mm toward the RIGHT side of the conveyor frame near the tail pulley',
          'Maximum safe lateral clearance before frame rubbing = ±25 mm',
          'Chute feed is centered (e_chute = 0 mm)',
        ],
        steps: [
          'Identify fault: Belt is rubbing the right frame (+28 mm > 25 mm limit).',
          'Apply the First-Contact / Take-Up Rule at the tail pulley: Increase right-side take-up screw extension (or reduce left-side) so the right pulley edge moves slightly backward, causing the returning belt to contact the LEFT side first and steer back to center.',
          'Make small incremental turns (2–3 mm screw travel) and wait 3 full belt revolutions before re-measuring.',
        ],
        answer:
          'Adjust tail take-up screws in 2–3 mm increments to square the tail pulley until lateral wander is within ±5 mm',
      },
    },
  ],
  practice: [
    {
      id: 'cc-prac-1',
      prompt:
        'An ANSI #60 roller chain has a nominal pitch of 19.05 mm. What is the maximum allowable 10-pitch gauge length (in mm) corresponding to the 3.0% standard replacement wear limit?',
      hint: 'Multiply nominal 10-pitch length (10 × 19.05 mm) by 1.03.',
      targetValue: 196.2,
      unit: 'mm',
      tolerance: 0.3,
      solutionSteps: [
        'Nominal 10-pitch length: L₀ = 10 × 19.05 = 190.50 mm',
        'At 3.0% maximum wear elongation: L_max = 190.50 × (1 + 0.03) = 196.215 mm',
        'Rounded to one decimal place: 196.2 mm',
      ],
    },
    {
      id: 'cc-prac-2',
      prompt:
        'A horizontal roller chain drive has a shaft center-to-center distance C = 850 mm. Using the standard 2% rule (S = 0.02 C), what is the target slack-span mid-point sag S (in mm)?',
      hint: 'Calculate S = 0.02 × 850.',
      targetValue: 17,
      unit: 'mm',
      tolerance: 0.5,
      solutionSteps: [
        'Target slack sag rule for horizontal drives: S = 0.02 × C',
        'S = 0.02 × 850 mm = 17.0 mm',
      ],
    },
    {
      id: 'cc-prac-3',
      prompt:
        'An ANSI #80 chain drive (pitch p = 25.40 mm) uses a 17-tooth driver sprocket running at 450 RPM. Calculate the linear chain pitch-line velocity v in m/s.',
      hint: 'Use v = (z₁ × p × N₁) / 60,000.',
      targetValue: 3.24,
      unit: 'm/s',
      tolerance: 0.05,
      solutionSteps: [
        'Formula: v = (z₁ × p × N₁) / 60,000',
        'v = (17 × 25.40 × 450) / 60,000 = 194,310 / 60,000 = 3.2385 m/s',
        'v ≈ 3.24 m/s',
      ],
    },
    {
      id: 'cc-prac-4',
      prompt:
        'Calculate the pitch diameter D (in mm) of a 21-tooth sprocket for an ANSI #40 roller chain (p = 12.70 mm).',
      hint: 'Use D = p / sin(180° / z), where 180° / 21 = 8.5714°.',
      targetValue: 85.2,
      unit: 'mm',
      tolerance: 0.4,
      solutionSteps: [
        'Angle per half-tooth: 180° / 21 = 8.5714°',
        'sin(8.5714°) = 0.14904',
        'Pitch diameter: D = 12.70 / 0.14904 = 85.21 mm',
      ],
    },
    {
      id: 'cc-prac-5',
      prompt:
        'During a 10-pitch vernier gauge inspection on an ANSI #100 chain (p = 31.75 mm, nominal 10p = 317.5 mm), the mechanic measures 323.85 mm. What is the percentage wear elongation (%)?',
      hint: 'Compute ((323.85 − 317.5) / 317.5) × 100.',
      targetValue: 2.0,
      unit: '%',
      tolerance: 0.1,
      solutionSteps: [
        'Elongation ΔL = 323.85 − 317.50 = 6.35 mm',
        'Wear percentage ε = (6.35 / 317.50) × 100% = 2.00%',
      ],
    },
  ],
  quiz: [
    {
      id: 'cc-quiz-1',
      question:
        'What is the nominal pitch of an ANSI #60 standard roller chain?',
      options: [
        '12.70 mm (1/2 in)',
        '15.875 mm (5/8 in)',
        '19.05 mm (3/4 in)',
        '25.40 mm (1.0 in)',
      ],
      correctIndex: 2,
      explanation:
        'In the ANSI numbering system, the left digit(s) indicate pitch in eighths of an inch: #60 = 6/8 in = 3/4 in = 19.05 mm.',
    },
    {
      id: 'cc-quiz-2',
      question:
        'At what percentage of pin-bushing wear elongation must a standard industrial roller chain be replaced before it damages sprocket teeth?',
      options: [
        '0.5% elongation',
        '3.0% elongation (or 1.5% for case-hardened / large sprockets)',
        '6.0% elongation',
        '10.0% elongation',
      ],
      correctIndex: 1,
      explanation:
        'Standard roller chains reach the end of their case-hardened pin/bushing wear layer at 3.0% elongation (1.5% for high-speed drives or sprockets with > 60 teeth). Beyond this, rollers climb the sprocket teeth and cause severe hook wear.',
    },
    {
      id: 'cc-quiz-3',
      question:
        'Why does a small driver sprocket (e.g., fewer than 15 teeth) cause high vibration and noise in a roller chain drive?',
      options: [
        'It reduces the oil viscosity in the sump',
        'Polygonal (chordal) action causes the chain pitch line to rise and fall with each tooth engagement, creating cyclic speed variation',
        'It makes the chain pitch smaller than the driven sprocket pitch',
        'It eliminates catenary sag on the slack side',
      ],
      correctIndex: 1,
      explanation:
        'Because chain links form straight chords around a polygon of z teeth, the effective driving radius fluctuates between R and R·cos(180°/z). Below 17 teeth, chordal speed variation exceeds 1.7% and excites severe vibration.',
    },
    {
      id: 'cc-quiz-4',
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
      id: 'cc-quiz-5',
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
      id: 'cc-quiz-6',
      question:
        'What is the recommended slack-span mid-point sag S for a general horizontal roller chain drive with center distance C?',
      options: [
        'Zero sag (tight like a timing belt)',
        'Approximately 2% of center distance (S ≈ 0.02 C)',
        'Approximately 12% of center distance (S ≈ 0.12 C)',
        'Equal to the driver sprocket diameter',
      ],
      correctIndex: 1,
      explanation:
        'A horizontal roller chain drive requires approximately 2% slack-span sag (S ≈ 0.02 C) to prevent tight-bushed bearing overload while avoiding chain whip and tooth jumping.',
    },
  ],
};
